"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
} from "lucide-react";

interface ACMobileImageGalleryProps {
  images?: string[];
  productName?: string;
}

export default function ACMobileImageGallery({
  images = [],
  productName = "Air Conditioner",
}: ACMobileImageGalleryProps) {
  const validImages = useMemo(
    () =>
      images.filter(
        (image): image is string =>
          typeof image === "string" &&
          image.trim().length > 0,
      ),
    [images],
  );

  const [activeIndex, setActiveIndex] =
    useState(0);
  const [viewerOpen, setViewerOpen] =
    useState(false);

  const currentImage =
    validImages[activeIndex] || null;

  const previous = () => {
    if (validImages.length < 2) return;

    setActiveIndex((index) =>
      index === 0
        ? validImages.length - 1
        : index - 1,
    );
  };

  const next = () => {
    if (validImages.length < 2) return;

    setActiveIndex((index) =>
      index === validImages.length - 1
        ? 0
        : index + 1,
    );
  };

  if (!currentImage) {
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
            ❄
          </span>

          <p className="mt-2 text-xs font-bold text-zinc-400">
            Image unavailable
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="w-full">
        {/* Main mobile image */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
          <div className="relative aspect-[4/3]">
            <img
              src={currentImage}
              alt={`${productName} ${
                activeIndex + 1
              }`}
              className="absolute inset-0 h-full w-full object-contain p-5"
              draggable={false}
            />

            {/* Counter */}
            {validImages.length > 1 && (
              <div className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1.5 text-[9px] font-black text-white backdrop-blur">
                {activeIndex + 1}/
                {validImages.length}
              </div>
            )}

            {/* Fullscreen */}
            <button
              type="button"
              onClick={() =>
                setViewerOpen(true)
              }
              aria-label="Open product image"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-sm backdrop-blur active:scale-95"
            >
              <Maximize2 className="h-4 w-4" />
            </button>

            {/* Previous */}
            {validImages.length > 1 && (
              <button
                type="button"
                onClick={previous}
                aria-label="Previous image"
                className="absolute left-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-md backdrop-blur active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}

            {/* Next */}
            {validImages.length > 1 && (
              <button
                type="button"
                onClick={next}
                aria-label="Next image"
                className="absolute right-2.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-md backdrop-blur active:scale-95"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile thumbnails */}
        {validImages.length > 1 && (
          <div className="mt-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max gap-2">
              {validImages.map(
                (image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() =>
                      setActiveIndex(index)
                    }
                    aria-label={`Image ${
                      index + 1
                    }`}
                    aria-current={
                      activeIndex === index
                        ? "true"
                        : undefined
                    }
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition-colors ${
                      activeIndex === index
                        ? "border-primary"
                        : "border-zinc-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full object-contain p-1"
                      draggable={false}
                    />
                  </button>
                ),
              )}
            </div>
          </div>
        )}

        {/* Swipe hint */}
        {validImages.length > 1 && (
          <p className="mt-2 text-center text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-400">
            Swipe or tap thumbnails to view
          </p>
        )}
      </section>

      {/* Fullscreen mobile viewer */}
      {viewerOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3"
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} image viewer`}
          onClick={() =>
            setViewerOpen(false)
          }
        >
          <button
            type="button"
            onClick={() =>
              setViewerOpen(false)
            }
            aria-label="Close image viewer"
            className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="relative flex h-full w-full items-center justify-center"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <img
              src={currentImage}
              alt={`${productName} ${
                activeIndex + 1
              }`}
              className="max-h-[82vh] max-w-full object-contain"
              draggable={false}
            />

            {validImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={previous}
                  aria-label="Previous image"
                  className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={next}
                  aria-label="Next image"
                  className="absolute right-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1.5 text-[10px] font-black text-white backdrop-blur">
                  {activeIndex + 1} /{" "}
                  {validImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}