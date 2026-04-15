import { NextRequest, NextResponse } from "next/server";
import { getCallsCollection } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const urgency = searchParams.get("urgency");
    const caseType = searchParams.get("case_type");
    const date = searchParams.get("date");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const filter: Record<string, unknown> = {};
    if (urgency) filter.urgency = urgency;
    if (caseType) filter.case_type = caseType;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.called_at = { $gte: start, $lt: end };
    }

    const calls = await getCallsCollection();
    const total = await calls.countDocuments(filter);
    const rows = await calls
      .find(filter)
      .sort({ called_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    const sanitized = rows.map((r) => ({ ...r, id: r._id.toString(), _id: r._id.toString() }));
    return NextResponse.json({ calls: sanitized, total, page, limit });
  } catch (err) {
    console.error("Error listing call records:", err);
    return NextResponse.json({ error: "Failed to list calls" }, { status: 500 });
  }
}
