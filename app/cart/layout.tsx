import ShopMaintenanceGate from "@/app/components/shop/ShopMaintenanceGate";

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <ShopMaintenanceGate>{children}</ShopMaintenanceGate>;
}
