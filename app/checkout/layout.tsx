import ShopMaintenanceGate from "@/app/components/shop/ShopMaintenanceGate";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <ShopMaintenanceGate>{children}</ShopMaintenanceGate>;
}
