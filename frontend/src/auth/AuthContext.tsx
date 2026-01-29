import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getToken, setToken, clearToken } from "../api/token";
import { AuthService } from "../services/auth.service";
import { UsersService } from "../services/users.service";
import type { User } from "../types/users";

type AuthContextValue = {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(() => {
    const stored = sessionStorage.getItem("auth:user");
    if (!stored) return null;
    try {
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  });

  const isAuthenticated = Boolean(getToken());

  const refreshMe = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      sessionStorage.removeItem("auth:user");
      return;
    }
    const me = await UsersService.me();
    setUser(me);
    sessionStorage.setItem("auth:user", JSON.stringify(me));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { access_token } = await AuthService.login({ email, password });
      setToken(access_token);
      await refreshMe();
    },
    [refreshMe],
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    sessionStorage.removeItem("auth:user");
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await refreshMe();
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshMe]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      loading,
      user,
      login,
      logout,
      refreshMe,
    }),
    [isAuthenticated, loading, user, login, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
