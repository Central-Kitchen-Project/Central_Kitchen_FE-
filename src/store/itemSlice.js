import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import itemService from "../services/itemService";

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.$values)) return data.$values;
  if (data && typeof data === "object") return Object.values(data).find(Array.isArray) || [];
  return [];
};

export const HIDDEN_ITEM_IDS_STORAGE_KEY = "HIDDEN_ITEM_IDS";

const loadHiddenItemIds = () => {
  if (typeof localStorage === "undefined") return [];

  try {
    const raw = JSON.parse(localStorage.getItem(HIDDEN_ITEM_IDS_STORAGE_KEY) || "[]");
    return Array.isArray(raw) ? raw.map(Number).filter(Number.isFinite) : [];
  } catch {
    return [];
  }
};

const isItemActive = (item) => {
  if (!item || typeof item !== "object") return false;
  if (item.active === false) return false;
  if (item.isActive === false) return false;
  if (item.isAvailable === false) return false;
  return true;
};

const initialState = {
  listItems: [],
  hiddenIds: loadHiddenItemIds()
};

const name = "item";

export const fetchGetAll = createAsyncThunk(
  `${name}/fetchGetAll`,
  async ({ type = "", category = "" }, { rejectWithValue }) => {
    try {
      const response = await itemService.GetAll(type, category);
      const all = normalizeArray(response.data?.data ?? response.data);
      const hiddenIds = loadHiddenItemIds();

      return all.filter((item) => isItemActive(item) && !hiddenIds.includes(Number(item.id)));
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

const itemSlice = createSlice({
  name,
  initialState,
  reducers: {
    hideItem: (state, action) => {
      const itemId = Number(action.payload);

      if (!Number.isFinite(itemId)) return;

      if (!state.hiddenIds.includes(itemId)) {
        state.hiddenIds.push(itemId);
      }

      state.listItems = (state.listItems || []).filter((item) => Number(item.id) !== itemId);
    },
    syncHiddenItems: (state) => {
      state.hiddenIds = loadHiddenItemIds();
      state.listItems = (state.listItems || []).filter(
        (item) => isItemActive(item) && !state.hiddenIds.includes(Number(item.id))
      );
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchGetAll.fulfilled, (state, action) => {
      state.hiddenIds = loadHiddenItemIds();
      state.listItems = normalizeArray(action.payload);
    });
  }
});

export const { hideItem, syncHiddenItems } = itemSlice.actions;
export default itemSlice.reducer;