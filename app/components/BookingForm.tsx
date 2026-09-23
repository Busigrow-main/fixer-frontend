"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useBooking } from "@/app/context/BookingContext";
import { useRouter } from "next/navigation";
import { API_URL } from "@/app/config";
import { isValidPhone } from "@/app/lib/auth";
import { APPLIANCE_BRANDS, OTHER_BRAND } from "@/app/lib/appliance-brands";

interface BookingFormProps {
  initialServiceSlug?: string;
  onSuccess?: () => void;
  className?: string;
}

export default function BookingForm({ initialServiceSlug, onSuccess, className = "" }: BookingFormProps) {
  const { user, token, continueWithPhone } = useAuth();
  const router = useRouter();
  const { resumeDraft, clearResumeDraft } = useBooking();

  const [services, setServices] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    serviceId: "", // This will be the _id from backend
    subCategoryId: "", // This will be the _id from backend
    brand: "",
    brandOther: "",
    name: user?.fullName || "",
    phone: user?.phone || "",
    zip: "",
    address: "",
    description: "",
    preferredVisitDate: "",
    preferredVisitSlot: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // Fetch services on mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${API_URL}/services`);
        if (res.ok) {
          const data = await res.json();
          setServices(data);
          
          // Handle initial service slug if provided
          if (initialServiceSlug) {
            const matched = data.find((s: any) => s.slug === initialServiceSlug);
            if (matched) {
              setFormData(prev => ({ ...prev, serviceId: matched._id }));
            }
          }
        }
      } catch (err) {
        console.error("Failed to load services:", err);
      }
    };
    fetchServices();
  }, [initialServiceSlug]);

  // Sync user info if it loads later
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.fullName || "",
        phone: prev.phone || user.phone || ""
      }));
    }
  }, [user]);

  // Apply one-shot resume from pending booking (after auth → "Edit details").
  useEffect(() => {
    if (!resumeDraft || services.length === 0) return;
    setFormData((prev) => ({
      ...prev,
      serviceId: resumeDraft.serviceId,
      subCategoryId: resumeDraft.subCategoryId,
      brand: resumeDraft.brand || prev.brand,
      name: resumeDraft.name || prev.name,
      phone: resumeDraft.phone || prev.phone,
      zip: resumeDraft.zip,
      address: resumeDraft.address,
      description: resumeDraft.description,
      preferredVisitDate: resumeDraft.preferredVisitDate || prev.preferredVisitDate,
      preferredVisitSlot: resumeDraft.preferredVisitSlot || prev.preferredVisitSlot,
    }));
    clearResumeDraft();
  }, [resumeDraft, services.length, clearResumeDraft]);

  const selectedServiceData = services.find(s => s._id === formData.serviceId);
  const selectedSubCategory = selectedServiceData?.subCategories?.find((sc: any) => sc._id === formData.subCategoryId);

  const resolvedBrand =
    formData.brand === OTHER_BRAND ? formData.brandOther.trim() : formData.brand.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedServiceData || !selectedSubCategory) {
      setError("Please select a valid specific service before booking.");
      return;
    }

    if (!isValidPhone(formData.phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (!formData.brand) {
      setError("Please select your appliance brand.");
      return;
    }

    if (formData.brand === OTHER_BRAND && !resolvedBrand) {
      setError("Please enter your appliance brand name.");
      return;
    }

    setIsSubmitting(true);

    let authToken = token;
    try {
      if (!user || !authToken) {
        authToken = await continueWithPhone(formData.phone, formData.name);
      }

      const res = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          serviceId: formData.serviceId,
          subCategoryId: formData.subCategoryId,
          contactPhone: formData.phone,
          productDetails: {
            brand: resolvedBrand,
          },
          addressData: {
            zip: formData.zip,
            text: formData.address,
          },
          description: formData.description,
          ...(formData.preferredVisitDate
            ? { preferredVisitDate: formData.preferredVisitDate }
            : {}),
          ...(formData.preferredVisitSlot
            ? { preferredVisitSlot: formData.preferredVisitSlot }
            : {}),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to book service");
      }

      setIsSuccess(true);
      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-primary text-4xl icon-filled">check_circle</span>
        </div>
        <h3 className="font-headline text-2xl text-on-surface mb-2">Request Received!</h3>
        <p className="text-on-surface-variant max-w-xs mx-auto text-sm">
          Nearby technicians have been notified. Someone will pick up your request shortly — usually within{' '}
          <span className="font-bold text-on-surface">10 minutes</span>.
        </p>
        <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/10 w-full space-y-2">
           <p className="text-[10px] uppercase tracking-widest font-black text-primary mb-1">Service Warranty</p>
           <p className="text-xs font-medium text-on-surface">
             60-day warranty included — activates when your job is completed.
           </p>
           <a href="/warranty" className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-1">
             View warranty policy
             <span className="material-symbols-outlined text-sm">arrow_forward</span>
           </a>
        </div>
        <button 
          onClick={() => router.push('/my-bookings')}
          className="mt-8 text-xs font-black uppercase tracking-widest text-primary hover:underline"
        >
          View My Bookings
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {error && (
        <div className="p-4 rounded-2xl bg-error/10 border border-error/20 flex items-center gap-3 text-error text-sm font-bold">
          <span className="material-symbols-outlined text-lg">error</span>
          {error}
        </div>
      )}

      {/* Service & Subcategory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Category */}
        <div className="space-y-2">
          <label htmlFor="service" className="block font-label text-[10px] uppercase tracking-widest font-black text-on-surface-variant">
            Appliance Category
          </label>
          <div className="relative group">
            <select
              id="service"
              required
              value={formData.serviceId}
              onChange={(e) => setFormData({ ...formData, serviceId: e.target.value, subCategoryId: "" })}
              className="w-full h-13 bg-surface-container-low border-2 border-outline rounded-xl px-4 appearance-none outline-none focus:border-primary transition-all duration-200 text-on-surface font-medium"
            >
              <option value="" disabled>Select category...</option>
              {services.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
              expand_more
            </span>
          </div>
        </div>

        {/* Subcategory */}
        <div className={`space-y-2 transition-all duration-300 ${formData.serviceId ? "opacity-100 translate-y-0" : "opacity-40 pointer-events-none translate-y-1"}`}>
          <label htmlFor="subcategory" className="block font-label text-[10px] uppercase tracking-widest font-black text-on-surface-variant">
            Specific Service
          </label>
          <div className="relative group">
            <select
              id="subcategory"
              required
              value={formData.subCategoryId}
              onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
              className="w-full h-13 bg-surface-container-low border-2 border-outline rounded-xl px-4 appearance-none outline-none focus:border-primary transition-all duration-200 text-on-surface font-medium"
            >
              <option value="" disabled>Select type...</option>
              {selectedServiceData?.subCategories?.map((sc: any) => (
                <option key={sc._id} value={sc._id}>
                  {sc.name}{sc.price ? ` — ${sc.price}` : ""}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Brand */}
      <div className={`space-y-2 transition-all duration-300 ${formData.serviceId ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
        <label htmlFor="brand" className="block font-label text-[10px] uppercase tracking-widest font-black text-on-surface-variant">
          Appliance Brand
        </label>
        <div className="relative group">
          <select
            id="brand"
            required
            value={formData.brand}
            onChange={(e) =>
              setFormData({
                ...formData,
                brand: e.target.value,
                brandOther: e.target.value === OTHER_BRAND ? formData.brandOther : "",
              })
            }
            className="w-full h-13 bg-surface-container-low border-2 border-outline rounded-xl px-4 appearance-none outline-none focus:border-primary transition-all duration-200 text-on-surface font-medium"
          >
            <option value="" disabled>
              Select brand...
            </option>
            {APPLIANCE_BRANDS.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
            expand_more
          </span>
        </div>
        {formData.brand === OTHER_BRAND ? (
          <input
            type="text"
            required
            placeholder="Enter brand name"
            value={formData.brandOther}
            onChange={(e) => setFormData({ ...formData, brandOther: e.target.value })}
            className="w-full h-13 bg-surface-container-low border-2 border-outline rounded-xl px-4 outline-none focus:border-primary transition-all duration-200 text-on-surface"
          />
        ) : null}
      </div>

      {/* Dynamic Price Display */}
      {selectedSubCategory && (
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
           <div className="flex items-center justify-between gap-3">
              <div>
                 <p className="text-[9px] uppercase tracking-widest font-black text-primary">Standard Service Charge</p>
                 <p className="text-xl font-headline text-on-surface font-bold">{selectedSubCategory.price}</p>
              </div>
              <div className="text-right">
                 <a
                   href="/warranty"
                   className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider hover:bg-green-200 transition-colors"
                 >
                    <span className="material-symbols-outlined text-[10px] icon-filled">verified</span>
                    60 Days Warranty
                 </a>
                 <p className="text-[10px] text-on-surface-variant mt-1">Visit fee included in this charge</p>
              </div>
           </div>
           <p className="text-[11px] text-on-surface-variant leading-relaxed border-t border-primary/10 pt-3">
             Base charge covers the technician visit and standard labour for this service.
             Spare parts or additional repairs, if needed, are diagnosed on site, priced before work proceeds, and added only with your confirmation.
             {" "}
             <a href="/warranty" className="text-primary font-semibold hover:underline">Warranty terms</a>
             {" · "}
             <a href="/terms" className="text-primary font-semibold hover:underline">Pricing terms</a>
           </p>
        </div>
      )}

      {/* Preferred visit window */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label htmlFor="preferredVisitDate" className="block font-label text-[10px] uppercase tracking-widest font-black text-on-surface-variant">
            Preferred visit date <span className="opacity-50 normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id="preferredVisitDate"
            type="date"
            value={formData.preferredVisitDate}
            onChange={(e) => setFormData({ ...formData, preferredVisitDate: e.target.value })}
            className="w-full h-13 bg-surface-container-low border-2 border-outline rounded-xl px-4 outline-none focus:border-primary transition-all duration-200 text-on-surface"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="preferredVisitSlot" className="block font-label text-[10px] uppercase tracking-widest font-black text-on-surface-variant">
            Preferred time window
          </label>
          <div className="relative">
            <select
              id="preferredVisitSlot"
              value={formData.preferredVisitSlot}
              onChange={(e) => setFormData({ ...formData, preferredVisitSlot: e.target.value })}
              className="w-full h-13 bg-surface-container-low border-2 border-outline rounded-xl px-4 appearance-none outline-none focus:border-primary transition-all duration-200 text-on-surface font-medium"
            >
              <option value="">Any time</option>
              <option value="MORNING">Morning (8am–12pm)</option>
              <option value="AFTERNOON">Afternoon (12pm–4pm)</option>
              <option value="EVENING">Evening (4pm–8pm)</option>
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Grid for Name & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label htmlFor="name" className="block font-label text-[10px] uppercase tracking-widest font-black text-on-surface-variant">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            required
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-13 bg-surface-container-low border-2 border-outline rounded-xl px-4 outline-none focus:border-primary transition-all duration-200 text-on-surface"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="phone" className="block font-label text-[10px] uppercase tracking-widest font-black text-on-surface-variant">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            required
            placeholder="+91 00000-00000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full h-13 bg-surface-container-low border-2 border-outline rounded-xl px-4 outline-none focus:border-primary transition-all duration-200 text-on-surface"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-5">
        <div className="space-y-2">
          <label htmlFor="zip" className="block font-label text-[10px] uppercase tracking-widest font-black text-on-surface-variant">
            Pincode
          </label>
          <input
            id="zip"
            type="text"
            required
            placeholder="000000"
            value={formData.zip}
            onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
            className="w-full h-13 bg-surface-container-low border-2 border-outline rounded-xl px-4 outline-none focus:border-primary"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="address" className="block font-label text-[10px] uppercase tracking-widest font-black text-on-surface-variant">
            Complete Address
          </label>
          <input
            id="address"
            type="text"
            required
            placeholder="House no, Building, Area"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full h-13 bg-surface-container-low border-2 border-outline rounded-xl px-4 outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block font-label text-[10px] uppercase tracking-widest font-black text-on-surface-variant">
          Problem Description
        </label>
        <textarea
          id="description"
          rows={3}
          placeholder="What's happening with your appliance?"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-surface-container-low border-2 border-outline rounded-xl px-4 py-3 outline-none focus:border-primary transition-all duration-200 text-on-surface"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-14 bg-primary text-on-primary rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[0.98] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
      >
        {isSubmitting ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span className="material-symbols-outlined icon-filled">bolt</span>
            Book Master Service
          </>
        )}
      </button>
      {!user && (
        <p className="text-center text-xs text-on-surface-variant -mt-2">
          We&apos;ll use your mobile number to save this booking — no password needed.
        </p>
      )}
    </form>
  );
}
