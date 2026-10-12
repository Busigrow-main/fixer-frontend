"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
const STATUSES = ["ALL", "PENDING", "QUOTED", "ACCEPTED", "DECLINED", "CANCELLED", "CONVERTED"];

type HelpRequest = {
  _id: string;
  status: string;
  quantity: number;
  createdAt: string;
  contactData?: { name?: string; phone?: string; email?: string; address?: string };
  partDescription?: string;
  notes?: string;
  requestedSparePartId?: { name?: string; partNumber?: string };
  suggestedSparePartId?: { name?: string; partNumber?: string };
  quotedPrice?: number;
  isAvailable?: boolean;
  adminResponse?: string;
};

export default function AdminPartHelpPage() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<HelpRequest | null>(null);
  const [response, setResponse] = useState("");
  const [available, setAvailable] = useState(true);
  const [quotedPrice, setQuotedPrice] = useState("");
  const [suggestedPartId, setSuggestedPartId] = useState("");
  const [parts, setParts] = useState<Array<{ _id: string; name: string; partNumber?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadRequests = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (status !== "ALL") params.set("status", status);
      const res = await fetch(`${API}/admin/shop-part-help?${params}`, {
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) throw new Error("Could not load part help requests.");
      const data = await res.json();
      setRequests(Array.isArray(data.data) ? data.data : []);
      setTotal(Number(data.total) || 0);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load part help requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, [token, page, status]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/spare-parts?limit=100`, {
      headers: { Authorization: "Bearer " + token },
    })
      .then((res) => res.json())
      .then((data) => setParts(Array.isArray(data.data) ? data.data : []))
      .catch(() => setParts([]));
  }, [token]);

  const openRequest = (request: HelpRequest) => {
    setSelected(request);
    setResponse(request.adminResponse || "");
    setAvailable(request.isAvailable !== false);
    setQuotedPrice(request.quotedPrice == null ? "" : String(request.quotedPrice));
    setSuggestedPartId(typeof request.suggestedSparePartId === "object" ? "" : String(request.suggestedSparePartId || ""));
    setMessage("");
  };

  const saveQuote = async () => {
    if (!token || !selected) return;
    if (!response.trim()) {
      setMessage("Add an admin response before sending the quote.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`${API}/admin/shop-part-help/${selected._id}/quote`, {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isAvailable: available,
          adminResponse: response.trim(),
          ...(available && suggestedPartId ? { suggestedSparePartId: suggestedPartId } : {}),
          ...(available && quotedPrice !== "" ? { quotedPrice: Number(quotedPrice) } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Could not save quote.");
      setSelected(null);
      setMessage("Quote sent to the customer.");
      await loadRequests();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save quote.");
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800 }}>Part Help Requests</h2>
          <p style={{ fontSize: 13, color: "var(--admin-text-dim)", marginTop: 4 }}>
            Customers who need help identifying or sourcing a spare part.
          </p>
        </div>
        <Link href="/admin/spare-parts" className="admin-btn admin-btn-secondary admin-btn-sm">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>build</span>
          Spare Parts Catalogue
        </Link>
      </div>

      {message && <div className="admin-card" style={{ padding: 12, marginBottom: 16 }}>{message}</div>}

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <select className="admin-input admin-select" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
          {STATUSES.map((value) => <option key={value} value={value}>{value.replace("_", " ")}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="admin-card" style={{ padding: 32, textAlign: "center" }}>Loading part help requests...</div>
      ) : requests.length === 0 ? (
        <div className="admin-card" style={{ padding: 32, textAlign: "center" }}>No part help requests found.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Customer</th><th>Request</th><th>Status</th><th>Created</th><th>Action</th></tr></thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id}>
                  <td><strong>{request.contactData?.name || "—"}</strong><br /><small>{request.contactData?.phone || "—"}</small></td>
                  <td>{request.partDescription || request.notes || "Part identification help"}<br /><small>Quantity: {request.quantity || 1}</small></td>
                  <td><span className={`admin-badge admin-badge-${request.status.toLowerCase()}`}>{request.status}</span></td>
                  <td>{request.createdAt ? new Date(request.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                  <td><button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => openRequest(request)}>{request.status === "PENDING" || request.status === "QUOTED" ? "Review" : "View"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
        <span style={{ fontSize: 13, color: "var(--admin-text-dim)" }}>{total} total requests</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="admin-btn admin-btn-secondary admin-btn-sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
          <span style={{ padding: "7px 4px", fontSize: 13 }}>Page {page} of {totalPages}</span>
          <button className="admin-btn admin-btn-secondary admin-btn-sm" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>Next</button>
        </div>
      </div>

      {selected && (
        <div className="admin-modal-backdrop" onClick={() => setSelected(null)}>
          <div className="admin-card" style={{ maxWidth: 680, width: "calc(100% - 32px)", maxHeight: "90vh", overflowY: "auto", padding: 24 }} onClick={(event) => event.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div><h3 style={{ fontSize: 18, fontWeight: 800 }}>Review Part Help Request</h3><p style={{ fontSize: 13, color: "var(--admin-text-dim)", marginTop: 4 }}>{selected.contactData?.name} · {selected.contactData?.phone}</p></div>
              <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setSelected(null)}>Close</button>
            </div>
            <div style={{ margin: "20px 0", fontSize: 14, lineHeight: 1.6 }}>
              <strong>Customer request</strong>
              <p>{selected.partDescription || selected.notes || "No description provided."}</p>
              <p>Quantity: {selected.quantity || 1}</p>
              {selected.contactData?.address && <p>Address: {selected.contactData.address}</p>}
            </div>
            {selected.status === "PENDING" || selected.status === "QUOTED" ? (
              <div style={{ display: "grid", gap: 12 }}>
                <label className="admin-label">Availability<select className="admin-input admin-select" value={available ? "available" : "unavailable"} onChange={(event) => setAvailable(event.target.value === "available")}><option value="available">Available / can quote</option><option value="unavailable">Unavailable</option></select></label>
                {available && <label className="admin-label">Suggested spare part<select className="admin-input admin-select" value={suggestedPartId} onChange={(event) => setSuggestedPartId(event.target.value)}><option value="">Select a part</option>{parts.map((part) => <option key={part._id} value={part._id}>{part.name}{part.partNumber ? ` (${part.partNumber})` : ""}</option>)}</select></label>}
                {available && <label className="admin-label">Quoted price<input className="admin-input" type="number" min="0" step="0.01" value={quotedPrice} onChange={(event) => setQuotedPrice(event.target.value)} /></label>}
                <label className="admin-label">Response to customer<textarea className="admin-input" rows={5} value={response} onChange={(event) => setResponse(event.target.value)} placeholder="Explain the suggestion, availability, or next steps." /></label>
                <button className="admin-btn admin-btn-primary" disabled={saving} onClick={saveQuote}>{saving ? "Sending..." : "Send Quote / Response"}</button>
              </div>
            ) : (
              <div className="admin-card" style={{ padding: 12 }}><strong>Admin response</strong><p style={{ marginTop: 8 }}>{selected.adminResponse || "No response recorded."}</p></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
