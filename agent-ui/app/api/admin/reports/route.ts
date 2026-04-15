import { NextRequest, NextResponse } from "next/server";
import { getCallsCollection, getReportsCollection } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reports = await getReportsCollection();
  const list = await reports.find({}).sort({ sent_at: -1 }).limit(20).toArray();
  const sanitized = list.map((r) => ({ ...r, _id: r._id.toString() }));
  return NextResponse.json({ reports: sanitized });
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, periodStart, periodEnd } = await request.json();
    const calls = await getCallsCollection();

    if (type === "monthly") {
      const start = periodStart || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
      const end = periodEnd || new Date().toISOString().split("T")[0];
      const startDate = new Date(start);
      const endDate = new Date(end);
      endDate.setDate(endDate.getDate() + 1);

      const dateFilter = { called_at: { $gte: startDate, $lt: endDate } };

      const enquiriesByDept = await calls.aggregate([
        { $match: { ...dateFilter, is_spam: "NOT_SPAM", case_type: { $ne: null } } },
        { $group: { _id: "$case_type", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray();

      const conversionsByDept = await calls.aggregate([
        { $match: { ...dateFilter, is_spam: "NOT_SPAM", case_type: { $ne: null } } },
        { $group: {
          _id: "$case_type",
          total: { $sum: 1 },
          high_qual: { $sum: { $cond: [{ $eq: ["$qualification_score", "HIGH"] }, 1, 0] } },
        }},
        { $sort: { high_qual: -1 } },
      ]).toArray();

      const totalCalls = await calls.countDocuments(dateFilter);
      const genuineCalls = await calls.countDocuments({ ...dateFilter, is_spam: "NOT_SPAM" });
      const urgentCalls = await calls.countDocuments({ ...dateFilter, urgency: { $in: ["URGENT", "HIGH"] } });
      const callbacksNeeded = await calls.countDocuments({ ...dateFilter, callback_required: "YES" });

      const summary = { total_calls: totalCalls, genuine_calls: genuineCalls, urgent_calls: urgentCalls, callbacks_needed: callbacksNeeded };

      // Log report
      const reports = await getReportsCollection();
      await reports.insertOne({
        report_type: "monthly",
        period_start: start,
        period_end: end,
        sent_at: new Date(),
        content_summary: JSON.stringify({ enquiriesByDept, conversionsByDept, summary }),
      });

      return NextResponse.json({
        report: {
          enquiriesByDept: enquiriesByDept.map((r) => ({ case_type: r._id, count: r.count })),
          conversionsByDept: conversionsByDept.map((r) => ({ case_type: r._id, total: r.total, high_qual: r.high_qual })),
          summary,
        },
        period: { start, end },
      });
    }

    return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
  } catch (err) {
    console.error("Error generating report:", err);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
