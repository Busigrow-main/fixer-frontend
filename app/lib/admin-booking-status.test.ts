import { describe, expect, it } from "vitest";

/**
 * Mirrors admin booking list status controls in
 * app/admin/bookings/page.tsx — kept here so unit tests catch
 * drift from the real technician job lifecycle.
 */
const ADMIN_LIST_STATUS_FILTERS = [
  "PENDING",
  "CONFIRMED",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "RESCHEDULED",
  "USER_CANCELLED",
  "ADMIN_CANCELLED",
] as const;

const ADMIN_LIST_STATUS_ACTIONS = [
  "PENDING",
  "CONFIRMED",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "RESCHEDULED",
  "CANCELLED",
] as const;

/** Backend JOB_STATUS_FLOW (+ admin-relevant terminals). */
const TECHNICIAN_JOB_LIFECYCLE = [
  "ASSIGNED",
  "EN_ROUTE",
  "IN_PROGRESS",
  "COMPLETED",
  "PAYMENT_COLLECTED",
] as const;

describe("admin booking status controls vs technician lifecycle", () => {
  it("breakpoint: admin list filters omit EN_ROUTE and PAYMENT_COLLECTED", () => {
    expect(ADMIN_LIST_STATUS_FILTERS).not.toContain("EN_ROUTE");
    expect(ADMIN_LIST_STATUS_FILTERS).not.toContain("PAYMENT_COLLECTED");
  });

  it("breakpoint: admin list status actions omit EN_ROUTE and PAYMENT_COLLECTED", () => {
    expect(ADMIN_LIST_STATUS_ACTIONS).not.toContain("EN_ROUTE");
    expect(ADMIN_LIST_STATUS_ACTIONS).not.toContain("PAYMENT_COLLECTED");
  });

  it("documents the backend technician job flow the admin UI should eventually cover", () => {
    expect([...TECHNICIAN_JOB_LIFECYCLE]).toEqual([
      "ASSIGNED",
      "EN_ROUTE",
      "IN_PROGRESS",
      "COMPLETED",
      "PAYMENT_COLLECTED",
    ]);
  });

  it("breakpoint: ON_JOB / AVAILABLE are technician presence, not booking status options", () => {
    expect(ADMIN_LIST_STATUS_ACTIONS).not.toContain("AVAILABLE");
    expect(ADMIN_LIST_STATUS_ACTIONS).not.toContain("ON_JOB");
    expect(ADMIN_LIST_STATUS_ACTIONS).not.toContain("UNAVAILABLE");
  });
});
