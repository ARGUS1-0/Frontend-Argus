"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";

import type {
  LoginErrors,
  LoginValues,
} from "../../domain/login";

import { validateLogin } from "../../application/validate-login";
import { useAuth } from "../AuthProvider";

const inputClass =
  "mt-2 h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 aria-invalid:border-rose-600 disabled:bg-slate-50";

export function LoginForm() {
  const router = useRouter();

  const {
    user,
    status,
    error: sessionError,
    signIn,
  } = useAuth();

  const [values, setValues] = useState<LoginValues>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState<LoginErrors>({});
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const blocked =
    busy || status !== "ready" || Boolean(user);

  useEffect(() => {
    if (status === "ready" && user) {
      router.replace("/dashboard");
    }
  }, [status, user, router]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (blocked) return;

    const validation = validateLogin(values);

    setErrors(validation);
    setMessage("");

    if (validation.email || validation.password) return;

    setBusy(true);

    try {
      await signIn(values);

      setValues((current) => ({
        ...current,
        password: "",
      }));
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "No pudimos iniciar sesión.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5"
    >
      <fieldset
        disabled={blocked}
        className="min-w-0 space-y-5"
      >
        <div>
          <label
            htmlFor="login-email"
            className="text-sm font-medium"
          >
            Correo electrónico
          </label>

          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={values.email}
            onChange={(event) =>
              setValues({
                ...values,
                email: event.target.value,
              })
            }
            aria-invalid={Boolean(errors.email)}
            aria-describedby={
              errors.email ? "login-email-error" : undefined
            }
            placeholder="tu@correo.com"
            className={inputClass}
          />

          {errors.email && (
            <p
              id="login-email-error"
              role="alert"
              className="mt-2 text-xs text-rose-700"
            >
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="text-sm font-medium"
          >
            Contraseña
          </label>

          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={values.password}
              onChange={(event) =>
                setValues({
                  ...values,
                  password: event.target.value,
                })
              }
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password
                  ? "login-password-error"
                  : undefined
              }
              placeholder="Ingresa tu contraseña"
              className={`${inputClass} pr-12`}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-pressed={showPassword}
              aria-label={
                showPassword
                  ? "Ocultar contraseña"
                  : "Mostrar contraseña"
              }
              className="absolute right-2 top-3 rounded-lg p-2 text-muted"
            >
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>

          {errors.password && (
            <p
              id="login-password-error"
              role="alert"
              className="mt-2 text-xs text-rose-700"
            >
              {errors.password}
            </p>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={values.rememberMe}
            onChange={(event) =>
              setValues({
                ...values,
                rememberMe: event.target.checked,
              })
            }
            className="size-4 accent-brand"
          />
          Recordarme en este dispositivo
        </label>

        <button
          type="submit"
          disabled={blocked}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {(busy || status === "loading") && (
            <LoaderCircle
              size={18}
              className="animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          )}

          {busy
            ? "Ingresando…"
            : status === "loading"
              ? "Verificando sesión…"
              : user
                ? "Abriendo dashboard…"
                : "Iniciar sesión"}
        </button>
      </fieldset>

      {(message || sessionError) && (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
        >
          {message || sessionError}
        </p>
      )}
    </form>
  );
}