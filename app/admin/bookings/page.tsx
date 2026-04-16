"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { openJobSheet } from "@/app/admin/utils/jobsheet";
import ManageVisitsModal from "./ManageVisitsModal";
import Link from "next/link";

const STATUSES = ["ALL", "PENDING", "CONFIRMED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "RESCHEDULED", "CANCELLED"];
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export default function AdminBookingsPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [noteModal, setNoteModal] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [visitModal, setVisitModal] = useState<string | null>(null);

  const limit = 15;
  const totalPages = Math.ceil(total / limit);

  const fetchBookings = () => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status !== "ALL") params.set("status", status);

    fetch(`${API}/admin/bookings?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((res) => {
        setBookings(res.data || []);
        setTotal(res.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
    if (token && technicians.length === 0) {
      fetch(`${API}/admin/technicians`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(res => {
          if (Array.isArray(res)) setTechnicians(res);
          else console.error("Expected array but got", res);
        })
        .catch(console.error);
    }
  }, [token, page, status]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await fetch(`${API}/admin/bookings/${id}/status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchBookings();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAssignTechnician = async (id: string, technicianId: string) => {
    setUpdatingId(id);
    try {
      await fetch(`${API}/admin/bookings/${id}/assign`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ technicianId }),
      });
      fetchBookings();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddNote = async () => {
    if (!noteModal || !noteText.trim()) return;
    try {
      await fetch(`${API}/admin/bookings/${noteModal}/notes`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteText }),
      });
      setNoteModal(null);
      setNoteText("");
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const exportCsv = () => {
    if (!token) return;
    fetch(`${API}/admin/bookings/export`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "bookings-export.csv";
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Service Bookings</h2>
          <p style={{ fontSize: 13, color: "var(--admin-text-dim)", marginTop: 4 }}>{total} total bookings</p>
        </div>
        <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={exportCsv}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`admin-btn admin-btn-sm ${status === s ? "admin-btn-primary" : "admin-btn-secondary"}`}
            onClick={() => { setStatus(s); setPage(1); }}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Technician</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 40 }}>
                  <div className="admin-spinner" style={{ margin: "0 auto" }} />
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--admin-text-muted)" }}>
                  No bookings found
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b._id}>
                  <td style={{ fontFamily: "monospace", fontSize: 11 }}>{b._id?.slice(-8)}</td>
                  <td>{b.userId?.fullName || b.userId?.phone || "—"}</td>
                  <td>{b.serviceId?.name || "—"}</td>
                  <td>
                    <select
                      className="admin-input admin-select"
                      style={{ height: 28, fontSize: 11, width: 110, padding: "0 20px 0 8px" }}
                      value={b.technicianId?._id || b.technicianId || ""}
                      onChange={(e) => handleAssignTechnician(b._id, e.target.value)}
                      disabled={updatingId === b._id}
                    >
                      <option value="">Unassigned</option>
                      {technicians.map((t) => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className={`admin-badge admin-badge-${b.status?.toLowerCase()}`}>
                      {b.status?.replace("_", " ")}
                    </span>
                  </td>
                  <td>{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <Link href={`/admin/bookings/${b._id}`} className="admin-btn admin-btn-secondary admin-btn-sm" style={{ padding: "6px 10px" }} title="Details">
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>visibility</span>
                      </Link>
                      <select
                        className="admin-input admin-select"
                        style={{ height: 30, fontSize: 11, width: 115, padding: "0 22px 0 8px" }}
                        value={b.status}
                        onChange={(e) => handleStatusChange(b._id, e.target.value)}
                        disabled={updatingId === b._id}
                      >
                        {STATUSES.filter((s) => s !== "ALL").map((s) => (
                          <option key={s} value={s}>{s.replace("_", " ")}</option>
                        ))}
                      </select>
                      <button
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                        style={{ padding: "6px" }}
                        onClick={() => setNoteModal(b._id)}
                        title="Add Admin Note"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>sticky_note_2</span>
                      </button>
                      <button
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                        style={{ padding: "6px" }}
                        onClick={() => setVisitModal(b._id)}
                        title="Manage Visits & Parts"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>build</span>
                      </button>
                      <button
                        className="admin-btn admin-btn-primary admin-btn-sm"
                        style={{ padding: "6px 10px" }}
                        title="Print Job Sheet"
                        onClick={async () => {
                          try {
                            const res = await fetch(`${API}/admin/bookings/${b._id}`, {
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            const data = await res.json();
                            openJobSheet(data);
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>print</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="admin-pagination">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="admin-pagination-btns">
              <button className="admin-pagination-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                ‹
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`admin-pagination-btn ${page === p ? "active" : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button className="admin-pagination-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Note Modal */}
      {noteModal && (
        <div className="admin-modal-overlay" onClick={() => setNoteModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Add Admin Note</h2>
              <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setNoteModal(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="admin-modal-body">
              <textarea
                className="admin-input admin-textarea"
                placeholder="Enter your note..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setNoteModal(null)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={handleAddNote}>Save Note</button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Visits Modal */}
      {visitModal && (
        <ManageVisitsModal 
          bookingId={visitModal} 
          token={token || ""} 
          onClose={() => setVisitModal(null)} 
        />
      )}
    </div>
  );
}
