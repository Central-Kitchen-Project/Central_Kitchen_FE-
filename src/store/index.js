import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import itemslice from "./itemSlice";
import orderSlice from "./orderSlice";
import materialSlice from "./materialSlice";
import feedbackSlice from "./feedbackSlice";
import inventorySlice from "./inventorySlice";
import inventoryTransactionSlice from "./inventoryTransactionSlice";
import userSlice from "./userSlice";
import roleSlice from "./roleSlice";
const store = configureStore({
  reducer: {
    AUTH: authSlice,
    ITEM: itemslice,
    ORDER: orderSlice,
    MATERIAL: materialSlice,
    FEEDBACK: feedbackSlice,
    INVENTORY: inventorySlice,
    INVENTORY_TRANSACTION: inventoryTransactionSlice,
    USER: userSlice,
    ROLE: roleSlice,
  },
});
export default store;