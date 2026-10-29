"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = { images: string[]; alt: string };

export default function ImageGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback((index: number) => {
    const next = (index + images.length) % images.length;
    setActive(next);
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollTo({ left: next * scroller.clientWidth, behavior: "smooth" });
  }, [images.length]);

  const onScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller || scroller.clientWidth === 0) return;
    const index = Math.round(scroller.scrollLeft / scroller.clientWidth);
    setActive(Math.min(images.length - 1, Math.max(0, index)));
  };

  useEffect(() => {
    if (!zoom) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoom(false);
      if (event.key === "ArrowRight") goTo(active + 1);
      if (event.key === "ArrowLeft") goTo(active - 1);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [zoom, active, goTo]);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center bg-[#f5f5f6] text-[13px] text-zinc-400 md:rounded-xl lg:aspect-square">
        No product image
      </div>
    );
  }

  const many = images.length > 1;

  return (
    <div className={`flex flex-col ${many ? "gap-3 lg:flex-row-reverse lg:items-start lg:gap-3" : ""}`}>
      <div className="relative min-w-0 flex-1 overflow-hidden bg-[#f5f5f6] md:rounded-xl">
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        >
          {images.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              aria-label={many ? `View larger image ${index + 1} of ${images.length}` : "View larger image"}
              onClick={() => setZoom(true)}
              className="aspect-[4/3] w-full shrink-0 snap-center lg:aspect-square"
            >
              <img src={src} alt={index === 0 ? alt : ""} className="h-full w-full object-contain p-2 sm:p-4" />
            </button>
          ))}
        </div>

        {many && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5 lg:hidden">
            {images.map((src, index) => (
              <button
                key={`dot-${src}-${index}`}
                type="button"
                aria-label={`Go to image ${index + 1}`}
                onClick={(event) => {
                  event.stopPropagation();
                  goTo(index);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  index === active ? "w-4 bg-zinc-900" : "w-1.5 bg-zinc-400/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {many && (
        <div
          role="tablist"
          aria-label="Product images"
          className="no-scrollbar hidden gap-2 overflow-x-auto px-4 lg:flex lg:flex-col lg:overflow-visible lg:px-0"
        >
          {images.map((src, index) => {
            const selected = index === active;
            return (
              <button
                key={`thumb-${src}-${index}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={`Image ${index + 1}`}
                onClick={() => goTo(index)}
                className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#f5f5f6] ring-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
                  selected ? "ring-zinc-900" : "ring-zinc-200/80 hover:ring-zinc-300"
                }`}
              >
                <img src={src} alt="" className="h-full w-full object-contain p-1" />
              </button>
            );
          })}
        </div>
      )}

      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed product image"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-5"
          onMouseDown={(event) => event.target === event.currentTarget && setZoom(false)}
        >
          <button
            type="button"
            aria-label="Close zoom"
            onClick={() => setZoom(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
          {many && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={() => goTo(active - 1)}
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={() => goTo(active + 1)}
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </>
          )}
          <img src={images[active]} alt={alt} className="max-h-[90dvh] max-w-full object-contain" />
        </div>
      )}
    </div>
  );
}
