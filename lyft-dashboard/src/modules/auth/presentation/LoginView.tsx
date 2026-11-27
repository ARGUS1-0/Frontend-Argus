import { ArgusLogo } from "@/core/brand/ArgusLogo";
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
          <ArgusLogo
            size={48}
            className="mb-6 drop-shadow-[0_8px_20px_rgba(217,21,120,0.25)]"
          />

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

          <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted">
            <span aria-hidden="true" className="h-px flex-1 bg-line" />
            o
            <span aria-hidden="true" className="h-px flex-1 bg-line" />
          </div>

          <Link href="/dashboard" className="btn btn-secondary h-11 w-full">
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