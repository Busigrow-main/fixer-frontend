"use client";

import Link from "next/link";
import { ApplianceCategoryCard } from "@/app/components/appliances/ApplianceCategoryCard";

// Category data
const APPLIANCE_CATEGORIES = [
  {
    id: "ac",
    name: "Air Conditioner",
    slug: "ac",
    icon: "ac_unit",
    description: "Godrej AC units - cooling solutions for your home",
    status: "active" as const,
    productCount: 7,
    href: "/spare-parts/appliances/ac",
  },
  {
    id: "fridge",
    name: "Refrigerator",
    slug: "fridge",
    icon: "kitchen",
    description: "Refrigerators & cooling appliances - Coming soon",
    status: "coming-soon" as const,
    productCount: 0,
    href: "#",
  },
  {
    id: "washing-machine",
    name: "Washing Machine",
    slug: "washing-machine",
    icon: "local_laundry_service",
    description: "Washing machines & laundry solutions - Coming soon",
    status: "coming-soon" as const,
    productCount: 0,
    href: "#",
  },
];

export default function AppliancesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-[#C8102E] transition-colors">
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <Link
            href="/spare-parts"
            className="hover:text-[#C8102E] transition-colors"
          >
            Spare Parts
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">Appliances</span>
        </nav>

        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Shop Complete Appliances
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Buy full appliances with professional Fixxer installation and
            extended warranty.
            <br className="hidden md:inline" />
            Choose from trusted brands, all delivered and installed in your
            home.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {APPLIANCE_CATEGORIES.map((category) => (
            <ApplianceCategoryCard key={category.id} category={category} />
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-blue-50 rounded-lg border border-blue-200 p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <span className="material-symbols-outlined text-4xl text-blue-600 block mb-3">
                verified_user
              </span>
              <h3 className="font-semibold text-gray-900 mb-2">
                Professional Installation
              </h3>
              <p className="text-sm text-gray-600">
                Expert technicians install your appliance and ensure it works
                perfectly.
              </p>
            </div>
            <div>
              <span className="material-symbols-outlined text-4xl text-blue-600 block mb-3">
                shield
              </span>
              <h3 className="font-semibold text-gray-900 mb-2">
                Extended Warranty
              </h3>
              <p className="text-sm text-gray-600">
                60-day Fixxer service warranty on top of manufacturer warranty.
              </p>
            </div>
            <div>
              <span className="material-symbols-outlined text-4xl text-blue-600 block mb-3">
                support_agent
              </span>
              <h3 className="font-semibold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-sm text-gray-600">
                Dedicated customer support team available round the clock.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
