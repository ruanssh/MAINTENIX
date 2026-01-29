import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { JSX } from "react";

type Props = {
  children: JSX.Element;
  requireAdmin?: boolean;
};

export function ProtectedRoute({ children, requireAdmin }: Props) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">Carregando...</div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requireAdmin && user?.role !== 1) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}
