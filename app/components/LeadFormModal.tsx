"use client";

import React, { useEffect } from "react";
import LeadForm from "./LeadForm";

type LeadFormType = "business" | "technician";

interface LeadFormModalProps {
  type: LeadFormType;
  onClose: () => void;
  onSubmit: (data: Record<string, string>) => Promise<void>;
}

export default function LeadFormModal({
  type,
  onClose,
  onSubmit,
}: LeadFormModalProps) {
  const isBusiness = type === "business";

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleBackdropClick = (
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      onMouseDown={handleBackdropClick}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface rounded-3xl shadow-2xl border border-outline/30">

        <div className="sticky top-0 z-10 bg-surface border-b border-outline/20 px-5 py-5 sm:px-8 sm:py-6 flex items-center justify-between">
          <div>
            <p className="font-label text-[10px] uppercase tracking-widest font-black text-primary mb-1">
              Fixxer
            </p>

            <h2 className="font-headline text-2xl sm:text-3xl font-bold text-on-surface">
              {isBusiness
                ? "Partner With Us"
                : "Join As Technician"}
            </h2>

            <p className="text-sm text-on-surface-variant mt-1">
              {isBusiness
                ? "Tell us about your business."
                : "Tell us about your experience."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 shrink-0 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"
          >
            <span className="material-symbols-outlined">
              close
            </span>
          </button>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <LeadForm
            type={type}
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  );
}