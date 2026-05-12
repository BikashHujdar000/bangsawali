import AppLayout from "../layouts/AppLayout";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import PasswordInput from "../components/common/PasswordInput";
import FormField from "../components/common/FormField";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { DataTable, DataTableHead, DataTableHeaderCell, DataTableRow, DataTableCell } from "../components/ui/DataTable";
import { deactivateAdminUser, listAdminUsers, resetAdminUserPassword } from "../services/adminUserService";
import { getAuthorities } from "../lib/authStorage";
import { getErrorMessage } from "../lib/http";

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetTarget, setResetTarget] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetting, setResetting] = useState(false);

  const isSuperAdmin = useMemo(() => getAuthorities().includes("ROLE_SUPER_ADMIN"), []);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const usersData = await listAdminUsers();
      setUsers(usersData);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load user management data."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const closeResetModal = useCallback(() => {
    setResetTarget(null);
    setNewPassword("");
    setConfirmPassword("");
    setResetError("");
  }, []);

  useEffect(() => {
    if (!resetTarget) return undefined;
    function onKey(e) {
      if (e.key === "Escape") closeResetModal();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resetTarget, closeResetModal]);

  async function onDeactivate(userId) {
    setError("");
    setSuccess("");
    try {
      await deactivateAdminUser(userId);
      setSuccess("User deactivated.");
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err, "Could not deactivate user."));
    }
  }

  async function onSubmitReset(event) {
    event.preventDefault();
    setResetError("");
    if (newPassword.length < 8) {
      setResetError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }
    setResetting(true);
    try {
      await resetAdminUserPassword(resetTarget.id, newPassword);
      setSuccess(`Temporary password set for ${resetTarget.username}. They must change it on next sign-in.`);
      closeResetModal();
      await loadData();
    } catch (err) {
      setResetError(getErrorMessage(err, "Could not reset password."));
    } finally {
      setResetting(false);
    }
  }

  return (
    <AppLayout>
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      {success ? <p className="mb-3 text-sm text-emerald-700">{success}</p> : null}

      <Card
        title="User directory"
        headerRight={
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={loadData}>
              Refresh
            </Button>
            <Link
              to="/users/create"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              Create user
            </Link>
          </div>
        }
      >
        {!loading && users.length === 0 ? <p className="text-sm text-[#64748B]">No users found.</p> : null}
        {!loading && users.length > 0 ? (
          <DataTable flush>
            <DataTableHead>
              <DataTableHeaderCell>Username</DataTableHeaderCell>
              <DataTableHeaderCell>Branch</DataTableHeaderCell>
              <DataTableHeaderCell>Role</DataTableHeaderCell>
              <DataTableHeaderCell>Permissions</DataTableHeaderCell>
              <DataTableHeaderCell>Status</DataTableHeaderCell>
              <DataTableHeaderCell>Actions</DataTableHeaderCell>
            </DataTableHead>
            <tbody>
              {users.map((user) => (
                <DataTableRow key={user.id}>
                  <DataTableCell>
                    <span className="flex items-center gap-2 font-medium">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3b82f6] to-[#2563EB] text-xs font-bold text-white">
                        {(user.username || "?").slice(0, 1).toUpperCase()}
                      </span>
                      {user.username}
                    </span>
                  </DataTableCell>
                  <DataTableCell className="text-[#64748B]">{user.branchCode || "—"}</DataTableCell>
                  <DataTableCell>
                    <Badge variant="role" className="normal-case">
                      {user.role || "—"}
                    </Badge>
                  </DataTableCell>
                  <DataTableCell>
                    <span className="text-xs text-[#64748B]">{(user.permissions || []).join(", ") || "—"}</span>
                  </DataTableCell>
                  <DataTableCell>
                    {user.active ? (
                      <Badge variant="success" className="normal-case">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="neutral" className="normal-case">
                        Inactive
                      </Badge>
                    )}
                  </DataTableCell>
                  <DataTableCell>
                    <div className="flex flex-wrap gap-2">
                      {isSuperAdmin && user.active ? (
                        <Button type="button" variant="secondary" size="sm" onClick={() => setResetTarget(user)}>
                          Reset password
                        </Button>
                      ) : null}
                      {user.active ? (
                        <Button type="button" variant="dangerSoft" size="sm" onClick={() => onDeactivate(user.id)}>
                          Deactivate
                        </Button>
                      ) : (
                        <span className="text-xs text-[#64748B]">—</span>
                      )}
                    </div>
                  </DataTableCell>
                </DataTableRow>
              ))}
            </tbody>
          </DataTable>
        ) : null}
      </Card>

      {resetTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
          onClick={closeResetModal}
          role="presentation"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-slate-900/5"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-password-title"
          >
            <h2 id="reset-password-title" className="text-lg font-semibold text-slate-900">
              Reset password for {resetTarget.username}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Set a temporary password and share it through a secure channel. This user must choose a new password the next
              time they sign in.
            </p>
            <form className="mt-5 space-y-4" onSubmit={onSubmitReset}>
              <FormField label="New temporary password" htmlFor="reset-new">
                <PasswordInput
                  id="reset-new"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </FormField>
              <FormField label="Confirm password" htmlFor="reset-confirm">
                <PasswordInput
                  id="reset-confirm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </FormField>
              {resetError ? <p className="text-sm text-red-600">{resetError}</p> : null}
              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
                <Button type="button" variant="secondary" onClick={closeResetModal}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={resetting}>
                  {resetting ? "Saving…" : "Save temporary password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AppLayout>
  );
}
