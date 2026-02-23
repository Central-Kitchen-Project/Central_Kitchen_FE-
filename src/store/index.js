import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import itemslice from "./itemSlice";
import orderSlice from "./orderSlice";
import materialSlice from "./materialSlice";
const store = configureStore({
  reducer: {
    AUTH: authSlice,
    ITEM: itemslice,
    ORDER: orderSlice,
    MATERIAL: materialSlice,
    
  },
});
export default store;