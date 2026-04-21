import React from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { getApplianceIcon } from "@/app/components/spare-parts/IconMap";
import { formatPrice, cn } from "@/app/lib/utils";
import {
  ChevronLeft,
  ShoppingCart,
  ShieldCheck,
  Hammer,
  Info,
  CheckCircle2,
} from "lucide-react";

export default async function PartDetailPage({
  params,
}: {
  params: Promise<{ sku: string }>;
}) {
  const { sku } = await params;
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

  let part: any = null;

  try {
    const res = await fetch(`${apiUrl}/spare-parts/${sku}`, {
      cache: "no-store",
    });
    if (res.ok) {
      part = await res.json();
    }
  } catch (err) {
    console.error(err);
  }

  if (!part) {
    return (
      <>
        <Navbar />
        <div className="pt-4 md:pt-24 pb-20 text-center">
          <h1 className="text-2xl font-black">Part not found</h1>
          <Link
            href="/spare-parts"
            className="text-primary font-bold mt-4 inline-block"
          >
            Back to Catalog
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const discount = part.mrp ? Math.round((1 - part.price / part.mrp) * 100) : 0;

  return (
    <div className="flex flex-col min-h-screen bg-white pb-24 md:pb-0">
      <Navbar />

      <main className="flex-1 pt-4 md:pt-20 container mx-auto px-4 max-w-6xl">
        <Link
          href="/spare-parts"
          className="inline-flex items-center gap-2 text-xs font-black uppercase text-zinc-400 hover:text-primary transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Catalog
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {/* Left: Image Carousel */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-zinc-50 border border-zinc-100">
              <Image
                src={
                  part.imageUrls?.[0] ||
                  "https://images.unsplash.com/photo-1581092160562-40aa08e78837"
                }
                alt={part.name}
                fill
                className="object-cover"
              />
              {part.isUniversal && (
                <div className="absolute top-4 left-4 bg-teal-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg">
                  ✦ Universal Compatibility
                </div>
              )}
            </div>
            {/* Thumbnail preview if multiple images */}
            {part.imageUrls?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {part.imageUrls.map((url: string, i: number) => (
                  <div
                    key={i}
                    className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-200 flex-shrink-0 cursor-pointer hover:border-primary transition-colors"
                  >
                    <Image
                      src={url}
                      alt={`${part.name}-${i}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span
                className={cn(
                  "text-[10px] uppercase font-black px-3 py-1 rounded-full",
                  part.partType?.type === "OEM"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-teal-100 text-teal-700",
                )}
              >
                {part.partType?.type || "Part"}
              </span>
              <span className="flex items-center gap-1 text-[10px] uppercase font-black px-3 py-1 rounded-full bg-zinc-100 text-zinc-600">
                {getApplianceIcon(
                  part.applianceTypeSlug === "refrigerator"
                    ? "Refrigerator"
                    : "WashingMachine",
                  "w-3 h-3",
                )}
                {part.applianceTypeSlug}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-zinc-900 leading-tight mb-2">
              {part.name}
            </h1>
            <p className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-6">
              OEM PART #{part.partNumber || part.sku}
            </p>

            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-4xl font-black text-zinc-900">
                {formatPrice(part.price)}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-xl text-zinc-400 line-through">
                    {formatPrice(part.mrp)}
                  </span>
                  <span className="text-xl font-black text-teal-600">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                <div className="flex items-center gap-2 text-zinc-400 mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Warranty
                  </span>
                </div>
                <p className="text-sm font-black text-zinc-900">
                  {part.warrantyMonths || 0} Months
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                <div className="flex items-center gap-2 text-zinc-400 mb-1">
                  <Hammer className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Installation
                  </span>
                </div>
                <p className="text-sm font-black text-zinc-900">
                  {part.installationDifficulty?.type || "Standard"}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="text-[11px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-3">
                  Compatible Models
                </h3>
                <div className="flex flex-col gap-2">
                  {part.isUniversal ? (
                    <div className="flex items-center gap-2 p-3 bg-teal-50 text-teal-700 rounded-xl">
                      <CheckCircle2 className="w-4 h-4" />
                      <p className="text-xs font-bold leading-tight">
                        Universal fit for most {part.applianceTypeSlug} brands.
                      </p>
                    </div>
                  ) : (
                    part.compatibleModels?.map((m: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100"
                      >
                        <span className="text-xs font-black text-zinc-800">
                          {m.displayName}
                        </span>
                        <span className="text-[10px] font-black text-zinc-400 uppercase">
                          {m.modelNumber}
                        </span>
                      </div>
                    ))
                  )}
                  {!part.isUniversal &&
                    (!part.compatibleModels ||
                      part.compatibleModels.length === 0) && (
                      <div className="flex items-center gap-2 p-3 bg-zinc-50 text-zinc-500 rounded-xl italic">
                        <Info className="w-4 h-4" />
                        <p className="text-xs">
                          Compatible with all {part.brandSlug}{" "}
                          {part.applianceTypeSlug}s.
                        </p>
                      </div>
                    )}
                </div>
              </section>

              <section>
                <h3 className="text-[11px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-3">
                  Description
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                  {part.description}
                </p>
              </section>
            </div>

            {/* Desktop Add to Cart */}
            <div className="hidden md:flex mt-12 pt-8 border-t border-zinc-100">
              <button className="flex-1 h-14 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-[0.99] transition-all flex items-center justify-center gap-3">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart — {formatPrice(part.price)}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-zinc-100 pb-safe z-50">
        <button className="w-full h-14 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3">
          <ShoppingCart className="w-5 h-5" />
          Add — {formatPrice(part.price)}
        </button>
      </div>

      <Footer />
    </div>
  );
}
