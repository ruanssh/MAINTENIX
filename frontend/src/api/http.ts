import axios from "axios";
import { env } from "../config/env";
import { getToken, clearToken } from "./token";

export const http = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 20_000,
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (error) => {
    // Ex: token expirado / inválido
    if (error?.response?.status === 401) {
      clearToken();
      // você pode emitir evento/redirect aqui depois
    }
    return Promise.reject(error);
  },
);
