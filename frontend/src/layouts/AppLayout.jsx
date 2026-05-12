import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { clearToken, getAuthorities, getSessionUsername } from "../lib/authStorage";
import {
  breadcrumbForPath,
  pageDescriptionForPath,
  roleLabelFromAuthorities,
  titleForPath,
} from "../lib/layoutTitle";
import Sidebar from "../components/ui/Sidebar";
import TopNavbar from "../components/ui/TopNavbar";

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function logout() {
    clearToken();
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="flex min-h-screen">
        {sidebarOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[1px] transition-opacity duration-200 md:hidden"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <Sidebar mobileOpen={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col md:pl-0">
          <TopNavbar
            title={titleForPath(pathname)}
            breadcrumbs={breadcrumbForPath(pathname)}
            pageDescription={pageDescriptionForPath(pathname)}
            userDisplayName={getSessionUsername() || "User"}
            userRoleLabel={roleLabelFromAuthorities(getAuthorities())}
            userInitial={getSessionUsername()}
            onMenuClick={() => setSidebarOpen(true)}
            onLogout={logout}
          />
          <main className="flex-1 p-4 transition-all duration-200 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
