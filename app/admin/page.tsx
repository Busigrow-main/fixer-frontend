"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

interface DashboardStats {
  users: { total: number };
  bookings: {
    total: number;
    byStatus: Record<string, number>;
    needsAdminAssignment?: number;
  };
  spareParts: { total: number };
  orders: { total: number; byStatus: Record<string, number> };
  revenue?: {
    daily: RevenueBucket;
    weekly: RevenueBucket;
    monthly: RevenueBucket;
    recent: Array<{
      bookingId: string;
      collectedAt: string;
      customerTotal: number;
      fixxerNet: number;
      technicianNet: number;
      paymentMethod?: string;
    }>;
  };
}

interface RevenueBucket {
  collections: number;
  customerTotal: number;
  fixxerNet: number;
  technicianNet: number;
}

function inr(n?: number) {
  return `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1"}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="admin-empty">
        <div className="admin-spinner" style={{ margin: "0 auto" }} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="admin-empty">
        <span className="material-symbols-outlined">error</span>
        <p>Failed to load dashboard data</p>
      </div>
    );
  }

  const metrics = [
    {
      label: "Needs Assignment",
      value: stats.bookings.needsAdminAssignment || 0,
      icon: "assignment_late",
      color: "var(--admin-warning)",
      bg: "var(--admin-warning-soft)",
      href: "/admin/bookings?status=NEEDS_ASSIGNMENT",
    },
    {
      label: "Total Bookings",
      value: stats.bookings.total,
      icon: "calendar_month",
      color: "var(--admin-info)",
      bg: "var(--admin-info-soft)",
    },
    {
      label: "Pending Bookings",
      value: stats.bookings.byStatus?.PENDING || 0,
      icon: "pending_actions",
      color: "var(--admin-warning)",
      bg: "var(--admin-warning-soft)",
    },
    {
      label: "Spare Parts",
      value: stats.spareParts.total,
      icon: "build",
      color: "var(--admin-success)",
      bg: "var(--admin-success-soft)",
    },
    {
      label: "Part Orders",
      value: stats.orders.total,
      icon: "local_shipping",
      color: "#a78bfa",
      bg: "rgba(139, 92, 246, 0.12)",
    },
    {
      label: "Registered Users",
      value: stats.users.total,
      icon: "group",
      color: "#22d3ee",
      bg: "rgba(6, 182, 212, 0.12)",
    },
    {
      label: "Completed",
      value: stats.bookings.byStatus?.COMPLETED || 0,
      icon: "check_circle",
      color: "var(--admin-success)",
      bg: "var(--admin-success-soft)",
    },
  ];

  const bookingStatuses = Object.entries(stats.bookings.byStatus || {});
  const orderStatuses = Object.entries(stats.orders.byStatus || {});

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>Welcome back</h2>
        <p style={{ fontSize: 13, color: "var(--admin-text-dim)", marginTop: 4 }}>
          Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="admin-stats-grid" style={{ marginBottom: 32 }}>
        {metrics.map((m) => {
          const inner = (
            <>
              <div className="admin-metric-icon" style={{ background: m.bg, color: m.color }}>
                <span className="material-symbols-outlined">{m.icon}</span>
              </div>
              <div className="admin-metric-value">{m.value.toLocaleString()}</div>
              <div className="admin-metric-label">{m.label}</div>
            </>
          );
          if ("href" in m && m.href) {
            return (
              <a key={m.label} href={m.href} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="admin-card admin-metric-card">{inner}</div>
              </a>
            );
          }
          return (
            <div key={m.label} className="admin-card admin-metric-card">
              {inner}
            </div>
          );
        })}
      </div>

      {stats.revenue && (
        <div className="admin-card" style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Fixxer earnings</h3>
          <p style={{ fontSize: 12, color: "var(--admin-text-dim)", marginBottom: 16 }}>
            Net from customer collections after technician share (90% of inventory parts + ₹100 outside-part fees).
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
            {([
              ["Today", stats.revenue.daily],
              ["This week", stats.revenue.weekly],
              ["This month", stats.revenue.monthly],
            ] as const).map(([label, bucket]) => (
              <div key={label} style={{ padding: 16, background: "var(--admin-surface-2)", borderRadius: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: "var(--admin-text-muted)" }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6, color: "var(--admin-primary)" }}>{inr(bucket.fixxerNet)}</div>
                <div style={{ fontSize: 12, color: "var(--admin-text-dim)", marginTop: 6 }}>
                  Collected {inr(bucket.customerTotal)} · Tech {inr(bucket.technicianNet)} · {bucket.collections} jobs
                </div>
              </div>
            ))}
          </div>
          {(stats.revenue.recent?.length ?? 0) > 0 && (
            <>
              <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Recent collections</h4>
              <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid var(--admin-border)" }}>
                    <th style={{ paddingBottom: 8, color: "var(--admin-text-muted)" }}>Job</th>
                    <th style={{ paddingBottom: 8, color: "var(--admin-text-muted)" }}>When</th>
                    <th style={{ paddingBottom: 8, textAlign: "right", color: "var(--admin-text-muted)" }}>Customer paid</th>
                    <th style={{ paddingBottom: 8, textAlign: "right", color: "var(--admin-text-muted)" }}>Fixxer</th>
                    <th style={{ paddingBottom: 8, textAlign: "right", color: "var(--admin-text-muted)" }}>Technician</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.revenue.recent.slice(0, 12).map((row) => (
                    <tr key={row.bookingId} style={{ borderBottom: "1px solid var(--admin-border)" }}>
                      <td style={{ padding: "10px 0" }}>
                        <a href={`/admin/bookings/${row.bookingId}`} style={{ color: "var(--admin-primary)", fontWeight: 600 }}>
                          #{row.bookingId.slice(-6).toUpperCase()}
                        </a>
                      </td>
                      <td style={{ padding: "10px 0", color: "var(--admin-text-dim)" }}>
                        {row.collectedAt ? new Date(row.collectedAt).toLocaleString("en-IN") : "—"}
                      </td>
                      <td style={{ padding: "10px 0", textAlign: "right" }}>{inr(row.customerTotal)}</td>
                      <td style={{ padding: "10px 0", textAlign: "right", fontWeight: 700 }}>{inr(row.fixxerNet)}</td>
                      <td style={{ padding: "10px 0", textAlign: "right" }}>{inr(row.technicianNet)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* Status Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {bookingStatuses.length > 0 && (
          <div className="admin-card">
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Bookings by Status</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {bookingStatuses.map(([status, count]) => (
                <div key={status} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className={`admin-badge admin-badge-${status.toLowerCase()}`}>{status.replace("_", " ")}</span>
                  <span style={{ fontSize: 18, fontWeight: 700 }}>{count as number}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {orderStatuses.length > 0 && (
          <div className="admin-card">
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Orders by Status</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {orderStatuses.map(([status, count]) => (
                <div key={status} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className={`admin-badge admin-badge-${status.toLowerCase()}`}>{status.replace("_", " ")}</span>
                  <span style={{ fontSize: 18, fontWeight: 700 }}>{count as number}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
