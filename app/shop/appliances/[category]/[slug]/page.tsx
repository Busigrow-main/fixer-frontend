import ApplianceDetail from "@/app/components/shop/appliances/detail/ApplianceDetail";

export default async function Page({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { slug } = await params;
  return <ApplianceDetail slug={slug} />;
}
