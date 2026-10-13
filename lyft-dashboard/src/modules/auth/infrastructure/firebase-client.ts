import {
  getApps,
  initializeApp,
} from "firebase/app";

import {
  getAuth,
  type Auth,
} from "firebase/auth";

let auth: Auth | undefined;

export function getFirebaseAuth(): Auth {
  if (typeof window === "undefined") {
    throw new Error(
      "Firebase Auth debe inicializarse en el navegador.",
    );
  }

  if (auth) return auth;

  const config = {
    apiKey:
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId:
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  if (
    !config.apiKey ||
    !config.authDomain ||
    !config.projectId ||
    !config.appId
  ) {
    throw new Error(
      "La conexión con Firebase no está configurada.",
    );
  }

  const app =
    getApps().find((item) => item.name === "[DEFAULT]") ??
    initializeApp(config);

  auth = getAuth(app);

  return auth;
}