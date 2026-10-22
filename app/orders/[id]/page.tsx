import OrderDetailsClient from "@/app/components/shop/orders/OrderDetailsClient";

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetailsClient id={id} />;
}
