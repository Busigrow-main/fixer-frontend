"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/app/context/BookingContext";
import { useAuth } from "@/app/context/AuthContext";
import { API_URL } from "@/app/config";

interface EnquiryPartItem {
  partId: string;
  quantity: number;
}

interface SparePartsEnquiryFormProps {
  initialPartId?: string;
  availableParts: any[];
}

export default function SparePartsEnquiryForm({
  initialPartId,
  availableParts = [],
}: SparePartsEnquiryFormProps) {
  const router = useRouter();
  const { createPartInquiry } = useBooking();
  const { user, token } = useAuth();

  const [items, setItems] = useState<EnquiryPartItem[]>([
    { partId: initialPartId ?? "", quantity: 1 },
  ]);
  
  // Auto-populate form if user is logged in
  const [customerName, setCustomerName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [address, setAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Sync state if user loads after component mount
  React.useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.fullName || "");
      if (!phone) setPhone(user.phone || "");
      if (!email) setEmail(user.email || "");
    }
  }, [user]);

  const selectedCount = useMemo(
    () => items.filter((item) => item.partId).length,
    [items],
  );

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

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!user || !token) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    const normalizedItems = items
      .filter((item) => item.partId)
      .map((item) => ({
        partId: item.partId,
        quantity: Math.max(1, item.quantity),
      }));

    if (normalizedItems.length === 0) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/part-orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contactData: {
            name: customerName,
            phone,
            email,
            address,
          },
          items: normalizedItems,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to submit order");
      }

      router.push("/my-bookings?success=true");
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Something went wrong. Please try again.");
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
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
          Selected spare parts
        </p>
        <p className="mt-1 text-sm text-on-surface-variant">
          {selectedCount > 0
            ? `${selectedCount} part(s) selected`
            : "Select at least one part"}
        </p>
      </div>

      {items.map((item, index) => (
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
                  {part.name} - {part.price}
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

      <button
        type="button"
        onClick={addPartRow}
        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary"
      >
        <span className="material-symbols-outlined text-base">add_circle</span>
        Add Another Part
      </button>

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
          placeholder="Model details, urgency, or preferred delivery notes"
          rows={4}
          className="w-full bg-surface-container-low border-2 border-outline rounded-xl px-4 py-3 outline-none focus:border-primary"
        />
      </div>

      <div className="space-y-2 rounded-2xl border border-outline bg-surface-container-low p-4">
        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-on-surface-variant">
          Selected Summary
        </p>
        {items.filter((item) => item.partId).length === 0 ? (
          <p className="text-sm text-on-surface-variant">
            No parts selected yet.
          </p>
        ) : (
          <ul className="space-y-1">
            {items
              .filter((item) => item.partId)
              .map((item, index) => {
                const matched = availableParts.find((p) => p._id === item.partId);
                return (
                  <li
                    key={`${item.partId}-${index}`}
                    className="text-sm text-on-surface-variant"
                  >
                    {matched?.name ?? "Unknown part"} x {item.quantity}
                  </li>
                );
              })}
          </ul>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || selectedCount === 0}
        className="w-full h-14 bg-primary text-on-primary rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[0.98] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
      >
        {isSubmitting ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span className="material-symbols-outlined icon-filled">
              shopping_cart_checkout
            </span>
            Submit Spare Part Enquiry
          </>
        )}
      </button>
    </form>
  );
}
