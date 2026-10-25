import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, RefreshCw, ShieldCheck } from "lucide-react";
import appliancePromoImage from "../../public/images/shop/products/appliance-promo-hd.png";
import { SHOP_APPLIANCES_HREF } from "@/app/lib/shop-routes";

const trust = [
  { icon: BadgeCheck, label: "Inspected before dispatch" },
  { icon: ShieldCheck, label: "1-year warranty" },
  { icon: RefreshCw, label: "7-day replacement" },
];

export default function ShopAppliancePromo() {
  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
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
            sizes="(max-width: 1023px) 90vw, 40vw"
            className="object-cover"
          />
        </div>
      </div>
      <ul className="grid grid-cols-1 border-t border-zinc-200 sm:grid-cols-3">
        {trust.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center justify-center gap-2 px-3 py-4 text-sm font-medium text-zinc-700">
            <Icon className="h-4 w-4 shrink-0 text-primary" />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
