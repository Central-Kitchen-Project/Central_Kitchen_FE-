import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import feedbackService from "../services/feedbackService";
import { extractApiErrorMessage } from "../services/api";

const initialState = {
  listFeedbacks: [],
  loading: false,
  error: null,
};

const name = "feedback";

const getStatusCandidates = (status) => {
  const normalized = String(status || "").trim().toLowerCase();

  if (normalized === "underreview" || normalized === "under review") {
    return ["Under Review", "UnderReview"];
  }

  if (normalized === "received") return ["Received"];
  if (normalized === "resolved") return ["Resolved"];
  return [status];
};

// GET all feedbacks
export const fetchGetAllFeedback = createAsyncThunk(
  `${name}/fetchGetAllFeedback`,
  async () => {
    try {
      const response = await feedbackService.GetAll();
      return response.data.data;
    } catch (error) {
      console.log(error);
    }
  }
);

// GET feedbacks by status
export const fetchGetFeedbackByStatus = createAsyncThunk(
  `${name}/fetchGetFeedbackByStatus`,
  async (status) => {
    try {
      const response = await feedbackService.GetByStatus(status);
      return response.data.data;
    } catch (error) {
      console.log(error);
    }
  }
);

// POST create feedback
export const fetchCreateFeedback = createAsyncThunk(
  `${name}/fetchCreateFeedback`,
  async (data) => {
    try {
      const response = await feedbackService.Create(data);
      return response.data.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
);

// DELETE feedback
export const fetchDeleteFeedback = createAsyncThunk(
  `${name}/fetchDeleteFeedback`,
  async (id) => {
    try {
      await feedbackService.Delete(id);
      return id;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
);

// PUT update feedback status
export const fetchUpdateFeedbackStatus = createAsyncThunk(
  `${name}/fetchUpdateFeedbackStatus`,
  async ({ id, status }, { rejectWithValue }) => {
    const statusCandidates = getStatusCandidates(status);
    let lastError = null;

    for (const candidate of statusCandidates) {
      try {
        const response = await feedbackService.UpdateStatus(id, { status: candidate });
        return response.data?.data || { id, status: candidate };
      } catch (error) {
        lastError = error;
        if (error?.response?.status !== 400) break;
      }
    }

    console.log(lastError);
    return rejectWithValue(
      extractApiErrorMessage(lastError, "Cannot update feedback status")
    );
  }
);

const feedbackSlice = createSlice({
  name,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // GET all
    builder.addCase(fetchGetAllFeedback.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchGetAllFeedback.fulfilled, (state, action) => {
      state.listFeedbacks = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchGetAllFeedback.rejected, (state, action) => {
      state.error = action.error.message;
      state.loading = false;
    });

    // GET by status
    builder.addCase(fetchGetFeedbackByStatus.fulfilled, (state, action) => {
      state.listFeedbacks = action.payload;
    });

    // POST create -> thêm vào list
    builder.addCase(fetchCreateFeedback.fulfilled, (state, action) => {
      if (action.payload) {
        state.listFeedbacks = [action.payload, ...state.listFeedbacks];
      }
    });

    // DELETE -> xóa khỏi list
    builder.addCase(fetchDeleteFeedback.fulfilled, (state, action) => {
      state.listFeedbacks = state.listFeedbacks.filter(
        (item) => item.id !== action.payload
      );
    });

    // PUT status -> update item in list
    builder.addCase(fetchUpdateFeedbackStatus.fulfilled, (state, action) => {
      const payload = action.payload || {};
      const idx = state.listFeedbacks.findIndex((item) => item.id === payload.id);
      if (idx !== -1) {
        state.listFeedbacks[idx] = {
          ...state.listFeedbacks[idx],
          ...payload,
          status: payload.status || state.listFeedbacks[idx].status,
        };
      }
    });
    builder.addCase(fetchUpdateFeedbackStatus.rejected, (state, action) => {
      state.error = action.payload || action.error.message;
    });
  },
});

export default feedbackSlice.reducer;
