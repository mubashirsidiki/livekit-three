import { NextRequest, NextResponse } from "next/server";
import { createToken } from "@/lib/auth";
import { getUsersCollection, verifyPassword } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { id, password } = await request.json();
    if (!id || !password) {
      return NextResponse.json({ error: "ID and password required" }, { status: 400 });
    }

    const users = await getUsersCollection();
    const user = await users.findOne({ id, role: "customer" });

    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await createToken({ id: user.id, role: "customer" });
    return NextResponse.json({ token });
  } catch (err) {
    console.error("Customer login error:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
