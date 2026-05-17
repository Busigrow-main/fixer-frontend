"use client";

import { AdminOrdersList } from "@/app/admin/components/AdminOrdersList";

export default function AdminSparePartOrdersPage() {
  return (
    <AdminOrdersList
      orderType="part"
      title="Spare Parts Orders"
      subtitle="Part enquiries and deliveries"
      detailBasePath="/admin/orders"
    />
  );
}
