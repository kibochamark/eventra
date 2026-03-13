import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./slices/uiSlice";
import sessionReducer from "./slices/sessionSlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    session: sessionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
