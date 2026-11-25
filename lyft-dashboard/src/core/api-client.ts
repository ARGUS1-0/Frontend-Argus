"use client";

import axios from "axios";

import { getFirebaseAuth } from "../modules/auth/infrastructure/firebase-client";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use(async (config) => {
  if (!baseURL) {
    throw new Error("Configura NEXT_PUBLIC_API_BASE_URL para acceder a la API.");
  }

  const backend = new URL(baseURL);
  const isLocalHttp =
    backend.protocol === "http:" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(backend.hostname);

  if (backend.protocol !== "https:" && !isLocalHttp) {
    throw new Error("La API debe usar HTTPS, excepto en desarrollo local.");
  }

  config.baseURL = baseURL;
  const target = new URL(apiClient.getUri(config), backend);

  if (
    target.origin !== backend.origin ||
    target.username ||
    target.password ||
    config.auth
  ) {
    throw new Error("El cliente autenticado solo admite peticiones a la API configurada.");
  }

  const auth = getFirebaseAuth();
  await auth.authStateReady();

  const user = auth.currentUser;
  if (!user) {
    throw new Error("Inicia sesión para acceder a la API.");
  }

  const token = await user.getIdToken();
  config.headers.set("Authorization", `Bearer ${token}`, true);

  return config;
});