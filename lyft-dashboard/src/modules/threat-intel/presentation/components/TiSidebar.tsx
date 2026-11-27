"use client";

import { ListOrdered, PieChart, Search } from "lucide-react";

import { AppSidebar } from "@/core/layout/AppSidebar";

const SECTIONS = [
  { href: "#resumen", label: "Resumen", icon: PieChart },
  { href: "#decisiones", label: "Decisiones", icon: ListOrdered },
  { href: "#buscar-cve", label: "Buscar CVE", icon: Search },
];

export function TiSidebar() {
  return (
    <AppSidebar current="inteligencia" sections={SECTIONS}>
      <p className="mx-3 mt-7 rounded-xl bg-white/5 p-3 text-[11px] leading-5 text-slate-400">
        Datos de solo lectura de la API de Lyft. El tier de Lyft se muestra
        junto a la prioridad de Argus; nunca la reemplaza.
      </p>
    </AppSidebar>
  );
}
