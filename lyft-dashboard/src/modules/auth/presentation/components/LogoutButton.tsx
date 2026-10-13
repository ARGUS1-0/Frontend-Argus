"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "../AuthProvider";

export function LogoutButton() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      await signOut();
      router.replace("/");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No pudimos cerrar la sesión.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 border-t border-white/10 pt-5">
      <p className="break-all text-xs text-slate-300">
        {user?.email}
      </p>

      <button
        type="button"
        onClick={handleLogout}
        disabled={busy}
        className="mt-3 w-full rounded-xl border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-50"
      >
        {busy ? "Cerrando sesión…" : "Cerrar sesión"}
      </button>

      {error && (
        <p
          role="alert"
          className="mt-3 text-xs text-rose-300"
        >
          {error}
        </p>
      )}
    </div>
  );
}