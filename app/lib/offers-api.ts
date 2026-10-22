import { API_URL } from "@/app/config";

export interface ApiOffer {
  _id: string;
  title: string;
  discountText: string;
  imageUrl?: string;
  ctaLabel: string;
  ctaHref: string;
  audience: "ALL" | "SERVICES" | "SHOP";
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  description?: string;
  badge?: string;
  theme?: "RED" | "DARK" | "BLUE" | "GOLD";
}

export async function getShopOffers(signal?: AbortSignal): Promise<ApiOffer[]> {
  const response = await fetch(`${API_URL}/offers`, { signal });
  if (!response.ok) throw new Error("Could not load offers");
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error("Unexpected offers response");

  const now = Date.now();
  return (data as ApiOffer[]).filter((offer) => {
    const startsAt = offer.startsAt ? Date.parse(offer.startsAt) : null;
    const endsAt = offer.endsAt ? Date.parse(offer.endsAt) : null;
    const validNow =
      (startsAt === null || (Number.isFinite(startsAt) && startsAt <= now)) &&
      (endsAt === null || (Number.isFinite(endsAt) && endsAt > now));
    return (
      offer.isActive === true &&
      (offer.audience === "ALL" || offer.audience === "SHOP") &&
      validNow &&
      Boolean(offer.title?.trim()) &&
      Boolean(offer.ctaLabel?.trim()) &&
      isSafeOfferHref(offer.ctaHref)
    );
  });
}

/** Offers API returns live records for all audiences; Home shows service and general offers. */
export async function getHomeOffers(signal?: AbortSignal): Promise<ApiOffer[]> {
  const response = await fetch(`${API_URL}/offers`, { signal });
  if (!response.ok) throw new Error("Could not load offers");

  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error("Unexpected offers response");

  const now = Date.now();
  return (data as ApiOffer[]).filter((offer) => {
    const startsAt = offer.startsAt ? Date.parse(offer.startsAt) : null;
    const endsAt = offer.endsAt ? Date.parse(offer.endsAt) : null;
    const inValidityWindow =
      (startsAt === null || (Number.isFinite(startsAt) && startsAt <= now)) &&
      (endsAt === null || (Number.isFinite(endsAt) && endsAt > now));

    return (
      offer.isActive === true &&
      (offer.audience === "ALL" || offer.audience === "SERVICES") &&
      inValidityWindow &&
      Boolean(offer.title?.trim()) &&
      isSafeOfferHref(offer.ctaHref)
    );
  });
}

function isSafeOfferHref(href?: string): href is string {
  if (!href) return false;
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  try {
    return new URL(href).protocol === "https:";
  } catch {
    return false;
  }
}
