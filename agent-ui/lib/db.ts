import { MongoClient, type Db, type Collection } from "mongodb";
import crypto from "crypto";

const MONGODB_URI = process.env.MONGODB_URI || "";
const DB_NAME = "lawyer_bot";

let _client: MongoClient | null = null;
let _db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (_db) return _db;
  _client = new MongoClient(MONGODB_URI);
  await _client.connect();
  _db = _client.db(DB_NAME);
  return _db;
}

// --- Collections ---

export async function getCallsCollection() {
  const db = await getDb();
  return db.collection("call_records");
}

export async function getSettingsCollection() {
  const db = await getDb();
  return db.collection("business_settings");
}

export async function getReportsCollection() {
  const db = await getDb();
  return db.collection("report_log");
}

export async function getUsersCollection() {
  const db = await getDb();
  const col = db.collection("users");

  // Seed default users if empty
  const count = await col.countDocuments();
  if (count === 0) {
    await col.insertMany([
      { id: "customer", password_hash: hashPassword("customer123"), role: "customer", created_at: new Date() },
      { id: "admin", password_hash: hashPassword("admin123"), role: "admin", created_at: new Date() },
    ]);
  }

  return col;
}

export async function ensureDefaultSettings() {
  const col = await getSettingsCollection();
  const count = await col.countDocuments();
  if (count === 0) {
    await col.insertMany([
      { key: "firm_name", value: "Sterling & Associates", updated_at: new Date() },
      { key: "phone_number", value: process.env.NEXT_PUBLIC_FIRM_PHONE || "", updated_at: new Date() },
      { key: "business_hours", value: "Mon-Fri 9:00 AM - 6:00 PM", updated_at: new Date() },
    ]);
  }
}

// --- Password Hashing ---

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}
