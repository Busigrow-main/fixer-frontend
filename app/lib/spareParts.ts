export interface SparePart {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: string;
  manufacturer: string;
  seller: string;
  deliveryEta: string;
  warranty: string;
  supportsServiceBooking: boolean;
  compatibleModels: string[];
  highlights: string[];
  image: string;
  description: string;
}

export interface ApplianceTypeCategory {
  slug: string;
  name: string;
  icon: string;
  partCount: number;
}

export const SPARE_PARTS: SparePart[] = [
  {
    id: "compressor-inverter-10",
    slug: "inverter-compressor-module",
    name: "Inverter Compressor Module",
    category: "Refrigerator",
    price: "₹6,499",
    manufacturer: "CoolCore Appliances Pvt Ltd",
    seller: "Fixxer OEM Hub",
    deliveryEta: "2-3 business days",
    warranty: "12 months OEM warranty",
    supportsServiceBooking: true,
    compatibleModels: ["FrostPro 340L", "FrostPro 420L", "EcoFreeze Plus 390"],
    highlights: [
      "Factory-sealed copper winding",
      "Low-noise inverter driver",
      "Energy class A+ support",
    ],
    image:
      "https://images.unsplash.com/photo-1571172964276-91faaa704e1d?q=80&w=1600&auto=format&fit=crop",
    description:
      "High-efficiency compressor unit for premium refrigerators, calibrated for stable cooling and lower power draw.",
  },
  {
    id: "wm-drum-belt-8kg",
    slug: "drum-belt-8kg",
    name: "Washer Drum Belt 8kg",
    category: "Washing Machine",
    price: "₹899",
    manufacturer: "SpinTech Industries",
    seller: "Fixxer Parts Partner",
    deliveryEta: "Same day dispatch",
    warranty: "6 months replacement warranty",
    supportsServiceBooking: true,
    compatibleModels: [
      "WashMate TopLoad 8",
      "HydroClean 7.5",
      "AquaSpin Pro 8",
    ],
    highlights: [
      "Heat-resistant polymer blend",
      "Anti-slip groove profile",
      "High tensile weave",
    ],
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1600&auto=format&fit=crop",
    description:
      "Durable replacement drive belt engineered for smooth drum rotation and reduced vibration in 7-8kg machines.",
  },
  {
    id: "ac-pcb-main",
    slug: "main-control-pcb",
    name: "Main Control PCB",
    category: "Air Conditioner",
    price: "₹3,250",
    manufacturer: "ThermaLogic Electronics",
    seller: "Fixxer OEM Hub",
    deliveryEta: "1-2 business days",
    warranty: "9 months seller warranty",
    supportsServiceBooking: true,
    compatibleModels: ["BreezeX 1.5T", "BreezeX 2T", "PolarNest Inverter 1.5T"],
    highlights: [
      "Firmware pre-flashed",
      "Short-circuit protection",
      "Humidity-safe conformal coating",
    ],
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop",
    description:
      "Primary logic board for split AC systems, enabling compressor control, sensor reads, and thermostat communication.",
  },
  {
    id: "mw-magnetron-2m246",
    slug: "magnetron-2m246",
    name: "Magnetron 2M246",
    category: "Microwave",
    price: "₹1,799",
    manufacturer: "HeatWave Components",
    seller: "City Appliance Spares",
    deliveryEta: "2 business days",
    warranty: "3 months functional warranty",
    supportsServiceBooking: true,
    compatibleModels: [
      "QuickHeat 25L",
      "QuickHeat Grill 30L",
      "ChefWave Neo 28L",
    ],
    highlights: [
      "Stable frequency output",
      "Thermal shield included",
      "OEM connector fit",
    ],
    image:
      "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?q=80&w=1600&auto=format&fit=crop",
    description:
      "Replacement magnetron for uniform microwave heating performance with verified compatibility pins.",
  },
];

export function getSparePartBySlug(slug: string) {
  return SPARE_PARTS.find((part) => part.slug === slug);
}

export function getSparePartById(id: string) {
  return SPARE_PARTS.find((part) => part.id === id);
}

/**
 * Fetch appliance type categories from backend API
 * @param apiUrl - Base API URL
 * @returns Array of appliance types with part counts
 */
export async function fetchApplianceTypes(
  apiUrl: string,
): Promise<ApplianceTypeCategory[]> {
  try {
    const res = await fetch(`${apiUrl}/spare-parts/categories`);
    if (!res.ok) throw new Error("Failed to fetch appliance types");
    const data = await res.json();
    // API returns array with applianceTypeSlug, applianceTypeName, partCount
    return data.map((item: any) => ({
      slug: item.applianceTypeSlug,
      name: item.applianceTypeName,
      icon: item.icon || "wrench",
      partCount: item.partCount || 0,
    }));
  } catch (error) {
    console.error("Error fetching appliance types:", error);
    return [];
  }
}

/**
 * Fetch featured/popular spare parts from backend
 * @param apiUrl - Base API URL
 * @param limit - Number of parts to fetch (default: 12)
 * @returns Array of featured spare parts
 */
export async function fetchFeaturedParts(apiUrl: string, limit: number = 12) {
  try {
    const params = new URLSearchParams();
    params.append("limit", String(limit));

    const res = await fetch(
      `${apiUrl}/spare-parts?isFeatured=true&${params.toString()}`,
    );
    if (!res.ok) throw new Error("Failed to fetch featured parts");

    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching featured parts:", error);
    return [];
  }
}

/**
 * Fetch spare parts by appliance type (category-first approach)
 * @param apiUrl - Base API URL
 * @param applianceTypeSlug - Appliance type slug (e.g., "refrigerator")
 * @param filters - Optional filters (brand, model, category, search)
 * @param pagination - Pagination options (page, limit)
 */
export async function fetchSparePartsByApplianceType(
  apiUrl: string,
  applianceTypeSlug: string,
  filters?: {
    brandSlug?: string;
    modelNumber?: string;
    partCategory?: string;
    searchQuery?: string;
    isUniversal?: boolean;
  },
  pagination: { page: number; limit: number } = { page: 1, limit: 24 },
) {
  try {
    const params = new URLSearchParams();
    params.append("applianceType", applianceTypeSlug);

    if (filters?.brandSlug) params.append("brand", filters.brandSlug);
    if (filters?.modelNumber) params.append("model", filters.modelNumber);
    if (filters?.partCategory)
      params.append("partCategory", filters.partCategory);
    if (filters?.searchQuery) params.append("q", filters.searchQuery);
    if (filters?.isUniversal) params.append("isUniversal", "true");

    params.append("page", String(pagination.page));
    params.append("limit", String(pagination.limit));

    const res = await fetch(`${apiUrl}/spare-parts?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch spare parts");

    return await res.json();
  } catch (error) {
    console.error("Error fetching spare parts:", error);
    return {
      data: [],
      metadata: { total: 0, page: 1, limit: 24, totalPages: 0 },
    };
  }
}
