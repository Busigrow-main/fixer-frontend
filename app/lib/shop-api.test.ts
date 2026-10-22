import { afterEach, describe, expect, it, vi } from "vitest";
import { getShopHome } from "./shop-api";

describe("getShopHome", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns live mixed shop cards from the shop-home endpoint", async () => {
    const response = {
      appliances: [{
        productType: "appliance",
        id: "appliance-id",
        slug: "fridge",
        name: "Refrigerator",
        image: "https://example.com/fridge.jpg",
        price: 28990,
        originalPrice: 32990,
        discount: 12,
        rating: 4.5,
        reviewCount: 18,
        isBestseller: true,
        isInStock: true,
        warrantyMonths: 12,
      }],
      parts: [],
      products: [],
      applianceCategories: [{ slug: "refrigerator", productCount: 1 }],
      pagination: { page: 1, limit: 4, applianceTotal: 1, partTotal: 0, hasMore: false },
    };
    const fetchMock = vi.fn().mockResolvedValue(Response.json(response));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getShopHome()).resolves.toEqual(response);
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/shop\/home\?limit=4$/);
  });

  it("rejects malformed and unsuccessful responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ products: [] })));
    await expect(getShopHome()).rejects.toThrow("Unexpected shop response");

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    await expect(getShopHome()).rejects.toThrow("Could not load shop products");
  });

  it("requests later pages from the same unified endpoint", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({
      products: [], appliances: [], parts: [], applianceCategories: [],
      pagination: { page: 2, limit: 24, applianceTotal: 25, partTotal: 30, hasMore: false },
    })));

    await getShopHome(undefined, 24, 2);
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/shop\/home\?limit=24&page=2$/), { signal: undefined });
  });
});
