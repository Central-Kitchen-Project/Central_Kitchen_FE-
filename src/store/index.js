import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import itemslice from "./itemSlice";
import orderSlice from "./orderSlice";
const store = configureStore({
  reducer: {
    AUTH: authSlice,
    ITEM: itemslice,
    ORDER: orderSlice,
    // Add other reducers here
    
  },
});
export default store;