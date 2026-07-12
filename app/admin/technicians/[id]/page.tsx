"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

function verificationBadgeClass(status?: string) {
  switch (status) {
    case "VERIFIED":
      return "admin-badge-success";
    case "PENDING":
    case "REQUESTED":
      return "admin-badge-pending";
    case "REJECTED":
      return "admin-badge-error";
    default:
      return "admin-badge-ghost";
  }
}

function docStatusBadgeClass(status?: string) {
  switch (status) {
    case "VERIFIED":
      return "admin-badge-success";
    case "PENDING":
      return "admin-badge-pending";
    case "REJECTED":
      return "admin-badge-error";
    default:
      return "admin-badge-ghost";
  }
}

export default function TechnicianDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();

  const [data, setData] = useState<any>(null);
  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ docId: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (token && id) {
      fetchAll();
    }
  }, [token, id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [detailsRes, verificationRes] = await Promise.all([
        fetch(`${API}/admin/technicians/${id}/details`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/admin/technicians/${id}/verification`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const details = await detailsRes.json();
      const verificationData = await verificationRes.json();
      setData(details);
      setVerification(verificationData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runAction = async (key: string, fn: () => Promise<void>) => {
    setActionLoading(key);
    try {
      await fn();
      await fetchAll();
    } catch (err) {
      console.error(err);
      alert("Action failed. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const approveDocument = (docId: string) =>
    runAction(`approve-${docId}`, async () => {
      const res = await fetch(`${API}/admin/technicians/verifications/${docId}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Approve failed");
    });

  const rejectDocument = (docId: string, reason: string) =>
    runAction(`reject-${docId}`, async () => {
      const res = await fetch(`${API}/admin/technicians/verifications/${docId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Reject failed");
      setRejectModal(null);
      setRejectReason("");
    });

  const requestVerification = () =>
    runAction("request", async () => {
      const res = await fetch(`${API}/admin/technicians/${id}/verification/request`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Request failed");
    });

  const toggleActive = (activate: boolean) =>
    runAction(activate ? "activate" : "deactivate", async () => {
      const res = await fetch(`${API}/admin/technicians/${id}/${activate ? "activate" : "deactivate"}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Toggle failed");
    });

  if (loading) return <div style={{ padding: 40 }}>Loading technician profile...</div>;
  if (!data?.technician) return <div style={{ padding: 40 }}>Technician not found.</div>;

  const { technician, jobs } = data;
  const techVerification = verification?.technician;
  const documents = verification?.documents || [];
  const pendingDocs = documents.filter((d: any) => d.status === "PENDING");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "0 8px", maxWidth: 1000 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => router.back()}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>{technician.name}</h2>
            <span className={`admin-badge ${verificationBadgeClass(techVerification?.verificationStatus || technician.verificationStatus)}`}>
              {(techVerification?.verificationStatus || technician.verificationStatus || "NOT_REQUESTED").replace("_", " ")}
            </span>
            <span className={`admin-badge admin-badge-${technician.availabilityStatus === "AVAILABLE" ? "success" : "warning"}`}>
              {technician.availabilityStatus}
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--admin-text-dim)", marginTop: 4 }}>
            Joined {new Date(technician.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {technician.isActive ? (
            <button
              className="admin-btn admin-btn-secondary admin-btn-sm"
              disabled={!!actionLoading}
              onClick={() => toggleActive(false)}
            >
              Deactivate
            </button>
          ) : (
            <button
              className="admin-btn admin-btn-primary admin-btn-sm"
              disabled={!!actionLoading}
              onClick={() => toggleActive(true)}
            >
              Activate
            </button>
          )}
        </div>
      </div>

      {/* Verification Panel */}
      <div className="admin-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Identity Verification</h3>
            <p style={{ fontSize: 13, color: "var(--admin-text-dim)" }}>
              Review uploaded ID documents and approve or reject the technician.
            </p>
          </div>
          {["NOT_REQUESTED", "REJECTED"].includes(techVerification?.verificationStatus || technician.verificationStatus) && (
            <button
              className="admin-btn admin-btn-primary admin-btn-sm"
              disabled={actionLoading === "request"}
              onClick={requestVerification}
            >
              Request ID Upload
            </button>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--admin-text-muted)", marginBottom: 4 }}>Onboarding</div>
            <span className="admin-badge admin-badge-processing">{techVerification?.onboardingStatus || technician.onboardingStatus}</span>
          </div>
          <div>
            <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--admin-text-muted)", marginBottom: 4 }}>ID Verified</div>
            <span className={`admin-badge ${techVerification?.idVerified ? "admin-badge-success" : "admin-badge-ghost"}`}>
              {techVerification?.idVerified ? "Yes" : "No"}
            </span>
          </div>
          <div>
            <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--admin-text-muted)", marginBottom: 4 }}>Profile</div>
            <span className={`admin-badge ${techVerification?.profileCompleted ? "admin-badge-success" : "admin-badge-ghost"}`}>
              {techVerification?.profileCompleted ? "Complete" : "Incomplete"}
            </span>
          </div>
          <div>
            <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--admin-text-muted)", marginBottom: 4 }}>Joining Fee</div>
            <span className={`admin-badge ${techVerification?.joiningFeePaid ? "admin-badge-success" : "admin-badge-ghost"}`}>
              {techVerification?.joiningFeePaid ? "Paid" : "Unpaid"}
            </span>
          </div>
        </div>

        {(techVerification?.aadhaarNumber || techVerification?.panNumber || techVerification?.address) && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 24, padding: 16, background: "var(--admin-surface-2)", borderRadius: 8 }}>
            {techVerification?.aadhaarNumber && (
              <div>
                <div style={{ fontSize: 11, color: "var(--admin-text-muted)" }}>Aadhaar</div>
                <div style={{ fontSize: 13, fontFamily: "monospace" }}>{techVerification.aadhaarNumber}</div>
              </div>
            )}
            {techVerification?.panNumber && (
              <div>
                <div style={{ fontSize: 11, color: "var(--admin-text-muted)" }}>PAN</div>
                <div style={{ fontSize: 13, fontFamily: "monospace" }}>{techVerification.panNumber}</div>
              </div>
            )}
            {(techVerification?.address || techVerification?.city || techVerification?.pincode) && (
              <div>
                <div style={{ fontSize: 11, color: "var(--admin-text-muted)" }}>Address</div>
                <div style={{ fontSize: 13 }}>
                  {[techVerification.address, techVerification.city, techVerification.pincode].filter(Boolean).join(", ")}
                </div>
              </div>
            )}
          </div>
        )}

        {techVerification?.rejectionReason && (
          <div style={{ padding: 12, marginBottom: 16, background: "var(--admin-error-soft)", borderRadius: 8, fontSize: 13, color: "var(--admin-error)" }}>
            Rejection reason: {techVerification.rejectionReason}
          </div>
        )}

        <h4 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: "var(--admin-text-muted)", marginBottom: 12 }}>
          Uploaded Documents {pendingDocs.length > 0 && `(${pendingDocs.length} pending)`}
        </h4>

        {documents.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--admin-text-muted)", padding: "16px 0" }}>
            No documents uploaded yet.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Uploaded</th>
                  <th>Document</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc: any) => (
                  <tr key={doc._id}>
                    <td style={{ fontWeight: 600 }}>{doc.documentType?.replace("_", " ")}</td>
                    <td>
                      <span className={`admin-badge ${docStatusBadgeClass(doc.status)}`}>{doc.status}</span>
                    </td>
                    <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                    <td>
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn-ghost admin-btn-sm">
                        View File
                      </a>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {doc.status === "PENDING" && (
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                          <button
                            className="admin-btn admin-btn-primary admin-btn-sm"
                            disabled={!!actionLoading}
                            onClick={() => approveDocument(doc._id)}
                          >
                            Approve
                          </button>
                          <button
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                            disabled={!!actionLoading}
                            onClick={() => setRejectModal({ docId: doc._id })}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {doc.status === "REJECTED" && doc.rejectionReason && (
                        <span style={{ fontSize: 12, color: "var(--admin-error)" }}>{doc.rejectionReason}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

      {rejectModal && (
        <div className="admin-modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Reject Document</h2>
              <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setRejectModal(null)}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
              </button>
            </div>
            <div className="admin-modal-body">
              <label className="admin-label">Reason for rejection</label>
              <textarea
                className="admin-input"
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Document is blurry or does not match profile"
                style={{ resize: "vertical", width: "100%" }}
              />
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setRejectModal(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                disabled={!rejectReason.trim() || !!actionLoading}
                onClick={() => rejectDocument(rejectModal.docId, rejectReason)}
              >
                Reject Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
