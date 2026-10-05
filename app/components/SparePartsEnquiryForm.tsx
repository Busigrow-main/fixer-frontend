"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Mail,
  MapPin,
  Minus,
  Package,
  Phone,
  Plus,
  Send,
  Trash2,
  UserRound,
} from "lucide-react";

import { useAuth } from "@/app/context/AuthContext";
import { API_URL } from "@/app/config";
import type { ACProduct } from "@/app/components/appliances/types";
import { isValidPhone } from "@/app/lib/auth";

interface EnquiryPartItem {
  partId: string;
  quantity: number;
}

interface AvailablePart {
  _id: string;
  name: string;
  price?: number;
  brandSlug?: string;
  brand?: string;
  manufacturer?: string;
  sku?: string;
  partNumber?: string;
  image?: string;
  imageUrl?: string;
  imageUrls?: string[];
}

interface SparePartsEnquiryFormProps {
  initialPartId?: string;
  initialQuantity?: number;
  availableParts?: AvailablePart[];
  enquiryType?: "part" | "appliance";
  selectedAppliance?: ACProduct | null;
  applianceLoadError?: boolean;

  /*
   * Backwards-compatible aliases.
   * These allow the form to work with the newer enquiry page
   * without breaking any existing callers.
   */
  parts?: AvailablePart[];
  isAppliance?: boolean;
  applianceProduct?: ACProduct | null;
}

export default function SparePartsEnquiryForm({
  initialPartId,
  initialQuantity = 1,
  availableParts = [],
  enquiryType = "part",
  selectedAppliance = null,
  applianceLoadError = false,
  parts,
  isAppliance,
  applianceProduct,
}: SparePartsEnquiryFormProps) {
  const router = useRouter();
  const { user, token, continueWithPhone } = useAuth();

  const normalizedParts = parts ?? availableParts;

  const resolvedAppliance =
    applianceProduct ?? selectedAppliance ?? null;

  const resolvedIsAppliance =
    typeof isAppliance === "boolean"
      ? isAppliance
      : enquiryType === "appliance";

  const [items, setItems] = useState<EnquiryPartItem[]>([
    {
      partId: initialPartId ?? "",
      quantity: Math.max(1, initialQuantity),
    },
  ]);

  const [applianceQuantity, setApplianceQuantity] =
    useState(1);

  const [customerName, setCustomerName] = useState(
    user?.fullName || "",
  );

  const [phone, setPhone] = useState(
    user?.phone || "",
  );

  const [email, setEmail] = useState(
    user?.email || "",
  );

  const [address, setAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const today = useMemo(() => {
    const now = new Date();

    return `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, "0")}-${String(
      now.getDate(),
    ).padStart(2, "0")}`;
  }, []);

  const currentTime = useMemo(() => {
    const now = new Date();

    return `${String(now.getHours()).padStart(
      2,
      "0",
    )}:${String(now.getMinutes()).padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    if (!user) return;

    setCustomerName((current) =>
      current || user.fullName || "",
    );

    setPhone((current) =>
      current || user.phone || "",
    );

    setEmail((current) =>
      current || user.email || "",
    );
  }, [user]);

  const selectedPartCount = useMemo(
    () =>
      items.filter(
        (item) => Boolean(item.partId),
      ).length,
    [items],
  );

  const canSubmit = resolvedIsAppliance
    ? Boolean(resolvedAppliance) &&
      !applianceLoadError
    : selectedPartCount > 0;

  const selectedParts = useMemo(
    () =>
      items
        .filter((item) => item.partId)
        .map((item) => ({
          item,
          part:
            normalizedParts.find(
              (part) => part._id === item.partId,
            ) || null,
        })),
    [items, normalizedParts],
  );

  const estimatedPartTotal = useMemo(() => {
    return selectedParts.reduce((total, entry) => {
      const price = Number(entry.part?.price);

      if (!Number.isFinite(price) || price <= 0) {
        return total;
      }

      return (
        total +
        price *
          Math.max(1, entry.item.quantity)
      );
    }, 0);
  }, [selectedParts]);

  const appliancePrice =
    Number(resolvedAppliance?.price) || 0;

  const applianceTotal =
    appliancePrice *
    Math.max(1, applianceQuantity);

  const updateItem = (
    index: number,
    next: EnquiryPartItem,
  ) => {
    setItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? next
          : item,
      ),
    );
  };

  const addPartRow = () => {
    setItems((previous) => [
      ...previous,
      {
        partId: "",
        quantity: 1,
      },
    ]);
  };

  const removePartRow = (index: number) => {
    setItems((previous) => {
      if (previous.length === 1) {
        return previous;
      }

      return previous.filter(
        (_, itemIndex) =>
          itemIndex !== index,
      );
    });
  };

  const incrementPartQuantity = (
    index: number,
  ) => {
    const current = items[index];

    if (!current) return;

    updateItem(index, {
      ...current,
      quantity: Math.max(
        1,
        current.quantity + 1,
      ),
    });
  };

  const decrementPartQuantity = (
    index: number,
  ) => {
    const current = items[index];

    if (!current) return;

    updateItem(index, {
      ...current,
      quantity: Math.max(
        1,
        current.quantity - 1,
      ),
    });
  };

  const validateDateTime = () => {
    if (!preferredDate) {
      setError(
        "Please select a preferred date.",
      );
      return false;
    }

    if (preferredDate < today) {
      setError(
        "Please select today or a future date.",
      );
      return false;
    }

    if (!preferredTime) {
      setError(
        "Please select a preferred time.",
      );
      return false;
    }

    if (
      preferredDate === today &&
      preferredTime <= currentTime
    ) {
      setError(
        "Please select a future time.",
      );
      return false;
    }

    return true;
  };

  const readApiError = async (
    response: Response,
    fallback: string,
  ) => {
    try {
      const data = await response.json();

      if (Array.isArray(data?.message)) {
        return data.message.join(", ");
      }

      if (
        typeof data?.message === "string" &&
        data.message.trim()
      ) {
        return data.message;
      }

      return fallback;
    } catch {
      return fallback;
    }
  };

  const onSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError("");

    const trimmedName =
      customerName.trim();

    const trimmedPhone =
      phone.trim();

    const trimmedEmail =
      email.trim();

    const trimmedAddress =
      address.trim();

    if (!trimmedName) {
      setError(
        "Please enter your full name.",
      );
      return;
    }

    if (!isValidPhone(trimmedPhone)) {
      setError(
        "Enter a valid 10-digit mobile number.",
      );
      return;
    }

    if (!trimmedEmail) {
      setError(
        "Please enter your email address.",
      );
      return;
    }

    if (!trimmedAddress) {
      setError(
        "Please enter your address.",
      );
      return;
    }

    if (!validateDateTime()) {
      return;
    }

    if (resolvedIsAppliance) {
      if (!resolvedAppliance) {
        setError(
          "Product could not be loaded. Please return to the product page and try again.",
        );
        return;
      }
    } else {
      const normalizedItems = items
        .filter((item) => item.partId)
        .map((item) => ({
          partId: item.partId,
          quantity: Math.max(
            1,
            Number(item.quantity) || 1,
          ),
        }));

      if (normalizedItems.length === 0) {
        setError(
          "Please select at least one spare part.",
        );
        return;
      }
    }

    setIsSubmitting(true);

    const contactPayload = {
      name: trimmedName,
      phone: trimmedPhone,
      email: trimmedEmail,
      address: trimmedAddress,
      preferredDate,
      preferredTime,
      notes:
        notes.trim() || undefined,
    };

    try {
      let authToken = token;

      if (!user || !authToken) {
        authToken =
          await continueWithPhone(
            trimmedPhone,
            trimmedName,
          );
      }

      if (!authToken) {
        throw new Error(
          "Authentication failed. Please try again.",
        );
      }

      if (!resolvedIsAppliance) {
        const normalizedItems = items
          .filter((item) => item.partId)
          .map((item) => ({
            partId: item.partId,
            quantity: Math.max(
              1,
              Number(item.quantity) || 1,
            ),
          }));

        const response = await fetch(
          `${API_URL}/part-orders`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              orderType: "part",
              contactData: contactPayload,
              items: normalizedItems,
            }),
          },
        );

        if (!response.ok) {
          throw new Error(
            await readApiError(
              response,
              "Failed to submit spare part request.",
            ),
          );
        }

        router.push(
          "/my-bookings?success=true&tab=parts",
        );

        return;
      }

      const response = await fetch(
        `${API_URL}/part-orders`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            orderType: "appliance",
            contactData: contactPayload,
            applianceItem: {
              applianceId:
                resolvedAppliance.id,
              slug:
                resolvedAppliance.slug,
              name:
                resolvedAppliance.name,
              brand:
                resolvedAppliance.brand,
              modelNumber:
                resolvedAppliance.modelNumber,
              price:
                resolvedAppliance.price,
              quantity: Math.max(
                1,
                applianceQuantity,
              ),
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          await readApiError(
            response,
            "Failed to submit appliance enquiry.",
          ),
        );
      }

      router.push(
        "/my-bookings?success=true&tab=appliances",
      );
    } catch (submissionError) {
      console.error(
        "Shop enquiry submission failed:",
        submissionError,
      );

      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Something went wrong. Please try again.",
      );

      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5"
    >
      {/* Error */}
      {error ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <p className="text-xs font-black">
              We couldn't submit your request
            </p>

            <p className="mt-1 text-xs leading-5 text-red-700">
              {error}
            </p>
          </div>
        </div>
      ) : null}

      {/* Step 1 */}
      <FormSection
        number="01"
        title={
          resolvedIsAppliance
            ? "Review your appliance"
            : "Choose your spare parts"
        }
        description={
          resolvedIsAppliance
            ? "Confirm the product and quantity you want to enquire about."
            : "Select the parts you need. You can request more than one part."
        }
      >
        {resolvedIsAppliance ? (
          resolvedAppliance ? (
            <ApplianceSummary
              appliance={resolvedAppliance}
              quantity={applianceQuantity}
              onQuantityChange={
                setApplianceQuantity
              }
            />
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                <div>
                  <p className="text-sm font-black text-amber-900">
                    Product unavailable
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    Return to the appliance catalogue
                    and open the enquiry again.
                  </p>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <PartRow
                key={`part-${index}`}
                index={index}
                item={item}
                parts={normalizedParts}
                canRemove={
                  items.length > 1
                }
                onChange={updateItem}
                onRemove={removePartRow}
                onIncrement={
                  incrementPartQuantity
                }
                onDecrement={
                  decrementPartQuantity
                }
              />
            ))}

            <button
              type="button"
              onClick={addPartRow}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/[0.03] px-4 text-xs font-black text-primary transition-colors hover:border-primary hover:bg-primary/[0.06]"
            >
              <Plus className="h-4 w-4" />
              Add another part
            </button>
          </div>
        )}

        {!resolvedIsAppliance &&
        selectedPartCount > 0 ? (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />

              <span className="text-xs font-bold text-slate-700">
                {selectedPartCount}{" "}
                {selectedPartCount === 1
                  ? "part"
                  : "parts"}{" "}
                selected
              </span>
            </div>

            {estimatedPartTotal > 0 ? (
              <span className="text-xs font-black text-slate-900">
                ₹
                {estimatedPartTotal.toLocaleString(
                  "en-IN",
                )}
              </span>
            ) : null}
          </div>
        ) : null}
      </FormSection>

      {/* Step 2 */}
      <FormSection
        number="02"
        title="Your contact details"
        description="We'll use these details to confirm availability and contact you."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Full name"
            required
            icon={<UserRound />}
          >
            <input
              required
              value={customerName}
              onChange={(event) =>
                setCustomerName(
                  event.target.value,
                )
              }
              placeholder="Your full name"
              autoComplete="name"
              className={inputClass}
            />
          </Field>

          <Field
            label="Mobile number"
            required
            icon={<Phone />}
          >
            <input
              required
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) =>
                setPhone(
                  event.target.value,
                )
              }
              placeholder="10-digit mobile number"
              autoComplete="tel"
              className={inputClass}
            />
          </Field>

          <Field
            label="Email address"
            required
            icon={<Mail />}
          >
            <input
              required
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              placeholder="you@example.com"
              autoComplete="email"
              className={inputClass}
            />
          </Field>

          <Field
            label="Address"
            required
            icon={<MapPin />}
          >
            <input
              required
              value={address}
              onChange={(event) =>
                setAddress(
                  event.target.value,
                )
              }
              placeholder="House no, area, city"
              autoComplete="street-address"
              className={inputClass}
            />
          </Field>
        </div>
      </FormSection>

      {/* Step 3 */}
      <FormSection
        number="03"
        title="Preferred timing"
        description="Choose when you'd like Fixxer to contact you about this request."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Preferred date"
            required
            icon={<CalendarDays />}
          >
            <input
              required
              type="date"
              min={today}
              value={preferredDate}
              onChange={(event) => {
                const nextDate =
                  event.target.value;

                if (
                  nextDate &&
                  nextDate < today
                ) {
                  setError(
                    "Please select today or a future date.",
                  );
                  return;
                }

                setError("");
                setPreferredDate(
                  nextDate,
                );

                if (
                  nextDate !== today
                ) {
                  return;
                }

                if (
                  preferredTime &&
                  preferredTime <= currentTime
                ) {
                  setPreferredTime("");
                }
              }}
              className={inputClass}
            />
          </Field>

          <Field
            label="Preferred time"
            required
            icon={<Clock3 />}
          >
            <input
              required
              type="time"
              min={
                preferredDate === today
                  ? currentTime
                  : undefined
              }
              value={preferredTime}
              onChange={(event) => {
                const nextTime =
                  event.target.value;

                if (
                  preferredDate === today &&
                  nextTime &&
                  nextTime <= currentTime
                ) {
                  setError(
                    "Please select a future time.",
                  );
                  return;
                }

                setError("");
                setPreferredTime(
                  nextTime,
                );
              }}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 px-3.5 py-3">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

          <p className="text-[10px] leading-5 text-slate-500">
            This is your preferred contact/request
            time. Final availability will be confirmed
            by Fixxer.
          </p>
        </div>
      </FormSection>

      {/* Step 4 */}
      <FormSection
        number="04"
        title="Anything else we should know?"
        description="Optional details can help our team prepare before contacting you."
        optional
      >
        <textarea
          value={notes}
          onChange={(event) =>
            setNotes(event.target.value)
          }
          placeholder={
            resolvedIsAppliance
              ? "Installation preferences, room details, urgency..."
              : "Model number, appliance details, urgency, or anything else..."
          }
          rows={4}
          className={`${inputClass} min-h-[110px] resize-none py-3`}
        />
      </FormSection>

      {/* Final summary */}
      <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />

            <h2 className="text-xs font-black text-slate-900">
              Request summary
            </h2>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {resolvedIsAppliance ? (
            resolvedAppliance ? (
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-900">
                    {resolvedAppliance.name}
                  </p>

                  <p className="mt-1 text-[10px] font-semibold text-slate-400">
                    Quantity ×{" "}
                    {applianceQuantity}
                  </p>
                </div>

                {applianceTotal > 0 ? (
                  <span className="shrink-0 text-sm font-black text-primary">
                    ₹
                    {applianceTotal.toLocaleString(
                      "en-IN",
                    )}
                  </span>
                ) : (
                  <span className="shrink-0 text-xs font-bold text-slate-400">
                    Price to confirm
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Product information is unavailable.
              </p>
            )
          ) : selectedParts.length > 0 ? (
            <div className="space-y-3">
              {selectedParts.map(
                ({ item, part }, index) => (
                  <div
                    key={`${item.partId}-${index}`}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black text-slate-800">
                        {part?.name ||
                          "Selected spare part"}
                      </p>

                      <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                        Qty ×{" "}
                        {item.quantity}
                      </p>
                    </div>

                    {part &&
                    Number(part.price) > 0 ? (
                      <span className="shrink-0 text-xs font-black text-slate-900">
                        ₹
                        {(
                          Number(
                            part.price,
                          ) *
                          item.quantity
                        ).toLocaleString(
                          "en-IN",
                        )}
                      </span>
                    ) : (
                      <span className="shrink-0 text-[10px] font-bold text-slate-400">
                        Price to confirm
                      </span>
                    )}
                  </div>
                ),
              )}

              <div className="mt-3 border-t border-slate-100 pt-3">
                <p className="text-[10px] leading-5 text-slate-400">
                  Any displayed price is indicative. Fixxer
                  will confirm fit, stock and final pricing
                  before fulfilment.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              Select a part above to see your request
              summary.
            </p>
          )}
        </div>
      </section>

      {/* Submit */}
      <div className="rounded-[22px] border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4">
        <button
          type="submit"
          disabled={
            isSubmitting ||
            !canSubmit
          }
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Submitting request...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {resolvedIsAppliance
                ? "Submit appliance enquiry"
                : "Submit spare part request"}
            </>
          )}
        </button>

        <div className="mt-3 flex items-center justify-center gap-2 text-center">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />

          <p className="text-[9px] font-semibold leading-4 text-slate-400">
            No payment is required to submit this request.
            Fixxer will confirm availability and next steps.
          </p>
        </div>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* UI helpers                                                                  */
/* -------------------------------------------------------------------------- */

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-base font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 sm:text-sm";

function FormSection({
  number,
  title,
  description,
  optional = false,
  children,
}: {
  number: string;
  title: string;
  description: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
      <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-[9px] font-black text-white">
            {number}
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-black text-slate-950">
                {title}
              </h2>

              {optional ? (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-black uppercase tracking-wide text-slate-400">
                  Optional
                </span>
              ) : null}
            </div>

            <p className="mt-1 text-[10px] leading-5 text-slate-400">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  required = false,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
        <span className="text-slate-400">
          {React.cloneElement(
            icon as React.ReactElement,
            {
              className: "h-3.5 w-3.5",
            },
          )}
        </span>

        {label}

        {required ? (
          <span className="text-primary">
            *
          </span>
        ) : null}
      </label>

      {children}
    </div>
  );
}

function PartRow({
  index,
  item,
  parts,
  canRemove,
  onChange,
  onRemove,
  onIncrement,
  onDecrement,
}: {
  index: number;
  item: EnquiryPartItem;
  parts: AvailablePart[];
  canRemove: boolean;
  onChange: (
    index: number,
    next: EnquiryPartItem,
  ) => void;
  onRemove: (index: number) => void;
  onIncrement: (index: number) => void;
  onDecrement: (index: number) => void;
}) {
  const selectedPart =
    parts.find(
      (part) => part._id === item.partId,
    ) || null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-primary">
            Part {index + 1}
          </p>

          {selectedPart ? (
            <p className="mt-1 truncate text-[10px] font-semibold text-slate-400">
              {selectedPart.sku ||
                selectedPart.partNumber ||
                "Selected part"}
            </p>
          ) : null}
        </div>

        {canRemove ? (
          <button
            type="button"
            onClick={() =>
              onRemove(index)
            }
            aria-label={`Remove part ${index + 1}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="mt-3">
        <label className="sr-only">
          Select spare part
        </label>

        <div className="relative">
          <select
            required={index === 0}
            value={item.partId}
            onChange={(event) =>
              onChange(index, {
                ...item,
                partId:
                  event.target.value,
              })
            }
            className={`${inputClass} appearance-none pr-10`}
          >
            <option value="">
              Select a spare part...
            </option>

            {parts.map((part) => {
              const price =
                Number(part.price);

              const hasPrice =
                Number.isFinite(price) &&
                price > 0;

              return (
                <option
                  key={part._id}
                  value={part._id}
                >
                  {part.name}
                  {part.brandSlug
                    ? ` (${part.brandSlug})`
                    : ""}
                  {hasPrice
                    ? ` — ₹${price.toLocaleString(
                        "en-IN",
                      )}`
                    : ""}
                </option>
              );
            })}
          </select>

          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">
          Quantity
        </span>

        <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white">
          <button
            type="button"
            onClick={() =>
              onDecrement(index)
            }
            disabled={
              item.quantity <= 1
            }
            aria-label="Decrease quantity"
            className="flex h-10 w-10 items-center justify-center text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>

          <span className="flex h-10 min-w-10 items-center justify-center border-x border-slate-100 px-2 text-xs font-black text-slate-900">
            {Math.max(
              1,
              item.quantity,
            )}
          </span>

          <button
            type="button"
            onClick={() =>
              onIncrement(index)
            }
            aria-label="Increase quantity"
            className="flex h-10 w-10 items-center justify-center text-slate-500 transition-colors hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {selectedPart ? (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />

            <span className="truncate text-[10px] font-semibold text-slate-500">
              {selectedPart.brand ||
                selectedPart.manufacturer ||
                selectedPart.brandSlug ||
                "Fixxer catalog part"}
            </span>
          </div>

          {Number(selectedPart.price) > 0 ? (
            <span className="shrink-0 text-[10px] font-black text-slate-800">
              ₹
              {(
                Number(
                  selectedPart.price,
                ) *
                Math.max(
                  1,
                  item.quantity,
                )
              ).toLocaleString(
                "en-IN",
              )}
            </span>
          ) : (
            <span className="shrink-0 text-[9px] font-bold text-slate-400">
              Price to confirm
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}

function ApplianceSummary({
  appliance,
  quantity,
  onQuantityChange,
}: {
  appliance: ACProduct;
  quantity: number;
  onQuantityChange: (
    quantity: number,
  ) => void;
}) {
  const image =
    appliance.images?.[0] || "";

  const price =
    Number(appliance.price) || 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-primary/10 bg-primary/[0.03]">
      <div className="flex gap-3 p-4 sm:gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white sm:h-24 sm:w-24">
          {image ? (
            <Image
              src={image}
              alt={
                appliance.name ||
                "Selected appliance"
              }
              fill
              sizes="96px"
              className="object-contain p-2"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-300">
              <Package className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-black leading-5 text-slate-950">
            {appliance.name}
          </p>

          <p className="mt-1 text-[10px] font-semibold text-slate-500">
            {appliance.brand}
            {appliance.capacityTon
              ? ` · ${appliance.capacityTon} Ton`
              : ""}
            {appliance.starRating
              ? ` · ${appliance.starRating}-Star`
              : ""}
          </p>

          {price > 0 ? (
            <p className="mt-2 text-sm font-black text-primary">
              ₹
              {price.toLocaleString(
                "en-IN",
              )}
            </p>
          ) : (
            <p className="mt-2 text-[10px] font-bold text-slate-400">
              Price to confirm
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-primary/10 bg-white px-4 py-3">
        <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">
          Quantity
        </span>

        <div className="flex items-center overflow-hidden rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() =>
              onQuantityChange(
                Math.max(
                  1,
                  quantity - 1,
                ),
              )
            }
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="flex h-10 w-10 items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>

          <span className="flex h-10 min-w-10 items-center justify-center border-x border-slate-100 px-2 text-xs font-black text-slate-900">
            {quantity}
          </span>

          <button
            type="button"
            onClick={() =>
              onQuantityChange(
                Math.max(
                  1,
                  quantity + 1,
                ),
              )
            }
            aria-label="Increase quantity"
            className="flex h-10 w-10 items-center justify-center text-slate-500 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="border-t border-primary/10 bg-primary/[0.03] px-4 py-3">
        <p className="text-[10px] leading-5 text-slate-500">
          Our team will confirm availability, final
          pricing and installation scheduling after you
          submit.
        </p>
      </div>
    </div>
  );
}