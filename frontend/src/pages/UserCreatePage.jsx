import AppLayout from "../layouts/AppLayout";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import PasswordInput from "../components/common/PasswordInput";
import FormField from "../components/common/FormField";
import Select from "../components/ui/Select";
import { createAdminUser } from "../services/adminUserService";
import { getErrorMessage } from "../lib/http";
import { listDistricts } from "../services/districtService";

const emptyForm = {
  username: "",
  password: "",
  branchCode: "",
  role: "USER",
};

export default function UserCreatePage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const districtData = await listDistricts();
        if (!cancelled) setDistricts(districtData);
      } catch {
        if (!cancelled) setDistricts([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function onChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onCreate(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await createAdminUser({
        username: form.username,
        password: form.password,
        branchCode: form.branchCode || null,
        active: true,
        role: form.role,
      });
      setForm(emptyForm);
      navigate("/users");
    } catch (err) {
      setError(getErrorMessage(err, "Could not create user."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-4xl">
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_20px_50px_-24px_rgba(15,23,42,0.18)] ring-1 ring-slate-900/5">
          <div className="h-1.5 bg-gradient-to-r from-[#3b82f6] via-[#6366f1] to-[#2563eb]" aria-hidden />

          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <aside className="border-b border-slate-100 bg-slate-50/90 p-6 md:p-8 lg:border-b-0 lg:border-r lg:border-slate-100">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">User management</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">Create a staff account</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Assign a role and optional branch. The person signs in with this username and must set a new password after
                first login.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                <li className="flex gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    1
                  </span>
                  <span>Pick a unique username and a temporary password you share securely.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    2
                  </span>
                  <span>They will be prompted to change it the first time they open the app.</span>
                </li>
              </ul>
            </aside>

            <div className="p-6 md:p-8">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Account details</h3>
                  <p className="mt-1 text-sm text-slate-500">All fields marked with context are required where noted.</p>
                </div>
                <Link
                  to="/users"
                  className="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  User directory
                </Link>
              </div>

              <form className="space-y-6" onSubmit={onCreate}>
                {error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
                ) : null}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <FormField label="Username" htmlFor="username">
                    <Input
                      id="username"
                      name="username"
                      value={form.username}
                      onChange={onChange}
                      placeholder="e.g. jdoe"
                      autoComplete="username"
                      required
                    />
                  </FormField>
                  <FormField label="Temporary password" htmlFor="password">
                    <PasswordInput
                      id="password"
                      name="password"
                      value={form.password}
                      onChange={onChange}
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      required
                      minLength={8}
                    />
                  </FormField>
                  <FormField label="Role" htmlFor="role">
                    <Select id="role" name="role" value={form.role} onChange={onChange} required>
                      <option value="SUPER_ADMIN">Super Admin</option>
                      <option value="ADMIN">Admin</option>
                      <option value="USER">User</option>
                    </Select>
                  </FormField>
                  <FormField label="Branch (district)" htmlFor="branchCode">
                    <Select id="branchCode" name="branchCode" value={form.branchCode} onChange={onChange}>
                      <option value="">Select district (optional)</option>
                      {districts.map((district) => (
                        <option key={district.id} value={district.code}>
                          {district.nameEn} ({district.nameNp})
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
                  <Button type="button" variant="secondary" onClick={() => navigate("/users")}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving ? "Creating…" : "Create user"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
