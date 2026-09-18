import type { Store, StoreId } from "@/lib/types";

export const STORES: Store[] = [
  {
    id: "shoprite",
    name: "ShopRite",
    shortName: "ShopRite",
    accent: "#0057B8",
    tagline: "Local price leader",
  },
  {
    id: "stopandshop",
    name: "Stop & Shop",
    shortName: "Stop & Shop",
    accent: "#C8102E",
    tagline: "Full-service supermarket",
  },
  {
    id: "walmart",
    name: "Walmart",
    shortName: "Walmart",
    accent: "#0071CE",
    tagline: "Everyday low prices",
  },
  {
    id: "costco",
    name: "Costco Wholesale",
    shortName: "Costco",
    accent: "#005DAA",
    membershipRequired: true,
    tagline: "Bulk savings, membership required",
  },
  {
    id: "aldi",
    name: "Aldi",
    shortName: "Aldi",
    accent: "#FF7900",
    tagline: "No-frills discount grocer",
  },
  {
    id: "traderjoes",
    name: "Trader Joe's",
    shortName: "Trader Joe's",
    accent: "#D2232A",
    tagline: "Curated specialty picks",
  },
  {
    id: "keyfood",
    name: "Key Food",
    shortName: "Key Food",
    accent: "#00A651",
    tagline: "Neighborhood grocer",
  },
];

export const STORE_MAP: Record<StoreId, Store> = STORES.reduce(
  (acc, store) => {
    acc[store.id] = store;
    return acc;
  },
  {} as Record<StoreId, Store>
);

// Relative price bias vs. national average — reflects each chain's general
// positioning (discounters skew low, full-service chains skew high).
export const STORE_PRICE_BIAS: Record<StoreId, number> = {
  aldi: 0.83,
  costco: 0.82,
  walmart: 0.9,
  traderjoes: 0.94,
  shoprite: 1.0,
  stopandshop: 1.09,
  keyfood: 1.13,
};
