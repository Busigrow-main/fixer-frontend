"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { API_URL } from "@/app/config";

type Offer = {
  _id: string;
  title: string;
  description: string;
  badge: string;
  discountText: string;
  couponCode: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
  theme: "RED" | "DARK" | "BLUE" | "GOLD";
  audience: "ALL" | "SERVICES" | "SHOP";
  terms: string;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  priority: number;
};

type OfferForm = Omit<Offer, "_id" | "startsAt" | "endsAt"> & {
  startsAt: string;
  endsAt: string;
};

const EMPTY_FORM: OfferForm = {
  title: "",
  description: "",
  badge: "Limited time",
  discountText: "",
  couponCode: "",
  imageUrl: "",
  ctaLabel: "Explore offer",
  ctaHref: "/services",
  theme: "RED",
  audience: "ALL",
  terms: "",
  isActive: true,
  startsAt: "",
  endsAt: "",
  priority: 0,
};

function dateTimeInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function campaignStatus(offer: Offer) {
  if (!offer.isActive) return { label: "Paused", className: "admin-badge-ghost" };
  const now = Date.now();
  if (offer.startsAt && new Date(offer.startsAt).getTime() > now) {
    return { label: "Scheduled", className: "admin-badge-warning" };
  }
  if (offer.endsAt && new Date(offer.endsAt).getTime() <= now) {
    return { label: "Expired", className: "admin-badge-error" };
  }
  return { label: "Live", className: "admin-badge-success" };
}

export default function AdminOffersPage() {
  const { token } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [form, setForm] = useState<OfferForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const headers = useCallback(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token],
  );

  const loadOffers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/offers?limit=100`, {
        headers: headers(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load offers");
      setOffers(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load offers");
    } finally {
      setLoading(false);
    }
  }, [token, headers]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const updateField = <K extends keyof OfferForm>(
    key: K,
    value: OfferForm[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId("");
    setError("");
  };

  const editOffer = (offer: Offer) => {
    setEditingId(offer._id);
    setForm({
      title: offer.title,
      description: offer.description || "",
      badge: offer.badge || "Limited time",
      discountText: offer.discountText,
      couponCode: offer.couponCode || "",
      imageUrl: offer.imageUrl || "",
      ctaLabel: offer.ctaLabel || "Explore offer",
      ctaHref: offer.ctaHref || "/services",
      theme: offer.theme || "RED",
      audience: offer.audience || "ALL",
      terms: offer.terms || "",
      isActive: offer.isActive,
      startsAt: dateTimeInput(offer.startsAt),
      endsAt: dateTimeInput(offer.endsAt),
      priority: offer.priority || 0,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveOffer = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        ...form,
        startsAt: form.startsAt
          ? new Date(form.startsAt).toISOString()
          : null,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      };
      const response = await fetch(
        editingId
          ? `${API_URL}/admin/offers/${editingId}`
          : `${API_URL}/admin/offers`,
        {
          method: editingId ? "PUT" : "POST",
          headers: headers(),
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not save offer");
      setMessage(editingId ? "Offer updated" : "Offer created");
      resetForm();
      await loadOffers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save offer");
    } finally {
      setSaving(false);
    }
  };

  const toggleOffer = async (offer: Offer) => {
    setError("");
    try {
      const response = await fetch(
        `${API_URL}/admin/offers/${offer._id}/active`,
        {
          method: "PATCH",
          headers: headers(),
          body: JSON.stringify({ isActive: !offer.isActive }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not update offer");
      await loadOffers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update offer");
    }
  };

  const deleteOffer = async (offer: Offer) => {
    if (!confirm(`Delete “${offer.title}”? This cannot be undone.`)) return;
    setError("");
    try {
      const response = await fetch(`${API_URL}/admin/offers/${offer._id}`, {
        method: "DELETE",
        headers: headers(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not delete offer");
      if (editingId === offer._id) resetForm();
      await loadOffers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete offer");
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
            Offers
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "var(--admin-text-dim)",
              marginTop: 4,
            }}
          >
            Create, schedule, prioritize, and pause homepage campaigns.
          </p>
        </div>
        <span className="admin-badge admin-badge-success">
          {offers.filter((offer) => campaignStatus(offer).label === "Live").length} live
        </span>
      </div>

      {(message || error) && (
        <div
          style={{
            padding: "12px 14px",
            marginBottom: 18,
            borderRadius: 10,
            fontSize: 13,
            color: error ? "var(--admin-error)" : "var(--admin-success)",
            background: error
              ? "var(--admin-error-soft)"
              : "var(--admin-success-soft)",
          }}
        >
          {error || message}
        </div>
      )}

      <form className="admin-card" onSubmit={saveOffer}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 750 }}>
              {editingId ? "Edit campaign" : "New campaign"}
            </h3>
            <p
              style={{
                color: "var(--admin-text-dim)",
                fontSize: 12,
                marginTop: 3,
              }}
            >
              Live dates are evaluated automatically—no manual publishing required.
            </p>
          </div>
          {editingId && (
            <button
              type="button"
              className="admin-btn admin-btn-ghost admin-btn-sm"
              onClick={resetForm}
            >
              Cancel edit
            </button>
          )}
        </div>

        <div className="offer-admin-grid">
          <Field label="Campaign title *">
            <input
              required
              className="admin-input"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="AC summer service special"
            />
          </Field>
          <Field label="Savings text *">
            <input
              required
              className="admin-input"
              value={form.discountText}
              onChange={(event) =>
                updateField("discountText", event.target.value)
              }
              placeholder="25% OFF"
            />
          </Field>
          <Field label="Short description">
            <input
              className="admin-input"
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="On AC cleaning and repair bookings"
            />
          </Field>
          <Field label="Campaign badge">
            <input
              className="admin-input"
              value={form.badge}
              onChange={(event) => updateField("badge", event.target.value)}
              placeholder="Summer special"
            />
          </Field>
          <Field label="Coupon code">
            <input
              className="admin-input"
              value={form.couponCode}
              onChange={(event) =>
                updateField("couponCode", event.target.value.toUpperCase())
              }
              placeholder="SUMMER25"
            />
          </Field>
          <Field label="Audience">
            <select
              className="admin-input"
              value={form.audience}
              onChange={(event) =>
                updateField(
                  "audience",
                  event.target.value as OfferForm["audience"],
                )
              }
            >
              <option value="ALL">All customers</option>
              <option value="SERVICES">Repair services</option>
              <option value="SHOP">Fixxer Shop</option>
            </select>
          </Field>
          <Field label="CTA label">
            <input
              className="admin-input"
              value={form.ctaLabel}
              onChange={(event) => updateField("ctaLabel", event.target.value)}
              placeholder="Book now"
            />
          </Field>
          <Field label="CTA destination">
            <input
              className="admin-input"
              value={form.ctaHref}
              onChange={(event) => updateField("ctaHref", event.target.value)}
              placeholder="/services/ac"
            />
          </Field>
          <Field label="Starts at">
            <input
              type="datetime-local"
              className="admin-input"
              value={form.startsAt}
              onChange={(event) => updateField("startsAt", event.target.value)}
            />
          </Field>
          <Field label="Ends at">
            <input
              type="datetime-local"
              className="admin-input"
              value={form.endsAt}
              onChange={(event) => updateField("endsAt", event.target.value)}
            />
          </Field>
          <Field label="Card theme">
            <select
              className="admin-input"
              value={form.theme}
              onChange={(event) =>
                updateField(
                  "theme",
                  event.target.value as OfferForm["theme"],
                )
              }
            >
              <option value="RED">Fixxer red</option>
              <option value="DARK">Midnight</option>
              <option value="BLUE">Cool blue</option>
              <option value="GOLD">Festive gold</option>
            </select>
          </Field>
          <Field label="Display priority">
            <input
              type="number"
              min={0}
              className="admin-input"
              value={form.priority}
              onChange={(event) =>
                updateField("priority", Number(event.target.value))
              }
              placeholder="0"
            />
          </Field>
          <Field label="Background image URL">
            <input
              type="url"
              className="admin-input"
              value={form.imageUrl}
              onChange={(event) => updateField("imageUrl", event.target.value)}
              placeholder="https://..."
            />
          </Field>
          <Field label="Offer terms">
            <input
              className="admin-input"
              value={form.terms}
              onChange={(event) => updateField("terms", event.target.value)}
              placeholder="Valid once per customer"
            />
          </Field>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginTop: 20,
            paddingTop: 18,
            borderTop: "1px solid var(--admin-border)",
          }}
        >
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                updateField("isActive", event.target.checked)
              }
            />
            Enable this campaign
          </label>
          <button
            type="submit"
            className="admin-btn admin-btn-primary"
            disabled={saving}
          >
            <span className="material-symbols-outlined">
              {editingId ? "save" : "add"}
            </span>
            {saving
              ? "Saving..."
              : editingId
                ? "Save changes"
                : "Create offer"}
          </button>
        </div>
      </form>

      <div className="admin-card" style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 750 }}>Campaigns</h3>
          <p
            style={{
              color: "var(--admin-text-dim)",
              fontSize: 12,
              marginTop: 3,
            }}
          >
            Higher priority campaigns appear first on the homepage.
          </p>
        </div>

        {loading ? (
          <div className="admin-empty">
            <div className="admin-spinner" style={{ margin: "0 auto" }} />
          </div>
        ) : offers.length === 0 ? (
          <div className="admin-empty">
            <span className="material-symbols-outlined">local_offer</span>
            <p>No campaigns yet</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Savings</th>
                  <th>Schedule</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => {
                  const status = campaignStatus(offer);
                  return (
                    <tr key={offer._id}>
                      <td>
                        <div style={{ fontWeight: 650 }}>{offer.title}</div>
                        <div
                          style={{
                            color: "var(--admin-text-dim)",
                            fontSize: 11,
                            marginTop: 3,
                          }}
                        >
                          {offer.badge} · {offer.audience}
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: "var(--admin-accent)" }}>
                          {offer.discountText}
                        </strong>
                        {offer.couponCode && (
                          <div
                            style={{
                              color: "var(--admin-text-dim)",
                              fontSize: 11,
                              marginTop: 3,
                            }}
                          >
                            Code: {offer.couponCode}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: 12 }}>
                        <div>
                          {offer.startsAt
                            ? new Date(offer.startsAt).toLocaleString("en-IN")
                            : "Immediately"}
                        </div>
                        <div
                          style={{
                            color: "var(--admin-text-dim)",
                            marginTop: 3,
                          }}
                        >
                          to{" "}
                          {offer.endsAt
                            ? new Date(offer.endsAt).toLocaleString("en-IN")
                            : "No expiry"}
                        </div>
                      </td>
                      <td>{offer.priority}</td>
                      <td>
                        <span
                          className={`admin-badge ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                            onClick={() => editOffer(offer)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                            onClick={() => toggleOffer(offer)}
                          >
                            {offer.isActive ? "Pause" : "Enable"}
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-danger admin-btn-sm"
                            onClick={() => deleteOffer(offer)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .offer-admin-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        @media (max-width: 760px) {
          .offer-admin-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className="admin-label">{label}</span>
      {children}
    </label>
  );
}
