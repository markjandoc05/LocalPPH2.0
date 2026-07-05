"use client";

import React, { useState } from "react";
import Papa from "papaparse";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { LucideUpload, LucideCheckCircle, LucideAlertCircle, LucideFileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { useAuth } from "@/lib/auth/AuthContext";

export default function DataImportPage() {
  const { user } = useAuth();
  const [importType, setImportType] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [status, setStatus] = useState<'idle' | 'previewing' | 'importing' | 'done' | 'error'>('idle');
  const [summary, setSummary] = useState<{ created: number, updated: number, skipped: number, errors: number, lastError?: string | null } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setPreview([]);
      setSummary(null);
    }
  };

  const handlePreview = async () => {
    if (!file || !importType) return;
    setStatus('previewing');

    if (file.type === 'application/json') {
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        setPreview(Array.isArray(data) ? data : [data]);
      } catch (e) {
        setStatus('error');
        console.error(e);
      }
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setPreview(results.data);
        },
        error: (error) => {
          setStatus('error');
          console.error(error);
        }
      });
    }
  };

  const handleImport = async () => {
    if (!user) {
      setSummary({
        created: 0,
        updated: 0,
        skipped: 0,
        errors: 1,
        lastError: "No authenticated administrator user found."
      });
      setStatus('error');
      return;
    }

    setStatus('importing');
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/import', {
        method: 'POST',
        body: JSON.stringify({ type: importType, data: preview }),
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (response.ok) {
          const result = await response.json();
          setSummary({
            created: result.summary?.created || 0,
            updated: result.summary?.updated || 0,
            skipped: result.summary?.skipped || 0,
            errors: result.summary?.errors || 0,
            lastError: result.lastError || null
          });
          setStatus('done');
      } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("Import failed:", errorData);
          setSummary({
            created: errorData.summary?.created || 0,
            updated: errorData.summary?.updated || 0,
            skipped: errorData.summary?.skipped || 0,
            errors: errorData.summary?.errors || 1,
            lastError: errorData.lastError || errorData.error || "Unknown error"
          });
          setStatus('error');
      }
    } catch (err: any) {
      console.error("Token / Fetch error:", err);
      setSummary({
        created: 0,
        updated: 0,
        skipped: 0,
        errors: 1,
        lastError: err.message || "Failed to obtain authentication token."
      });
      setStatus('error');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Data Import</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Import Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={importType} onChange={(e) => setImportType(e.target.value)}>
            <option value="">Select Import Type</option>
            <option value="categories">Categories</option>
            <option value="subcategories">Subcategories</option>
            <option value="regions">Regions</option>
            <option value="provinces">Provinces</option>
            <option value="cities">Cities & Municipalities</option>
          </Select>
          <input type="file" onChange={handleFileChange} accept=".csv,.json" />
          <Button onClick={handlePreview} disabled={!file || !importType || status === 'importing'}>
            Preview Data
          </Button>
        </CardContent>
      </Card>

      {status === 'previewing' && preview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview ({preview.length} rows)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                    {Object.keys(preview[0]).map(key => <TableHead key={key}>{key}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.slice(0, 5).map((row, i) => (
                    <TableRow key={i}>
                        {Object.values(row).map((val, j) => <TableCell key={j}>{String(val)}</TableCell>)}
                    </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button onClick={handleImport} className="mt-4" disabled={status === 'importing' as any}>Confirm Import</Button>
          </CardContent>
        </Card>
      )}

      {status === 'done' && summary && (
        <div className="p-4 bg-green-50 text-green-700 rounded flex flex-col gap-2">
          <div className="flex items-center gap-2 font-bold"><LucideCheckCircle /> Import completed!</div>
          <p>Created: {summary.created} | Updated: {summary.updated} | Errors: {summary.errors}</p>
        </div>
      )}
      
      {status === 'error' && (
        <div className="p-4 bg-red-50 text-red-700 rounded flex flex-col gap-2">
          <div className="flex items-center gap-2"><LucideAlertCircle /> An error occurred during processing.</div>
          {summary && summary.lastError && <p className="text-sm">Last error: {summary.lastError}</p>}
        </div>
      )}
    </div>
  );
}
