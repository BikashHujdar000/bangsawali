import { Navigate, useLocation } from "react-router-dom";
import { getToken } from "../lib/authStorage";
import LandingExperiencePage from "./LandingExperiencePage";
import { safePostLoginPath } from "../lib/postLoginRedirect";

/** Same split card as home; right column is the sign-in form (marketing stays on the left). */
export default function LoginPage() {
  const location = useLocation();
  const afterLogin = safePostLoginPath(location.state?.from);

  if (getToken()) {
    return <Navigate to={afterLogin} replace />;
  }
  return <LandingExperiencePage focusSignIn />;
}
