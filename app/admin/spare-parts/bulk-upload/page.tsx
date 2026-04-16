"use client";

import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

interface UploadResult {
  totalProcessed: number;
  inserted: number;
  updated: number;
  failed: number;
  errors: { row: number; reason: string }[];
}

export default function BulkUploadPage() {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    const name = f.name.toLowerCase();
    if (!name.endsWith(".csv") && !name.endsWith(".xlsx") && !name.endsWith(".xls")) {
      setError("Only CSV and XLSX files are supported");
      return;
    }
    setFile(f);
    setError("");
    setResult(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleUpload = async () => {
    if (!file || !token) return;
    setUploading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API}/admin/spare-parts/bulk-upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Upload failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    if (!token) return;
    fetch(`${API}/admin/spare-parts/template`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "spare-parts-template.csv";
        a.click();
      });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>Bulk Upload</h2>
          <p style={{ fontSize: 13, color: "var(--admin-text-dim)", marginTop: 4 }}>
            Import spare parts from CSV or XLSX files
          </p>
        </div>
        <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={downloadTemplate}>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>description</span>
          Download Template
        </button>
      </div>

      {/* Upload Zone */}
      <div
        className={`admin-upload-zone ${dragging ? "dragging" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          style={{ display: "none" }}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <span className="material-symbols-outlined">cloud_upload</span>
        <div>
          <p style={{ fontSize: 16, fontWeight: 600, color: "var(--admin-text)", marginBottom: 6 }}>
            {file ? file.name : "Drop your file here, or click to browse"}
          </p>
          <p style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
            Supports CSV and XLSX • Max 50MB • Columns: partNumber, name, category, price, stock, manufacturer
          </p>
        </div>
      </div>

      {file && (
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <div className="admin-card" style={{ flex: 1, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="material-symbols-outlined" style={{ color: "var(--admin-success)" }}>
                {file.name.endsWith(".csv") ? "description" : "table_chart"}
              </span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{file.name}</p>
                <p style={{ fontSize: 11, color: "var(--admin-text-muted)" }}>
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => { setFile(null); setResult(null); }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
              </button>
              <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={handleUpload} disabled={uploading}>
                {uploading ? <div className="admin-spinner" /> : "Upload & Process"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ marginTop: 16, padding: "14px 18px", borderRadius: 12, background: "var(--admin-error-soft)", color: "var(--admin-error)", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Upload Results</h3>

          <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
            <div className="admin-card admin-metric-card">
              <div className="admin-metric-icon" style={{ background: "var(--admin-info-soft)", color: "var(--admin-info)" }}>
                <span className="material-symbols-outlined">inventory</span>
              </div>
              <div className="admin-metric-value">{result.totalProcessed}</div>
              <div className="admin-metric-label">Total Processed</div>
            </div>
            <div className="admin-card admin-metric-card">
              <div className="admin-metric-icon" style={{ background: "var(--admin-success-soft)", color: "var(--admin-success)" }}>
                <span className="material-symbols-outlined">add_circle</span>
              </div>
              <div className="admin-metric-value">{result.inserted}</div>
              <div className="admin-metric-label">Inserted</div>
            </div>
            <div className="admin-card admin-metric-card">
              <div className="admin-metric-icon" style={{ background: "var(--admin-warning-soft)", color: "var(--admin-warning)" }}>
                <span className="material-symbols-outlined">update</span>
              </div>
              <div className="admin-metric-value">{result.updated}</div>
              <div className="admin-metric-label">Updated</div>
            </div>
            <div className="admin-card admin-metric-card">
              <div className="admin-metric-icon" style={{ background: "var(--admin-error-soft)", color: "var(--admin-error)" }}>
                <span className="material-symbols-outlined">error</span>
              </div>
              <div className="admin-metric-value">{result.failed}</div>
              <div className="admin-metric-label">Failed</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="admin-card" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "var(--admin-text-dim)" }}>Success Rate</span>
              <span style={{ fontSize: 12, fontWeight: 700 }}>
                {result.totalProcessed > 0
                  ? Math.round(((result.inserted + result.updated) / result.totalProcessed) * 100)
                  : 0}%
              </span>
            </div>
            <div className="admin-progress-bar">
              <div
                className="admin-progress-fill"
                style={{
                  width: result.totalProcessed > 0
                    ? `${((result.inserted + result.updated) / result.totalProcessed) * 100}%`
                    : "0%",
                }}
              />
            </div>
          </div>

          {/* Error details */}
          {result.errors.length > 0 && (
            <div className="admin-table-wrap">
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--admin-border)" }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--admin-error)" }}>
                  Failed Rows ({result.errors.length})
                </h4>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {result.errors.map((err, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>Row {err.row}</td>
                      <td style={{ color: "var(--admin-error)" }}>{err.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="admin-card" style={{ marginTop: 32 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>File Format Guide</h3>
        <div style={{ fontSize: 13, color: "var(--admin-text-dim)", lineHeight: 1.8 }}>
          <p><strong style={{ color: "var(--admin-text)" }}>Required columns:</strong> partNumber, name</p>
          <p><strong style={{ color: "var(--admin-text)" }}>Optional columns:</strong> category, subCategory, price, stock, manufacturer, seller, image, description, warranty, delivery eta, highlights, compatible models, supports service</p>
          <p><strong style={{ color: "var(--admin-text)" }}>Duplicate handling:</strong> Rows with existing partNumber will be updated (upsert)</p>
          <p><strong style={{ color: "var(--admin-text)" }}>Column aliases:</strong> &quot;SKU&quot; → partNumber, &quot;MRP&quot; → price, &quot;Brand&quot; → manufacturer, &quot;Qty&quot; → stock, &quot;sub category&quot; / &quot;type&quot; → subCategory</p>
          <p><strong style={{ color: "var(--admin-text)" }}>Array fields:</strong> Use pipe &quot;|&quot; to separate multiple values in highlights and compatible models</p>
          <p><strong style={{ color: "var(--admin-text)" }}>Supported formats:</strong> .csv, .xlsx, .xls</p>
        </div>
      </div>
    </div>
  );
}
