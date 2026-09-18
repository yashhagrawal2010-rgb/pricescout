import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "walmart-live.json");

function isAuthorized(request: Request): boolean {
  const token = process.env.WALMART_INGEST_TOKEN;
  if (!token) return false;
  return request.headers.get("x-scraper-token") === token;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Expected an object keyed by item id" }, { status: 400 });
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(body, null, 2));

  const count = Object.keys(body as Record<string, unknown>).length;
  return NextResponse.json({ ok: true, storedCount: count });
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!fs.existsSync(DATA_FILE)) {
    return NextResponse.json({ data: {}, lastModified: null });
  }

  const stat = fs.statSync(DATA_FILE);
  const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  return NextResponse.json({ data, lastModified: stat.mtime.toISOString() });
}
