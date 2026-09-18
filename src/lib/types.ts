export type StoreId =
  | "stopandshop"
  | "shoprite"
  | "walmart"
  | "costco"
  | "aldi"
  | "traderjoes"
  | "keyfood";

export type Category =
  | "produce"
  | "dairy"
  | "meat"
  | "bakery"
  | "frozen"
  | "household"
  | "pantry";

export interface Store {
  id: StoreId;
  name: string;
  shortName: string;
  accent: string;
  membershipRequired?: boolean;
  tagline: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  category: Category;
  unit: string;
  icon: string;
  prices: Record<StoreId, number>;
}

export interface Deal {
  itemId: string;
  storeId: StoreId;
  percentOff: number;
}

export interface ListEntry {
  itemId: string;
  qty: number;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  produce: "Produce",
  dairy: "Dairy",
  meat: "Meat & Seafood",
  bakery: "Bakery",
  frozen: "Frozen",
  household: "Household",
  pantry: "Pantry",
};

export const STORE_ORDER: StoreId[] = [
  "shoprite",
  "stopandshop",
  "walmart",
  "costco",
  "aldi",
  "traderjoes",
  "keyfood",
];
