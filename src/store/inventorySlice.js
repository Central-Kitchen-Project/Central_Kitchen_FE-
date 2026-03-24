import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import inventoryService from "../services/inventoryService";

/** Unwrap .NET / OData style payloads to a plain array for Redux. */
function normalizeInventoryPayload(data) {
  if (data == null) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.$values)) return data.$values;
  if (data.data !== undefined) return normalizeInventoryPayload(data.data);
  if (Array.isArray(data.value)) return data.value;
  if (data.value != null && typeof data.value === "object") {
    return normalizeInventoryPayload(data.value);
  }
  if (typeof data === "object") {
    const nested = Object.values(data).find(Array.isArray);
    return nested || [];
  }
  return [];
}

const initialState = {
  listInventory: [],
  loading: false,
  error: null,
};

const name = "inventory";

export const fetchGetInventory = createAsyncThunk(
  `${name}/fetchGetInventory`,
  async (userId, { rejectWithValue }) => {
    try {
      const response = await inventoryService.GetAll(userId);
      const raw =
        response.data?.value ??
        response.data?.data ??
        response.data;
      return normalizeInventoryPayload(raw);
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch inventory");
    }
  }
);

export const fetchUpdateInventory = createAsyncThunk(
  `${name}/fetchUpdateInventory`,
  async ({ id, quantity, userId }, { rejectWithValue }) => {
    try {
      const response = await inventoryService.UpdateStock(id, quantity, userId);
      return { id, quantity, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update inventory");
    }
  }
);

const inventorySlice = createSlice({
  name,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch all
    builder.addCase(fetchGetInventory.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchGetInventory.fulfilled, (state, action) => {
      state.loading = false;
      state.listInventory = normalizeInventoryPayload(action.payload);
    });
    builder.addCase(fetchGetInventory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Update stock
    builder.addCase(fetchUpdateInventory.fulfilled, (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.listInventory.find((inv) => inv.id === id || inv.Id === id);
      if (item) {
        item.quantity = quantity;
      }
    });
    builder.addCase(fetchUpdateInventory.rejected, (state, action) => {
      state.error = action.payload;
    });
  },
});

export default inventorySlice.reducer;
