import ShopAllProductsPage from "@/app/components/shop/ShopAllProductsPage";

export const metadata = { title: "All Shop Products | Fixxer" };

export default async function ShopAllPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  return <ShopAllProductsPage key={q} initialQuery={q} />;
}
