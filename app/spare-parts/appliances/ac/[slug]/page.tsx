import { notFound } from "next/navigation";

import { ACDetailDesktop } from "@/app/components/appliances/ac-detail/ACDetailDesktop";
import { ACDetailMobile } from "@/app/components/appliances/ac-detail/ACDetailMobile";
import ACDetailStickyBar from "@/app/components/appliances/ac-detail/ACDetailStickyBar";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000/api";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export interface ACProduct {
  id: string;
  _id?: string;
  slug: string;
  name: string;
  brand: string;
  modelNumber: string;
  price: number;
  originalPrice?: number;
  capacityTon: number;
  starRating: number;
  acType: string;
  isInverter: boolean;
  shortDescription?: string;
  description?: string;
  images: string[];
  inStock: boolean;
  installationIncluded: boolean;
  warrantyYears: number;
  specifications?: Record<string, string | number>;
}

function normalizeProduct(raw: any): ACProduct {
  const images =
    raw?.images ??
    raw?.imageUrls ??
    raw?.image_urls ??
    [];

  const normalizedImages = Array.isArray(images)
    ? images.filter(
        (image: unknown): image is string =>
          typeof image === "string" && image.length > 0,
      )
    : [];

  return {
    id: String(raw?.id ?? raw?._id ?? ""),
    _id: raw?._id,
    slug: String(raw?.slug ?? ""),
    name: String(raw?.name ?? "Air Conditioner"),
    brand: String(raw?.brand ?? ""),
    modelNumber: String(
      raw?.modelNumber ??
        raw?.model ??
        raw?.modelNo ??
        "",
    ),
    price: Number(raw?.price ?? 0),
    originalPrice:
      raw?.originalPrice != null
        ? Number(raw.originalPrice)
        : raw?.mrp != null
          ? Number(raw.mrp)
          : undefined,
    capacityTon: Number(
      raw?.capacityTon ??
        raw?.capacity ??
        0,
    ),
    starRating: Number(
      raw?.starRating ??
        raw?.stars ??
        raw?.star ??
        0,
    ),
    acType: String(
      raw?.acType ??
        raw?.type ??
        "Split AC",
    ),
    isInverter: Boolean(
      raw?.isInverter ??
        raw?.inverter ??
        false,
    ),
    shortDescription:
      raw?.shortDescription ??
      raw?.short_description ??
      undefined,
    description:
      raw?.description ??
      undefined,
    images: normalizedImages,
    inStock: Boolean(
      raw?.inStock ??
        raw?.isInStock ??
        false,
    ),
    installationIncluded: Boolean(
      raw?.installationIncluded ??
        raw?.installation_included ??
        false,
    ),
    warrantyYears: Number(
      raw?.warrantyYears ??
        raw?.warranty ??
        0,
    ),
    specifications:
      raw?.specifications ??
      raw?.specs ??
      undefined,
  };
}

async function getProduct(
  slug: string,
): Promise<ACProduct | null> {
  try {
    const response = await fetch(
      `${API_BASE}/appliances/ac/${encodeURIComponent(
        slug,
      )}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();

    const rawProduct =
      payload?.product ??
      payload?.data ??
      payload;

    if (!rawProduct) {
      return null;
    }

    return normalizeProduct(rawProduct);
  } catch {
    return null;
  }
}

export default async function ACDetailPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      {/* Breadcrumb */}
      <div className="mx-auto hidden w-full max-w-7xl px-6 pt-5 md:block lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-[10px] font-semibold text-slate-400"
        >
          <a
            href="/spare-parts"
            className="transition-colors hover:text-primary"
          >
            Spare Parts
          </a>

          <span>/</span>

          <a
            href="/spare-parts/appliances"
            className="transition-colors hover:text-primary"
          >
            Appliances
          </a>

          <span>/</span>

          <a
            href="/spare-parts/appliances/ac"
            className="transition-colors hover:text-primary"
          >
            Air Conditioners
          </a>

          <span>/</span>

          <span className="max-w-[260px] truncate text-slate-600">
            {product.name}
          </span>
        </nav>
      </div>

      <ACDetailDesktop product={product} />

      <div className="md:hidden">
        <ACDetailMobile product={product} />

        {/* Space for the fixed mobile enquiry bar */}
        <div className="h-24" />

        <ACDetailStickyBar product={product} />
      </div>
    </main>
  );
}