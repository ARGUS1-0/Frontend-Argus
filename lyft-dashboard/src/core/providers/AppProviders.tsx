"use client";

import {
  useState,
  type ReactNode,
} from "react";

import { Provider } from "react-redux";

import { makeStore } from "@/core/store";
import { authService } from "@/core/composition/auth";

import { AuthProvider } from "@/modules/auth/presentation/AuthProvider";

export function AppProviders({
  children,
}: {
  children: ReactNode;
}) {
  const [store] = useState(makeStore);

  return (
    <Provider store={store}>
      <AuthProvider service={authService}>
        {children}
      </AuthProvider>
    </Provider>
  );
}