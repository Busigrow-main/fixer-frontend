"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ClipboardList,
  Package,
  Refrigerator,
  Search,
  ShoppingBag,
  Store,
  X,
} from "lucide-react";

import { cn } from "@/app/lib/utils";

type PageItem = {
  label: string;
  hint: string;
  href: string;
  icon: LucideIcon;
  keywords?: string[];
};

const PAGES: PageItem[] = [
  {
    label: "Shop home",
    hint: "Browse deals and departments",
    href: "/shop",
    icon: Store,
    keywords: ["home", "deals", "departments"],
  },
  {
    label: "Spare parts",
    hint: "Genuine replacements by model",
    href: "/shop/spare-parts",
    icon: Package,
    keywords: ["parts", "motor", "compressor", "model"],
  },
  {
    label: "Appliances",
    hint: "Inspected machines for Patna",
    href: "/shop/appliances",
    icon: Refrigerator,
    keywords: ["ac", "fridge", "refrigerator", "washing machine", "microwave"],
  },
  {
    label: "Cart",
    hint: "Review items before checkout",
    href: "/cart",
    icon: ShoppingBag,
    keywords: ["checkout", "basket"],
  },
  {
    label: "Orders",
    hint: "Track your purchases",
    href: "/orders",
    icon: ClipboardList,
    keywords: ["track", "history"],
  },
];

type ShopSearchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuery?: (value: string) => void;
};

export default function ShopSearchDialog({
  open,
  onOpenChange,
  onQuery,
}: ShopSearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const go = React.useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(href);
    },
    [onOpenChange, router]
  );

  const trimmed = query.trim();

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-[60] bg-slate-950/50 backdrop-blur-[2px]",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
          )}
        />

        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 z-[60] -translate-x-1/2 outline-none",
            "top-[6%] w-[calc(100%-1.5rem)] max-w-xl",
            "sm:top-1/2 sm:-translate-y-1/2",
            "overflow-hidden rounded-2xl border border-slate-200 bg-white",
            "shadow-[0_24px_60px_-20px_rgba(15,23,42,0.5)]",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            Search the shop
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Search parts and appliances, or jump to a page.
          </DialogPrimitive.Description>

          <Command
            label="Shop search"
            loop
            className="flex max-h-[min(78dvh,560px)] flex-col"
          >
            <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2.5">
              <Search aria-hidden className="size-5 shrink-0 text-slate-500" />

              <Command.Input
                autoFocus
                value={query}
                onValueChange={setQuery}
                placeholder="Search parts or appliances…"
                className={cn(
                  "h-10 min-w-0 flex-1 truncate bg-transparent text-base text-slate-900",
                  "placeholder:text-slate-500 outline-none"
                )}
              />

              <DialogPrimitive.Close
                aria-label="Close search"
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full",
                  "text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900",
                  "focus-visible:ring-2 focus-visible:ring-primary/40 outline-none"
                )}
              >
                <X className="size-5" />
              </DialogPrimitive.Close>
            </div>

            <Command.List
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain p-2",
                "[scrollbar-width:thin]"
              )}
            >
              {trimmed.length > 0 && (
                <Command.Group heading="Search">
                  <Command.Item
                    forceMount
                    value={`search-${trimmed}`}
                    onSelect={() => {
                      if (onQuery) {
                        onOpenChange(false);
                        onQuery(trimmed);
                      } else {
                        go(`/shop/spare-parts?q=${encodeURIComponent(trimmed)}`);
                      }
                    }}
                    className={itemClass}
                  >
                    <span className={iconBoxClass}>
                      <Search className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900">
                        Search for “{trimmed}”
                      </span>
                      <span className="block truncate text-xs text-slate-600">
                        {onQuery ? "Filter this page" : "In spare parts"}
                      </span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-slate-500" />
                  </Command.Item>
                </Command.Group>
              )}

              <Command.Group heading="Go to">
                {PAGES.map((page) => {
                  const Icon = page.icon;
                  return (
                    <Command.Item
                      key={page.href}
                      value={page.label}
                      keywords={page.keywords}
                      onSelect={() => go(page.href)}
                      className={itemClass}
                    >
                      <span className={iconBoxClass}>
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-900">
                          {page.label}
                        </span>
                        <span className="block truncate text-xs text-slate-600">
                          {page.hint}
                        </span>
                      </span>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            </Command.List>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

const itemClass = cn(
  "flex min-h-14 cursor-pointer items-center gap-3 rounded-xl px-3 py-2",
  "outline-none transition-colors",
  "data-[selected=true]:bg-primary/10"
);

const iconBoxClass =
  "flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700";