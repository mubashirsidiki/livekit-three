"use client";

import { useEffect, useState } from "react";
import { FileText, Calendar, Download } from "lucide-react";
import { ChartCard } from "@/components/admin/chart-card";
import { EnquiriesChart } from "@/components/admin/charts/enquiries-chart";
import { ConversionChart } from "@/components/admin/charts/conversion-chart";

interface ReportEntry {
  id: number;
  report_type: string;
  period_start: string;
  period_end: string;
  sent_at: string;
  content_summary: string;
}

interface MonthlyReport {
  enquiriesByDept: { case_type: string; count: number }[];
  conversionsByDept: { case_type: string; total: number; high_qual: number }[];
  summary: { total_calls: number; genuine_calls: number; urgent_calls: number; callbacks_needed: number };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportEntry[]>([]);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/reports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReports(data.reports || []);
      setLoading(false);
    }
    load();
  }, []);

  const downloadCSV = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/admin/export", { headers: { Authorization: `Bearer ${token}` } });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `call-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateMonthlyReport = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ type: "monthly" }),
      });
      const data = await res.json();
      if (res.ok) {
        setMonthlyReport(data.report);
        const listRes = await fetch("/api/admin/reports", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const listData = await listRes.json();
        setReports(listData.reports || []);
      }
    } catch (err) {
      console.error("Failed to generate report:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Reports</h1>
        <div className="flex gap-2">
          <button
            onClick={generateMonthlyReport}
            disabled={generating}
            className="flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            <Calendar size={16} />
            {generating ? "Generating..." : "Generate Monthly Report"}
          </button>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-accent)]"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Monthly Report Results */}
      {monthlyReport && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
              <p className="text-xs text-[var(--color-muted-foreground)]">Total Calls</p>
              <p className="text-2xl font-bold text-[var(--color-foreground)]">{monthlyReport.summary.total_calls || 0}</p>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
              <p className="text-xs text-[var(--color-muted-foreground)]">Genuine Calls</p>
              <p className="text-2xl font-bold text-[var(--color-foreground)]">{monthlyReport.summary.genuine_calls || 0}</p>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
              <p className="text-xs text-[var(--color-muted-foreground)]">Urgent Calls</p>
              <p className="text-2xl font-bold text-red-600">{monthlyReport.summary.urgent_calls || 0}</p>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
              <p className="text-xs text-[var(--color-muted-foreground)]">Callbacks Needed</p>
              <p className="text-2xl font-bold text-[var(--color-foreground)]">{monthlyReport.summary.callbacks_needed || 0}</p>
            </div>
          </div>

          {/* Charts */}
          <ChartCard title="New Enquiries by Department" delay={0.1}>
            <EnquiriesChart data={monthlyReport.enquiriesByDept || []} />
          </ChartCard>

          <ChartCard title="Conversion Rates by Department" subtitle="Total leads vs high quality" delay={0.2}>
            <ConversionChart data={monthlyReport.conversionsByDept || []} />
          </ChartCard>
        </div>
      )}

      {/* Report History */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="border-b border-[var(--color-border)] p-4">
          <h2 className="font-semibold text-[var(--color-foreground)]">Report History</h2>
        </div>
        {loading ? (
          <p className="p-4 text-sm text-[var(--color-muted-foreground)]">Loading...</p>
        ) : reports.length === 0 ? (
          <p className="p-4 text-sm text-[var(--color-muted-foreground)]">No reports generated yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-muted-foreground)]">
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Period</th>
                <th className="px-4 py-2">Generated</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-[var(--color-border)]">
                  <td className="px-4 py-2">
                    <span className="flex items-center gap-1 text-[var(--color-foreground)]">
                      <FileText size={14} /> {r.report_type}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-[var(--color-muted-foreground)]">
                    {r.period_start} to {r.period_end}
                  </td>
                  <td className="px-4 py-2 text-[var(--color-muted-foreground)]">
                    {new Date(r.sent_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
