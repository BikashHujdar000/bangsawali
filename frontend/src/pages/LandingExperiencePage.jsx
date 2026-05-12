import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import MarketingPanel from "../components/landing/MarketingPanel";
import BangsaLogoHex from "../components/marketing/BangsaLogoHex";
import PasswordInput from "../components/common/PasswordInput";
import {
  getToken,
  setAuthorities,
  setPasswordChangeRequired,
  setSessionUsername,
  setToken,
} from "../lib/authStorage";
import { safePostLoginPath } from "../lib/postLoginRedirect";

const features = [
  { t: "Secure Record Management", icon: "document" },
  { t: "Relationship Mapping", icon: "link" },
  { t: "Centralized Administration", icon: "lock" },
  { t: "Reliable & Easy to Use", icon: "spark" },
];

function FeatureIcon({ name }) {
  const c = "h-4 w-4";
  if (name === "document")
    return (
      <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" strokeLinejoin="round" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" />
      </svg>
    );
  if (name === "lock")
    return (
      <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 018 0v3" strokeLinecap="round" />
      </svg>
    );
  if (name === "link")
    return (
      <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path d="M10 13a5 5 0 007.07 0l1-1a5 5 0 00-7.07-7.07l-.5.5M14 11a5 5 0 00-7.07 0l-1 1a5 5 0 007.07 7.07l.5-.5" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 3v2M5.6 5.6l1.4 1.4M3 12h2M5.6 18.4l1.4-1.4M12 19v2M18.4 18.4l-1.4-1.4M19 12h2M18.4 5.6l-1.4 1.4" strokeLinecap="round" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function MarketingContent() {
  return (
    <MarketingPanel className="h-full min-h-[420px] md:min-h-full">
      <div className="flex flex-1 flex-col p-8 md:p-10 lg:p-12">
        <div className="flex items-start gap-4">
          <BangsaLogoHex className="h-14 w-14 shrink-0 drop-shadow md:h-16 md:w-16" />
          <div className="min-w-0">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.28em] text-white">BANGSAWALI</p>
            <p className="mt-2 text-xl font-bold leading-snug text-blue-100 md:text-2xl">Digital Family Management System</p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-blue-50/95">
              A secure and centralized platform to manage family records, relationships and generations with trust and
              transparency.
            </p>
          </div>
        </div>
        <ul className="mt-10 max-w-md space-y-3">
          {features.map(({ t, icon }) => (
            <li key={t} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#2563eb] text-white shadow-md ring-1 ring-white/20">
                <FeatureIcon name={icon} />
              </span>
              <span className="text-[0.9375rem] font-medium text-white">{t}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-start gap-2 border-t border-white/10 pt-8 text-xs text-blue-100/90">
          <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
            <path d="M12 3l8 4v5c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V7l8-4z" strokeLinejoin="round" />
          </svg>
          <span>Your data is protected with enterprise-grade security.</span>
        </div>
      </div>
    </MarketingPanel>
  );
}

function RightSideDecoration() {
  return (
    <div className="pointer-events-none absolute bottom-0 right-0 overflow-hidden text-slate-300" aria-hidden>
      <svg className="h-56 w-56 translate-x-1/4 translate-y-1/4 opacity-[0.12]" viewBox="0 0 200 200" fill="none">
        <path
          d="M40 160c20-40 60-50 100-30s70 10 90-20M20 120c30-20 70-10 100 20M60 40c40 20 80 40 120 20"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <path
          d="M120 180c-10-50 10-90 50-110M140 20c20 40 10 80-20 110"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}

export default function LandingExperiencePage({ focusSignIn = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const afterLogin = safePostLoginPath(location.state?.from);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/auth/login", { username, password });
      setToken(response.data.token);
      setAuthorities(response.data.authorities || []);
      setSessionUsername(response.data.username || username);
      setPasswordChangeRequired(Boolean(response.data.passwordChangeRequired));
      if (response.data.passwordChangeRequired) {
        navigate("/account/change-password", { replace: true, state: { afterAuth: afterLogin } });
      } else {
        navigate(afterLogin, { replace: true });
      }
    } catch {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  if (getToken()) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-[100dvh] min-h-screen w-full flex-col items-center justify-center bg-[#f5f7fb] px-4 py-8 sm:px-6 sm:py-10">
      <div className="w-full max-w-[1180px]">
        <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_20px_60px_-24px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/90">
          <div className="grid w-full items-stretch md:min-h-[min(85vh,640px)] md:grid-cols-2">
            <div className="min-h-0 md:border-r md:border-slate-200/80">
              <MarketingContent />
            </div>
            <div className="relative flex min-h-[420px] flex-col bg-white md:min-h-0">
              <RightSideDecoration />
              <div className="relative flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 md:px-12 md:py-12 lg:px-14">
                {focusSignIn ? (
                  <div className="mx-auto w-full max-w-[400px]">
                    <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800">
                      ← Back
                    </Link>
                    <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Welcome back</h2>
                    <p className="mt-2 text-sm text-slate-600">Sign in to continue to your account.</p>
                    <form className="mt-8 space-y-4" onSubmit={onSubmit}>
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500" htmlFor="land-user">
                          Username
                        </label>
                        <input
                          id="land-user"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                          placeholder="Enter username"
                          autoComplete="username"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500" htmlFor="land-pass">
                          Password
                        </label>
                        <div className="mt-1.5">
                          <PasswordInput
                            tone="landing"
                            id="land-pass"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            autoComplete="current-password"
                            required
                          />
                        </div>
                      </div>
                      {error ? <p className="text-sm text-red-600">{error}</p> : null}
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-[#1d4ed8] disabled:opacity-60"
                      >
                        {loading ? "Signing in…" : "Sign in"} <span aria-hidden>→</span>
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="mx-auto w-full max-w-[400px] text-center">
                    <div className="flex justify-center">
                      <span className="inline-flex rounded-full bg-sky-50 p-4 ring-1 ring-sky-100/80">
                        <BangsaLogoHex className="h-14 w-14 md:h-16 md:w-16" />
                      </span>
                    </div>
                    <p className="mt-8 text-lg font-medium text-slate-500">Welcome to</p>
                    <h1 className="mt-1 text-4xl font-bold tracking-tight text-slate-900 md:text-[2.75rem]">Bangsawali</h1>
                    <div className="mx-auto mt-4 h-px w-20 bg-slate-200" />
                    <p className="mt-4 text-base font-semibold text-[#2563eb]">Digital Family Management System</p>
                    <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-slate-600 md:text-[0.9375rem]">
                      Simplify the way you manage family information across generations. Get started by signing in to your
                      account.
                    </p>
                    <div className="mt-10">
                      <Link
                        to="/login"
                        className="inline-flex min-w-[240px] items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-10 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-[#1d4ed8]"
                      >
                        Get Started
                        <span aria-hidden>→</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              <footer className="relative mt-auto flex items-center justify-center gap-2 border-t border-slate-100 px-6 py-4 text-xs text-slate-500">
                <svg className="h-3.5 w-3.5 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V8a4 4 0 018 0v3" strokeLinecap="round" />
                </svg>
                <span>Secure · Reliable · Trusted</span>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
