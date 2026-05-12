import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Award } from "lucide-react";

export default function VerifiedExportersPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20 pb-20 bg-zinc-50 min-h-screen">
        <div className="container mx-auto px-5 max-w-4xl">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-zinc-200 shadow-xl shadow-zinc-200/50 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-zinc-900 mb-4">
              Verified Suppliers & Exporters
            </h1>
            <p className="text-zinc-500 max-w-lg mx-auto mb-10 leading-relaxed font-medium">
              We vet every supplier on our marketplace to ensure you get genuine spare parts with warranty and expert support.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                <CheckCircle2 className="w-8 h-8 text-primary mb-3 mx-auto" />
                <h3 className="font-black text-zinc-900 mb-1">Quality Check</h3>
                <p className="text-xs text-zinc-500 font-medium tracking-tight">Every part is inspected before shipment.</p>
              </div>
              <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                <Award className="w-8 h-8 text-primary mb-3 mx-auto" />
                <h3 className="font-black text-zinc-900 mb-1">Certified OEM</h3>
                <p className="text-xs text-zinc-500 font-medium tracking-tight">Direct sourcing from authorized manufacturers.</p>
              </div>
               <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                <ShieldCheck className="w-8 h-8 text-primary mb-3 mx-auto" />
                <h3 className="font-black text-zinc-900 mb-1">Warranty Shield</h3>
                <p className="text-xs text-zinc-500 font-medium tracking-tight">Up to 12 months warranty on all spares.</p>
              </div>
            </div>

            <Link 
              href="/spare-parts"
              className="inline-flex h-14 px-10 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 items-center justify-center hover:scale-[0.98] transition-all"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
