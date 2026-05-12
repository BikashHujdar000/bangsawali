import { Navigate } from "react-router-dom";
import { getToken } from "../lib/authStorage";
import LandingExperiencePage from "./LandingExperiencePage";

/** Public landing: marketing left, welcome right; Get Started opens /login with form on the right. */
export default function PublicHome() {
  if (getToken()) {
    return <Navigate to="/dashboard" replace />;
  }
  return <LandingExperiencePage />;
}
