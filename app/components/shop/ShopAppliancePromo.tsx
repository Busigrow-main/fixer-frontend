import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, RefreshCw, ShieldCheck } from "lucide-react";
import refrigerator from "../../public/images/shop/products/refrigerator.png";
import washingMachine from "../../public/images/shop/products/washing-machine.png";

const trust = [
  { icon: BadgeCheck, label: "40-Point Inspection" },
  { icon: ShieldCheck, label: "1-Yr Warranty" },
  { icon: RefreshCw, label: "7-Day Swap" },
];

export default function ShopAppliancePromo() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_4px_rgba(20,20,20,0.05)] md:rounded-3xl">
      {/* Top: copy + image */}
      <div className="grid grid-cols-[1fr_128px] items-center gap-3 p-4 sm:grid-cols-[1fr_200px] sm:gap-6 sm:p-5 md:grid-cols-[1fr_300px] md:gap-10 md:p-8 lg:grid-cols-[1fr_340px] lg:gap-16 lg:px-14 lg:py-10">
        <div className="min-w-0">
          <h2 className="text-[17px] font-bold leading-tight text-slate-900 sm:text-xl md:text-3xl md:leading-[1.1] lg:text-4xl">
            Appliances for a
            <br /> Better Tomorrow
          </h2>
          <p className="mt-1.5 max-w-md text-[11px] leading-snug text-slate-500 sm:text-sm md:mt-3 md:text-base lg:mt-4 lg:text-lg">
            Top brands. Genuine products. Great prices.
          </p>
          <Link
            href="/spare-parts/appliances"
            className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-[#e9002d] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#d60029] active:scale-95 sm:mt-4 sm:h-10 sm:text-sm md:mt-6 md:h-11 md:px-6 md:text-base lg:mt-8 lg:h-12 lg:px-8"
          >
            Explore Appliances
            <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </Link>
        </div>

        <div className="grid h-[96px] grid-cols-2 gap-1 overflow-hidden rounded-xl bg-gradient-to-br from-[#efefef] to-[#dcdcdc] sm:h-36 md:h-44 md:gap-2 md:rounded-2xl lg:h-52">
          {[
            { image: refrigerator, label: "Refrigerator" },
            { image: washingMachine, label: "Washing machine" },
          ].map(({ image, label }) => (
            <div key={label} className="relative min-w-0">
              <Image
                src={image}
                alt={label}
                fill
                sizes="(max-width: 639px) 64px, (max-width: 1023px) 150px, 170px"
                className="object-contain p-1.5 md:p-3 lg:p-4"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom: trust strip, inside the card */}
      <ul className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 bg-slate-50/40">
        {trust.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="flex items-center justify-center gap-1.5 px-1.5 py-3 text-[11px] font-medium leading-[1.2] text-slate-700 sm:text-xs md:gap-2.5 md:py-4 md:text-sm lg:py-5 lg:text-base"
          >
            <Icon className="h-4 w-4 shrink-0 text-[#e9002d] md:h-5 md:w-5 lg:h-6 lg:w-6" />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}