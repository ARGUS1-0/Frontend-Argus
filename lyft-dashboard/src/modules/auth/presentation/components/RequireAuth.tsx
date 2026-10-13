"use client";

import {
  useEffect,
  type ReactNode,
} from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "../AuthProvider";

export function RequireAuth({
  children,
}: {
  children: ReactNode;
}) {
  const { user, status, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "ready" && !user) {
      router.replace("/");
    }
  }, [status, user, router]);

  if (status === "error") {
    return (
      <main className="p-10">
        <p role="alert">{error}</p>

        <Link
          href="/"
          className="mt-4 inline-block text-brand"
        >
          Volver al login
        </Link>
      </main>
    );
  }

  if (status !== "ready" || !user) {
    return (
      <main
        role="status"
        className="p-10 text-muted"
      >
        Verificando sesión…
      </main>
    );
  }

  return <>{children}</>;
}