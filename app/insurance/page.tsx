"use client";

import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function InsurancePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pt-20 text-on-surface">
        <section className="relative flex min-h-[calc(100vh-20rem)] items-center justify-center overflow-hidden bg-white px-6 py-20 text-center md:px-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.05] blur-3xl sm:h-[28rem] sm:w-[28rem]"
          />

          <div className="relative z-10 flex w-full max-w-xl flex-col items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/[0.05] px-4 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full animate-ping rounded-full bg-primary opacity-40" />
                <span className="relative h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Coming soon
              </span>
            </div>

            <h1 className="mt-7 font-headline text-5xl font-semibold leading-tight tracking-tight text-on-surface sm:text-6xl">
              Insurance protection
              <span className="block text-primary">is on the way.</span>
            </h1>

            <p className="mt-5 max-w-md text-sm leading-6 text-on-surface-variant sm:text-base">
              We&apos;re working on a simple way to protect your appliances with
              Fixxer.
            </p>

            <div className="mt-8 h-1 w-14 rounded-full bg-primary/70" />

            <Link
              href="/"
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
            >
              Back to home
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}