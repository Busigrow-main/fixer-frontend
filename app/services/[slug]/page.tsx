import React from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import BookingForm from "@/app/components/BookingForm";
import BookRepairButton from "./BookRepairButton";
import { notFound } from "next/navigation";

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

  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        {/* ── Hero Section ── */}
        <section className="relative pt-14 pb-12 lg:pt-32 lg:pb-32 overflow-hidden">
          {/* Ambient background decoration */}
          <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/5 rounded-full blur-[80px] md:blur-[100px] translate-x-1/4 -translate-y-1/4" />
          
          <div className="container mx-auto px-6 md:px-10 max-w-screen-2xl flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
            {/* Context & Headline */}
            <div className="w-full lg:w-1/2">
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <Link href="/services" className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
                   <span className="material-symbols-outlined text-sm">arrow_back</span>
                   <span className="font-label text-[10px] uppercase tracking-widest font-bold">Back to Catalog</span>
                </Link>
                <span className="w-1 h-1 rounded-full bg-outline-variant" />
                <span className="font-label text-[10px] uppercase tracking-widest font-black text-primary">{service.name}</span>
              </div>
              
              <h1 className="font-headline text-4xl md:text-7xl lg:text-8xl tracking-tighter leading-[0.95] text-on-surface mb-6 md:mb-8">
                {service.title.split(' ').map((word: string, i: number) => (
                  <span key={i} className={i === service.title.split(' ').length - 1 ? 'italic text-primary' : ''}>
                    {word}{' '}
                  </span>
                ))}
              </h1>
              
              <p className="text-lg md:text-xl text-on-surface-variant max-w-xl leading-relaxed mb-8 md:mb-10">
                {service.description}
              </p>

              <div className="flex flex-wrap gap-3 md:gap-4">
                <BookRepairButton serviceSlug={service.slug} />
                <div className="flex items-center gap-3 px-5 md:px-6 bg-surface-container rounded-xl border border-outline h-13 md:h-14">
                   <span className="font-label text-[9px] md:text-xs uppercase tracking-widest opacity-60">Starting at</span>
                   <span className="font-headline text-xl md:text-2xl text-on-surface font-bold">{service.startingPrice}</span>
                </div>
              </div>
            </div>

            {/* Feature Mosaic / Image */}
            <div className="w-full lg:w-1/2 relative">
               <div className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden aspect-[1.2/1] md:aspect-[4/5] shadow-2xl shadow-black/10">
                  <Image 
                    src={service.image} 
                    alt={service.title} 
                    fill 
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Trust overlay */}
                  <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10">
                    <div className="glass p-5 md:p-8 rounded-2xl md:rounded-3xl border border-white/20 shadow-2xl flex items-center gap-4 md:gap-5 translate-y-0 hover:-translate-y-2 transition-transform duration-500">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 text-white shadow-lg">
                           <span className="material-symbols-outlined text-xl md:text-3xl icon-filled">verified</span>
                        </div>
                        <div>
                           <p className="font-bold text-base md:text-lg text-white mb-0.5 md:mb-1">Master Tech Guaranteed</p>
                           <p className="text-[9px] md:text-sm text-white/70 uppercase tracking-widest font-label font-bold">120-Point Inspection</p>
                        </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* ── Detailed Benefits ── */}
        <section className="py-16 md:py-32 bg-surface-container-lowest">
           <div className="container mx-auto px-6 md:px-10 max-w-screen-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
                 {service.features.map((feature: string) => (
                    <div key={feature} className="space-y-3 md:space-y-4 group">
                       <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/5 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                          <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors duration-300 icon-filled text-xl">stars</span>
                       </div>
                       <h3 className="font-headline text-lg md:text-xl text-on-surface">{feature}</h3>
                       <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed opacity-70">
                          Comprehensive maintenance from industrial-grade components to smart home integration.
                       </p>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* ── Bottom Section: Form ── */}
        <section className="py-16 md:py-32 bg-white relative overflow-hidden">
           <div className="container mx-auto px-6 md:px-10 max-w-screen-xl relative z-10">
              <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-start gap-12 lg:gap-20">
                 <div className="lg:w-1/2">
                    <h2 className="font-headline text-3xl md:text-5xl lg:text-7xl tracking-tighter leading-tight text-on-surface mb-6 md:mb-8">
                       Book your <br /> {service.name} Repair <br /> in <span className="italic text-primary">seconds.</span>
                    </h2>
                    <p className="text-base md:text-lg text-on-surface-variant mb-8 md:mb-10 max-w-md opacity-80">
                        Fill in your neighborhood details below to get instant dispatch to your location. No hidden fees, no wait times.
                    </p>
                    
                    <div className="space-y-5 md:space-y-6 pt-8 md:pt-10 border-t border-outline">
                       <div className="flex items-center gap-4">
                          <span className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
                             <span className="material-symbols-outlined icon-filled text-lg">done_all</span>
                          </span>
                          <span className="font-label text-xs md:text-sm uppercase tracking-widest font-black opacity-80">Factory Trained Technicians</span>
                       </div>
                       <div className="flex items-center gap-4">
                          <span className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
                             <span className="material-symbols-outlined icon-filled text-lg">done_all</span>
                          </span>
                          <span className="font-label text-xs md:text-sm uppercase tracking-widest font-black opacity-80">Genuine OEM Part Library</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="lg:w-1/2 w-full">
                    <div className="bg-surface-container-low p-6 md:p-10 rounded-3xl md:rounded-[3rem] border border-outline shadow-2xl">
                       <h3 className="font-headline text-xl md:text-2xl text-on-surface mb-6 md:mb-8 text-center">Fast Track Dispatch</h3>
                       <BookingForm initialServiceSlug={service.slug} />
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
