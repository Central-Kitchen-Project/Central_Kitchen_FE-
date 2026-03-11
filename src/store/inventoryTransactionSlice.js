import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import inventoryTransactionService from "../services/inventoryTransactionService";

const initialState = {
  listTransactions: [],
  loading: false,
  error: null,
};

const name = "inventoryTransaction";

export const fetchGetTransactions = createAsyncThunk(
  `${name}/fetchGetTransactions`,
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventoryTransactionService.GetAll();
      return response.data.value || response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch transactions");
    }
  }
);

const inventoryTransactionSlice = createSlice({
  name,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchGetTransactions.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchGetTransactions.fulfilled, (state, action) => {
      state.loading = false;
      state.listTransactions = action.payload;
    });
    builder.addCase(fetchGetTransactions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export default inventoryTransactionSlice.reducer;
