import { ScanLine, ShieldCheck } from "lucide-react";

export function LoginHero() {
  return (
    <aside className="login-hero flex flex-col px-7 py-6 text-white lg:min-h-dvh lg:px-16 lg:py-12">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-brand">
          <ScanLine size={25} aria-hidden="true" />
        </span>

        <div>
          <p className="text-xl font-bold tracking-tight">
            ARGUS<span className="text-pink-400">.</span>
          </p>

          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
            Lyft
          </p>
        </div>
      </div>

      <div className="my-auto hidden py-16 lg:block">
        <p className="mb-6 text-[11px] uppercase tracking-[0.22em] text-pink-300">
          Inteligencia de amenazas
        </p>

        <h2 className="text-5xl leading-[1.1] font-semibold tracking-tight xl:text-6xl">
          Menos ruido.
          <br />
          <span className="text-pink-300">
            Más contexto.
          </span>
        </h2>

        <p className="mt-6 max-w-sm text-sm leading-7 text-slate-300">
          Un espacio para entender las vulnerabilidades,
          reconocer lo importante y decidir el siguiente paso.
        </p>

        <div
          aria-hidden="true"
          className="relative my-12 flex h-56 items-center justify-center"
        >
          <div className="absolute size-56 rounded-full border border-white/10" />
          <div className="absolute size-40 rounded-full border border-pink-300/20" />

          <div className="rounded-3xl border border-white/15 bg-white/5 p-6 shadow-2xl">
            <ShieldCheck
              size={52}
              strokeWidth={1.3}
              className="text-pink-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
          {["Identifica", "Prioriza", "Mitiga"].map(
            (label, index) => (
              <div key={label} className="flex items-center gap-3">
                <span className="font-mono text-xs text-slate-500">
                  0{index + 1}
                </span>

                <span className="text-sm text-slate-200">
                  {label}
                </span>
              </div>
            ),
          )}
        </div>
      </div>

      <p className="hidden text-xs text-slate-400 lg:block">
        Tecnológico de Monterrey 
      </p>
    </aside>
  );
}