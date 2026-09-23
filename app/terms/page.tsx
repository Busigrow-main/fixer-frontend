import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export const metadata = {
  title: "Terms of Service | Fixxer",
  description: "Fixxer terms for booking, service charges, and warranty.",
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        <section className="container mx-auto max-w-3xl px-6 md:px-10 py-14 md:py-20 space-y-8">
          <h1 className="font-headline text-4xl md:text-5xl text-on-surface">Terms of Service</h1>
          <p className="text-on-surface-variant leading-relaxed">
            By booking a Fixxer service you agree that: (1) the listed standard service charge is
            the base labour/visit fee for the selected service; (2) spare parts and additional
            repairs, if required, are diagnosed on site and charged only after you approve; (3)
            warranty terms are as described in our{" "}
            <Link href="/warranty" className="text-primary font-semibold hover:underline">
              Warranty Policy
            </Link>
            ; and (4) you will provide safe access to the appliance and accurate contact/address
            details.
          </p>
          <p className="text-on-surface-variant leading-relaxed">
            Payments are collected after service unless otherwise stated. Cancellation before a
            technician is assigned is free. After assignment, visit-related charges may apply as
            communicated by support.
          </p>
          <p className="text-xs text-on-surface-variant">
            Last updated: 23 September 2026. Contact support for clarifications.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
