"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, AlertTriangle, Shield, Clock } from "lucide-react";
import { ChartCard } from "@/components/admin/chart-card";
import { CallVolumeChart } from "@/components/admin/charts/call-volume-chart";
import { CaseTypeDonut } from "@/components/admin/charts/case-type-donut";
import { UrgencyChart } from "@/components/admin/charts/urgency-chart";
import { LeadQualityChart } from "@/components/admin/charts/lead-quality-chart";

interface CallRecord {
  id: number;
  caller_name: string | null;
  caller_phone: string | null;
  is_spam: string | null;
  reason_for_call: string | null;
  case_type: string | null;
  urgency: string | null;
  called_at: string;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export default function AdminDashboard() {
  const [todayStats, setTodayStats] = useState({ total: 0, urgent: 0, spam: 0, genuine: 0 });
  const [recentCalls, setRecentCalls] = useState<CallRecord[]>([]);
  const [chartData, setChartData] = useState<{
    dailyVolume: { date: string; calls: number; genuine: number; spam: number; urgent: number }[];
    caseTypeDistribution: { case_type: string; count: number }[];
    urgencyBreakdown: { urgency: string; count: number }[];
    qualificationBreakdown: { score: string; count: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = getToken();
      if (!token) return;

      try {
        const today = new Date().toISOString().split("T")[0];

        // Single aggregated fetch for all stats + charts
        const [statsRes, callsRes] = await Promise.all([
          fetch(`/api/admin/stats?days=7`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`/api/admin/calls?date=${today}&limit=5`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const statsData = await statsRes.json();
        const callsData = await callsRes.json();

        setTodayStats(statsData.todayStats);
        setRecentCalls(callsData.calls || []);
        setChartData({
          dailyVolume: statsData.dailyVolume,
          caseTypeDistribution: statsData.caseTypeDistribution,
          urgencyBreakdown: statsData.urgencyBreakdown,
          qualificationBreakdown: statsData.qualificationBreakdown,
        });
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const urgencyColor = (u: string | null) => {
    if (u === "URGENT") return "text-red-600 font-bold";
    if (u === "HIGH") return "text-orange-500 font-semibold";
    return "text-[var(--color-muted-foreground)]";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Dashboard</h1>
        <span className="text-sm text-[var(--color-muted-foreground)]">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <div className="flex items-center gap-2 text-[var(--color-muted-foreground)]">
            <Phone size={16} />
            <span className="text-sm">Today&apos;s Calls</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-[var(--color-foreground)]">{todayStats.total}</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={16} />
            <span className="text-sm">Urgent</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-red-600">{todayStats.urgent}</p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <div className="flex items-center gap-2 text-[var(--color-muted-foreground)]">
            <Shield size={16} />
            <span className="text-sm">Spam Filtered</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-[var(--color-foreground)]">{todayStats.spam}</p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <div className="flex items-center gap-2 text-[var(--color-muted-foreground)]">
            <Clock size={16} />
            <span className="text-sm">New Enquiries</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-[var(--color-foreground)]">{todayStats.genuine}</p>
        </div>
      </div>

      {/* Charts Grid */}
      {!loading && chartData && (
        <>
          <ChartCard title="Call Volume" subtitle="Last 7 days" delay={0.1}>
            <CallVolumeChart data={chartData.dailyVolume} />
          </ChartCard>

          <div className="grid grid-cols-2 gap-4">
            <ChartCard title="Case Types" subtitle="Distribution" delay={0.2}>
              <CaseTypeDonut data={chartData.caseTypeDistribution} />
            </ChartCard>
            <ChartCard title="Urgency Levels" subtitle="All calls" delay={0.3}>
              <UrgencyChart data={chartData.urgencyBreakdown} />
            </ChartCard>
          </div>

          <ChartCard title="Lead Quality" subtitle="Qualification scores" delay={0.4}>
            <LeadQualityChart data={chartData.qualificationBreakdown} />
          </ChartCard>
        </>
      )}

      {/* Recent Calls */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="border-b border-[var(--color-border)] p-4">
          <h2 className="font-semibold text-[var(--color-foreground)]">Recent Calls</h2>
        </div>
        {loading ? (
          <p className="p-4 text-sm text-[var(--color-muted-foreground)]">Loading...</p>
        ) : recentCalls.length === 0 ? (
          <p className="p-4 text-sm text-[var(--color-muted-foreground)]">No calls today</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-muted-foreground)]">
                <th className="px-4 py-2">Caller</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Case Type</th>
                <th className="px-4 py-2">Urgency</th>
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {recentCalls.map((call) => (
                <tr key={call.id} className="border-b border-[var(--color-border)]">
                  <td className="px-4 py-2 text-[var(--color-foreground)]">{call.caller_name || "Unknown"}</td>
                  <td className="px-4 py-2 text-[var(--color-muted-foreground)]">{call.caller_phone || "N/A"}</td>
                  <td className="px-4 py-2 text-[var(--color-muted-foreground)]">{call.case_type || "N/A"}</td>
                  <td className={`px-4 py-2 ${urgencyColor(call.urgency)}`}>{call.urgency || "N/A"}</td>
                  <td className="px-4 py-2 text-[var(--color-muted-foreground)]">
                    {new Date(call.called_at).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-2">
                    <Link href={`/admin/calls/${call.id}`} className="text-[var(--color-primary)] text-xs hover:underline">
                      View
                    </Link>
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
