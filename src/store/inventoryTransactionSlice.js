import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import inventoryTransactionService from "../services/inventoryTransactionService";
import { getStoredUserId } from "../utils/userInfo";

const normalizeTransactions = (raw) => {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.$values)) return raw.$values;
  if (raw && Array.isArray(raw.value)) return raw.value;
  if (raw && Array.isArray(raw.data)) return raw.data;
  if (raw && Array.isArray(raw.items)) return raw.items;
  if (raw && Array.isArray(raw.results)) return raw.results;
  if (raw && raw.data != null) return normalizeTransactions(raw.data);
  if (raw && raw.value != null && typeof raw.value === "object") {
    return normalizeTransactions(raw.value);
  }
  return [];
};

const initialState = {
  listTransactions: [],
  loading: false,
  error: null,
};

const name = "inventoryTransaction";

function isValidUserIdArg(userId) {
  if (userId == null || userId === "") return false;
  const n = Number(userId);
  return Number.isFinite(n) && n > 0;
}

export const fetchGetTransactions = createAsyncThunk(
  `${name}/fetchGetTransactions`,
  async (maybeUserId, { rejectWithValue }) => {
    const uid = isValidUserIdArg(maybeUserId) ? Number(maybeUserId) : getStoredUserId();
    try {
      /** Luôn gọi API (kể cả thiếu userId → không query string) để thấy request trong Network khi debug */
      const response = await inventoryTransactionService.GetAll(uid);
      const body = response.data;
      const raw = body?.value ?? body?.data ?? body;
      let list = normalizeTransactions(raw);
      if (list.length === 0 && Array.isArray(body)) list = body;
      return list;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch transactions");
    }
  }
);

const inventoryTransactionSlice = createSlice({
  name,
  initialState,
  reducers: {
    clearInventoryTransactions: (state) => {
      state.listTransactions = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchGetTransactions.pending, (state) => {
      state.loading = true;
      state.error = null;
      // Tránh hiển thị list của user/role khác khi chuyển trang (slice dùng chung)
      state.listTransactions = [];
    });
    builder.addCase(fetchGetTransactions.fulfilled, (state, action) => {
      state.loading = false;
      state.listTransactions = normalizeTransactions(action.payload);
    });
    builder.addCase(fetchGetTransactions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { clearInventoryTransactions } = inventoryTransactionSlice.actions;
export default inventoryTransactionSlice.reducer;
