"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/lib/auth/AuthContext";
import { canAccessAdmin, isAdmin } from "@/lib/auth/roles";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { formatAppDateTime } from "@/lib/time";
import {
  createBackupSnapshot,
  deleteBackupSnapshot,
  getBackupSchedule,
  getBackupSnapshots,
  restoreBackupSnapshot,
  runDueBackupSchedule,
  updateBackupSchedule,
} from "@/lib/data-connect/admin-service";
import {
  LucideArchiveRestore,
  LucideClock,
  LucideDatabaseBackup,
  LucideRefreshCcw,
  LucideRotateCcw,
  LucideTrash2,
} from "lucide-react";

const backupOptions = [
  { value: "ALL", label: "All data", description: "Everything included in the recovery scope." },
  { value: "USERS", label: "Users", description: "Accounts, profile details, roles, and account status." },
  { value: "BUSINESSES", label: "Business listings", description: "Listings, media references, and profile analytics." },
  { value: "DIRECTORY", label: "Directory data", description: "Categories, regions, provinces, cities, and barangays." },
  { value: "SUPPORT", label: "Support tickets", description: "User support requests and administrator responses." },
  { value: "SETTINGS", label: "Site settings", description: "Stored platform configuration values." },
];

const normalizeScope = (scope: string[]) => scope.includes("ALL") ? ["ALL"] : scope;
const isBackupSetupError = (message: string) => message.toLowerCase().includes("backup setup is not complete");
const defaultBackupSchedule = {
  enabled: false,
  frequency: "WEEKLY",
  scope: ["ALL"],
  timeOfDay: "02:00",
  lastRunAt: null,
  nextRunAt: null,
};

export default function AdminBackupPage() {
  const { user, role, loading } = useAuth();
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any | null>(null);
  const [manualScope, setManualScope] = useState<string[]>(["ALL"]);
  const [manualLabel, setManualLabel] = useState("");
  const [scheduleScope, setScheduleScope] = useState<string[]>(["ALL"]);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [frequency, setFrequency] = useState("WEEKLY");
  const [timeOfDay, setTimeOfDay] = useState("02:00");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [backupSetupRequired, setBackupSetupRequired] = useState(false);

  const canUsePage = canAccessAdmin(role) && isAdmin(role);

  const loadData = useCallback(async () => {
    if (!canUsePage) return;
    setIsLoading(true);
    setError("");
    setBackupSetupRequired(false);
    try {
      await runDueBackupSchedule(user?.uid);
      const [history, scheduleData] = await Promise.all([
        getBackupSnapshots(),
        getBackupSchedule(),
      ]);
      setSnapshots(history);
      setSchedule(scheduleData);
      setScheduleEnabled(Boolean(scheduleData.enabled));
      setFrequency(scheduleData.frequency || "WEEKLY");
      setScheduleScope(scheduleData.scope?.length ? scheduleData.scope : ["ALL"]);
      setTimeOfDay(scheduleData.timeOfDay || "02:00");
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to load backup recovery data.";
      if (isBackupSetupError(errorMessage)) {
        setBackupSetupRequired(true);
        setSnapshots([]);
        setSchedule(defaultBackupSchedule);
        setScheduleEnabled(false);
        setFrequency(defaultBackupSchedule.frequency);
        setScheduleScope(defaultBackupSchedule.scope);
        setTimeOfDay(defaultBackupSchedule.timeOfDay);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [canUsePage, user]);

  useEffect(() => {
    if (!loading && user && canUsePage) {
      const timer = window.setTimeout(() => {
        void loadData();
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [loading, user, canUsePage, loadData]);

  const selectedManualLabels = useMemo(() => (
    normalizeScope(manualScope).map((scope) => backupOptions.find((option) => option.value === scope)?.label || scope).join(", ")
  ), [manualScope]);

  const toggleScope = (value: string, mode: "manual" | "schedule") => {
    const setter = mode === "manual" ? setManualScope : setScheduleScope;
    const current = mode === "manual" ? manualScope : scheduleScope;

    if (value === "ALL") {
      setter(["ALL"]);
      return;
    }

    const withoutAll = current.filter((item) => item !== "ALL");
    const next = withoutAll.includes(value)
      ? withoutAll.filter((item) => item !== value)
      : [...withoutAll, value];
    setter(next.length ? next : ["ALL"]);
  };

  const handleManualBackup = async () => {
    if (backupSetupRequired) {
      setMessage("");
      setError("Backup storage is not ready yet. Apply drizzle/0003_backup_recovery.sql before creating backups.");
      return;
    }
    setActionLoading("backup");
    setMessage("");
    setError("");
    try {
      await createBackupSnapshot({
        label: manualLabel,
        scope: normalizeScope(manualScope),
        backupType: "MANUAL",
        createdById: user?.uid,
      });
      setManualLabel("");
      setMessage(`Backup created for ${selectedManualLabels}.`);
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Failed to create backup.");
    } finally {
      setActionLoading("");
    }
  };

  const handleSaveSchedule = async () => {
    if (backupSetupRequired) {
      setMessage("");
      setError("Backup storage is not ready yet. Apply drizzle/0003_backup_recovery.sql before saving a schedule.");
      return;
    }
    setActionLoading("schedule");
    setMessage("");
    setError("");
    try {
      const updated = await updateBackupSchedule({
        enabled: scheduleEnabled,
        frequency,
        scope: normalizeScope(scheduleScope),
        timeOfDay,
        updatedById: user?.uid,
      });
      setSchedule(updated);
      setMessage("Backup schedule saved.");
    } catch (err: any) {
      setError(err?.message || "Failed to update backup schedule.");
    } finally {
      setActionLoading("");
    }
  };

  const handleRestore = async (snapshot: any) => {
    if (backupSetupRequired) return;
    const confirmed = window.confirm(`Restore backup ${snapshot.id}? Existing matching records will be updated or recreated from this backup.`);
    if (!confirmed) return;

    setActionLoading(`restore-${snapshot.id}`);
    setMessage("");
    setError("");
    try {
      const result = await restoreBackupSnapshot({ id: snapshot.id, restoredById: user?.uid });
      setMessage(`Restore completed. ${result.restoredCount} records were restored.`);
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Failed to restore backup.");
    } finally {
      setActionLoading("");
    }
  };

  const handleDelete = async (snapshot: any) => {
    if (backupSetupRequired) return;
    const confirmed = window.confirm(`Delete backup ${snapshot.id}? This removes the backup file from history and cannot be undone.`);
    if (!confirmed) return;

    setActionLoading(`delete-${snapshot.id}`);
    setMessage("");
    setError("");
    try {
      await deleteBackupSnapshot(snapshot.id);
      setMessage("Backup deleted.");
      await loadData();
    } catch (err: any) {
      setError(err?.message || "Failed to delete backup.");
    } finally {
      setActionLoading("");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (!user || !canUsePage) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Backup & Restore</h1>
          <p className="mt-1 text-sm text-slate-600">Create recovery points, manage backup history, and configure scheduled backups.</p>
        </div>

        {message && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{message}</div>}
        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
        {backupSetupRequired && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Backup storage is not installed yet. Apply the backup recovery migration, drizzle/0003_backup_recovery.sql, before creating, scheduling, restoring, or deleting backups.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LucideDatabaseBackup className="h-5 w-5 text-blue-600" />
                Manual Backup
              </CardTitle>
              <CardDescription>Select what data should be captured in this recovery point.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={manualLabel}
                onChange={(event) => setManualLabel(event.target.value)}
                placeholder="Optional backup label"
              />

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {backupOptions.map((option) => (
                  <label key={option.value} className={`rounded-lg border p-3 transition-colors ${manualScope.includes(option.value) ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white"}`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={manualScope.includes(option.value)}
                        onChange={() => toggleScope(option.value, "manual")}
                      />
                      <span className="text-sm font-bold text-slate-900">{option.label}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">{option.description}</p>
                  </label>
                ))}
              </div>

              <Button onClick={handleManualBackup} isLoading={actionLoading === "backup"} disabled={backupSetupRequired} className="w-full">
                Create Backup
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LucideClock className="h-5 w-5 text-blue-600" />
                Backup Schedule
              </CardTitle>
              <CardDescription>Save an automatic backup preference. Due backups run when the admin backup tool is opened or checked.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                <span className="text-sm font-bold text-slate-900">Automatic backups</span>
                <input
                  type="checkbox"
                  checked={scheduleEnabled}
                  onChange={(event) => setScheduleEnabled(event.target.checked)}
                />
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-xs font-semibold text-slate-700">Frequency</span>
                  <Select value={frequency} onChange={(event) => setFrequency(event.target.value)}>
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </Select>
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold text-slate-700">Run time</span>
                  <Input type="time" value={timeOfDay} onChange={(event) => setTimeOfDay(event.target.value)} />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {backupOptions.map((option) => (
                  <label key={option.value} className={`rounded-lg border p-3 transition-colors ${scheduleScope.includes(option.value) ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white"}`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={scheduleScope.includes(option.value)}
                        onChange={() => toggleScope(option.value, "schedule")}
                      />
                      <span className="text-sm font-bold text-slate-900">{option.label}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                <p><strong>Last run:</strong> {formatAppDateTime(schedule?.lastRunAt)}</p>
                <p className="mt-1"><strong>Next run:</strong> {formatAppDateTime(schedule?.nextRunAt)}</p>
              </div>

              <Button onClick={handleSaveSchedule} isLoading={actionLoading === "schedule"} disabled={backupSetupRequired} className="w-full">
                Save Schedule
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <LucideArchiveRestore className="h-5 w-5 text-blue-600" />
                Backup History
              </CardTitle>
              <CardDescription>ID, date, record count, status, and recovery actions.</CardDescription>
            </div>
            <Button variant="outline" onClick={loadData} disabled={isLoading}>
              <LucideRefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-10 text-center text-sm text-slate-500">Loading backup history...</div>
            ) : snapshots.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
                No backups found yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID / Date</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Records</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {snapshots.map((snapshot) => (
                      <TableRow key={snapshot.id} className="hover:bg-blue-50/40">
                        <TableCell>
                          <div className="font-mono text-xs text-slate-900">{snapshot.id}</div>
                          <div className="mt-1 text-xs text-slate-600">{formatAppDateTime(snapshot.createdAt)}</div>
                          {snapshot.label && <div className="mt-1 text-xs font-semibold text-blue-700">{snapshot.label}</div>}
                        </TableCell>
                        <TableCell className="text-sm text-slate-700">{snapshot.backupType}</TableCell>
                        <TableCell className="text-sm font-semibold text-slate-900">{snapshot.recordCount}</TableCell>
                        <TableCell>
                          <Badge variant={snapshot.status === "COMPLETED" ? "success" : snapshot.status === "RESTORED" ? "info" : "danger"}>
                            {snapshot.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="min-w-40 text-xs text-slate-700">
                          {(snapshot.scope || []).join(", ")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestore(snapshot)}
                              isLoading={actionLoading === `restore-${snapshot.id}`}
                            >
                              <LucideRotateCcw className="mr-1 h-3.5 w-3.5" />
                              Restore
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(snapshot)}
                              isLoading={actionLoading === `delete-${snapshot.id}`}
                              className="text-red-700 hover:text-red-800"
                            >
                              <LucideTrash2 className="mr-1 h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
