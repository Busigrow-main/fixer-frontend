import Image from "next/image";
import Link from "next/link";
import sparePartMotor from "../../public/images/shop/spare-part-motor.png";
import { SHOP_SPARE_PARTS_HREF } from "@/app/lib/shop-routes";

export default function ShopHero() {
  return (
    <section className="w-full">
      <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-[#100d0e] via-[#3a0b14] to-[#7a0e1f] p-4 text-white sm:p-6 md:rounded-3xl md:p-10 lg:px-14 lg:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 top-0 -z-10 h-full w-3/4 bg-[radial-gradient(ellipse_at_center,rgba(230,25,55,0.32),transparent_70%)]"
        />

        <div className="grid grid-cols-[1.45fr_1fr] items-center gap-3 sm:gap-6 md:grid-cols-[1.2fr_1fr] md:gap-10 lg:gap-16">
          <div className="min-w-0">
            <h1 className="text-[26px] font-semibold leading-[1.05] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl lg:leading-[1.02]">
              Genuine Parts.
              <span className="block text-[#ff263f]">Longer Life.</span>
            </h1>

            <p className="mt-2 max-w-md text-[11px] leading-snug text-white/85 sm:mt-3 sm:text-sm md:mt-4 md:text-base lg:mt-5 lg:text-lg">
              Original spare parts for all major brands at the best prices.
            </p>

            <Link
              href={SHOP_SPARE_PARTS_HREF}
              className="mt-3.5 inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-white px-3.5 text-xs font-medium text-[#171214] shadow-sm transition hover:bg-gray-100 active:scale-95 sm:mt-4 sm:h-10 sm:px-5 sm:text-sm md:mt-6 md:h-11 md:px-6 lg:mt-8 lg:h-12 lg:px-8 lg:text-base"
            >
              Shop Spare Parts
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="relative aspect-[1.1/1] w-full max-w-[160px] justify-self-end overflow-hidden rounded-xl bg-[#ececec] sm:max-w-[240px] md:max-w-[300px] md:rounded-2xl lg:max-w-[380px]">
            <Image
              src={sparePartMotor}
              alt="Genuine spare part motor assembly"
              fill
              priority
              sizes="(max-width: 639px) 40vw, (max-width: 1023px) 300px, 380px"
              className="object-contain p-2 sm:p-4 lg:p-8"
            />
          </div>
        </div>
      </div>
    </section>
  );
}