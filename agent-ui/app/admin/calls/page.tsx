"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface CallRecord {
  id: number;
  caller_name: string | null;
  caller_phone: string | null;
  is_spam: string | null;
  reason_for_call: string | null;
  case_type: string | null;
  urgency: string | null;
  called_at: string;
  duration_seconds: number | null;
}

export default function CallsPage() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [urgencyFilter, setUrgencyFilter] = useState("");
  const [caseTypeFilter, setCaseTypeFilter] = useState("");
  const limit = 20;

  useEffect(() => {
    async function load() {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (urgencyFilter) params.set("urgency", urgencyFilter);
      if (caseTypeFilter) params.set("case_type", caseTypeFilter);

      const res = await fetch(`/api/admin/calls?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCalls(data.calls || []);
      setTotal(data.total || 0);
      setLoading(false);
    }
    load();
  }, [page, urgencyFilter, caseTypeFilter]);

  const totalPages = Math.ceil(total / limit);

  const urgencyBadge = (u: string | null) => {
    if (!u) return <span className="text-[var(--color-muted-foreground)]">N/A</span>;
    const colors: Record<string, string> = {
      URGENT: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
      HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
      MEDIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
      LOW: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    };
    return (
      <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${colors[u] || ""}`}>
        {u}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-[var(--color-foreground)]">Call Records</h1>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={urgencyFilter}
          onChange={(e) => { setUrgencyFilter(e.target.value); setPage(1); }}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1.5 text-sm text-[var(--color-foreground)]"
        >
          <option value="">All Urgency</option>
          <option value="URGENT">Urgent</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <select
          value={caseTypeFilter}
          onChange={(e) => { setCaseTypeFilter(e.target.value); setPage(1); }}
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1.5 text-sm text-[var(--color-foreground)]"
        >
          <option value="">All Case Types</option>
          <option value="PERSONAL_INJURY">Personal Injury</option>
          <option value="FAMILY_LAW">Family Law</option>
          <option value="CRIMINAL_DEFENSE">Criminal Defense</option>
          <option value="REAL_ESTATE">Real Estate</option>
          <option value="EMPLOYMENT_LAW">Employment Law</option>
          <option value="IMMIGRATION">Immigration</option>
          <option value="CORPORATE_LAW">Corporate Law</option>
          <option value="INTELLECTUAL_PROPERTY">Intellectual Property</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-muted-foreground)]">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Caller</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Case Type</th>
              <th className="px-4 py-2">Urgency</th>
              <th className="px-4 py-2">Spam</th>
              <th className="px-4 py-2">Duration</th>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="px-4 py-4 text-[var(--color-muted-foreground)]">Loading...</td></tr>
            ) : calls.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-4 text-[var(--color-muted-foreground)]">No calls found</td></tr>
            ) : (
              calls.map((call) => (
                <tr key={call.id} className="border-b border-[var(--color-border)]">
                  <td className="px-4 py-2 text-[var(--color-muted-foreground)]">#{call.id}</td>
                  <td className="px-4 py-2 text-[var(--color-foreground)]">{call.caller_name || "Unknown"}</td>
                  <td className="px-4 py-2 text-[var(--color-muted-foreground)]">{call.caller_phone || "N/A"}</td>
                  <td className="px-4 py-2 text-[var(--color-muted-foreground)]">{call.case_type?.replace(/_/g, " ") || "N/A"}</td>
                  <td className="px-4 py-2">{urgencyBadge(call.urgency)}</td>
                  <td className="px-4 py-2 text-[var(--color-muted-foreground)]">{call.is_spam || "N/A"}</td>
                  <td className="px-4 py-2 text-[var(--color-muted-foreground)]">
                    {call.duration_seconds ? `${Math.round(call.duration_seconds)}s` : "N/A"}
                  </td>
                  <td className="px-4 py-2 text-[var(--color-muted-foreground)]">
                    {new Date(call.called_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <Link href={`/admin/calls/${call.id}`} className="text-[var(--color-primary)] text-xs hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-muted-foreground)]">
            {total} total, page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="flex items-center gap-1 rounded border border-[var(--color-border)] px-3 py-1 text-sm disabled:opacity-50"
            >
              <ArrowLeft size={14} /> Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="flex items-center gap-1 rounded border border-[var(--color-border)] px-3 py-1 text-sm disabled:opacity-50"
            >
              Next <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
