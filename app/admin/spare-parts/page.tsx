"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export default function AdminSparePartsPage() {
  const { token } = useAuth();
  const [parts, setParts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const limit = 15;
  const totalPages = Math.ceil(total / limit);

  const fetchParts = () => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("q", search);
    if (category !== "All") params.set("category", category);

    fetch(`${API}/spare-parts?${params}`)
      .then((r) => r.json())
      .then((res) => {
        setParts(res.data || []);
        setTotal(res.metadata?.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch(`${API}/spare-parts/meta/categories`)
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchParts();
  }, [token, page, category]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchParts(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleSave = async () => {
    if (!editModal) return;
    setSaving(true);
    try {
      const method = editModal._id ? "PUT" : "POST";
      const url = editModal._id ? `${API}/spare-parts/${editModal._id}` : `${API}/spare-parts`;
      await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(editModal),
      });
      setEditModal(null);
      fetchParts();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API}/spare-parts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteConfirm(null);
      fetchParts();
    } catch (err) {
      console.error(err);
    }
  };

  const exportCsv = () => {
    if (!token) return;
    fetch(`${API}/admin/spare-parts/export`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "spare-parts-export.csv";
        a.click();
      });
  };

  const newPart = () => {
    setEditModal({
      name: "",
      partNumber: "",
      category: "",
      subCategory: "",
      price: "",
      stock: 0,
      manufacturer: "",
      seller: "Fixxer OEM Hub",
      image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800&auto=format&fit=crop",
      description: "",
      warranty: "",
      deliveryEta: "",
      highlights: "",
      compatibleModels: "",
      supportsServiceBooking: false,
      slug: "",
    });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Spare Parts</h2>
          <p style={{ fontSize: 13, color: "var(--admin-text-dim)", marginTop: 4 }}>{total} total parts</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={exportCsv}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
            Export
          </button>
          <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={newPart}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
            Add Part
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <input
          className="admin-input"
          style={{ maxWidth: 300 }}
          placeholder="Search by name, part number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="admin-input admin-select"
          style={{ maxWidth: 200 }}
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Part</th>
              <th>Part #</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Manufacturer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: 40 }}><div className="admin-spinner" style={{ margin: "0 auto" }} /></td></tr>
            ) : parts.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "var(--admin-text-muted)" }}>No spare parts found</td></tr>
            ) : (
              parts.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", background: "var(--admin-surface-3)" }}
                      />
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 11 }}>{p.partNumber || "—"}</td>
                  <td>{p.category}</td>
                  <td style={{ fontWeight: 600 }}>{p.price}</td>
                  <td>
                    <span style={{ color: (p.stock || 0) > 0 ? "var(--admin-success)" : "var(--admin-error)", fontWeight: 600 }}>
                      {p.stock || 0}
                    </span>
                  </td>
                  <td>{p.manufacturer || "—"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setEditModal({ ...p })}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                      </button>
                      <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => setDeleteConfirm(p._id)}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                      </button>
                    </div>
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
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page - 2 + i;
                return p <= totalPages ? (
                  <button key={p} className={`admin-pagination-btn ${page === p ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
                ) : null;
              })}
              <button className="admin-pagination-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>›</button>
            </div>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {editModal && (
        <div className="admin-modal-overlay" onClick={() => setEditModal(null)}>
          <div className="admin-modal" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{editModal._id ? "Edit Spare Part" : "Add New Spare Part"}</h2>
              <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setEditModal(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="admin-modal-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxHeight: "60vh", overflowY: "auto" }}>
              {[
                { key: "name", label: "Name", full: false },
                { key: "partNumber", label: "Part Number", full: false },
                { key: "category", label: "Category", full: false },
                { key: "subCategory", label: "Sub Category", full: false },
                { key: "price", label: "Price", full: false },
                { key: "stock", label: "Stock", full: false, type: "number" },
                { key: "manufacturer", label: "Manufacturer", full: false },
                { key: "seller", label: "Seller", full: false },
                { key: "warranty", label: "Warranty", full: false },
                { key: "deliveryEta", label: "Delivery ETA", full: false },
                { key: "image", label: "Image URL", full: true },
                { key: "highlights", label: "Highlights (pipe-separated)", full: true },
                { key: "compatibleModels", label: "Compatible Models (pipe-separated)", full: true },
                { key: "slug", label: "Slug", full: true },
              ].map((field) => (
                <div key={field.key} style={field.full ? { gridColumn: "1 / -1" } : {}}>
                  <label className="admin-label">{field.label}</label>
                  <input
                    className="admin-input"
                    type={field.type || "text"}
                    value={editModal[field.key] || ""}
                    onChange={(e) => setEditModal({ ...editModal, [field.key]: e.target.value })}
                  />
                </div>
              ))}
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="admin-label">Description</label>
                <textarea
                  className="admin-input admin-textarea"
                  value={editModal.description || ""}
                  onChange={(e) => setEditModal({ ...editModal, description: e.target.value })}
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <div className="admin-spinner" /> : editModal._id ? "Save Changes" : "Create Part"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-body" style={{ textAlign: "center", padding: "40px 24px" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--admin-error)", marginBottom: 16 }}>
                warning
              </span>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Delete Spare Part?</h3>
              <p style={{ fontSize: 13, color: "var(--admin-text-dim)" }}>This action cannot be undone.</p>
            </div>
            <div className="admin-modal-footer" style={{ justifyContent: "center" }}>
              <button className="admin-btn admin-btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
