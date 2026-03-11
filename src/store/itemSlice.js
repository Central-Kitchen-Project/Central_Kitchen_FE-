import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import itemService from "../services/itemService";


const initialState = {
  listItems: [],
  deletedIds: []
};

const name = "item";

export const fetchGetAll = createAsyncThunk(
  `${name}/fetchGetAll`,
  async ({ type = "", category = "" }) => {
    try {
      const response = await itemService.GetAll(type, category);
      console.log("response", response);

      return response.data.data;
    } catch (error) {
      console.log(error);
    }
  }
);

const itemSlice = createSlice({
  name,
  initialState,
  reducers: {
    removeItem: (state, action) => {
      state.listItems = (state.listItems || []).filter(item => item.id !== action.payload);
      if (!state.deletedIds.includes(action.payload)) {
        state.deletedIds.push(action.payload);
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchGetAll.fulfilled, (state, action) => {
      const all = action.payload || [];
      state.listItems = all.filter(item => !state.deletedIds.includes(item.id));
    });
  }
});

export const { removeItem } = itemSlice.actions;
export default itemSlice.reducer;