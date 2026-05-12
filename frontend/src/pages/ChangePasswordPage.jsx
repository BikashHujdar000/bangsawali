import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import Button from "../components/common/Button";
import PasswordInput from "../components/common/PasswordInput";
import FormField from "../components/common/FormField";
import Card from "../components/ui/Card";
import {
  clearToken,
  setAuthorities,
  setPasswordChangeRequired,
  setToken,
} from "../lib/authStorage";
import { getErrorMessage } from "../lib/http";
import { safePostLoginPath } from "../lib/postLoginRedirect";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      setToken(response.data.token);
      setAuthorities(response.data.authorities || []);
      setPasswordChangeRequired(false);
      navigate(safePostLoginPath(location.state?.afterAuth), { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Could not update password."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.07),_transparent_55%)]" />
      <header className="relative z-10 border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Bangsawali</p>
          <Link
            to="/"
            onClick={() => clearToken()}
            className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
          >
            Sign out
          </Link>
        </div>
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-xl ring-1 ring-slate-200/60" padding="p-8 md:p-10" title="Choose a new password">
          <p className="-mt-2 mb-6 text-sm leading-relaxed text-slate-600">
            For security, replace the initial or temporary password with one only you know. You need at least 8 characters.
          </p>
          <form onSubmit={submit} className="space-y-4">
            <FormField label="Current password" htmlFor="cp-current">
              <PasswordInput
                id="cp-current"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </FormField>
            <FormField label="New password" htmlFor="cp-new">
              <PasswordInput
                id="cp-new"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
              />
            </FormField>
            <FormField label="Confirm new password" htmlFor="cp-confirm">
              <PasswordInput
                id="cp-confirm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
              />
            </FormField>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit" variant="primary" disabled={loading} className="w-full">
              {loading ? "Saving…" : "Save and continue"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
