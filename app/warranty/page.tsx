import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export const metadata = {
  title: "60-Day Warranty Policy | Fixxer",
  description:
    "What Fixxer’s 60-day service warranty covers, exclusions, claim process, and part warranty terms.",
};

export default function WarrantyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        <section className="border-b border-outline bg-surface-container-low">
          <div className="container mx-auto max-w-3xl px-6 md:px-10 py-14 md:py-20">
            <p className="font-label text-[10px] uppercase tracking-[0.28em] font-black text-primary mb-4">
              Policy
            </p>
            <h1 className="font-headline text-4xl md:text-6xl text-on-surface tracking-tight mb-4">
              60-Day Service Warranty
            </h1>
            <p className="text-on-surface-variant text-base md:text-lg leading-relaxed max-w-2xl">
              Every completed Fixxer repair includes a 60-day service warranty. This page explains
              what is covered, what is not, when coverage starts, and how to claim.
            </p>
          </div>
        </section>

        <article className="container mx-auto max-w-3xl px-6 md:px-10 py-12 md:py-16 space-y-12 text-on-surface">
          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">When coverage starts</h2>
            <p className="text-on-surface-variant leading-relaxed">
              The 60-day clock starts when your job is marked <strong className="text-on-surface">completed</strong>.
              Booking a visit does not activate warranty yet — you are covered after the repair is
              finished and recorded on your service bill.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">What is covered</h2>
            <ul className="list-disc pl-5 space-y-2 text-on-surface-variant leading-relaxed">
              <li>Labour to correct the same fault addressed on the completed job.</li>
              <li>
                Genuine Fixxer-supplied parts replaced during that service, for{" "}
                <strong className="text-on-surface">6 months</strong> from installation (unless a
                longer manufacturer warranty applies on a catalog SKU).
              </li>
              <li>A warranty-check visit when you claim through My Bookings while coverage is active.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">What is not covered</h2>
            <ul className="list-disc pl-5 space-y-2 text-on-surface-variant leading-relaxed">
              <li>Damage from misuse, negligence, power surge, water ingress, or accidents.</li>
              <li>New or unrelated faults that were not part of the original diagnosis.</li>
              <li>Third-party or customer-supplied parts not installed by Fixxer.</li>
              <li>Consumables (e.g. gas refill) unless explicitly listed as covered on your invoice.</li>
              <li>Cosmetic issues that do not affect appliance function.</li>
              <li>Jobs cancelled before completion, or work performed by another provider afterward.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">Service vs part warranty</h2>
            <p className="text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">Service (labour):</strong> 60 days from job
              completion for the same fault.
              <br />
              <strong className="text-on-surface">Genuine parts installed by Fixxer:</strong> 6
              months from installation by default.
              <br />
              <strong className="text-on-surface">Catalog / manufacturer spares:</strong> duration
              shown on the product page may be longer and is provided by the manufacturer.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">How to claim</h2>
            <ol className="list-decimal pl-5 space-y-2 text-on-surface-variant leading-relaxed">
              <li>
                Open{" "}
                <Link href="/my-bookings" className="text-primary font-semibold hover:underline">
                  My Bookings
                </Link>{" "}
                and find the completed repair.
              </li>
              <li>Confirm warranty status shows active days remaining.</li>
              <li>Tap <strong className="text-on-surface">Claim Warranty</strong> — we will schedule a warranty check with a master technician.</li>
              <li>Keep your service bill; it is your proof of coverage.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">Proof of warranty</h2>
            <p className="text-on-surface-variant leading-relaxed">
              Your downloadable service bill lists the Master Warranty period and a short coverage
              note. Active bookings also show warranty status and expiry in My Bookings. For
              questions, contact support via the site footer.
            </p>
          </section>

          <p className="text-xs text-on-surface-variant border-t border-outline pt-8">
            Related:{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            ·{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
