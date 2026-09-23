import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export const metadata = {
  title: "Privacy Policy | Fixxer",
  description: "How Fixxer collects and uses your booking and contact information.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        <section className="container mx-auto max-w-3xl px-6 md:px-10 py-14 md:py-20 space-y-8">
          <h1 className="font-headline text-4xl md:text-5xl text-on-surface">Privacy Policy</h1>
          <p className="text-on-surface-variant leading-relaxed">
            We collect your name, phone number, address, and appliance details to dispatch
            technicians, process bookings, issue invoices, and honour warranty claims. Payment
            records and job history are retained for service quality and legal compliance.
          </p>
          <p className="text-on-surface-variant leading-relaxed">
            We share booking details with assigned Fixxer technicians and operations staff only as
            needed to complete your job. We do not sell your personal data. You may request access
            or correction of your booking data via support.
          </p>
          <p className="text-xs text-on-surface-variant">
            Last updated: 23 September 2026.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
