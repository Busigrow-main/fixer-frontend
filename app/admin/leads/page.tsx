"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

interface Lead {
  _id: string;
  userId: string;
  type: "BUSINESS" | "TECHNICIAN";
  name: string;
  phone: string;
  email?: string;
  shopName?: string;
  shopAddress?: string;
  address?: string;
  applianceExpertise?: string;
  status: "NEW" | "CONTACTED" | "IN_PROGRESS" | "CONVERTED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api/v1";

export default function LeadsPage() {
  const { token } = useAuth();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLeads = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/leads`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Failed to fetch leads.");
      }

      setLeads(result);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading leads.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [token]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getBadgeClass = (status: Lead["status"]) => {
    switch (status) {
      case "NEW":
        return "admin-badge admin-badge-pending";

      case "CONTACTED":
        return "admin-badge admin-badge-confirmed";

      case "IN_PROGRESS":
        return "admin-badge admin-badge-in_progress";

      case "CONVERTED":
        return "admin-badge admin-badge-completed";

      case "REJECTED":
        return "admin-badge admin-badge-cancelled";

      default:
        return "admin-badge admin-badge-ghost";
    }
  };

  return (
    <div className="admin-content">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              marginBottom: "6px",
            }}
          >
            Leads
          </h1>

          <p
            style={{
              fontSize: "13px",
              color: "var(--admin-text-dim)",
            }}
          >
            Manage business and technician inquiries.
          </p>
        </div>

        <button
          type="button"
          className="admin-btn admin-btn-secondary"
          onClick={fetchLeads}
          disabled={loading}
        >
          <span className="material-symbols-outlined">refresh</span>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid" style={{ marginBottom: "24px" }}>
        <div className="admin-card admin-metric-card">
          <div
            className="admin-metric-icon"
            style={{
              background: "var(--admin-info-soft)",
              color: "var(--admin-info)",
            }}
          >
            <span className="material-symbols-outlined">contact_page</span>
          </div>

          <div className="admin-metric-value">{leads.length}</div>

          <div className="admin-metric-label">Total Leads</div>
        </div>

        <div className="admin-card admin-metric-card">
          <div
            className="admin-metric-icon"
            style={{
              background: "var(--admin-accent-soft)",
              color: "var(--admin-accent)",
            }}
          >
            <span className="material-symbols-outlined">business</span>
          </div>

          <div className="admin-metric-value">
            {leads.filter((lead) => lead.type === "BUSINESS").length}
          </div>

          <div className="admin-metric-label">Business Leads</div>
        </div>

        <div className="admin-card admin-metric-card">
          <div
            className="admin-metric-icon"
            style={{
              background: "var(--admin-success-soft)",
              color: "var(--admin-success)",
            }}
          >
            <span className="material-symbols-outlined">engineering</span>
          </div>

          <div className="admin-metric-value">
            {leads.filter((lead) => lead.type === "TECHNICIAN").length}
          </div>

          <div className="admin-metric-label">Technician Leads</div>
        </div>

        <div className="admin-card admin-metric-card">
          <div
            className="admin-metric-icon"
            style={{
              background: "var(--admin-warning-soft)",
              color: "var(--admin-warning)",
            }}
          >
            <span className="material-symbols-outlined">priority_high</span>
          </div>

          <div className="admin-metric-value">
            {leads.filter((lead) => lead.status === "NEW").length}
          </div>

          <div className="admin-metric-label">New Leads</div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="admin-card"
          style={{
            marginBottom: "24px",
            color: "var(--admin-error)",
            borderColor: "var(--admin-error)",
          }}
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div
          className="admin-card"
          style={{
            minHeight: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="admin-spinner" />
        </div>
      ) : leads.length === 0 ? (
        /* Empty */
        <div className="admin-card admin-empty">
          <span className="material-symbols-outlined">contact_page</span>

          <h3
            style={{
              color: "var(--admin-text)",
              fontSize: "16px",
              fontWeight: 600,
              marginBottom: "6px",
            }}
          >
            No leads yet
          </h3>

          <p>
            Business and technician inquiries will appear here.
          </p>
        </div>
      ) : (
        /* Table */
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Business / Expertise</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>

            <tbody>
              {leads.map((lead) => (
                <tr key={lead._id}>
                  <td>{lead.name}</td>

                  <td>
                    <span
                      className={
                        lead.type === "BUSINESS"
                          ? "admin-badge admin-badge-admin"
                          : "admin-badge admin-badge-customer"
                      }
                    >
                      {lead.type}
                    </span>
                  </td>

                  <td>{lead.phone}</td>

                  <td>{lead.email || "—"}</td>

                  <td>
                    {lead.type === "BUSINESS"
                      ? lead.shopName || "—"
                      : lead.applianceExpertise || "—"}
                  </td>

                  <td>
                    <span className={getBadgeClass(lead.status)}>
                      {lead.status.replace("_", " ")}
                    </span>
                  </td>

                  <td>{formatDate(lead.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}