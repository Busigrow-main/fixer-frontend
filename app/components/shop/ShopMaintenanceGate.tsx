"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import ShopMaintenanceScreen from "@/app/components/shop/ShopMaintenanceScreen";
import { getShopStatus } from "@/app/lib/shop-maintenance";

/**
 * Gates Fixxer Shop customer surfaces only. Admin users can still preview the shop.
 * Home, services, bookings, and other non-shop routes are unaffected.
 */
export default function ShopMaintenanceGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [message, setMessage] = useState(
    "Fixxer Shop is under maintenance. Please check back soon.",
  );

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    getShopStatus(controller.signal)
      .then((status) => {
        if (cancelled) return;
        setMaintenance(status.maintenance);
        setMessage(status.message);
      })
      .catch(() => {
        /* soft-fail: keep shop open if status cannot be fetched */
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  if (checking || authLoading) {
    return (
      <div className="shop-shell flex min-h-[50vh] items-center justify-center bg-[#f6f6f6]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-primary" />
      </div>
    );
  }

  if (maintenance && user?.role !== "ADMIN") {
    return <ShopMaintenanceScreen message={message} />;
  }

  return <>{children}</>;
}
