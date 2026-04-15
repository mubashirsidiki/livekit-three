import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getCallsCollection } from "@/lib/db";

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request, "admin");
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");

  const filter: Record<string, unknown> = {};
  if (startDate || endDate) {
    const called_at: Record<string, Date> = {};
    if (startDate) called_at.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      called_at.$lt = end;
    }
    filter.called_at = called_at;
  }

  const calls = await getCallsCollection();
  const rows = await calls.find(filter).sort({ called_at: -1 }).toArray();

  const header = "Caller,Phone,Case Type,Urgency,Spam,Qualification,Callback Required,Duration (s),Reason,Time\n";
  const csvRows = rows.map((r) =>
    [
      escape(r.caller_name || "Unknown"),
      escape(r.caller_phone || ""),
      escape((r.case_type || "").replace(/_/g, " ")),
      escape(r.urgency || ""),
      escape(r.is_spam || ""),
      escape(r.qualification_score || ""),
      escape(r.callback_required || ""),
      r.duration_seconds || 0,
      escape(r.reason_for_call || ""),
      r.called_at ? new Date(r.called_at).toISOString() : "",
    ].join(",")
  ).join("\n");

  const csv = header + csvRows;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="call-report-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

function escape(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}
