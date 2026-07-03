"use client";

import React, { useState } from "react";
import {
  LucideCheckCircle,
  LucideAlertTriangle,
  LucideXCircle,
} from "lucide-react";
import { validateEnvironment } from "@/lib/config/env";

export default function BackendReadinessPage() {
  const [envStatus] = useState<ReturnType<
    typeof validateEnvironment
  >>(() => validateEnvironment());

  if (!envStatus) return null;

  const getStatusIcon = (isReady: boolean) => {
    return isReady ? (
      <LucideCheckCircle className="w-6 h-6 text-green-500 shrink-0" />
    ) : (
      <LucideAlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Backend Readiness Dashboard
        </h1>
        <p className="text-gray-500 mt-2">
          Use this dashboard to track your migration from the local mock
          provider to a real Firebase + PostgreSQL backend.
        </p>
      </div>

      {envStatus.isProduction && envStatus.currentDataMode === "mock" && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
          <div className="flex">
            <LucideXCircle className="h-6 w-6 text-red-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                CRITICAL SAFETY GUARD
              </h3>
              <p className="text-sm text-red-700 mt-1">
                The application is running in PRODUCTION with MOCK data enabled.
                Do not deploy with mock data. Change NEXT_PUBLIC_DATA_MODE to
                "firebase" once configured.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Environment Variables */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            {getStatusIcon(envStatus.isConfigured)}
            <h2 className="text-lg font-semibold">Environment Variables</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Checks if all required Firebase configuration keys are present in
            .env
          </p>
          {!envStatus.isConfigured ? (
            <div>
              <p className="text-sm font-medium text-amber-600 mb-2">
                Missing or default keys:
              </p>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                {envStatus.missingKeys.map((key) => (
                  <li
                    key={key}
                    className="font-mono text-xs bg-gray-50 p-1 rounded inline-block mb-1"
                  >
                    {key}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-green-600 font-medium">
              All required keys are present.
            </p>
          )}
        </div>

        {/* Data Connect Mode */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            {getStatusIcon(envStatus.currentDataMode === "firebase")}
            <h2 className="text-lg font-semibold">Data Connect Mode</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Checks if the application is currently using Firebase Data Connect
            or Mock data.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Current Mode:
            </span>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded ${
                envStatus.currentDataMode === "firebase"
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {envStatus.currentDataMode.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Firebase Storage */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            {getStatusIcon(
              !envStatus.missingKeys.includes(
                "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
              ),
            )}
            <h2 className="text-lg font-semibold">Firebase Storage Bucket</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Required for business logos, cover images, galleries, and
            verification documents.
          </p>
        </div>

        {/* Data Connect SDK */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            {getStatusIcon(false)}
            <h2 className="text-lg font-semibold">
              Data Connect SDK Generated
            </h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Have you run `firebase dataconnect:sdk:generate` to create the
            TypeScript SDK?
          </p>
          <p className="text-xs text-amber-600">Pending manual verification.</p>
        </div>
      </div>
    </div>
  );
}
