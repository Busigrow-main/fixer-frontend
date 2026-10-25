"use client";

import { useState } from "react";
import ShopNavbar from "@/app/components/shop/ShopNavbar";
import ShopHero from "@/app/components/shop/ShopHero";
import ShopCategorySwitch from "@/app/components/shop/ShopCategorySwitch";
import ShopLandingSections from "@/app/components/shop/ShopLandingSections";
import SearchBar from "@/app/components/shop/spare-parts/SearchBar";
import { useShopHome } from "@/app/lib/use-shop-home";

export default function ShopHomePage() {
  const [search, setSearch] = useState("");
  const { shopData, loading, error, loadShopHome } = useShopHome();

  return (
    <div className="shop-shell min-h-screen bg-[#f4f4f6] md:bg-[#f6f6f6]">
      <ShopNavbar searchValue={search} onSearchChange={setSearch} />
      <main className="mx-auto flex w-full max-w-[560px] flex-col gap-3 px-3 pb-28 pt-3 sm:max-w-[720px] sm:px-4 md:max-w-[1440px] md:gap-8 md:px-8 md:pb-28 md:pt-10 lg:gap-10 lg:px-12 lg:pt-12">
        <div className="sticky top-14 z-40 -mx-3 bg-[#f6f6f6] px-3 py-2 md:hidden">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search appliances, spare parts, brands, or models"
          />
        </div>
        {!search.trim() && <ShopHero />}
        {!search.trim() && <div className="w-full lg:hidden">
          <ShopCategorySwitch showActive={false} />
        </div>}
        <ShopLandingSections
          searchValue={search}
          shopData={shopData}
          loading={loading}
          error={error}
          onRetry={loadShopHome}
        />
      </main>
    </div>
  );
}
