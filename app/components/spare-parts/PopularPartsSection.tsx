"use client";

import React, { useState, useEffect } from "react";
import { PartCard } from "./PartComponents";
import { Zap, ArrowRight, Sparkles } from "lucide-react";

interface PopularPartsSectionProps {
  apiUrl: string;
  onPartSelect?: (part: any) => void;
  onBrowseAll?: () => void;
}

export const PopularPartsSection: React.FC<PopularPartsSectionProps> = ({
  apiUrl,
  onPartSelect,
  onBrowseAll,
}) => {
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPopularParts();
  }, []);

  const fetchPopularParts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("isFeatured", "true");
      params.append("limit", "6");

      const res = await fetch(`${apiUrl}/spare-parts?${params.toString()}`);
      if (res.ok) {
        const result = await res.json();
        setParts(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching popular parts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Hero Banner Loading */}
        <div className="h-28 bg-gradient-to-r from-zinc-100 to-zinc-200 rounded-3xl animate-pulse" />
        {/* Grid Loading */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-56 bg-zinc-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (parts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/95 to-orange-600 p-6 md:p-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-white" />
              <span className="text-xs font-black text-white/80 uppercase tracking-widest">
                Fast & Reliable
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
              Frequently Ordered Parts
            </h2>
            <p className="text-white/90 font-medium max-w-lg">
              These are the most popular spare parts ordered by technicians.
              Quick delivery & authentic guarantee.
            </p>
          </div>
          <button
            type="button"
            onClick={onBrowseAll}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary font-black text-sm rounded-xl hover:shadow-xl hover:scale-105 transition-all whitespace-nowrap md:mt-0"
          >
            Browse All (5000+)
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Parts Grid - 2 columns mobile, 3 columns desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {parts.slice(0, 6).map((part) => (
          <div
            key={part.sku}
            onClick={() => onPartSelect?.(part)}
            className="cursor-pointer"
          >
            <PartCard part={part} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularPartsSection;
