import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Package,
  ShieldCheck,
  Wrench,
} from "lucide-react";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

interface PageProps {
  params: Promise<{
    sku: string;
  }>;
}

interface SparePart {
  _id?: string;
  id?: string;
  sku: string;
  slug?: string;
  name: string;
  description?: string;
  imageUrls?: string[];
  applianceTypeSlug?: string;
  applianceTypeName?: string;
  isUniversal?: boolean;
  isFeatured?: boolean;
  brandSlug?: string;
  brandName?: string;
  brand?: string;
  partCategory?: string;
  partNumber?: string;
  price?: number;
  mrp?: number;
  stock?: number;
  isInStock?: boolean;
  warrantyMonths?: number;
}

async function getPart(
  sku: string,
): Promise<SparePart | null> {
  try {
    const response = await fetch(
      `${API}/spare-parts/${encodeURIComponent(sku)}`,
      {
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

    const raw =
      payload?.part ??
      payload?.product ??
      payload?.data ??
      payload;

    if (!raw) {
      return null;
    }

    return {
      ...raw,
      sku: String(raw.sku ?? sku),
    };
  } catch {
    return null;
  }
}

export default async function SparePartDetailPage({
  params,
}: PageProps) {
  const { sku } = await params;

  const part = await getPart(sku);

  if (!part) {
    notFound();
  }

  const partId =
    part._id ||
    part.id ||
    part.sku;

  const enquiryHref = `/spare-parts/enquiry?part=${encodeURIComponent(
    partId,
  )}`;

  const image =
    part.imageUrls?.[0] ||
    "/images/placeholder-part.png";

  const hasPrice =
    typeof part.price === "number" &&
    part.price > 0;

  const hasMrp =
    typeof part.mrp === "number" &&
    part.mrp > 0 &&
    part.mrp > (part.price || 0);

  const discount =
    hasMrp && hasPrice
      ? Math.round(
          ((part.mrp! - part.price!) /
            part.mrp!) *
            100,
        )
      : 0;

  const inStock =
    part.isInStock !== false &&
    (typeof part.stock !== "number" ||
      part.stock > 0);

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      {/* Breadcrumb */}
      <div className="mx-auto hidden w-full max-w-7xl px-6 pt-5 md:block lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-[10px] font-semibold text-slate-400"
        >
          <Link
            href="/spare-parts"
            className="hover:text-primary"
          >
            Spare Parts
          </Link>

          <ChevronRight className="h-3 w-3" />

          {part.applianceTypeName ? (
            <>
              <span>{part.applianceTypeName}</span>
              <ChevronRight className="h-3 w-3" />
            </>
          ) : null}

          <span className="max-w-[280px] truncate text-slate-600">
            {part.name}
          </span>
        </nav>
      </div>

      {/* Mobile back */}
      <div className="mx-auto w-full max-w-7xl px-3 pt-3 md:hidden">
        <Link
          href="/spare-parts"
          className="inline-flex items-center gap-1.5 text-[10px] font-black text-slate-500"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Spare Parts
        </Link>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-5 px-3 pt-4 md:grid-cols-[minmax(0,1fr)_420px] md:px-6 md:pt-7 lg:grid-cols-[minmax(0,1fr)_460px] lg:px-8 lg:gap-8">
        {/* Product media */}
        <section>
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="relative aspect-square bg-slate-50 sm:aspect-[1.1]">
              <img
                src={image}
                alt={part.name}
                className="h-full w-full object-contain p-8 transition-transform duration-500 hover:scale-[1.025] md:p-14"
              />

              {discount > 0 ? (
                <span className="absolute left-4 top-4 rounded-xl bg-primary px-3 py-2 text-[9px] font-black text-white">
                  {discount}% OFF
                </span>
              ) : null}

              {part.isUniversal ? (
                <span className="absolute right-4 top-4 rounded-xl bg-white px-3 py-2 text-[9px] font-black text-slate-700 shadow-sm">
                  Universal
                </span>
              ) : null}
            </div>
          </div>

          {/* Trust strip */}
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            <TrustItem
              icon={<Package />}
              label="Availability"
              value={
                inStock
                  ? "In stock"
                  : "Check"
              }
            />

            <TrustItem
              icon={<ShieldCheck />}
              label="Warranty"
              value={
                part.warrantyMonths
                  ? `${part.warrantyMonths} months`
                  : "Confirm"
              }
            />

            <TrustItem
              icon={<Wrench />}
              label="Support"
              value="Fixxer help"
            />
          </div>
        </section>

        {/* Product information */}
        <section className="md:sticky md:top-24 md:self-start">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            {/* Identity */}
            <div className="flex flex-wrap items-center gap-2">
              {part.brandName || part.brand ? (
                <span className="rounded-lg bg-primary/[0.07] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-primary">
                  {part.brandName || part.brand}
                </span>
              ) : null}

              {part.isFeatured ? (
                <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-[9px] font-black text-amber-700">
                  Featured
                </span>
              ) : null}
            </div>

            <h1 className="mt-3 text-xl font-black leading-7 tracking-[-0.03em] text-slate-950 md:text-2xl">
              {part.name}
            </h1>

            {part.description ? (
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {part.description}
              </p>
            ) : null}

            {/* Part metadata */}
            <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2 border-y border-slate-100 py-4">
              <InfoRow
                label="SKU"
                value={part.sku}
              />

              {part.partNumber ? (
                <InfoRow
                  label="Part number"
                  value={part.partNumber}
                />
              ) : null}

              {part.applianceTypeName ? (
                <InfoRow
                  label="Appliance"
                  value={part.applianceTypeName}
                />
              ) : null}

              {part.partCategory ? (
                <InfoRow
                  label="Category"
                  value={part.partCategory}
                />
              ) : null}
            </div>

            {/* Compatibility */}
            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                  <CheckCircle2 className="h-4 w-4" />
                </span>

                <div>
                  <p className="text-[10px] font-black text-slate-800">
                    {part.isUniversal
                      ? "Universal part"
                      : "Compatibility should be confirmed"}
                  </p>

                  <p className="mt-1 text-[9px] leading-4 text-slate-500">
                    {part.isUniversal
                      ? "This part is marked as universal. Fixxer can still confirm fitment before processing your request."
                      : "Share your appliance model or part details with Fixxer so compatibility can be verified before your request is processed."}
                  </p>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="mt-5">
              {hasPrice ? (
                <div className="flex flex-wrap items-end gap-2.5">
                  <span className="text-3xl font-black tracking-tight text-slate-950">
                    ₹
                    {part.price!.toLocaleString(
                      "en-IN",
                    )}
                  </span>

                  {hasMrp ? (
                    <span className="mb-1 text-xs font-semibold text-slate-400 line-through">
                      ₹
                      {part.mrp!.toLocaleString(
                        "en-IN",
                      )}
                    </span>
                  ) : null}

                  {discount > 0 ? (
                    <span className="mb-1 rounded-md bg-primary/[0.07] px-2 py-1 text-[9px] font-black text-primary">
                      Save {discount}%
                    </span>
                  ) : null}
                </div>
              ) : (
                <p className="text-lg font-black text-slate-800">
                  Price on request
                </p>
              )}

              <p className="mt-1.5 text-[9px] leading-4 text-slate-400">
                Final availability and pricing are confirmed
                by Fixxer before the request is processed.
              </p>
            </div>

            {/* Availability */}
            <div className="mt-4 flex items-center gap-2">
              {inStock ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />

                  <span className="text-[10px] font-black text-emerald-700">
                    Currently available
                  </span>
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 text-slate-400" />

                  <span className="text-[10px] font-black text-slate-600">
                    Availability will be confirmed
                  </span>
                </>
              )}
            </div>

            {/* CTA */}
            <Link
              href={enquiryHref}
              className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-xs font-black text-white shadow-lg shadow-primary/15 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 active:scale-[0.99]"
            >
              {inStock
                ? "Request this part"
                : "Request availability"}

              <ArrowRight className="h-4 w-4" />
            </Link>

            <p className="mt-2 text-center text-[9px] font-semibold text-slate-400">
              No payment required · Compatibility can be checked
            </p>
          </div>

          {/* Help card */}
          <div className="mt-3 rounded-2xl bg-slate-950 p-5 text-white">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <Wrench className="h-4 w-4" />
              </div>

              <div>
                <h2 className="text-xs font-black">
                  Not sure this is the right part?
                </h2>

                <p className="mt-1 text-[9px] leading-4 text-white/55">
                  Send your appliance model or explain what
                  you need. Fixxer can help confirm the correct
                  part before you proceed.
                </p>

                <Link
                  href="/spare-parts/help"
                  className="mt-3 inline-flex items-center gap-1.5 text-[9px] font-black text-white transition-colors hover:text-primary"
                >
                  Get help identifying a part
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function TrustItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-primary">
        {icon}
      </span>

      <p className="mt-2 text-[8px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-0.5 truncate text-[9px] font-black text-slate-700">
        {value}
      </p>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[8px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-0.5 truncate text-[9px] font-black text-slate-700">
        {value}
      </p>
    </div>
  );
}