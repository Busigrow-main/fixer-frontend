"use client";

import { useState, useEffect } from "react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export default function ManageVisitsModal({ bookingId, technicianId, token, onClose }: { bookingId: string, technicianId?: string, token: string, onClose: () => void }) {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Visit State
  const [showNewVisit, setShowNewVisit] = useState(false);
  const [newVisit, setNewVisit] = useState({
    visitOrder: 1,
    jobDescription: "",
    scheduledDate: "",
    timeIn: "",
    timeOut: ""
  });

  useEffect(() => {
    fetchVisits();
  }, [bookingId]);

  const fetchVisits = async () => {
    try {
      const res = await fetch(`${API}/admin/visits/booking/${bookingId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setVisits(data || []);
      setNewVisit(prev => ({ ...prev, visitOrder: (data?.length || 0) + 1 }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!technicianId) return;
    try {
      const payload = { ...newVisit, bookingId, technicianId };
      if (payload.scheduledDate) payload.scheduledDate = new Date(payload.scheduledDate).toISOString();
      if (payload.timeIn) payload.timeIn = new Date(`1970-01-01T${payload.timeIn}`).toISOString();
      if (payload.timeOut) payload.timeOut = new Date(`1970-01-01T${payload.timeOut}`).toISOString();

      const res = await fetch(`${API}/admin/visits`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errData = await res.json();
        alert(`Failed to create visit: ${errData.message || "Unknown error"}`);
      } else {
        setShowNewVisit(false);
        fetchVisits();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const completeVisit = async (visitId: string) => {
    try {
      await fetch(`${API}/admin/visits/${visitId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "COMPLETED" })
      });
      fetchVisits();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ width: 600, maxWidth: '90vw' }} onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2>Manage Technician Visits</h2>
          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="admin-modal-body">
          {loading ? <div>Loading visits...</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {!technicianId && (
                <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 8, fontSize: 13, color: '#ef4444' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>warning</span>
                  No technician assigned to this booking. Please assign one first.
                </div>
              )}
              {visits.map((v, i) => (
                <div key={v._id} style={{ border: '1px solid var(--admin-border)', padding: 16, borderRadius: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700 }}>Visit #{v.visitOrder}</h3>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span className={`admin-badge admin-badge-${v.status.toLowerCase()}`}>{v.status}</span>
                      {v.status !== 'COMPLETED' && (
                        <button className="admin-btn admin-btn-sm admin-btn-primary" onClick={() => completeVisit(v._id)}>
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--admin-text-dim)', marginBottom: 8 }}>
                    <p><strong>Desc:</strong> {v.jobDescription}</p>
                    <p><strong>Date:</strong> {new Date(v.scheduledDate).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {v.timeIn ? new Date(v.timeIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--'} to {v.timeOut ? new Date(v.timeOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--'}</p>
                  </div>
                </div>
              ))}

              {!showNewVisit && visits.length < 5 && technicianId && (
                <button className="admin-btn admin-btn-secondary" onClick={() => setShowNewVisit(true)}>
                  + Schedule Visit
                </button>
              )}

              {showNewVisit && (
                <form onSubmit={handleCreateVisit} style={{ border: '2px dashed var(--admin-border)', padding: 16, borderRadius: 12 }}>
                  <h3 style={{ fontSize: 14, marginBottom: 16 }}>Schedule Visit #{newVisit.visitOrder}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                      <label className="admin-label">Scheduled Date</label>
                      <input required type="date" className="admin-input" onChange={e => setNewVisit({...newVisit, scheduledDate: e.target.value})} />
                    </div>
                    <div>
                      <label className="admin-label">Job Description</label>
                      <input required className="admin-input" placeholder="e.g. Compressor Repair" onChange={e => setNewVisit({...newVisit, jobDescription: e.target.value})} />
                    </div>
                    <div>
                      <label className="admin-label">Time In</label>
                      <input type="time" className="admin-input" onChange={e => setNewVisit({...newVisit, timeIn: e.target.value})} />
                    </div>
                    <div>
                      <label className="admin-label">Time Out</label>
                      <input type="time" className="admin-input" onChange={e => setNewVisit({...newVisit, timeOut: e.target.value})} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setShowNewVisit(false)}>Cancel</button>
                    <button type="submit" className="admin-btn admin-btn-primary">Create Visit</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
