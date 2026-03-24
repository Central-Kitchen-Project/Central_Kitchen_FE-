import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from "../services/userService";

// The .NET API may return { data: { $values: [...] } }, envelopes, or a plain array
const normalizeArray = (data) => {
  if (data == null) return [];
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.$values)) return data.$values;
  if (data && data.data !== undefined) return normalizeArray(data.data);
  if (data && typeof data === "object") return Object.values(data).find(Array.isArray) || [];
  return [];
};

export const fetchAllUsers = createAsyncThunk(
  "user/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await userService.getAllUsers();
      return normalizeArray(res.data?.data ?? res.data);
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch users");
    }
  }
);

export const fetchUsersByRole = createAsyncThunk(
  "user/fetchByRole",
  async (roleId, { rejectWithValue }) => {
    try {
      const res = await userService.getUsersByRole(roleId);
      return normalizeArray(res.data?.data ?? res.data);
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch users by role");
    }
  }
);

export const fetchDashboardCount = createAsyncThunk(
  "user/fetchDashboardCount",
  async (_, { rejectWithValue }) => {
    try {
      const res = await userService.getDashboardCount();
      // API returns { status: "Success", data: { totalUsers, roleCounts: [...] } }
      return res.data?.data ?? res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch dashboard count");
    }
  }
);

export const createUser = createAsyncThunk(
  "user/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await userService.createUser(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to create user");
    }
  }
);

export const updateUser = createAsyncThunk(
  "user/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await userService.updateUser(id, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to update user");
    }
  }
);

export const deleteUser = createAsyncThunk(
  "user/delete",
  async (id, { rejectWithValue }) => {
    try {
      await userService.deleteUser(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to delete user");
    }
  }
);

const userSlice = createSlice({
  name: "USER",
  initialState: {
    users: [],
    dashboardCount: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchByRole
      .addCase(fetchUsersByRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersByRole.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsersByRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchDashboardCount
      .addCase(fetchDashboardCount.fulfilled, (state, action) => {
        state.dashboardCount = action.payload;
      })
      // create
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.error = action.payload;
      })
      // update
      .addCase(updateUser.fulfilled, (state, action) => {
        const idx = state.users.findIndex((u) => u.id === action.payload.id);
        if (idx !== -1) state.users[idx] = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.payload;
      })
      // delete
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
