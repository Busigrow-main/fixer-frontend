import {
  buildCustomerPricingSummary,
  formatInr,
  formatScheduleLabel,
  formatVisitSlot,
  getCustomerStatusView,
  statusToneClasses,
} from "./customer-booking";

describe("customer-booking helpers", () => {
  describe("status", () => {
    it("maps statuses for customers", () => {
      expect(getCustomerStatusView("PENDING").label).toContain("Finding");
      expect(getCustomerStatusView("CANCELLED").tone).toBe("danger");
      expect(statusToneClasses("danger").dot).toContain("red");
    });

    it("covers tone class branches", () => {
      expect(statusToneClasses("pending").badge).toContain("amber");
      expect(statusToneClasses("active").dot).toContain("sky");
      expect(statusToneClasses("success").dot).toContain("green");
      expect(statusToneClasses("neutral").dot).toContain("zinc");
    });

    it("handles warranty claim and arrival edge cases", () => {
      expect(
        getCustomerStatusView("ASSIGNED", { isWarrantyClaim: true }).label,
      ).toBe("Warranty claim");
      expect(getCustomerStatusView("EN_ROUTE", { arrivalAt: null }).label).toContain(
        "on the way",
      );
      expect(
        getCustomerStatusView("EN_ROUTE", {
          arrivalAt: "2026-09-23T10:00:00.000Z",
        }).label,
      ).toContain("arrived");
    });
  });

  describe("pricing", () => {
    it("builds pricing summary from invoice data", () => {
      const summary = buildCustomerPricingSummary({
        estimatedAmount: 499,
        invoiceData: {
          serviceTotal: 499,
          partsTotal: 200,
          additionalCharges: [{ amount: 50, label: "Gas" }],
          totalAmount: 749,
        },
      });
      expect(summary.displayLabel).toBe("Current total");
      expect(formatInr(summary.totalAmount)).toBe("₹749");
    });

    it("prefers server-provided pricing payload when present", () => {
      const summary = buildCustomerPricingSummary({
        estimatedAmount: 1,
        invoiceData: { serviceTotal: 1, totalAmount: 1 },
        pricing: {
          estimatedAmount: 499,
          serviceTotal: 499,
          partsTotal: 100,
          additionalChargesTotal: 0,
          totalAmount: 599,
          hasExtras: true,
          isFinal: false,
          displayLabel: "Current total",
        },
      });
      expect(summary.totalAmount).toBe(599);
      expect(summary.displayLabel).toBe("Current total");
    });

    it("formats zero and large INR amounts", () => {
      expect(formatInr(0)).toBe("₹0");
      expect(formatInr(12500)).toBe("₹12,500");
      expect(formatInr(undefined as unknown as number)).toBe("₹0");
    });

    it("marks unpaid incomplete bookings as estimated even without estimate field", () => {
      const summary = buildCustomerPricingSummary({
        invoiceData: { serviceTotal: 249, partsTotal: 0, totalAmount: 249 },
      });
      expect(summary.estimatedAmount).toBe(249);
      expect(summary.displayLabel).toBe("Estimated");
    });
  });

  describe("schedule formatting", () => {
    it("formats visit slots", () => {
      expect(formatVisitSlot("MORNING")).toContain("Morning");
      expect(formatVisitSlot("AFTERNOON")).toContain("Afternoon");
      expect(formatVisitSlot("EVENING")).toContain("Evening");
      expect(formatVisitSlot(null)).toBe("");
      expect(formatVisitSlot("NOPE")).toBe("");
    });

    it("formats schedule from expectedArrivalAt", () => {
      const label = formatScheduleLabel({
        schedule: {
          expectedArrivalAt: "2026-09-24T10:30:00.000Z",
          source: "expected",
        },
      });
      expect(label).toBeTruthy();
      expect(label).toMatch(/Sep|Sept|9/i);
    });

    it("falls back to upcoming visit then preferred date", () => {
      expect(
        formatScheduleLabel({
          upcomingVisit: { scheduledDate: "2026-09-25T08:00:00.000Z" },
        }),
      ).toBeTruthy();

      expect(
        formatScheduleLabel({
          preferredVisitDate: "2026-09-26",
          preferredVisitSlot: "MORNING",
        }),
      ).toContain("2026-09-26");

      expect(
        formatScheduleLabel({
          schedule: { preferredVisitDate: "2026-09-27", preferredVisitSlot: null },
        }),
      ).toBe("2026-09-27");
    });

    it("returns null when no schedule info", () => {
      expect(formatScheduleLabel({})).toBeNull();
      expect(
        formatScheduleLabel({
          schedule: { expectedArrivalAt: "not-a-date", source: "expected" },
          upcomingVisit: { scheduledDate: "also-bad" },
        }),
      ).toBeNull();
    });
  });
});
