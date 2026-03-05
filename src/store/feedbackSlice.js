import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import feedbackService from "../services/feedbackService";

const initialState = {
  listFeedbacks: [],
  loading: false,
  error: null,
};

const name = "feedback";

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
  },
});

export default feedbackSlice.reducer;
