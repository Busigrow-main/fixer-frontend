"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import ManageVisitsModal from "../ManageVisitsModal";
import AddPartModal from "../AddPartModal";
import { openJobSheet } from "@/app/admin/utils/jobsheet";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
const STATUSES = ["ALL", "PENDING", "CONFIRMED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "RESCHEDULED", "CANCELLED"];

export default function BookingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuth();
  
  const [booking, setBooking] = useState<any>(null);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [visitModalVisible, setVisitModalVisible] = useState(false);
  const [addPartModalVisible, setAddPartModalVisible] = useState(false);
  const [visits, setVisits] = useState<any[]>([]);
  const [jobDetails, setJobDetails] = useState({
    diagnosis: "",
    workDone: "",
    recommendations: "",
    warrantyPeriod: "60 Days",
    asset: "",
    warrantyCode: "",
    warrantyDesc: "",
    assetSaleDate: "",
    assetExpiryDate: "",
    contractCode: "",
    contractDesc: "",
    contractStartDate: "",
    contractExpiryDate: "",
    visitCategory: "",
    invoiceNumber: ""
  });
  const [productDetails, setProductDetails] = useState({
    brand: "",
    modelNumber: "",
    serialNumber: ""
  });
  const [additionalCharges, setAdditionalCharges] = useState<any[]>([]);
  const [serviceFee, setServiceFee] = useState<number>(0);
  const [serviceProperties, setServiceProperties] = useState({
    serviceType: "REPAIR",
    paymentStatus: "UNPAID"
  });

  useEffect(() => {
    if (token && id) {
      fetchBookingInfo();
      fetchTechnicians();
    }
  }, [token, id]);

  const fetchBookingInfo = async () => {
    try {
      const res = await fetch(`${API}/admin/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setBooking(data);
      if (data.visits) {
        setVisits(data.visits);
      }
      
      // Robust population for Job Details
      setJobDetails({
        diagnosis: data.jobDetails?.diagnosis || "",
        workDone: data.jobDetails?.workDone || "",
        recommendations: data.jobDetails?.recommendations || "",
        warrantyPeriod: data.jobDetails?.warrantyPeriod || "60 Days",
        asset: data.jobDetails?.asset || "",
        warrantyCode: data.jobDetails?.warrantyCode || "",
        warrantyDesc: data.jobDetails?.warrantyDesc || "",
        assetSaleDate: data.jobDetails?.assetSaleDate || "",
        assetExpiryDate: data.jobDetails?.assetExpiryDate || "",
        contractCode: data.jobDetails?.contractCode || "",
        contractDesc: data.jobDetails?.contractDesc || "",
        contractStartDate: data.jobDetails?.contractStartDate || "",
        contractExpiryDate: data.jobDetails?.contractExpiryDate || "",
        visitCategory: data.jobDetails?.visitCategory || "",
        invoiceNumber: data.jobDetails?.invoiceNumber || ""
      });

      // Robust population for Product Details
      setProductDetails({
        brand: data.productDetails?.brand || "",
        modelNumber: data.productDetails?.modelNumber || "",
        serialNumber: data.productDetails?.serialNumber || ""
      });

      if (data.invoiceData) {
        setServiceFee(data.invoiceData.serviceTotal || 0);
        setAdditionalCharges(data.invoiceData.additionalCharges || []);
      }
      setServiceProperties({
        serviceType: data.serviceType || "REPAIR",
        paymentStatus: data.paymentStatus || "UNPAID"
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const res = await fetch(`${API}/admin/technicians`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setTechnicians(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      await fetch(`${API}/admin/bookings/${id}/status`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchBookingInfo();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignTechnician = async (technicianId: string) => {
    setUpdating(true);
    try {
      await fetch(`${API}/admin/bookings/${id}/assign`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ technicianId }),
      });
      fetchBookingInfo();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateJobDetails = async () => {
    setUpdating(true);
    try {
      await fetch(`${API}/admin/bookings/${id}/job-details`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(jobDetails),
      });
      fetchBookingInfo();
      alert("Job Sheet details saved successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to save details.");
    } finally {
      setUpdating(false);
    }
  };

  const handleFinalizeInvoice = async () => {
    if (!confirm("Are you sure you want to finalize this bill? This will lock the invoice and notify the customer.")) return;
    setUpdating(true);
    try {
      await fetch(`${API}/admin/bookings/${id}/finalize-invoice`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBookingInfo();
      alert("Service Completed and Bill Sent to User.");
    } catch (err) {
      console.error(err);
      alert("Failed to finalize.");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateProductDetails = async () => {
    setUpdating(true);
    try {
      await fetch(`${API}/admin/bookings/${id}/product-details`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(productDetails),
      });
      fetchBookingInfo();
      alert("Product details saved.");
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateServiceProperties = async (props: any) => {
    setUpdating(true);
    try {
      await fetch(`${API}/admin/bookings/${id}/service-properties`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(props),
      });
      fetchBookingInfo();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveInvoiceManual = async () => {
    setUpdating(true);
    try {
      await fetch(`${API}/admin/bookings/${id}/invoice-manual`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ serviceTotal: serviceFee, additionalCharges }),
      });
      fetchBookingInfo();
      alert("Invoice updated successfully.");
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const getWarrantyStatus = () => {
    if (!booking.warrantyExpiry) return null;
    const expiry = new Date(booking.warrantyExpiry);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return { label: "Expired", color: "#64748b", bg: "#f1f5f9" };
    return { label: `Active (${diffDays} Days Left)`, color: "#16a34a", bg: "#f0fdf4" };
  };

  if (loading) return <div style={{ padding: 40 }}>Loading booking details...</div>;
  if (!booking) return <div style={{ padding: 40 }}>Booking not found.</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "0 8px", maxWidth: 900 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => router.back()}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: 24, margin: 0 }}>Service #{booking._id.slice(-6).toUpperCase()}</h1>
            {booking.serviceType === 'WARRANTY_CHECK' && (
              <span className="admin-badge admin-badge-warning">WARRANTY CLAIM</span>
            )}
            {getWarrantyStatus() && (
              <span style={{ 
                padding: "4px 12px", 
                borderRadius: 20, 
                fontSize: 12, 
                fontWeight: 600, 
                color: getWarrantyStatus()?.color, 
                backgroundColor: getWarrantyStatus()?.bg,
                border: `1px solid ${getWarrantyStatus()?.color}44`
              }}>
                Warranty: {getWarrantyStatus()?.label}
              </span>
            )}
          </div>
            <p style={{ fontSize: 13, color: "var(--admin-text-dim)", marginTop: 4 }}>
              Created on {new Date(booking.createdAt).toLocaleString()}
            </p>
            {booking.parentId && (
              <p style={{ fontSize: 13, marginTop: 4 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>link</span>
                Original Service: <a href={`/admin/bookings/${booking.parentId}`} style={{ color: 'var(--admin-primary)', fontWeight: 600 }}>#{booking.parentId.slice(-6).toUpperCase()}</a>
              </p>
            )}
            {booking.claimBookingIds && booking.claimBookingIds.length > 0 && (
              <div style={{ fontSize: 13, marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle' }}>history</span>
                <span>Warranty Claims:</span>
                {booking.claimBookingIds.map((cid: any) => (
                  <a key={cid} href={`/admin/bookings/${cid}`} style={{ color: 'var(--admin-primary)', fontWeight: 600 }}>#{cid.slice(-6).toUpperCase()}</a>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="admin-btn admin-btn-secondary" onClick={() => openJobSheet(booking)}>
            <span className="material-symbols-outlined">print</span> Job Sheet
          </button>
          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setVisitModalVisible(true)}>
            <span className="material-symbols-outlined">calendar_month</span> Manage Visits
          </button>
          <button className="admin-btn admin-btn-primary" onClick={() => setAddPartModalVisible(true)}>
            <span className="material-symbols-outlined">build</span> Add Part
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Product & Service Info */}
            <div className="admin-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1, color: "var(--admin-text-muted)" }}>
                  Product & Service Details
                </h3>
                <button 
                  className="admin-btn admin-btn-ghost admin-btn-sm" 
                  onClick={handleUpdateProductDetails}
                  disabled={updating || booking.isBilled}
                >
                  {updating ? "Saving..." : "Save Info"}
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="admin-label">Brand</label>
                  <input 
                    className="admin-input" 
                    placeholder="e.g. Samsung" 
                    value={productDetails.brand}
                    onChange={e => setProductDetails({...productDetails, brand: e.target.value})}
                    disabled={booking.isBilled}
                  />
                </div>
                <div>
                  <label className="admin-label">Model Number</label>
                  <input 
                    className="admin-input" 
                    placeholder="e.g. RF28" 
                    value={productDetails.modelNumber}
                    onChange={e => setProductDetails({...productDetails, modelNumber: e.target.value})}
                    disabled={booking.isBilled}
                  />
                </div>
                <div>
                  <label className="admin-label">Serial Number</label>
                  <input 
                    className="admin-input" 
                    placeholder="e.g. SN-998811" 
                    value={productDetails.serialNumber}
                    onChange={e => setProductDetails({...productDetails, serialNumber: e.target.value})}
                    disabled={booking.isBilled}
                  />
                </div>
                <div>
                  <label className="admin-label">Service Category</label>
                  <div style={{ fontSize: 13, height: 40, display: 'flex', alignItems: 'center', opacity: 0.7 }}>
                    {booking.serviceId?.name}
                  </div>
                </div>
              </div>
            </div>

            {/* Job Sheet Editor */}

          {/* Customer Details */}
          <div className="admin-card">
            <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1, color: "var(--admin-text-muted)", marginBottom: 16 }}>
              Customer Details
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
              <div><strong style={{ color: "var(--admin-text-dim)" }}>Name:</strong> {booking.userId?.fullName || "—"}</div>
              <div><strong style={{ color: "var(--admin-text-dim)" }}>Phone:</strong> {booking.contactPhone || booking.userId?.phone}</div>
              {booking.addressData && (
                <div><strong style={{ color: "var(--admin-text-dim)" }}>Address:</strong> {booking.addressData.text} (Pincode: {booking.addressData.zip})</div>
              )}
            </div>
          </div>

            {/* Job Sheet Editor */}
            <div className="admin-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1, color: "var(--admin-text-muted)" }}>
                  Job Sheet Entries
                </h3>
                <button 
                  className="admin-btn admin-btn-secondary admin-btn-sm" 
                  onClick={handleUpdateJobDetails}
                  disabled={updating || booking.isBilled}
                >
                  {updating ? "Saving..." : "Save Entries"}
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label className="admin-label">Diagnosis / Problem Found</label>
                  <textarea 
                    className="admin-input" 
                    placeholder="e.g. Compressor winding burnt, Gas leak in evaporator" 
                    style={{ minHeight: 80 }}
                    value={jobDetails.diagnosis}
                    onChange={e => setJobDetails({...jobDetails, diagnosis: e.target.value})}
                    disabled={booking.isBilled}
                  />
                </div>
                <div>
                  <label className="admin-label">Action Taken / Work Done</label>
                  <textarea 
                    className="admin-input" 
                    placeholder="e.g. Replaced compressor, Gas refilled, Tested OK" 
                    style={{ minHeight: 80 }}
                    value={jobDetails.workDone}
                    onChange={e => setJobDetails({...jobDetails, workDone: e.target.value})}
                    disabled={booking.isBilled}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label className="admin-label">Technician Recommendations</label>
                    <input 
                      className="admin-input" 
                      placeholder="e.g. Clean filters weekly" 
                      value={jobDetails.recommendations}
                      onChange={e => setJobDetails({...jobDetails, recommendations: e.target.value})}
                      disabled={booking.isBilled}
                    />
                  </div>
                  <div>
                    <label className="admin-label">Warranty Period</label>
                    <input 
                      className="admin-input" 
                      placeholder="e.g. 60 Days" 
                      value={jobDetails.warrantyPeriod}
                      onChange={e => setJobDetails({...jobDetails, warrantyPeriod: e.target.value})}
                      disabled={booking.isBilled}
                    />
                  </div>
                </div>

                <div style={{ padding: '12px 0', borderTop: '1px solid var(--admin-border)', marginTop: 8 }}>
                  <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--admin-text-muted)', marginBottom: 12 }}>Asset & Warranty Details</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label className="admin-label">Asset</label>
                      <input className="admin-input" value={jobDetails.asset} onChange={e => setJobDetails({...jobDetails, asset: e.target.value})} placeholder="Asset ID / Name" />
                    </div>
                    <div>
                      <label className="admin-label">Invoice Number</label>
                      <input className="admin-input" value={jobDetails.invoiceNumber} onChange={e => setJobDetails({...jobDetails, invoiceNumber: e.target.value})} placeholder="INV-2026-..." />
                    </div>
                    <div>
                      <label className="admin-label">Warranty Code</label>
                      <input className="admin-input" value={jobDetails.warrantyCode} onChange={e => setJobDetails({...jobDetails, warrantyCode: e.target.value})} placeholder="W-990" />
                    </div>
                    <div>
                      <label className="admin-label">Warranty Desc</label>
                      <input className="admin-input" value={jobDetails.warrantyDesc} onChange={e => setJobDetails({...jobDetails, warrantyDesc: e.target.value})} placeholder="Manufacturer Standard" />
                    </div>
                    <div>
                      <label className="admin-label">Asset Sale Date</label>
                      <input className="admin-input" value={jobDetails.assetSaleDate} onChange={e => setJobDetails({...jobDetails, assetSaleDate: e.target.value})} placeholder="DD/MM/YYYY" />
                    </div>
                    <div>
                      <label className="admin-label">Asset Expiry Date</label>
                      <input className="admin-input" value={jobDetails.assetExpiryDate} onChange={e => setJobDetails({...jobDetails, assetExpiryDate: e.target.value})} placeholder="DD/MM/YYYY" />
                    </div>
                  </div>
                </div>

                <div style={{ padding: '12px 0', borderTop: '1px solid var(--admin-border)' }}>
                  <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--admin-text-muted)', marginBottom: 12 }}>Contract & Category</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label className="admin-label">Contract Code</label>
                      <input className="admin-input" value={jobDetails.contractCode} onChange={e => setJobDetails({...jobDetails, contractCode: e.target.value})} placeholder="C-100" />
                    </div>
                    <div>
                      <label className="admin-label">Contract Desc</label>
                      <input className="admin-input" value={jobDetails.contractDesc} onChange={e => setJobDetails({...jobDetails, contractDesc: e.target.value})} placeholder="Annual Maintenance" />
                    </div>
                    <div>
                      <label className="admin-label">Contract Start Date</label>
                      <input className="admin-input" value={jobDetails.contractStartDate} onChange={e => setJobDetails({...jobDetails, contractStartDate: e.target.value})} placeholder="DD/MM/YYYY" />
                    </div>
                    <div>
                      <label className="admin-label">Contract Expiry Date</label>
                      <input className="admin-input" value={jobDetails.contractExpiryDate} onChange={e => setJobDetails({...jobDetails, contractExpiryDate: e.target.value})} placeholder="DD/MM/YYYY" />
                    </div>
                    <div>
                      <label className="admin-label">Visit Category</label>
                      <input className="admin-input" value={jobDetails.visitCategory} onChange={e => setJobDetails({...jobDetails, visitCategory: e.target.value})} placeholder="Standard / Breakdown" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visits History */}
            <div className="admin-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1, color: "var(--admin-text-muted)" }}>
                  Visits History
                </h3>
                <button 
                  className="admin-btn admin-btn-ghost admin-btn-sm" 
                  onClick={() => setVisitModalVisible(true)}
                  disabled={booking.isBilled}
                >
                  + Manage Visits
                </button>
              </div>
            {visits.length === 0 ? (
              <div style={{ color: "var(--admin-text-dim)", fontSize: 13 }}>No visits recorded yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {visits.map((vis, i) => (
                  <div key={vis._id || `visit-${i}`} style={{ border: "1px solid var(--admin-border)", borderRadius: 8, padding: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <strong style={{ fontSize: 13 }}>Visit #{vis.visitOrder} <span style={{ color: "var(--admin-text-dim)", fontWeight: "normal" }}>({vis.status})</span></strong>
                      <span style={{ fontSize: 12, color: "var(--admin-text-dim)" }}>{new Date(vis.scheduledDate).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--admin-text-dim)" }}>
                      <strong>Description:</strong> {vis.jobDescription || "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Spare Parts Consumed */}
          <div className="admin-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1, color: "var(--admin-text-muted)" }}>
                Spare Parts Consumed
              </h3>
              <button 
                className="admin-btn admin-btn-ghost admin-btn-sm" 
                onClick={() => setAddPartModalVisible(true)}
              >
                + Add Part
              </button>
            </div>
            {(() => {
              const allParts = visits.flatMap(v => v.partsUsed || []);
              if (allParts.length === 0) {
                return <div style={{ color: "var(--admin-text-dim)", fontSize: 13 }}>No parts used.</div>;
              }
              return (
                <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--admin-border)", textAlign: "left" }}>
                      <th style={{ paddingBottom: 8, color: "var(--admin-text-muted)" }}>Part Name</th>
                      <th style={{ paddingBottom: 8, color: "var(--admin-text-muted)" }}>Type</th>
                      <th style={{ paddingBottom: 8, color: "var(--admin-text-muted)" }}>Qty</th>
                      <th style={{ paddingBottom: 8, textAlign: "right", color: "var(--admin-text-muted)" }}>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allParts.map((p: any, idx: number) => (
                      <tr key={p._id || `part-${idx}`} style={{ borderBottom: "1px solid var(--admin-border)" }}>
                        <td style={{ padding: "12px 0", fontWeight: 500 }}>
                          {p.isThirdParty ? p.partName : (p.sparePartId?.name || p.sparePartId)}
                        </td>
                        <td style={{ padding: "12px 0" }}>
                          {p.isThirdParty ? <span className="admin-badge admin-badge-warning" style={{ zoom: 0.8 }}>3rd Party</span> : <span className="admin-badge admin-badge-success" style={{ zoom: 0.8 }}>Inventory</span>}
                        </td>
                        <td style={{ padding: "12px 0" }}>{p.quantity}</td>
                        <td style={{ padding: "12px 0", textAlign: "right", fontWeight: 600 }}>₹{p.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })()}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Actions Panel */}
          <div className="admin-card" style={{ background: "var(--admin-surface-2)" }}>
            <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1, color: "var(--admin-text-muted)", marginBottom: 16 }}>
              Management
            </h3>
            
            <div style={{ marginBottom: 16 }}>
              <label className="admin-label">Service Type</label>
              <select 
                className="admin-input admin-select" 
                value={serviceProperties.serviceType} 
                onChange={e => {
                  const val = e.target.value;
                  setServiceProperties({...serviceProperties, serviceType: val});
                  handleUpdateServiceProperties({...serviceProperties, serviceType: val});
                }}
                disabled={updating || booking.isBilled}
              >
                <option value="REPAIR">REPAIR</option>
                <option value="INSTALLATION">INSTALLATION</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="WARRANTY_CHECK">WARRANTY_CHECK</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="admin-label">Payment Status</label>
              <select 
                className="admin-input admin-select" 
                value={serviceProperties.paymentStatus} 
                onChange={e => {
                  const val = e.target.value;
                  setServiceProperties({...serviceProperties, paymentStatus: val});
                  handleUpdateServiceProperties({...serviceProperties, paymentStatus: val});
                }}
                disabled={updating || booking.isBilled}
              >
                <option value="UNPAID">PENDING</option>
                <option value="PAID_CASH">PAID (CASH)</option>
                <option value="PAID_ONLINE">PAID (ONLINE)</option>
                <option value="WARRANTY_SERVICE">WARRANTY SERVICE</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="admin-label">Status</label>
              <select 
                className="admin-input admin-select" 
                value={booking.status} 
                onChange={e => handleStatusChange(e.target.value)}
                disabled={updating}
              >
                {STATUSES.filter(s => s !== "ALL").map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="admin-label">Assigned Technician</label>
              <select 
                className="admin-input admin-select" 
                value={booking.technicianId?._id || booking.technicianId || ""} 
                onChange={e => handleAssignTechnician(e.target.value)}
                disabled={updating || booking.isBilled}
              >
                <option value="">Unassigned</option>
                {technicians.map(t => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>

            {!booking.isBilled && (
              <button 
                className="admin-btn admin-btn-primary w-full" 
                style={{ width: '100%', justifyContent: 'center', height: 48, fontSize: 14, fontWeight: 700 }}
                onClick={handleFinalizeInvoice}
                disabled={updating || !booking.technicianId}
              >
                Finalize Billing & Close
              </button>
            )}
            {booking.isBilled && (
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', padding: 12, borderRadius: 8, fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: 4, fontSize: 18 }}>verified</span>
                Service Billed & Completed
              </div>
            )}
          </div>

          {/* Interactive Bill Editor */}
          <div className="admin-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1, color: "var(--admin-text-muted)" }}>
                Billing Breakdown
              </h3>
              {!booking.isBilled && (
                <button 
                  className="admin-btn admin-btn-secondary admin-btn-sm" 
                  onClick={handleSaveInvoiceManual}
                  disabled={updating}
                >
                  {updating ? "Saving..." : "Save Bill"}
                </button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--admin-text-dim)' }}>Base Service Charge</span>
                <input 
                  type="number"
                  className="admin-input"
                  style={{ height: 32, padding: '4px 8px', textAlign: 'right' }}
                  value={serviceFee}
                  onChange={e => setServiceFee(Number(e.target.value))}
                  disabled={booking.isBilled}
                />
              </div>

              {additionalCharges.map((charge, idx) => (
                <div key={charge._id || `charge-${idx}`} style={{ display: "grid", gridTemplateColumns: "1fr 100px 32px", gap: 12, alignItems: 'center' }}>
                  <input 
                    className="admin-input"
                    style={{ height: 32, padding: '4px 8px' }}
                    value={charge.label}
                    onChange={e => {
                      const newCharges = [...additionalCharges];
                      newCharges[idx].label = e.target.value;
                      setAdditionalCharges(newCharges);
                    }}
                    disabled={booking.isBilled}
                  />
                  <input 
                    type="number"
                    className="admin-input"
                    style={{ height: 32, padding: '4px 8px', textAlign: 'right' }}
                    value={charge.amount}
                    onChange={e => {
                      const newCharges = [...additionalCharges];
                      newCharges[idx].amount = Number(e.target.value);
                      setAdditionalCharges(newCharges);
                    }}
                    disabled={booking.isBilled}
                  />
                  {!booking.isBilled && (
                    <button 
                      className="admin-btn admin-btn-ghost admin-btn-sm"
                      style={{ padding: 0 }}
                      onClick={() => setAdditionalCharges(additionalCharges.filter((_, i) => i !== idx))}
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  )}
                </div>
              ))}

              {!booking.isBilled && (
                <button 
                   className="admin-btn admin-btn-ghost admin-btn-sm"
                   style={{ fontSize: 11, alignSelf: 'flex-start' }}
                   onClick={() => setAdditionalCharges([...additionalCharges, { label: "New Charge", amount: 0 }])}
                >
                  + Add Other Charge
                </button>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 8 }}>
                <span>Spare Parts Total:</span>
                <span style={{ fontWeight: 600 }}>₹{booking.invoiceData?.partsTotal || 0}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, borderTop: "1px solid var(--admin-border)", paddingTop: 12, marginTop: 4, fontSize: 15 }}>
                <span>Grand Total:</span>
                <span style={{ color: 'var(--admin-primary)' }}>₹{booking.invoiceData?.totalAmount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {visitModalVisible && (
        <ManageVisitsModal 
          bookingId={id as string} 
          technicianId={booking.technicianId?._id || booking.technicianId}
          token={token || ""} 
          onClose={() => {
            setVisitModalVisible(false);
            fetchBookingInfo();
          }} 
        />
      )}

      {addPartModalVisible && (
        <AddPartModal
          bookingId={id as string}
          technicianId={booking.technicianId?._id || booking.technicianId}
          token={token || ""}
          onAdded={() => fetchBookingInfo()}
          onClose={() => setAddPartModalVisible(false)}
        />
      )}
    </div>
  );
}
