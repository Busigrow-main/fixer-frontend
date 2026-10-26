import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, RefreshCw, ShieldCheck } from "lucide-react";
import appliancePromoImage from "../../public/images/shop/products/appliance-promo-hd.png";
import { SHOP_APPLIANCES_HREF } from "@/app/lib/shop-routes";

const mobileTrust = [
  { icon: BadgeCheck, label: "40-Point Inspection" },
  { icon: ShieldCheck, label: "1-Yr Warranty" },
  { icon: RefreshCw, label: "7-Day Swap" },
];

const desktopTrust = [
  { icon: BadgeCheck, label: "Inspected before dispatch" },
  { icon: ShieldCheck, label: "1-year warranty" },
  { icon: RefreshCw, label: "7-day replacement" },
];

export default function ShopAppliancePromo() {
  return (
    <>
      <section className="overflow-hidden rounded-[24px] border border-[#e1e3e6] bg-white shadow-[0_2px_8px_rgba(20,20,20,0.07)] md:hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_clamp(108px,34vw,172px)] items-center gap-2.5 px-4 py-5 sm:grid-cols-[minmax(0,1fr)_clamp(128px,28vw,172px)] sm:gap-5 sm:px-7 sm:py-7">
          <div className="min-w-0">
            <h2 className="whitespace-nowrap text-[17px] font-extrabold leading-[1.12] tracking-[-0.03em] text-[#202124] sm:text-2xl sm:leading-[1.12]">
              Appliances for a
              <br />Better Tomorrow
            </h2>
            <p className="mt-2 max-w-md text-[14px] leading-[1.4] text-[#74777e] sm:text-[18px] sm:leading-[1.45]">
              Top brands. Genuine products. Great prices.
            </p>
            <Link
              href={SHOP_APPLIANCES_HREF}
              className="mt-4 inline-flex h-10 flex-nowrap items-center gap-1 whitespace-nowrap rounded-full bg-[#e9002d] px-2.5 text-[12px] font-bold text-white shadow-[0_4px_8px_rgba(233,0,45,0.2)] transition hover:bg-[#d60029] active:scale-95 sm:h-12 sm:px-5 sm:text-[17px]"
            >
              Explore Appliances
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative h-[clamp(128px,28vw,172px)] w-full overflow-hidden rounded-[22px] bg-[#f2f2f2]">
            <Image
              src={appliancePromoImage}
              alt="Refrigerator, washing machine, and air conditioner"
              fill
              sizes="34vw"
              className="object-contain sm:object-cover"
            />
          </div>
        </div>
        <ul className="mx-4 grid grid-cols-3 border-t border-[#e1e3e6] bg-white sm:mx-7">
          {mobileTrust.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center justify-center gap-1 px-0.5 py-3 text-[11px] font-medium leading-[1.2] text-[#303238] sm:gap-2.5 sm:px-1.5 sm:py-5 sm:text-base"
            >
              <Icon className="h-4 w-4 shrink-0 text-[#e9002d] sm:h-5 sm:w-5" />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="hidden overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)] md:block">
        <div className="grid items-center gap-4 px-5 py-6 sm:px-7 sm:py-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-10 lg:px-10 lg:py-10">
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-3xl">
              Appliances for a better tomorrow
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-600 sm:text-base">
              Top brands. Genuine products. Great prices.
            </p>
            <p className="mt-3 text-sm text-zinc-600">
              Inspected before dispatch · 1-year warranty · 7-day replacement
            </p>
            <Link
              href={SHOP_APPLIANCES_HREF}
              className="mt-5 inline-flex h-11 items-center gap-1.5 rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:brightness-105"
            >
              Explore appliances
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative min-h-[180px] w-full overflow-hidden rounded-2xl bg-[#f6f6f6] lg:min-h-[280px]">
            <Image
              src={appliancePromoImage}
              alt="Refrigerator, washing machine, and air conditioner"
              fill
              sizes="40vw"
              className="object-cover"
            />
          </div>
        </div>
        <ul className="grid grid-cols-1 border-t border-zinc-200 sm:grid-cols-3">
          {desktopTrust.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center justify-center gap-2 px-3 py-4 text-sm font-medium text-zinc-700">
              <Icon className="h-4 w-4 shrink-0 text-primary" />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
