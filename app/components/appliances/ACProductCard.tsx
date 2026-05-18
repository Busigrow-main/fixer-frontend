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
  shortDescription?: string;
  images: string[];
  inStock: boolean;
  installationIncluded: boolean;
  warrantyYears: number;
}

interface ACProductCardProps {
  product: ACProduct;
}

export function ACProductCard({ product }: ACProductCardProps) {
  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  return (
    <Link href={`/spare-parts/appliances/ac/${product.slug}`}>
      <div className="group h-full rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer flex flex-col">
        {/* Image Section */}
        <div className="relative h-48 bg-gray-100 overflow-hidden flex-shrink-0">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-contain p-4 group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-200">
              <span className="material-symbols-outlined text-gray-400 text-4xl">
                image_not_supported
              </span>
            </div>
          )}

          {/* Status Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {product.inStock && (
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
                In Stock
              </span>
            )}
            {!product.inStock && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
                Out of Stock
              </span>
            )}
          </div>

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute bottom-3 right-3 bg-[#C8102E] text-white text-xs font-bold px-2 py-1 rounded">
              {discountPercent}% OFF
            </div>
          )}

          {/* Brand Badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-black bg-opacity-50 text-white text-xs font-semibold px-2 py-1 rounded">
              {product.brand}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Model Number */}
          <div className="text-xs text-gray-500 font-medium mb-2">
            {product.modelNumber}
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-sm text-gray-900 line-clamp-2 mb-2">
            {product.name}
          </h3>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-xs text-gray-600 line-clamp-1 mb-3">
              {product.shortDescription}
            </p>
          )}

          {/* Specs Chips */}
          <div className="flex flex-wrap gap-1 mb-3">
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">
              {product.capacityTon}T
            </span>
            <span className="inline-flex items-center gap-0.5 text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded font-medium">
              <span className="material-symbols-outlined text-xs icon-filled">star</span>
              {product.starRating}
            </span>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium capitalize">
              {product.acType}
            </span>
            {product.isInverter && (
              <span className="text-xs bg-primary-container text-on-primary-container px-2 py-1 rounded font-medium">
                Inverter
              </span>
            )}
          </div>

          {/* Trust Badges */}
          <div className="flex gap-2 mb-3 pb-3 border-b border-gray-200 flex-wrap">
            {product.installationIncluded && (
              <div className="flex items-center gap-1 text-xs text-[#C8102E] font-medium">
                <span className="material-symbols-outlined text-sm">
                  verified
                </span>
                Install
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-[#D48F0E] font-medium">
              <span className="material-symbols-outlined text-sm">shield</span>
              {product.warrantyYears}Y
            </div>
          </div>

          {/* Price Section */}
          <div className="mb-4 flex-grow">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-gray-900">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-gray-500 line-through">
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <button className="w-full bg-[#C8102E] hover:bg-[#A00826] text-white font-semibold py-2 rounded transition-colors duration-200 flex items-center justify-center gap-2">
            View Details
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </Link>
  );
}
