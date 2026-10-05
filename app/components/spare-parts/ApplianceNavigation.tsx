"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  ChevronRight,
  Fan,
  Refrigerator,
  WashingMachine,
} from "lucide-react";

type ApplianceNavigationProps = {
  compact?: boolean;
};

const applianceItems = [
  {
    name: "Air Conditioners",
    shortName: "AC",
    href: "/spare-parts/appliances/ac",
    description: "Split & inverter ACs",
    icon: Fan,
    available: true,
  },
  {
    name: "Refrigerators",
    shortName: "Refrigerators",
    href: "/spare-parts/appliances",
    description: "Coming soon",
    icon: Refrigerator,
    available: false,
  },
  {
    name: "Washing Machines",
    shortName: "Washing Machines",
    href: "/spare-parts/appliances",
    description: "Coming soon",
    icon: WashingMachine,
    available: false,
  },
];

export default function ApplianceNavigation({
  compact = false,
}: ApplianceNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Appliance categories"
      className="w-full"
    >
      <div
        className={
          compact
            ? "flex gap-2 overflow-x-auto pb-1 scrollbar-none"
            : "grid gap-3 sm:grid-cols-3"
        }
      >
        {applianceItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.available &&
            (pathname === item.href ||
              pathname.startsWith(`${item.href}/`));

          if (!item.available) {
            return (
              <div
                key={item.name}
                aria-disabled="true"
                className={
                  compact
                    ? "flex min-w-[150px] shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 opacity-60"
                    : "flex min-h-[88px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 opacity-65"
                }
              >
                <span
                  className={
                    compact
                      ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400"
                      : "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400"
                  }
                >
                  <Icon className="h-4 w-4" />
                </span>

                <span className="min-w-0">
                  <span
                    className={
                      compact
                        ? "block truncate text-[11px] font-black text-slate-600"
                        : "block text-sm font-black text-slate-700"
                    }
                  >
                    {compact ? item.shortName : item.name}
                  </span>

                  <span
                    className={
                      compact
                        ? "mt-0.5 block truncate text-[9px] font-bold text-slate-400"
                        : "mt-1 block text-[10px] font-bold text-slate-400"
                    }
                  >
                    {item.description}
                  </span>
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={
                compact
                  ? `group flex min-w-[150px] shrink-0 items-center gap-2 rounded-xl border px-3 py-2.5 transition-all ${
                      isActive
                        ? "border-primary/20 bg-primary/[0.06] text-primary"
                        : "border-slate-200 bg-white text-slate-700 hover:border-primary/20 hover:bg-primary/[0.03]"
                    }`
                  : `group flex min-h-[88px] items-center justify-between gap-3 rounded-2xl border px-4 py-4 transition-all ${
                      isActive
                        ? "border-primary/20 bg-primary/[0.06] shadow-sm"
                        : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
                    }`
              }
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className={
                    compact
                      ? `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          isActive
                            ? "bg-primary text-white"
                            : "bg-slate-50 text-slate-500 group-hover:bg-primary/[0.07] group-hover:text-primary"
                        }`
                      : `flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          isActive
                            ? "bg-primary text-white"
                            : "bg-slate-50 text-slate-500 group-hover:bg-primary/[0.07] group-hover:text-primary"
                        }`
                  }
                >
                  <Icon className="h-4 w-4" />
                </span>

                <span className="min-w-0">
                  <span
                    className={
                      compact
                        ? `block truncate text-[11px] font-black ${
                            isActive
                              ? "text-primary"
                              : "text-slate-700"
                          }`
                        : `block text-sm font-black ${
                            isActive
                              ? "text-primary"
                              : "text-slate-900"
                          }`
                    }
                  >
                    {compact ? item.shortName : item.name}
                  </span>

                  <span
                    className={
                      compact
                        ? "mt-0.5 block truncate text-[9px] font-bold text-slate-400"
                        : "mt-1 block text-[10px] font-bold text-slate-400"
                    }
                  >
                    {item.description}
                  </span>
                </span>
              </span>

              <ChevronRight
                className={`h-4 w-4 shrink-0 transition-transform ${
                  isActive
                    ? "text-primary"
                    : "text-slate-300 group-hover:translate-x-0.5 group-hover:text-primary"
                }`}
              />
            </Link>
          );
        })}
      </div>

      {!compact && (
        <Link
          href="/spare-parts"
          className="mt-3 flex items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-black text-slate-500 transition-colors hover:bg-slate-50 hover:text-primary"
        >
          Back to spare parts
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </nav>
  );
}