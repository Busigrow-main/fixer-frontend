"use client";

import Image from "next/image";
import Link from "next/link";
import type { StaticImageData } from "next/image";
import FixxerLogo from "@/app/components/FixxerLogo";
import airConditioner from "../../public/images/shop/products/air-conditioner.png";
import refrigerator from "../../public/images/shop/products/refrigerator.png";
import washingMachine from "../../public/images/shop/products/washing-machine.png";
import compressor from "../../public/images/shop/products/compressor.png";

const SHOWCASE: { src: StaticImageData; label: string; className: string }[] = [
  { src: airConditioner, label: "Air conditioner", className: "scale-[1.08]" },
  { src: refrigerator, label: "Refrigerator", className: "scale-[1.04]" },
  { src: washingMachine, label: "Washing machine", className: "scale-[1.06]" },
  { src: compressor, label: "Spare part", className: "scale-[0.92]" },
];

export default function ShopMaintenanceScreen({
  message,
}: {
  message: string;
}) {
  return (
    <div className="shop-shell relative flex min-h-[100dvh] flex-col bg-[#f3f3f4] text-zinc-950">
      <header className="shop-maint-enter relative z-20 flex items-center justify-between border-b border-zinc-200/80 bg-[#f3f3f4]/90 px-5 py-4 backdrop-blur-sm sm:px-8 sm:py-5">
        <Link href="/" className="inline-flex items-baseline gap-1.5" aria-label="Fixxer home">
          <FixxerLogo className="text-[22px] leading-none sm:text-[24px]" />
          <span className="text-[14px] font-medium tracking-tight text-zinc-500 sm:text-[15px]">
            Shop
          </span>
        </Link>
        <Link
          href="/"
          className="text-[13px] font-medium text-zinc-600 underline-offset-4 transition hover:text-zinc-950 hover:underline"
        >
          Back to Fixxer
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 py-10 sm:px-8 sm:py-14 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-16">
        <div className="shop-maint-enter shop-maint-enter-delay max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Temporarily unavailable
          </p>
          <h1 className="font-headline mt-3 text-[2.2rem] font-medium leading-[1.08] tracking-tight text-zinc-950 sm:text-[2.9rem] lg:text-[3.2rem]">
            Fixxer Shop is under maintenance
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-zinc-600">
            {message}
          </p>

          <div className="mt-8 max-w-sm border-t border-zinc-200 pt-6">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400">
                  Shop
                </dt>
                <dd className="mt-1 font-medium text-zinc-800">Paused</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400">
                  Repairs
                </dt>
                <dd className="mt-1 font-medium text-zinc-800">Open as usual</dd>
              </div>
            </dl>
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/services"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-white transition hover:bg-[#c90026]"
            >
              Book a repair
            </Link>
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50"
            >
              Go to Fixxer home
            </Link>
          </div>
        </div>

        <div className="shop-maint-enter shop-maint-enter-delay-2 mt-12 lg:mt-0">
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3.5">
              <p className="text-[12px] font-medium tracking-wide text-zinc-500">
                Catalog preview
              </p>
              <p className="text-[12px] font-medium text-primary">Returning soon</p>
            </div>

            <div className="grid grid-cols-2 gap-px bg-zinc-100">
              {SHOWCASE.map((item, index) => (
                <figure
                  key={item.label}
                  className="shop-maint-tile relative flex aspect-square flex-col bg-[#f7f7f8]"
                  style={{ animationDelay: `${0.18 + index * 0.06}s` }}
                >
                  <div className="relative flex flex-1 items-center justify-center p-5 sm:p-7">
                    <Image
                      src={item.src}
                      alt={item.label}
                      width={220}
                      height={220}
                      priority={index < 2}
                      className={`h-auto w-full max-w-[150px] object-contain sm:max-w-[170px] ${item.className}`}
                    />
                  </div>
                  <figcaption className="border-t border-zinc-100/80 px-4 py-2.5 text-[11px] font-medium tracking-wide text-zinc-500">
                    {item.label}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>

          <p className="mt-4 text-center text-[12px] leading-relaxed text-zinc-500 lg:text-left">
            Appliances and genuine spare parts will reopen here shortly.
          </p>
        </div>
      </main>
    </div>
  );
}
