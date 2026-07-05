import { NextRequest, NextResponse } from "next/server";
import { databaseProvider } from "@/lib/data-connect/database-provider";
import { adminAuth } from "@/lib/firebase-admin";
import { canManageBusiness, canApproveBusiness, isAdmin } from "@/lib/auth/roles";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // 2. Authorize
    const { method, variables } = await req.json();

    // Get user role
    const userRes = await databaseProvider.getUserById({ id: userId });
    const user = userRes.data.user;
    const role = user?.role;

    // Define method permissions
    const isBusinessMethod = ['createBusinessDraft', 'updateBusiness', 'submitBusiness'].includes(method);
    const isAdminMethod = ['getAllUsers', 'updateBusinessStatus'].includes(method);

    if (method === 'getUserById') {
      if (variables?.id !== userId && !isAdmin(role)) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    } else if (isBusinessMethod) {
      if (!canManageBusiness(role)) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
      // If updating, check ownership
      if (method === 'updateBusiness' || method === 'submitBusiness') {
        const business = await databaseProvider.getBusinessById({ id: variables.id });
        if (business.data.business?.ownerId !== userId && !isAdmin(role)) {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }
      }
    } else if (isAdminMethod) {
      if (method === 'getAllUsers' ? !isAdmin(role) : !canApproveBusiness(role)) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    if (!method || typeof (databaseProvider as any)[method] !== 'function') {
      return NextResponse.json({ error: "Invalid method" }, { status: 400 });
    }

    const result = await (databaseProvider as any)[method](variables);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API Data Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
