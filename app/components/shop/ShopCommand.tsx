"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, Package, Refrigerator, ShoppingBag, Store } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/app/components/ui/command";

const LINKS = [
  { label: "Shop home", hint: "Browse deals and departments", href: "/shop", icon: Store },
  { label: "Spare parts", hint: "Genuine replacements by model", href: "/shop/spare-parts", icon: Package },
  { label: "Appliances", hint: "Inspected machines for Patna", href: "/shop/appliances", icon: Refrigerator },
  { label: "Cart", hint: "Review items before checkout", href: "/cart", icon: ShoppingBag },
  { label: "Orders", hint: "Track deliveries", href: "/orders", icon: ClipboardList },
];

export default function ShopCommand({
  open,
  onOpenChange,
  onQuery,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuery?: (query: string) => void;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  if (!ready) return null;

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search the shop"
      description="Find a department, product, or page"
      className="rounded-2xl border-zinc-200 sm:max-w-xl"
    >
      <CommandInput
        placeholder="Search parts, appliances, or jump to a page…"
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;
          const value = event.currentTarget.value.trim();
          if (!value) return;
          event.preventDefault();
          onOpenChange(false);
          if (onQuery) onQuery(value);
          else router.push(`/shop/spare-parts?q=${encodeURIComponent(value)}`);
        }}
      />
      <CommandList>
        <CommandEmpty>Nothing matches. Try a model number or a brand.</CommandEmpty>
        <CommandGroup heading="Go to">
          {LINKS.map((item) => (
            <CommandItem key={item.href} value={`${item.label} ${item.hint}`} onSelect={() => go(item.href)}>
              <item.icon />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{item.label}</span>
                <span className="block text-xs text-muted-foreground">{item.hint}</span>
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Tip">
          <CommandItem disabled value="search-tip">
            Press Enter after typing to search spare parts
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
