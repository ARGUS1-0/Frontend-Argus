import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";

import { ArgusLogo } from "@/core/brand/ArgusLogo";
import { AppProviders } from "@/core/providers/AppProviders";

import "./globals.css";

export const metadata: Metadata = {
  title: "Argus",
  description:
    "Argus: dashboard de gestión de vulnerabilidades del reto Lyft.",
};

function LoadingApplication() {
  return (
    <main
      role="status"
      className="flex min-h-dvh items-center justify-center bg-canvas px-6"
    >
      <div className="flex flex-col items-center text-center">
        <ArgusLogo size={56} className="argus-breathe" />

        <p className="mt-4 text-2xl font-bold tracking-tight text-ink">
          ARGUS<span className="text-brand">.</span>
        </p>

        <p className="mt-3 text-sm text-muted">
          Cargando aplicación…
        </p>
      </div>
    </main>
  );
}

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <Suspense fallback={<LoadingApplication />}>
          <AppProviders>
            {children}
          </AppProviders>
        </Suspense>
      </body>
    </html>
  );
}