/** Normalize to 10-digit Indian mobile (matches backend auth.service). */
export function normalizePhone(raw: string): string {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

export function isValidPhone(raw: string): boolean {
  return normalizePhone(raw).length === 10;
}
