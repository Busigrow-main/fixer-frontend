"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import "./admin.css";

const NAV_ITEMS = [
  { href: "/admin", icon: "dashboard", label: "Dashboard", exact: true },
  { href: "/admin/bookings", icon: "calendar_month", label: "Bookings" },
  { href: "/admin/offers", icon: "local_offer", label: "Offers" },
  {
    href: "/admin/appliance-mappings",
    icon: "qr_code_2",
    label: "Serial Mapping",
  },
  {
    href: "/admin/serviceable-pincodes",
    icon: "location_on",
    label: "Serviceable Pincodes",
  },
  { href: "/admin/leads", icon: "contact_page", label: "Leads" },
  { href: "/admin/technicians", icon: "engineering", label: "Technicians" },
  { href: "/admin/spare-parts", icon: "build", label: "Spare Parts" },
  {
    href: "/admin/spare-parts/bulk-upload",
    icon: "upload_file",
    label: "Bulk Upload",
  },
  {
    href: "/admin/orders",
    icon: "package_2",
    label: "Spare Part Orders",
  },
  {
    href: "/admin/appliance-orders",
    icon: "ac_unit",
    label: "Appliance Orders",
  },
  { href: "/admin/users", icon: "group", label: "Users" },
];

type Theme = "light" | "dark";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    if (!loading && !token) {
      router.push("/admin/login");
    } else if (!loading && user && user.role !== "ADMIN") {
      router.push("/");
    }
  }, [loading, token, user, router]);

  /*
   * Load saved admin theme.
   */
  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem(
        "fixxer-admin-theme"
      ) as Theme | null;

      if (savedTheme === "dark" || savedTheme === "light") {
        setTheme(savedTheme);
      } else {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;

        setTheme(prefersDark ? "dark" : "light");
      }
    } catch {
      setTheme("light");
    }

    setThemeReady(true);
  }, []);

  /*
   * Apply theme to the admin shell.
   */
  useEffect(() => {
    if (!themeReady) return;

    try {
      window.localStorage.setItem("fixxer-admin-theme", theme);
    } catch {
      // Ignore localStorage failures.
    }

    document.documentElement.setAttribute("data-admin-theme", theme);
  }, [theme, themeReady]);

  /*
   * Close mobile sidebar when route changes.
   */
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  /*
   * Prevent background scrolling while mobile sidebar is open.
   */
  useEffect(() => {
    if (!sidebarOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sidebarOpen]);

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  // Don't render shell on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div
        className="admin-shell"
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="admin-spinner"
          style={{
            width: 40,
            height: 40,
          }}
        />
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

  const activeNavItem = NAV_ITEMS.find((item) =>
    isActive(item.href, item.exact)
  );

  return (
    <div
      className={`admin-shell admin-theme-${theme}`}
      data-theme={theme}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="admin-mobile-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}
        aria-label="Admin navigation"
      >
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
              className={`admin-nav-item ${
                isActive(item.href, item.exact) ? "active" : ""
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </Link>
          ))}

          <div className="admin-nav-section">Management</div>

          {NAV_ITEMS.slice(1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item ${
                isActive(item.href, item.exact) ? "active" : ""
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          {/* Theme toggle */}
          <button
            type="button"
            className="admin-theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${
              theme === "dark" ? "light" : "dark"
            } mode`}
            title={`Switch to ${
              theme === "dark" ? "light" : "dark"
            } mode`}
          >
            <span className="admin-theme-toggle-icon">
              <span className="material-symbols-outlined">
                {theme === "dark" ? "light_mode" : "dark_mode"}
              </span>
            </span>

            <span className="admin-theme-toggle-text">
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </span>

            <span className="admin-theme-toggle-status">
              {theme === "dark" ? "ON" : "OFF"}
            </span>
          </button>

          {/* Logout */}
          <button
            type="button"
            className="admin-nav-item admin-logout-button"
            onClick={logout}
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-header-left">
            {/* Mobile menu */}
            <button
              type="button"
              className="admin-btn-ghost admin-btn-sm admin-mobile-menu"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Open admin menu"
              aria-expanded={sidebarOpen}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            <div className="admin-header-page">
              <span className="admin-header-title">
                {activeNavItem?.label || "Admin"}
              </span>

              <span className="admin-header-dot" />
            </div>
          </div>

          <div className="admin-header-actions">
            {/* Desktop theme toggle */}
            <button
              type="button"
              className="admin-header-theme"
              onClick={toggleTheme}
              aria-label={`Switch to ${
                theme === "dark" ? "light" : "dark"
              } mode`}
              title={`Switch to ${
                theme === "dark" ? "light" : "dark"
              } mode`}
            >
              <span className="material-symbols-outlined">
                {theme === "dark" ? "light_mode" : "dark_mode"}
              </span>

              <span className="admin-header-theme-label">
                {theme === "dark" ? "Light" : "Dark"}
              </span>
            </button>

            {/* User */}
            <div className="admin-user-info">
              <span className="admin-user-name">
                {user.fullName || user.phone}
              </span>

              <div className="admin-user-avatar">
                {(user.fullName || user.phone || "A")[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </main>

      <style jsx>{`
        /* =========================================================
           ADMIN THEME SYSTEM
        ========================================================= */

        .admin-shell {
          --admin-transition: 180ms ease;

          transition:
            background-color var(--admin-transition),
            color var(--admin-transition);
        }

        /*
         * LIGHT MODE
         */
        .admin-theme-light {
          --admin-bg: #f7f8fa;
          --admin-surface: #ffffff;
          --admin-surface-2: #f3f5f7;
          --admin-surface-3: #eef1f4;

          --admin-text: #15181d;
          --admin-text-dim: #68717d;
          --admin-text-muted: #8b94a0;

          --admin-border: #e4e7eb;
          --admin-border-strong: #d7dce2;

          --admin-accent: #c8102e;
          --admin-accent-soft: rgba(200, 16, 46, 0.09);
          --admin-accent-hover: #a90d27;

          --admin-primary: #c8102e;

          --admin-success: #16a34a;
          --admin-success-soft: rgba(22, 163, 74, 0.1);

          --admin-warning: #d97706;
          --admin-warning-soft: rgba(217, 119, 6, 0.1);

          --admin-error: #dc2626;
          --admin-error-soft: rgba(220, 38, 38, 0.1);

          --admin-info: #2563eb;
          --admin-info-soft: rgba(37, 99, 235, 0.1);

          background: var(--admin-bg);
          color: var(--admin-text);
        }

        /*
         * DARK MODE
         */
        .admin-theme-dark {
          --admin-bg: #090b0e;
          --admin-surface: #111419;
          --admin-surface-2: #171b21;
          --admin-surface-3: #1d2229;

          --admin-text: #f4f6f8;
          --admin-text-dim: #a1a9b4;
          --admin-text-muted: #737d89;

          --admin-border: #262c34;
          --admin-border-strong: #343b45;

          --admin-accent: #c8102e;
          --admin-accent-soft: rgba(200, 16, 46, 0.15);
          --admin-accent-hover: #e0133a;

          --admin-primary: #c8102e;

          --admin-success: #4ade80;
          --admin-success-soft: rgba(74, 222, 128, 0.1);

          --admin-warning: #fbbf24;
          --admin-warning-soft: rgba(251, 191, 36, 0.1);

          --admin-error: #f87171;
          --admin-error-soft: rgba(248, 113, 113, 0.1);

          --admin-info: #60a5fa;
          --admin-info-soft: rgba(96, 165, 250, 0.1);

          background: var(--admin-bg);
          color: var(--admin-text);
        }

        /*
         * Global theme transition
         */
        .admin-shell,
        .admin-shell *,
        .admin-shell *::before,
        .admin-shell *::after {
          transition:
            background-color 180ms ease,
            border-color 180ms ease,
            color 180ms ease,
            box-shadow 180ms ease;
        }

        /*
         * Overlay
         */
        .admin-mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
          z-index: 35;
        }

        /*
         * Header
         */
        .admin-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .admin-header-page {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .admin-header-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--admin-primary);
          opacity: 0.5;
        }

        /*
         * Header theme button
         */
        .admin-header-theme {
          height: 36px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 0 11px;
          border: 1px solid var(--admin-border);
          border-radius: 10px;
          background: var(--admin-surface);
          color: var(--admin-text-dim);
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
        }

        .admin-header-theme:hover {
          color: #fff;
          border-color: var(--admin-accent);
          background: var(--admin-accent);
          box-shadow: 0 4px 16px rgba(200, 16, 46, 0.2);
        }

        .admin-header-theme .material-symbols-outlined {
          font-size: 18px;
        }

        /*
         * User
         */
        .admin-user-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .admin-user-name {
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 12px;
          color: var(--admin-text-dim);
        }

        .admin-user-avatar {
          width: 34px;
          height: 34px;
          flex: 0 0 34px;
          border-radius: 10px;
          background: var(--admin-accent-soft);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 800;
          color: var(--admin-primary);
          border: 1px solid var(--admin-border);
        }

        /*
         * Sidebar theme toggle
         */
        .admin-theme-toggle {
          width: 100%;
          min-height: 44px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 10px;
          margin-bottom: 6px;

          border: 1px solid var(--admin-border);
          border-radius: 12px;

          background: var(--admin-surface-2);
          color: var(--admin-text-dim);

          cursor: pointer;
          text-align: left;
        }

        .admin-theme-toggle:hover {
          background: var(--admin-accent);
          border-color: var(--admin-accent);
          color: #fff;
          box-shadow: 0 4px 16px rgba(200, 16, 46, 0.18);
        }

        .admin-theme-toggle-icon {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 30px;

          background: var(--admin-surface);
          border: 1px solid var(--admin-border);
        }

        .admin-theme-toggle-icon .material-symbols-outlined {
          font-size: 17px;
        }

        .admin-theme-toggle-text {
          flex: 1;
          font-size: 12px;
          font-weight: 700;
        }

        .admin-theme-toggle-status {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.7px;
          color: var(--admin-text-muted);
        }

        /*
         * Logout
         */
        .admin-logout-button {
          width: 100%;
          border: 0;
          background: transparent;
          cursor: pointer;
          text-align: left;
        }

        /*
         * Mobile
         */
        .admin-mobile-menu {
          display: none;
        }

        /*
         * Dark mode adjustments for common admin components
         */
        .admin-theme-dark .admin-card {
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.025);
        }

        .admin-theme-dark .admin-sidebar {
          box-shadow: 1px 0 0 rgba(255, 255, 255, 0.03);
        }

        .admin-theme-dark input,
        .admin-theme-dark textarea,
        .admin-theme-dark select {
          color-scheme: dark;
        }

        /*
         * Mobile responsive
         */
        @media (max-width: 1024px) {
          .admin-mobile-menu {
            display: flex !important;
          }

          .admin-sidebar {
            z-index: 40;
          }
        }

        @media (max-width: 640px) {
          .admin-header-theme-label {
            display: none;
          }

          .admin-header-theme {
            width: 36px;
            padding: 0;
            justify-content: center;
          }

          .admin-user-name {
            display: none;
          }

          .admin-user-info {
            gap: 6px;
          }

          .admin-user-avatar {
            width: 32px;
            height: 32px;
            flex-basis: 32px;
          }

          .admin-header-actions {
            gap: 7px;
          }

          .admin-header-page {
            max-width: 170px;
          }

          .admin-header-title {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .admin-theme-toggle-text {
            font-size: 11px;
          }
        }

        /*
         * Accessibility
         */
        @media (prefers-reduced-motion: reduce) {
          .admin-shell,
          .admin-shell *,
          .admin-shell *::before,
          .admin-shell *::after {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}