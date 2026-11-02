"use client";

import Image from "next/image";
import type { StaticImageData } from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  PackageSearch,
  RefreshCw,
  Search,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useBooking } from "@/app/context/BookingContext";
import ShopProductCard from "@/app/components/shop/ShopProductCard";
import ShopProductGridSkeleton from "@/app/components/shop/ShopProductGridSkeleton";
import { toShopCardProduct } from "@/app/lib/shop-card";
import type { ApiShopCard, ShopHomeResponse } from "@/app/lib/shop-api";
import {
  SHOP_ALL_PRODUCTS_HREF,
  SHOP_APPLIANCES_HREF,
  SHOP_SPARE_PARTS_HREF,
} from "@/app/lib/shop-routes";
import refrigerator from "../../public/images/shop/products/refrigerator.png";
import washingMachine from "../../public/images/shop/products/washing-machine.png";
import airConditioner from "../../public/images/shop/products/air-conditioner.png";
import microwave from "../../public/images/shop/products/microwave.png";
import appliancePromo from "../../public/images/shop/products/appliance-promo-hd.png";
import technician from "../../public/images/shop/technician-banner-square.png";

const POPULAR_PART_SEARCHES = ["Compressor", "Drain pump", "Door gasket", "Capacitor", "Fan motor", "Control board"];

const APPLIANCES: { slug: string; label: string; image: StaticImageData; countSlugs: string[]; imageClass: string }[] = [
  { slug: "refrigerator", label: "Refrigerators", image: refrigerator, countSlugs: ["refrigerator", "refrigerators"], imageClass: "scale-[1.06]" },
  { slug: "washing-machine", label: "Washing machines", image: washingMachine, countSlugs: ["washing-machine"], imageClass: "scale-[1.04]" },
  { slug: "ac", label: "Air conditioners", image: airConditioner, countSlugs: ["ac"], imageClass: "scale-[1.08]" },
  { slug: "microwave", label: "Microwaves", image: microwave, countSlugs: ["microwave", "microwave-oven"], imageClass: "scale-[1.08]" },
];

const PROMISES = [
  { icon: BadgeCheck, title: "Genuine parts", body: "Matched to your model" },
  { icon: ShieldCheck, title: "1-year warranty", body: "On every inspected appliance" },
  { icon: RefreshCw, title: "7-day replacement", body: "If an appliance arrives faulty" },
  { icon: Wrench, title: "Installation available", body: "Fitted by Fixxer technicians" },
];

const RAIL_GRID = "grid grid-cols-3 items-stretch gap-4 lg:grid-cols-4 lg:gap-5";

function topDeals(products: ApiShopCard[]) {
  return [...products]
    .filter((product) => product.discount > 0)
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 4);
}

function brandsOf(products: ApiShopCard[]) {
  const counts = new Map<string, number>();
  for (const product of products) {
    const brand = product.brand?.trim();
    if (brand) counts.set(brand, (counts.get(brand) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([brand]) => brand);
}

export default function ShopDesktopHome({
  shopData,
  loading,
  error,
  onRetry,
  className = "",
}: {
  shopData: ShopHomeResponse | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  className?: string;
}) {
  const router = useRouter();
  const { openBooking } = useBooking();
  const [partQuery, setPartQuery] = useState("");

  const deals = useMemo(() => (shopData ? topDeals(shopData.products) : []), [shopData]);
  const brands = useMemo(() => (shopData ? brandsOf(shopData.products) : []), [shopData]);
  const appliances = shopData?.appliances.slice(0, 8) ?? [];
  const parts = shopData?.parts.slice(0, 8) ?? [];

  const findParts = (value: string) => {
    const next = value.trim();
    router.push(next ? `${SHOP_SPARE_PARTS_HREF}?q=${encodeURIComponent(next)}` : SHOP_SPARE_PARTS_HREF);
  };

  return (
    <div className={`w-full flex-col gap-10 ${className}`}>
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-[#100d0e] via-[#3a0b14] to-[#7a0e1f] p-10 text-white lg:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-10 -z-10 h-[140%] w-2/3 bg-[radial-gradient(ellipse_at_center,rgba(230,25,55,0.35),transparent_70%)]"
          />
          <p className="text-[13px] font-medium text-white/70">Fixxer Shop · Patna</p>
          <h1 className="mt-3 max-w-[560px] text-[40px] font-semibold leading-[1.08] tracking-tight lg:text-[46px]">
            Find the right part for your appliance
          </h1>
          <p className="mt-3 max-w-[520px] text-base leading-relaxed text-white/75">
            Search by model number, part number or part name. Genuine parts for the appliances Fixxer repairs every day.
          </p>

          <form
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              findParts(partQuery);
            }}
            className="mt-7 flex max-w-[620px] items-center gap-2 rounded-2xl bg-white p-1.5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.5)]"
          >
            <Search className="ml-3 h-5 w-5 shrink-0 text-zinc-400" />
            <input
              type="search"
              value={partQuery}
              onChange={(event) => setPartQuery(event.target.value)}
              placeholder="e.g. RT28T3032S8, drain pump, LG compressor"
              aria-label="Search spare parts by model, part number or name"
              className="h-12 min-w-0 flex-1 bg-transparent text-[15px] text-zinc-900 outline-none placeholder:text-zinc-400 [&::-webkit-search-cancel-button]:hidden"
            />
            <button
              type="submit"
              className="h-12 shrink-0 rounded-xl bg-primary px-6 text-sm font-medium text-white transition hover:brightness-110"
            >
              Find parts
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[13px] text-white/60">Popular:</span>
            {POPULAR_PART_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => findParts(term)}
                className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[13px] text-white/85 transition hover:border-white/30 hover:bg-white/10"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 lg:grid-cols-1">
          <Link
            href={SHOP_APPLIANCES_HREF}
            className="group relative flex min-h-[200px] overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 transition hover:shadow-[0_10px_28px_-12px_rgba(15,23,42,0.2)]"
          >
            <div className="relative z-10 flex max-w-[58%] flex-col">
              <p className="text-[12px] font-medium text-primary">Inspected appliances</p>
              <h2 className="mt-1.5 text-xl font-semibold leading-snug tracking-tight text-zinc-900">
                Fridges, washers, ACs and microwaves
              </h2>
              <p className="mt-1.5 text-[13px] text-zinc-500">1-year warranty · 7-day replacement</p>
              <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-zinc-900 group-hover:text-primary">
                Shop appliances <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
            <Image
              src={appliancePromo}
              alt=""
              sizes="240px"
              className="absolute -right-4 bottom-0 h-[88%] w-auto max-w-[52%] object-contain object-right-bottom"
            />
          </Link>

          <div className="relative flex min-h-[200px] overflow-hidden rounded-3xl bg-[#f1ece9] p-6">
            <div className="relative z-10 flex max-w-[60%] flex-col">
              <p className="text-[12px] font-medium text-primary">Not sure which part?</p>
              <h2 className="mt-1.5 text-xl font-semibold leading-snug tracking-tight text-zinc-900">
                Let a Fixxer technician diagnose it
              </h2>
              <p className="mt-1.5 text-[13px] text-zinc-600">Get it fixed at home.</p>
              <button
                type="button"
                onClick={() => openBooking()}
                className="mt-auto inline-flex h-10 w-fit items-center gap-1.5 rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Book a repair <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <Image
              src={technician}
              alt=""
              sizes="220px"
              className="absolute bottom-0 right-0 h-full w-[44%] object-cover object-center"
            />
          </div>
        </div>
      </section>

      <ul className="grid grid-cols-2 divide-zinc-100 rounded-2xl border border-zinc-200 bg-white lg:grid-cols-4 lg:divide-x">
        {PROMISES.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex items-center gap-3 px-5 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-zinc-900">{title}</span>
              <span className="block truncate text-[13px] text-zinc-500">{body}</span>
            </span>
          </li>
        ))}
      </ul>

      <section aria-labelledby="desktop-shop-by-appliance" className="space-y-5">
        <SectionHeader id="desktop-shop-by-appliance" title="Shop by appliance" subtitle="Buy an inspected appliance or find parts for the one you own." />
        <div className="grid grid-cols-4 gap-5">
          {APPLIANCES.map(({ slug, label, image, countSlugs, imageClass }) => {
            const count = shopData?.applianceCategories.find((item) => countSlugs.includes(item.slug))?.productCount;
            return (
              <article key={slug} className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:shadow-[0_10px_24px_-12px_rgba(15,23,42,0.18)]">
                <Link href={`${SHOP_APPLIANCES_HREF}?type=${slug}`} className="block">
                  <span className="relative block aspect-[4/3] overflow-hidden bg-[#ececec]">
                    <Image src={image} alt={label} fill sizes="300px" className={`object-contain transition-transform duration-300 group-hover:scale-[1.1] ${imageClass}`} />
                  </span>
                  <span className="flex items-baseline justify-between gap-2 px-4 pt-3.5">
                    <span className="text-[15px] font-medium text-zinc-900">{label}</span>
                    {typeof count === "number" && count > 0 && <span className="text-xs text-zinc-500">{count} products</span>}
                  </span>
                </Link>
                <div className="flex items-center gap-4 px-4 pb-4 pt-2 text-[13px] font-medium">
                  <Link href={`${SHOP_APPLIANCES_HREF}?type=${slug}`} className="text-primary hover:underline">Shop appliances</Link>
                  <span aria-hidden="true" className="h-3 w-px bg-zinc-200" />
                  <Link href={`${SHOP_SPARE_PARTS_HREF}?type=${slug}`} className="text-zinc-600 hover:text-zinc-900 hover:underline">Find parts</Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {error ? (
        <div role="status" className="rounded-2xl border border-zinc-200 bg-white px-6 py-10 text-center text-sm text-zinc-600">
          Shop products are temporarily unavailable.{" "}
          <button type="button" onClick={onRetry} className="font-medium text-primary hover:underline">Try again</button>
        </div>
      ) : (
        <>
          <ProductRail
            id="desktop-deals"
            title="Best deals this week"
            subtitle="The biggest savings across appliances and spare parts."
            href={SHOP_ALL_PRODUCTS_HREF}
            linkLabel="View all"
            products={deals}
            loading={loading}
            skeletonCount={4}
          />
          <ProductRail
            id="desktop-appliances"
            title="Inspected appliances"
            subtitle="Checked by Fixxer technicians before dispatch."
            href={SHOP_APPLIANCES_HREF}
            linkLabel="All appliances"
            products={appliances}
            loading={loading}
            skeletonCount={8}
          />
          <ProductRail
            id="desktop-parts"
            title="Popular spare parts"
            subtitle="Genuine replacements for the brands we service."
            href={SHOP_SPARE_PARTS_HREF}
            linkLabel="All spare parts"
            products={parts}
            loading={loading}
            skeletonCount={8}
          />
        </>
      )}

      {brands.length > 0 && (
        <section aria-labelledby="desktop-brands" className="space-y-5">
          <SectionHeader id="desktop-brands" title="Shop by brand" />
          <div className="grid grid-cols-4 gap-3 lg:grid-cols-6">
            {brands.map((brand) => (
              <Link
                key={brand}
                href={`${SHOP_ALL_PRODUCTS_HREF}?q=${encodeURIComponent(brand)}`}
                className="flex h-16 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-3 text-[15px] font-semibold tracking-tight text-zinc-800 transition hover:border-zinc-300 hover:text-primary hover:shadow-sm"
              >
                {brand}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="flex items-center justify-between gap-8 rounded-3xl border border-zinc-200 bg-white px-10 py-8">
        <div className="flex items-center gap-5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary">
            <PackageSearch className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900">Can&apos;t find your part?</h2>
            <p className="mt-1 text-sm text-zinc-500">Share your appliance model number and we&apos;ll source the right part for you.</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/shop/requests"
            className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-primary px-5 text-sm font-medium text-white transition hover:brightness-110"
          >
            Request a part <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => openBooking()}
            className="inline-flex h-11 items-center rounded-xl border border-zinc-200 px-5 text-sm font-medium text-zinc-800 transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            Book a repair
          </button>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  id,
  title,
  subtitle,
  href,
  linkLabel,
}: {
  id: string;
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <h2 id={id} className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
      </div>
      {href && linkLabel && (
        <Link href={href} className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline">
          {linkLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function ProductRail({
  id,
  title,
  subtitle,
  href,
  linkLabel,
  products,
  loading,
  skeletonCount,
}: {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  linkLabel: string;
  products: ApiShopCard[];
  loading: boolean;
  skeletonCount: number;
}) {
  if (!loading && products.length === 0) return null;
  return (
    <section aria-labelledby={id} aria-busy={loading} className="space-y-5">
      <SectionHeader id={id} title={title} subtitle={subtitle} href={href} linkLabel={linkLabel} />
      {loading ? (
        <ShopProductGridSkeleton count={skeletonCount} className={RAIL_GRID} />
      ) : (
        <div className={RAIL_GRID}>
          {products.map((product) => (
            <ShopProductCard key={`${product.productType}-${product.id}`} part={toShopCardProduct(product)} />
          ))}
        </div>
      )}
    </section>
  );
}
