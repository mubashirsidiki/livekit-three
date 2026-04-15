import { NextRequest, NextResponse } from "next/server";
import { getCallsCollection } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const roomName = url.searchParams.get("room_name");
  if (!roomName) {
    return NextResponse.json({ error: "room_name is required" }, { status: 400 });
  }

  // Auth: customer JWT only
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await verifyToken(authHeader.slice(7));
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const calls = await getCallsCollection();
  const record = await calls.findOne({ room_name: roomName }, { sort: { called_at: -1 } });

  if (!record) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({ found: true, record: { ...record, _id: record._id.toString() } });
}
