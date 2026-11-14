"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
const STATUSES = ["ALL", "OPEN", "RESOLVED"] as const;

type AdminUser = {
  _id: string;
  fullName?: string;
  phone?: string;
  role?: string;
};

type FollowUp = {
  _id: string;
  status: "OPEN" | "RESOLVED";
  dueDate?: string;
  resolution?: string;
  createdAt?: string;
  ownerId?: AdminUser | string | null;
  bookingId?: {
    _id?: string;
    status?: string;
    addressData?: { text?: string; zip?: string };
  } | string;
  feedbackId?: {
    rating?: number;
    resolved?: boolean;
    comment?: string;
    userId?: { fullName?: string; phone?: string };
  };
};

export default function AdminFeedbackPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<FollowUp[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("OPEN");
  const [page, setPage] = useState(1);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [selected, setSelected] = useState<FollowUp | null>(null);
  const [ownerId, setOwnerId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [resolution, setResolution] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / 20));
  const openCount = useMemo(
    () => items.filter((item) => item.status === "OPEN").length,
    [items],
  );

  const loadFollowUps = async (opts?: { keepMessage?: boolean }) => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (status !== "ALL") params.set("status", status);
      const res = await fetch(`${API}/admin/feedback-follow-ups?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Could not load recovery queue.");
      const data = await res.json();
      setItems(Array.isArray(data.data) ? data.data : []);
      setTotal(Number(data.total) || 0);
      if (!opts?.keepMessage) setMessage("");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load recovery queue.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFollowUps();
  }, [token, page, status]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/admin/users?page=1&limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const users = Array.isArray(data.data) ? data.data : [];
        setAdmins(users.filter((user: AdminUser) => user.role === "ADMIN"));
      })
      .catch(() => setAdmins([]));
  }, [token]);

  const openFollowUp = (item: FollowUp) => {
    setSelected(item);
    setOwnerId(
      typeof item.ownerId === "object" && item.ownerId
        ? item.ownerId._id
        : typeof item.ownerId === "string"
          ? item.ownerId
          : "",
    );
    setDueDate(
      item.dueDate ? new Date(item.dueDate).toISOString().slice(0, 10) : "",
    );
    setResolution(item.resolution || "");
    setMessage("");
  };

  const saveFollowUp = async (markResolved: boolean) => {
    if (!token || !selected) return;
    if (markResolved && !resolution.trim()) {
      setMessage("Add resolution notes before closing the case.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`${API}/admin/feedback-follow-ups/${selected._id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(ownerId ? { ownerId } : {}),
          ...(dueDate ? { dueDate: new Date(dueDate).toISOString() } : {}),
          ...(resolution.trim() ? { resolution: resolution.trim() } : {}),
          ...(markResolved ? { status: "RESOLVED" } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Could not update follow-up.");
      }
      setSelected(null);
      setMessage(markResolved ? "Case resolved." : "Follow-up updated.");
      await loadFollowUps({ keepMessage: true });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not update follow-up.",
      );
    } finally {
      setSaving(false);
    }
  };

  const customerLabel = (item: FollowUp) => {
    const user = item.feedbackId?.userId;
    if (!user) return "Customer";
    return user.fullName || user.phone || "Customer";
  };

  const bookingLabel = (item: FollowUp) => {
    if (!item.bookingId || typeof item.bookingId === "string") {
      return typeof item.bookingId === "string"
        ? item.bookingId.slice(-6).toUpperCase()
        : "—";
    }
    return (item.bookingId._id || "").slice(-6).toUpperCase() || "—";
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Customer Recovery</h2>
          <p
            style={{
              fontSize: 13,
              color: "var(--admin-text-dim)",
              marginTop: 4,
            }}
          >
            Low ratings and unresolved jobs that need follow-up.
          </p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={() => loadFollowUps()}
          disabled={loading}
        >
          <span className="material-symbols-outlined">refresh</span>
          Refresh
        </button>
      </div>

      {message ? (
        <div className="admin-card" style={{ padding: 12, marginBottom: 16 }}>
          {message}
        </div>
      ) : null}

      <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
        <div className="admin-card admin-metric-card">
          <div className="admin-metric-label">Queue total</div>
          <div className="admin-metric-value">{total}</div>
        </div>
        <div className="admin-card admin-metric-card">
          <div className="admin-metric-label">Open on this page</div>
          <div className="admin-metric-value">{openCount}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <select
          className="admin-input admin-select"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as (typeof STATUSES)[number]);
            setPage(1);
          }}
        >
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="admin-card" style={{ padding: 32, textAlign: "center" }}>
          Loading recovery queue...
        </div>
      ) : items.length === 0 ? (
        <div className="admin-card" style={{ padding: 32, textAlign: "center" }}>
          No follow-ups in this filter.
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Booking</th>
                <th>Feedback</th>
                <th>Owner</th>
                <th>Due</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const owner =
                  typeof item.ownerId === "object" && item.ownerId
                    ? item.ownerId.fullName || item.ownerId.phone
                    : "Unassigned";
                return (
                  <tr key={item._id}>
                    <td>
                      <strong>{customerLabel(item)}</strong>
                      <br />
                      <small>{item.feedbackId?.userId?.phone || "—"}</small>
                    </td>
                    <td>#{bookingLabel(item)}</td>
                    <td>
                      {item.feedbackId?.rating ?? "—"}/5 ·{" "}
                      {item.feedbackId?.resolved ? "Resolved" : "Unresolved"}
                      {item.feedbackId?.comment ? (
                        <>
                          <br />
                          <small>{item.feedbackId.comment}</small>
                        </>
                      ) : null}
                    </td>
                    <td>{owner || "Unassigned"}</td>
                    <td>
                      {item.dueDate
                        ? new Date(item.dueDate).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td>
                      <span
                        className={`admin-badge admin-badge-${item.status.toLowerCase()}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="admin-btn admin-btn-primary admin-btn-sm"
                        onClick={() => openFollowUp(item)}
                      >
                        {item.status === "OPEN" ? "Work" : "View"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 16,
        }}
      >
        <span style={{ fontSize: 13, color: "var(--admin-text-dim)" }}>
          {total} total follow-ups
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="admin-btn admin-btn-secondary admin-btn-sm"
            disabled={page <= 1}
            onClick={() => setPage((value) => value - 1)}
          >
            Previous
          </button>
          <span style={{ padding: "7px 4px", fontSize: 13 }}>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="admin-btn admin-btn-secondary admin-btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage((value) => value + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {selected ? (
        <div className="admin-modal-backdrop" onClick={() => setSelected(null)}>
          <div
            className="admin-card"
            style={{
              maxWidth: 640,
              width: "calc(100% - 32px)",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 24,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>
                  Recovery follow-up
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--admin-text-dim)",
                    marginTop: 4,
                  }}
                >
                  {customerLabel(selected)} · Booking #{bookingLabel(selected)}
                </p>
              </div>
              <button
                type="button"
                className="admin-btn admin-btn-ghost admin-btn-sm"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>

            <div style={{ margin: "20px 0", fontSize: 14, lineHeight: 1.6 }}>
              <p>
                <strong>Rating:</strong> {selected.feedbackId?.rating ?? "—"}/5
              </p>
              <p>
                <strong>Customer says resolved:</strong>{" "}
                {selected.feedbackId?.resolved ? "Yes" : "No"}
              </p>
              <p>
                <strong>Comment:</strong>{" "}
                {selected.feedbackId?.comment || "No comment"}
              </p>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              <label className="admin-label">
                Owner
                <select
                  className="admin-input admin-select"
                  value={ownerId}
                  onChange={(event) => setOwnerId(event.target.value)}
                  disabled={selected.status === "RESOLVED"}
                >
                  <option value="">Unassigned</option>
                  {admins.map((admin) => (
                    <option key={admin._id} value={admin._id}>
                      {admin.fullName || admin.phone || admin._id}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-label">
                Due date
                <input
                  className="admin-input"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  disabled={selected.status === "RESOLVED"}
                />
              </label>

              <label className="admin-label">
                Resolution notes
                <textarea
                  className="admin-input"
                  rows={4}
                  value={resolution}
                  onChange={(event) => setResolution(event.target.value)}
                  placeholder="What was done to recover the customer?"
                  disabled={selected.status === "RESOLVED"}
                />
              </label>

              {selected.status === "OPEN" ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary"
                    disabled={saving}
                    onClick={() => saveFollowUp(false)}
                  >
                    {saving ? "Saving..." : "Save assignment"}
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-primary"
                    disabled={saving}
                    onClick={() => saveFollowUp(true)}
                  >
                    {saving ? "Saving..." : "Mark resolved"}
                  </button>
                </div>
              ) : (
                <div className="admin-card" style={{ padding: 12 }}>
                  <strong>Closed</strong>
                  <p style={{ marginTop: 8 }}>
                    {selected.resolution || "No resolution recorded."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
