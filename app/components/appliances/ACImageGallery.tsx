"use client";

import { useState } from "react";
import Image from "next/image";

interface ACImageGalleryProps {
  images: string[];
  productName: string;
}

export function ACImageGallery({ images, productName }: ACImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center h-96">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-gray-400 block mb-2">
            image_not_supported
          </span>
          <p className="text-gray-600">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden h-96 flex items-center justify-center group">
        <Image
          src={images[selectedIndex]}
          alt={productName}
          fill
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() =>
                setSelectedIndex(
                  selectedIndex === 0 ? images.length - 1 : selectedIndex - 1,
                )
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all z-10"
              aria-label="Previous image"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>

            <button
              onClick={() =>
                setSelectedIndex(
                  selectedIndex === images.length - 1 ? 0 : selectedIndex + 1,
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all z-10"
              aria-label="Next image"
            >
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 h-20 w-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === selectedIndex
                  ? "border-[#C8102E] shadow-md scale-110"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                className="object-contain p-1"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
