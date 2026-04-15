import { NextRequest, NextResponse } from "next/server";
import { getSettingsCollection, ensureDefaultSettings } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureDefaultSettings();
  const settings = await getSettingsCollection();
  const rows = await settings.find({}).toArray();
  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return NextResponse.json(result);
}

export async function PUT(request: NextRequest) {
  const session = await getSession(request);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const settings = await getSettingsCollection();

    for (const [key, value] of Object.entries(body)) {
      if (typeof value === "string") {
        await settings.updateOne(
          { key },
          { $set: { value, updated_at: new Date() } },
          { upsert: true }
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error updating settings:", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
