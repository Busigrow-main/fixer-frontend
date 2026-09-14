"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { API_URL } from "@/app/config";

type HeroOffer = {
  _id: string;
  title: string;
  imageUrl?: string;
  ctaHref: string;
};

const FALLBACK_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDA9mgV-aJUlhsUCFdpsjAh68ldSYuVZG2VUmsj7OENR0BXA1gTDTblJEOs-o4QuxoYqOB3ATEbqXfQnlhhnTZfaLr4GrDJKb_KKZNCgj4MuVslFnjNnpt2vimmj3KSRaUMnWW3aOKkFhPUbZYgwTswXCRlDchT9CFwlo-S87VSmDqAODSSoXuAhh3nRB-oLg8wsMqBtMAbN7re1oHbiaipdcAUnMuDbw2bg8bMhqlgrPfpSIcTXcmvTpPQ3uPQ1jSpFqSg9IrarOA";

const AUTO_MS = 4000;

export default function HeroOffersCarousel({
  className = "",
}: {
  className?: string;
}) {
  const [offers, setOffers] = useState<HeroOffer[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const resumeTimer = useRef<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/offers`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => setOffers(Array.isArray(data) ? data : []))
      .catch((error) => {
        if (error?.name !== "AbortError") console.error(error);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (paused || offers.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % offers.length);
    }, AUTO_MS);
    return () => window.clearInterval(timer);
  }, [offers.length, paused]);

  useEffect(() => {
    if (activeIndex >= offers.length && offers.length > 0) setActiveIndex(0);
  }, [activeIndex, offers.length]);

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

  if (offers.length === 0) {
    return (
      <div
        className={`relative aspect-4/3 overflow-hidden bg-surface-container-low ${className}`}
        aria-label="Fixxer technician"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${FALLBACK_IMAGE}")` }}
        />
      </div>
    );
  }

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
          tabIndex={activeIndex === index ? 0 : -1}
          aria-label={offer.title || "View offer"}
          aria-hidden={activeIndex !== index}
          className={`relative col-start-1 row-start-1 block transition-opacity duration-700 ${
            activeIndex === index
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
                aria-current={activeIndex === index}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setActiveIndex(index);
                  pauseBriefly();
                }}
                className={`h-1.5 rounded-full transition-all ${
                  activeIndex === index ? "w-6 bg-white" : "w-1.5 bg-white/45"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
