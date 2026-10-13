import { ShieldCheck } from "lucide-react";
import { LoginForm } from "./components/LoginForm";
import { LoginHero } from "./components/LoginHero";
import Link from "next/link";

export function LoginView() {
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <LoginHero />

      <section
        aria-labelledby="login-title"
        className="flex flex-col justify-center px-7 py-10 sm:px-12 lg:px-20"
      >
        <div className="mx-auto w-full max-w-[390px]">
          <div className="mb-6 flex size-12 items-center justify-center rounded-xl border border-line bg-white text-brand">
            <ShieldCheck
              size={24}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>

          <h1
            id="login-title"
            className="text-4xl leading-tight font-semibold tracking-tight"
          >
            Bienvenido
            <br />
            de nuevo.
          </h1>

          <p className="mt-4 text-sm leading-6 text-muted">
            Ingresa a tu espacio de análisis y da seguimiento
            a lo que importa.
          </p>

          <LoginForm />

          <Link
  href="/dashboard"
  className="mt-3 flex min-h-11 items-center justify-center rounded-xl border border-line bg-white text-sm font-medium text-ink hover:bg-slate-50"
>
  Ver dashboard de demostración
</Link>

          <div className="mt-8 border-t border-line pt-6 text-xs leading-6">
            <p className="font-semibold">
              ¿Necesitas acceso?
            </p>

            <p className="text-muted">
              Solicita una cuenta al equipo del proyecto.
            </p>
          </div>

          <p className="mt-12 text-center text-[11px] text-muted">
            Prototipo académico · Acceso para el equipo
          </p>
        </div>
      </section>
    </main>
  );
}