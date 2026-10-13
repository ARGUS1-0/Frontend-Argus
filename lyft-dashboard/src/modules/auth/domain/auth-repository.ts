import type { LoginValues } from "./login";

export interface AuthUser {
  id: string;
  email: string | null;
  displayName: string | null;
}

export interface AuthRepository {
  signIn(values: LoginValues): Promise<AuthUser>;

  signOut(): Promise<void>;

  observe(
    onChange: (user: AuthUser | null) => void,
    onError: (error: Error) => void,
  ): () => void;
}