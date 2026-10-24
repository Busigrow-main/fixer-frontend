export function warrantyInWords(months?: number | null) {
  if (!months || months <= 0) return null;
  if (months % 12 === 0) {
    const years = months / 12;
    return years === 1 ? "1-year warranty" : `${years}-year warranty`;
  }
  return months === 1 ? "1-month warranty" : `${months}-month warranty`;
}

export function applianceProductHref(slug?: string | null, category?: string | null) {
  if (!slug) return "/shop/appliances";
  return `/shop/appliances/${encodeURIComponent(category || "all")}/${encodeURIComponent(slug)}`;
}

export function isShopRedirect(redirect: string) {
  return (
    redirect.startsWith("/shop") ||
    redirect.startsWith("/cart") ||
    redirect.startsWith("/checkout") ||
    redirect.startsWith("/orders")
  );
}

export function matchesApplianceCategory(category: string | undefined, selected: string) {
  if (selected === "all") return true;
  const raw = (category || "").toLowerCase().replaceAll("_", "-");
  const aliases: Record<string, string[]> = {
    fridge: ["refrigerator", "refrigerators", "fridge"],
    washer: ["washing-machine", "washer", "washingmachine"],
    ac: ["ac", "air-conditioner", "airconditioner"],
    microwave: ["microwave", "microwave-oven"],
  };
  return (aliases[selected] || [selected]).includes(raw);
}
