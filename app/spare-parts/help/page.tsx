import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Phone,
  Search,
  Wrench,
} from "lucide-react";

export default function SparePartsHelpPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f8] text-slate-950">
      <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-5 sm:px-6 sm:pt-8 lg:px-8">
        {/* Back */}
        <Link
          href="/spare-parts"
          className="inline-flex min-h-10 items-center gap-2 rounded-xl px-2 text-sm font-bold text-slate-600 transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to spare parts
        </Link>

        {/* Hero */}
        <section className="relative mt-4 overflow-hidden rounded-[28px] bg-[#15171b] px-5 py-8 text-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative max-w-2xl">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <HelpCircle className="h-5 w-5" />
            </span>

            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-white/50">
              Need help?
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-[-0.035em] sm:text-4xl lg:text-5xl">
              Not sure which part you need?
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
              That&apos;s okay. Tell Fixxer what appliance you have and what is
              going wrong. Our team can help you identify the right part.
            </p>
          </div>
        </section>

        {/* Main choices */}
        <section className="mt-5 grid gap-4 sm:grid-cols-2">
          <Link
            href="/spare-parts?focus=search"
            className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_14px_35px_rgba(15,23,42,0.08)] active:scale-[0.99] sm:p-6"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/8 text-primary">
              <Search className="h-6 w-6" />
            </span>

            <h2 className="mt-5 text-lg font-black text-slate-950">
              I know the part
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Search the catalog by part name, brand, SKU or appliance.
            </p>

            <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary">
              Search parts
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            href="/spare-parts/enquiry"
            className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_14px_35px_rgba(15,23,42,0.08)] active:scale-[0.99] sm:p-6"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Wrench className="h-6 w-6" />
            </span>

            <h2 className="mt-5 text-lg font-black text-slate-950">
              Help me find it
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Send your requirement to Fixxer and our team can help with the
              right part.
            </p>

            <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary">
              Start a request
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </section>

        {/* What happens next */}
        <section className="mt-5 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.04)] sm:p-7">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </span>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.17em] text-primary">
                Simple process
              </p>

              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                What happens after your request?
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Step
              number="01"
              title="Tell us about it"
              description="Share your appliance and the problem or part you are looking for."
            />

            <Step
              number="02"
              title="Fixxer checks"
              description="Our team reviews the requirement and helps identify the suitable part."
            />

            <Step
              number="03"
              title="Track your request"
              description="Once submitted, you can follow the request from My Bookings."
            />
          </div>
        </section>

        {/* Support strip */}
        <section className="mt-5 rounded-[24px] border border-primary/15 bg-primary/[0.04] p-5 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
          <div>
            <p className="text-sm font-black text-slate-950">
              Prefer talking to someone?
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Our team can help you understand what information to provide.
            </p>
          </div>

          <div className="mt-4 flex gap-2 sm:mt-0">
            <Link
              href="/spare-parts/enquiry"
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-black text-white shadow-sm transition hover:brightness-95 active:scale-[0.99] sm:flex-none"
            >
              Get help
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="tel:+919999999999"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 transition hover:border-primary/30 hover:text-primary active:scale-[0.99]"
            >
              <Phone className="h-4 w-4" />
              Call
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <span className="text-[10px] font-black tracking-[0.16em] text-primary">
        {number}
      </span>

      <h3 className="mt-3 text-sm font-black text-slate-950">
        {title}
      </h3>

      <p className="mt-1.5 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}