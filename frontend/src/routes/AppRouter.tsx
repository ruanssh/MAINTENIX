import { Route, Routes, Navigate } from "react-router-dom";
import { LoginPage } from "../pages/Login/LoginPage";
import { ForgotPasswordPage } from "../pages/Login/ForgotPasswordPage";
import { HomePage } from "../pages/Home/HomePage";
import { CreateUserPage } from "../pages/Users/CreateUserPage";
import { UsersListPage } from "../pages/Users/UsersListPage";
import { EditUserPage } from "../pages/Users/EditUserPage";
import { MachinesListPage } from "../pages/Machines/MachinesListPage";
import { CreateMachinePage } from "../pages/Machines/CreateMachinePage";
import { EditMachinePage } from "../pages/Machines/EditMachinePage";
import { MachineRecordsListPage } from "../pages/MaintenanceRecords/MachineRecordsListPage";
import { CreateMaintenanceRecordPage } from "../pages/MaintenanceRecords/CreateMaintenanceRecordPage";
import { FinishMaintenanceRecordPage } from "../pages/MaintenanceRecords/FinishMaintenanceRecordPage";
import { EditMaintenanceRecordPage } from "../pages/MaintenanceRecords/EditMaintenanceRecordPage";
import { UserInboxPage } from "../pages/MaintenanceRecords/UserInboxPage";
import { AccessDeniedPage } from "../pages/Access/AccessDeniedPage";
import { ProfilePage } from "../pages/Profile/ProfilePage";
import { ProtectedRoute } from "../auth/ProtectedRoute";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/inbox"
        element={
          <ProtectedRoute>
            <UserInboxPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/access-denied"
        element={
          <ProtectedRoute>
            <AccessDeniedPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/machines"
        element={
          <ProtectedRoute requireAdmin>
            <MachinesListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/machines/new"
        element={
          <ProtectedRoute requireAdmin>
            <CreateMachinePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/machines/:id/edit"
        element={
          <ProtectedRoute requireAdmin>
            <EditMachinePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/machines/:id/maintenance-records"
        element={
          <ProtectedRoute requireAdmin>
            <MachineRecordsListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/machines/:id/maintenance-records/new"
        element={
          <ProtectedRoute requireAdmin>
            <CreateMaintenanceRecordPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/machines/:id/maintenance-records/:recordId"
        element={
          <ProtectedRoute>
            <FinishMaintenanceRecordPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/machines/:id/maintenance-records/:recordId/edit"
        element={
          <ProtectedRoute requireAdmin>
            <EditMaintenanceRecordPage />
          </ProtectedRoute>
        }
      />

      {/* Hidden route: not linked anywhere */}
      <Route
        path="/users"
        element={
          <ProtectedRoute requireAdmin>
            <UsersListPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users/new"
        element={
          <ProtectedRoute requireAdmin>
            <CreateUserPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users/:id/edit"
        element={
          <ProtectedRoute requireAdmin>
            <EditUserPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
