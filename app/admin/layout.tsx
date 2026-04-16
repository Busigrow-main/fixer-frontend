"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import "./admin.css";

const NAV_ITEMS = [
  { href: "/admin", icon: "dashboard", label: "Dashboard", exact: true },
  { href: "/admin/bookings", icon: "calendar_month", label: "Bookings" },
  { href: "/admin/technicians", icon: "engineering", label: "Technicians" },
  { href: "/admin/spare-parts", icon: "build", label: "Spare Parts" },
  { href: "/admin/spare-parts/bulk-upload", icon: "upload_file", label: "Bulk Upload" },
  { href: "/admin/orders", icon: "local_shipping", label: "Part Orders" },
  { href: "/admin/users", icon: "group", label: "Users" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, token, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !token) {
      router.push("/admin/login");
    } else if (!loading && user && user.role !== "ADMIN") {
      router.push("/");
    }
  }, [loading, token, user, router]);

  // Don't render shell on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="admin-shell" style={{ alignItems: "center", justifyContent: "center" }}>
        <div className="admin-spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="admin-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 35 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-brand">
          <h1>
            Fixxer<span>.</span>
          </h1>
          <p>Admin Console</p>
        </div>

        <nav className="admin-nav">
          <div className="admin-nav-section">Main</div>
          {NAV_ITEMS.slice(0, 1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item ${isActive(item.href, item.exact) ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          <div className="admin-nav-section">Management</div>
          {NAV_ITEMS.slice(1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item ${isActive(item.href, item.exact) ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-nav-item" onClick={logout} style={{ color: "var(--admin-error)" }}>
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        <header className="admin-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="admin-btn-ghost admin-btn-sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: "none" }}
              id="admin-menu-toggle"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="admin-header-title">
              {NAV_ITEMS.find((n) => isActive(n.href, n.exact))?.label || "Admin"}
            </span>
          </div>
          <div className="admin-header-actions">
            <span style={{ fontSize: 12, color: "var(--admin-text-dim)" }}>
              {user.fullName || user.phone}
            </span>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "var(--admin-accent-soft)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: "var(--admin-accent)",
              }}
            >
              {(user.fullName || user.phone || "A")[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </main>

      {/* Mobile toggle CSS injection */}
      <style>{`
        @media (max-width: 1024px) {
          #admin-menu-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
