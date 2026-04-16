"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export default function TechniciansPage() {
  const { token } = useAuth();
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", skills: "" });

  useEffect(() => {
    if (token) fetchTechnicians();
  }, [token]);

  const fetchTechnicians = async () => {
    try {
      const res = await fetch(`${API}/admin/technicians`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setTechnicians(data);
      } else {
        console.error("Expected array but got", data);
        setTechnicians([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API}/admin/technicians`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean)
        })
      });
      setShowModal(false);
      fetchTechnicians();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "0 8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Technicians</h2>
          <p style={{ fontSize: 13, color: "var(--admin-text-dim)", marginTop: 4 }}>Manage technicians, availability, and skills</p>
        </div>
        <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => setShowModal(true)}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
          Add Technician
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Jobs</th>
              <th>Rating</th>
              <th>Skills</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {technicians.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 40, color: "var(--admin-text-muted)" }}>
                  No technicians found.
                </td>
              </tr>
            ) : (
              technicians.map((t) => (
                <tr key={t._id}>
                  <td style={{ fontWeight: 600 }}>{t.name}</td>
                  <td>{t.phone}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span className={`admin-badge admin-badge-${t.isActive ? 'success' : 'ghost'}`} style={{ zoom: 0.8 }}>
                        {t.isActive ? 'ACCOUNT ACTIVE' : 'ACCOUNT INACTIVE'}
                      </span>
                      <span className={`admin-badge admin-badge-${t.availabilityStatus === 'AVAILABLE' ? 'success' : 'warning'}`} style={{ zoom: 0.8 }}>
                        {t.availabilityStatus}
                      </span>
                    </div>
                  </td>
                  <td>{t.totalCompletedJobs}</td>
                  <td>{t.averageRating} ★</td>
                  <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t.skills.join(', ')}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link href={`/admin/technicians/${t._id}`} className="admin-btn admin-btn-ghost admin-btn-sm">
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Add Technician</h2>
              <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setShowModal(false)}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="admin-label">Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="admin-input" placeholder="John Doe" />
                </div>
                <div>
                  <label className="admin-label">Phone</label>
                  <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="admin-input" placeholder="9876543210" />
                </div>
                <div>
                  <label className="admin-label">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="admin-input" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="admin-label">Skills (comma separated)</label>
                  <input value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} className="admin-input" placeholder="Washing Machine, AC" />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">Save Technician</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
