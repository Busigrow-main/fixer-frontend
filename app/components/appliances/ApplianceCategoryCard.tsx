"use client";

import Link from "next/link";

interface ApplianceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  status: "active" | "coming-soon";
  productCount: number;
  href: string;
}

interface ApplianceCategoryCardProps {
  category: ApplianceCategory;
}

export function ApplianceCategoryCard({
  category,
}: ApplianceCategoryCardProps) {
  const isActive = category.status === "active";

  const content = (
    <div
      className={`group h-full rounded-lg border-2 transition-all duration-300 overflow-hidden flex flex-col ${
        isActive
          ? "border-gray-200 hover:border-[#C8102E] hover:shadow-xl hover:scale-105 bg-white cursor-pointer"
          : "border-gray-200 bg-gray-100 opacity-60"
      }`}
    >
      <div className="p-6 flex flex-col h-full">
        {/* Icon */}
        <div className="mb-4 inline-flex">
          <span
            className={`material-symbols-outlined text-5xl transition-colors duration-300 ${
              isActive
                ? "text-[#C8102E] group-hover:text-[#D48F0E]"
                : "text-gray-400"
            }`}
          >
            {category.icon}
          </span>
        </div>

        {/* Title */}
        <h3
          className={`text-2xl font-bold mb-2 transition-colors ${
            isActive ? "text-gray-900" : "text-gray-500"
          }`}
        >
          {category.name}
        </h3>

        {/* Description */}
        <p
          className={`text-sm mb-4 line-clamp-2 flex-grow ${
            isActive ? "text-gray-600" : "text-gray-400"
          }`}
        >
          {category.description}
        </p>

        {/* Footer Section */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-auto">
          {isActive ? (
            <>
              <span className="text-sm font-semibold text-[#C8102E]">
                {category.productCount}{" "}
                {category.productCount === 1 ? "product" : "products"}
              </span>
              <span className="material-symbols-outlined text-[#D48F0E] group-hover:translate-x-1 transition-transform duration-300">
                arrow_forward
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-gray-400">
              Coming Soon
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (isActive) {
    return <Link href={category.href}>{content}</Link>;
  }

  return content;
}
