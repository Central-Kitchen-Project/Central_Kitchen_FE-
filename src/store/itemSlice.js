import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import itemService from "../services/itemService";


const initialState = {
  listItems: []
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
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchGetAll.fulfilled, (state, action) => {
      state.listItems = action.payload;
    });
  }
});

export default itemSlice.reducer;