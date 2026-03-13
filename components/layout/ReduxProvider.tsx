"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { useEffect } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { setSession } from "@/lib/store/slices/sessionSlice";
import type { UserRole } from "@/types";

interface Props {
  children: React.ReactNode;
  session: {
    userId: string;
    name: string;
    email: string;
    role: UserRole;
    tenantId: string;
  } | null;
}

function SessionInitializer({ session }: { session: Props["session"] }) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (session) dispatch(setSession(session));
  }, [dispatch, session]);
  return null;
}

export default function ReduxProvider({ children, session }: Props) {
  return (
    <Provider store={store}>
      <SessionInitializer session={session} />
      {children}
    </Provider>
  );
}
