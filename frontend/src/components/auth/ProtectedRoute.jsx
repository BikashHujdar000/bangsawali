import { Navigate, useLocation } from "react-router-dom";
import { getPasswordChangeRequired, getToken } from "../../lib/authStorage";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  if (!getToken()) {
    return <Navigate to="/login" replace state={{ from: location.pathname + (location.search || "") }} />;
  }
  if (getPasswordChangeRequired() && location.pathname !== "/account/change-password") {
    return <Navigate to="/account/change-password" replace />;
  }
  return children;
}
