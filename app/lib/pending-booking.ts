/**
 * Persists repair booking form data when the user must sign in or register.
 * Cleared after successful booking or when the user discards the draft.
 */

export const PENDING_BOOKING_STORAGE_KEY = "fixxer_pending_booking_v1";
export const BOOKING_FLOW_SOURCE = "booking";

const MAX_AGE_MS = 1000 * 60 * 60 * 24; // 24h

export type PendingBookingDraft = {
  version: 1;
  serviceId: string;
  subCategoryId: string;
  serviceSlug?: string;
  serviceName?: string;
  subCategoryName?: string;
  name: string;
  phone: string;
  brand?: string;
  zip: string;
  address: string;
  description: string;
  returnPath: string;
  savedAt: string;
};

export function savePendingBookingDraft(draft: Omit<PendingBookingDraft, "version" | "savedAt">): void {
  if (typeof window === "undefined") return;
  const payload: PendingBookingDraft = {
    version: 1,
    ...draft,
    savedAt: new Date().toISOString(),
  };
  try {
    window.sessionStorage.setItem(PENDING_BOOKING_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // quota / private mode
  }
}

export function loadPendingBookingDraft(): PendingBookingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PENDING_BOOKING_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingBookingDraft;
    if (parsed?.version !== 1 || !parsed.serviceId || !parsed.subCategoryId) return null;
    const age = Date.now() - new Date(parsed.savedAt).getTime();
    if (Number.isFinite(age) && age > MAX_AGE_MS) {
      window.sessionStorage.removeItem(PENDING_BOOKING_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingBookingDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PENDING_BOOKING_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function hasPendingBookingDraft(): boolean {
  return loadPendingBookingDraft() !== null;
}

/** Prevent open redirects: only same-origin relative paths. */
export function safeAppRedirect(raw: string | null, fallback = "/"): string {
  if (!raw || typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  return trimmed;
}
