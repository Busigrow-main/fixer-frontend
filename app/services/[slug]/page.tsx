import React from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import BookingForm from "@/app/components/BookingForm";
import BookRepairButton from "./BookRepairButton";
import { notFound } from "next/navigation";
import { getServiceImage } from "@/app/lib/services";

const STEPS = [
  { icon: "event_available", title: "Book a slot", text: "Pick your service and a time that suits you. It takes under a minute." },
  { icon: "engineering", title: "Technician arrives", text: "A trained technician visits your home and diagnoses the issue on the spot." },
  { icon: "request_quote", title: "Approve the price", text: "Spare parts and extra repairs are quoted first. Nothing starts without your OK." },
  { icon: "verified", title: "Fixed and covered", text: "Your repair is done and backed by a 60-day service warranty." },
];

/* Spacing scale used across the page:
   hero top padding : pt-14 lg:pt-32  (clears the fixed navbar, same as your original)
   section padding  : py-10 md:py-14 lg:py-16
   heading → content: mb-6 md:mb-8
   card grids       : gap-4 md:gap-5
   card padding     : p-5 md:p-6                                   */

export default async function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let service = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1"}/services/${slug}`, {
      cache: "no-store",
    });
    if (res.ok) {
      service = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch service detail:", error);
  }

  if (!service) {
    notFound();
  }

  const titleWords: string[] = service.title.split(" ");

  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        {/* ── Hero ── */}
        <section className="relative pt-14 pb-10 md:pb-12 lg:pt-32 lg:pb-16 overflow-hidden">
          <div className="pointer-events-none absolute top-0 right-0 w-[320px] md:w-[560px] h-[320px] md:h-[560px] bg-primary/5 rounded-full blur-[90px] md:blur-[120px] translate-x-1/3 -translate-y-1/3" />

          <div className="relative container mx-auto px-5 sm:px-6 md:px-10 max-w-screen-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 lg:items-stretch">
              {/* Copy */}
              <div className="flex flex-col justify-center min-w-0 order-2 lg:order-1">
                <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 mb-4">
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-1.5 rounded-full border border-outline bg-white px-3 py-1.5 text-on-surface-variant hover:text-primary hover:border-primary/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    <span className="font-label text-[11px] uppercase tracking-widest font-bold">All services</span>
                  </Link>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1.5 font-label text-[11px] uppercase tracking-widest font-black text-primary">
                    {service.name}
                  </span>
                </nav>

                <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl xl:text-7xl tracking-tighter leading-[1.02] text-on-surface mb-4">
                  {titleWords.map((word: string, i: number) => (
                    <span key={i} className={i === titleWords.length - 1 ? "italic text-primary" : ""}>
                      {word}{" "}
                    </span>
                  ))}
                </h1>

                <p className="text-base md:text-lg text-on-surface-variant max-w-xl leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* CTA row */}
                <div className="flex flex-col sm:flex-row sm:items-stretch gap-3 w-full sm:w-auto">
                  <div className="w-full sm:w-auto [&>*]:w-full sm:[&>*]:w-auto">
                    <BookRepairButton serviceSlug={service.slug} />
                  </div>

                  <div className="flex items-center justify-between sm:justify-start gap-4 px-5 min-h-[56px] bg-surface-container rounded-xl border border-outline">
                    <span className="font-label text-[10px] md:text-xs uppercase tracking-widest text-on-surface-variant">
                      Starting at
                    </span>
                    <span className="font-headline text-xl md:text-2xl text-on-surface font-bold whitespace-nowrap">
                      {service.startingPrice}
                    </span>
                  </div>
                </div>

                {/* Reassurance row */}
                <ul className="mt-6 pt-5 border-t border-outline flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-2.5 text-sm text-on-surface-variant">
                  {["Visit charge included", "60-day service warranty", "Genuine OEM parts"].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="material-symbols-outlined icon-filled text-primary text-lg">check_circle</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Image */}
              <div className="order-1 lg:order-2 min-w-0">
                <div className="relative w-full overflow-hidden rounded-3xl aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[440px] shadow-xl shadow-primary/10 ring-1 ring-black/5">
                  <Image
                    src={getServiceImage(service.slug)}
                    alt={service.title}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />

                  {/* Trust badge */}
                  <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4 lg:inset-x-5 lg:bottom-5">
                    <div className="flex items-center gap-3 rounded-2xl bg-white/90 backdrop-blur-xl ring-1 ring-black/5 px-4 py-3 shadow-xl shadow-black/10">
                      <div className="w-11 h-11 lg:w-12 lg:h-12 bg-primary rounded-xl flex items-center justify-center shrink-0 text-white shadow-lg shadow-primary/30">
                        <span className="material-symbols-outlined icon-filled text-2xl">verified</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm sm:text-base text-on-surface leading-tight">
                          Master Tech Guaranteed
                        </p>
                        <p className="mt-0.5 text-[11px] sm:text-xs text-on-surface-variant uppercase tracking-widest font-label font-bold">
                          120-point inspection
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── What's included ── */}
        {Array.isArray(service.features) && service.features.length > 0 ? (
          <section className="py-10 md:py-14 lg:py-16 bg-surface-container-lowest">
            <div className="container mx-auto px-5 sm:px-6 md:px-10 max-w-screen-2xl">
              <h2 className="font-headline text-2xl md:text-4xl tracking-tight text-on-surface mb-6 md:mb-8">
                What&apos;s included
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                {service.features.map((feature: string) => {
                  const isWarranty = feature.toLowerCase().includes("warranty");
                  return (
                    <article
                      key={feature}
                      className="group flex flex-col rounded-2xl border border-outline bg-white p-5 md:p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 motion-reduce:transition-none"
                    >
                      <div className="w-11 h-11 mb-4 rounded-xl bg-primary/10 flex items-center justify-center transition-colors duration-300 group-hover:bg-primary">
                        <span className="material-symbols-outlined icon-filled text-primary text-2xl transition-colors duration-300 group-hover:text-white">
                          {isWarranty ? "shield" : "stars"}
                        </span>
                      </div>
                      <h3 className="font-headline text-lg text-on-surface mb-1.5">{feature}</h3>
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        {isWarranty
                          ? "Coverage details, exclusions, and claim steps are listed in our warranty policy."
                          : "Comprehensive maintenance from industrial-grade components to smart home integration."}
                      </p>
                      {isWarranty ? (
                        <Link
                          href="/warranty"
                          className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
                        >
                          View warranty policy
                          <span className="material-symbols-outlined text-base">arrow_forward</span>
                        </Link>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        {/* ── Service charges ── */}
        {Array.isArray(service.subCategories) && service.subCategories.length > 0 ? (
          <section className="py-10 md:py-14 lg:py-16 bg-white">
            <div className="container mx-auto px-5 sm:px-6 md:px-10 max-w-screen-2xl">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6 md:mb-8">
                <div>
                  <h2 className="font-headline text-2xl md:text-4xl text-on-surface tracking-tight">
                    Service charges
                  </h2>
                  <p className="text-sm md:text-base text-on-surface-variant mt-2 max-w-xl leading-relaxed">
                    Listed prices are the standard service charge, visit included. Spare parts and additional repairs are priced after diagnosis and confirmed before work.
                  </p>
                </div>
                <Link
                  href="/warranty"
                  className="inline-flex items-center gap-2 self-start md:self-auto rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <span className="material-symbols-outlined icon-filled text-lg">shield</span>
                  60-day service warranty included
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {service.subCategories.map((sc: { _id?: string; name: string; price?: string }) => (
                  <div
                    key={sc._id || sc.name}
                    className="group flex items-center justify-between gap-4 rounded-xl border border-outline bg-surface-container-lowest px-4 py-3.5 md:px-5 transition-all duration-300 hover:border-primary/40 hover:bg-white hover:shadow-md hover:shadow-primary/5 motion-reduce:transition-none"
                  >
                    <p className="font-medium text-on-surface text-sm md:text-base leading-snug">{sc.name}</p>
                    <p className="shrink-0 rounded-lg bg-white group-hover:bg-primary/5 border border-outline px-3 py-1 font-headline text-base md:text-lg font-bold text-primary transition-colors">
                      {sc.price || "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* ── How it works ── */}
        <section className="py-10 md:py-14 lg:py-16 bg-surface-container-lowest">
          <div className="container mx-auto px-5 sm:px-6 md:px-10 max-w-screen-2xl">
            <h2 className="font-headline text-2xl md:text-4xl tracking-tight text-on-surface mb-6 md:mb-8">
              How it works
            </h2>

            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {STEPS.map((step, i) => (
                <li key={step.title} className="relative rounded-2xl border border-outline bg-white p-5 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/25">
                      <span className="material-symbols-outlined icon-filled text-2xl">{step.icon}</span>
                    </span>
                    <span className="font-headline text-3xl text-on-surface/15 font-bold" aria-hidden="true">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-headline text-lg text-on-surface mb-1.5">{step.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Booking form (no overflow clipping; scroll-mt clears the fixed navbar) ── */}
        <section id="book" className="relative bg-white py-10 md:py-14 lg:py-16 scroll-mt-28">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute bottom-0 left-0 w-[320px] md:w-[520px] h-[320px] md:h-[520px] bg-primary/5 rounded-full blur-[90px] md:blur-[120px] -translate-x-1/3 translate-y-1/3" />
          </div>

          <div className="relative z-10 container mx-auto px-5 sm:px-6 md:px-10 max-w-screen-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left: pitch */}
              <div className="min-w-0 lg:col-span-5">
                <h2 className="font-headline text-3xl sm:text-4xl xl:text-5xl tracking-tighter leading-[1.08] text-on-surface mb-4">
                  Book your {service.name} repair in <span className="italic text-primary">seconds.</span>
                </h2>
                <p className="text-base md:text-lg text-on-surface-variant mb-6 max-w-md leading-relaxed">
                  Fill in your neighborhood details to get instant dispatch to your location. No hidden fees, no wait times.
                </p>

                <ul className="space-y-3 pt-6 border-t border-outline">
                  {["Factory trained technicians", "Genuine OEM part library"].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="w-9 h-9 shrink-0 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined icon-filled text-lg">done_all</span>
                      </span>
                      <span className="text-sm md:text-base font-semibold text-on-surface">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: form */}
              <div className="min-w-0 w-full lg:col-span-7">
                <div className="w-full rounded-3xl border border-outline bg-surface-container-low p-5 sm:p-6 lg:p-8 shadow-xl shadow-primary/5">
                  <div className="flex items-center justify-center gap-3 mb-5 md:mb-6">
                    <span className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined icon-filled text-xl">bolt</span>
                    </span>
                    <h3 className="font-headline text-xl text-on-surface">Fast track dispatch</h3>
                  </div>
                  <div className="min-w-0 w-full">
                    <BookingForm initialServiceSlug={service.slug} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}