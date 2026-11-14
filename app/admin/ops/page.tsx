"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

const REASONS = [
  "ALL",
  "UNASSIGNED",
  "ACCEPTED_NOT_STARTED",
  "PARTS_WAIT",
  "OVERDUE_VISIT",
  "OVERDUE_REVIEW",
] as const;

type Thresholds = {
  unclaimedEscalateMinutes: number;
  acceptedNotStartedHours: number;
  partsWaitHours: number;
  visitOverdueHours: number;
  reviewOverdueHours: number;
  alertCooldownMinutes: number;
};

type OverdueRow = {
  bookingId: string;
  reason: string;
  nextAction: string;
  ownerId?: string | null;
  ownerName?: string | null;
  dueAt?: string | null;
  ageMs: number;
  ageLabel: string;
  firstPendingAt: string;
  status?: string;
  contactPhone?: string;
};

const emptyThresholds: Thresholds = {
  unclaimedEscalateMinutes: 10,
  acceptedNotStartedHours: 4,
  partsWaitHours: 24,
  visitOverdueHours: 2,
  reviewOverdueHours: 24,
  alertCooldownMinutes: 60,
};

export default function AdminOpsPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<OverdueRow[]>([]);
  const [total, setTotal] = useState(0);
  const [reason, setReason] = useState<(typeof REASONS)[number]>("ALL");
  const [thresholds, setThresholds] = useState<Thresholds>(emptyThresholds);
  const [draft, setDraft] = useState<Thresholds>(emptyThresholds);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<OverdueRow | null>(null);
  const [nextAction, setNextAction] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [partsWait, setPartsWait] = useState(false);

  const loadQueue = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (reason !== "ALL") params.set("reason", reason);
      const res = await fetch(`${API}/admin/ops/overdue?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Could not load overdue queue.");
      const data = await res.json();
      setRows(Array.isArray(data.data) ? data.data : []);
      setTotal(Number(data.total) || 0);
      if (data.thresholds) {
        setThresholds(data.thresholds);
        setDraft(data.thresholds);
      }
      setMessage("");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not load overdue queue.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [token, reason]);

  const saveThresholds = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/ops/settings`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draft),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Could not save thresholds.");
      setThresholds(data);
      setDraft({
        unclaimedEscalateMinutes: data.unclaimedEscalateMinutes,
        acceptedNotStartedHours: data.acceptedNotStartedHours,
        partsWaitHours: data.partsWaitHours,
        visitOverdueHours: data.visitOverdueHours,
        reviewOverdueHours: data.reviewOverdueHours,
        alertCooldownMinutes: data.alertCooldownMinutes,
      });
      setMessage("Thresholds saved. Dispatch still escalates unclaimed jobs at 10 minutes.");
      await loadQueue();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save thresholds.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openRow = (row: OverdueRow) => {
    setSelected(row);
    setNextAction(row.nextAction || "");
    setDueAt(row.dueAt ? new Date(row.dueAt).toISOString().slice(0, 16) : "");
    setPartsWait(row.reason === "PARTS_WAIT");
    setMessage("");
  };

  const savePendingWork = async () => {
    if (!token || !selected) return;
    setSaving(true);
    try {
      const res = await fetch(
        `${API}/admin/ops/bookings/${selected.bookingId}/pending-work`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: selected.reason,
            nextAction: nextAction.trim() || undefined,
            dueAt: dueAt ? new Date(dueAt).toISOString() : null,
            partsWait,
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Could not update pending work.");
      setSelected(null);
      setMessage("Pending work updated. Job age was preserved.");
      await loadQueue();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not update pending work.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Pending & Overdue</h2>
          <p style={{ fontSize: 13, color: "var(--admin-text-dim)", marginTop: 4 }}>
            Unassigned, accepted-not-started, parts waits, overdue visits and reviews.
            Ten-minute unclaimed escalation is unchanged.
          </p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={loadQueue}
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

      <div className="admin-card" style={{ padding: 16, marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>
          Configurable thresholds
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          {(
            [
              ["unclaimedEscalateMinutes", "Unclaimed escalate (min)"],
              ["acceptedNotStartedHours", "Accepted not started (h)"],
              ["partsWaitHours", "Parts wait (h)"],
              ["visitOverdueHours", "Visit overdue (h)"],
              ["reviewOverdueHours", "Review overdue (h)"],
              ["alertCooldownMinutes", "Alert cooldown (min)"],
            ] as Array<[keyof Thresholds, string]>
          ).map(([key, label]) => (
            <label key={key} className="admin-label">
              {label}
              <input
                className="admin-input"
                type="number"
                min={1}
                value={draft[key]}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    [key]: Number(event.target.value),
                  }))
                }
              />
            </label>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "var(--admin-text-dim)", marginTop: 8 }}>
          Current unclaimed escalate setting: {thresholds.unclaimedEscalateMinutes}m
          (dispatch cron remains hardcoded at 10m until intentionally wired).
        </p>
        <button
          type="button"
          className="admin-btn admin-btn-primary admin-btn-sm"
          style={{ marginTop: 12 }}
          disabled={saving}
          onClick={saveThresholds}
        >
          Save thresholds
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <select
          className="admin-input admin-select"
          value={reason}
          onChange={(event) =>
            setReason(event.target.value as (typeof REASONS)[number])
          }
        >
          {REASONS.map((value) => (
            <option key={value} value={value}>
              {value.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="admin-card" style={{ padding: 32, textAlign: "center" }}>
          Loading overdue queue...
        </div>
      ) : rows.length === 0 ? (
        <div className="admin-card" style={{ padding: 32, textAlign: "center" }}>
          No overdue rows for this filter.
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Age</th>
                <th>Reason</th>
                <th>Owner</th>
                <th>Next action</th>
                <th>Due</th>
                <th>Booking</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.bookingId}-${row.reason}`}>
                  <td>
                    <strong>{row.ageLabel}</strong>
                  </td>
                  <td>
                    <span className="admin-badge admin-badge-warning">
                      {row.reason.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td>{row.ownerName || "Unassigned"}</td>
                  <td>{row.nextAction}</td>
                  <td>
                    {row.dueAt
                      ? new Date(row.dueAt).toLocaleString("en-IN")
                      : "—"}
                  </td>
                  <td>
                    <Link href={`/admin/bookings/${row.bookingId}`}>
                      #{row.bookingId.slice(-6).toUpperCase()}
                    </Link>
                    <br />
                    <small>{row.contactPhone || row.status || "—"}</small>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="admin-btn admin-btn-primary admin-btn-sm"
                      onClick={() => openRow(row)}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p style={{ marginTop: 12, fontSize: 13, color: "var(--admin-text-dim)" }}>
        {total} overdue row{total === 1 ? "" : "s"}
      </p>

      {selected ? (
        <div className="admin-modal-backdrop" onClick={() => setSelected(null)}>
          <div
            className="admin-card"
            style={{
              maxWidth: 560,
              width: "calc(100% - 32px)",
              padding: 24,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800 }}>Pending work</h3>
                <p style={{ fontSize: 13, color: "var(--admin-text-dim)", marginTop: 4 }}>
                  #{selected.bookingId.slice(-6).toUpperCase()} · age {selected.ageLabel}
                  {" · "}changing reason keeps total age
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

            <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
              <label className="admin-label">
                Next action
                <input
                  className="admin-input"
                  value={nextAction}
                  onChange={(event) => setNextAction(event.target.value)}
                />
              </label>
              <label className="admin-label">
                Due at
                <input
                  className="admin-input"
                  type="datetime-local"
                  value={dueAt}
                  onChange={(event) => setDueAt(event.target.value)}
                />
              </label>
              <label
                style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}
              >
                <input
                  type="checkbox"
                  checked={partsWait}
                  onChange={(event) => setPartsWait(event.target.checked)}
                />
                Mark parts wait
              </label>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={saving}
                onClick={savePendingWork}
              >
                {saving ? "Saving..." : "Save pending work"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
