import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/**
 * @param {{ label: string, to?: string }[]} breadcrumbs
 */
export default function TopNavbar({
  title,
  breadcrumbs = [],
  pageDescription = "",
  userDisplayName = "",
  userRoleLabel = "",
  userInitial = "",
  onMenuClick,
  onLogout,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const initial = (userInitial || userDisplayName || "?").trim().slice(0, 1).toUpperCase();

  useEffect(() => {
    function handle(e) {
      if (!open) return;
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-lg">
      <div className="flex items-start justify-between gap-4 px-4 py-4 md:items-center md:px-8 md:py-3.5">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <button
            type="button"
            className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 md:hidden"
            aria-label="Open menu"
            onClick={onMenuClick}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="min-w-0 flex-1 border-l-0 pl-0 md:border-l md:border-slate-200 md:pl-5">
            {breadcrumbs.length > 0 ? (
              <nav className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs font-medium text-slate-500" aria-label="Breadcrumb">
                {breadcrumbs.map((crumb, i) => (
                  <span key={`${crumb.label}-${i}`} className="flex items-center gap-1">
                    {i > 0 ? <span className="text-slate-300">/</span> : null}
                    {crumb.to && i < breadcrumbs.length - 1 ? (
                      <Link to={crumb.to} className="transition hover:text-slate-800">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className={i === breadcrumbs.length - 1 ? "text-slate-700" : ""}>{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            ) : null}
            <h1 className="mt-1 truncate text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">{title}</h1>
            {pageDescription ? <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">{pageDescription}</p> : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-3">
          <span className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200/70 sm:inline-flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            System healthy
          </span>

          <button
            type="button"
            className="relative hidden rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 sm:inline-flex"
            aria-label="Notifications"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
              3
            </span>
          </button>

          <div className="relative flex items-center gap-2" ref={menuRef}>
            <div className="hidden text-right leading-tight sm:block">
              <p className="text-sm font-semibold text-slate-900">{userDisplayName || "User"}</p>
              <p className="text-xs text-slate-500">{userRoleLabel || "—"}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3b82f6] to-[#2563EB] text-sm font-bold text-white shadow-md ring-2 ring-white transition hover:shadow-lg"
              aria-expanded={open}
              aria-haspopup="true"
              aria-label="Account menu"
            >
              {initial}
            </button>
            {open ? (
              <div className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl ring-1 ring-slate-900/5">
                <Link
                  to="/settings"
                  className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  Settings
                </Link>
                <button
                  type="button"
                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                  onClick={() => {
                    setOpen(false);
                    onLogout();
                  }}
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
