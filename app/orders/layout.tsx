import ShopMaintenanceGate from "@/app/components/shop/ShopMaintenanceGate";

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <ShopMaintenanceGate>{children}</ShopMaintenanceGate>;
}
