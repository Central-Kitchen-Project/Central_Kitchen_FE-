import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import itemService from "../services/itemService";

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.$values)) return data.$values;
  if (data && typeof data === "object") return Object.values(data).find(Array.isArray) || [];
  return [];
};

const initialState = {
  listItems: [],
  /** Increment after catalog mutations so pages can refetch and stay in sync. */
  itemsVersion: 0,
};

const name = "item";

export const fetchGetAll = createAsyncThunk(
  `${name}/fetchGetAll`,
  async ({ type = "", category = "" }, { rejectWithValue }) => {
    try {
      const response = await itemService.GetAll(type, category);
      const all = normalizeArray(response.data?.data ?? response.data);
      return all;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

const itemSlice = createSlice({
  name,
  initialState,
  reducers: {
    syncHiddenItems: () => {},
    bumpItemCatalogVersion: (state) => {
      state.itemsVersion += 1;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchGetAll.fulfilled, (state, action) => {
      state.listItems = normalizeArray(action.payload);
    });
  }
});

export const HIDDEN_ITEM_IDS_STORAGE_KEY = "HIDDEN_ITEM_IDS";
export const { syncHiddenItems, bumpItemCatalogVersion } = itemSlice.actions;
export default itemSlice.reducer;
