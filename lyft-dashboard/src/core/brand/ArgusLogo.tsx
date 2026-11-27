"use client";

import { useId } from "react";

interface LogoProps {
  size?: number;
  className?: string;
  /** Texto accesible. Sin él, el logo es decorativo (aria-hidden). */
  title?: string;
}

/**
 * Ojo de Argus, el gigante de los cien ojos que todo lo vigila.
 * Es el mismo dibujo que src/app/icon.svg (favicon).
 */
export function ArgusLogo({
  size = 40,
  className = "",
  title,
}: LogoProps) {
  // Ids únicos: varias instancias en la misma página no comparten degradados.
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const bg = `${id}-bg`;
  const iris = `${id}-iris`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0479a" />
          <stop offset="0.5" stopColor="#d91578" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <radialGradient id={iris} cx="0.4" cy="0.4" r="0.65">
          <stop offset="0" stopColor="#3b1d63" />
          <stop offset="1" stopColor="#141522" />
        </radialGradient>
      </defs>

      <rect width="64" height="64" rx="15" fill={`url(#${bg})`} />

      <g
        stroke="#fff"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.9"
      >
        <line x1="32" y1="8" x2="32" y2="13.5" />
        <line x1="18.5" y1="11.5" x2="21.5" y2="16.5" />
        <line x1="45.5" y1="11.5" x2="42.5" y2="16.5" />
      </g>

      <path
        d="M7 34 C16 20 48 20 57 34 C48 48 16 48 7 34 Z"
        fill="#fff"
      />
      <circle cx="32" cy="34" r="11" fill={`url(#${iris})`} />
      <circle
        cx="32"
        cy="34"
        r="11"
        fill="none"
        stroke="#d91578"
        strokeWidth="2.2"
      />
      <circle cx="32" cy="34" r="4.2" fill="#f0479a" />
      <circle cx="35.8" cy="30.2" r="2.4" fill="#fff" />
    </svg>
  );
}

interface WordmarkProps {
  size?: number;
  /** Línea pequeña bajo el nombre (p. ej. "Lyft · SOC"). */
  subtitle?: string;
  /** light: texto blanco, para fondos oscuros. */
  tone?: "light" | "dark";
}

/** Logo con el nombre ARGUS. */
export function ArgusWordmark({
  size = 40,
  subtitle,
  tone = "light",
}: WordmarkProps) {
  return (
    <span className="flex items-center gap-3">
      <ArgusLogo
        size={size}
        className="shrink-0 drop-shadow-[0_6px_16px_rgba(217,21,120,0.35)]"
      />

      <span className="leading-none">
        <span
          className={`block text-xl font-bold tracking-tight ${
            tone === "light" ? "text-white" : "text-ink"
          }`}
        >
          ARGUS<span className="text-pink-400">.</span>
        </span>

        {subtitle ? (
          <span
            className={`mt-1.5 block text-[10px] uppercase tracking-[0.18em] ${
              tone === "light" ? "text-slate-400" : "text-muted"
            }`}
          >
            {subtitle}
          </span>
        ) : null}
      </span>
    </span>
  );
}
