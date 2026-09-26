"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  return `₹${Number(n || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ");
}

function statusClass(status: string) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1"}/admin/dashboard`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="admin-spinner" />
        <span>Loading dashboard</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-error admin-card">
        <div className="dashboard-error-icon">
          <span className="material-symbols-outlined">error</span>
        </div>
        <div>
          <h3>Unable to load dashboard</h3>
          <p>Something went wrong while fetching your admin data.</p>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: "Needs Assignment",
      value: stats.bookings.needsAdminAssignment || 0,
      icon: "assignment_late",
      tone: "warning",
      href: "/admin/bookings?status=NEEDS_ASSIGNMENT",
    },
    {
      label: "Total Bookings",
      value: stats.bookings.total,
      icon: "calendar_month",
      tone: "info",
    },
    {
      label: "Pending Bookings",
      value: stats.bookings.byStatus?.PENDING || 0,
      icon: "pending_actions",
      tone: "warning",
    },
    {
      label: "Spare Parts",
      value: stats.spareParts.total,
      icon: "build",
      tone: "success",
    },
    {
      label: "Part Orders",
      value: stats.orders.total,
      icon: "local_shipping",
      tone: "purple",
    },
    {
      label: "Registered Users",
      value: stats.users.total,
      icon: "group",
      tone: "cyan",
    },
    {
      label: "Completed",
      value: stats.bookings.byStatus?.COMPLETED || 0,
      icon: "check_circle",
      tone: "success",
    },
  ];

  const bookingStatuses = Object.entries(stats.bookings.byStatus || {});
  const orderStatuses = Object.entries(stats.orders.byStatus || {});

  const revenuePeriods = stats.revenue
    ? ([
        ["Today", stats.revenue.daily],
        ["This week", stats.revenue.weekly],
        ["This month", stats.revenue.monthly],
      ] as const)
    : [];

  return (
    <>
      <div className="dashboard-page">
        {/* Page intro */}
        <section className="dashboard-intro">
          <div>
            <div className="dashboard-eyebrow">
              <span className="dashboard-eyebrow-dot" />
              ADMIN OVERVIEW
            </div>
            <h1>Welcome back</h1>
            <p>Here&apos;s what&apos;s happening with Fixxer today.</p>
          </div>

          <div className="dashboard-live">
            <span className="dashboard-live-dot" />
            Live data
          </div>
        </section>

        {/* KPI cards */}
        <section className="dashboard-metrics">
          {metrics.map((metric) => {
            const card = (
              <div className={`dashboard-kpi tone-${metric.tone}`}>
                <div className="dashboard-kpi-top">
                  <div className="dashboard-kpi-icon">
                    <span className="material-symbols-outlined">
                      {metric.icon}
                    </span>
                  </div>

                  {metric.href && (
                    <span className="dashboard-kpi-arrow">
                      <span className="material-symbols-outlined">
                        arrow_outward
                      </span>
                    </span>
                  )}
                </div>

                <div className="dashboard-kpi-value">
                  {metric.value.toLocaleString("en-IN")}
                </div>

                <div className="dashboard-kpi-label">{metric.label}</div>
              </div>
            );

            return metric.href ? (
              <Link
                key={metric.label}
                href={metric.href}
                className="dashboard-kpi-link"
              >
                {card}
              </Link>
            ) : (
              <div key={metric.label}>{card}</div>
            );
          })}
        </section>

        {/* Revenue */}
        {stats.revenue && (
          <section className="dashboard-section">
            <div className="dashboard-section-heading">
              <div>
                <div className="dashboard-section-kicker">FINANCIALS</div>
                <h2>Fixxer earnings</h2>
                <p>
                  Net from customer collections after technician share.
                </p>
              </div>

              <div className="dashboard-section-icon">
                <span className="material-symbols-outlined">
                  account_balance_wallet
                </span>
              </div>
            </div>

            <div className="revenue-grid">
              {revenuePeriods.map(([label, bucket]) => (
                <div className="revenue-card" key={label}>
                  <div className="revenue-card-label">{label}</div>

                  <div className="revenue-main">
                    {inr(bucket.fixxerNet)}
                  </div>

                  <div className="revenue-meta">
                    <span>
                      <strong>{bucket.collections}</strong> jobs
                    </span>
                    <span className="revenue-meta-divider" />
                    <span>{inr(bucket.customerTotal)} collected</span>
                  </div>

                  <div className="revenue-share">
                    <span>Technician</span>
                    <strong>{inr(bucket.technicianNet)}</strong>
                  </div>
                </div>
              ))}
            </div>

            {(stats.revenue.recent?.length ?? 0) > 0 && (
              <div className="collections-block">
                <div className="collections-heading">
                  <div>
                    <h3>Recent collections</h3>
                    <p>Latest completed payment activity</p>
                  </div>
                </div>

                <div className="collections-table-wrap">
                  <table className="collections-table">
                    <thead>
                      <tr>
                        <th>Job</th>
                        <th>When</th>
                        <th>Customer paid</th>
                        <th>Fixxer</th>
                        <th>Technician</th>
                      </tr>
                    </thead>

                    <tbody>
                      {stats.revenue.recent.slice(0, 12).map((row) => (
                        <tr key={row.bookingId}>
                          <td>
                            <Link
                              href={`/admin/bookings/${row.bookingId}`}
                              className="collection-job"
                            >
                              <span className="collection-job-icon">
                                <span className="material-symbols-outlined">
                                  receipt_long
                                </span>
                              </span>
                              #{row.bookingId.slice(-6).toUpperCase()}
                            </Link>
                          </td>

                          <td className="collection-muted">
                            {row.collectedAt
                              ? new Date(row.collectedAt).toLocaleString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : "—"}
                          </td>

                          <td>{inr(row.customerTotal)}</td>

                          <td>
                            <strong className="collection-fixxer">
                              {inr(row.fixxerNet)}
                            </strong>
                          </td>

                          <td>{inr(row.technicianNet)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Status overview */}
        <section className="status-grid">
          {bookingStatuses.length > 0 && (
            <div className="status-panel admin-card">
              <div className="status-panel-heading">
                <div>
                  <div className="dashboard-section-kicker">OPERATIONS</div>
                  <h2>Bookings by status</h2>
                </div>

                <span className="status-panel-icon">
                  <span className="material-symbols-outlined">
                    calendar_month
                  </span>
                </span>
              </div>

              <div className="status-list">
                {bookingStatuses.map(([status, count]) => (
                  <div className="status-row" key={status}>
                    <span
                      className={`admin-badge admin-badge-${statusClass(
                        status
                      )}`}
                    >
                      {formatStatus(status)}
                    </span>

                    <strong>{count as number}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {orderStatuses.length > 0 && (
            <div className="status-panel admin-card">
              <div className="status-panel-heading">
                <div>
                  <div className="dashboard-section-kicker">FULFILMENT</div>
                  <h2>Orders by status</h2>
                </div>

                <span className="status-panel-icon">
                  <span className="material-symbols-outlined">
                    package_2
                  </span>
                </span>
              </div>

              <div className="status-list">
                {orderStatuses.map(([status, count]) => (
                  <div className="status-row" key={status}>
                    <span
                      className={`admin-badge admin-badge-${statusClass(
                        status
                      )}`}
                    >
                      {formatStatus(status)}
                    </span>

                    <strong>{count as number}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .dashboard-page {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
        }

        /* ---------------------------------------------------------
           INTRO
        --------------------------------------------------------- */

        .dashboard-intro {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 28px;
        }

        .dashboard-eyebrow,
        .dashboard-section-kicker {
          display: flex;
          align-items: center;
          gap: 7px;
          color: var(--admin-text-muted);
          font-size: 9px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .dashboard-eyebrow {
          margin-bottom: 10px;
        }

        .dashboard-eyebrow-dot,
        .dashboard-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--admin-accent);
        }

        .dashboard-intro h1 {
          margin: 0;
          color: var(--admin-text);
          font-size: clamp(25px, 3vw, 34px);
          line-height: 1.05;
          font-weight: 850;
          letter-spacing: -1.2px;
        }

        .dashboard-intro p {
          margin: 8px 0 0;
          color: var(--admin-text-dim);
          font-size: 13px;
        }

        .dashboard-live {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          padding: 8px 11px;
          border: 1px solid var(--admin-border);
          border-radius: 999px;
          background: var(--admin-surface);
          color: var(--admin-text-dim);
          font-size: 10px;
          font-weight: 700;
        }

        .dashboard-live-dot {
          background: var(--admin-success);
          box-shadow: 0 0 0 4px var(--admin-success-soft);
        }

        /* ---------------------------------------------------------
           KPI GRID
        --------------------------------------------------------- */

        .dashboard-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 28px;
        }

        .dashboard-kpi-link {
          display: block;
          min-width: 0;
          color: inherit;
          text-decoration: none;
        }

        .dashboard-kpi {
          position: relative;
          min-height: 148px;
          overflow: hidden;
          padding: 18px;
          border: 1px solid var(--admin-border);
          border-radius: 17px;
          background: var(--admin-surface);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.025);
          transition:
            transform 180ms ease,
            border-color 180ms ease,
            box-shadow 180ms ease;
        }

        .dashboard-kpi::after {
          content: "";
          position: absolute;
          width: 90px;
          height: 90px;
          right: -42px;
          bottom: -48px;
          border-radius: 50%;
          background: var(--kpi-color);
          opacity: 0.07;
          pointer-events: none;
        }

        .dashboard-kpi:hover {
          transform: translateY(-2px);
          border-color: var(--admin-border-hover);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.07);
        }

        .dashboard-kpi-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .dashboard-kpi-icon {
          width: 39px;
          height: 39px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          color: var(--kpi-color);
          background: var(--kpi-bg);
        }

        .dashboard-kpi-icon .material-symbols-outlined {
          font-size: 20px;
        }

        .dashboard-kpi-arrow {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--admin-border);
          border-radius: 8px;
          color: var(--admin-text-muted);
        }

        .dashboard-kpi-arrow .material-symbols-outlined {
          font-size: 15px;
        }

        .dashboard-kpi-value {
          margin-top: 20px;
          color: var(--admin-text);
          font-size: 28px;
          line-height: 1;
          font-weight: 850;
          letter-spacing: -1px;
        }

        .dashboard-kpi-label {
          margin-top: 8px;
          color: var(--admin-text-dim);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.7px;
          text-transform: uppercase;
        }

        .tone-warning {
          --kpi-color: var(--admin-warning);
          --kpi-bg: var(--admin-warning-soft);
        }

        .tone-info {
          --kpi-color: var(--admin-info);
          --kpi-bg: var(--admin-info-soft);
        }

        .tone-success {
          --kpi-color: var(--admin-success);
          --kpi-bg: var(--admin-success-soft);
        }

        .tone-purple {
          --kpi-color: #a78bfa;
          --kpi-bg: rgba(139, 92, 246, 0.12);
        }

        .tone-cyan {
          --kpi-color: #22d3ee;
          --kpi-bg: rgba(6, 182, 212, 0.12);
        }

        /* ---------------------------------------------------------
           SECTIONS
        --------------------------------------------------------- */

        .dashboard-section {
          padding: 22px;
          margin-bottom: 16px;
          border: 1px solid var(--admin-border);
          border-radius: 19px;
          background: var(--admin-surface);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.025);
        }

        .dashboard-section-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 18px;
        }

        .dashboard-section-heading h2,
        .status-panel-heading h2 {
          margin: 5px 0 0;
          color: var(--admin-text);
          font-size: 16px;
          line-height: 1.2;
          font-weight: 800;
          letter-spacing: -0.3px;
        }

        .dashboard-section-heading p {
          margin: 5px 0 0;
          color: var(--admin-text-dim);
          font-size: 11px;
        }

        .dashboard-section-icon,
        .status-panel-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid var(--admin-border);
          border-radius: 11px;
          background: var(--admin-surface-2);
          color: var(--admin-text-dim);
        }

        .dashboard-section-icon .material-symbols-outlined,
        .status-panel-icon .material-symbols-outlined {
          font-size: 19px;
        }

        /* ---------------------------------------------------------
           REVENUE
        --------------------------------------------------------- */

        .revenue-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .revenue-card {
          position: relative;
          overflow: hidden;
          padding: 17px;
          border: 1px solid var(--admin-border);
          border-radius: 14px;
          background: var(--admin-surface-2);
        }

        .revenue-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--admin-accent);
          opacity: 0.8;
        }

        .revenue-card-label {
          color: var(--admin-text-muted);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .revenue-main {
          margin-top: 9px;
          color: var(--admin-text);
          font-size: 24px;
          line-height: 1;
          font-weight: 850;
          letter-spacing: -0.8px;
        }

        .revenue-meta {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 9px;
          color: var(--admin-text-dim);
          font-size: 10px;
        }

        .revenue-meta strong {
          color: var(--admin-text);
        }

        .revenue-meta-divider {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: var(--admin-text-muted);
        }

        .revenue-share {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 15px;
          padding-top: 10px;
          border-top: 1px solid var(--admin-border);
          color: var(--admin-text-muted);
          font-size: 10px;
        }

        .revenue-share strong {
          color: var(--admin-text-dim);
          font-size: 11px;
        }

        /* ---------------------------------------------------------
           COLLECTIONS
        --------------------------------------------------------- */

        .collections-block {
          margin-top: 18px;
          border-top: 1px solid var(--admin-border);
          padding-top: 18px;
        }

        .collections-heading {
          display: flex;
          justify-content: space-between;
          margin-bottom: 11px;
        }

        .collections-heading h3 {
          margin: 0;
          color: var(--admin-text);
          font-size: 13px;
          font-weight: 800;
        }

        .collections-heading p {
          margin: 3px 0 0;
          color: var(--admin-text-muted);
          font-size: 10px;
        }

        .collections-table-wrap {
          overflow-x: auto;
          border: 1px solid var(--admin-border);
          border-radius: 13px;
        }

        .collections-table {
          width: 100%;
          min-width: 650px;
          border-collapse: collapse;
          font-size: 11px;
        }

        .collections-table th {
          padding: 10px 13px;
          background: var(--admin-surface-2);
          color: var(--admin-text-muted);
          border-bottom: 1px solid var(--admin-border);
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.7px;
          text-align: left;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .collections-table th:nth-child(n + 3),
        .collections-table td:nth-child(n + 3) {
          text-align: right;
        }

        .collections-table td {
          padding: 11px 13px;
          color: var(--admin-text-dim);
          border-bottom: 1px solid var(--admin-border);
          white-space: nowrap;
        }

        .collections-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .collections-table tbody tr:hover td {
          background: var(--admin-surface-2);
        }

        .collection-job {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--admin-text);
          font-weight: 700;
          text-decoration: none;
        }

        .collection-job:hover {
          color: var(--admin-accent);
        }

        .collection-job-icon {
          width: 27px;
          height: 27px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: var(--admin-accent-soft);
          color: var(--admin-accent);
        }

        .collection-job-icon .material-symbols-outlined {
          font-size: 15px;
        }

        .collection-muted {
          color: var(--admin-text-muted) !important;
        }

        .collection-fixxer {
          color: var(--admin-text);
        }

        /* ---------------------------------------------------------
           STATUS PANELS
        --------------------------------------------------------- */

        .status-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .status-panel {
          min-width: 0;
        }

        .status-panel-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }

        .status-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .status-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 45px;
          padding: 5px 0;
          border-bottom: 1px solid var(--admin-border);
        }

        .status-row:last-child {
          border-bottom: 0;
        }

        .status-row > strong {
          min-width: 28px;
          color: var(--admin-text);
          font-size: 15px;
          text-align: right;
        }

        /* ---------------------------------------------------------
           LOADING / ERROR
        --------------------------------------------------------- */

        .dashboard-loading {
          min-height: 320px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: var(--admin-text-muted);
          font-size: 11px;
        }

        .dashboard-error {
          display: flex;
          align-items: center;
          gap: 15px;
          max-width: 520px;
          margin: 50px auto;
        }

        .dashboard-error-icon {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 12px;
          background: var(--admin-error-soft);
          color: var(--admin-error);
        }

        .dashboard-error h3 {
          margin: 0;
          color: var(--admin-text);
          font-size: 14px;
        }

        .dashboard-error p {
          margin: 4px 0 0;
          color: var(--admin-text-dim);
          font-size: 11px;
        }

        /* ---------------------------------------------------------
           DARK MODE
        --------------------------------------------------------- */

        :global(.admin-theme-dark) .dashboard-kpi,
        :global(.admin-theme-dark) .dashboard-section {
          box-shadow:
            0 1px 0 rgba(255, 255, 255, 0.02),
            0 12px 32px rgba(0, 0, 0, 0.1);
        }

        /* ---------------------------------------------------------
           RESPONSIVE
        --------------------------------------------------------- */

        @media (max-width: 1200px) {
          .dashboard-metrics {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 900px) {
          .dashboard-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .revenue-grid {
            grid-template-columns: 1fr;
          }

          .status-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .dashboard-intro {
            align-items: flex-start;
            margin-bottom: 20px;
          }

          .dashboard-intro h1 {
            font-size: 26px;
          }

          .dashboard-intro p {
            font-size: 11px;
          }

          .dashboard-live {
            display: none;
          }

          .dashboard-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 9px;
            margin-bottom: 16px;
          }

          .dashboard-kpi {
            min-height: 132px;
            padding: 14px;
            border-radius: 14px;
          }

          .dashboard-kpi-icon {
            width: 35px;
            height: 35px;
          }

          .dashboard-kpi-icon .material-symbols-outlined {
            font-size: 18px;
          }

          .dashboard-kpi-value {
            margin-top: 17px;
            font-size: 24px;
          }

          .dashboard-kpi-label {
            font-size: 8px;
            letter-spacing: 0.45px;
          }

          .dashboard-kpi-arrow {
            width: 25px;
            height: 25px;
          }

          .dashboard-section {
            padding: 15px;
            border-radius: 15px;
            margin-bottom: 12px;
          }

          .dashboard-section-heading {
            margin-bottom: 14px;
          }

          .dashboard-section-heading h2,
          .status-panel-heading h2 {
            font-size: 14px;
          }

          .dashboard-section-heading p {
            font-size: 10px;
          }

          .dashboard-section-icon,
          .status-panel-icon {
            width: 34px;
            height: 34px;
          }

          .revenue-card {
            padding: 15px;
          }

          .revenue-main {
            font-size: 22px;
          }

          .collections-table {
            min-width: 610px;
          }

          .status-grid {
            gap: 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dashboard-kpi {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
