"use client";

import Image from "next/image";
import Link from "next/link";

interface ACProduct {
  id: string;
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
  images: string[];
  inStock: boolean;
  installationIncluded: boolean;
}

interface ACProductCardMobileProps {
  product: ACProduct;
}

export function ACProductCardMobile({ product }: ACProductCardMobileProps) {
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link href={`/spare-parts/appliances/ac/${product.slug}`} className="block h-full">
      <article className="h-full bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col active:scale-[0.98] transition-transform">
        {/* Image — compact */}
        <div className="relative aspect-square bg-[#F5F5F7] p-2">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-contain p-2"
              sizes="50vw"
            />
          ) : (
            <span className="material-symbols-outlined text-4xl text-gray-300 absolute inset-0 m-auto w-fit h-fit">
              ac_unit
            </span>
          )}
          {discountPercent > 0 && (
            <span className="absolute top-1.5 left-1.5 bg-[#388E3C] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              {discountPercent}% off
            </span>
          )}
          <span className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
            {product.brand}
          </span>
        </div>

        {/* Content */}
        <div className="p-2.5 flex flex-col flex-1">
          <div className="flex items-center gap-1 mb-1">
            <span className="inline-flex items-center gap-0.5 bg-emerald-700 text-white text-[10px] font-bold px-1 py-px rounded">
              {product.starRating}
              <span className="material-symbols-outlined text-[10px] icon-filled">star</span>
            </span>
            <span className="text-[10px] text-gray-500 font-medium">{product.capacityTon}T · {product.acType}</span>
          </div>

          <h3 className="text-[11px] font-medium text-gray-800 line-clamp-2 leading-snug flex-1 min-h-[2.5rem]">
            {product.name}
          </h3>

          <div className="mt-2">
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-base font-bold text-gray-900">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.originalPrice && (
                <span className="text-[10px] text-gray-400 line-through">
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            {product.installationIncluded && (
              <p className="text-[9px] text-[#C8102E] font-semibold mt-0.5 flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[11px]">handyman</span>
                Install included
              </p>
            )}
          </div>

          {!product.inStock && (
            <span className="mt-1 text-[9px] font-bold text-red-600">Out of stock</span>
          )}
        </div>
      </article>
    </Link>
  );
}
