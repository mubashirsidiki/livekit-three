import { NextRequest, NextResponse } from "next/server";
import { getCallsCollection } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const calls = await getCallsCollection();
    const record = await calls.findOne({ _id: new ObjectId(id) });

    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ...record, id: record._id.toString(), _id: record._id.toString() });
  } catch (err) {
    console.error("Error getting call record:", err);
    return NextResponse.json({ error: "Failed to get call record" }, { status: 500 });
  }
}
