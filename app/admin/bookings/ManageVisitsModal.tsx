"use client";

import { useState, useEffect } from "react";
import {
  filterAssignableTechnicians,
  needsAssignBeforeVisit,
  resolveVisitTechnicianId,
} from "@/app/lib/admin-manage-visits";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

type TechOption = { _id: string; name?: string; isActive?: boolean; idVerified?: boolean };

export default function ManageVisitsModal({
  bookingId,
  technicianId,
  technicians = [],
  token,
  onClose,
  onAssigned,
}: {
  bookingId: string;
  technicianId?: string;
  technicians?: TechOption[];
  token: string;
  onClose: () => void;
  onAssigned?: () => void;
}) {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickedTechId, setPickedTechId] = useState("");
  const [availableTechs, setAvailableTechs] = useState<TechOption[]>(technicians);

  // New Visit State
  const [showNewVisit, setShowNewVisit] = useState(false);
  const [newVisit, setNewVisit] = useState({
    visitOrder: 1,
    jobDescription: "",
    scheduledDate: "",
    timeIn: "",
    timeOut: ""
  });

  const assignableTechs = filterAssignableTechnicians(availableTechs);
  const effectiveTechId = resolveVisitTechnicianId(technicianId, pickedTechId);

  useEffect(() => {
    fetchVisits();
    fetchAvailableTechnicians();
  }, [bookingId]);

  const fetchAvailableTechnicians = async () => {
    try {
      const res = await fetch(`${API}/admin/technicians/available`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setAvailableTechs(data);
        return;
      }
      // Fallback: parent list filtered to AVAILABLE via engine rule.
      setAvailableTechs(technicians);
    } catch (err) {
      console.error(err);
      setAvailableTechs(technicians);
    }
  };

  const fetchVisits = async () => {
    try {
      const res = await fetch(`${API}/admin/visits/booking/${bookingId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setVisits(Array.isArray(data) ? data : []);
      setNewVisit(prev => ({ ...prev, visitOrder: (Array.isArray(data) ? data.length : 0) + 1 }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveTechId) {
      alert("Select a technician before scheduling a visit.");
      return;
    }
    try {
      // Assign booking when opening visits on an unassigned job.
      if (needsAssignBeforeVisit(technicianId)) {
        const assignRes = await fetch(`${API}/admin/bookings/${bookingId}/assign`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ technicianId: effectiveTechId }),
        });
        if (!assignRes.ok) {
          const errData = await assignRes.json().catch(() => ({}));
          alert(
            (typeof errData?.message === "string" && errData.message) ||
              "Failed to assign technician",
          );
          return;
        }
        onAssigned?.();
      }

      const payload = { ...newVisit, bookingId, technicianId: effectiveTechId };
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
                <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 8, fontSize: 13, color: '#f59e0b' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>info</span>
                  No technician yet — pick one when you schedule the first visit (assigns the booking too).
                </div>
              )}
              {visits.map((v) => (
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

              {!showNewVisit && visits.length < 5 && (
                <button className="admin-btn admin-btn-secondary" onClick={() => setShowNewVisit(true)}>
                  + Schedule Visit
                </button>
              )}

              {showNewVisit && (
                <form onSubmit={handleCreateVisit} style={{ border: '2px dashed var(--admin-border)', padding: 16, borderRadius: 12 }}>
                  <h3 style={{ fontSize: 14, marginBottom: 16 }}>Schedule Visit #{newVisit.visitOrder}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    {!technicianId && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label className="admin-label">Available technicians</label>
                        <select
                          required
                          className="admin-input admin-select"
                          value={pickedTechId}
                          onChange={(e) => setPickedTechId(e.target.value)}
                        >
                          <option value="">
                            {assignableTechs.length
                              ? "Select technician"
                              : "No available technicians"}
                          </option>
                          {assignableTechs.map((t) => (
                            <option key={t._id} value={t._id}>
                              {t.name || t._id}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
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
