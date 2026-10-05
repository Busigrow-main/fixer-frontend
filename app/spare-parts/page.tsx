import SparePartsClient from "@/app/components/spare-parts/SparePartsClient";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

async function getJson<T>(
  path: string,
  fallback: T,
): Promise<T> {
  try {
    const response = await fetch(`${API}${path}`, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 60,
      },
    });

    if (!response.ok) {
      return fallback;
    }

    return await response.json();
  } catch {
    return fallback;
  }
}

async function getCategories() {
  const response = await getJson<any>(
    "/spare-parts/categories",
    [],
  );

  if (Array.isArray(response)) {
    return response;
  }

  return (
    response?.data ||
    response?.categories ||
    response?.categoryTree ||
    []
  );
}

async function getPopularParts() {
  const response = await getJson<any>(
    "/spare-parts?isActive=true&isFeatured=true&limit=8",
    { data: [] },
  );

  if (Array.isArray(response)) {
    return response;
  }

  return (
    response?.data ||
    response?.parts ||
    response?.products ||
    []
  );
}

export default async function SparePartsPage() {
  const [categories, popularParts] =
    await Promise.all([
      getCategories(),
      getPopularParts(),
    ]);

  return (
    <SparePartsClient
      initialCategories={categories}
      initialPopularParts={popularParts}
      apiUrl={API}
    />
  );
}