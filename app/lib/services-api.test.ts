import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("getServices", () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => vi.unstubAllGlobals());

  it("returns the database-backed services response and shares its short-lived request", async () => {
    const services = [{
      _id: "service-id",
      slug: "air-conditioner",
      name: "Air Conditioner",
      title: "Air conditioner repair",
      startingPrice: "500",
      icon: "ac_unit",
      image: "https://example.com/ac.jpg",
      description: "Repair service",
      features: [],
      subCategories: [],
    }];
    const fetchMock = vi.fn().mockResolvedValue(Response.json(services));
    vi.stubGlobal("fetch", fetchMock);

    const { getServices } = await import("./services-api");
    await expect(getServices()).resolves.toEqual(services);
    await expect(getServices()).resolves.toEqual(services);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/services$/);
  });

  it("rejects unsuccessful or non-array responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ message: "error" })));
    const { getServices } = await import("./services-api");
    await expect(getServices()).rejects.toThrow("Unexpected services response");
  });
});
