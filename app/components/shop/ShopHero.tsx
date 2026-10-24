import Image from "next/image";
import Link from "next/link";
import sparePartMotor from "../../public/images/shop/spare-part-motor.png";
import { Button } from "@/app/components/ui/button";
import { SHOP_SPARE_PARTS_HREF } from "@/app/lib/shop-routes";

export default function ShopHero() {
  return (
    <section className="w-full">
      <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-[#100d0e] via-[#3a0b14] to-[#7a0e1f] p-4 text-white sm:p-6 md:rounded-2xl md:p-10 lg:px-14 lg:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 top-0 -z-10 h-full w-3/4 bg-[radial-gradient(ellipse_at_center,rgba(200,16,46,0.32),transparent_70%)]"
        />
        <div className="grid items-center gap-4 sm:gap-6 md:grid-cols-[1.1fr_1fr] md:gap-10 lg:gap-16">
          <div className="min-w-0">
            <h1 className="text-[26px] font-extrabold leading-[1.05] tracking-tight sm:text-4xl md:text-5xl lg:text-[56px] lg:leading-[1.05]">
              Genuine parts for appliances we already repair in Patna
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base lg:mt-5 lg:text-lg">
              Original spare parts and inspected appliances, matched to the models Fixxer services every day.
            </p>
            <Button asChild size="lg" className="mt-5 h-11 rounded-xl bg-white px-5 font-bold text-zinc-900 hover:bg-zinc-100 lg:mt-8 lg:h-12 lg:px-7">
              <Link href={SHOP_SPARE_PARTS_HREF}>
                Shop spare parts
                <span aria-hidden="true">→</span>
              </Link>
            </Button>
          </div>
          <div className="relative aspect-[5/4] w-full min-h-[180px] overflow-hidden rounded-xl bg-[#ececec] sm:min-h-[240px] md:min-h-[280px] lg:min-h-[360px]">
            <Image
              src={sparePartMotor}
              alt="Genuine spare part motor assembly"
              fill
              priority
              sizes="(max-width: 767px) 90vw, 46vw"
              className="object-contain p-4 sm:p-6 lg:p-8"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
