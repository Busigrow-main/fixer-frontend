"use client";

import { useEffect, useState } from "react";

type Props = { images: string[]; alt: string };

export default function ImageGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [zoom]);

  if (images.length === 0) {
    return <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-zinc-100 text-sm text-zinc-500 lg:aspect-square">No product images available</div>;
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:gap-4">
      {/* main image */}
      <div className="relative min-w-0 flex-1 overflow-hidden rounded-2xl bg-[#f6f6f6]">
        <button
          type="button"
          aria-label="Zoom image"
          onClick={() => setZoom(true)}
          className="block aspect-[4/3] w-full lg:aspect-square"
        >
          <img src={images[active]} alt={alt} className="h-full w-full object-contain p-4 sm:p-7 lg:p-10" />
        </button>
        <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-zinc-900/70 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur">
          <span className="material-symbols-outlined text-[14px]">zoom_in</span>
          Tap to zoom
        </span>
      </div>

      {/* thumbnails: row on phones, column on desktop */}
      <div role="tablist" aria-label="Product images" className="flex gap-2.5 lg:flex-col">
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`Image ${i + 1}`}
            onClick={() => setActive(i)}
            className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 bg-[#f6f6f6] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 lg:h-20 lg:w-20 ${
              i === active ? "border-primary" : "border-zinc-200 hover:border-zinc-300"
            }`}
          >
            <img src={src} alt="" className="h-full w-full object-contain p-1" />
          </button>
        ))}
      </div>

      {/* zoom lightbox */}
      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed product image"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4"
          onMouseDown={(e) => e.target === e.currentTarget && setZoom(false)}
        >
          <button
            type="button"
            aria-label="Close zoom"
            onClick={() => setZoom(false)}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
          <img src={images[active]} alt={alt} className="max-h-[90dvh] max-w-full rounded-xl object-contain" />
        </div>
      )}
    </div>
  );
}
