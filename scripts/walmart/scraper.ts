import { chromium, type BrowserContext, type Page } from "playwright";

/**
 * Launches the persistent Edge profile exactly as provided — same
 * executable, same profile directory, same anti-detection flag. This part
 * is intentionally left as-is; only the orchestration around it changes.
 */
export async function launchScraperContext(): Promise<BrowserContext> {
  const context = await chromium.launchPersistentContext(
    "C:\\Users\\Yashh\\AppData\\Local\\Microsoft\\Edge\\User Data\\ScraperProfile",
    {
      headless: false,
      executablePath:
        "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      args: ["--disable-blink-features=AutomationControlled"],
    }
  );
  return context;
}

/**
 * Navigates to a Walmart search for `query` and returns every span's
 * innerText that contains a "$" — the same raw extraction the original
 * scraper performs, just callable per-query instead of hardcoded to one
 * search.
 */
export async function scrapeQuery(page: Page, query: string): Promise<string[]> {
  const url = `https://www.walmart.com/search?q=${encodeURIComponent(query)}`;
  await page.goto(url);
  await page.waitForTimeout(5000);

  const texts = await page.$$eval("span", (spans) =>
    spans.map((s) => (s as HTMLElement).innerText).filter((t) => t.includes("$"))
  );
  return texts;
}

export function randomDelayMs(minMs: number, maxMs: number): number {
  return minMs + Math.floor(Math.random() * (maxMs - minMs));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
