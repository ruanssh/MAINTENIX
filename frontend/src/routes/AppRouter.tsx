import { Route, Routes, Navigate } from "react-router-dom";
import { LoginPage } from "../pages/Login/LoginPage";
import { HomePage } from "../pages/Home/HomePage";
import { CreateUserPage } from "../pages/Users/CreateUserPage";
import { MachinesListPage } from "../pages/Machines/MachinesListPage";
import { CreateMachinePage } from "../pages/Machines/CreateMachinePage";
import { EditMachinePage } from "../pages/Machines/EditMachinePage";
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

      <Route
        path="/machines"
        element={
          <ProtectedRoute>
            <MachinesListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/machines/new"
        element={
          <ProtectedRoute>
            <CreateMachinePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/machines/:id/edit"
        element={
          <ProtectedRoute>
            <EditMachinePage />
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
