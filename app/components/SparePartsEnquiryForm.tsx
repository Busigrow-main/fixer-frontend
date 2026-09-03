"use client";

import Image from "next/image";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { API_URL } from "@/app/config";
import type { ACProduct } from "@/app/components/appliances/types";
import { isValidPhone } from "@/app/lib/auth";

interface EnquiryPartItem {
  partId: string;
  quantity: number;
}

interface SparePartsEnquiryFormProps {
  initialPartId?: string;
  availableParts: { _id: string; name: string; price?: number; brandSlug?: string }[];
  enquiryType?: "part" | "appliance";
  selectedAppliance?: ACProduct | null;
  applianceLoadError?: boolean;
}

export default function SparePartsEnquiryForm({
  initialPartId,
  availableParts = [],
  enquiryType = "part",
  selectedAppliance = null,
  applianceLoadError = false,
}: SparePartsEnquiryFormProps) {
  const router = useRouter();
  const { user, token, continueWithPhone } = useAuth();

  const [items, setItems] = useState<EnquiryPartItem[]>([
    { partId: initialPartId ?? "", quantity: 1 },
  ]);
  const [applianceQuantity, setApplianceQuantity] = useState(1);

  const [customerName, setCustomerName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [address, setAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isApplianceEnquiry = enquiryType === "appliance";

  React.useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.fullName || "");
      if (!phone) setPhone(user.phone || "");
      if (!email) setEmail(user.email || "");
    }
  }, [user, customerName, phone, email]);

  const selectedPartCount = useMemo(
    () => items.filter((item) => item.partId).length,
    [items],
  );

  const canSubmit = isApplianceEnquiry
    ? Boolean(selectedAppliance) && !applianceLoadError
    : selectedPartCount > 0;

  const updateItem = (index: number, next: EnquiryPartItem) => {
    setItems((prev) => prev.map((item, i) => (i === index ? next : item)));
  };

  const addPartRow = () => {
    setItems((prev) => [...prev, { partId: "", quantity: 1 }]);
  };

  const removePartRow = (index: number) => {
    setItems((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const contactPayload = {
    name: customerName,
    phone,
    email,
    address,
    preferredDate,
    preferredTime,
    notes: notes.trim() || undefined,
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!isValidPhone(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (isApplianceEnquiry) {
      if (!selectedAppliance) {
        setError("Product could not be loaded. Please try again from the product page.");
        return;
      }
    } else {
      const normalizedItems = items
        .filter((item) => item.partId)
        .map((item) => ({
          partId: item.partId,
          quantity: Math.max(1, item.quantity),
        }));

      if (normalizedItems.length === 0) return;
    }

    setIsSubmitting(true);

    let authToken = token;
    try {
      if (!user || !authToken) {
        authToken = await continueWithPhone(phone, customerName);
      }

      if (!isApplianceEnquiry) {
        const normalizedItems = items
          .filter((item) => item.partId)
          .map((item) => ({
            partId: item.partId,
            quantity: Math.max(1, item.quantity),
          }));

        const res = await fetch(`${API_URL}/part-orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            orderType: "part",
            contactData: contactPayload,
            items: normalizedItems,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(
            Array.isArray(err.message)
              ? err.message.join(", ")
              : err.message || "Failed to submit order",
          );
        }

        router.push("/my-bookings?success=true&tab=parts");
        return;
      }

      const res = await fetch(`${API_URL}/part-orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          orderType: "appliance",
          contactData: contactPayload,
          applianceItem: {
            applianceId: selectedAppliance!.id,
            slug: selectedAppliance!.slug,
            name: selectedAppliance!.name,
            brand: selectedAppliance!.brand,
            modelNumber: selectedAppliance!.modelNumber,
            price: selectedAppliance!.price,
            quantity: Math.max(1, applianceQuantity),
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(
          Array.isArray(err.message)
            ? err.message.join(", ")
            : err.message || "Failed to submit enquiry",
        );
      }

      router.push("/my-bookings?success=true&tab=appliances");
    } catch (e: unknown) {
      console.error(e);
      setError(
        e instanceof Error ? e.message : "Something went wrong. Please try again.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="p-4 rounded-2xl bg-error/10 border border-error/20 flex items-center gap-3 text-error text-sm font-bold">
          <span className="material-symbols-outlined text-lg">error</span>
          {error}
        </div>
      )}

      {applianceLoadError && isApplianceEnquiry && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
          This product could not be loaded. Please return to the catalogue and try
          again.
        </div>
      )}

      {isApplianceEnquiry && selectedAppliance ? (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3">
            Selected Product
          </p>
          <div className="flex gap-4">
            {selectedAppliance.images?.[0] && (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white border border-outline shrink-0">
                <Image
                  src={selectedAppliance.images[0]}
                  alt={selectedAppliance.name}
                  fill
                  className="object-contain p-1"
                  sizes="80px"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-on-surface leading-snug">
                {selectedAppliance.name}
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                {selectedAppliance.brand} · {selectedAppliance.capacityTon} Ton ·{" "}
                {selectedAppliance.starRating}-Star
              </p>
              <p className="mt-2 text-lg font-headline font-bold text-primary">
                ₹{selectedAppliance.price.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-2 max-w-[140px]">
            <label className="block font-label text-[10px] uppercase tracking-widest font-black text-on-surface-variant">
              Quantity
            </label>
            <input
              type="number"
              min={1}
              value={applianceQuantity}
              onChange={(event) => {
                const qty = Number.parseInt(event.target.value, 10);
                setApplianceQuantity(Number.isNaN(qty) ? 1 : Math.max(1, qty));
              }}
              className="w-full h-12 bg-white border-2 border-outline rounded-xl px-4 outline-none focus:border-primary"
            />
          </div>
          <p className="mt-3 text-sm text-on-surface-variant">
            Our team will confirm availability, final pricing, and installation
            scheduling after you submit.
          </p>
        </div>
      ) : !isApplianceEnquiry ? (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            Selected spare parts
          </p>
          <p className="mt-1 text-sm text-on-surface-variant">
            {selectedPartCount > 0
              ? `${selectedPartCount} part(s) selected`
              : "Select at least one part"}
          </p>
        </div>
      ) : null}

      {!isApplianceEnquiry &&
        items.map((item, index) => (
          <div
            key={`part-row-${index}`}
            className="grid grid-cols-1 md:grid-cols-[1fr_130px_40px] gap-3 items-end"
          >
            <div className="space-y-2">
              <label className="block font-label text-[10px] uppercase tracking-widest font-black text-on-surface-variant">
                Spare Part {index + 1}
              </label>
              <select
                required={index === 0}
                value={item.partId}
                onChange={(event) =>
                  updateItem(index, { ...item, partId: event.target.value })
                }
                className="w-full h-12 bg-surface-container-low border-2 border-outline rounded-xl px-4 appearance-none outline-none focus:border-primary transition-all duration-200 text-on-surface font-medium"
              >
                <option value="">Select a spare part...</option>
                {availableParts.map((part) => (
                  <option key={part._id} value={part._id}>
                    {part.name}
                    {part.brandSlug ? ` (${part.brandSlug})` : ""} — ₹
                    {((part.price || 0) / 100).toFixed(0)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block font-label text-[10px] uppercase tracking-widest font-black text-on-surface-variant">
                Qty
              </label>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(event) => {
                  const qty = Number.parseInt(event.target.value, 10);
                  updateItem(index, {
                    ...item,
                    quantity: Number.isNaN(qty) ? 1 : qty,
                  });
                }}
                className="w-full h-12 bg-surface-container-low border-2 border-outline rounded-xl px-4 outline-none focus:border-primary"
              />
            </div>

            <button
              type="button"
              onClick={() => removePartRow(index)}
              disabled={items.length === 1}
              className="h-10 w-10 rounded-full border border-outline text-on-surface-variant hover:bg-surface-container disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        ))}

      {!isApplianceEnquiry && (
        <button
          type="button"
          onClick={addPartRow}
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary"
        >
          <span className="material-symbols-outlined text-base">add_circle</span>
          Add Another Part
        </button>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block font-label text-[10px] uppercase tracking-widest font-black text-on-surface-variant">
            Full Name
          </label>
          <input
            required
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Your Name"
            className="w-full h-12 bg-surface-container-low border-2 border-outline rounded-xl px-4 outline-none focus:border-primary"
          />
        </div>
        <div className="space-y-2">
          <label className="block font-label text-[10px] uppercase tracking-widest font-black text-on-surface-variant">
            Phone Number
          </label>
          <input
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+91 00000 00000"
            className="w-full h-12 bg-surface-container-low border-2 border-outline rounded-xl px-4 outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block font-label text-[10px] uppercase tracking-widest font-black text-on-surface-variant">
            Email
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@email.com"
            className="w-full h-12 bg-surface-container-low border-2 border-outline rounded-xl px-4 outline-none focus:border-primary"
          />
        </div>
        <div className="space-y-2">
          <label className="block font-label text-[10px] uppercase tracking-widest font-black text-on-surface-variant">
            Address
          </label>
          <input
            required
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="House no, Area, City"
            className="w-full h-12 bg-surface-container-low border-2 border-outline rounded-xl px-4 outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block font-label text-[10px] uppercase tracking-widest font-black text-on-surface-variant">
            Preferred Date
          </label>
          <input
            required
            type="date"
            value={preferredDate}
            onChange={(event) => setPreferredDate(event.target.value)}
            className="w-full h-12 bg-surface-container-low border-2 border-outline rounded-xl px-4 outline-none focus:border-primary"
          />
        </div>
        <div className="space-y-2">
          <label className="block font-label text-[10px] uppercase tracking-widest font-black text-on-surface-variant">
            Preferred Time
          </label>
          <input
            required
            type="time"
            value={preferredTime}
            onChange={(event) => setPreferredTime(event.target.value)}
            className="w-full h-12 bg-surface-container-low border-2 border-outline rounded-xl px-4 outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block font-label text-[10px] uppercase tracking-widest font-black text-on-surface-variant">
          Additional Notes
        </label>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder={
            isApplianceEnquiry
              ? "Room size, floor, installation preferences, or urgency"
              : "Model details, urgency, or preferred delivery notes"
          }
          rows={4}
          className="w-full bg-surface-container-low border-2 border-outline rounded-xl px-4 py-3 outline-none focus:border-primary"
        />
      </div>

      <div className="space-y-2 rounded-2xl border border-outline bg-surface-container-low p-4">
        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-on-surface-variant">
          Selected Summary
        </p>
        {isApplianceEnquiry ? (
          selectedAppliance ? (
            <ul className="space-y-1">
              <li className="text-sm text-on-surface-variant flex items-center gap-2">
                <span className="font-bold text-on-surface">
                  {selectedAppliance.name}
                </span>
                <span>× {applianceQuantity}</span>
                <span className="ml-auto font-black text-primary">
                  ₹
                  {(selectedAppliance.price * applianceQuantity).toLocaleString(
                    "en-IN",
                  )}
                </span>
              </li>
            </ul>
          ) : (
            <p className="text-sm text-on-surface-variant">No product loaded.</p>
          )
        ) : items.filter((item) => item.partId).length === 0 ? (
          <p className="text-sm text-on-surface-variant">No parts selected yet.</p>
        ) : (
          <ul className="space-y-1">
            {items
              .filter((item) => item.partId)
              .map((item, index) => {
                const matched = availableParts.find(
                  (p) => p._id === item.partId,
                );
                return (
                  <li
                    key={`${item.partId}-${index}`}
                    className="text-sm text-on-surface-variant flex items-center gap-1"
                  >
                    {matched ? (
                      <>
                        <span className="font-bold text-zinc-900">
                          {matched.name}
                        </span>
                        {matched.brandSlug && (
                          <span className="text-zinc-500 capitalize">
                            {" "}
                            ({matched.brandSlug})
                          </span>
                        )}
                        <span className="text-zinc-500"> × {item.quantity}</span>
                        <span className="ml-auto font-black text-primary">
                          ₹
                          {(
                            ((matched.price || 0) / 100) *
                            item.quantity
                          ).toFixed(0)}
                        </span>
                      </>
                    ) : (
                      <span className="text-zinc-400 italic">
                        Part ID: {item.partId.slice(-6)} × {item.quantity}
                      </span>
                    )}
                  </li>
                );
              })}
          </ul>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !canSubmit}
        className="w-full h-14 bg-primary text-on-primary rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[0.98] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
      >
        {isSubmitting ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span className="material-symbols-outlined icon-filled">
              {isApplianceEnquiry ? "mail" : "shopping_cart_checkout"}
            </span>
            {isApplianceEnquiry
              ? "Submit Appliance Enquiry"
              : "Submit Spare Part Enquiry"}
          </>
        )}
      </button>
    </form>
  );
}
