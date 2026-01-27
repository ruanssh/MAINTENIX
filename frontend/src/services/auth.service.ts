import { http } from "../api/http";
import type { LoginRequest, LoginResponse } from "../types/auth";
import { setToken, clearToken } from "../api/token";

export const AuthService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await http.post<LoginResponse>("/auth/login", payload);
    setToken(data.access_token);
    return data;
  },

  logout(): void {
    clearToken();
  },
};
