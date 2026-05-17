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

export function ApplianceCategoryCard({ category }: ApplianceCategoryCardProps) {
  const isActive = category.status === "active";

  const content = (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border transition-all duration-300 ${
        isActive
          ? "cursor-pointer border-outline bg-surface-bright shadow-sm hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl hover:shadow-black/[0.06] active:scale-[0.99]"
          : "border-outline/60 bg-surface-container opacity-70"
      }`}
    >
      {isActive && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-primary-container/40 opacity-0 transition-opacity group-hover:opacity-100" />
      )}

      <div className="relative z-10 flex flex-1 flex-col p-6 md:p-7">
        <div className="mb-5 flex items-start justify-between gap-3">
          <span
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-outline ${
              isActive ? "bg-white shadow-sm" : "bg-surface-container-high"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[2rem] leading-none ${
                isActive ? "text-primary icon-filled" : "text-on-surface-variant"
              }`}
            >
              {category.icon}
            </span>
          </span>
          {isActive ? (
            <span className="rounded-full bg-primary-container px-2.5 py-1 font-label text-[9px] font-black uppercase tracking-widest text-primary">
              Available
            </span>
          ) : (
            <span className="rounded-full border border-outline bg-surface-container px-2.5 py-1 font-label text-[9px] font-black uppercase tracking-widest text-on-surface-variant">
              Soon
            </span>
          )}
        </div>

        <h3
          className={`font-headline text-xl tracking-tight transition-colors md:text-2xl ${
            isActive ? "text-on-surface group-hover:text-primary" : "text-on-surface-variant"
          }`}
        >
          {category.name}
        </h3>

        <p
          className={`mt-2 flex-1 font-body text-sm leading-relaxed ${
            isActive ? "text-on-surface-variant" : "text-on-surface-variant/80"
          }`}
        >
          {category.description}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-outline pt-4">
          {isActive ? (
            <>
              <span className="font-label text-xs font-bold uppercase tracking-wide text-primary">
                {category.productCount}{" "}
                {category.productCount === 1 ? "model" : "models"}
              </span>
              <span className="material-symbols-outlined text-xl text-primary transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </>
          ) : (
            <span className="font-label text-xs font-bold uppercase tracking-wide text-on-surface-variant">
              Coming soon
            </span>
          )}
        </div>
      </div>
    </article>
  );

  if (isActive) {
    return <Link href={category.href}>{content}</Link>;
  }

  return content;
}
