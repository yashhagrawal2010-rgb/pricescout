import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

const DATA_FILE = path.join(process.cwd(), "data", "walmart-live.json");

// Public read endpoint — just returns non-sensitive scraped price numbers
// so the browser can layer them on top of the mock catalog. Writing is
// the protected side, handled separately by /api/walmart-ingest.
export async function GET() {
  if (!fs.existsSync(DATA_FILE)) {
    return NextResponse.json({});
  }
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({});
  }
}
