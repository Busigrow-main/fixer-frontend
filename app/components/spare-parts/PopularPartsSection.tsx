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
    <div className="space-y-6">
      {/* Horizontal Scroll or Grid of Parts */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
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
