import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import inventoryService from "../services/inventoryService";

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
      console.log("inventory response", response);
      return response.data.value || response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response?.data || "Failed to fetch inventory");
    }
  }
);

export const fetchUpdateInventory = createAsyncThunk(
  `${name}/fetchUpdateInventory`,
  async ({ id, quantity, userId }, { rejectWithValue }) => {
    try {
      const response = await inventoryService.UpdateStock(id, quantity, userId);
      console.log("update inventory response", response);
      return { id, quantity, data: response.data };
    } catch (error) {
      console.log(error);
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
      state.listInventory = action.payload;
    });
    builder.addCase(fetchGetInventory.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Update stock
    builder.addCase(fetchUpdateInventory.fulfilled, (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.listInventory.find((inv) => inv.id === id);
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
