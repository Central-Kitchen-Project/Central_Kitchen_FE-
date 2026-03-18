import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import materialService from "../services/materialService";

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.$values)) return data.$values;
  if (data && typeof data === "object") return Object.values(data).find(Array.isArray) || [];
  return [];
};

const initialState = {
  listMaterials: [],
  loading: false,
  error: null,
};

const name = "material";

export const fetchGetMaterialRequest = createAsyncThunk(
  `${name}/fetchGetMaterialRequest`,
  async (_, { rejectWithValue }) => {
    try {
      const response = await materialService.GetAll();
      const raw = response.data?.data ?? response.data;
      return normalizeArray(raw);
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const createMaterialRequest = createAsyncThunk(
  `${name}/createMaterialRequest`,
  async (data, { rejectWithValue }) => {
    try {
      const response = await materialService.Create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

export const updateMaterialRequestStatus = createAsyncThunk(
  `${name}/updateMaterialRequestStatus`,
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await materialService.UpdateStatus(id, status);
      return { id, status, payload: response.data };
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

const materialSlice = createSlice({
  name,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGetMaterialRequest.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGetMaterialRequest.fulfilled, (state, action) => {
        state.listMaterials = action.payload || [];
        state.loading = false;
      })
      .addCase(fetchGetMaterialRequest.rejected, (state, action) => {
        state.listMaterials = [];
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createMaterialRequest.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateMaterialRequestStatus.fulfilled, (state, action) => {
        state.listMaterials = state.listMaterials.map((item) =>
          item.id === action.payload.id ? { ...item, status: action.payload.status } : item
        );
      })
      .addCase(updateMaterialRequestStatus.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export default materialSlice.reducer;