import SparePartsClient from "@/app/components/spare-parts/SparePartsClient";
import { Suspense } from "react";

export default async function SparePartsPage() {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

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
    <Suspense fallback={<SparePartsLoadingFallback />}>
      <SparePartsClient initialCategories={initialCategories} apiUrl={apiUrl} />
    </Suspense>
  );
}

function SparePartsLoadingFallback() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="h-20 bg-zinc-100 animate-pulse" />
      <div className="flex-1 p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 bg-zinc-100 rounded-3xl animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
