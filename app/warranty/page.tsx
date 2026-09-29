import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export const metadata = {
  title: "Warranty Policy | Fixxer",
  description:
    "Fixxer’s 60-day service warranty and 6-month installed-part warranty: coverage, exclusions, and how to claim.",
};

const UPDATED = "28 September 2026";

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
              Warranty Policy
            </h1>
            <p className="text-on-surface-variant text-base md:text-lg leading-relaxed max-w-2xl">
              A completed Fixxer repair includes a 60-day labour warranty for the same fault, and
              genuine parts we install include 6 months of cover. This policy is part of the{" "}
              <Link href="/terms" className="text-primary font-semibold hover:underline">
                Terms of Service
              </Link>
              .
            </p>
          </div>
        </section>

        <article className="container mx-auto max-w-3xl px-6 md:px-10 py-12 md:py-16 space-y-12 text-on-surface">
          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">1. What you receive</h2>
            <ul className="list-disc pl-5 space-y-2 text-on-surface-variant leading-relaxed">
              <li>
                <strong className="text-on-surface">Service warranty.</strong> 60 days of labour
                to correct the same fault that was repaired on the completed job.
              </li>
              <li>
                <strong className="text-on-surface">Installed-part warranty.</strong> 6 months on
                a genuine spare that Fixxer supplied and installed, counted from the installation
                date on the job.
              </li>
              <li>
                <strong className="text-on-surface">Manufacturer warranty.</strong> If a catalog
                spare states a longer manufacturer period, that longer period applies to the part
                itself. It does not extend the 60-day labour warranty.
              </li>
            </ul>
            <p className="text-on-surface-variant leading-relaxed">
              Your service bill states the warranty period for that job. If the bill names a
              different period for a specific part, the bill controls for that part.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">2. When cover starts and ends</h2>
            <p className="text-on-surface-variant leading-relaxed">
              Cover starts when the job status becomes{" "}
              <strong className="text-on-surface">completed</strong>. Requesting a visit, paying a
              booking request, or having a technician on the way does not start the warranty.
            </p>
            <p className="text-on-surface-variant leading-relaxed">
              The 60-day service warranty ends at midnight on the sixtieth day after completion.
              A part warranty ends at the end of the 6-month period, or on the later date printed
              for that serial on the bill. My Bookings shows whether cover is still active and the
              expiry date once the job is completed.
            </p>
            <p className="text-on-surface-variant leading-relaxed">
              A warranty visit that confirms the same fault and corrects it does not start a new
              60-day term unless the service bill for that visit says so. The original completion
              date remains the start of the labour warranty.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">3. What the service warranty covers</h2>
            <ul className="list-disc pl-5 space-y-2 text-on-surface-variant leading-relaxed">
              <li>Labour to put right the same fault that the completed job addressed.</li>
              <li>
                One warranty-check visit, arranged after you claim from My Bookings while the
                service warranty is still active.
              </li>
              <li>
                Labour to refit or replace a Fixxer-installed part that has failed inside its own
                part-warranty period, where that failure is a defect in the part or in our
                installation.
              </li>
            </ul>
            <p className="text-on-surface-variant leading-relaxed">
              Covered warranty labour and a covered replacement part are not charged again. Any
              new fault, or any part that is outside warranty, is quoted and done only if you
              approve it.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">4. What a part warranty covers</h2>
            <p className="text-on-surface-variant leading-relaxed">
              A part we supplied and installed is covered against a manufacturing or installation
              defect for 6 months. Where the spare has a serial number, that serial is the record
              we use to confirm cover. The replacement is a like part. If the same part is no
              longer available, we fit an equivalent functional part.
            </p>
            <p className="text-on-surface-variant leading-relaxed">
              Parts you bought elsewhere, parts already in the appliance, and consumables such as
              refrigerant gas, filters, bulbs, gaskets, and remote batteries are not on this
              6-month cover unless the invoice lists that item as covered.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">5. What is not covered</h2>
            <ul className="list-disc pl-5 space-y-2 text-on-surface-variant leading-relaxed">
              <li>Misuse, neglect, or failure to follow the care advice given at the visit.</li>
              <li>Power surge, unstable voltage, lightning, flood, fire, pest damage, or an accident.</li>
              <li>A new or unrelated fault, including a fault in another component.</li>
              <li>Work done later by another person, or a part fitted by someone other than Fixxer.</li>
              <li>Cosmetic marks, noise, or wear that does not stop the appliance from working.</li>
              <li>Jobs cancelled before completion, and diagnosis-only visits where no repair was carried out.</li>
              <li>Damage caused because the appliance was moved, reinstalled, or used for a commercial load it was not repaired for.</li>
              <li>Accessories and contents, including food loss, except where our negligence during the visit caused that loss.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">6. What you need to do</h2>
            <ul className="list-disc pl-5 space-y-2 text-on-surface-variant leading-relaxed">
              <li>Keep the service bill and the booking in My Bookings. That is your proof of cover.</li>
              <li>Use the appliance in the ordinary way described by the manufacturer.</li>
              <li>Report the fault while cover is still active. A claim opened after expiry is outside this policy.</li>
              <li>Allow a Fixxer technician to inspect the appliance before any third party opens it.</li>
              <li>Leave any failed Fixxer part available for inspection. We may retain a replaced part.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">7. How to claim</h2>
            <ol className="list-decimal pl-5 space-y-2 text-on-surface-variant leading-relaxed">
              <li>
                Sign in and open{" "}
                <Link href="/my-bookings" className="text-primary font-semibold hover:underline">
                  My Bookings
                </Link>
                .
              </li>
              <li>Select the completed repair and check that warranty status is active.</li>
              <li>
                Choose <strong className="text-on-surface">Claim Warranty</strong>. We open a
                warranty-check visit for a technician to inspect the same fault.
              </li>
              <li>Be available at the address on the booking, with the service bill if we ask for it.</li>
            </ol>
            <p className="text-on-surface-variant leading-relaxed">
              If you cannot use My Bookings, call{" "}
              <a href="tel:+917004771388" className="text-primary font-semibold hover:underline">
                +91 70047 71388
              </a>{" "}
              or email{" "}
              <a
                href="mailto:busigrowindia@gmail.com"
                className="text-primary font-semibold hover:underline"
              >
                busigrowindia@gmail.com
              </a>{" "}
              with the booking reference, the symptom, and the date the job was completed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">8. What happens on a claim</h2>
            <p className="text-on-surface-variant leading-relaxed">
              The technician checks whether the complaint is the same fault and whether it falls
              inside this policy. If it does, we repair it or replace the covered part at no
              further labour or part charge. If it does not, we explain why and quote any further
              work before doing it. You can decline that quote. The original bill remains payable
              and is not refunded because a later, unrelated fault appeared.
            </p>
            <p className="text-on-surface-variant leading-relaxed">
              A repeat visit for a fault we confirm is outside warranty may be charged as a normal
              service visit. We tell you that before the extra work starts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">9. Transfer and records</h2>
            <p className="text-on-surface-variant leading-relaxed">
              The warranty follows the appliance at the address on the completed booking. If you
              sell or move the appliance, contact us with the bill so we can note the change.
              Cover does not become a cash refund, and it cannot be moved onto a different
              appliance.
            </p>
            <p className="text-on-surface-variant leading-relaxed">
              The active warranty record in My Bookings and the service bill are the documents we
              rely on. A verbal promise that is not on the bill or in this policy is not
              additional cover.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">10. Legal effect</h2>
            <p className="text-on-surface-variant leading-relaxed">
              This warranty is given in addition to rights you have under the Consumer Protection
              Act, 2019 and any other law that cannot be limited by contract. It does not replace
              the manufacturer’s warranty on an appliance you bought from someone else.
            </p>
          </section>

          <p className="text-xs text-on-surface-variant border-t border-outline pt-8">
            Last updated: {UPDATED}. Related:{" "}
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
