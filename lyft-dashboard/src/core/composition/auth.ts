import { createAuthService } from "@/modules/auth/application/create-auth-service";

import { FirebaseAuthRepository } from "@/modules/auth/infrastructure/firebase-auth.repository";

export const authService = createAuthService(
  new FirebaseAuthRepository(),
);