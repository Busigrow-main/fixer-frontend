"use client";

import { AdminOrderDetail } from "@/app/admin/components/AdminOrderDetail";

export default function AdminApplianceOrderDetailPage() {
  return (
    <AdminOrderDetail
      backHref="/admin/appliance-orders"
      backLabel="Appliance enquiries"
    />
  );
}
