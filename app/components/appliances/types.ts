export type ACDescriptionSectionType =
  | "hero"
  | "image_text"
  | "feature_grid"
  | "banner"
  | "html"
  | "image_full";

export interface ACDescriptionSection {
  type: ACDescriptionSectionType;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  imageAlt?: string;
  html?: string;
  features?: { icon: string; title: string; description: string }[];
  order?: number;
}

export interface ACTechnicalSpec {
  label: string;
  value: string;
}

export interface ACTechnicalSection {
  title: string;
  specs: ACTechnicalSpec[];
}

export interface ACProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  modelNumber: string;
  sku: string;
  series?: string;
  price: number;
  originalPrice?: number;
  nlcPrice?: number;
  capacityTon: number;
  starRating: number;
  acType: string;
  isInverter: boolean;
  roomSizeRecommendation?: string;
  description?: string;
  shortDescription?: string;
  descriptionSections?: ACDescriptionSection[];
  technicalDescription?: { sections: ACTechnicalSection[] };
  images: string[];
  specsPerformance?: Record<string, unknown>;
  specsSmart?: Record<string, unknown>;
  specsPhysical?: Record<string, unknown>;
  highlights?: { icon: string; title: string; description: string }[];
  whatsInBox?: string[];
  inStock: boolean;
  installationIncluded: boolean;
  compressorWarrantyYears?: number;
  productWarrantyYears?: number;
}

/** Resolve description blocks from API sections or legacy HTML. */
export function getDescriptionSections(product: ACProduct): ACDescriptionSection[] {
  if (product.descriptionSections && product.descriptionSections.length > 0) {
    return product.descriptionSections;
  }
  if (product.description) {
    return [{ type: "html", html: product.description, order: 0 }];
  }
  return [];
}

export function getDiscount(product: Pick<ACProduct, "price" | "originalPrice">) {
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const savings = product.originalPrice ? product.originalPrice - product.price : 0;
  return { discountPercent, savings };
}

export function formatSpecValue(v: unknown): string {
  if (Array.isArray(v)) return v.join(" / ");
  if (v === true) return "Yes";
  if (v === false) return "No";
  return String(v ?? "—");
}

export function formatSpecKey(k: string): string {
  return k.replace(/([A-Z])/g, " $1").trim();
}
