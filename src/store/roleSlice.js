import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import roleService from "../services/roleService";

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.$values)) return data.$values;
  if (data && typeof data === "object") return Object.values(data).find(Array.isArray) || [];
  return [];
};

const unwrap = (resData) => resData?.data ?? resData;

export const fetchAllRoles = createAsyncThunk(
  "role/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await roleService.getAllRoles();
      return normalizeArray(unwrap(res.data));
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch roles");
    }
  }
);

export const createRole = createAsyncThunk(
  "role/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await roleService.createRole(data);
      return unwrap(res.data);
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to create role");
    }
  }
);

export const updateRole = createAsyncThunk(
  "role/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await roleService.updateRole(id, data);
      return unwrap(res.data);
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to update role");
    }
  }
);

export const deleteRole = createAsyncThunk(
  "role/delete",
  async (id, { rejectWithValue }) => {
    try {
      await roleService.deleteRole(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to delete role");
    }
  }
);

const roleSlice = createSlice({
  name: "ROLE",
  initialState: {
    roles: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearRoleError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchAllRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchAllRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // create
      .addCase(createRole.fulfilled, (state, action) => {
        state.roles.push(action.payload);
      })
      .addCase(createRole.rejected, (state, action) => {
        state.error = action.payload;
      })
      // update
      .addCase(updateRole.fulfilled, (state, action) => {
        const idx = state.roles.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.roles[idx] = action.payload;
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.error = action.payload;
      })
      // delete
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.roles = state.roles.filter((r) => r.id !== action.payload);
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearRoleError } = roleSlice.actions;
export default roleSlice.reducer;
