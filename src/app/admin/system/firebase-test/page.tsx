"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { canAccessAdmin } from "@/lib/auth/roles";
import AdminLayout from "@/components/admin/AdminLayout";
import { firebaseProvider } from "@/lib/data-connect/firebase-provider";
import {
  LucidePlay,
  LucideCheckCircle,
  LucideAlertTriangle,
  LucideXCircle,
  LucideDatabase,
  LucideAlertOctagon,
  LucideInfo,
} from "lucide-react";

interface TestResult {
  status: "IDLE" | "RUNNING" | "SUCCESS" | "ERROR";
  response?: any;
  error?: string;
}

export default function FirebaseTestPage() {
  const { user, role, loading } = useAuth();
  const [results, setResults] = useState<Record<string, TestResult>>({});

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user || !canAccessAdmin(role)) return null;

  const updateResult = (id: string, result: Partial<TestResult>) => {
    setResults((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || { status: "IDLE" }), ...result },
    }));
  };

  const handleTest = async (
    id: string,
    testFn: () => Promise<any>,
    isMutation: boolean = false,
  ) => {
    if (isMutation) {
      if (
        !window.confirm(
          `This is a mutation test that will modify the database. Are you sure you want to run '${id}'?`,
        )
      ) {
        return;
      }
    }

    updateResult(id, {
      status: "RUNNING",
      error: undefined,
      response: undefined,
    });

    try {
      const response = await testFn();
      updateResult(id, { status: "SUCCESS", response });
    } catch (err: any) {
      console.error(`Test ${id} failed:`, err);
      updateResult(id, {
        status: "ERROR",
        error: err.message || "Unknown error occurred",
      });
    }
  };

  const tests = [
    {
      id: "getAllUsers",
      name: "Get All Users",
      description: "Fetches all users from Firebase Data Connect.",
      isMutation: false,
      fn: () => firebaseProvider.getAllUsers(),
    },
    {
      id: "getAllBusinesses",
      name: "Get All Businesses",
      description: "Fetches all business listings.",
      isMutation: false,
      fn: () => firebaseProvider.getAllBusinesses(),
    },
    {
      id: "getAdminDashboardStats",
      name: "Get Admin Dashboard Stats",
      description: "Calculates platform statistics using Firebase provider.",
      isMutation: false,
      fn: async () => {
        const [biz, users] = await Promise.all([
          firebaseProvider.getAllBusinesses(),
          firebaseProvider.getAllUsers(),
        ]);
        const allBiz = biz.data.businesses || [];
        const allUsers = users.data.users || [];

        return {
          totalListings: allBiz.length,
          pendingApprovals: allBiz.filter((b) => b.status === "PENDING").length,
          totalUsers: allUsers.length,
          recentActivity: 0, // Mock stat
        };
      },
    },
    {
      id: "searchApprovedBusinesses",
      name: "Search Approved Businesses",
      description: "Fetches approved businesses.",
      isMutation: false,
      fn: () => firebaseProvider.searchApprovedBusinesses({}),
    },
    {
      id: "getFeaturedApprovedBusinesses",
      name: "Get Featured Businesses",
      description: "Fetches featured and approved businesses.",
      isMutation: false,
      fn: () => firebaseProvider.getFeaturedApprovedBusinesses(),
    },
    {
      id: "getRecentlyApprovedBusinesses",
      name: "Get Recently Approved",
      description: "Fetches recently approved businesses.",
      isMutation: false,
      fn: () => firebaseProvider.getRecentlyApprovedBusinesses(),
    },
    {
      id: "getMyBusinesses",
      name: "Get My Businesses",
      description: "Fetches businesses owned by the current admin user.",
      isMutation: false,
      fn: () => firebaseProvider.getMyBusinesses({ ownerId: user.uid }),
    },
    {
      id: "createBusinessDraft",
      name: "Create Business Draft",
      description: "Creates a dummy business listing draft.",
      isMutation: true,
      fn: () => {
        const fakeId = crypto.randomUUID();
        return firebaseProvider.createBusinessDraft({
          id: fakeId,
          ownerId: user.uid,
          name: "Firebase Test Business",
          slug: `test-business-${Date.now()}`,
          description:
            "This is a test business created via the Firebase test page.",
          status: "DRAFT",
        });
      },
    },
    {
      id: "submitBusiness",
      name: "Submit Business",
      description: "Requires a valid business ID to submit.",
      isMutation: true,
      fn: async () => {
        // Just testing if the mutation call works, we might get a not found error if we use a fake ID.
        // Let's create one first to submit.
        const fakeId = crypto.randomUUID();
        await firebaseProvider.createBusinessDraft({
          id: fakeId,
          ownerId: user.uid,
          name: "Firebase Test Business (Submit)",
          slug: `test-business-submit-${Date.now()}`,
          status: "DRAFT",
        });
        return firebaseProvider.submitBusiness({ id: fakeId });
      },
    },
    {
      id: "approveBusiness",
      name: "Approve Business",
      description: "Requires a valid business ID to approve.",
      isMutation: true,
      fn: async () => {
        const fakeId = crypto.randomUUID();
        await firebaseProvider.createBusinessDraft({
          id: fakeId,
          ownerId: user.uid,
          name: "Firebase Test Business (Approve)",
          slug: `test-business-approve-${Date.now()}`,
          status: "PENDING",
        });
        return firebaseProvider.updateBusinessStatus({
          id: fakeId,
          status: "APPROVED",
        });
      },
    },
    {
      id: "rejectBusiness",
      name: "Reject Business",
      description: "Requires a valid business ID to reject.",
      isMutation: true,
      fn: async () => {
        const fakeId = crypto.randomUUID();
        await firebaseProvider.createBusinessDraft({
          id: fakeId,
          ownerId: user.uid,
          name: "Firebase Test Business (Reject)",
          slug: `test-business-reject-${Date.now()}`,
          status: "PENDING",
        });
        return firebaseProvider.updateBusinessStatus({
          id: fakeId,
          status: "REJECTED",
        });
      },
    },
  ];

  const getStatusBadge = (status: TestResult["status"] | undefined) => {
    switch (status) {
      case "RUNNING":
        return (
          <span className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-semibold">
            <LucidePlay className="w-3 h-3 mr-1 animate-pulse" /> Running
          </span>
        );
      case "SUCCESS":
        return (
          <span className="flex items-center text-green-700 bg-green-50 px-2 py-1 rounded text-xs font-semibold">
            <LucideCheckCircle className="w-3 h-3 mr-1" /> Success
          </span>
        );
      case "ERROR":
        return (
          <span className="flex items-center text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-semibold">
            <LucideXCircle className="w-3 h-3 mr-1" /> Failed
          </span>
        );
      default:
        return (
          <span className="flex items-center text-gray-500 bg-gray-100 px-2 py-1 rounded text-xs font-semibold">
            Not Tested
          </span>
        );
    }
  };

  const hasEmptyResults = Object.values(results).some(
    (r) =>
      r.status === "SUCCESS" &&
      r.response?.data &&
      ((Array.isArray(r.response.data.users) &&
        r.response.data.users.length === 0) ||
        (Array.isArray(r.response.data.businesses) &&
          r.response.data.businesses.length === 0)),
  );

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0C0C1C] flex items-center gap-2">
            <LucideDatabase className="w-6 h-6 text-blue-600" />
            Firebase Provider Tests
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Safely test real Firebase Data Connect provider functions
            independently of NEXT_PUBLIC_DATA_MODE.
          </p>
        </div>
      </div>

      {hasEmptyResults && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <LucideInfo className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Seed Data Required</h3>
            <p className="text-sm text-blue-800 mt-1">
              Firebase is connected, but no records were found. Add seed data or
              create test listings to see populated responses.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {tests.map((test) => {
          const result = results[test.id];
          return (
            <div
              key={test.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {test.name}
                    </h3>
                    {test.isMutation && (
                      <span className="flex items-center text-xs font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                        <LucideAlertOctagon className="w-3 h-3 mr-1" />
                        Mutation
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{test.description}</p>
                </div>

                <div className="flex items-center gap-4">
                  {getStatusBadge(result?.status)}
                  <button
                    onClick={() =>
                      handleTest(test.id, test.fn, test.isMutation)
                    }
                    disabled={result?.status === "RUNNING"}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      test.isMutation
                        ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    } disabled:opacity-50`}
                  >
                    <LucidePlay className="w-4 h-4" />
                    Run Test
                  </button>
                </div>
              </div>

              {result &&
                result.status !== "IDLE" &&
                result.status !== "RUNNING" && (
                  <div
                    className={`p-4 border-t border-gray-100 bg-gray-50 overflow-auto max-h-96 text-xs font-mono ${
                      result.status === "ERROR"
                        ? "text-red-600"
                        : "text-gray-800"
                    }`}
                  >
                    {result.status === "SUCCESS" && (
                      <pre>{JSON.stringify(result.response, null, 2)}</pre>
                    )}
                    {result.status === "ERROR" && (
                      <div className="flex items-start gap-2 text-red-600">
                        <LucideAlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{result.error}</span>
                      </div>
                    )}
                  </div>
                )}
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
