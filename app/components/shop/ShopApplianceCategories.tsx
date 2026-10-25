import Link from "next/link";
import Image from "next/image";
import type { StaticImageData } from "next/image";

import refrigerator from "../../public/images/shop/products/refrigerator.png";
import washingMachine from "../../public/images/shop/products/washing-machine.png";
import airConditioner from "../../public/images/shop/products/air-conditioner.png";
import microwave from "../../public/images/shop/products/microwave.png";
import { SHOP_APPLIANCES_HREF } from "@/app/lib/shop-routes";

const presentation: { slug: string; label: string; desktopLabel: string; image: StaticImageData; countSlugs: string[] }[] = [
  { slug: "refrigerator", label: "Refrigerators", desktopLabel: "Refrigerators", image: refrigerator, countSlugs: ["refrigerator", "refrigerators"] },
  { slug: "washing-machine", label: "Washing Machines", desktopLabel: "Washing machines", image: washingMachine, countSlugs: ["washing-machine"] },
  { slug: "ac", label: "Air Conditioners", desktopLabel: "Air conditioners", image: airConditioner, countSlugs: ["ac"] },
  { slug: "microwave", label: "Microwaves", desktopLabel: "Microwaves", image: microwave, countSlugs: ["microwave", "microwave-oven"] },
];

export default function ShopApplianceCategories({
  counts = [],
}: {
  counts?: { slug: string; productCount: number }[];
}) {
  return (
    <>
      <nav
        aria-label="Shop appliances"
        className="mx-auto grid w-full max-w-[760px] grid-cols-4 justify-items-center gap-3 sm:gap-4 md:hidden"
      >
        {presentation.map(({ slug, label, image }) => (
          <Link
            key={slug}
            href={`${SHOP_APPLIANCES_HREF}?type=${slug}`}
            className="group flex w-full max-w-[124px] flex-col items-center"
          >
            <span className="relative block aspect-square w-full overflow-hidden rounded-[22px] border border-[#ffb8c2] bg-[#f4f4f4] transition-shadow duration-200 group-hover:shadow-md group-active:scale-95">
              <Image
                src={image}
                alt=""
                fill
                sizes="22vw"
                className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03] sm:p-3"
              />
            </span>
            <span className="mt-2 min-h-[2.4em] w-full px-0.5 text-center text-[13px] font-bold leading-[1.15] text-[#222326] sm:text-xs">
              {label}
            </span>
          </Link>
        ))}
      </nav>

      <nav aria-label="Shop appliances" className="hidden w-full grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:gap-6 md:grid">
        {presentation.map(({ slug, desktopLabel, image, countSlugs }) => {
          const count = counts.find((item) => countSlugs.includes(item.slug))?.productCount;
          return (
            <Link
              key={slug}
              href={`${SHOP_APPLIANCES_HREF}?type=${slug}`}
              className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]"
            >
              <span className="relative block aspect-[5/4] w-full bg-[#f6f6f6] lg:min-h-[180px]">
                <Image
                  src={image}
                  alt={desktopLabel}
                  fill
                  sizes="25vw"
                  className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03] lg:p-6"
                />
              </span>
              <span className="flex items-baseline justify-between gap-2 px-3 py-3">
                <span className="text-sm font-bold text-zinc-900 lg:text-base">{desktopLabel}</span>
                {typeof count === "number" && (
                  <span className="text-xs text-zinc-500">{count} products</span>
                )}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
