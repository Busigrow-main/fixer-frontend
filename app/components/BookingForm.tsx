"use client";

import React, { useState, useEffect, useRef } from "react";
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

export default function BookingForm({
  initialServiceSlug,
  onSuccess,
  className = "",
}: BookingFormProps) {
  const { user, token, continueWithPhone } = useAuth();
  const router = useRouter();
  const { resumeDraft, clearResumeDraft } = useBooking();

  const [services, setServices] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    serviceId: "",
    subCategoryId: "",
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
  const errorRef = useRef<HTMLDivElement>(null);

  // Today's local date, used to prevent selecting a past visit date.
  const today = new Date();

  const minVisitDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Fetch services on mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${API_URL}/services`);

        if (res.ok) {
          const data = await res.json();

          setServices(data);

          // Handle initial service slug if provided.
          // This is used when the user clicks "Book Now"
          // from a specific service card.
          if (initialServiceSlug) {
            const matched = data.find(
              (s: any) => s.slug === initialServiceSlug,
            );

            if (matched) {
              setFormData((prev) => ({
                ...prev,
                serviceId: matched._id,
                subCategoryId: "",
              }));
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
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.fullName || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  // Apply one-shot resume from pending booking
  useEffect(() => {
    if (!resumeDraft || services.length === 0) return;

    const initialService = initialServiceSlug
      ? services.find((s) => s.slug === initialServiceSlug)
      : null;

    /*
     * If this form was opened from a specific service card,
     * that service must always take priority over a resumed draft.
     *
     * This prevents a previous booking draft from changing
     * "Washing Machine Repair" into another category, for example.
     */
    const resolvedServiceId = initialService
      ? initialService._id
      : resumeDraft.serviceId;

    /*
     * Only restore the draft subcategory when it belongs to
     * the same service. If the user opened a different service
     * card, start the subcategory selection fresh.
     */
    const shouldRestoreSubCategory =
      !initialService ||
      resumeDraft.serviceId === initialService._id;

    setFormData((prev) => ({
      ...prev,
      serviceId: resolvedServiceId,
      subCategoryId: shouldRestoreSubCategory
        ? resumeDraft.subCategoryId
        : "",
      brand: resumeDraft.brand || prev.brand,
      name: resumeDraft.name || prev.name,
      phone: resumeDraft.phone || prev.phone,
      zip: resumeDraft.zip,
      address: resumeDraft.address,
      description: resumeDraft.description,
      preferredVisitDate:
        resumeDraft.preferredVisitDate &&
        resumeDraft.preferredVisitDate >= minVisitDate
          ? resumeDraft.preferredVisitDate
          : "",
      preferredVisitSlot:
        resumeDraft.preferredVisitSlot || prev.preferredVisitSlot,
    }));

    clearResumeDraft();
  }, [
    resumeDraft,
    services,
    initialServiceSlug,
    clearResumeDraft,
    minVisitDate,
  ]);

  const selectedServiceData = services.find(
    (s) => s._id === formData.serviceId,
  );

  const selectedSubCategory =
    selectedServiceData?.subCategories?.find(
      (sc: any) => sc._id === formData.subCategoryId,
    );

  /*
   * When initialServiceSlug exists and the service has been resolved,
   * the category is locked to that service.
   *
   * Normal bookings without an initialServiceSlug continue to show
   * all service categories.
   */
  const isServiceLocked =
    Boolean(initialServiceSlug) && Boolean(selectedServiceData);

  const resolvedBrand =
    formData.brand === OTHER_BRAND
      ? formData.brandOther.trim()
      : formData.brand.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const pincode = formData.zip.trim();

    if (
      formData.preferredVisitDate &&
      formData.preferredVisitDate < minVisitDate
    ) {
      setError("Please select today or a future visit date.");
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    console.log("BOOKING PINCODE SENT:", pincode);

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
        authToken = await continueWithPhone(
          formData.phone,
          formData.name,
        );
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
            ? {
                preferredVisitDate: formData.preferredVisitDate,
              }
            : {}),
          ...(formData.preferredVisitSlot
            ? {
                preferredVisitSlot: formData.preferredVisitSlot,
              }
            : {}),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to book service");
      }

      setIsSuccess(true);

      if (onSuccess) {
        setTimeout(onSuccess, 10000);
      }
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

  useEffect(() => {
    if (error) {
      requestAnimationFrame(() => {
        errorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, [error]);

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-6 sm:py-10 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mb-5 sm:mb-6">
          <span className="material-symbols-outlined text-primary text-3xl sm:text-4xl icon-filled">
            check_circle
          </span>
        </div>

        <h3 className="font-headline text-xl sm:text-2xl text-on-surface mb-2">
          Request Received!
        </h3>

        <p className="text-on-surface-variant max-w-xs mx-auto text-sm">
          Nearby technicians have been notified. Someone will pick up your
          request shortly — usually within{" "}
          <span className="font-bold text-on-surface">10 minutes</span>.
        </p>

        <div className="mt-6 sm:mt-8 p-3.5 sm:p-4 bg-primary/5 rounded-xl border border-primary/10 w-full space-y-2">
          <p className="text-[10px] uppercase tracking-widest font-black text-primary mb-1">
            Service Warranty
          </p>

          <p className="text-xs font-medium text-on-surface">
            60-day warranty included — activates when your job is completed.
          </p>

          <a
            href="/warranty"
            className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-1"
          >
            View warranty policy
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </a>
        </div>

        <button
          type="button"
          onClick={() => router.push("/my-bookings")}
          className="mt-6 text-xs font-black uppercase tracking-widest text-primary hover:underline"
        >
          View My Bookings
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`booking-form space-y-3.5 ${className}`}
    >
      {error && (
        <div
          ref={errorRef}
          className="booking-error animate-in fade-in slide-in-from-top-2"
        >
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="booking-shell">
        <div className="booking-hero">
          <div className="booking-hero-glow booking-hero-glow-one" />
          <div className="booking-hero-glow booking-hero-glow-two" />

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div>
              <div className="booking-brand">
                <span className="material-symbols-outlined icon-filled">
                  bolt
                </span>
                FIXXER
              </div>
              <h2 className="booking-title">Book a repair</h2>
              <p className="booking-subtitle">
                Simple. Fast. Done.
              </p>
            </div>

            <div className="booking-hero-icon">
              <span className="material-symbols-outlined icon-filled">
                handyman
              </span>
            </div>
          </div>

          <div className="booking-hero-line">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="booking-content">
          {/* SERVICE */}
          <section className="booking-section booking-service-section">
            <div className="booking-section-heading">
              <div className="booking-step-icon">
                <span className="material-symbols-outlined">build</span>
              </div>
              <div>
                <span className="booking-kicker">01</span>
                <h3>Service</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="booking-field">
                <label htmlFor="service">Appliance</label>
                <div className="booking-select-wrap">
                  <select
                    id="service"
                    required
                    disabled={isServiceLocked}
                    value={formData.serviceId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        serviceId: e.target.value,
                        subCategoryId: "",
                      })
                    }
                    className={`booking-input booking-select ${
                      isServiceLocked ? "booking-locked" : ""
                    }`}
                  >
                    <option value="" disabled>
                      Select appliance
                    </option>

                    {services.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  <span className="material-symbols-outlined booking-select-icon">
                    {isServiceLocked ? "lock" : "expand_more"}
                  </span>
                </div>
              </div>

              <div
                className={`booking-field ${
                  !formData.serviceId ? "booking-disabled" : ""
                }`}
              >
                <label htmlFor="subcategory">Repair type</label>

                <div className="booking-select-wrap">
                  <select
                    id="subcategory"
                    required
                    value={formData.subCategoryId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subCategoryId: e.target.value,
                      })
                    }
                    className="booking-input booking-select"
                  >
                    <option value="" disabled>
                      Select repair
                    </option>

                    {selectedServiceData?.subCategories?.map((sc: any) => (
                      <option key={sc._id} value={sc._id}>
                        {sc.name}
                        {sc.price ? ` — ${sc.price}` : ""}
                      </option>
                    ))}
                  </select>

                  <span className="material-symbols-outlined booking-select-icon">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            {isServiceLocked && selectedServiceData && (
              <div className="booking-selected">
                <span className="material-symbols-outlined icon-filled">
                  verified
                </span>
                {selectedServiceData.name} selected
              </div>
            )}
          </section>

          {/* PRICE */}
          {selectedSubCategory && (
            <div className="booking-price">
              <div className="booking-price-left">
                <div className="booking-price-icon">
                  <span className="material-symbols-outlined icon-filled">
                    receipt_long
                  </span>
                </div>

                <div>
                  <span className="booking-price-label">Starting charge</span>
                  <div className="booking-price-value">
                    {selectedSubCategory.price}
                    <span>visit + labour</span>
                  </div>
                </div>
              </div>

              <a href="/warranty" className="booking-warranty">
                <span className="material-symbols-outlined icon-filled">
                  verified
                </span>
                60 days
              </a>
            </div>
          )}

          {/* APPLIANCE */}
          <section className="booking-section">
            <div className="booking-section-heading">
              <div className="booking-step-icon">
                <span className="material-symbols-outlined">
                  devices_other
                </span>
              </div>
              <div>
                <span className="booking-kicker">02</span>
                <h3>Appliance</h3>
              </div>
            </div>

            <div
              className={
                !formData.serviceId ? "booking-disabled" : ""
              }
            >
              <div className="booking-field">
                <label htmlFor="brand">Brand</label>

                <div className="booking-select-wrap">
                  <select
                    id="brand"
                    required
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        brand: e.target.value,
                        brandOther:
                          e.target.value === OTHER_BRAND
                            ? formData.brandOther
                            : "",
                      })
                    }
                    className="booking-input booking-select"
                  >
                    <option value="" disabled>
                      Select brand
                    </option>

                    {APPLIANCE_BRANDS.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>

                  <span className="material-symbols-outlined booking-select-icon">
                    expand_more
                  </span>
                </div>
              </div>

              {formData.brand === OTHER_BRAND && (
                <input
                  type="text"
                  required
                  placeholder="Enter brand name"
                  value={formData.brandOther}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      brandOther: e.target.value,
                    })
                  }
                  className="booking-input mt-3 animate-in fade-in slide-in-from-top-1"
                />
              )}
            </div>
          </section>

          {/* VISIT */}
          <section className="booking-section">
            <div className="booking-section-heading">
              <div className="booking-step-icon">
                <span className="material-symbols-outlined">
                  calendar_month
                </span>
              </div>
              <div>
                <span className="booking-kicker">03</span>
                <h3>Visit</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="booking-field">
                <label htmlFor="preferredVisitDate">
                  Date <span>optional</span>
                </label>

                <input
                  id="preferredVisitDate"
                  type="date"
                  min={minVisitDate}
                  value={formData.preferredVisitDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferredVisitDate: e.target.value,
                    })
                  }
                  className="booking-input"
                />
              </div>

              <div className="booking-field">
                <label htmlFor="preferredVisitSlot">
                  Time <span>optional</span>
                </label>

                <div className="booking-select-wrap">
                  <select
                    id="preferredVisitSlot"
                    value={formData.preferredVisitSlot}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferredVisitSlot: e.target.value,
                      })
                    }
                    className="booking-input booking-select"
                  >
                    <option value="">Any time</option>
                    <option value="MORNING">Morning · 8am–12pm</option>
                    <option value="AFTERNOON">
                      Afternoon · 12pm–4pm
                    </option>
                    <option value="EVENING">Evening · 4pm–8pm</option>
                  </select>

                  <span className="material-symbols-outlined booking-select-icon">
                    expand_more
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* CONTACT */}
          <section className="booking-section">
            <div className="booking-section-heading">
              <div className="booking-step-icon">
                <span className="material-symbols-outlined">person</span>
              </div>
              <div>
                <span className="booking-kicker">04</span>
                <h3>Your details</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="booking-field">
                <label htmlFor="name">Name</label>

                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  className="booking-input"
                />
              </div>

              <div className="booking-field">
                <label htmlFor="phone">Mobile</label>

                <input
                  id="phone"
                  type="tel"
                  required
                  inputMode="tel"
                  placeholder="+91 00000-00000"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                  className="booking-input"
                />
              </div>
            </div>
          </section>

          {/* LOCATION */}
          <section className="booking-section">
            <div className="booking-section-heading">
              <div className="booking-step-icon">
                <span className="material-symbols-outlined">
                  location_on
                </span>
              </div>
              <div>
                <span className="booking-kicker">05</span>
                <h3>Location</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[108px_1fr] gap-3">
              <div className="booking-field">
                <label htmlFor="zip">Pincode</label>

                <input
                  id="zip"
                  type="text"
                  required
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={formData.zip}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      zip: e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6),
                    })
                  }
                  className="booking-input booking-pincode"
                />
              </div>

              <div className="booking-field">
                <label htmlFor="address">Address</label>

                <input
                  id="address"
                  type="text"
                  required
                  placeholder="House no, building, area"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: e.target.value,
                    })
                  }
                  className="booking-input"
                />
              </div>
            </div>
          </section>

          {/* PROBLEM */}
          <section className="booking-section booking-problem">
            <div className="booking-section-heading">
              <div className="booking-step-icon">
                <span className="material-symbols-outlined">
                  edit_note
                </span>
              </div>
              <div>
                <span className="booking-kicker">06</span>
                <h3>Problem</h3>
              </div>
            </div>

            <div className="booking-field">
              <textarea
                id="description"
                rows={3}
                placeholder="Tell us briefly what's happening..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                className="booking-input booking-textarea"
              />
            </div>
          </section>
        </div>
      </div>

      {/* CTA */}
      <div className="booking-submit-wrap">
        <button
          type="submit"
          disabled={isSubmitting}
          className="booking-submit"
        >
          <span className="booking-submit-shine" />

          {isSubmitting ? (
            <>
              <span className="booking-spinner" />
              Booking...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined icon-filled">
                bolt
              </span>
              Book my repair
              <span className="material-symbols-outlined booking-submit-arrow">
                arrow_forward
              </span>
            </>
          )}
        </button>

        <div className="booking-secure">
          <span className="material-symbols-outlined">lock</span>
          Secure booking <i /> No payment required
        </div>
      </div>

      {!user && (
        <p className="booking-login-note">
          Your mobile number is used to save and manage your booking.
        </p>
      )}

      <style jsx>{`
        .booking-shell {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(24, 24, 27, 0.08);
          border-radius: 24px;
          background: #ffffff;
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.07),
            0 2px 8px rgba(0, 0, 0, 0.025);
        }

        .booking-hero {
          position: relative;
          overflow: hidden;
          padding: 22px 22px 18px;
          color: #ffffff;
          background:
            radial-gradient(circle at 85% 20%, rgba(255, 255, 255, 0.1), transparent 28%),
            linear-gradient(135deg, #111111 0%, #191919 55%, #101010 100%);
        }

        .booking-hero-glow {
          position: absolute;
          width: 150px;
          height: 150px;
          border-radius: 999px;
          pointer-events: none;
          filter: blur(45px);
        }

        .booking-hero-glow-one {
          right: -65px;
          top: -85px;
          background: rgba(255, 255, 255, 0.1);
        }

        .booking-hero-glow-two {
          left: 30%;
          bottom: -125px;
          background: rgba(255, 255, 255, 0.045);
        }

        .booking-brand {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 7px;
          color: rgba(255, 255, 255, 0.48);
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.2em;
        }

        .booking-brand .material-symbols-outlined {
          color: var(--primary, #ff6b35);
          font-size: 14px;
        }

        .booking-title {
          margin: 0;
          font-family: var(--font-headline, inherit);
          font-size: clamp(24px, 5vw, 30px);
          font-weight: 700;
          line-height: 0.98;
          letter-spacing: -0.045em;
        }

        .booking-subtitle {
          margin: 8px 0 0;
          color: rgba(255, 255, 255, 0.43);
          font-size: 10px;
          line-height: 1.4;
        }

        .booking-hero-icon {
          display: flex;
          width: 54px;
          height: 54px;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 17px;
          background: rgba(255, 255, 255, 0.055);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .booking-hero-icon .material-symbols-outlined {
          color: var(--primary, #ff6b35);
          font-size: 27px;
        }

        .booking-hero-line {
          position: relative;
          display: flex;
          gap: 5px;
          margin-top: 20px;
        }

        .booking-hero-line span {
          height: 3px;
          flex: 1;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
        }

        .booking-hero-line span:first-child {
          background: var(--primary, #ff6b35);
        }

        .booking-content {
          background:
            linear-gradient(
              180deg,
              #ffffff 0%,
              #ffffff 65%,
              #fcfcfb 100%
            );
        }

        .booking-section {
          padding: 21px 22px;
          border-bottom: 1px solid #f0f0f0;
        }

        .booking-service-section {
          padding-top: 23px;
        }

        .booking-problem {
          border-bottom: 0;
        }

        .booking-section-heading {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 16px;
        }

        .booking-step-icon {
          display: flex;
          width: 37px;
          height: 37px;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid #ededed;
          border-radius: 12px;
          background: #fafafa;
          color: #27272a;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.025);
        }

        .booking-step-icon .material-symbols-outlined {
          font-size: 19px;
        }

        .booking-kicker {
          display: block;
          margin-bottom: 1px;
          color: var(--primary, #ff6b35);
          font-size: 8px;
          font-weight: 900;
          line-height: 1;
          letter-spacing: 0.18em;
        }

        .booking-section-heading h3 {
          margin: 0;
          color: #18181b;
          font-family: var(--font-headline, inherit);
          font-size: 17px;
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.025em;
        }

        .booking-field label {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-bottom: 7px;
          color: #71717a;
          font-size: 9px;
          font-weight: 900;
          line-height: 1;
          letter-spacing: 0.105em;
          text-transform: uppercase;
        }

        .booking-field label span {
          color: #a1a1aa;
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 0;
          text-transform: lowercase;
        }

        .booking-input {
          width: 100%;
          height: 49px;
          border: 1px solid #e4e4e7;
          border-radius: 14px;
          background: #fafafa;
          padding: 0 14px;
          color: #18181b;
          font-size: 13px;
          font-weight: 500;
          outline: none;
          transition:
            border-color 180ms ease,
            background 180ms ease,
            box-shadow 180ms ease,
            transform 180ms ease;
        }

        .booking-input::placeholder {
          color: #a1a1aa;
        }

        .booking-input:hover {
          border-color: #d4d4d8;
        }

        .booking-input:focus {
          border-color: var(--primary, #ff6b35);
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.09);
        }

        .booking-input:disabled {
          cursor: not-allowed;
        }

        .booking-select-wrap {
          position: relative;
        }

        .booking-select {
          appearance: none;
          cursor: pointer;
          padding-right: 42px;
        }

        .booking-select-icon {
          position: absolute;
          right: 13px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #a1a1aa;
          font-size: 19px;
        }

        .booking-locked {
          border-color: rgba(255, 107, 53, 0.2);
          background: rgba(255, 107, 53, 0.045);
          cursor: not-allowed;
        }

        .booking-locked + .booking-select-icon {
          color: var(--primary, #ff6b35);
        }

        .booking-disabled {
          opacity: 0.46;
        }

        .booking-selected {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: 8px;
          color: var(--primary, #ff6b35);
          font-size: 8px;
          font-weight: 800;
        }

        .booking-selected .material-symbols-outlined {
          font-size: 13px;
        }

        .booking-price {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 13px 22px;
          border-bottom: 1px solid rgba(255, 107, 53, 0.1);
          background:
            linear-gradient(
              90deg,
              rgba(255, 107, 53, 0.045),
              rgba(255, 107, 53, 0.018)
            );
        }

        .booking-price-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .booking-price-icon {
          display: flex;
          width: 34px;
          height: 34px;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 11px;
          background: rgba(255, 107, 53, 0.1);
          color: var(--primary, #ff6b35);
        }

        .booking-price-icon .material-symbols-outlined {
          font-size: 17px;
        }

        .booking-price-label {
          display: block;
          margin-bottom: 2px;
          color: #a1a1aa;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .booking-price-value {
          color: #18181b;
          font-size: 14px;
          font-weight: 800;
        }

        .booking-price-value span {
          margin-left: 5px;
          color: #a1a1aa;
          font-size: 8px;
          font-weight: 500;
        }

        .booking-warranty {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
          border-radius: 999px;
          background: #effaf2;
          padding: 7px 9px;
          color: #278044;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          transition: transform 180ms ease;
        }

        .booking-warranty:hover {
          transform: translateY(-1px);
        }

        .booking-warranty .material-symbols-outlined {
          font-size: 12px;
        }

        .booking-textarea {
          height: auto;
          min-height: 92px;
          padding-top: 13px;
          padding-bottom: 13px;
          resize: vertical;
          line-height: 1.55;
        }

        .booking-pincode {
          letter-spacing: 0.08em;
          font-weight: 700;
        }

        .booking-submit-wrap {
          margin-top: 13px;
          padding: 9px;
          border: 1px solid rgba(24, 24, 27, 0.08);
          border-radius: 21px;
          background: #ffffff;
          box-shadow:
            0 14px 40px rgba(0, 0, 0, 0.07),
            0 2px 8px rgba(0, 0, 0, 0.025);
        }

        .booking-submit {
          position: relative;
          display: flex;
          width: 100%;
          min-height: 56px;
          align-items: center;
          justify-content: center;
          gap: 9px;
          overflow: hidden;
          border: 0;
          border-radius: 15px;
          background: var(--primary, #ff6b35);
          color: var(--on-primary, #ffffff);
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          box-shadow:
            0 9px 22px rgba(0, 0, 0, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.16);
          cursor: pointer;
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            filter 180ms ease;
        }

        .booking-submit:hover {
          transform: translateY(-1px);
          filter: brightness(1.02);
          box-shadow:
            0 13px 28px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.16);
        }

        .booking-submit:active {
          transform: scale(0.985);
        }

        .booking-submit:disabled {
          cursor: not-allowed;
          transform: none;
          opacity: 0.55;
        }

        .booking-submit-shine {
          position: absolute;
          top: 0;
          left: -30%;
          width: 22%;
          height: 100%;
          transform: skewX(-20deg);
          background: rgba(255, 255, 255, 0.13);
          transition: left 500ms ease;
        }

        .booking-submit:hover .booking-submit-shine {
          left: 115%;
        }

        .booking-submit-arrow {
          font-size: 17px;
          transition: transform 180ms ease;
        }

        .booking-submit:hover .booking-submit-arrow {
          transform: translateX(3px);
        }

        .booking-spinner {
          width: 19px;
          height: 19px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 999px;
          animation: booking-spin 700ms linear infinite;
        }

        .booking-secure {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          margin-top: 8px;
          color: #a1a1aa;
          font-size: 8px;
          font-weight: 600;
        }

        .booking-secure .material-symbols-outlined {
          font-size: 12px;
        }

        .booking-secure i {
          width: 3px;
          height: 3px;
          border-radius: 999px;
          background: #d4d4d8;
        }

        .booking-login-note {
          margin: 8px auto 0;
          max-width: 360px;
          padding: 0 12px;
          color: #a1a1aa;
          font-size: 9px;
          line-height: 1.5;
          text-align: center;
        }

        .booking-error {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          padding: 12px 14px;
          border: 1px solid #fecaca;
          border-radius: 15px;
          background: #fef2f2;
          color: #b91c1c;
          font-size: 11px;
          font-weight: 700;
          line-height: 1.45;
        }

        .booking-error .material-symbols-outlined {
          flex-shrink: 0;
          margin-top: 1px;
          font-size: 17px;
        }

        @keyframes booking-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 639px) {
          .booking-hero {
            padding: 19px 17px 16px;
            border-radius: 20px 20px 0 0;
          }

          .booking-hero-icon {
            width: 45px;
            height: 45px;
            border-radius: 14px;
          }

          .booking-hero-icon .material-symbols-outlined {
            font-size: 23px;
          }

          .booking-title {
            font-size: 24px;
          }

          .booking-section {
            padding: 18px 16px;
          }

          .booking-section-heading {
            margin-bottom: 13px;
          }

          .booking-step-icon {
            width: 34px;
            height: 34px;
            border-radius: 11px;
          }

          .booking-section-heading h3 {
            font-size: 16px;
          }

          .booking-price {
            padding: 12px 16px;
          }

          .booking-price-value {
            font-size: 13px;
          }

          .booking-price-value span {
            display: none;
          }

          .booking-input {
            height: 50px;
            border-radius: 14px;
          }

          .booking-textarea {
            min-height: 94px;
          }

          .booking-submit-wrap {
            margin-top: 11px;
            padding: 7px;
            border-radius: 18px;
          }

          .booking-submit {
            min-height: 55px;
            border-radius: 14px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .booking-input,
          .booking-submit,
          .booking-submit-arrow,
          .booking-submit-shine,
          .booking-warranty {
            transition: none;
          }

          .booking-spinner {
            animation-duration: 1.5s;
          }
        }
      `}</style>
    </form>
  );
}
