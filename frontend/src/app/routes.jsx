import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import AdminPanelPage from "../pages/AdminPanelPage";
import FamiliesAddPage from "../pages/FamiliesAddPage";
import FamiliesDetailPage from "../pages/FamiliesDetailPage";
import FamiliesViewPage from "../pages/FamiliesViewPage";
import LoginPage from "../pages/LoginPage";
import PublicHome from "../pages/PublicHome";
import PersonsPage from "../pages/PersonsPage";
import PersonDetailPage from "../pages/PersonDetailPage";
import PlaceholderPage from "../pages/PlaceholderPage";
import TransactionsPage from "../pages/TransactionsPage";
import ChangePasswordPage from "../pages/ChangePasswordPage";
import UserCreatePage from "../pages/UserCreatePage";
import UsersPage from "../pages/UsersPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicHome />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/account/change-password"
        element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AdminPanelPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/families"
        element={
          <ProtectedRoute>
            <Navigate to="/families/view" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/families/add"
        element={
          <ProtectedRoute>
            <FamiliesAddPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/families/view"
        element={
          <ProtectedRoute>
            <FamiliesViewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/families/:id"
        element={
          <ProtectedRoute>
            <FamiliesDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/families/:id/edit"
        element={
          <ProtectedRoute>
            <FamiliesAddPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/persons"
        element={
          <ProtectedRoute>
            <PersonsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/persons/:id"
        element={
          <ProtectedRoute>
            <PersonDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <TransactionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/create"
        element={
          <ProtectedRoute>
            <UserCreatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Reports" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit-logs"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Audit Logs" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <PlaceholderPage title="Settings" />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
