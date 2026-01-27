import { Route, Routes, Navigate } from "react-router-dom";
import { LoginPage } from "../pages/Login/LoginPage";
import { HomePage } from "../pages/Home/HomePage";
import { CreateUserPage } from "../pages/Users/CreateUserPage";
import { ProtectedRoute } from "../auth/ProtectedRoute";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      {/* Hidden route: not linked anywhere */}
      <Route
        path="/internal/users/new"
        element={
          <ProtectedRoute>
            <CreateUserPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
