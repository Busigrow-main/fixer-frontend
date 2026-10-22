import ApplianceShopPage from "@/app/components/shop/ApplianceShopPage";

export const metadata = { title: "Appliances | Fixxer" };

const categoryKeys: Record<string, string> = {
  refrigerator: "fridge",
  "washing-machine": "washer",
  ac: "ac",
  microwave: "microwave",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  return <ApplianceShopPage initialCategory={categoryKeys[type ?? ""] ?? "all"} />;
}
