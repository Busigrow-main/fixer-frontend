"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

interface DashboardStats {
  users: { total: number };
  bookings: { total: number; byStatus: Record<string, number> };
  spareParts: { total: number };
  orders: { total: number; byStatus: Record<string, number> };
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
        {metrics.map((m) => (
          <div key={m.label} className="admin-card admin-metric-card">
            <div className="admin-metric-icon" style={{ background: m.bg, color: m.color }}>
              <span className="material-symbols-outlined">{m.icon}</span>
            </div>
            <div className="admin-metric-value">{m.value.toLocaleString()}</div>
            <div className="admin-metric-label">{m.label}</div>
          </div>
        ))}
      </div>

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
