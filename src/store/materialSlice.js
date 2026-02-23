import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import materialService from "../services/materialService";




const initialState = {
  listMaterials: []
};

const name = "material";

export const fetchGetMaterialRequest = createAsyncThunk(
  `${name}/fetchGetMaterialRequest`,
  async () => {
    try {
      const response = await materialService.GetAll();
      console.log("response", response);
      return response.data.data;
    } catch (error) {
      console.log(error);
    }
  }
);

const materialSlice = createSlice({
  name,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchGetMaterialRequest.fulfilled, (state, action) => {
      state.listMaterials = action.payload;
    });
  }
});

export default materialSlice.reducer;