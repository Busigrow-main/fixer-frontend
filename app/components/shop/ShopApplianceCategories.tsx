import Link from "next/link";
import Image from "next/image";

import refrigerator from "../../public/images/shop/products/refrigerator.png";
import washingMachine from "../../public/images/shop/products/washing-machine.png";
import airConditioner from "../../public/images/shop/products/air-conditioner.png";
import microwave from "../../public/images/shop/products/microwave.png";
import { SHOP_APPLIANCES_HREF } from "@/app/lib/shop-routes";

const presentation = [
  { slug: "refrigerator", label: "Refrigerators", image: refrigerator },
  { slug: "washing-machine", label: "Washing Machines", image: washingMachine },
  { slug: "ac", label: "Air Conditioners", image: airConditioner },
  { slug: "microwave", label: "Microwaves", image: microwave },
];

export default function ShopApplianceCategories() {
  return (
    <nav
      aria-label="Shop appliances"
      className="mx-auto grid w-full max-w-[760px] grid-cols-4 justify-items-center gap-3 sm:gap-4 md:gap-6"
    >
      {presentation.map(({ slug, label, image }) => (
        <Link
          key={slug}
          href={`${SHOP_APPLIANCES_HREF}?type=${slug}`}
          className="group flex w-full max-w-[124px] flex-col items-center"
        >
          <span className="relative block aspect-square w-full overflow-hidden rounded-[22px] border border-[#ffb8c2] bg-[#f4f4f4] transition-shadow duration-200 group-hover:shadow-md group-active:scale-95 sm:rounded-[22px]">
            <Image
              src={image}
              alt=""
              fill
              sizes="(max-width: 639px) 22vw, 124px"
              className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03] sm:p-3"
            />
          </span>

          <span className="mt-2 min-h-[2.4em] w-full px-0.5 text-center text-[13px] font-bold leading-[1.15] text-[#222326] sm:text-xs md:text-[13px]">
            {label}
          </span>
        </Link>
      ))}
    </nav>
  );
}
