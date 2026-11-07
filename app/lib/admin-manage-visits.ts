/** Terminal jobs — admin assign is blocked until an audited reopen exists. */
export const TERMINAL_ASSIGN_STATUSES = [
  "CANCELLED",
  "COMPLETED",
  "PAYMENT_COLLECTED",
] as const;

export function isAssignBlockedStatus(status?: string | null): boolean {
  const code = String(status || "").toUpperCase();
  return (TERMINAL_ASSIGN_STATUSES as readonly string[]).includes(code);
}

/** Visits wrench stays available except on cancelled rows. */
export function canOpenManageVisits(status?: string | null): boolean {
  return String(status || "").toUpperCase() !== "CANCELLED";
}

export function resolveBookingTechnicianId(
  technicianId: unknown,
): string | undefined {
  if (technicianId == null || technicianId === "") return undefined;
  if (typeof technicianId === "object" && "_id" in (technicianId as object)) {
    const id = (technicianId as { _id?: unknown })._id;
    return id == null || id === "" ? undefined : String(id);
  }
  return String(technicianId);
}

export function buildVisitModalState(booking: {
  _id: string;
  technicianId?: unknown;
}): { bookingId: string; technicianId?: string } {
  return {
    bookingId: booking._id,
    technicianId: resolveBookingTechnicianId(booking.technicianId),
  };
}

/**
 * Engine assign pool: active + AVAILABLE.
 * Always keep the currently assigned tech visible even if ON_JOB.
 */
export function isAvailableForAssignment(tech: {
  isActive?: boolean;
  availabilityStatus?: string | null;
}): boolean {
  return tech.isActive !== false && tech.availabilityStatus === "AVAILABLE";
}

export function filterAssignableTechnicians<
  T extends {
    _id: string;
    isActive?: boolean;
    availabilityStatus?: string | null;
  },
>(technicians: T[], currentTechnicianId?: string | null): T[] {
  const current = currentTechnicianId ? String(currentTechnicianId) : "";
  return technicians.filter((t) => {
    if (current && String(t._id) === current) return true;
    return isAvailableForAssignment(t);
  });
}

export function needsAssignBeforeVisit(
  assignedTechnicianId?: string | null,
): boolean {
  return !assignedTechnicianId;
}

export function resolveVisitTechnicianId(
  assignedTechnicianId?: string | null,
  pickedTechnicianId?: string | null,
): string {
  return String(assignedTechnicianId || pickedTechnicianId || "");
}
