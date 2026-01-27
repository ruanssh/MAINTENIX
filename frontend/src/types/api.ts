export type ApiError = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
};

export type Id = string; // BigInt vindo do backend como string
