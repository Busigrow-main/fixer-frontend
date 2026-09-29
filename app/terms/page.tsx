import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export const metadata = {
  title: "Terms of Service | Fixxer",
  description:
    "Terms for booking Fixxer appliance repair, service charges, spare parts, cancellation, and warranty.",
};

const UPDATED = "28 September 2026";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        <section className="border-b border-outline bg-surface-container-low">
          <div className="container mx-auto max-w-3xl px-6 md:px-10 py-14 md:py-20">
            <p className="font-label text-[10px] uppercase tracking-[0.28em] font-black text-primary mb-4">
              Legal
            </p>
            <h1 className="font-headline text-4xl md:text-6xl text-on-surface tracking-tight mb-4">
              Terms of Service
            </h1>
            <p className="text-on-surface-variant text-base md:text-lg leading-relaxed max-w-2xl">
              These terms apply when you browse Fixxer, create an account, book a repair, buy a
              listed spare, or make a warranty claim.
            </p>
          </div>
        </section>

        <article className="container mx-auto max-w-3xl px-6 md:px-10 py-12 md:py-16 space-y-12 text-on-surface">
          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">1. Who we are</h2>
            <p className="text-on-surface-variant leading-relaxed">
              Fixxer is the appliance-repair service operated from Cool Air Refrigeration, MLA
              Colony, Raja Bazar, Patna 800014. You can reach us at{" "}
              <a href="tel:+917004771388" className="text-primary font-semibold hover:underline">
                +91 70047 71388
              </a>{" "}
              or{" "}
              <a
                href="mailto:busigrowindia@gmail.com"
                className="text-primary font-semibold hover:underline"
              >
                busigrowindia@gmail.com
              </a>
              . In these terms, “we”, “us”, and “Fixxer” mean that business. “You” means the
              person who books, pays, or authorises work on an appliance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">2. Acceptance</h2>
            <p className="text-on-surface-variant leading-relaxed">
              Using the website, continuing with a phone number, or confirming a booking means
              you agree to these terms and to the{" "}
              <Link href="/warranty" className="text-primary font-semibold hover:underline">
                Warranty Policy
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary font-semibold hover:underline">
                Privacy Policy
              </Link>
              . If you book on behalf of someone else, you confirm that you are allowed to share
              their contact and address details and to authorise the visit.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">3. The service</h2>
            <p className="text-on-surface-variant leading-relaxed">
              We arrange diagnosis and repair of home appliances such as refrigerators, washing
              machines, air conditioners, and microwaves, in serviceable areas. A listing, starting
              price, or time estimate is an offer to attend and assess the appliance. It is not a
              promise that every fault can be repaired, that a part is in stock, or that a visit
              will happen at a particular minute.
            </p>
            <p className="text-on-surface-variant leading-relaxed">
              The technician inspects the appliance at your premises. The final scope of work is
              what you approve after that inspection, together with any later work you approve
              before it is carried out.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">4. Your booking</h2>
            <p className="text-on-surface-variant leading-relaxed">
              You agree to give a working phone number, a serviceable address, and a fair
              description of the appliance and the problem. You will provide safe access to the
              appliance, working electricity and water where the job needs them, and an adult on
              site who can approve extra work and take the service bill.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-on-surface-variant leading-relaxed">
              <li>Keep pets and children clear of the work area.</li>
              <li>Tell us about recent leakage, burning smell, electrical trips, or previous repairs.</li>
              <li>Do not ask the technician to bypass a safety device or to install a part you know is unsuitable.</li>
            </ul>
            <p className="text-on-surface-variant leading-relaxed">
              We may refuse or stop a job if the site is unsafe, the appliance has been tampered
              with, or the information given makes the visit misleading.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">5. Prices and approval</h2>
            <p className="text-on-surface-variant leading-relaxed">
              The price shown for a service is the standard labour or visit charge for that
              service type. It does not automatically include spare parts, gas, installation
              hardware, or a second visit.
            </p>
            <p className="text-on-surface-variant leading-relaxed">
              If extra repair or a spare is required, we tell you the item and the charge before
              that work is done. We fit a chargeable part or carry out extra repair only after
              you approve it. If you decline, you pay the applicable visit or diagnostic charge
              and we leave the appliance as safe as practical.
            </p>
            <p className="text-on-surface-variant leading-relaxed">
              Taxes, where applicable, are added to the bill. A promotional price or coupon
              applies only while the offer is active, to the services the offer names, and once
              per the offer terms shown on the site.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">6. Payment</h2>
            <p className="text-on-surface-variant leading-relaxed">
              Unless a listing says otherwise, payment is collected after the visit, when the job
              is completed or when you have approved work that is ready to be billed. The invoice
              or service bill is the record of what you were charged. You should keep it; it is
              also your proof of warranty.
            </p>
            <p className="text-on-surface-variant leading-relaxed">
              If a payment fails, we may pause further visits on that booking until the amount
              due is paid. We do not hold your card or UPI details on this website beyond what
              the payment provider needs to complete the transaction.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">7. Cancellation</h2>
            <p className="text-on-surface-variant leading-relaxed">
              You can cancel a booking from My Bookings while it has not started and payment has
              not been collected. A short reason is required. Once the job is in progress,
              completed, or payment has been collected, the app will not cancel it. Contact
              support if you need a change after that point.
            </p>
            <p className="text-on-surface-variant leading-relaxed">
              If a technician has already been sent to you and you are not available, or you
              refuse access, we may charge the visit fee that applies to that booking. We will
              tell you that charge before it is added. Work you already approved and that has
              been done remains payable.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">8. Spare parts</h2>
            <p className="text-on-surface-variant leading-relaxed">
              Parts we supply are described on the invoice, including any serial number required
              for a part warranty. Manufacturer warranty periods shown on a product page are the
              manufacturer’s terms and sit alongside Fixxer’s own cover, which is set out in the{" "}
              <Link href="/warranty" className="text-primary font-semibold hover:underline">
                Warranty Policy
              </Link>
              .
            </p>
            <p className="text-on-surface-variant leading-relaxed">
              Parts you supply yourself are not covered by our part warranty. We may decline to
              fit a part that is unsafe, incompatible, or cannot be identified.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">9. Warranty</h2>
            <p className="text-on-surface-variant leading-relaxed">
              A completed repair includes a 60-day labour warranty for the same fault, starting
              when the job is marked completed. Genuine parts installed by Fixxer carry a 6-month
              part warranty from installation, unless the invoice or a manufacturer warranty
              states a longer period. Booking a visit does not start the warranty. Coverage,
              exclusions, and the claim steps are in the Warranty Policy, which is part of these
              terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">10. Accounts</h2>
            <p className="text-on-surface-variant leading-relaxed">
              Customer access is tied to the mobile number you give us. You are responsible for
              bookings made from that number. Tell us promptly if the number changes or if you
              believe someone else is using your account. We may suspend access if we reasonably
              believe the account is being misused.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">11. Limits of responsibility</h2>
            <p className="text-on-surface-variant leading-relaxed">
              We perform the work with reasonable care and skill. We are not responsible for a
              fault that was already present and outside the approved repair, for data stored on
              an appliance, or for loss of food or similar contents, except where that loss is
              caused by our negligence while we are working.
            </p>
            <p className="text-on-surface-variant leading-relaxed">
              Where the law allows us to limit liability, our liability for a booking is limited
              to the amount you paid Fixxer for that booking. Nothing in these terms limits
              liability for death or personal injury caused by negligence, for fraud, or for any
              right you have under the Consumer Protection Act, 2019 that cannot be excluded.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">12. Use of the website</h2>
            <p className="text-on-surface-variant leading-relaxed">
              Do not misuse the site, attempt to access another customer’s bookings, or submit
              false appliance or address details. Content on the site, including service
              descriptions and images, belongs to Fixxer or its licensors. You may not copy it
              for a competing service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">13. Changes</h2>
            <p className="text-on-surface-variant leading-relaxed">
              We may update these terms or the Warranty Policy. The date at the bottom of each
              page is the date of the current version. A booking keeps the warranty terms that
              applied when that job was completed, as written on its service bill. Changes apply
              to new bookings and to use of the site after the updated page is published.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-headline text-2xl md:text-3xl">14. Law and complaints</h2>
            <p className="text-on-surface-variant leading-relaxed">
              These terms are governed by the laws of India. Courts at Patna, Bihar have
              jurisdiction, without affecting any right you have to approach a consumer forum.
              Write to{" "}
              <a
                href="mailto:busigrowindia@gmail.com"
                className="text-primary font-semibold hover:underline"
              >
                busigrowindia@gmail.com
              </a>{" "}
              with your booking reference and we will respond to a service complaint.
            </p>
          </section>

          <p className="text-xs text-on-surface-variant border-t border-outline pt-8">
            Last updated: {UPDATED}. Related:{" "}
            <Link href="/warranty" className="text-primary hover:underline">
              Warranty Policy
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
