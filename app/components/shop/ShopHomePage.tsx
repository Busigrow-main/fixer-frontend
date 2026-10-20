"use client";

import { useState } from "react";
import ShopNavbar from "@/app/components/shop/ShopNavbar";
import ShopHero from "@/app/components/shop/ShopHero";
import ShopCategorySwitch from "@/app/components/shop/ShopCategorySwitch";
import ShopApplianceCategories from "@/app/components/shop/ShopApplianceCategories";
import ShopAppliancePromo from "@/app/components/shop/ShopAppliancePromo";
import ShopDealsSection from "@/app/components/shop/ShopDealsSection";

export default function ShopHomePage() {
  const [search, setSearch] = useState("");

  return (
    <div className="-mt-14 min-h-screen bg-[#f4f4f6] md:mt-0">
      <ShopNavbar flowOnMobile searchValue={search} onSearchChange={setSearch} />
      <main className="mx-auto flex w-full max-w-[560px] flex-col gap-3 px-3 pb-28 pt-3 sm:max-w-[720px] sm:px-4 md:max-w-[1480px] md:gap-5 md:px-8 md:pb-16 md:pt-8 lg:px-12">
        <ShopHero />
        <div className="md:max-w-sm">
          <ShopCategorySwitch showActive={false} />
        </div>
        <ShopApplianceCategories />
        <ShopAppliancePromo />
        <ShopDealsSection searchValue={search} />
      </main>
    </div>
  );
}
