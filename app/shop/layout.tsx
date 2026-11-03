import ShopMaintenanceGate from "@/app/components/shop/ShopMaintenanceGate";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <ShopMaintenanceGate>{children}</ShopMaintenanceGate>;
}
