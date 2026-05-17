"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { ACProduct } from "@/app/components/appliances/types";
import { ACDetailMobile } from "@/app/components/appliances/ac-detail/ACDetailMobile";
import { ACDetailDesktop } from "@/app/components/appliances/ac-detail/ACDetailDesktop";
import { ACDetailStickyBar } from "@/app/components/appliances/ac-detail/ACDetailStickyBar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export default function ACDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<ACProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API}/appliances/ac/${slug}`);
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        if (data.status !== "success" || !data.product) throw new Error("Product not found");
        setProduct(data.product);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F1F2F4] md:bg-[#F8F8F9]">
        {/* Mobile skeleton */}
        <div className="md:hidden">
          <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
          <div className="bg-white p-4 space-y-3">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        {/* Desktop skeleton */}
        <div className="hidden md:block py-8 max-w-6xl mx-auto px-4">
          <div className="h-5 w-64 bg-gray-200 rounded animate-pulse mb-8" />
          <div className="grid grid-cols-2 gap-10">
            <div className="bg-gray-200 rounded-2xl h-[440px] animate-pulse" />
            <div className="space-y-5">
              {[80, 48, 64, 48, 140].map((h, i) => (
                <div key={i} className="bg-gray-200 rounded animate-pulse" style={{ height: h }} />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#F8F8F9] flex items-center justify-center px-4">
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-6xl text-[#C8102E] block mb-4">error_outline</span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-500 mb-8 text-sm">{error ?? "The product you're looking for doesn't exist."}</p>
          <Link
            href="/spare-parts/appliances/ac"
            className="inline-flex items-center gap-2 bg-[#C8102E] hover:bg-[#A00826] text-white font-semibold py-3 px-8 rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to AC Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#F1F2F4] md:bg-[#F8F8F9]">
        <ACDetailMobile product={product} />
        <ACDetailDesktop product={product} />
      </main>
      <ACDetailStickyBar product={product} />
    </>
  );
}
