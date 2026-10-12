"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleCheck,
  Loader2,
  PackageSearch,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { API_URL } from "@/app/config";
import { useAuth } from "@/app/context/AuthContext";
import { isValidPhone } from "@/app/lib/auth";

type Step = 1 | 2 | 3 | 4;

type SparePartOption = {
  _id: string;
  name: string;
  sku?: string;
  brandSlug?: string;
};

const inputClass =
  "mt-2 min-h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-[16px] text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-primary focus:ring-4 focus:ring-primary/10";

const textareaClass =
  "mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-[16px] leading-6 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-primary focus:ring-4 focus:ring-primary/10";

const STEP_LABELS = [
  "Appliance",
  "Part",
  "Contact",
  "Review",
];

export default function ShopPartHelpForm() {
  const router = useRouter();
  const { user, token, continueWithPhone } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [parts, setParts] = useState<SparePartOption[]>([]);
  const [partsLoading, setPartsLoading] = useState(true);

  const [form, setForm] = useState({
    applianceType: "",
    applianceBrand: "",
    applianceModel: "",
    partDescription: "",
    requestedSparePartId: "",
    notes: "",
    name: user?.fullName || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: "",
  });

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_URL}/spare-parts?limit=500&isActive=true`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load spare parts");
        }

        const result = await response.json();

        const data = Array.isArray(result)
          ? result
          : result.data;

        if (!cancelled) {
          setParts(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            "Spare parts could not be loaded. You can still describe what you need.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setPartsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    setForm((current) => ({
      ...current,
      name: current.name || user.fullName || "",
      phone: current.phone || user.phone || "",
      email: current.email || user.email || "",
    }));
  }, [user]);

  const selectedPart = useMemo(
    () =>
      parts.find(
        (part) => part._id === form.requestedSparePartId,
      ),
    [parts, form.requestedSparePartId],
  );

  const update = (
    field: keyof typeof form,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const validateStep = (nextStep: Step) => {
    setError("");

    if (nextStep === 2 && !form.applianceType.trim()) {
      setError(
        "Tell us which appliance needs the part.",
      );
      return false;
    }

    if (
      nextStep === 3 &&
      !form.partDescription.trim()
    ) {
      setError(
        "Describe the part or problem so our team can identify it.",
      );
      return false;
    }

    if (nextStep === 4) {
      if (!form.name.trim() || !form.address.trim()) {
        setError(
          "Add your name and address so we know how to follow up.",
        );
        return false;
      }

      if (!isValidPhone(form.phone.trim())) {
        setError(
          "Enter a valid 10-digit mobile number.",
        );
        return false;
      }

      if (
        form.email.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          form.email.trim(),
        )
      ) {
        setError(
          "Enter a valid email address or leave it blank.",
        );
        return false;
      }
    }

    return true;
  };

  const goNext = () => {
    const nextStep = (step + 1) as Step;

    if (validateStep(nextStep)) {
      setStep(nextStep);
    }
  };

  const goBack = () => {
    setError("");
    setStep((step - 1) as Step);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (!validateStep(4)) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      let authToken = token;

      if (!authToken) {
        authToken = await continueWithPhone(
          form.phone.trim(),
          form.name.trim(),
        );
      }

      if (!authToken) {
        throw new Error(
          "Authentication could not be completed. Please try again.",
        );
      }

      const response = await fetch(
        `${API_URL}/shop/part-help`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            applianceType:
              form.applianceType.trim(),
            applianceBrand:
              form.applianceBrand.trim() || undefined,
            applianceModel:
              form.applianceModel.trim() || undefined,
            partDescription:
              form.partDescription.trim(),
            requestedSparePartId:
              form.requestedSparePartId || undefined,
            notes: form.notes.trim() || undefined,
            contactData: {
              name: form.name.trim(),
              phone: form.phone.trim(),
              email:
                form.email.trim() || undefined,
              address: form.address.trim(),
            },
          }),
        },
      );

      const result = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        const message = Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message;

        throw new Error(
          message ||
            "We could not submit your request.",
        );
      }

      setSubmittedId(
        result._id || result.id || "submitted",
      );
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "We could not submit your request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedId !== null) {
    return (
      <div className="overflow-hidden rounded-[28px] border border-emerald-200 bg-white shadow-sm">
        <div className="bg-emerald-50 px-5 py-10 text-center sm:px-8 sm:py-12">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </span>

          <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
            Request received
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">
            We&apos;ll help you find the right part
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-600">
            Our team will review your appliance details
            and requirement, then suggest a compatible
            part and price.
          </p>
        </div>

        <div className="grid gap-3 p-5 sm:flex sm:justify-center sm:p-7">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/my-bookings?tab=parts",
              )
            }
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-sm transition hover:brightness-95 active:scale-[0.99]"
          >
            Track request
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/spare-parts")
            }
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 text-sm font-black text-zinc-700 transition hover:border-primary/30 hover:text-primary active:scale-[0.99]"
          >
            Browse parts
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]"
    >
      {/* Header */}
      <div className="border-b border-zinc-100 bg-zinc-50/70 px-5 py-5 sm:px-7">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
            <Sparkles className="h-5 w-5" />
          </span>

          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.17em] text-primary">
              Part identification
            </p>

            <h1 className="mt-1 text-lg font-black tracking-tight text-zinc-950">
              Let Fixxer find the right part
            </h1>

            <p className="mt-1 text-xs leading-5 text-zinc-500">
              A few details are enough. Our team will
              help identify the compatible part.
            </p>
          </div>
        </div>

        {/* Progress */}
        <div
          className="mt-6"
          aria-label={`Step ${step} of 4`}
        >
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  item <= step
                    ? "bg-primary"
                    : "bg-zinc-200"
                }`}
              />
            ))}
          </div>

          <div className="mt-2 grid grid-cols-4">
            {STEP_LABELS.map((label, index) => {
              const item = index + 1;

              return (
                <span
                  key={label}
                  className={`text-[9px] font-black uppercase tracking-wide ${
                    item <= step
                      ? "text-primary"
                      : "text-zinc-400"
                  } ${
                    item === 2
                      ? "text-center"
                      : item === 3
                        ? "text-center"
                        : item === 4
                          ? "text-right"
                          : "text-left"
                  }`}
                >
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form body */}
      <div className="p-5 sm:p-7">
        {step === 1 && (
          <section>
            <StepHeading
              step="01"
              title="Which appliance needs help?"
              description="Start with the appliance. Brand and model are helpful, but you can leave them blank if you don't know them."
            />

            <div className="mt-6">
              <label className="block text-sm font-bold text-zinc-700">
                Appliance type
                <input
                  className={inputClass}
                  value={form.applianceType}
                  onChange={(event) =>
                    update(
                      "applianceType",
                      event.target.value,
                    )
                  }
                  placeholder="e.g. Refrigerator"
                  autoFocus
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-bold text-zinc-700">
                Brand
                <span className="ml-1 font-normal text-zinc-400">
                  optional
                </span>

                <input
                  className={inputClass}
                  value={form.applianceBrand}
                  onChange={(event) =>
                    update(
                      "applianceBrand",
                      event.target.value,
                    )
                  }
                  placeholder="e.g. LG"
                />
              </label>

              <label className="block text-sm font-bold text-zinc-700">
                Model
                <span className="ml-1 font-normal text-zinc-400">
                  optional
                </span>

                <input
                  className={inputClass}
                  value={form.applianceModel}
                  onChange={(event) =>
                    update(
                      "applianceModel",
                      event.target.value,
                    )
                  }
                  placeholder="Model number if known"
                />
              </label>
            </div>

            <InfoStrip>
              Don&apos;t know the model? No problem. Tell us
              what you know and we&apos;ll take it from there.
            </InfoStrip>
          </section>
        )}

        {step === 2 && (
          <section>
            <StepHeading
              step="02"
              title="What part do you need?"
              description="If you know the exact part, select it. Otherwise describe what has stopped working."
            />

            <label className="mt-6 block text-sm font-bold text-zinc-700">
              Search or select a spare part
              <span className="ml-1 font-normal text-zinc-400">
                optional
              </span>

              <div className="relative">
                <PackageSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                <select
                  className={`${inputClass} appearance-none pl-11`}
                  value={form.requestedSparePartId}
                  onChange={(event) => {
                    const value =
                      event.target.value;

                    const selected = parts.find(
                      (part) => part._id === value,
                    );

                    update(
                      "requestedSparePartId",
                      value,
                    );

                    if (
                      selected &&
                      !form.partDescription
                    ) {
                      update(
                        "partDescription",
                        selected.name,
                      );
                    }
                  }}
                  disabled={partsLoading}
                >
                  <option value="">
                    {partsLoading
                      ? "Loading spare parts..."
                      : "I don't know the exact part"}
                  </option>

                  {parts.map((part) => (
                    <option
                      key={part._id}
                      value={part._id}
                    >
                      {[
                        part.name,
                        part.brandSlug,
                        part.sku,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </option>
                  ))}
                </select>
              </div>

              <span className="mt-1.5 block text-xs font-normal leading-5 text-zinc-500">
                You can leave this blank and describe the
                problem instead.
              </span>
            </label>

            {selectedPart && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-primary/15 bg-primary/[0.04] p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
                  <CircleCheck className="h-4 w-4" />
                </span>

                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-primary">
                    Selected part
                  </p>
                  <p className="truncate text-sm font-bold text-zinc-800">
                    {selectedPart.name}
                  </p>
                </div>
              </div>
            )}

            <label className="mt-5 block text-sm font-bold text-zinc-700">
              Part or problem description
              <textarea
                className={`${textareaClass} min-h-32 resize-y`}
                value={form.partDescription}
                onChange={(event) =>
                  update(
                    "partDescription",
                    event.target.value,
                  )
                }
                placeholder="Example: My refrigerator is cooling but the fan is making a loud noise."
                autoFocus
              />
            </label>

            <label className="mt-4 block text-sm font-bold text-zinc-700">
              Additional notes
              <span className="ml-1 font-normal text-zinc-400">
                optional
              </span>

              <textarea
                className={`${textareaClass} min-h-24 resize-y`}
                value={form.notes}
                onChange={(event) =>
                  update(
                    "notes",
                    event.target.value,
                  )
                }
                placeholder="Anything else our team should know?"
              />
            </label>
          </section>
        )}

        {step === 3 && (
          <section>
            <StepHeading
              step="03"
              title="How can we reach you?"
              description="We'll use these details to follow up about the part."
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-bold text-zinc-700">
                Full name

                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(event) =>
                    update(
                      "name",
                      event.target.value,
                    )
                  }
                  autoFocus
                />
              </label>

              <label className="block text-sm font-bold text-zinc-700">
                Mobile number

                <input
                  className={inputClass}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(event) =>
                    update(
                      "phone",
                      event.target.value,
                    )
                  }
                  placeholder="10-digit mobile number"
                />
              </label>
            </div>

            <label className="mt-4 block text-sm font-bold text-zinc-700">
              Email
              <span className="ml-1 font-normal text-zinc-400">
                optional
              </span>

              <input
                className={inputClass}
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) =>
                  update(
                    "email",
                    event.target.value,
                  )
                }
                placeholder="you@example.com"
              />
            </label>

            <label className="mt-4 block text-sm font-bold text-zinc-700">
              Address

              <textarea
                className={`${textareaClass} min-h-24 resize-y`}
                value={form.address}
                onChange={(event) =>
                  update(
                    "address",
                    event.target.value,
                  )
                }
                placeholder="Where should our team follow up?"
              />
            </label>

            <InfoStrip>
              Your details are used to contact you about
              this request.
            </InfoStrip>
          </section>
        )}

        {step === 4 && (
          <section>
            <StepHeading
              step="04"
              title="Review your request"
              description="Check the details once before sending them to Fixxer."
            />

            <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
              <ReviewRow
                label="Appliance"
                value={[
                  form.applianceType,
                  form.applianceBrand,
                  form.applianceModel,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              />

              <ReviewRow
                label="Requirement"
                value={form.partDescription}
              />

              {selectedPart && (
                <ReviewRow
                  label="Part"
                  value={[
                    selectedPart.name,
                    selectedPart.sku,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                />
              )}

              {form.notes && (
                <ReviewRow
                  label="Notes"
                  value={form.notes}
                />
              )}

              <ReviewRow
                label="Contact"
                value={`${form.name} · ${form.phone}`}
              />

              {form.email && (
                <ReviewRow
                  label="Email"
                  value={form.email}
                />
              )}

              <ReviewRow
                label="Address"
                value={form.address}
                last
              />
            </div>

            <div className="mt-4 flex gap-3 rounded-2xl border border-primary/15 bg-primary/[0.04] p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

              <p className="text-xs leading-5 text-zinc-600">
                Fixxer will review your requirement and
                contact you with the compatible part and
                available pricing.
              </p>
            </div>
          </section>
        )}

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-5 text-red-700"
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="mt-7 flex gap-3 border-t border-zinc-100 pt-5">
          {step > 1 && (
            <button
              type="button"
              onClick={goBack}
              disabled={isSubmitting}
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-black text-zinc-700 transition hover:border-zinc-300 active:scale-[0.99] disabled:opacity-50 sm:px-5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden xs:inline">
                Back
              </span>
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-sm transition hover:brightness-95 active:scale-[0.99]"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-sm transition hover:brightness-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit request
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

function StepHeading({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
        Step {step} of 4
      </p>

      <h2 className="mt-2 text-2xl font-black tracking-tight text-zinc-950 sm:text-[28px]">
        {title}
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
        {description}
      </p>
    </div>
  );
}

function InfoStrip({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 flex gap-3 rounded-2xl border border-primary/10 bg-primary/[0.035] p-4">
      <Search className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

      <p className="text-xs leading-5 text-zinc-600">
        {children}
      </p>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`grid gap-1 px-4 py-3.5 sm:grid-cols-[120px_1fr] sm:gap-4 ${
        last ? "" : "border-b border-zinc-200"
      }`}
    >
      <dt className="text-[10px] font-black uppercase tracking-[0.12em] text-zinc-400">
        {label}
      </dt>

      <dd className="break-words text-sm leading-5 text-zinc-800">
        {value}
      </dd>
    </div>
  );
}