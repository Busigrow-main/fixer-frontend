import SparePartsPage from "@/app/components/shop/spare-parts/SparePartsPage";

export const metadata = { title: "Spare Parts | Fixxer" };

const categoryKeys: Record<string, string> = {
  refrigerator: "fridge",
  "washing-machine": "washer",
  ac: "ac",
  microwave: "microwave",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; type?: string }> }) {
  const { q = "", type = "" } = await searchParams;
  return (
    <SparePartsPage
      key={`${type}:${q}`}
      initialQuery={q}
      initialCategory={categoryKeys[type] ?? "all"}
    />
  );
}
