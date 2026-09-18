import type { GroceryItem } from "../../src/lib/types";

/**
 * Builds an ordered list of search queries to try for a catalog item,
 * primary query first. The runner tries each in order and stops at the
 * first confident match — these are fallbacks for when the plain item
 * name surfaces irrelevant products (e.g. "banana" surfacing dried banana
 * snacks instead of fresh bananas).
 *
 * Produce gets the full fallback list since it's the category most likely
 * to need it (Walmart search often surfaces dried/processed variants
 * instead of the fresh item). Other categories use a shorter list —
 * capped per-category so a single item can't trigger an unbounded number
 * of live searches.
 */
export function buildQueryPlan(item: GroceryItem): string[] {
  const name = item.name.toLowerCase();
  const queries = [item.name];

  const add = (q: string) => {
    if (!queries.includes(q)) queries.push(q);
  };

  if (item.category === "produce") {
    add(`fresh ${name}`);
    add(`${name} produce`);
    add(`${name} fruit`);
    add(`${name} lb`);
    add(`${name} grocery`);
    add(`${name} per pound`);
    add(`${name} single`);
    return queries.slice(0, 8);
  } else if (item.category === "meat") {
    add(`fresh ${name}`);
    add(`${name} meat department`);
    add(`${name} per lb`);
  } else if (item.category === "dairy") {
    add(`${name} grocery`);
    add(`${name} dairy`);
  } else if (item.category === "bakery") {
    add(`${name} bakery`);
    add(`fresh ${name}`);
  } else if (item.category === "frozen") {
    add(`${name} frozen food`);
  } else if (item.category === "household") {
    add(`${name} household`);
  } else {
    add(`${name} grocery`);
  }

  add(`${name} single`);

  return queries.slice(0, 5);
}
