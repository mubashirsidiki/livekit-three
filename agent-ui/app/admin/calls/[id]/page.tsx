"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

interface CallDetail {
  id: number;
  room_name: string | null;
  caller_name: string | null;
  caller_phone: string | null;
  is_spam: string | null;
  reason_for_call: string | null;
  callback_required: string | null;
  callback_required_reason: string | null;
  case_type: string | null;
  urgency: string | null;
  qualification_score: string | null;
  recommended_next_steps: string | null;
  language: string | null;
  transcript: string | null;
  duration_seconds: number | null;
  called_at: string;
}

export default function CallDetailPage() {
  const params = useParams();
  const [call, setCall] = useState<CallDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/calls/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCall(data);
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) return <p className="text-[var(--color-muted-foreground)]">Loading...</p>;
  if (!call) return <p className="text-red-500">Call not found</p>;

  const isUrgent = call.urgency === "URGENT" || call.urgency === "HIGH";

  const steps = (() => {
    try {
      return JSON.parse(call.recommended_next_steps || "[]");
    } catch {
      return call.recommended_next_steps ? [call.recommended_next_steps] : [];
    }
  })();

  return (
    <div className="space-y-4">
      <Link href="/admin/calls" className="flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline">
        <ArrowLeft size={14} /> Back to Calls
      </Link>

      {/* Urgency Banner */}
      {isUrgent && (
        <div className="flex items-center gap-3 rounded-lg border-2 border-red-500 bg-red-50 p-4 animate-pulse dark:bg-red-950">
          <AlertTriangle className="text-red-600" size={24} />
          <div>
            <p className="font-bold text-red-600">URGENT CALL — {call.urgency}</p>
            <p className="text-sm text-red-500">{call.reason_for_call}</p>
          </div>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        <DetailCard label="Caller" value={call.caller_name || "Unknown"} />
        <DetailCard label="Phone" value={call.caller_phone || "N/A"} />
        <DetailCard label="Case Type" value={call.case_type?.replace(/_/g, " ") || "N/A"} />
        <DetailCard label="Urgency" value={call.urgency || "N/A"} highlight={isUrgent} />
        <DetailCard label="Spam" value={call.is_spam || "N/A"} />
        <DetailCard label="Callback Required" value={call.callback_required || "N/A"} />
        <DetailCard label="Qualification Score" value={call.qualification_score || "N/A"} />
        <DetailCard label="Language" value={call.language || "N/A"} />
        <DetailCard label="Duration" value={call.duration_seconds ? `${Math.round(call.duration_seconds)}s` : "N/A"} />
        <DetailCard label="Time" value={new Date(call.called_at).toLocaleString()} />
      </div>

      {/* Reason for Call */}
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
        <h3 className="font-semibold text-[var(--color-foreground)]">Reason for Call</h3>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{call.reason_for_call || "N/A"}</p>
      </div>

      {call.callback_required_reason && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <h3 className="font-semibold text-[var(--color-foreground)]">Callback Reason</h3>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{call.callback_required_reason}</p>
        </div>
      )}

      {/* Recommended Next Steps */}
      {steps.length > 0 && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <h3 className="font-semibold text-[var(--color-foreground)]">Recommended Next Steps</h3>
          <ul className="mt-2 space-y-1">
            {steps.map((step: string, i: number) => (
              <li key={i} className="text-sm text-[var(--color-muted-foreground)]">
                {i + 1}. {step}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Transcript */}
      {call.transcript && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <h3 className="font-semibold text-[var(--color-foreground)]">Transcript</h3>
          <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap text-xs text-[var(--color-muted-foreground)]">
            {call.transcript}
          </pre>
        </div>
      )}
    </div>
  );
}

function DetailCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-3">
      <p className="text-xs text-[var(--color-muted-foreground)]">{label}</p>
      <p className={`mt-0.5 text-sm font-medium ${highlight ? "text-red-600" : "text-[var(--color-foreground)]"}`}>
        {value}
      </p>
    </div>
  );
}
