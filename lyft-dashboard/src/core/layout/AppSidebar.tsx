"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Menu,
  Radar,
  X,
  type LucideIcon,
} from "lucide-react";

import { ArgusWordmark } from "@/core/brand/ArgusLogo";
import { LogoutButton } from "@/modules/auth/presentation/components/LogoutButton";

export type AppPage = "dashboard" | "inteligencia";

export interface SidebarSection {
  href: string;
  label: string;
  icon: LucideIcon;
}

const PAGES: { id: AppPage; href: string; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "inteligencia", href: "/inteligencia", label: "Inteligencia de amenazas", icon: Radar },
];

interface Props {
  current: AppPage;
  /** Anclas de la página actual ("En esta página"). */
  sections: SidebarSection[];
  /** Contenido extra al final del menú (p. ej. historial). */
  children?: ReactNode;
}

/** Menú lateral común: páginas de Argus, secciones de la página actual y sesión. */
export function AppSidebar({ current, sections, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <aside className="sidebar-surface flex flex-col px-4 py-5 text-white lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:w-64 lg:overflow-y-auto">
      <div className="flex items-center justify-between gap-4 px-1">
        <Link href="/dashboard" aria-label="Argus, ir al dashboard">
          <ArgusWordmark size={38} subtitle="Lyft · SOC" />
        </Link>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="app-sidebar-content"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="rounded-lg p-2 lg:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        id="app-sidebar-content"
        className={`${open ? "flex" : "hidden"} min-h-0 flex-1 flex-col lg:flex`}
      >
        <p className="sidebar-label mt-8">Páginas</p>

        <nav aria-label="Páginas de Argus" className="mt-2 space-y-1">
          {PAGES.map(({ id, href, label, icon: Icon }) => {
            const active = id === current;

            return (
              <Link
                key={id}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`sidebar-link ${active ? "sidebar-link-active" : ""}`}
              >
                <Icon size={17} aria-hidden="true" className="sidebar-icon" />
                {label}
              </Link>
            );
          })}
        </nav>

        {sections.length > 0 ? (
          <>
            <p className="sidebar-label mt-7">En esta página</p>

            <nav aria-label="Secciones de esta página" className="mt-2 space-y-0.5">
              {sections.map(({ href, label, icon: Icon }, index) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="sidebar-link py-2 text-[13px]"
                >
                  <span className="w-5 font-mono text-[10px] text-slate-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Icon size={15} aria-hidden="true" className="sidebar-icon" />
                  {label}
                </a>
              ))}
            </nav>
          </>
        ) : null}

        {children}

        <div className="mt-auto">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
