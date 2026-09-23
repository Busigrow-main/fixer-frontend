/**
 * Customer-facing booking status / pricing helpers (mirrors backend helpers).
 */

export type CustomerStatusTone = "pending" | "active" | "success" | "danger" | "neutral";

export type CustomerStatusView = {
  code: string;
  label: string;
  tone: CustomerStatusTone;
  stepIndex: number;
};

export const CUSTOMER_STATUS_STEPS = [
  "PENDING",
  "CONFIRMED",
  "ASSIGNED",
  "EN_ROUTE",
  "IN_PROGRESS",
  "COMPLETED",
  "PAYMENT_COLLECTED",
] as const;

export function getCustomerStatusView(
  status: string | undefined | null,
  opts: { isWarrantyClaim?: boolean; arrivalAt?: Date | string | null } = {},
): CustomerStatusView {
  if (opts.isWarrantyClaim) {
    return {
      code: "WARRANTY_CLAIM",
      label: "Warranty claim",
      tone: "active",
      stepIndex: 2,
    };
  }

  const code = String(status || "PENDING").toUpperCase();

  switch (code) {
    case "PENDING":
      return { code, label: "Finding a master technician", tone: "pending", stepIndex: 0 };
    case "CONFIRMED":
      return { code, label: "Booking confirmed", tone: "active", stepIndex: 1 };
    case "ASSIGNED":
      return { code, label: "Master technician assigned", tone: "active", stepIndex: 2 };
    case "EN_ROUTE":
      return opts.arrivalAt
        ? { code, label: "Technician has arrived", tone: "active", stepIndex: 3 }
        : { code, label: "Technician is on the way", tone: "active", stepIndex: 3 };
    case "IN_PROGRESS":
      return { code, label: "Service in progress", tone: "active", stepIndex: 4 };
    case "COMPLETED":
      return { code, label: "Service completed", tone: "success", stepIndex: 5 };
    case "PAYMENT_COLLECTED":
      return { code, label: "Payment received", tone: "success", stepIndex: 6 };
    case "CANCELLED":
      return { code, label: "Cancelled", tone: "danger", stepIndex: -1 };
    case "RESCHEDULED":
      return { code, label: "Rescheduled", tone: "neutral", stepIndex: 1 };
    default:
      return {
        code,
        label: code.replace(/_/g, " ").toLowerCase(),
        tone: "neutral",
        stepIndex: 0,
      };
  }
}

export type CustomerPricingSummary = {
  estimatedAmount: number;
  serviceTotal: number;
  partsTotal: number;
  additionalChargesTotal: number;
  totalAmount: number;
  hasExtras: boolean;
  isFinal: boolean;
  displayLabel: "Estimated" | "Current total" | "Final";
};

export function buildCustomerPricingSummary(booking: {
  estimatedAmount?: number;
  invoiceData?: {
    serviceTotal?: number;
    partsTotal?: number;
    additionalCharges?: { amount?: number; label?: string }[];
    totalAmount?: number;
  };
  pricing?: Partial<CustomerPricingSummary>;
  isBilled?: boolean;
  jobClosed?: boolean;
  paymentStatus?: string;
  status?: string;
}): CustomerPricingSummary {
  if (booking.pricing?.displayLabel && booking.pricing.totalAmount != null) {
    return {
      estimatedAmount: Number(booking.pricing.estimatedAmount || 0),
      serviceTotal: Number(booking.pricing.serviceTotal || 0),
      partsTotal: Number(booking.pricing.partsTotal || 0),
      additionalChargesTotal: Number(booking.pricing.additionalChargesTotal || 0),
      totalAmount: Number(booking.pricing.totalAmount || 0),
      hasExtras: !!booking.pricing.hasExtras,
      isFinal: !!booking.pricing.isFinal,
      displayLabel: booking.pricing.displayLabel,
    };
  }

  const serviceTotal = Number(booking.invoiceData?.serviceTotal || 0);
  const partsTotal = Number(booking.invoiceData?.partsTotal || 0);
  const additionalChargesTotal = (booking.invoiceData?.additionalCharges || []).reduce(
    (sum, c) => sum + Number(c?.amount || 0),
    0,
  );
  const totalAmount =
    booking.invoiceData?.totalAmount != null
      ? Number(booking.invoiceData.totalAmount)
      : serviceTotal + partsTotal + additionalChargesTotal;

  const estimatedAmount =
    Number(booking.estimatedAmount) > 0 ? Number(booking.estimatedAmount) : serviceTotal;

  const hasExtras = partsTotal > 0 || additionalChargesTotal > 0;
  const isFinal =
    booking.isBilled === true ||
    booking.jobClosed === true ||
    booking.paymentStatus === "PAID_CASH" ||
    booking.paymentStatus === "PAID_ONLINE" ||
    booking.status === "PAYMENT_COLLECTED";

  let displayLabel: CustomerPricingSummary["displayLabel"] = "Estimated";
  if (isFinal) displayLabel = "Final";
  else if (hasExtras) displayLabel = "Current total";

  return {
    estimatedAmount,
    serviceTotal,
    partsTotal,
    additionalChargesTotal,
    totalAmount,
    hasExtras,
    isFinal,
    displayLabel,
  };
}

export function formatInr(amount: number): string {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

export function formatVisitSlot(slot?: string | null): string {
  switch (String(slot || "").toUpperCase()) {
    case "MORNING":
      return "Morning (8am–12pm)";
    case "AFTERNOON":
      return "Afternoon (12pm–4pm)";
    case "EVENING":
      return "Evening (4pm–8pm)";
    default:
      return "";
  }
}

export function formatScheduleLabel(booking: {
  schedule?: {
    expectedArrivalAt?: string | Date | null;
    preferredVisitDate?: string | null;
    preferredVisitSlot?: string | null;
    source?: string;
  };
  expectedArrivalAt?: string | Date | null;
  preferredVisitDate?: string | null;
  preferredVisitSlot?: string | null;
  upcomingVisit?: { scheduledDate?: string | Date | null } | null;
}): string | null {
  const schedule = booking.schedule;
  if (schedule?.expectedArrivalAt) {
    const d = new Date(schedule.expectedArrivalAt);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      });
    }
  }
  if (booking.upcomingVisit?.scheduledDate) {
    const d = new Date(booking.upcomingVisit.scheduledDate);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      });
    }
  }
  const preferredDate = schedule?.preferredVisitDate || booking.preferredVisitDate;
  const preferredSlot = schedule?.preferredVisitSlot || booking.preferredVisitSlot;
  if (preferredDate) {
    const slot = formatVisitSlot(preferredSlot);
    return slot ? `${preferredDate} · ${slot}` : preferredDate;
  }
  return null;
}

export function statusToneClasses(tone: CustomerStatusTone): {
  dot: string;
  badge: string;
} {
  switch (tone) {
    case "pending":
      return {
        dot: "bg-amber-500 animate-pulse",
        badge: "text-amber-800 bg-amber-50 border-amber-100",
      };
    case "active":
      return {
        dot: "bg-sky-500",
        badge: "text-sky-800 bg-sky-50 border-sky-100",
      };
    case "success":
      return {
        dot: "bg-green-500",
        badge: "text-green-800 bg-green-50 border-green-100",
      };
    case "danger":
      return {
        dot: "bg-red-500",
        badge: "text-red-800 bg-red-50 border-red-100",
      };
    default:
      return {
        dot: "bg-zinc-400",
        badge: "text-zinc-700 bg-zinc-50 border-zinc-100",
      };
  }
}
