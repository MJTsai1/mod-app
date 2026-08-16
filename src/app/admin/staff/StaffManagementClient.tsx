"use client";

import { useEffect, useState } from "react";
import { staffRoleValues, type StaffRole } from "@/lib/validation/staff";
import { TableSkeletonRows } from "@/components/admin/TableSkeletonRows";

interface StaffRow {
  id: string;
  email: string;
  display_name: string | null;
  role: StaffRole;
  created_at: string;
}

function generatePassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const values = crypto.getRandomValues(new Uint32Array(16));
  return Array.from(values, (v) => alphabet[v % alphabet.length]).join("");
}

export function StaffManagementClient({ currentStaffId }: { currentStaffId: string }) {
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(generatePassword());
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<StaffRole>("staff");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [lastCreated, setLastCreated] = useState<{ email: string; password: string } | null>(null);

  async function loadStaff() {
    setLoading(true);
    setListError(null);
    try {
      const res = await fetch("/api/admin/staff");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStaff(data.staff ?? []);
    } catch {
      setListError("Couldn't load the staff list.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Fetching the staff list on mount is the "external system" this effect
    // synchronizes with.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStaff();
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setLastCreated(null);

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName, role }),
      });
      const body = await res.json();

      if (!res.ok) {
        setFormError(body?.error ?? "Failed to create staff account.");
        return;
      }

      setLastCreated({ email, password });
      setEmail("");
      setDisplayName("");
      setRole("staff");
      setPassword(generatePassword());
      loadStaff();
    } catch {
      setFormError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm("Remove this person's dashboard access?")) return;
    try {
      const res = await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        alert(body?.error ?? "Failed to remove staff access.");
        return;
      }
      loadStaff();
    } catch {
      alert("Network error — please try again.");
    }
  }

  return (
    <div>
      <form onSubmit={handleCreate} className="card mb-8 p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Add a staff member</h2>

        {formError && (
          <div
            className="mb-4 rounded-xl border px-4 py-3 text-sm"
            style={{ borderColor: "var(--color-danger)", background: "var(--color-danger-bg)", color: "var(--color-danger)" }}
            role="alert"
          >
            {formError}
          </div>
        )}

        {lastCreated && (
          <div
            className="mb-4 rounded-xl border px-4 py-3 text-sm"
            style={{ borderColor: "var(--color-success)", background: "var(--color-success-bg)", color: "var(--color-success)" }}
            role="status"
          >
            Account created for <strong>{lastCreated.email}</strong>. Password:{" "}
            <code className="font-mono">{lastCreated.password}</code>
            <br />
            Copy this now — it won&apos;t be shown again. Send it to them securely.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="new-email" className="field-label">
              Email
            </label>
            <input
              id="new-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field-input"
              placeholder="staffmember@example.com"
            />
          </div>
          <div>
            <label htmlFor="new-name" className="field-label">
              Display name
            </label>
            <input
              id="new-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="field-input"
              placeholder="Optional"
            />
          </div>
          <div>
            <label htmlFor="new-role" className="field-label">
              Role
            </label>
            <select
              id="new-role"
              value={role}
              onChange={(e) => setRole(e.target.value as StaffRole)}
              className="field-input"
            >
              {staffRoleValues.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="new-password" className="field-label">
              Password
            </label>
            <div className="flex gap-2">
              <input
                id="new-password"
                type="text"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field-input font-mono"
              />
              <button
                type="button"
                onClick={() => setPassword(generatePassword())}
                className="btn btn-secondary shrink-0 px-3 text-sm"
              >
                Generate
              </button>
            </div>
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn btn-primary mt-5">
          {submitting ? "Creating…" : "Create account"}
        </button>
      </form>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Added</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading && <TableSkeletonRows columns={5} rows={3} />}
              {listError && !loading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-[var(--color-danger)]">
                    {listError}
                  </td>
                </tr>
              )}
              {!loading &&
                !listError &&
                staff.map((member) => (
                  <tr key={member.id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="px-4 py-3 text-[var(--color-text)]">{member.email}</td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {member.display_name || "—"}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">{member.role}</td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {member.id !== currentStaffId && (
                        <button
                          type="button"
                          onClick={() => handleRemove(member.id)}
                          className="text-sm font-medium text-[var(--color-danger)] hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
