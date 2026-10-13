import type { AuthRepository } from "../domain/auth-repository";
import type { LoginValues } from "../domain/login";

import { validateLogin } from "./validate-login";

export function createAuthService(
  repository: AuthRepository,
) {
  return {
    async signIn(values: LoginValues) {
      const errors = validateLogin(values);

      if (errors.email || errors.password) {
        throw new Error(errors.email ?? errors.password);
      }

      return repository.signIn({
        ...values,
        email: values.email.trim(),
      });
    },

    signOut: () => repository.signOut(),

    observe: (
      ...args: Parameters<AuthRepository["observe"]>
    ) => repository.observe(...args),
  };
}

export type AuthService =
  ReturnType<typeof createAuthService>;