"use client";

import { useState } from "react";
import Link from "next/link";
import { ScanLine, Menu, X } from "lucide-react";
import { LogoutButton } from "@/modules/auth/presentation/components/LogoutButton";

import type { Vulnerability } from "@/modules/vulnerabilities/domain/vulnerability";

interface Props {
  history: Vulnerability[];
  onSelect: (id: string) => void;
}

export function Sidebar({
  history,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <aside className="bg-[#141522] px-5 py-6 text-white lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:w-64 lg:overflow-y-auto">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
        >
          <span className="rounded-xl bg-brand p-2">
            <ScanLine
              size={24}
              aria-hidden="true"
            />
          </span>

          <span className="text-xl font-bold tracking-tight">
            ARGUS
            <span className="text-pink-400">.</span>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="sidebar-content"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="rounded-lg p-2 lg:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        id="sidebar-content"
        className={`${open ? "block" : "hidden"} lg:block`}
      >
        <p className="mt-8 text-[10px] uppercase tracking-widest text-slate-400">
          Espacio de análisis
        </p>

        <nav
          aria-label="Secciones del dashboard"
          className="mt-3 space-y-1"
        >
          {[
            ["#resumen", "Resumen"],
            ["#vulnerabilidades", "Vulnerabilidades"],
            ["#mitigacion", "Mitigación"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-3 text-sm text-slate-200 hover:bg-white/10"
            >
              {label}
            </a>
          ))}
        </nav>

        <h2 className="mt-8 border-t border-white/10 pt-6 text-xs font-semibold text-slate-300">
          Historial de hallazgos
        </h2>

        <ul className="mt-3 space-y-2">
          {history.map((item) => (
            <li key={item.id}>
              <a
                href="#mitigacion"
                onClick={() => {
                  onSelect(item.id);
                  setOpen(false);
                }}
                className="block rounded-xl px-3 py-3 hover:bg-white/5"
              >
                <time
                  dateTime={item.detectedAt}
                  className="text-[10px] text-slate-400"
                >
                  {item.detectedAt}
                </time>

                <p className="mt-1 text-xs leading-5 text-slate-200">
                  {item.title}
                </p>

                <p className="mt-1 font-mono text-[10px] text-pink-300">
                  {item.id}
                </p>
              </a>
            </li>
          ))}
        </ul>

        <LogoutButton />
      </div>
    </aside>
  );
}