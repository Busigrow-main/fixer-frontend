"use client";

import { useState, useEffect } from "react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export default function AddPartModal({ bookingId, technicianId, token, onClose, onAdded }: { bookingId: string, technicianId?: string, token: string, onClose: () => void, onAdded: () => void }) {
  const [visits, setVisits] = useState<any[]>([]);
  const [spareParts, setSpareParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [partData, setPartData] = useState({
    visitId: "",
    isThirdParty: false,
    partName: "",
    vendor: "",
    quantity: 1,
    cost: 0,
    sparePartId: ""
  });

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchVisits(), fetchSpareParts()]);
      setLoading(false);
    };
    init();
  }, [bookingId]);

  const fetchVisits = async () => {
    try {
      const res = await fetch(`${API}/admin/visits/booking/${bookingId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setVisits(data || []);
      if (data && data.length > 0) {
        setPartData(prev => ({ ...prev, visitId: data[data.length - 1]._id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSpareParts = async () => {
    try {
      const res = await fetch(`${API}/spare-parts?limit=200`);
      const data = await res.json();
      setSpareParts(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let targetVisitId = partData.visitId;

    try {
      // 1. If NO visit exists, auto-create a "Service Visit"
      if (!targetVisitId) {
        const visitPayload = {
          bookingId,
          technicianId,
          visitOrder: 1,
          jobDescription: "Automated Service Visit for Parts Logging",
          scheduledDate: new Date().toISOString(),
          status: "COMPLETED"
        };
        console.log("Creating automated visit with payload:", visitPayload);
        const vRes = await fetch(`${API}/admin/visits`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(visitPayload)
        });
        
        if (!vRes.ok) {
          const errData = await vRes.json();
          console.error("Visit creation failed:", errData);
          alert(`Failed to create visit: ${errData.message || "Unknown error"}`);
          setSaving(false);
          return;
        }

        const newVisit = await vRes.json();
        targetVisitId = newVisit._id;
      }

      console.log("Adding part to visit:", targetVisitId, partData);
      const res = await fetch(`${API}/admin/visits/${targetVisitId}/parts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(partData)
      });
      
      if (!res.ok) {
        const errData = await res.json();
        console.error("Part addition failed:", errData);
        alert(`Failed to add part: ${errData.message || "Unknown error"}`);
      } else {
        onAdded();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ width: 500 }} onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2>Add Spare Part</h2>
          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSave}>
          <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {loading ? <div>Loading...</div> : (
              <>
                {!technicianId ? (
                  <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 8, fontSize: 13, color: '#ef4444' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>warning</span>
                    No technician assigned to this booking. Please assign a technician first to add parts.
                  </div>
                ) : visits.length > 0 ? (
                  <div>
                    <label className="admin-label">Attach to Visit</label>
                    <select 
                      className="admin-input admin-select" 
                      value={partData.visitId} 
                      onChange={e => setPartData({...partData, visitId: e.target.value})}
                    >
                      {visits.map(v => <option key={v._id} value={v._id}>Visit #{v.visitOrder} ({new Date(v.scheduledDate).toLocaleDateString()})</option>)}
                    </select>
                  </div>
                ) : (
                  <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 8, fontSize: 13, color: '#3b82f6' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>info</span>
                    No visits recorded. A default visit will be created automatically.
                  </div>
                )}

                <div>
                  <label className="admin-label">Part Type</label>
                  <select 
                    className="admin-input admin-select" 
                    value={partData.isThirdParty ? 'true' : 'false'} 
                    onChange={e => setPartData({...partData, isThirdParty: e.target.value === 'true'})}
                  >
                    <option value="false">In-House Inventory</option>
                    <option value="true">3rd Party Purchase (External)</option>
                  </select>
                </div>

                {!partData.isThirdParty ? (
                  <div>
                    <label className="admin-label">Select Part from Inventory</label>
                    <select 
                      required 
                      className="admin-input admin-select" 
                      onChange={e => setPartData({...partData, sparePartId: e.target.value})}
                    >
                      <option value="">-- select part --</option>
                      {spareParts.map(sp => <option key={sp._id} value={sp._id}>{sp.name} [₹{sp.price}] (In Stock: {sp.stockQuantity})</option>)}
                    </select>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="admin-label">Part Name</label>
                      <input required className="admin-input" placeholder="e.g. Copper Pipe" onChange={e => setPartData({...partData, partName: e.target.value})} />
                    </div>
                    <div>
                      <label className="admin-label">Vendor Name</label>
                      <input required className="admin-input" placeholder="e.g. Local Hardware Store" onChange={e => setPartData({...partData, vendor: e.target.value})} />
                    </div>
                  </>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label className="admin-label">Quantity</label>
                    <input required type="number" min="1" className="admin-input" value={partData.quantity} onChange={e => setPartData({...partData, quantity: +e.target.value})} />
                  </div>
                  <div>
                    <label className="admin-label">Cost (per unit)</label>
                    <input required type="number" className="admin-input" placeholder="₹" onChange={e => setPartData({...partData, cost: +e.target.value})} />
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="admin-modal-footer">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving || loading || !technicianId}>
              {saving ? <div className="admin-spinner" /> : "Add Part & Log"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
