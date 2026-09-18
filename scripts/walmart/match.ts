import type { GroceryItem } from "../../src/lib/types";
import type { RawListing } from "./parse";

export interface MatchResult {
  title: string;
  price: number;
  wasPrice: number | null;
  isDeal: boolean;
  percentOff: number | null;
}

// Words that signal a fundamentally different product form. A listing is
// rejected if it contains one of these and the catalog item's own
// name/unit doesn't already mention it — this is what stops "Bananas"
// (fresh, per lb) from matching a $132 case of dried banana slices.
const FORM_DISQUALIFIERS = [
  "dried",
  "freeze-dried",
  "freeze dried",
  "powder",
  "puree",
  "extract",
  "granola",
  "snack",
  "snacks",
  "bar",
  "bars",
  "chips",
  "crisps",
  "cookie",
  "cookies",
  "cake",
  "bread",
  "muffin",
  "flavored",
  "flavor",
  "scented",
  "candle",
  "supplement",
  "vitamin",
  "capsule",
  "gummies",
];

// Non-grocery items that share a word with a grocery item (a real failure
// seen live: "Bananas" matched a book titled "Bananas: How to Serve Them").
// These are never valid regardless of the catalog item.
const NON_GROCERY_DISQUALIFIERS = [
  "paperback",
  "hardcover",
  "book",
  "ebook",
  "audiobook",
  "novel",
  "cookbook",
  "recipe book",
  "journal",
  "planner",
  "calendar",
  "dvd",
  "blu-ray",
  "vinyl record",
  "poster",
  "sticker",
  "figurine",
  "costume",
  "toy",
  "puzzle",
  "video game",
  "easter",
  "decor",
  "decoration",
  "ornament",
  "fillable",
  "seeds",
  "gardening",
  "microgreens",
  "baby food",
  "toddler food",
  "infant formula",
  "craft",
  "novelty",
  "party favor",
  "party supplies",
  "plastic egg",
];

// How far a listing's price is allowed to sit from the catalog's own
// realistic reference price and still be considered the same product.
// Scales with price so a $0.50 banana gets a ~$0.20 window while a $13
// pack of towels gets a few dollars — a flat percentage would make the
// buffer unreasonably tight for cheap items and unreasonably loose for
// expensive ones.
function priceBuffer(referencePrice: number): number {
  return Math.max(0.25, referencePrice * 0.3);
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((t) => t.length > 1);
}

// Generic size/pack/unit words don't help identify the product and just
// add noise to token-overlap checks.
const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "of",
  "with",
  "and",
  "each",
  "pack",
  "case",
  "count",
  "ct",
  "oz",
  "lb",
  "lbs",
  "pound",
  "pounds",
]);

function coreTokens(text: string): string[] {
  return tokens(text).filter((t) => !STOPWORDS.has(t));
}

/**
 * Conservative matcher: filters listings down to ones that plausibly are
 * the catalog item by name (every core word present, no disqualifying
 * words), then — this is the main signal — picks whichever surviving
 * listing's price is CLOSEST to the catalog's own realistic estimate for
 * that item. A $132 case of dried bananas and a $16 banana book both fail
 * immediately here because neither is anywhere near ~$0.50. Returns null
 * rather than a low-confidence guess if nothing lands within the buffer.
 */
export function findConfidentMatch(
  listings: RawListing[],
  item: GroceryItem
): MatchResult | null {
  const itemTokens = coreTokens(item.name);
  const itemNormalized = normalize(item.name + " " + item.unit);
  // ShopRite is the deterministic pricing model's bias-1.0 baseline — the
  // closest thing we have to a "plausible national average" estimate to
  // compare a live-scraped price against.
  const referencePrice = item.prices.shoprite;
  const buffer = priceBuffer(referencePrice);

  const candidates = listings.filter((listing) => {
    const titleTokens = new Set(tokens(listing.title));

    const hasAllCoreTokens = itemTokens.every((t) => titleTokens.has(t));
    if (!hasAllCoreTokens) return false;

    const titleNormalized = normalize(listing.title);

    const isNonGrocery = NON_GROCERY_DISQUALIFIERS.some((word) =>
      titleNormalized.includes(word)
    );
    if (isNonGrocery) return false;

    const hasDisqualifier = FORM_DISQUALIFIERS.some(
      (word) => titleNormalized.includes(word) && !itemNormalized.includes(word)
    );
    if (hasDisqualifier) return false;

    return Math.abs(listing.price - referencePrice) <= buffer;
  });

  if (candidates.length === 0) return null;

  // Among valid candidates, the one whose price sits closest to our
  // estimate is the most likely to be the right size/pack of the right
  // product — not just the right product name.
  candidates.sort(
    (a, b) =>
      Math.abs(a.price - referencePrice) - Math.abs(b.price - referencePrice)
  );
  const best = candidates[0];

  const isDeal = best.wasPrice !== null && best.wasPrice > best.price;
  const percentOff = isDeal
    ? Math.round(((best.wasPrice! - best.price) / best.wasPrice!) * 100)
    : null;

  return {
    title: best.title,
    price: best.price,
    wasPrice: isDeal ? best.wasPrice : null,
    isDeal,
    percentOff,
  };
}
