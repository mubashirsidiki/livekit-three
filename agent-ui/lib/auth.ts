import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "change-me-in-production");

export interface SessionPayload {
  id: string;
  role: "customer" | "admin";
}

export async function createToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(request: NextRequest): Promise<SessionPayload | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  return verifyToken(token);
}

export async function verifyAuth(
  request: NextRequest,
  expectedRole: "customer" | "admin"
): Promise<{ authorized: true; session: SessionPayload } | { authorized: false; error: string }> {
  const session = await getSession(request);
  if (!session) return { authorized: false, error: "Unauthorized" };
  if (session.role !== expectedRole) return { authorized: false, error: "Forbidden" };
  return { authorized: true, session };
}
