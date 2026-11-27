import { ArgusLogo, ArgusWordmark } from "@/core/brand/ArgusLogo";

export function LoginHero() {
  return (
    <aside className="login-hero relative flex flex-col overflow-hidden px-7 py-6 text-white lg:min-h-dvh lg:px-16 lg:py-12">
      <div aria-hidden="true" className="login-grid absolute inset-0" />

      <div className="relative">
        <ArgusWordmark size={44} subtitle="Lyft" />
      </div>

      <div className="relative my-auto hidden py-16 lg:block">
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
          <div className="argus-pulse absolute size-56 rounded-full border border-pink-300/25" />
          <div className="argus-pulse argus-pulse-delay absolute size-56 rounded-full border border-violet-300/20" />
          <div className="absolute size-56 rounded-full border border-white/10" />
          <div className="absolute size-40 rounded-full border border-pink-300/20" />
          <div className="argus-sweep absolute size-56 rounded-full" />

          <div className="relative rounded-[28px] bg-white/5 p-3 ring-1 ring-white/15 backdrop-blur-sm">
            <ArgusLogo
              size={96}
              className="drop-shadow-[0_18px_40px_rgba(217,21,120,0.45)]"
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

      <p className="relative hidden text-xs text-slate-400 lg:block">
        Tecnológico de Monterrey 
      </p>
    </aside>
  );
}