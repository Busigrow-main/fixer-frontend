"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/app/context/BookingContext";
import ShopNavbar from "@/app/components/shop/ShopNavbar";
import ShopCategorySwitch from "@/app/components/shop/ShopCategorySwitch";
import SpareHeader from "@/app/components/shop/spare-parts/SpareHeader";
import SearchBar from "@/app/components/shop/spare-parts/SearchBar";
import CategoryChips, { type Category } from "@/app/components/shop/spare-parts/CategoryChips";
import FilterBar from "@/app/components/shop/spare-parts/FilterBar";
import ProductGrid, { type SparePart } from "@/app/components/shop/spare-parts/ProductGrid";
import ServicePromoBanner from "@/app/components/shop/spare-parts/ServicePromoBanner";
import refrigerator from "../../public/images/shop/products/refrigerator.png";
import airConditioner from "../../public/images/shop/products/air-conditioner.png";
import washingMachine from "../../public/images/shop/products/washing-machine.png";
import microwave from "../../public/images/shop/products/microwave.png";
import technician from "../../public/images/shop/technician-banner-square.png";

type Appliance = SparePart & { category: string; brand: string; capacity: string };
type SortKey = "relevance" | "price-asc" | "price-desc" | "rating";
type Filters = { brands: Set<string>; capacities: Set<string>; inStock: boolean };

const CATEGORIES: Category[] = [
  { key: "all", label: "All" },
  { key: "fridge", label: "Refrigerators" },
  { key: "washer", label: "Washing Machines" },
  { key: "ac", label: "ACs" },
  { key: "microwave", label: "Microwaves" },
];

const ITEMS: Appliance[] = [
  { id: "appliance-fridge", name: "Samsung 236L Frost Free Double Door Refrigerator", image: refrigerator.src, price: 27490, mrp: 35699, rating: 4.8, reviews: 456, badge: "BESTSELLER", highlight: "1 year warranty", category: "fridge", brand: "Samsung", capacity: "236 L" },
  { id: "appliance-ac", name: "Daikin 1.5 Ton 5-Star Inverter AC", image: airConditioner.src, price: 38990, mrp: 49900, rating: 4.8, reviews: 230, highlight: "Copper condenser", category: "ac", brand: "Daikin", capacity: "1.5 Ton" },
  { id: "appliance-washer", name: "LG 8kg AI Direct Drive Front Load Washing Machine", image: washingMachine.src, price: 32990, mrp: 41990, rating: 4.6, reviews: 834, highlight: "AI Direct Drive", category: "washer", brand: "LG", capacity: "8 kg" },
  { id: "appliance-microwave", name: "Panasonic 23L Convection Microwave Oven", image: microwave.src, price: 10490, mrp: 14600, rating: 4.5, reviews: 318, highlight: "Convection cooking", category: "microwave", brand: "Panasonic", capacity: "23 L" },
];

const SORTS: { key: SortKey; label: string }[] = [
  { key: "relevance", label: "Most relevant" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "rating", label: "Top rated" },
];
const BRANDS = ["Samsung", "Daikin", "LG", "Panasonic"];
const CAPACITIES = ["236 L", "1.5 Ton", "8 kg", "23 L"];

function FilterOptions({ title, options, selected, onChange }: { title: string; options: string[]; selected: Set<string>; onChange: (next: Set<string>) => void }) {
  return (
    <fieldset>
      <legend className="text-sm font-bold text-zinc-900">{title}</legend>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {options.map((option) => {
          const checked = selected.has(option);
          return (
            <label key={option} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm ${checked ? "border-primary bg-primary/5 font-semibold text-primary" : "border-zinc-200 text-zinc-700"}`}>
              <input type="checkbox" checked={checked} onChange={() => { const next = new Set(selected); checked ? next.delete(option) : next.add(option); onChange(next); }} className="h-4 w-4 accent-primary" />
              {option}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function ApplianceShopPage() {
  const router = useRouter();
  const { openBooking } = useBooking();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortKey>("relevance");
  const [sheet, setSheet] = useState(false);
  const [cart, setCart] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<Filters>({ brands: new Set(), capacities: new Set(), inStock: true });

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = ITEMS.filter((item) =>
      (!q || `${item.name} ${item.brand} ${item.capacity}`.toLowerCase().includes(q)) &&
      (category === "all" || item.category === category) &&
      (!filters.brands.size || filters.brands.has(item.brand)) &&
      (!filters.capacities.size || filters.capacities.has(item.capacity)),
    );
    const compare = {
      relevance: () => 0,
      "price-asc": (a: Appliance, b: Appliance) => a.price - b.price,
      "price-desc": (a: Appliance, b: Appliance) => b.price - a.price,
      rating: (a: Appliance, b: Appliance) => (b.rating ?? 0) - (a.rating ?? 0),
    }[sort];
    return [...result].sort(compare);
  }, [query, category, filters, sort]);

  const brandsLabel = filters.brands.size ? [...filters.brands].join(", ") : "Brand";
  const capacityLabel = filters.capacities.size ? [...filters.capacities].join(", ") : "Capacity";
  const activeFilterCount = filters.brands.size + filters.capacities.size + (filters.inStock ? 1 : 0);
  const clearAll = () => {
    setCategory("all");
    setSort("relevance");
    setFilters({ brands: new Set(), capacities: new Set(), inStock: false });
  };

  return (
    <div className="min-h-screen bg-[#f4f4f6]">
      <ShopNavbar hideMobileHeader searchValue={query} onSearchChange={setQuery} />
      <div className="-mt-14 md:hidden"><SpareHeader title="Appliances" location="Patna - 800001" onBack={() => router.back()} /></div>

      <main className="mx-auto flex w-full max-w-[560px] flex-col gap-3 px-3 pb-28 pt-3 sm:max-w-[720px] sm:px-4 md:max-w-[1480px] md:gap-5 md:px-8 md:pb-16 md:pt-8 lg:px-12">
        <div className="md:hidden"><SearchBar value={query} onChange={setQuery} onVoice={() => {}} placeholder="Search for appliances, brands, or models..." /></div>
        <div className="md:max-w-sm"><ShopCategorySwitch /></div>

        <section className="hidden border-b border-slate-200 pb-5 md:block">
          <div>
            <p className="text-xs font-medium text-slate-500">Home <span className="px-1.5 text-slate-300">/</span> Shop <span className="px-1.5 text-slate-300">/</span> Appliances</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Appliances for your home</h1>
            <p className="mt-1 text-sm text-slate-500">Explore trusted brands and find the right fit.</p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[230px_minmax(0,1fr)] md:gap-6">
          <aside className="hidden self-start rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.03)] md:sticky md:top-[92px] md:block">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div><h2 className="text-base font-bold text-slate-900">Categories</h2><p className="mt-0.5 text-xs text-slate-500">Shop by appliance</p></div>
              <button type="button" onClick={clearAll} className="text-xs font-semibold text-primary hover:underline">Clear</button>
            </div>
            <div className="space-y-1 border-b border-slate-100 py-3">
              {CATEGORIES.map((item) => <button key={item.key} type="button" onClick={() => setCategory(item.key)} className={`flex min-h-9 w-full items-center rounded-lg px-2.5 text-left text-sm ${category === item.key ? "bg-red-50 font-semibold text-primary" : "text-slate-600 hover:bg-slate-50"}`}>{item.label}</button>)}
            </div>
            <div className="space-y-5 pt-4">
              {([["Brand", BRANDS, filters.brands], ["Capacity", CAPACITIES, filters.capacities]] as const).map(([title, options, selected]) => (
                <fieldset key={title}>
                  <legend className="text-sm font-semibold text-slate-900">{title}</legend>
                  <div className="mt-2 space-y-2">
                    {options.map((option) => <label key={option} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600"><input type="checkbox" checked={selected.has(option)} onChange={() => { const next = new Set(selected); next.has(option) ? next.delete(option) : next.add(option); setFilters({ ...filters, [title === "Brand" ? "brands" : "capacities"]: next }); }} className="h-4 w-4 rounded accent-primary" />{option}</label>)}
                  </div>
                </fieldset>
              ))}
            </div>
          </aside>

          <div className="min-w-0">
            <div className="mb-3 flex flex-col gap-2.5 md:hidden">
              <CategoryChips items={CATEGORIES.slice(1)} selected={category === "all" ? "fridge" : category} onSelect={setCategory} />
              <FilterBar activeFilterCount={activeFilterCount} brandLabel={brandsLabel} capacityLabel={capacityLabel} onSort={() => setSheet(true)} onFilter={() => setSheet(true)} onBrand={() => setSheet(true)} onCapacity={() => setSheet(true)} />
            </div>
            <section className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 md:mb-4 md:py-3.5">
              <div><h2 className="text-sm font-bold text-slate-900 md:text-base">Shop appliances</h2><p className="mt-0.5 text-xs text-slate-500">{visible.length} products available</p></div>
              <label className="hidden shrink-0 items-center gap-2 text-xs font-medium text-slate-500 md:flex">Sort by<select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-primary">{SORTS.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}</select></label>
            </section>
            <ProductGrid parts={visible} cartIds={cart} onAddToCart={(id) => setCart((prev) => new Set(prev).add(id))} />
          </div>
        </div>

        <ServicePromoBanner image={technician.src} onBook={() => openBooking()} />
      </main>

      {sheet && <div className="fixed inset-0 z-[60] flex items-end bg-black/40 md:items-center md:justify-center md:p-6" onMouseDown={(e) => e.target === e.currentTarget && setSheet(false)}>
        <div role="dialog" aria-modal="true" aria-label="Sort and filter appliances" className="flex max-h-[85dvh] w-full flex-col rounded-t-3xl bg-white shadow-2xl md:max-w-xl md:rounded-3xl">
          <div className="flex items-center justify-between px-5 pb-3 pt-4"><h2 className="text-xl font-bold text-zinc-900">Sort &amp; Filter</h2><button type="button" aria-label="Close" onClick={() => setSheet(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600"><span className="material-symbols-outlined text-[20px]">close</span></button></div>
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 pb-4">
            <fieldset><legend className="text-sm font-bold text-zinc-900">Sort by</legend><div className="mt-2 space-y-1">{SORTS.map((option) => <label key={option.key} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 text-sm text-zinc-700"><input type="radio" name="appliance-sort" checked={sort === option.key} onChange={() => setSort(option.key)} className="h-4 w-4 accent-primary" />{option.label}</label>)}</div></fieldset>
            <FilterOptions title="Brand" options={BRANDS} selected={filters.brands} onChange={(brands) => setFilters({ ...filters, brands })} />
            <FilterOptions title="Capacity" options={CAPACITIES} selected={filters.capacities} onChange={(capacities) => setFilters({ ...filters, capacities })} />
            <label className="flex min-h-11 cursor-pointer items-center justify-between rounded-xl border border-zinc-200 px-3 text-sm font-semibold text-zinc-700">In-stock appliances only<input type="checkbox" checked={filters.inStock} onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })} className="h-4 w-4 accent-primary" /></label>
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-2.5 border-t border-zinc-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"><button type="button" onClick={clearAll} className="h-12 rounded-xl border border-zinc-200 px-5 text-sm font-semibold text-zinc-700">Clear all</button><button type="button" onClick={() => setSheet(false)} className="h-12 rounded-xl bg-primary text-sm font-semibold text-white">Show {visible.length} products</button></div>
        </div>
      </div>}
    </div>
  );
}
