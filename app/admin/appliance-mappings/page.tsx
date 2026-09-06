"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

type BookingRow = {
  _id: string;
  status: string;
  contactPhone: string;
  serviceName: string;
  productDetails?: {
    brand?: string;
    modelNumber?: string;
    serialNumber?: string;
  };
  createdAt?: string;
};

type ApplianceMapping = {
  _id: string;
  serialNumber: string;
  phones: string[];
  brand?: string;
  modelNumber?: string;
  primaryBookingId?: string | null;
  bookingIds?: string[];
  mappedBy?: string;
  mappedAt?: string;
  updatedAt?: string;
};

type SearchResult = {
  phone: string;
  user: {
    _id: string;
    phone: string;
    fullName?: string;
    email?: string;
  } | null;
  bookings: BookingRow[];
  appliances: ApplianceMapping[];
};

export default function AdminApplianceMappingsPage() {
  return (
    <Suspense
      fallback={
        <div className="admin-empty">
          <div className="admin-spinner" style={{ margin: "0 auto" }} />
        </div>
      }
    >
      <AdminApplianceMappingsContent />
    </Suspense>
  );
}

function AdminApplianceMappingsContent() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const [phoneQuery, setPhoneQuery] = useState("");
  const [serialQuery, setSerialQuery] = useState("");
  const [search, setSearch] = useState<SearchResult | null>(null);
  const [serialView, setSerialView] = useState<ApplianceMapping | null>(null);
  const [recent, setRecent] = useState<ApplianceMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bootstrapped, setBootstrapped] = useState(false);

  const [mapSerial, setMapSerial] = useState("");
  const [mapBrand, setMapBrand] = useState("");
  const [mapModel, setMapModel] = useState("");
  const [mapBookingId, setMapBookingId] = useState("");
  const [extraPhone, setExtraPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const authHeaders = useCallback(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token],
  );

  const loadRecent = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/admin/appliance-mappings?page=1&limit=15`, {
        headers: authHeaders(),
      });
      const json = await res.json();
      setRecent(json.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [token, authHeaders]);

  useEffect(() => {
    loadRecent();
  }, [loadRecent]);

  useEffect(() => {
    if (!token || bootstrapped) return;
    const phone = searchParams.get("phone");
    const serial = searchParams.get("serial");
    setBootstrapped(true);
    if (phone) {
      setPhoneQuery(phone);
      (async () => {
        setLoading(true);
        try {
          const res = await fetch(
            `${API}/admin/appliance-mappings/search?phone=${encodeURIComponent(phone)}`,
            { headers: authHeaders() },
          );
          const json = await res.json();
          if (!res.ok) throw new Error(json.message || "Search failed");
          setSearch(json);
          if (serial) {
            setSerialQuery(serial);
            setMapSerial(serial);
          } else if (json.appliances?.[0]) {
            setMapSerial(json.appliances[0].serialNumber || "");
          }
          if (json.bookings?.[0]) setMapBookingId(json.bookings[0]._id);
        } catch (err: any) {
          setError(err.message || "Search failed");
        } finally {
          setLoading(false);
        }
      })();
    } else if (serial) {
      setSerialQuery(serial);
      (async () => {
        setLoading(true);
        try {
          const res = await fetch(
            `${API}/admin/appliance-mappings/by-serial/${encodeURIComponent(serial)}`,
            { headers: authHeaders() },
          );
          const json = await res.json();
          if (!res.ok) throw new Error(json.message || "Serial not found");
          setSerialView(json);
          setMapSerial(json.serialNumber || "");
          setMapBrand(json.brand || "");
          setMapModel(json.modelNumber || "");
        } catch (err: any) {
          setError(err.message || "Lookup failed");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [token, bootstrapped, searchParams, authHeaders]);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleSearchPhone = async (e?: React.FormEvent) => {
    e?.preventDefault();
    clearMessages();
    if (!phoneQuery.trim()) {
      setError("Enter a phone number to search");
      return;
    }
    setLoading(true);
    setSerialView(null);
    try {
      const res = await fetch(
        `${API}/admin/appliance-mappings/search?phone=${encodeURIComponent(phoneQuery.trim())}`,
        { headers: authHeaders() },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Search failed");
      setSearch(json);
      if (json.appliances?.[0]) {
        setMapSerial(json.appliances[0].serialNumber || "");
        setMapBrand(json.appliances[0].brand || "");
        setMapModel(json.appliances[0].modelNumber || "");
      } else {
        const withSerial = (json.bookings || []).find(
          (b: BookingRow) => b.productDetails?.serialNumber,
        );
        if (withSerial) {
          setMapSerial(withSerial.productDetails?.serialNumber || "");
          setMapBrand(withSerial.productDetails?.brand || "");
          setMapModel(withSerial.productDetails?.modelNumber || "");
          setMapBookingId(withSerial._id);
        } else if (json.bookings?.[0]) {
          setMapBookingId(json.bookings[0]._id);
          setMapBrand(json.bookings[0].productDetails?.brand || "");
          setMapModel(json.bookings[0].productDetails?.modelNumber || "");
        }
      }
    } catch (err: any) {
      setError(err.message || "Search failed");
      setSearch(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLookupSerial = async (e?: React.FormEvent) => {
    e?.preventDefault();
    clearMessages();
    if (!serialQuery.trim()) {
      setError("Enter a serial number");
      return;
    }
    setLoading(true);
    setSearch(null);
    try {
      const res = await fetch(
        `${API}/admin/appliance-mappings/by-serial/${encodeURIComponent(serialQuery.trim())}`,
        { headers: authHeaders() },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Serial not found");
      setSerialView(json);
      setMapSerial(json.serialNumber || "");
      setMapBrand(json.brand || "");
      setMapModel(json.modelNumber || "");
    } catch (err: any) {
      setError(err.message || "Lookup failed");
      setSerialView(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMap = async () => {
    clearMessages();
    const phone = search?.phone || phoneQuery.trim();
    if (!phone) {
      setError("Search a phone number first");
      return;
    }
    if (!mapSerial.trim()) {
      setError("Serial number is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/appliance-mappings/map`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          phone,
          serialNumber: mapSerial.trim(),
          brand: mapBrand.trim() || undefined,
          modelNumber: mapModel.trim() || undefined,
          bookingId: mapBookingId || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Mapping failed");
      setSuccess(
        `Mapped ${json.serialNumber} ↔ ${phone}. Associated phones: ${(json.phones || []).join(", ")}`,
      );
      setSerialView(json);
      await handleSearchPhone();
      await loadRecent();
    } catch (err: any) {
      setError(err.message || "Mapping failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAddPhone = async () => {
    clearMessages();
    const serial = serialView?.serialNumber || mapSerial.trim();
    if (!serial) {
      setError("Load or enter a serial number first");
      return;
    }
    if (!extraPhone.trim()) {
      setError("Enter a phone number to add");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        `${API}/admin/appliance-mappings/${encodeURIComponent(serial)}/phones`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ phone: extraPhone.trim() }),
        },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to add phone");
      setSuccess(`Added ${extraPhone} to ${json.serialNumber}`);
      setSerialView(json);
      setExtraPhone("");
      await loadRecent();
      if (search) await handleSearchPhone();
    } catch (err: any) {
      setError(err.message || "Failed to add phone");
    } finally {
      setSaving(false);
    }
  };

  const activeMapping =
    serialView ||
    search?.appliances?.[0] ||
    null;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
          Appliance Serial Mapping
        </h2>
        <p style={{ fontSize: 13, color: "var(--admin-text-dim)", marginTop: 4, maxWidth: 640 }}>
          Map a technician-identified serial number to a phone registration.
          After mapping, the serial becomes the primary appliance identity while
          phones remain associated contacts.
        </p>
      </div>

      {(error || success) && (
        <div
          style={{
            marginBottom: 16,
            padding: "12px 14px",
            borderRadius: 10,
            fontSize: 13,
            background: error ? "var(--admin-error-soft)" : "var(--admin-success-soft)",
            color: error ? "var(--admin-error)" : "var(--admin-success)",
            border: `1px solid ${error ? "var(--admin-error)" : "var(--admin-success)"}22`,
          }}
        >
          {error || success}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <form id="phone-search-form" className="admin-card" onSubmit={handleSearchPhone}>
          <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: "var(--admin-text-muted)", marginBottom: 12 }}>
            Search by phone
          </h3>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="admin-input"
              placeholder="e.g. 9835009701"
              value={phoneQuery}
              onChange={(e) => setPhoneQuery(e.target.value)}
            />
            <button className="admin-btn admin-btn-primary" type="submit" disabled={loading}>
              Search
            </button>
          </div>
        </form>

        <form id="serial-lookup-form" className="admin-card" onSubmit={handleLookupSerial}>
          <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: "var(--admin-text-muted)", marginBottom: 12 }}>
            Lookup by serial
          </h3>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="admin-input"
              placeholder="e.g. WM123456789"
              value={serialQuery}
              onChange={(e) => setSerialQuery(e.target.value)}
            />
            <button className="admin-btn admin-btn-secondary" type="submit" disabled={loading}>
              Lookup
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <div className="admin-empty" style={{ padding: 24 }}>
          <div className="admin-spinner" style={{ margin: "0 auto" }} />
        </div>
      )}

      {search && !loading && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="admin-card">
              <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: "var(--admin-text-muted)", marginBottom: 12 }}>
                Registration · {search.phone}
              </h3>
              {search.user ? (
                <div style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div><strong style={{ color: "var(--admin-text-dim)" }}>Name:</strong> {search.user.fullName || "—"}</div>
                  <div><strong style={{ color: "var(--admin-text-dim)" }}>Phone:</strong> {search.user.phone}</div>
                  <div><strong style={{ color: "var(--admin-text-dim)" }}>Email:</strong> {search.user.email || "—"}</div>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "var(--admin-text-dim)" }}>
                  No user account for this phone — bookings may still exist as contact phone.
                </p>
              )}
            </div>

            <div className="admin-card">
              <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: "var(--admin-text-muted)", marginBottom: 12 }}>
                Bookings ({search.bookings.length})
              </h3>
              {search.bookings.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--admin-text-dim)" }}>No bookings found</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {search.bookings.map((b) => (
                    <label
                      key={b._id}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        padding: 10,
                        borderRadius: 10,
                        border: `1px solid ${mapBookingId === b._id ? "var(--admin-accent)" : "var(--admin-border)"}`,
                        background: mapBookingId === b._id ? "var(--admin-accent-soft)" : "var(--admin-surface-2)",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="booking"
                        checked={mapBookingId === b._id}
                        onChange={() => {
                          setMapBookingId(b._id);
                          setMapBrand(b.productDetails?.brand || mapBrand);
                          setMapModel(b.productDetails?.modelNumber || mapModel);
                          if (b.productDetails?.serialNumber) {
                            setMapSerial(b.productDetails.serialNumber);
                          }
                        }}
                        style={{ marginTop: 3 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13 }}>
                          <span style={{ fontWeight: 600 }}>{b.serviceName || "Service"}</span>
                          <span style={{ color: "var(--admin-text-dim)" }}>{b.status}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--admin-text-dim)", marginTop: 4 }}>
                          Serial: {b.productDetails?.serialNumber || "—"} ·{" "}
                          {b.productDetails?.brand || "No brand"}
                          {b.productDetails?.modelNumber ? ` / ${b.productDetails.modelNumber}` : ""}
                        </div>
                        <Link
                          href={`/admin/bookings/${b._id}`}
                          style={{ fontSize: 11, color: "var(--admin-info)", marginTop: 4, display: "inline-block" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Open booking →
                        </Link>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {search.appliances.length > 0 && (
              <div className="admin-card">
                <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: "var(--admin-text-muted)", marginBottom: 12 }}>
                  Existing mappings for this phone
                </h3>
                {search.appliances.map((a) => (
                  <button
                    key={a._id}
                    type="button"
                    className="admin-btn admin-btn-ghost"
                    style={{ width: "100%", justifyContent: "flex-start", marginBottom: 8 }}
                    onClick={() => {
                      setSerialView(a);
                      setMapSerial(a.serialNumber);
                      setMapBrand(a.brand || "");
                      setMapModel(a.modelNumber || "");
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      qr_code_2
                    </span>
                    {a.serialNumber}
                    <span style={{ color: "var(--admin-text-dim)", fontWeight: 400 }}>
                      · {(a.phones || []).length} phone(s)
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="admin-card">
              <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: "var(--admin-text-muted)", marginBottom: 12 }}>
                Map serial number
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label className="admin-label">Serial Number *</label>
                  <input
                    className="admin-input"
                    placeholder="WM123456789"
                    value={mapSerial}
                    onChange={(e) => setMapSerial(e.target.value)}
                  />
                </div>
                <div>
                  <label className="admin-label">Brand</label>
                  <input
                    className="admin-input"
                    placeholder="e.g. Samsung"
                    value={mapBrand}
                    onChange={(e) => setMapBrand(e.target.value)}
                  />
                </div>
                <div>
                  <label className="admin-label">Model Number</label>
                  <input
                    className="admin-input"
                    placeholder="e.g. WW80T"
                    value={mapModel}
                    onChange={(e) => setMapModel(e.target.value)}
                  />
                </div>
                <p style={{ fontSize: 12, color: "var(--admin-text-dim)" }}>
                  Phone <strong style={{ color: "var(--admin-text)" }}>{search.phone}</strong> will
                  remain associated. Optional selected booking will receive this serial.
                </p>
                <button
                  className="admin-btn admin-btn-primary"
                  type="button"
                  onClick={handleMap}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Confirm mapping"}
                </button>
              </div>
            </div>

            {activeMapping && (
              <MappingCard
                mapping={activeMapping}
                extraPhone={extraPhone}
                setExtraPhone={setExtraPhone}
                onAddPhone={handleAddPhone}
                saving={saving}
              />
            )}
          </div>
        </div>
      )}

      {!search && serialView && !loading && (
        <div style={{ maxWidth: 480, marginBottom: 24 }}>
          <MappingCard
            mapping={serialView}
            extraPhone={extraPhone}
            setExtraPhone={setExtraPhone}
            onAddPhone={handleAddPhone}
            saving={saving}
          />
        </div>
      )}

      <div className="admin-card">
        <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: "var(--admin-text-muted)", marginBottom: 12 }}>
          Recent mappings
        </h3>
        {recent.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--admin-text-dim)" }}>No mappings yet</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Serial</th>
                  <th>Phones</th>
                  <th>Brand / Model</th>
                  <th>Mapped by</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recent.map((a) => (
                  <tr key={a._id}>
                    <td style={{ fontWeight: 600 }}>{a.serialNumber}</td>
                    <td>{(a.phones || []).join(", ")}</td>
                    <td>
                      {[a.brand, a.modelNumber].filter(Boolean).join(" / ") || "—"}
                    </td>
                    <td>{a.mappedBy || "—"}</td>
                    <td>
                      <button
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                        type="button"
                        onClick={() => {
                          setSerialView(a);
                          setSerialQuery(a.serialNumber);
                          setMapSerial(a.serialNumber);
                          setMapBrand(a.brand || "");
                          setMapModel(a.modelNumber || "");
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function MappingCard({
  mapping,
  extraPhone,
  setExtraPhone,
  onAddPhone,
  saving,
}: {
  mapping: ApplianceMapping;
  extraPhone: string;
  setExtraPhone: (v: string) => void;
  onAddPhone: () => void;
  saving: boolean;
}) {
  return (
    <div className="admin-card">
      <h3 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: "var(--admin-text-muted)", marginBottom: 12 }}>
        Appliance identity
      </h3>
      <div style={{ fontSize: 13, display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        <div>
          <strong style={{ color: "var(--admin-text-dim)" }}>Serial:</strong>{" "}
          <span style={{ fontWeight: 700, letterSpacing: 0.3 }}>{mapping.serialNumber}</span>
        </div>
        <div>
          <strong style={{ color: "var(--admin-text-dim)" }}>Brand / Model:</strong>{" "}
          {[mapping.brand, mapping.modelNumber].filter(Boolean).join(" / ") || "—"}
        </div>
        <div>
          <strong style={{ color: "var(--admin-text-dim)" }}>Associated phones:</strong>
          <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
            {(mapping.phones || []).map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        {mapping.primaryBookingId && (
          <div>
            <strong style={{ color: "var(--admin-text-dim)" }}>Primary booking:</strong>{" "}
            <Link href={`/admin/bookings/${mapping.primaryBookingId}`} style={{ color: "var(--admin-info)" }}>
              {mapping.primaryBookingId.slice(-8)}
            </Link>
          </div>
        )}
      </div>

      <label className="admin-label">Add another phone</label>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="admin-input"
          placeholder="7004771388"
          value={extraPhone}
          onChange={(e) => setExtraPhone(e.target.value)}
        />
        <button
          className="admin-btn admin-btn-secondary"
          type="button"
          onClick={onAddPhone}
          disabled={saving}
        >
          Add
        </button>
      </div>
    </div>
  );
}
