"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { API_URL } from "@/app/config";

interface BookingFormProps {
  initialServiceSlug?: string;
  onSuccess?: () => void;
  className?: string;
}

export default function BookingForm({ initialServiceSlug, onSuccess, className = "" }: BookingFormProps) {
  const { user, token } = useAuth();
  const router = useRouter();

  const [services, setServices] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    serviceId: "", // This will be the _id from backend
    subCategoryId: "", // This will be the _id from backend
    name: user?.fullName || "",
    phone: user?.phone || "",
    zip: "",
    address: "",
    description: "",
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

  const selectedServiceData = services.find(s => s._id === formData.serviceId);
  const selectedSubCategory = selectedServiceData?.subCategories?.find((sc: any) => sc._id === formData.subCategoryId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user || !token) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceId: formData.serviceId,
          subCategoryId: formData.subCategoryId,
          contactPhone: formData.phone,
          addressData: {
            zip: formData.zip,
            text: formData.address
          },
          description: formData.description
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to book service");
      }

      setIsSuccess(true);
      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
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
          A master technician will call you within <span className="font-bold text-on-surface">30 minutes</span> to confirm your slot.
        </p>
        <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/10 w-full">
           <p className="text-[10px] uppercase tracking-widest font-black text-primary mb-1">Service Warranty</p>
           <p className="text-xs font-medium text-on-surface">60 Days Protection Enabled</p>
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
                <option key={sc._id} value={sc._id}>{sc.name}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Price Display */}
      {selectedSubCategory && (
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
           <div className="flex items-center justify-between">
              <div>
                 <p className="text-[9px] uppercase tracking-widest font-black text-primary">Standard Service Charge</p>
                 <p className="text-xl font-headline text-on-surface font-bold">{selectedSubCategory.price}</p>
              </div>
              <div className="text-right">
                 <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[10px] icon-filled">verified</span>
                    60 Days Warranty
                 </span>
                 <p className="text-[10px] text-on-surface-variant mt-1">Visit fee included</p>
              </div>
           </div>
        </div>
      )}

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
    </form>
  );
}
