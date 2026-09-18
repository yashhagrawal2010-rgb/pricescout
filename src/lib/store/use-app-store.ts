import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_OPTIMIZER_SETTINGS } from "@/lib/optimizer";
import type { ListEntry, StoreId } from "@/lib/types";

const DEFAULT_STORES: StoreId[] = ["shoprite", "stopandshop", "aldi"];

interface AppState {
  selectedStores: StoreId[];
  list: ListEntry[];
  maxStores: number;
  tripCost: number;
  hasHydrated: boolean;
  priceVersion: number;
  toggleStore: (storeId: StoreId) => void;
  addItem: (itemId: string, qty?: number) => void;
  removeItem: (itemId: string) => void;
  setQty: (itemId: string, qty: number) => void;
  clearList: () => void;
  setMaxStores: (value: number) => void;
  setTripCost: (value: number) => void;
  setHasHydrated: (value: boolean) => void;
  bumpPriceVersion: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      selectedStores: DEFAULT_STORES,
      list: [],
      maxStores: DEFAULT_OPTIMIZER_SETTINGS.maxStores,
      tripCost: DEFAULT_OPTIMIZER_SETTINGS.tripCost,
      hasHydrated: false,
      priceVersion: 0,
      bumpPriceVersion: () => set({ priceVersion: get().priceVersion + 1 }),
      toggleStore: (storeId) => {
        const current = get().selectedStores;
        const next = current.includes(storeId)
          ? current.filter((id) => id !== storeId)
          : [...current, storeId];
        set({ selectedStores: next });
      },
      addItem: (itemId, qty = 1) => {
        const current = get().list;
        const existing = current.find((entry) => entry.itemId === itemId);
        if (existing) {
          set({
            list: current.map((entry) =>
              entry.itemId === itemId
                ? { ...entry, qty: entry.qty + qty }
                : entry
            ),
          });
        } else {
          set({ list: [...current, { itemId, qty }] });
        }
      },
      removeItem: (itemId) => {
        set({ list: get().list.filter((entry) => entry.itemId !== itemId) });
      },
      setQty: (itemId, qty) => {
        if (qty <= 0) {
          get().removeItem(itemId);
          return;
        }
        set({
          list: get().list.map((entry) =>
            entry.itemId === itemId ? { ...entry, qty } : entry
          ),
        });
      },
      clearList: () => set({ list: [] }),
      setMaxStores: (value) => set({ maxStores: value }),
      setTripCost: (value) => set({ tripCost: value }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "pricescout-store",
      partialize: (state) => ({
        selectedStores: state.selectedStores,
        list: state.list,
        maxStores: state.maxStores,
        tripCost: state.tripCost,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
