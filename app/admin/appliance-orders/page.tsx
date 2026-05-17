"use client";

import { AdminOrdersList } from "@/app/admin/components/AdminOrdersList";

export default function AdminApplianceOrdersPage() {
  return (
    <AdminOrdersList
      orderType="appliance"
      title="Appliance Enquiries"
      subtitle="AC and appliance purchase enquiries"
      detailBasePath="/admin/appliance-orders"
    />
  );
}
