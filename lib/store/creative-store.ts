import { create } from "zustand";
import { Creative } from "../types";

export type Filters = {
  product?: string;
  creator?: string;
  contentType?: string;
  month?: string;
  status?: string;
  search?: string;
};

type CreativeStore = {
  creatives: Creative[];
  filters: Filters;
  selectedCreativeId?: string;
  setCreatives: (items: Creative[]) => void;
  setFilter: (key: keyof Filters, value?: string) => void;
  clearFilters: () => void;
  setSelectedCreativeId: (id?: string) => void;
};

export const useCreativeStore = create<CreativeStore>((set) => ({
  creatives: [],
  filters: {},
  selectedCreativeId: undefined,
  setCreatives: (items) =>
    set(() => ({
      creatives: items,
      filters: {},
      selectedCreativeId: undefined,
    })),
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),
  clearFilters: () =>
    set(() => ({
      filters: {},
    })),
  setSelectedCreativeId: (id) =>
    set(() => ({
      selectedCreativeId: id,
    })),
}));
