import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { UserRole } from "@/types";

interface SessionState {
  userId: string | null;
  name: string | null;
  email: string | null;
  role: UserRole | null;
  tenantId: string | null;
}

const initialState: SessionState = {
  userId: null,
  name: null,
  email: null,
  role: null,
  tenantId: null,
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<SessionState>) {
      return action.payload;
    },
    clearSession() {
      return initialState;
    },
  },
});

export const { setSession, clearSession } = sessionSlice.actions;
export default sessionSlice.reducer;
