import SparePartDetail from "@/app/components/shop/detail/SparePartDetail";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SparePartDetail id={id} />;
}
