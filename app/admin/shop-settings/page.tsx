"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { API_URL } from "@/app/config";

const DEFAULT_MESSAGE =
  "Fixxer Shop is under maintenance. Please check back soon.";

type ShopSettings = {
  maintenanceEnabled: boolean;
  maintenanceMessage: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
};

export default function AdminShopSettingsPage() {
  const { token } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const headers = useCallback(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token],
  );

  const applySettings = (data: ShopSettings) => {
    setEnabled(Boolean(data.maintenanceEnabled));
    setMessage(
      typeof data.maintenanceMessage === "string" && data.maintenanceMessage.trim()
        ? data.maintenanceMessage
        : DEFAULT_MESSAGE,
    );
    setUpdatedAt(data.updatedAt ?? null);
  };

  const loadSettings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/admin/shop-settings`, {
        headers: headers(),
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Could not load shop settings");
      }
      applySettings(data as ShopSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load shop settings");
    } finally {
      setLoading(false);
    }
  }, [token, headers]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || saving) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_URL}/admin/shop-settings`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({
          maintenanceEnabled: enabled,
          maintenanceMessage: message.trim() || DEFAULT_MESSAGE,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Could not save shop settings");
      }
      applySettings(data as ShopSettings);
      setSuccess(
        enabled
          ? "Fixxer Shop is now under maintenance for customers."
          : "Fixxer Shop is live again for customers.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save shop settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
            Shop Maintenance
          </h2>
          <p style={{ fontSize: 13, color: "var(--admin-text-dim)", marginTop: 4 }}>
            Toggle Fixxer Shop only. Bookings and the rest of the app stay available.
          </p>
        </div>
        <Link
          href="/shop"
          className="admin-btn admin-btn-secondary admin-btn-sm"
          target="_blank"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            open_in_new
          </span>
          Preview shop
        </Link>
      </div>

      {loading ? (
        <div className="admin-card" style={{ padding: 28 }}>
          Loading shop settings…
        </div>
      ) : (
        <form
          className="admin-card"
          onSubmit={save}
          style={{ maxWidth: 640, padding: 28 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Under maintenance</div>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 13,
                  color: "var(--admin-text-dim)",
                  maxWidth: 380,
                }}
              >
                When enabled, customers see an animated maintenance screen on Shop,
                Cart, Checkout, and Orders. Admins can still open the shop to preview.
              </p>
            </div>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <input
                type="checkbox"
                checked={enabled}
                onChange={(event) => {
                  setEnabled(event.target.checked);
                  setSuccess("");
                }}
              />
              <span
                className={`admin-badge ${
                  enabled ? "admin-badge-warning" : "admin-badge-success"
                }`}
              >
                {enabled ? "Maintenance ON" : "Shop LIVE"}
              </span>
            </label>
          </div>

          <div style={{ marginTop: 22 }}>
            <label className="admin-label" htmlFor="maintenance-message">
              Customer message
            </label>
            <textarea
              id="maintenance-message"
              className="admin-input"
              rows={3}
              maxLength={280}
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setSuccess("");
              }}
              placeholder={DEFAULT_MESSAGE}
              style={{ resize: "vertical", minHeight: 88 }}
            />
            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                color: "var(--admin-text-dim)",
              }}
            >
              {message.trim().length}/280 · Shown on the Fixxer Shop Under
              Maintenance screen
            </div>
          </div>

          {error ? (
            <div
              style={{
                marginTop: 18,
                fontSize: 13,
                color: "var(--admin-error)",
              }}
            >
              {error}
            </div>
          ) : null}
          {success ? (
            <div
              style={{
                marginTop: 18,
                fontSize: 13,
                color: "var(--admin-success, #15803d)",
              }}
            >
              {success}
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 22,
              paddingTop: 18,
              borderTop: "1px solid var(--admin-border)",
            }}
          >
            <div style={{ fontSize: 12, color: "var(--admin-text-dim)" }}>
              {updatedAt
                ? `Last updated ${new Date(updatedAt).toLocaleString()}`
                : "Not saved yet"}
            </div>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={saving}
            >
              <span className="material-symbols-outlined">save</span>
              {saving ? "Saving…" : "Save settings"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
