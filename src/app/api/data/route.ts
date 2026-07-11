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
    let operationVariables = variables;

    // Get user role
    const userRes = await databaseProvider.getUserById({ id: userId });
    const user = userRes.data.user;
    const role = user?.role;

    if (user?.accountStatus && user.accountStatus !== 'ACTIVE' && method !== 'getUserById') {
      return NextResponse.json({ error: "Account is not allowed to use the platform." }, { status: 403 });
    }

    // Define method permissions
    const isBusinessMethod = ['createBusinessDraft', 'updateBusiness', 'submitBusiness'].includes(method);
    const backupMethods = [
      'createBackupSnapshot',
      'getBackupSnapshots',
      'restoreBackupSnapshot',
      'deleteBackupSnapshot',
      'getBackupSchedule',
      'updateBackupSchedule',
      'runDueBackupSchedule',
    ];
    const isAdminMethod = ['getAllUsers', 'updateUserAccountStatus', 'updateBusinessStatus', 'getAllSupportTickets', 'updateSupportTicket', ...backupMethods].includes(method);

    if (method === 'getUserById') {
      if (variables?.id !== userId && !isAdmin(role)) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    } else if (method === 'createSupportTicket' || method === 'getMySupportTickets') {
      operationVariables = {
        ...(variables || {}),
        userId,
      };
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
      if (['getAllUsers', 'updateUserAccountStatus', ...backupMethods].includes(method) ? !isAdmin(role) : !canApproveBusiness(role)) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    if (!method || typeof (databaseProvider as any)[method] !== 'function') {
      return NextResponse.json({ error: "Invalid method" }, { status: 400 });
    }

    if (method === 'updateSupportTicket') {
      operationVariables = {
        ...(variables || {}),
        respondedById: userId,
      };
    }

    if (method === 'createBackupSnapshot' || method === 'runDueBackupSchedule') {
      operationVariables = {
        ...(variables || {}),
        createdById: userId,
      };
    }

    if (method === 'restoreBackupSnapshot') {
      operationVariables = {
        ...(variables || {}),
        restoredById: userId,
      };
    }

    if (method === 'updateBackupSchedule') {
      operationVariables = {
        ...(variables || {}),
        updatedById: userId,
      };
    }

    const result = await (databaseProvider as any)[method](operationVariables);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API Data Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
