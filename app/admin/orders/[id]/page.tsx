"use client";

import { AdminOrderDetail } from "@/app/admin/components/AdminOrderDetail";

export default function AdminSparePartOrderDetailPage() {
  return (
    <AdminOrderDetail
      backHref="/admin/orders"
      backLabel="Spare parts orders"
    />
  );
}
