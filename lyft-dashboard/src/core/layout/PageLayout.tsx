import type { ReactNode } from "react";

/** Encabezado de página: etiqueta, título, descripción y acciones a la derecha. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow: ReactNode;
  title: string;
  description: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-line pb-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 max-w-3xl">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
            {eyebrow}
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        </div>

        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>

      {children}
    </header>
  );
}

/**
 * Sección numerada de una página (01, 02…). El número y el título ayudan a
 * ubicar cada parte; el id sirve de ancla para el menú lateral.
 */
export function PageSection({
  id,
  index,
  title,
  description,
  actions,
  children,
}: {
  id: string;
  index: number;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const headingId = `${id}-titulo`;

  return (
    <section id={id} aria-labelledby={headingId} className="scroll-mt-6 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-ink font-mono text-[11px] font-semibold text-white"
          >
            {String(index).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <h2 id={headingId} className="text-lg font-semibold tracking-tight">
              {title}
            </h2>
            {description ? (
              <p className="mt-0.5 text-xs leading-5 text-muted">{description}</p>
            ) : null}
          </div>
        </div>

        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>

      {children}
    </section>
  );
}

/** Título interno de una tarjeta, con ícono opcional. */
export function CardTitle({
  icon,
  title,
  description,
  actions,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        {icon ? (
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-brand"
          >
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <h3 className="font-semibold">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs leading-5 text-muted">{description}</p>
          ) : null}
        </div>
      </div>

      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
