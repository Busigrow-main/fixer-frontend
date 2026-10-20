import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ShopProductCard from "./ShopProductCard";
import refrigeratorImage from "../../public/images/shop/products/refrigerator.png";
import drainPumpImage from "../../public/images/shop/spare-part-motor.png";
import circuitBoardImage from "../../public/images/shop/products/circuit-board.png";
import copperCompressorImage from "../../public/images/shop/products/copper-compressor.png";
import { SHOP_APPLIANCES_HREF, SHOP_SPARE_PARTS_HREF } from "@/app/lib/shop-routes";

const deals = [
  { id: "samsung-fridge", sku: "FX-SAM-236", brand: "Samsung", name: "Samsung 236L Frost Free Double Door Refrigerator", price: 27490, mrp: 35699, warrantyMonths: 12, isInStock: true, bestSeller: true, rating: "4.8", reviews: 456, imageUrl: refrigeratorImage.src, detailHref: SHOP_APPLIANCES_HREF },
  { id: "askoli-drain-pump", sku: "FX-ASK-DP30", brand: "Askoli", name: "Askoli OEM 30W Universal Drain Pump", price: 1295, mrp: 1850, warrantyMonths: 6, isInStock: true, isUniversal: true, rating: "4.9", reviews: 218, imageUrl: drainPumpImage.src },
  { id: "voltas-pcb", sku: "FX-VLT-PCB", brand: "Voltas", name: "Voltas Inverter AC Main PCB Motherboard", price: 3450, mrp: 4800, warrantyMonths: 6, isInStock: true, rating: "4.7", reviews: 120, imageUrl: circuitBoardImage.src },
  { id: "pure-copper-motor", sku: "FX-COP-MTR", brand: "Pure Copper", name: "Pure Copper Refrigerator Compressor Motor", price: 4199, mrp: 5600, warrantyMonths: 12, isInStock: true, rating: "4.8", reviews: 340, imageUrl: copperCompressorImage.src },
];

export default function ShopDealsSection({ searchValue = "" }: { searchValue?: string }) {
  const query = searchValue.trim().toLowerCase();
  const visibleDeals = deals.filter((part) =>
    !query || `${part.brand} ${part.name} ${part.sku}`.toLowerCase().includes(query),
  );

  return (
    <section aria-labelledby="shop-deals-title" className="space-y-3 md:space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2
          id="shop-deals-title"
          className="text-base font-bold text-slate-900 sm:text-lg md:text-2xl lg:text-3xl"
        >
          Best Deals This Week
        </h2>
        <Link
          href={SHOP_SPARE_PARTS_HREF}
          className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#e9002d] hover:underline sm:text-sm md:text-base"
        >
          View All <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 items-stretch gap-2.5 sm:gap-4 lg:grid-cols-4 lg:gap-6">
        {visibleDeals.map((part) => (
          <ShopProductCard key={part.id} part={part} />
        ))}
      </div>
      {visibleDeals.length === 0 && (
        <p className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
          No products match “{searchValue}”. Try another search.
        </p>
      )}
    </section>
  );
}
