export interface RawListing {
  title: string;
  price: number;
  wasPrice: number | null;
}

function toNumber(raw: string): number {
  return Number(raw.replace(/,/g, ""));
}

/**
 * Anchors on the "current price ..." lines, which are Walmart's
 * accessibility text and far more reliable than parsing prices out of the
 * noisy product-title strings. Pattern observed in real scraper output:
 *
 *   "<Title with price(s) inline>"
 *   "$"
 *   "current price $X"                       (regular price)
 *   "current price Now $X, Was $Y"            (deal)
 *   ["$Y"]                                    (sometimes follows a deal)
 *
 * Everything else in the raw array (nav text, cart total, promo teasers)
 * is ignored automatically since it never sits directly before a
 * "current price" line.
 */
export function parseListings(raw: string[]): RawListing[] {
  const listings: RawListing[] = [];
  const simplePrice = /^current price \$([\d,.]+)$/;
  const dealPrice = /^current price Now \$([\d,.]+), Was \$([\d,.]+)$/;

  for (let i = 0; i < raw.length; i++) {
    const line = raw[i]?.trim();
    if (!line) continue;

    const dealMatch = line.match(dealPrice);
    const simpleMatch = !dealMatch ? line.match(simplePrice) : null;
    if (!dealMatch && !simpleMatch) continue;

    const titleLine = raw[i - 2];
    if (!titleLine) continue;

    // Title lines have the price(s) appended, e.g.
    // "Mavuno Harvest ... 2 oz (Pack Of 12) $36.61 Was $70.99"
    // Strip everything from the first "$<digit>" onward to get a clean name.
    const title = titleLine.split(/\s*\$\d/)[0].trim();
    if (!title) continue;

    if (dealMatch) {
      listings.push({
        title,
        price: toNumber(dealMatch[1]),
        wasPrice: toNumber(dealMatch[2]),
      });
    } else if (simpleMatch) {
      listings.push({
        title,
        price: toNumber(simpleMatch[1]),
        wasPrice: null,
      });
    }
  }

  return listings;
}
