"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useBooking } from "@/app/context/BookingContext";
import BookingForm from "./BookingForm";

export default function BookingModal() {
  const pathname = usePathname();
  const { isOpen, closeBooking, selectedService } = useBooking();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!pathname) return;

    if (pathname === "/login" || pathname === "/register") {
      closeBooking();
    }
  }, [pathname, closeBooking]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeBooking();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [closeBooking]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setMounted(true);
    } else {
      document.body.style.overflow = "unset";

      const timer = setTimeout(() => {
        setMounted(false);
      }, 300);

      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted && !isOpen) {
    return null;
  }

  const modalClassName = [
    "relative",
    "w-[calc(100%-24px)]",
    "max-w-[560px]",
    "max-h-[calc(100svh-32px)]",
    "bg-white",
    "rounded-[1.5rem]",
    "sm:rounded-[1.75rem]",
    "border",
    "border-black/[0.06]",
    "shadow-[0_24px_80px_rgba(0,0,0,0.22)]",
    "overflow-hidden",
    "transition-all",
    "duration-300",
    "ease-out",
    "flex",
    "flex-col",
    "transform",
    isOpen
      ? "translate-y-0 scale-100 opacity-100"
      : "translate-y-4 scale-[0.98] opacity-0",
  ].join(" ");

  const overlayClassName = [
    "fixed",
    "inset-0",
    "z-[100]",
    "flex",
    "items-center",
    "justify-center",
    "p-3",
    "sm:p-6",
    "transition-all",
    "duration-300",
    isOpen
      ? "opacity-100"
      : "opacity-0 pointer-events-none",
  ].join(" ");

  const backdropClassName = [
    "absolute",
    "inset-0",
    "bg-zinc-950/55",
    "backdrop-blur-[5px]",
    "transition-opacity",
    "duration-300",
    isOpen ? "opacity-100" : "opacity-0",
  ].join(" ");

  return (
    <div className={overlayClassName}>
      {/* Backdrop */}
      <div
        className={backdropClassName}
        onClick={closeBooking}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Book your repair service"
        className={modalClassName}
      >
        {/* Header */}
        <div className="relative shrink-0 border-b border-black/[0.06] bg-white">
          <div className="px-5 sm:px-7 pt-5 sm:pt-6 pb-4 sm:pb-5">
            {/* Top row */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                {/* Priority badge */}
                <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full mb-2.5">
                  <span className="material-symbols-outlined text-[14px] icon-filled">
                    verified
                  </span>

                  <span className="text-[9px] font-black uppercase tracking-[0.12em]">
                    Priority Dispatch
                  </span>
                </div>

                {/* Title */}
                <h2 className="font-headline text-[1.55rem] sm:text-2xl leading-tight text-on-surface tracking-tight">
                  Book your{" "}
                  <span className="italic text-primary">Master</span> Repair
                </h2>

                {/* Subtitle */}
                <p className="text-on-surface-variant text-[11px] sm:text-xs mt-1.5 leading-relaxed max-w-[390px] opacity-80">
                  Professional dispatch to your neighborhood.
                </p>
              </div>

              {/* Close */}
              <button
                type="button"
                onClick={closeBooking}
                aria-label="Close booking form"
                className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border border-black/[0.06] bg-zinc-50 text-on-surface-variant hover:bg-zinc-100 hover:text-on-surface active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Form content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain custom-scrollbar">
          <div className="px-4 sm:px-7 pt-4 sm:pt-5 pb-5 sm:pb-7">
            <BookingForm
              initialServiceSlug={selectedService}
              onSuccess={closeBooking}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #d4d4d4 transparent;
          -webkit-overflow-scrolling: touch;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d4d4d4;
          border-radius: 999px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a3a3a3;
        }

        @media (max-width: 639px) {
          .custom-scrollbar {
            scrollbar-width: none;
          }

          .custom-scrollbar::-webkit-scrollbar {
            display: none;
          }
        }

        @media (max-height: 700px) and (max-width: 639px) {
          .custom-scrollbar {
            scrollbar-width: thin;
          }

          .custom-scrollbar::-webkit-scrollbar {
            display: block;
            width: 4px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #d4d4d4;
            border-radius: 999px;
          }
        }
      `}</style>
    </div>
  );
}