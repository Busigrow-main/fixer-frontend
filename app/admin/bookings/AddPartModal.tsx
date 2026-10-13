"use client";

import { useState, useEffect } from "react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

/** Catalog `price` is stored in paise. */
function catalogRupees(price: unknown): number {
  const paise = typeof price === "number" ? price : Number(price) || 0;
  return Math.round(paise) / 100;
}

function formatRupees(rupees: number): string {
  return rupees.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AddPartModal({ bookingId, technicianId, token, onClose, onAdded, originalParts = [] }: { bookingId: string, technicianId?: string, token: string, onClose: () => void, onAdded: () => void, originalParts?: any[] }) {
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
    sparePartId: "",
    serialNumber: "",
    installedAt: new Date().toISOString().slice(0, 10),
    warrantyMonths: "" as string | number,
    replacedUsageId: "",
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

  const selectedSpare = spareParts.find((sp) => sp._id === partData.sparePartId);
  const catalogMonths = selectedSpare?.warrantyMonths;
  const inventoryNeedsSerial =
    !partData.isThirdParty &&
    (catalogMonths == null ? true : Number(catalogMonths) > 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let targetVisitId = partData.visitId;

    try {
      if (!targetVisitId) {
        const visitPayload = {
          bookingId,
          technicianId,
          visitOrder: 1,
          jobDescription: "Automated Service Visit for Parts Logging",
          scheduledDate: new Date().toISOString(),
          status: "SCHEDULED"
        };
        const vRes = await fetch(`${API}/admin/visits`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(visitPayload)
        });
        
        if (!vRes.ok) {
          const errData = await vRes.json();
          alert(`Failed to create visit: ${errData.message || "Unknown error"}`);
          setSaving(false);
          return;
        }

        const newVisit = await vRes.json();
        targetVisitId = newVisit._id;
      }

      if (inventoryNeedsSerial && !partData.serialNumber.trim()) {
        alert("Serial number is required for warranty-covered inventory parts.");
        setSaving(false);
        return;
      }

      const available = Math.max(0, Number(selectedSpare?.stock ?? selectedSpare?.stockQuantity) || 0);
      const quantity = Math.max(1, Math.floor(Number(partData.quantity) || 1));
      if (!partData.isThirdParty && available > 0 && quantity > available) {
        alert(`Quantity cannot exceed available stock (${available}).`);
        setSaving(false);
        return;
      }

      const body: any = {
        isThirdParty: partData.isThirdParty,
        quantity,
        cost: partData.isThirdParty
          ? partData.cost
          : (Number(partData.cost) > 0 ? Number(partData.cost) : catalogRupees(selectedSpare?.price)),
        serialNumber: partData.serialNumber.trim() || undefined,
        installedAt: partData.installedAt
          ? new Date(partData.installedAt).toISOString()
          : undefined,
      };

      if (partData.replacedUsageId) {
        body.replacedUsageId = partData.replacedUsageId;
        if (originalParts.find((p) => p.usageId === partData.replacedUsageId && p.covered)) {
          body.cost = 0;
        }
      }

      if (partData.isThirdParty) {
        body.partName = partData.partName;
        body.vendor = partData.vendor;
        if (partData.serialNumber.trim() && partData.warrantyMonths) {
          body.warrantyMonths = Number(partData.warrantyMonths);
        }
      } else {
        body.sparePartId = partData.sparePartId;
        if (partData.warrantyMonths) {
          body.warrantyMonths = Number(partData.warrantyMonths);
        }
      }

      const res = await fetch(`${API}/admin/visits/${targetVisitId}/parts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) {
        const errData = await res.json();
        alert(`Failed to add part: ${errData.message || "Unknown error"}`);
      } else {
        // Complete after the line exists so stock drops by this quantity only.
        if (!partData.visitId) {
          await fetch(`${API}/admin/visits/${targetVisitId}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status: "COMPLETED" }),
          });
        }
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

                {originalParts.length > 0 && (
                  <div>
                    <label className="admin-label">Replace original part (warranty)</label>
                    <select
                      className="admin-input admin-select"
                      value={partData.replacedUsageId}
                      onChange={(e) => {
                        const usageId = e.target.value;
                        const orig = originalParts.find((p) => p.usageId === usageId);
                        setPartData({
                          ...partData,
                          replacedUsageId: usageId,
                          cost: orig?.covered ? 0 : partData.cost,
                          partName: orig?.partName || partData.partName,
                          sparePartId: orig?.sparePartId || partData.sparePartId,
                          isThirdParty: orig ? !!orig.isThirdParty : partData.isThirdParty,
                        });
                      }}
                    >
                      <option value="">— new part (charged) —</option>
                      {originalParts.map((p) => (
                        <option key={p.usageId} value={p.usageId}>
                          {p.partName} {p.serialNumber ? `[${p.serialNumber}]` : ""} {p.covered ? "· covered free" : `· ${p.warrantyStatus}`}
                        </option>
                      ))}
                    </select>
                    {partData.replacedUsageId && originalParts.find((p) => p.usageId === partData.replacedUsageId && p.covered) ? (
                      <div style={{ fontSize: 12, color: "#16a34a", marginTop: 6 }}>
                        Covered warranty replacement — customer will not be charged.
                      </div>
                    ) : null}
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
                      value={partData.sparePartId}
                      onChange={e => {
                        const spare = spareParts.find((sp) => sp._id === e.target.value);
                        const stock = Math.max(0, Number(spare?.stock ?? spare?.stockQuantity) || 0);
                        setPartData({
                          ...partData,
                          sparePartId: e.target.value,
                          quantity: 1,
                          cost: spare ? catalogRupees(spare.price) : 0,
                          warrantyMonths: spare?.warrantyMonths != null ? spare.warrantyMonths : partData.warrantyMonths,
                        });
                        if (spare && stock < 1) {
                          alert("This part is out of stock.");
                        }
                      }}
                    >
                      <option value="">-- select part --</option>
                      {spareParts.map(sp => (
                        <option key={sp._id} value={sp._id}>
                          {sp.name} [₹{formatRupees(catalogRupees(sp.price))}] · {sp.stock ?? sp.stockQuantity ?? 0} in stock
                          {sp.warrantyMonths ? ` · ${sp.warrantyMonths}mo` : ''}
                        </option>
                      ))}
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
                    <input
                      required
                      type="number"
                      min={1}
                      max={!partData.isThirdParty && selectedSpare ? Math.max(1, Number(selectedSpare.stock ?? selectedSpare.stockQuantity) || 1) : undefined}
                      className="admin-input"
                      value={partData.quantity}
                      onChange={e => {
                        const stock = Number(selectedSpare?.stock ?? selectedSpare?.stockQuantity);
                        let next = Math.floor(Number(e.target.value));
                        if (!Number.isFinite(next) || next < 1) next = 1;
                        if (!partData.isThirdParty && Number.isFinite(stock) && stock > 0 && next > stock) next = stock;
                        setPartData({ ...partData, quantity: next });
                      }}
                    />
                    {!partData.isThirdParty && selectedSpare ? (
                      <div style={{ fontSize: 12, color: "var(--admin-text-dim)", marginTop: 6 }}>
                        Uses {partData.quantity} of {selectedSpare.stock ?? selectedSpare.stockQuantity ?? 0} in stock.
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <label className="admin-label">Cost (per unit)</label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      className="admin-input"
                      placeholder="₹"
                      value={partData.cost}
                      onChange={e => setPartData({...partData, cost: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div>
                  <label className="admin-label">
                    Part Serial {inventoryNeedsSerial ? '(required)' : '(optional)'}
                  </label>
                  <input
                    className="admin-input"
                    value={partData.serialNumber}
                    onChange={e => setPartData({...partData, serialNumber: e.target.value.toUpperCase()})}
                    placeholder="UNIT-SERIAL-001"
                    required={inventoryNeedsSerial}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label className="admin-label">Installation date</label>
                    <input
                      type="date"
                      className="admin-input"
                      value={partData.installedAt}
                      onChange={e => setPartData({...partData, installedAt: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="admin-label">Warranty months</label>
                    <input
                      type="number"
                      min="0"
                      className="admin-input"
                      value={partData.warrantyMonths}
                      placeholder={catalogMonths != null ? String(catalogMonths) : '6'}
                      onChange={e => setPartData({...partData, warrantyMonths: e.target.value})}
                    />
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
