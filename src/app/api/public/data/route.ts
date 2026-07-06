import { NextRequest, NextResponse } from "next/server";
import { databaseProvider } from "@/lib/data-connect/database-provider";

export async function POST(req: NextRequest) {
  try {
    const { method, variables } = await req.json();

    if (!method || typeof (databaseProvider as any)[method] !== 'function') {
      return NextResponse.json({ error: "Invalid method" }, { status: 400 });
    }

    // Only allow public methods
    const allowedPublicMethods = [
      'getCategories', 'getRegions', 'getProvinces', 'getCities', 'getSubcategories',
      'getSearchSuggestions', 'searchApprovedBusinesses'
    ];

    if (!allowedPublicMethods.includes(method)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const result = await (databaseProvider as any)[method](variables);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Public API Data Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
