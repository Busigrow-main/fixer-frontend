"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api/v1";

interface ServiceablePincode {
  _id: string;
  pincode: string;
  city: string;
  state: string;
  isActive: boolean;
  createdAt?: string;
}

export default function ServiceablePincodesPage() {
  const { token } = useAuth();

  const [pincodes, setPincodes] = useState<ServiceablePincode[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("Patna");
  const [state, setState] = useState("Bihar");

  const fetchPincodes = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const response = await fetch(
        `${API}/admin/serviceable-pincodes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch pincodes");
      }

      const data = await response.json();
      setPincodes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch pincodes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPincodes();
  }, [token]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(pincode.trim())) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }

    if (!token) return;

    try {
      setSubmitting(true);

      const response = await fetch(
        `${API}/admin/serviceable-pincodes`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pincode: pincode.trim(),
            city: city.trim(),
            state: state.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to add pincode");
      }

      setPincode("");
      await fetchPincodes();
    } catch (error: any) {
      alert(error.message || "Failed to add pincode");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!token) return;

    const confirmed = window.confirm(
      "Are you sure you want to deactivate this pincode?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API}/admin/serviceable-pincodes/${id}/deactivate`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to deactivate pincode");
      }

      await fetchPincodes();
    } catch (error: any) {
      alert(error.message || "Failed to deactivate pincode");
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: -0.5,
          }}
        >
          Serviceable Pincodes
        </h2>

        <p
          style={{
            fontSize: 13,
            color: "var(--admin-text-dim)",
            marginTop: 4,
          }}
        >
          Manage the areas where Fixxer provides service.
        </p>
      </div>

      {/* Add Pincode */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div style={{ padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
            Add Serviceable Pincode
          </h3>

          <form
            onSubmit={handleAdd}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr auto",
              gap: 12,
              alignItems: "end",
            }}
          >
            <div>
              <label className="admin-label">Pincode</label>
              <input
                className="admin-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="e.g. 800030"
                value={pincode}
                onChange={(e) =>
                  setPincode(e.target.value.replace(/\D/g, ""))
                }
              />
            </div>

            <div>
              <label className="admin-label">City</label>
              <input
                className="admin-input"
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div>
              <label className="admin-label">State</label>
              <input
                className="admin-input"
                type="text"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={submitting}
            >
              {submitting ? "Adding..." : "Add Pincode"}
            </button>
          </form>
        </div>
      </div>

      {/* Pincode List */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Pincode</th>
              <th>City</th>
              <th>State</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    padding: 40,
                  }}
                >
                  <div
                    className="admin-spinner"
                    style={{ margin: "0 auto" }}
                  />
                </td>
              </tr>
            ) : pincodes.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    textAlign: "center",
                    padding: 40,
                    color: "var(--admin-text-muted)",
                  }}
                >
                  No serviceable pincodes found.
                </td>
              </tr>
            ) : (
              pincodes.map((item) => (
                <tr key={item._id}>
                  <td
                    style={{
                      fontFamily: "monospace",
                      fontWeight: 600,
                    }}
                  >
                    {item.pincode}
                  </td>

                  <td>{item.city}</td>

                  <td>{item.state}</td>

                  <td>
                    <span
                      className={`admin-badge ${
                        item.isActive
                          ? "admin-badge-completed"
                          : "admin-badge-cancelled"
                      }`}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString()
                      : "—"}
                  </td>

                  <td>
                    {item.isActive ? (
                      <button
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={() => handleDeactivate(item._id)}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--admin-text-muted)",
                        }}
                      >
                        Deactivated
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}