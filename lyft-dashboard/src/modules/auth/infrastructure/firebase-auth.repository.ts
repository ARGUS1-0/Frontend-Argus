import { FirebaseError } from "firebase/app";

import {
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";

import type {
  AuthRepository,
  AuthUser,
} from "../domain/auth-repository";

import type { LoginValues } from "../domain/login";

import { getFirebaseAuth } from "./firebase-client";

function toUser(user: User): AuthUser {
  return {
    id: user.uid,
    email: user.email,
    displayName: user.displayName,
  };
}

function toAuthError(error: unknown): Error {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/invalid-login-credentials":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return new Error(
          "Correo o contraseña incorrectos.",
        );

      case "auth/invalid-email":
        return new Error(
          "El correo electrónico no es válido.",
        );

      case "auth/too-many-requests":
        return new Error(
          "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
        );

      case "auth/network-request-failed":
        return new Error(
          "No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.",
        );

      case "auth/user-disabled":
        return new Error(
          "Esta cuenta está deshabilitada. Contacta al administrador.",
        );

      case "auth/operation-not-allowed":
      case "auth/invalid-api-key":
      case "auth/app-not-authorized":
      case "auth/configuration-not-found":
        return new Error(
          "El inicio de sesión no está disponible. Contacta al administrador.",
        );

      case "auth/web-storage-unsupported":
        return new Error(
          "El navegador no permite guardar la sesión. Revisa sus permisos de almacenamiento.",
        );
    }
  }

  return new Error(
    "No pudimos completar la operación. Inténtalo de nuevo.",
  );
}

export class FirebaseAuthRepository
  implements AuthRepository
{
  async signIn(
    values: LoginValues,
  ): Promise<AuthUser> {
    try {
      const auth = getFirebaseAuth();

      await setPersistence(
        auth,
        values.rememberMe
          ? browserLocalPersistence
          : browserSessionPersistence,
      );

      const result = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password,
      );

      return toUser(result.user);
    } catch (error) {
      throw toAuthError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(getFirebaseAuth());
    } catch (error) {
      throw toAuthError(error);
    }
  }

  observe(
    onChange: (user: AuthUser | null) => void,
    onError: (error: Error) => void,
  ) {
    return onAuthStateChanged(
      getFirebaseAuth(),
      (user) => {
        onChange(user ? toUser(user) : null);
      },
      (error) => {
        onError(toAuthError(error));
      },
    );
  }
}