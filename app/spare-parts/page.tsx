import SparePartsClient from "@/app/components/spare-parts/SparePartsClient";

export default async function SparePartsPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
  
  let initialCategories = [];

  try {
    // Fetch the pre-computed navigation tree
    const res = await fetch(`${apiUrl}/spare-parts/categories`, {
      cache: "no-store",
    });

    if (res.ok) {
      initialCategories = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch spare parts navigation tree:", error);
  }

  return (
    <SparePartsClient 
      initialCategories={initialCategories} 
      apiUrl={apiUrl} 
    />
  );
}
