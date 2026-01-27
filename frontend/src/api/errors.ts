import type { AxiosError } from "axios";
import type { ApiError } from "../types/api";

export function parseApiError(err: unknown): string {
  const ax = err as AxiosError<ApiError>;
  const data = ax?.response?.data;

  if (Array.isArray(data?.message)) return data.message.join(", ");
  if (typeof data?.message === "string") return data.message;

  if (ax?.message) return ax.message;
  return "Erro inesperado";
}
