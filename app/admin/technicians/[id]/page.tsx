"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export default function TechnicianDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && id) {
      fetchTechnicianDetails();
    }
  }, [token, id]);

  const fetchTechnicianDetails = async () => {
    try {
      const res = await fetch(`${API}/admin/technicians/${id}/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 40 }}>Loading technician profile...</div>;
  if (!data || !data.technician) return <div style={{ padding: 40 }}>Technician not found.</div>;

  const { technician, jobs } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "0 8px", maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => router.back()}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>{technician.name}</h2>
            <span className={`admin-badge admin-badge-${technician.availabilityStatus === 'AVAILABLE' ? 'success' : 'warning'}`}>
              {technician.availabilityStatus}
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--admin-text-dim)", marginTop: 4 }}>
            Joined {new Date(technician.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Top Cards */}
      <div className="admin-stats-grid">
        <div className="admin-card admin-metric-card">
          <div className="admin-metric-icon" style={{ background: "rgba(59, 130, 246, 0.12)", color: "#3b82f6" }}>⭐</div>
          <div>
            <div className="admin-metric-value">{technician.averageRating || "0"}</div>
            <div className="admin-metric-label">Average Rating</div>
          </div>
        </div>
        <div className="admin-card admin-metric-card">
          <div className="admin-metric-icon" style={{ background: "rgba(34, 197, 94, 0.12)", color: "#22c55e" }}>🛠</div>
          <div>
            <div className="admin-metric-value">{technician.totalCompletedJobs || "0"}</div>
            <div className="admin-metric-label">Jobs Completed</div>
          </div>
        </div>
        <div className="admin-card admin-metric-card">
          <div className="admin-metric-icon" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#f59e0b" }}>📞</div>
          <div>
            <div className="admin-metric-value" style={{ fontSize: 18, marginTop: 6, marginBottom: 6 }}>{technician.phone}</div>
            <div className="admin-metric-label">Contact</div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1, color: "var(--admin-text-muted)", marginBottom: 16 }}>
          Skillset
        </h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {technician.skills?.map((skill: string, i: number) => (
            <span key={i} style={{ padding: "6px 12px", background: "var(--admin-surface-2)", border: "1px solid var(--admin-border)", borderRadius: 100, fontSize: 12 }}>
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Jobs Tab */}
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Service History & Queue</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Service</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--admin-text-muted)" }}>
                    No jobs assigned yet.
                  </td>
                </tr>
              ) : (
                jobs.map((job: any) => (
                  <tr key={job._id}>
                    <td style={{ fontFamily: "monospace", fontSize: 11 }}>{job._id.slice(-8)}</td>
                    <td>{job.serviceId?.name || "—"}</td>
                    <td>{job.userId?.fullName || "—"}</td>
                    <td>
                      <span className={`admin-badge admin-badge-${job.status?.toLowerCase()}`}>{job.status?.replace("_", " ")}</span>
                    </td>
                    <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: "right" }}>
                      <Link href={`/admin/bookings/${job._id}`} className="admin-btn admin-btn-ghost admin-btn-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
