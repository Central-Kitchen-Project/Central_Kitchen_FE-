import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";

const store = configureStore({
  reducer: {
    AUTH: authSlice
    // Add other reducers here
    
  },
});
export default store;