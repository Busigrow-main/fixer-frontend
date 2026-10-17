import ShopNavbar from "../components/shop/ShopNavbar";
import ShopHero from "../components/shop/ShopHero";
import ShopCategorySwitch from "../components/shop/ShopCategorySwitch";
import ShopApplianceCategories from "../components/shop/ShopApplianceCategories";
import ShopAppliancePromo from "../components/shop/ShopAppliancePromo";
import ShopDealsSection from "../components/shop/ShopDealsSection";

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-[#f4f4f6]">
      <ShopNavbar />

      <main className="mx-auto flex w-full max-w-[560px] flex-col gap-4 px-3 pb-28 pt-2 sm:max-w-[720px] sm:gap-5 sm:px-4 md:max-w-[1280px] md:gap-8 md:px-8 md:pb-16 md:pt-8 lg:gap-10 lg:px-12">
        <ShopHero />
        <ShopCategorySwitch />
        <ShopApplianceCategories />
        <ShopAppliancePromo />
        <ShopDealsSection />
      </main>
    </div>
  );
}