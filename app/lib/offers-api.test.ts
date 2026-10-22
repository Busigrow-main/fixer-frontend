import { afterEach, describe, expect, it, vi } from "vitest";
import { getHomeOffers, getShopOffers } from "./offers-api";

describe("getHomeOffers", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("keeps live Home audiences and omits shop-only or invalid records", async () => {
    const now = Date.now();
    const records = [
      { _id: "all", title: "General", discountText: "10% OFF", ctaLabel: "View", ctaHref: "/services", audience: "ALL", isActive: true, startsAt: null, endsAt: null },
      { _id: "services", title: "Repair", discountText: "200 OFF", ctaLabel: "Book", ctaHref: "/services/ac", audience: "SERVICES", isActive: true, startsAt: new Date(now - 60_000).toISOString(), endsAt: new Date(now + 60_000).toISOString() },
      { _id: "shop", title: "Shop", discountText: "5% OFF", ctaLabel: "Shop", ctaHref: "/shop", audience: "SHOP", isActive: true, startsAt: null, endsAt: null },
      { _id: "inactive", title: "Inactive", discountText: "5% OFF", ctaLabel: "View", ctaHref: "/services", audience: "ALL", isActive: false, startsAt: null, endsAt: null },
      { _id: "expired", title: "Expired", discountText: "5% OFF", ctaLabel: "View", ctaHref: "/services", audience: "ALL", isActive: true, startsAt: null, endsAt: new Date(now - 60_000).toISOString() },
      { _id: "bad-link", title: "Unsafe", discountText: "5% OFF", ctaLabel: "View", ctaHref: "javascript:alert(1)", audience: "ALL", isActive: true, startsAt: null, endsAt: null },
    ];
    const fetchMock = vi.fn().mockResolvedValue(Response.json(records));
    vi.stubGlobal("fetch", fetchMock);

    const offers = await getHomeOffers();

    expect(offers.map((offer) => offer._id)).toEqual(["all", "services"]);
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/offers$/);
  });

  it("rejects an unsuccessful endpoint response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    await expect(getHomeOffers()).rejects.toThrow("Could not load offers");
  });
});

describe("getShopOffers", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("keeps valid ALL and SHOP offers and excludes service-only offers", async () => {
    const records = [
      { _id: "all", title: "General", discountText: "10% OFF", ctaLabel: "View", ctaHref: "/shop", audience: "ALL", isActive: true, startsAt: null, endsAt: null },
      { _id: "shop", title: "Shop", discountText: "5% OFF", ctaLabel: "Shop", ctaHref: "/shop", audience: "SHOP", isActive: true, startsAt: null, endsAt: null },
      { _id: "services", title: "Repair", discountText: "₹200 OFF", ctaLabel: "Book", ctaHref: "/services", audience: "SERVICES", isActive: true, startsAt: null, endsAt: null },
    ];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(records)));

    await expect(getShopOffers()).resolves.toMatchObject([{ _id: "all" }, { _id: "shop" }]);
  });
});
