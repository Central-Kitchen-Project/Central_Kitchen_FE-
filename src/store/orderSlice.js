import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import orderService from "../services/orderService";



const initialState = {
  listOrders: []
};

const name = "item";

export const fetchGetOrder = createAsyncThunk(
  `${name}/fetchGetOrder`,
  async () => {
    try {
      const response = await orderService.GetAll();
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
    builder.addCase(fetchGetOrder.fulfilled, (state, action) => {
      state.listOrders = action.payload;
    });
  }
});

export default itemSlice.reducer;