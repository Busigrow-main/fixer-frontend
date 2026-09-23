"use client";

import React, { useState } from "react";

type LeadFormType = "business" | "technician";

interface LeadFormProps {
  type: LeadFormType;
  onSubmit?: (data: Record<string, string>) => Promise<void> | void;
}

export default function LeadForm({ type, onSubmit }: LeadFormProps) {
  const isBusiness = type === "business";

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    shopName: "",
    shopAddress: "",
    address: "",
    applianceExpertise: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const phone = formData.phone.trim();

    // Basic phone validation
    if (!/^\d{10}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (isBusiness) {
      if (!formData.shopName.trim()) {
        setError("Please enter your shop name.");
        return;
      }

      if (!formData.shopAddress.trim()) {
        setError("Please enter your shop address.");
        return;
      }
    } else {
      if (!formData.address.trim()) {
        setError("Please enter your address.");
        return;
      }

      if (!formData.applianceExpertise.trim()) {
        setError("Please select your appliance expertise.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(formData);
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-primary text-4xl icon-filled">
            check_circle
          </span>
        </div>

        <h3 className="font-headline text-2xl text-on-surface mb-2">
          {isBusiness
            ? "Business Request Received!"
            : "Technician Request Received!"}
        </h3>

        <p className="text-on-surface-variant max-w-sm mx-auto text-sm">
          Thank you for your interest. Our team will review your details and
          get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error */}
      {error && (
        <div className="p-4 rounded-2xl bg-error/10 border border-error/20 flex items-center gap-3 text-error text-sm font-bold">
          <span className="material-symbols-outlined text-lg">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Name + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Name */}
        <div className="space-y-2">
          <label
            htmlFor={`${type}-name`}
            className="block font-label text-[10px] uppercase tracking-widest font-black text-on-surface-variant"
          >
            Full Name
          </label>

          <input
            id={`${type}-name`}
            type="text"
            required
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full h-13 bg-surface-container-low border-2 border-outline rounded-xl px-4 outline-none focus:border-primary transition-all duration-200 text-on-surface"
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label
            htmlFor={`${type}-phone`}
            className="block font-label text-[10px] uppercase tracking-widest font-black text-on-surface-variant"
          >
            Phone Number
          </label>

          <input
            id={`${type}-phone`}
            type="tel"
            inputMode="numeric"
            required
            placeholder="00000 00000"
            value={formData.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className="w-full h-13 bg-surface-container-low border-2 border-outline rounded-xl px-4 outline-none focus:border-primary transition-all duration-200 text-on-surface"
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label
          htmlFor={`${type}-email`}
          className="block font-label text-[10px] uppercase tracking-widest font-black text-on-surface-variant"
        >
          Email{" "}
          <span className="normal-case tracking-normal font-medium">
            (Optional)
          </span>
        </label>

        <input
          id={`${type}-email`}
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
          className="w-full h-13 bg-surface-container-low border-2 border-outline rounded-xl px-4 outline-none focus:border-primary transition-all duration-200 text-on-surface"
        />
      </div>

      {/* Business fields */}
      {isBusiness ? (
        <>
          {/* Shop Name */}
          <div className="space-y-2">
            <label
              htmlFor="shop-name"
              className="block font-label text-[10px] uppercase tracking-widest font-black text-on-surface-variant"
            >
              Shop Name
            </label>

            <input
              id="shop-name"
              type="text"
              required
              placeholder="Your Shop Name"
              value={formData.shopName}
              onChange={(e) => updateField("shopName", e.target.value)}
              className="w-full h-13 bg-surface-container-low border-2 border-outline rounded-xl px-4 outline-none focus:border-primary transition-all duration-200 text-on-surface"
            />
          </div>

          {/* Shop Address */}
          <div className="space-y-2">
            <label
              htmlFor="shop-address"
              className="block font-label text-[10px] uppercase tracking-widest font-black text-on-surface-variant"
            >
              Shop Address
            </label>

            <textarea
              id="shop-address"
              required
              rows={3}
              placeholder="House no, building, area, landmark"
              value={formData.shopAddress}
              onChange={(e) => updateField("shopAddress", e.target.value)}
              className="w-full bg-surface-container-low border-2 border-outline rounded-xl px-4 py-3 outline-none focus:border-primary transition-all duration-200 text-on-surface resize-none"
            />
          </div>
        </>
      ) : (
        <>
          {/* Technician Address */}
          <div className="space-y-2">
            <label
              htmlFor="technician-address"
              className="block font-label text-[10px] uppercase tracking-widest font-black text-on-surface-variant"
            >
              Address
            </label>

            <textarea
              id="technician-address"
              required
              rows={3}
              placeholder="House no, building, area, landmark"
              value={formData.address}
              onChange={(e) => updateField("address", e.target.value)}
              className="w-full bg-surface-container-low border-2 border-outline rounded-xl px-4 py-3 outline-none focus:border-primary transition-all duration-200 text-on-surface resize-none"
            />
          </div>

          {/* Appliance Expertise */}
          <div className="space-y-2">
            <label
              htmlFor="appliance-expertise"
              className="block font-label text-[10px] uppercase tracking-widest font-black text-on-surface-variant"
            >
              Appliance Expertise
            </label>

            <div className="relative">
              <select
                id="appliance-expertise"
                required
                value={formData.applianceExpertise}
                onChange={(e) =>
                  updateField("applianceExpertise", e.target.value)
                }
                className="w-full h-13 bg-surface-container-low border-2 border-outline rounded-xl px-4 pr-12 appearance-none outline-none focus:border-primary transition-all duration-200 text-on-surface font-medium"
              >
                <option value="" disabled>
                  Select expertise...
                </option>
                <option value="AC">AC</option>
                <option value="Refrigerator">Refrigerator</option>
                <option value="Washing Machine">Washing Machine</option>
                <option value="TV">TV</option>
                <option value="Microwave">Microwave</option>
                <option value="Other">Other</option>
              </select>

              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                expand_more
              </span>
            </div>
          </div>
        </>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-14 bg-primary text-on-primary rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[0.98] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
      >
        {isSubmitting ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span className="material-symbols-outlined icon-filled">
              {isBusiness ? "storefront" : "engineering"}
            </span>

            {isBusiness
              ? "Partner With Us"
              : "Join As Technician"}
          </>
        )}
      </button>
    </form>
  );
}