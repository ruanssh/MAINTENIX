import { http } from "../api/http";
import type {
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "../types/auth";
import { setToken, clearToken } from "../api/token";

export const AuthService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await http.post<LoginResponse>("/auth/login", payload);
    setToken(data.access_token);
    return data;
  },

  async resetPassword(
    payload: ResetPasswordRequest,
  ): Promise<ResetPasswordResponse> {
    const { data } = await http.post<ResetPasswordResponse>(
      "/auth/reset-password",
      payload,
    );
    return data;
  },

  logout(): void {
    clearToken();
  },
};
