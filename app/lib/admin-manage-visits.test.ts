import { describe, expect, it } from "vitest";
import {
  buildVisitModalState,
  canOpenManageVisits,
  filterAssignableTechnicians,
  isAssignBlockedStatus,
  needsAssignBeforeVisit,
  resolveBookingTechnicianId,
  resolveVisitTechnicianId,
} from "./admin-manage-visits";

describe("admin manage visits / assign gates", () => {
  it("blocks assign on cancelled, completed, and payment-collected jobs", () => {
    expect(isAssignBlockedStatus("CONFIRMED")).toBe(false);
    expect(isAssignBlockedStatus("cancelled")).toBe(true);
    expect(isAssignBlockedStatus("COMPLETED")).toBe(true);
    expect(isAssignBlockedStatus("PAYMENT_COLLECTED")).toBe(true);
  });

  it("allows the visits wrench on confirmed/unassigned NEEDS ADMIN rows", () => {
    expect(canOpenManageVisits("CONFIRMED")).toBe(true);
    expect(canOpenManageVisits("ASSIGNED")).toBe(true);
    expect(canOpenManageVisits("CANCELLED")).toBe(false);
    expect(canOpenManageVisits("cancelled")).toBe(false);
  });

  it("passes technicianId into visit modal state (list-page bug regression)", () => {
    expect(
      buildVisitModalState({
        _id: "daaa2b80",
        technicianId: undefined,
      }),
    ).toEqual({ bookingId: "daaa2b80", technicianId: undefined });

    expect(
      buildVisitModalState({
        _id: "daaa2b81",
        technicianId: { _id: "techA", name: "Amit Sharma" },
      }),
    ).toEqual({ bookingId: "daaa2b81", technicianId: "techA" });

    expect(resolveBookingTechnicianId("techRaw")).toBe("techRaw");
  });

  it("filters to active AVAILABLE techs but keeps the current assignee", () => {
    const techs = [
      {
        _id: "a",
        name: "A",
        isActive: true,
        availabilityStatus: "AVAILABLE",
      },
      {
        _id: "b",
        name: "B",
        isActive: false,
        availabilityStatus: "AVAILABLE",
      },
      {
        _id: "c",
        name: "C",
        isActive: true,
        availabilityStatus: "ON_JOB",
      },
      {
        _id: "d",
        name: "D",
        isActive: true,
        availabilityStatus: "AVAILABLE",
      },
    ];
    expect(filterAssignableTechnicians(techs).map((t) => t._id)).toEqual([
      "a",
      "d",
    ]);
    expect(
      filterAssignableTechnicians(techs, "c").map((t) => t._id),
    ).toEqual(["a", "c", "d"]);
  });

  it("schedules fully: unassigned jobs assign-then-create; assigned skip assign", () => {
    expect(needsAssignBeforeVisit(undefined)).toBe(true);
    expect(needsAssignBeforeVisit("")).toBe(true);
    expect(needsAssignBeforeVisit("techA")).toBe(false);

    expect(resolveVisitTechnicianId("techA", "picked")).toBe("techA");
    expect(resolveVisitTechnicianId(undefined, "picked")).toBe("picked");
    expect(resolveVisitTechnicianId(undefined, undefined)).toBe("");
  });
});
