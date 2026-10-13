import {
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type { VulnerabilityFilters } from "../../domain/vulnerability";

const initialState: VulnerabilityFilters = {
  query: "",
  severity: "all",
  status: "all",
  technology: "all",
};

const filtersSlice = createSlice({
  name: "vulnerabilityFilters",
  initialState,

  reducers: {
    updateFilters: (
      state,
      action: PayloadAction<Partial<VulnerabilityFilters>>,
    ) => ({
      ...state,
      ...action.payload,
    }),

    resetFilters: () => ({
      ...initialState,
    }),
  },
});

export const {
  updateFilters,
  resetFilters,
} = filtersSlice.actions;

export const filtersReducer = filtersSlice.reducer;