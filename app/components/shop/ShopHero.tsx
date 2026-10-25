import Image from "next/image";
import Link from "next/link";
import sparePartMotor from "../../public/images/shop/spare-part-motor.png";
import { Button } from "@/app/components/ui/button";
import { SHOP_SPARE_PARTS_HREF } from "@/app/lib/shop-routes";

export default function ShopHero() {
  return (
    <section className="w-full">
      <div className="md:hidden">
        <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-[#100d0e] via-[#3a0b14] to-[#7a0e1f] p-4 text-white sm:p-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 top-0 -z-10 h-full w-3/4 bg-[radial-gradient(ellipse_at_center,rgba(230,25,55,0.32),transparent_70%)]"
          />
          <div className="grid grid-cols-[1.45fr_1fr] items-center gap-3 sm:gap-6">
            <div className="min-w-0">
              <h1 className="text-[26px] font-extrabold leading-[1.05] tracking-tight sm:text-4xl">
                Genuine Parts.
                <span className="block text-[#ff263f]">Longer Life.</span>
              </h1>
              <p className="mt-2 max-w-md text-[11px] leading-snug text-white/85 sm:mt-3 sm:text-sm">
                Original spare parts for all major brands at the best prices.
              </p>
              <Link
                href={SHOP_SPARE_PARTS_HREF}
                className="mt-3.5 inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-white px-3.5 text-xs font-bold text-[#171214] shadow-sm transition hover:bg-gray-100 active:scale-95 sm:mt-4 sm:h-10 sm:px-5 sm:text-sm"
              >
                Shop Spare Parts
                <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="relative aspect-[1.1/1] w-full max-w-[160px] justify-self-end overflow-hidden rounded-xl bg-[#ececec] sm:max-w-[240px]">
              <Image
                src={sparePartMotor}
                alt="Genuine spare part motor assembly"
                fill
                priority
                sizes="(max-width: 639px) 40vw, 300px"
                className="object-contain p-2 sm:p-4"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-[#100d0e] via-[#3a0b14] to-[#7a0e1f] p-10 text-white lg:px-14 lg:py-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 top-0 -z-10 h-full w-3/4 bg-[radial-gradient(ellipse_at_center,rgba(200,16,46,0.32),transparent_70%)]"
          />
          <div className="grid items-center gap-10 md:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div className="min-w-0">
              <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight lg:text-[56px]">
                Genuine parts for appliances we already repair in Patna
              </h1>
              <p className="mt-3 max-w-lg text-base leading-relaxed text-white/85 lg:mt-5 lg:text-lg">
                Original spare parts and inspected appliances, matched to the models Fixxer services every day.
              </p>
              <Button asChild size="lg" className="mt-5 h-11 rounded-xl bg-white px-5 font-bold text-zinc-900 hover:bg-zinc-100 lg:mt-8 lg:h-12 lg:px-7">
                <Link href={SHOP_SPARE_PARTS_HREF}>
                  Shop spare parts
                  <span aria-hidden="true">→</span>
                </Link>
              </Button>
            </div>
            <div className="relative aspect-[5/4] w-full min-h-[280px] overflow-hidden rounded-xl bg-[#ececec] lg:min-h-[360px]">
              <Image
                src={sparePartMotor}
                alt="Genuine spare part motor assembly"
                fill
                priority
                sizes="46vw"
                className="object-contain p-6 lg:p-8"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
