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

const STEPS = ["Repair", "Visit", "Details"];

const SLOTS = [
  { value: "", label: "Any time", hint: "First available", icon: "schedule" },
  { value: "MORNING", label: "Morning", hint: "8am – 12pm", icon: "wb_twilight" },
  { value: "AFTERNOON", label: "Afternoon", hint: "12pm – 4pm", icon: "light_mode" },
  { value: "EVENING", label: "Evening", hint: "4pm – 8pm", icon: "bedtime" },
];

const NEXT_STEPS = [
  { icon: "notifications_active", title: "Technician assigned right away", text: "Nearby pros are notified the moment you book." },
  { icon: "call", title: "They call you to confirm", text: "Your technician contacts you before the visit." },
  { icon: "verified_user", title: "Repair + 60-day warranty", text: "Warranty starts when the job is done." },
];

const BRAND_PREVIEW = 8;

const iconFor = (name = "") => {
  const n = name.toLowerCase();
  if (/wash|laundry/.test(n)) return "local_laundry_service";
  if (/fridge|refrig/.test(n)) return "kitchen";
  if (/\bac\b|air con|cooler/.test(n)) return "ac_unit";
  if (/tv|television/.test(n)) return "tv";
  if (/micro|oven/.test(n)) return "microwave";
  if (/water|ro\b|purif/.test(n)) return "water_drop";
  if (/geyser|heater/.test(n)) return "water_heater";
  if (/fan/.test(n)) return "mode_fan";
  if (/chimney|hob|stove/.test(n)) return "oven_gen";
  return "home_repair_service";
};

const inputCls =
  "h-[52px] w-full rounded-2xl border border-zinc-200 bg-zinc-50/70 pl-11 pr-10 text-base sm:text-[15px] text-zinc-900 " +
  "placeholder:text-zinc-400 transition hover:border-zinc-300 focus:border-primary focus:bg-white focus:outline-none " +
  "focus:ring-4 focus:ring-primary/10";

const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const fromISO = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/* ---------- building blocks ---------- */

function Label({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <p className="mb-2 flex items-baseline gap-1.5 text-[13px] font-semibold text-zinc-800">
      {children}
      {optional && <span className="text-xs font-normal text-zinc-400">optional</span>}
    </p>
  );
}

function Tick() {
  return (
    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white animate-in zoom-in duration-200">
      <span className="material-symbols-outlined text-[14px]">check</span>
    </span>
  );
}

function Choice({
  active,
  onClick,
  children,
  className = "",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`relative rounded-2xl border text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 active:scale-[0.985] ${
        active
          ? "border-primary bg-primary/[0.05] shadow-[0_0_0_1px_var(--primary,#C8102E),0_8px_20px_-10px_rgba(200,16,46,0.5)]"
          : "border-zinc-200 bg-white hover:-translate-y-px hover:border-zinc-300 hover:shadow-[0_6px_16px_-10px_rgba(0,0,0,0.25)]"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function Radio({ active }: { active: boolean }) {
  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
        active ? "border-primary bg-primary" : "border-zinc-300 bg-white"
      }`}
    >
      {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
    </span>
  );
}

function IconInput({ icon, valid, children }: { icon: string; valid?: boolean; children: React.ReactNode }) {
  return (
    <div className="relative">
      <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-[15px] text-[21px] text-zinc-400">
        {icon}
      </span>
      {children}
      {valid && (
        <span className="material-symbols-outlined icon-filled pointer-events-none absolute right-3.5 top-[15px] text-[20px] text-emerald-500 animate-in zoom-in duration-200">
          check_circle
        </span>
      )}
    </div>
  );
}

function StepTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h3 className="font-headline text-[1.7rem] leading-[1.08] tracking-tight text-zinc-900">{title}</h3>
      <p className="mt-2 max-w-[34ch] text-[13.5px] leading-snug text-zinc-500">{sub}</p>
    </div>
  );
}

/* ---------- main ---------- */

export default function BookingForm({ initialServiceSlug, onSuccess, className = "" }: BookingFormProps) {
  const { user, token, continueWithPhone } = useAuth();
  const router = useRouter();
  const { resumeDraft, clearResumeDraft } = useBooking();

  const [services, setServices] = useState<any[]>([]);
  const [step, setStep] = useState(0);
  const [pickingDate, setPickingDate] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);

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
  const topRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const minVisitDate = toISO(now);
  const quickDays = [0, 1, 2].map((i) => {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    return {
      iso: toISO(d),
      top: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-IN", { weekday: "short" }),
      num: d.getDate(),
      month: d.toLocaleDateString("en-IN", { month: "short" }),
    };
  });

  const set = (patch: Partial<typeof formData>) => setFormData((p) => ({ ...p, ...patch }));

  /* ---------- data + draft ---------- */
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${API_URL}/services`);
        if (res.ok) {
          const data = await res.json();
          setServices(data);
          if (initialServiceSlug) {
            const matched = data.find((s: any) => s.slug === initialServiceSlug);
            if (matched) setFormData((p) => ({ ...p, serviceId: matched._id, subCategoryId: "" }));
          }
        }
      } catch (err) {
        console.error("Failed to load services:", err);
      }
    };
    fetchServices();
  }, [initialServiceSlug]);

  useEffect(() => {
    if (user) {
      setFormData((p) => ({
        ...p,
        name: p.name || user.fullName || "",
        phone: p.phone || user.phone || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!resumeDraft || services.length === 0) return;
    const initialService = initialServiceSlug ? services.find((s) => s.slug === initialServiceSlug) : null;
    const resolvedServiceId = initialService ? initialService._id : resumeDraft.serviceId;
    const restoreSub = !initialService || resumeDraft.serviceId === initialService._id;

    setFormData((p) => ({
      ...p,
      serviceId: resolvedServiceId,
      subCategoryId: restoreSub ? resumeDraft.subCategoryId : "",
      brand: resumeDraft.brand || p.brand,
      name: resumeDraft.name || p.name,
      phone: resumeDraft.phone || p.phone,
      zip: resumeDraft.zip,
      address: resumeDraft.address,
      description: resumeDraft.description,
      preferredVisitDate:
        resumeDraft.preferredVisitDate && resumeDraft.preferredVisitDate >= minVisitDate
          ? resumeDraft.preferredVisitDate
          : "",
      preferredVisitSlot: resumeDraft.preferredVisitSlot || p.preferredVisitSlot,
    }));
    clearResumeDraft();
  }, [resumeDraft, services, initialServiceSlug, clearResumeDraft, minVisitDate]);

  useEffect(() => {
    topRef.current?.scrollIntoView({ block: "start" });
  }, [step]);

  useEffect(() => {
    if (error) requestAnimationFrame(() => errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }, [error]);

  /* ---------- derived ---------- */
  const selectedService = services.find((s) => s._id === formData.serviceId);
  const selectedSub = selectedService?.subCategories?.find((sc: any) => sc._id === formData.subCategoryId);
  const isServiceLocked = Boolean(initialServiceSlug) && Boolean(selectedService);
  const resolvedBrand = formData.brand === OTHER_BRAND ? formData.brandOther.trim() : formData.brand.trim();

  const brandList = APPLIANCE_BRANDS.filter((b: string) => b !== OTHER_BRAND);
  const shownBrands = showAllBrands ? brandList : brandList.slice(0, BRAND_PREVIEW);

  const matchedQuick = quickDays.find((d) => d.iso === formData.preferredVisitDate);
  const dateChoice = pickingDate ? "custom" : matchedQuick ? matchedQuick.iso : formData.preferredVisitDate ? "custom" : "any";

  const visitSummary = (() => {
    const day = formData.preferredVisitDate
      ? fromISO(formData.preferredVisitDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })
      : "Any day";
    const slot = SLOTS.find((s) => s.value === formData.preferredVisitSlot)?.label || "Any time";
    return `${day} · ${slot}`;
  })();

  /* ---------- validation ---------- */
  const validate = (s: number): string => {
    if (s === 0) {
      if (!selectedService) return "Choose the appliance you need repaired.";
      if (!selectedSub) return "Choose the type of repair.";
      if (!formData.brand) return "Select your appliance brand.";
      if (formData.brand === OTHER_BRAND && !resolvedBrand) return "Enter your appliance brand name.";
    }
    if (s === 1) {
      if (formData.preferredVisitDate && formData.preferredVisitDate < minVisitDate)
        return "Please select today or a future visit date.";
    }
    if (s === 2) {
      if (!formData.name.trim()) return "Enter your name.";
      if (!isValidPhone(formData.phone)) return "Enter a valid 10-digit mobile number.";
      if (!formData.address.trim()) return "Enter your address so the technician can find you.";
      if (!/^\d{6}$/.test(formData.zip.trim())) return "Please enter a valid 6-digit pincode.";
    }
    return "";
  };

  const next = () => {
    const msg = validate(step);
    if (msg) return setError(msg);
    setError("");
    setStep((s) => s + 1);
  };

  const goTo = (i: number) => {
    if (i < step) {
      setError("");
      setStep(i);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) return next();

    for (let i = 0; i < STEPS.length; i++) {
      const msg = validate(i);
      if (msg) {
        setStep(i);
        setError(msg);
        return;
      }
    }

    setError("");
    setIsSubmitting(true);
    let authToken = token;

    try {
      if (!user || !authToken) authToken = await continueWithPhone(formData.phone, formData.name);

      const res = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          serviceId: formData.serviceId,
          subCategoryId: formData.subCategoryId,
          contactPhone: formData.phone,
          productDetails: { brand: resolvedBrand },
          addressData: { zip: formData.zip.trim(), text: formData.address },
          description: formData.description,
          ...(formData.preferredVisitDate ? { preferredVisitDate: formData.preferredVisitDate } : {}),
          ...(formData.preferredVisitSlot ? { preferredVisitSlot: formData.preferredVisitSlot } : {}),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to book service");
      }

      setIsSuccess(true);
      if (onSuccess) setTimeout(onSuccess, 10000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- success ---------- */
  if (isSuccess) {
    return (
      <div className="px-5 pb-6 pt-5 sm:px-6" role="status" aria-live="polite">
        <div className="relative overflow-hidden rounded-[24px] border border-primary/10 bg-gradient-to-b from-primary/[0.08] via-white to-white px-4 pb-5 pt-6 text-center shadow-[0_12px_30px_-22px_rgba(200,16,46,0.65)] sm:px-5">
            <span className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-secondary/[0.12] blur-2xl" aria-hidden="true" />
            <div className="relative flex flex-col items-center">
              <div className="success-ring relative mb-4 flex h-[84px] w-[84px] items-center justify-center rounded-full bg-primary-container text-primary shadow-[0_10px_24px_-14px_rgba(200,16,46,0.7)]">
                <svg viewBox="0 0 52 52" className="h-11 w-11" fill="none" aria-hidden="true">
                  <circle cx="26" cy="26" r="24" stroke="currentColor" strokeWidth="3" className="success-circle" />
                  <path d="M15 27l8 8 14-16" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="success-check" />
                </svg>
              </div>
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
                <span className="material-symbols-outlined icon-filled text-[14px]">verified</span>
                Booking confirmed
              </span>
              <h3 className="font-headline text-[1.7rem] leading-tight tracking-tight text-zinc-900">You&apos;re booked</h3>
              <p className="mt-1.5 max-w-[30ch] text-[13.5px] leading-snug text-zinc-500">
                Your repair request is in. We&apos;ll keep you posted every step of the way.
              </p>
            </div>

            <div className="relative mt-5 rounded-2xl border border-zinc-200/80 bg-white/85 px-4 py-3 text-left shadow-sm">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
                  <span className="material-symbols-outlined icon-filled text-[19px]">{iconFor(selectedService?.name)}</span>
                </span>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-zinc-400">Your appointment</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-zinc-900">
                    {selectedService?.name}
                    {selectedSub ? ` · ${selectedSub.name}` : ""}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-zinc-500">
                    <span className="material-symbols-outlined text-[15px] text-secondary">event</span>
                    {visitSummary}
                  </p>
                </div>
              </div>
            </div>
        </div>

        <div className="px-1">
            <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.1em] text-zinc-400">What happens next</p>

        <ol className="relative mt-3 space-y-4">
            <span className="absolute bottom-3 left-[17px] top-3 w-px bg-primary/15" aria-hidden="true" />
            {NEXT_STEPS.map((s, i) => (
              <li key={s.title} className="relative flex items-start gap-3">
                <span
                  className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${
                    i === 0 ? "bg-primary text-white" : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
              </span>
              <div className="pt-0.5">
                <p className="text-sm font-semibold text-zinc-900">{s.title}</p>
                <p className="text-[12.5px] leading-snug text-zinc-500">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={() => router.push("/my-bookings")}
          className="mt-6 h-[52px] w-full rounded-2xl bg-primary text-sm font-semibold text-white shadow-[0_10px_20px_-12px_rgba(200,16,46,0.9)] transition hover:bg-[#a80d26] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 active:scale-[0.99]"
        >
          View my bookings
        </button>
        <a href="/warranty" className="mt-3 block text-center text-[13px] font-semibold text-primary transition hover:text-[#a80d26] hover:underline">
          Read warranty policy
        </a>
        </div>

        <style jsx>{`
          .success-circle {
            stroke-dasharray: 151;
            stroke-dashoffset: 151;
            animation: draw 0.7s ease-out forwards;
          }
          .success-check {
            stroke-dasharray: 40;
            stroke-dashoffset: 40;
            animation: draw 0.45s 0.55s ease-out forwards;
          }
          .success-ring {
            animation: pop 0.5s ease-out;
          }
          @keyframes draw {
            to {
              stroke-dashoffset: 0;
            }
          }
          @keyframes pop {
            0% {
              transform: scale(0.7);
              opacity: 0;
            }
            60% {
              transform: scale(1.06);
              opacity: 1;
            }
            100% {
              transform: scale(1);
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .success-circle,
            .success-check {
              animation-duration: 0.01s;
              animation-delay: 0s;
            }
            .success-ring {
              animation: none;
            }
          }
        `}</style>
      </div>
    );
  }

  const isLast = step === STEPS.length - 1;

  /* ---------- form ---------- */
  return (
    <form onSubmit={handleSubmit} noValidate className={`flex min-h-full flex-col ${className}`}>
      <div ref={topRef} />

      {/* Stepper */}
      <nav aria-label="Booking progress" className="sticky top-0 z-10 bg-white/95 px-5 pb-3 pt-3 backdrop-blur sm:px-6">
        <ol className="flex items-center">
          {STEPS.map((s, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <li key={s} className={`flex items-center ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  disabled={i > step}
                  aria-current={current ? "step" : undefined}
                  className="group flex items-center gap-2 focus-visible:outline-none disabled:cursor-default"
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 group-focus-visible:ring-4 group-focus-visible:ring-primary/20 ${
                      done
                        ? "bg-primary text-white"
                        : current
                          ? "bg-primary text-white shadow-[0_0_0_4px_rgba(200,16,46,0.14)]"
                          : "bg-zinc-100 text-zinc-400"
                    }`}
                  >
                    {done ? <span className="material-symbols-outlined text-[16px]">check</span> : i + 1}
                  </span>
                  <span
                    className={`text-xs transition-colors ${
                      current ? "font-semibold text-zinc-900" : done ? "font-medium text-zinc-600" : "font-medium text-zinc-400"
                    }`}
                  >
                    {s}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <span className="mx-2.5 h-0.5 flex-1 overflow-hidden rounded-full bg-zinc-100" aria-hidden="true">
                    <span className={`block h-full rounded-full bg-primary transition-all duration-500 ease-out ${done ? "w-full" : "w-0"}`} />
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="flex-1 px-5 pb-5 pt-3 sm:px-6">
        {error && (
          <div
            ref={errorRef}
            role="alert"
            className="mb-4 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] font-medium leading-snug text-red-700 animate-in fade-in slide-in-from-top-2"
          >
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* ================= STEP 1: REPAIR ================= */}
        {step === 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-300">
            <StepTitle title="What needs fixing?" sub="Pick your appliance and the problem. Prices are starting charges." />

            <div>
              <Label>Appliance</Label>
              {isServiceLocked ? (
                <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/[0.05] p-3.5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
                    <span className="material-symbols-outlined text-[24px]">{iconFor(selectedService.name)}</span>
                  </span>
                  <span className="flex-1 text-[15px] font-semibold text-zinc-900">{selectedService.name}</span>
                  <span className="material-symbols-outlined text-[18px] text-primary">lock</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {services.map((s) => {
                    const active = formData.serviceId === s._id;
                    return (
                      <Choice
                        key={s._id}
                        active={active}
                        onClick={() => set({ serviceId: s._id, subCategoryId: "" })}
                        className="flex flex-col gap-2.5 p-3.5"
                      >
                        {active && <Tick />}
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                            active ? "bg-primary text-white" : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[22px]">{iconFor(s.name)}</span>
                        </span>
                        <span className="text-[13.5px] font-semibold leading-tight text-zinc-900">{s.name}</span>
                      </Choice>
                    );
                  })}
                  {services.length === 0 &&
                    [0, 1, 2, 3].map((i) => <div key={i} className="h-[106px] animate-pulse rounded-2xl bg-zinc-100" />)}
                </div>
              )}
            </div>

            {selectedService && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <Label>What's the issue?</Label>
                <div className="space-y-2">
                  {selectedService.subCategories?.map((sc: any) => {
                    const active = formData.subCategoryId === sc._id;
                    return (
                      <Choice
                        key={sc._id}
                        active={active}
                        onClick={() => set({ subCategoryId: sc._id })}
                        className="flex w-full items-center gap-3 px-3.5 py-3.5"
                      >
                        <Radio active={active} />
                        <span className="flex-1 text-sm font-medium text-zinc-900">{sc.name}</span>
                        {sc.price && (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold transition-colors ${
                              active ? "bg-primary text-white" : "bg-zinc-100 text-zinc-800"
                            }`}
                          >
                            {sc.price}
                          </span>
                        )}
                      </Choice>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedSub && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <Label>Brand</Label>
                <div className="flex flex-wrap gap-2">
                  {shownBrands.map((b: string) => (
                    <Choice
                      key={b}
                      active={formData.brand === b}
                      onClick={() => set({ brand: b, brandOther: "" })}
                      className="px-3.5 py-2"
                    >
                      <span className="text-[13px] font-medium text-zinc-900">{b}</span>
                    </Choice>
                  ))}
                  {!showAllBrands && brandList.length > BRAND_PREVIEW && (
                    <button
                      type="button"
                      onClick={() => setShowAllBrands(true)}
                      className="rounded-2xl px-3 py-2 text-[13px] font-semibold text-primary hover:bg-primary/5"
                    >
                      +{brandList.length - BRAND_PREVIEW} more
                    </button>
                  )}
                  <Choice
                    active={formData.brand === OTHER_BRAND}
                    onClick={() => set({ brand: OTHER_BRAND })}
                    className="px-3.5 py-2"
                  >
                    <span className="text-[13px] font-medium text-zinc-900">{OTHER_BRAND}</span>
                  </Choice>
                </div>

                {formData.brand === OTHER_BRAND && (
                  <div className="mt-3 animate-in fade-in">
                    <IconInput icon="sell">
                      <input
                        type="text"
                        autoFocus
                        aria-label="Brand name"
                        placeholder="Enter brand name"
                        value={formData.brandOther}
                        onChange={(e) => set({ brandOther: e.target.value })}
                        className={inputCls}
                      />
                    </IconInput>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 2: VISIT ================= */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-300">
            <StepTitle title="When can we come?" sub="Choose what suits you. Skip it and we'll send the first available technician." />

            <div>
              <Label>Day</Label>
              <div className="grid grid-cols-3 gap-2.5">
                {quickDays.map((d) => {
                  const active = dateChoice === d.iso;
                  return (
                    <Choice
                      key={d.iso}
                      active={active}
                      onClick={() => {
                        setPickingDate(false);
                        set({ preferredVisitDate: d.iso });
                      }}
                      className="flex flex-col items-center px-2 py-3 text-center"
                    >
                      <span className={`text-[11px] font-semibold ${active ? "text-primary" : "text-zinc-500"}`}>{d.top}</span>
                      <span className="mt-0.5 font-headline text-[28px] leading-none text-zinc-900">{d.num}</span>
                      <span className="mt-1 text-[11px] text-zinc-500">{d.month}</span>
                    </Choice>
                  );
                })}
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                <Choice
                  active={dateChoice === "custom"}
                  onClick={() => setPickingDate(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5"
                >
                  <span className="material-symbols-outlined text-[18px] text-zinc-500">edit_calendar</span>
                  <span className="text-[13px] font-semibold text-zinc-900">Pick a date</span>
                </Choice>
                <Choice
                  active={dateChoice === "any"}
                  onClick={() => {
                    setPickingDate(false);
                    set({ preferredVisitDate: "" });
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5"
                >
                  <span className="material-symbols-outlined text-[18px] text-zinc-500">all_inclusive</span>
                  <span className="text-[13px] font-semibold text-zinc-900">Any day</span>
                </Choice>
              </div>

              {dateChoice === "custom" && (
                <div className="mt-3 animate-in fade-in">
                  <IconInput icon="calendar_month">
                    <input
                      type="date"
                      aria-label="Visit date"
                      min={minVisitDate}
                      value={formData.preferredVisitDate}
                      onChange={(e) => set({ preferredVisitDate: e.target.value })}
                      className={inputCls}
                    />
                  </IconInput>
                </div>
              )}
            </div>

            <div>
              <Label>Time</Label>
              <div className="grid grid-cols-2 gap-2.5">
                {SLOTS.map((slot) => {
                  const active = formData.preferredVisitSlot === slot.value;
                  return (
                    <Choice
                      key={slot.label}
                      active={active}
                      onClick={() => set({ preferredVisitSlot: slot.value })}
                      className="flex items-center gap-2.5 p-3"
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                          active ? "bg-primary text-white" : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[19px]">{slot.icon}</span>
                      </span>
                      <span className="min-w-0 leading-tight">
                        <span className="block text-[13px] font-semibold text-zinc-900">{slot.label}</span>
                        <span className="block text-[11px] text-zinc-500">{slot.hint}</span>
                      </span>
                    </Choice>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: DETAILS ================= */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-300">
            <StepTitle title="Where should we go?" sub="Your technician will call this number before arriving." />

            <div className="space-y-3.5">
              <div>
                <Label>Your name</Label>
                <IconInput icon="person" valid={formData.name.trim().length > 1}>
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder="Full name"
                    value={formData.name}
                    onChange={(e) => set({ name: e.target.value })}
                    className={inputCls}
                  />
                </IconInput>
              </div>

              <div>
                <Label>Mobile number</Label>
                <IconInput icon="call" valid={isValidPhone(formData.phone)}>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+91 00000 00000"
                    value={formData.phone}
                    onChange={(e) => set({ phone: e.target.value })}
                    className={inputCls}
                  />
                </IconInput>
              </div>

              <div className="grid grid-cols-[1fr_132px] gap-3">
                <div>
                  <Label>Address</Label>
                  <IconInput icon="home">
                    <input
                      type="text"
                      autoComplete="street-address"
                      placeholder="House no, area"
                      value={formData.address}
                      onChange={(e) => set({ address: e.target.value })}
                      className={inputCls}
                    />
                  </IconInput>
                </div>
                <div>
                  <Label>Pincode</Label>
                  <IconInput icon="pin_drop" valid={/^\d{6}$/.test(formData.zip)}>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={6}
                      placeholder="000000"
                      value={formData.zip}
                      onChange={(e) => set({ zip: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                      className={`${inputCls} font-semibold tracking-wider`}
                    />
                  </IconInput>
                </div>
              </div>

              <div>
                <Label optional>Anything the technician should know?</Label>
                <textarea
                  rows={2}
                  placeholder="e.g. Makes a loud noise during spin"
                  value={formData.description}
                  onChange={(e) => set({ description: e.target.value })}
                  className="min-h-[76px] w-full resize-y rounded-2xl border border-zinc-200 bg-zinc-50/70 px-4 py-3 text-base leading-relaxed text-zinc-900 transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 sm:text-[15px]"
                />
              </div>
            </div>

            {/* Repair ticket */}
            {selectedSub && (
              <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-b from-zinc-50 to-white">
                <div className="flex items-start gap-3 p-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-[0_8px_16px_-6px_rgba(200,16,46,0.6)]">
                    <span className="material-symbols-outlined text-[23px]">{iconFor(selectedService?.name)}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-zinc-900">{selectedService?.name}</p>
                    <p className="truncate text-[13px] text-zinc-500">
                      {selectedSub.name} · {resolvedBrand || "Brand"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="shrink-0 rounded-lg px-2 py-1 text-[13px] font-semibold text-primary hover:bg-primary/5"
                  >
                    Edit
                  </button>
                </div>

                <div className="relative">
                  <div className="mx-4 border-t-2 border-dashed border-zinc-200" />
                  <span className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full border border-zinc-200 bg-white" />
                  <span className="absolute -right-2.5 -top-2.5 h-5 w-5 rounded-full border border-zinc-200 bg-white" />
                </div>

                <div className="space-y-2.5 p-4 text-[13px]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-zinc-500">
                      <span className="material-symbols-outlined text-[16px]">event</span>
                      Visit
                    </span>
                    <span className="font-semibold text-zinc-900">{visitSummary}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-zinc-500">
                      <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                      Starting charge
                    </span>
                    <span className="text-[15px] font-bold text-zinc-900">{selectedSub.price}</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700">
                    <span className="material-symbols-outlined icon-filled text-[16px]">verified_user</span>
                    60-day warranty included
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky action bar */}
      <div className="sticky bottom-0 z-10 border-t border-zinc-100 bg-white/95 px-5 pb-4 pt-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-2.5">
          {step > 0 && (
            <button
              type="button"
              onClick={() => goTo(step - 1)}
              aria-label="Go back"
              className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl border border-zinc-200 text-zinc-700 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 active:scale-95"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative flex h-[52px] flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primary text-[15px] font-semibold text-white shadow-[0_12px_26px_-8px_rgba(200,16,46,0.75)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 -skew-x-[20deg] bg-white/15 transition-all duration-700 group-hover:left-[120%]" />
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Booking…
              </>
            ) : (
              <>
                {isLast ? "Confirm booking" : "Continue"}
                {selectedSub && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">{selectedSub.price}</span>
                )}
                <span className="material-symbols-outlined text-[19px] transition-transform group-hover:translate-x-0.5">
                  {isLast ? "check" : "arrow_forward"}
                </span>
              </>
            )}
          </button>
        </div>

        <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
          <span className="material-symbols-outlined text-[13px]">lock</span>
          {isLast && !user
            ? "We use your mobile number to save and manage this booking."
            : "No payment now · 60-day warranty on every repair"}
        </p>
      </div>
    </form>
  );
}