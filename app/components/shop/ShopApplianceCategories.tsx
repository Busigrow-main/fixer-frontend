import Link from "next/link";
import Image from "next/image";

import refrigerator from "../../public/images/shop/products/refrigerator.png";
import washingMachine from "../../public/images/shop/products/washing-machine.png";
import airConditioner from "../../public/images/shop/products/air-conditioner.png";
import microwave from "../../public/images/shop/products/microwave.png";
import { SHOP_APPLIANCES_HREF } from "@/app/lib/shop-routes";

const categories = [
  { label: "Refrigerators", image: refrigerator, href: SHOP_APPLIANCES_HREF },
  { label: "Washing Machines", image: washingMachine, href: SHOP_APPLIANCES_HREF },
  { label: "Air Conditioners", image: airConditioner, href: SHOP_APPLIANCES_HREF },
  { label: "Microwaves", image: microwave, href: SHOP_APPLIANCES_HREF },
];

export default function ShopApplianceCategories() {
  return (
    <nav aria-label="Shop appliances" className="grid grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
      {categories.map(({ label, image, href }) => (
        <Link key={label} href={href} className="group flex min-w-0 flex-col items-center">
          <span className="relative block aspect-square w-full overflow-hidden rounded-xl border border-[#ead6d8] bg-[#f2f3f4] transition-all duration-200 group-hover:border-[#e9002d]/40 group-hover:shadow-md group-active:scale-95 sm:rounded-2xl lg:aspect-[16/9]">
            <Image
              src={image}
              alt=""
              fill
              sizes="(max-width: 639px) 22vw, (max-width: 1023px) 20vw, 280px"
              className="object-contain p-2 transition-transform duration-300 group-hover:scale-105 sm:p-4 lg:p-5"
            />
          </span>

          <span className="mt-1.5 w-full px-0.5 text-center text-[11px] font-medium leading-[1.2] text-[#30343b] sm:text-xs md:text-sm md:font-semibold lg:mt-3 lg:text-base">
            {label}
          </span>
        </Link>
      ))}
    </nav>
  );
}