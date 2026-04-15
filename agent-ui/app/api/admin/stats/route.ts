import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { getCallsCollection } from "@/lib/db";

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request, "admin");
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "7", 10);

  const calls = await getCallsCollection();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const pipeline = [
    { $match: { called_at: { $gte: startDate } } },
    {
      $facet: {
        dailyVolume: [
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$called_at" } },
              calls: { $sum: 1 },
              genuine: { $sum: { $cond: [{ $eq: ["$is_spam", "NOT_SPAM"] }, 1, 0] } },
              spam: { $sum: { $cond: [{ $eq: ["$is_spam", "SPAM"] }, 1, 0] } },
              urgent: { $sum: { $cond: [{ $in: ["$urgency", ["URGENT", "HIGH"]] }, 1, 0] } },
            },
          },
          { $sort: { _id: 1 } },
        ],
        caseTypeDistribution: [
          { $match: { is_spam: "NOT_SPAM", case_type: { $nin: [null, "NOT_APPLICABLE"] } } },
          { $group: { _id: "$case_type", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ],
        urgencyBreakdown: [
          { $match: { urgency: { $ne: null } } },
          { $group: { _id: "$urgency", count: { $sum: 1 } } },
        ],
        qualificationBreakdown: [
          { $match: { is_spam: "NOT_SPAM", qualification_score: { $ne: null } } },
          { $group: { _id: "$qualification_score", count: { $sum: 1 } } },
        ],
      },
    },
  ];

  const [result] = await calls.aggregate(pipeline).toArray();

  // Fill date gaps
  const dailyVolume = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const existing = result.dailyVolume.find((r: { _id: string }) => r._id === key);
    dailyVolume.push(existing ? { date: existing._id, ...existing } : { date: key, calls: 0, genuine: 0, spam: 0, urgent: 0 });
  }

  // Today stats
  const today = new Date().toISOString().slice(0, 10);
  const todayData = dailyVolume.find((d: { date: string }) => d.date === today);

  return NextResponse.json({
    dailyVolume,
    caseTypeDistribution: result.caseTypeDistribution.map((r: { _id: string; count: number }) => ({ case_type: r._id, count: r.count })),
    urgencyBreakdown: result.urgencyBreakdown.map((r: { _id: string; count: number }) => ({ urgency: r._id, count: r.count })),
    qualificationBreakdown: result.qualificationBreakdown.map((r: { _id: string; count: number }) => ({ score: r._id, count: r.count })),
    todayStats: {
      total: todayData?.calls || 0,
      urgent: todayData?.urgent || 0,
      spam: todayData?.spam || 0,
      genuine: todayData?.genuine || 0,
    },
  });
}
