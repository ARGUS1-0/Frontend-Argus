"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { AuthService } from "@/modules/auth/application/create-auth-service";
import type { AuthUser } from "@/modules/auth/domain/auth-repository";
import type { LoginValues } from "@/modules/auth/domain/login";

interface Session {
  user: AuthUser | null;
  status: "loading" | "ready" | "error";
  error: string | null;
}

interface AuthContextValue extends Session {
  signIn: (values: LoginValues) => Promise<void>;
  signOut: () => Promise<void>;
}

interface Props {
  service: AuthService;
  children: ReactNode;
}

const AuthContext =
  createContext<AuthContextValue | null>(null);

export function AuthProvider({
  service,
  children,
}: Props) {
  const [session, setSession] = useState<Session>({
    user: null,
    status: "loading",
    error: null,
  });

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = service.observe(
        (user) => {
          if (active) {
            setSession({
              user,
              status: "ready",
              error: null,
            });
          }
        },
        (error) => {
          if (active) {
            setSession({
              user: null,
              status: "error",
              error: error.message,
            });
          }
        },
      );
    } catch {
      setSession({
        user: null,
        status: "error",
        error:
          "No se pudo iniciar la autenticación. Revisa la configuración de Firebase.",
      });
    }

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [service]);

  async function signIn(values: LoginValues) {
    const user = await service.signIn(values);

    setSession({
      user,
      status: "ready",
      error: null,
    });
  }

  async function signOut() {
    await service.signOut();

    setSession({
      user: null,
      status: "ready",
      error: null,
    });
  }

  return (
    <AuthContext.Provider
      value={{
        ...session,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth debe usarse dentro de AuthProvider.",
    );
  }

  return context;
}