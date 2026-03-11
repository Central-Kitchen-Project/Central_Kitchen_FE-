import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import orderService from "../services/orderService";

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.$values)) return data.$values;
  if (data && typeof data === 'object') return Object.values(data).find(Array.isArray) || [];
  return [];
};

const initialState = {
  listOrders: [],
  loading: false,
  error: null,
};

const name = "item";

export const fetchGetOrder = createAsyncThunk(
  `${name}/fetchGetOrder`,
  async (_, { rejectWithValue }) => {
    try {
      const response = await orderService.GetAll();
      const raw = response.data?.data ?? response.data;
      return normalizeArray(raw);
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const createOrder = createAsyncThunk(
  `${name}/createOrder`,
  async (data, { rejectWithValue }) => {
    try {
      const response = await orderService.Create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  `${name}/updateOrderStatus`,
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await orderService.UpdateStatus(id, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const deleteOrder = createAsyncThunk(
  `${name}/deleteOrder`,
  async (id, { rejectWithValue }) => {
    try {
      await orderService.Delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

const itemSlice = createSlice({
  name,
  initialState,
  reducers: {
    clearOrderError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGetOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGetOrder.fulfilled, (state, action) => {
        state.listOrders = action.payload || [];
        state.loading = false;
      })
      .addCase(fetchGetOrder.rejected, (state, action) => {
        state.listOrders = [];
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.listOrders = state.listOrders.filter(o => o.id !== action.payload);
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { clearOrderError } = itemSlice.actions;
export default itemSlice.reducer;