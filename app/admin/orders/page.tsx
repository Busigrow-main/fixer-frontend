"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
const STATUSES = ["ALL", "PENDING", "PROCESSING", "DISPATCHED", "DELIVERED", "CANCELLED", "RETURNED"];

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [trackingModal, setTrackingModal] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState({ courierName: "", trackingNumber: "" });

  const limit = 15;
  const totalPages = Math.ceil(total / limit);

  const fetchOrders = () => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status !== "ALL") params.set("status", status);

    fetch(`${API}/admin/part-orders?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((res) => {
        setOrders(res.data || []);
        setTotal(res.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [token, page, status]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetch(`${API}/admin/part-orders/${id}/status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrackingSubmit = async () => {
    if (!trackingModal) return;
    try {
      await fetch(`${API}/admin/part-orders/${trackingModal}/tracking`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(trackingData),
      });
      setTrackingModal(null);
      setTrackingData({ courierName: "", trackingNumber: "" });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Part Orders</h2>
        <p style={{ fontSize: 13, color: "var(--admin-text-dim)", marginTop: 4 }}>{total} total orders</p>
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
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Tracking</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: 40 }}><div className="admin-spinner" style={{ margin: "0 auto" }} /></td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--admin-text-muted)" }}>No orders found</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o._id}>
                  <td style={{ fontFamily: "monospace", fontSize: 11 }}>{o._id?.slice(-8)}</td>
                  <td>{o.userId?.fullName || o.contactData?.name || "—"}</td>
                  <td>{o.items?.length || 0} item(s)</td>
                  <td>{o.contactData?.phone || "—"}</td>
                  <td>
                    <span className={`admin-badge admin-badge-${o.status?.toLowerCase()}`}>
                      {o.status?.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    {o.courierTracking ? (
                      <span style={{ fontSize: 11 }}>
                        {o.courierTracking.courierName}: {o.courierTracking.trackingNumber}
                      </span>
                    ) : (
                      <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setTrackingModal(o._id)}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span> Track
                      </button>
                    )}
                  </td>
                  <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</td>
                  <td>
                    <select
                      className="admin-input admin-select"
                      style={{ height: 32, fontSize: 11, width: 130, padding: "0 28px 0 8px" }}
                      value={o.status}
                      onChange={(e) => handleStatusChange(o._id, e.target.value)}
                    >
                      {STATUSES.filter((s) => s !== "ALL").map((s) => (
                        <option key={s} value={s}>{s.replace("_", " ")}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="admin-pagination">
            <span>Page {page} of {totalPages}</span>
            <div className="admin-pagination-btns">
              <button className="admin-pagination-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <button key={p} className={`admin-pagination-btn ${page === p ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="admin-pagination-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>›</button>
            </div>
          </div>
        )}
      </div>

      {/* Tracking Modal */}
      {trackingModal && (
        <div className="admin-modal-overlay" onClick={() => setTrackingModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Add Tracking Info</h2>
              <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setTrackingModal(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="admin-modal-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="admin-label">Courier Name</label>
                <input
                  className="admin-input"
                  placeholder="e.g. BlueDart, DTDC"
                  value={trackingData.courierName}
                  onChange={(e) => setTrackingData({ ...trackingData, courierName: e.target.value })}
                />
              </div>
              <div>
                <label className="admin-label">Tracking Number</label>
                <input
                  className="admin-input"
                  placeholder="Enter tracking number"
                  value={trackingData.trackingNumber}
                  onChange={(e) => setTrackingData({ ...trackingData, trackingNumber: e.target.value })}
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setTrackingModal(null)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={handleTrackingSubmit}>Save & Mark Dispatched</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
