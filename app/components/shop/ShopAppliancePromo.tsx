import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, RefreshCw, ShieldCheck } from "lucide-react";
import appliancePromoImage from "../../public/images/shop/products/appliance-promo-hd.png";
import { SHOP_APPLIANCES_HREF } from "@/app/lib/shop-routes";

const trust = [
  { icon: BadgeCheck, label: "40-Point Inspection" },
  { icon: ShieldCheck, label: "1-Yr Warranty" },
  { icon: RefreshCw, label: "7-Day Swap" },
];

export default function ShopAppliancePromo() {
  return (
    <section className="overflow-hidden rounded-[24px] border border-[#e1e3e6] bg-white shadow-[0_2px_8px_rgba(20,20,20,0.07)] md:rounded-[28px]">
      {/* Top: copy + image */}
      <div className="grid grid-cols-[minmax(0,1fr)_clamp(108px,34vw,172px)] items-center gap-2.5 px-4 py-5 sm:grid-cols-[minmax(0,1fr)_clamp(128px,28vw,172px)] sm:gap-5 sm:px-7 sm:py-7 md:gap-7 md:px-7 md:py-5 lg:py-5">
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
            sizes="(max-width: 639px) 34vw, 172px"
            className="object-contain sm:object-cover"
          />
        </div>
      </div>

      {/* Bottom: trust strip, inside the card */}
      <ul className="mx-4 grid grid-cols-3 border-t border-[#e1e3e6] bg-white sm:mx-7">
        {trust.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="flex items-center justify-center gap-1 px-0.5 py-3 text-[11px] font-medium leading-[1.2] text-[#303238] sm:gap-2.5 sm:px-1.5 sm:py-5 sm:text-base md:py-4"
          >
            <Icon className="h-4 w-4 shrink-0 text-[#e9002d] sm:h-5 sm:w-5" />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
