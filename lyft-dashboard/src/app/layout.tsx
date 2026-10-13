import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";

import { AppProviders } from "@/core/providers/AppProviders";

import "./globals.css";

export const metadata: Metadata = {
  title: "ThreatLens | Reto Lyft",
  description:
    "Dashboard académico de gestión de vulnerabilidades.",
};

function LoadingApplication() {
  return (
    <main
      role="status"
      className="flex min-h-dvh items-center justify-center bg-canvas px-6"
    >
      <div className="text-center">
        <p className="text-2xl font-bold text-brand">
          ThreatLens
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