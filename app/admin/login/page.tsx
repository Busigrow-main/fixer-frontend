"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import "../admin.css";

export default function AdminLoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(phone, password);
      // login() already fetches user data and sets it in context.
      // We need to wait briefly for state to propagate, then check role.
      // The layout's useEffect will handle redirecting non-admins.
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--admin-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--admin-surface)",
          border: "1px solid var(--admin-border)",
          borderRadius: 24,
          padding: "48px 40px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--admin-text)", letterSpacing: -0.5 }}>
            Fixxer<span style={{ color: "var(--admin-accent)" }}>.</span>
          </h1>
          <p
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 2,
              color: "var(--admin-text-muted)",
              marginTop: 6,
              fontWeight: 600,
            }}
          >
            Admin Console
          </p>
        </div>

        {error && (
          <div
            style={{
              marginBottom: 24,
              padding: "12px 16px",
              borderRadius: 12,
              background: "var(--admin-error-soft)",
              color: "var(--admin-error)",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              error
            </span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label className="admin-label">Phone Number</label>
            <input
              type="tel"
              required
              placeholder="+91 00000 00000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="admin-input"
            />
          </div>

          <div style={{ marginBottom: 32 }}>
            <label className="admin-label">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input"
            />
          </div>

          <button type="submit" disabled={loading} className="admin-btn admin-btn-primary" style={{ width: "100%", height: 48, fontSize: 14 }}>
            {loading ? <div className="admin-spinner" /> : "Sign in to Admin"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <a
            href="/"
            style={{ fontSize: 12, color: "var(--admin-text-muted)", textDecoration: "none" }}
          >
            ← Back to Website
          </a>
        </div>
      </div>
    </div>
  );
}
