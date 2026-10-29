import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, RefreshCw, ShieldCheck } from "lucide-react";
import appliancePromoImage from "../../public/images/shop/products/appliance-promo-hd.png";
import { SHOP_APPLIANCES_HREF } from "@/app/lib/shop-routes";

const mobileTrust = [
  { icon: BadgeCheck, title: "40-Point", subtitle: "Inspection" },
  { icon: ShieldCheck, title: "1-Year", subtitle: "Warranty" },
  { icon: RefreshCw, title: "7-Day", subtitle: "Swap" },
];

const desktopTrust = [
  { icon: BadgeCheck, label: "Inspected before dispatch" },
  { icon: ShieldCheck, label: "1-year warranty" },
  { icon: RefreshCw, label: "7-day replacement" },
];

export default function ShopAppliancePromo() {
  return (
    <>
      <section className="overflow-hidden rounded-[20px] border border-[#e1e3e6] bg-white shadow-[0_1px_4px_rgba(20,20,20,0.06)] md:hidden">
        <div className="grid grid-cols-[minmax(0,1.65fr)_minmax(96px,116px)] items-center gap-3.5 px-3.5 pt-3.5">
          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold leading-[1.2] tracking-[-0.03em] text-[#202124]">
              Appliances for a
              <span className="block">Better Tomorrow</span>
            </h2>
            <p className="mt-1.5 text-[12px] leading-[1.4] text-[#74777e]">
              Top brands. Genuine products.
              <span className="block">Great prices.</span>
            </p>
            <Link
              href={SHOP_APPLIANCES_HREF}
              className="mt-3 inline-flex h-8 max-w-full flex-nowrap items-center gap-1 whitespace-nowrap rounded-full bg-[#e9002d] px-3.5 text-[12px] font-medium text-white shadow-[0_3px_6px_rgba(233,0,45,0.18)] transition hover:bg-[#d60029] active:scale-95"
            >
              Explore Appliances
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            </Link>
          </div>
          <div className="relative aspect-square w-full overflow-hidden rounded-[16px] bg-[#f4f4f4]">
            <Image
              src={appliancePromoImage}
              alt="Refrigerator, washing machine, and air conditioner"
              fill
              sizes="116px"
              className="object-contain p-1.5"
            />
          </div>
        </div>
        <div className="px-3.5 py-3.5">
          <ul className="grid grid-cols-3 rounded-[16px] bg-[#f6f6f8] px-2 py-2.5">
            {mobileTrust.map(({ icon: Icon, title, subtitle }) => (
              <li key={title} className="flex flex-col items-center gap-1 px-1 text-center">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white">
                  <Icon className="h-3.5 w-3.5 text-[#e9002d]" strokeWidth={2.25} />
                </span>
                <span className="leading-[1.2]">
                  <span className="block text-[11px] font-medium tracking-[-0.01em] text-[#1f2024]">{title}</span>
                  <span className="block text-[10px] font-medium text-[#6b6e76]">{subtitle}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="hidden overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)] md:block">
        <div className="grid items-center gap-4 px-5 py-6 sm:px-7 sm:py-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-10 lg:px-10 lg:py-10">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold leading-tight tracking-tight text-zinc-900 sm:text-3xl">
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
              className="mt-5 inline-flex h-11 items-center gap-1.5 rounded-xl bg-primary px-5 text-sm font-medium text-white transition hover:brightness-105"
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
