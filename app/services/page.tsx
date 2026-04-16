import React from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ServicesClient from "./ServicesClient";

export default async function ServicesPage() {
  let services = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1"}/services`, {
      cache: "no-store",
    });
    if (res.ok) {
      services = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch services:", error);
  }

  return (
    <>
      <Navbar />
      <main className="pt-14 md:pt-20 pb-12 bg-surface">
        {/* Simple Catalog Header */}
        <section className="px-6 pt-2 md:pt-16 pb-6 md:pb-12 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-headline text-5xl md:text-7xl leading-tight tracking-tight text-on-surface mb-4">
              Our <span className="italic text-primary">Master</span> Catalog
            </h1>
            <p className="text-[10px] md:text-xs text-on-surface-variant font-black opacity-70 tracking-[0.25em] uppercase">
              Professional Service for every household appliance
            </p>
          </div>
        </section>

        <ServicesClient initialServices={services} />

        {/* Global Trust Banner */}
        <section className="container mx-auto px-6 md:px-10 max-w-screen-xl mt-16 md:mt-24 text-center">
          <div className="bg-primary-container border border-primary/10 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-14 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
            <h2 className="font-headline text-4xl mb-6 text-on-primary-container">Can&apos;t find your appliance?</h2>
            <p className="text-lg text-on-primary-container/70 mb-10 max-w-xl mx-auto">
              We specialize in almost all luxury and standard household brands across India. Chat with an expert to see if we cover your specific model.
            </p>
            {/* We will handle this in ServicesClient for consistency if needed, but for now keeping it simple */}
            <ServicesClient isBannerOnly />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
