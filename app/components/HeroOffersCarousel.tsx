"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getHomeOffers, type ApiOffer } from "@/app/lib/offers-api";

const FALLBACK_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDA9mgV-aJUlhsUCFdpsjAh68ldSYuVZG2VUmsj7OENR0BXA1gTDTblJEOs-o4QuxoYqOB3ATEbqXfQnlhhnTZfaLr4GrDJKb_KKZNCgj4MuVslFnjNnpt2vimmj3KSRaUMnWW3aOKkFhPUbZYgwTswXCRlDchT9CFwlo-S87VSmDqAODSSoXuAhh3nRB-oLg8wsMqBtMAbN7re1oHbiaipdcAUnMuDbw2bg8bMhqlgrPfpSIcTXcmvTpPQ3uPQ1jSpFqSg9IrarOA";

const AUTO_MS = 3500;

export default function HeroOffersCarousel({
  className = "",
}: {
  className?: string;
}) {
  const [offers, setOffers] = useState<ApiOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const resumeTimer = useRef<number | null>(null);
  const requestController = useRef<AbortController | null>(null);

  const loadOffers = useCallback(() => {
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;

    getHomeOffers(controller.signal)
      .then(setOffers)
      .catch((error) => {
        if (error?.name !== "AbortError") {
          setLoadError(true);
          console.error(error);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
  }, []);

  const retryOffers = () => {
    setLoading(true);
    setLoadError(false);
    loadOffers();
  };

  useEffect(() => {
    loadOffers();
    return () => requestController.current?.abort();
  }, [loadOffers]);

  useEffect(() => {
    if (paused || offers.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % offers.length);
    }, AUTO_MS);
    return () => window.clearInterval(timer);
  }, [offers.length, paused]);

  useEffect(
    () => () => {
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    },
    [],
  );

  const pauseBriefly = () => {
    setPaused(true);
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => setPaused(false), AUTO_MS);
  };

  const visibleIndex = offers.length > 0 ? activeIndex % offers.length : 0;

  // if (offers.length === 0) {
  //   return (
  //     <div
  //       className={`relative aspect-4/3 overflow-hidden bg-surface-container-low ${className}`}
  //       aria-label={loadError ? "Offers are temporarily unavailable" : "Fixxer service promotion"}
  //       aria-busy={loading}
  //     >
  //       <div
  //         className="absolute inset-0 bg-cover bg-center"
  //         style={{ backgroundImage: `url("${FALLBACK_IMAGE}")` }}
  //       />
  //       <div className="absolute inset-x-4 bottom-4 text-white sm:inset-x-6 sm:bottom-6">
  //         <p role="status" className="text-sm font-semibold drop-shadow">
  //           {loading ? "Loading current offers…" : loadError ? "Offers are temporarily unavailable." : "No current offers."}
  //         </p>
  //         {!loading && (
  //           <button
  //             type="button"
  //             onClick={retryOffers}
  //             className="mt-2 rounded-lg bg-white/90 px-3 py-2 text-xs font-bold text-zinc-900 hover:bg-white"
  //           >
  //             {loadError ? "Try again" : "Refresh offers"}
  //           </button>
  //         )}
  //         {loading && <span className="sr-only">Please wait while current offers load.</span>}
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div
      className={`group relative grid aspect-4/3 overflow-hidden bg-surface-container-low ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={pauseBriefly}
      aria-roledescription="carousel"
      aria-label="Live Fixxer offers"
    >
      {offers.map((offer, index) => (
        <Link
          key={offer._id}
          href={offer.ctaHref}
          tabIndex={visibleIndex === index ? 0 : -1}
          aria-label={offer.title || "View offer"}
          aria-hidden={visibleIndex !== index}
          className={`relative col-start-1 row-start-1 block transition-opacity duration-700 ${
            visibleIndex === index
              ? "visible pointer-events-auto opacity-100"
              : "invisible pointer-events-none opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url("${offer.imageUrl || FALLBACK_IMAGE}")`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <div className="absolute inset-x-4 bottom-10 flex items-end justify-between gap-3 text-left text-white sm:inset-x-6 sm:bottom-11 md:inset-x-8">
            <span className="min-w-0">
              <span className="block truncate font-headline text-lg font-bold sm:text-2xl md:text-3xl">{offer.title}</span>
              {offer.discountText && <span className="mt-1 block truncate text-xs font-semibold sm:text-sm">{offer.discountText}</span>}
            </span>
            <span className="shrink-0 rounded-lg bg-primary px-3 py-2 text-[9px] font-black uppercase tracking-wide text-on-primary shadow-lg sm:px-4 sm:text-[10px]">
              {offer.ctaLabel?.trim() || "Explore offer"}
            </span>
          </div>
        </Link>
      ))}

      {offers.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center md:bottom-4">
          <div className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-2 backdrop-blur-sm">
            {offers.map((offer, index) => (
              <button
                key={offer._id}
                type="button"
                aria-label={`Show offer ${index + 1}`}
                aria-current={visibleIndex === index}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setActiveIndex(index);
                  pauseBriefly();
                }}
                className={`h-1.5 rounded-full transition-all ${
                  visibleIndex === index ? "w-6 bg-white" : "w-1.5 bg-white/45"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
