"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ACImageGallery } from "@/app/components/appliances/ACImageGallery";
import { ACSpecsTable } from "@/app/components/appliances/ACSpecsTable";
import { TrustBadgeStrip } from "@/app/components/appliances/TrustBadgeStrip";

interface ACProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  modelNumber: string;
  price: number;
  originalPrice?: number;
  capacityTon: number;
  starRating: number;
  acType: string;
  isInverter: boolean;
  description?: string;
  shortDescription?: string;
  images: string[];
  specs?: Record<string, string>;
  inStock: boolean;
  installationIncluded: boolean;
  warrantyYears: number;
}

export default function ACDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<ACProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "description" | "specs" | "installation" | "warranty"
  >("description");

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      // For MVP, use mock data. Later replace with API call.
      // const response = await fetch(`/api/v1/appliances/ac/${slug}`);
      // if (!response.ok) throw new Error('Product not found');
      // const data = await response.json();

      // Mock product data
      const mockProducts: Record<string, ACProduct> = {
        "godrej-1-5t-5s-inverter-split": {
          id: "ac_001",
          slug: "godrej-1-5t-5s-inverter-split",
          name: "Godrej 1.5 Ton 5 Star Inverter Split AC",
          brand: "Godrej",
          modelNumber: "GIC 18TTC5-WTA",
          price: 38990,
          originalPrice: 45500,
          capacityTon: 1.5,
          starRating: 5,
          acType: "split",
          isInverter: true,
          description: `<p>The Godrej 1.5 Ton 5 Star Inverter Split AC is engineered for superior cooling efficiency and eco-friendly operation. With a sophisticated inverter compressor, this model adjusts cooling capacity based on room temperature, delivering significant energy savings.</p>
<ul>
<li>Advanced Wi-Fi connectivity for remote control via mobile app</li>
<li>Auto-Clean technology prevents dust and mold accumulation</li>
<li>Energy rating: 5 Star (highest BEE rating)</li>
<li>Whisper-quiet operation at just 32 dB</li>
<li>Advanced filtration system captures particles up to 0.3 microns</li>
</ul>`,
          shortDescription:
            "Efficient cooling with Auto Clean and Wi-Fi control.",
          images: [
            "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=500&h=500&fit=crop",
          ],
          specs: {
            coolingCapacityBtu: "18000 BTU/hr",
            energyConsumption: "1550 W",
            annualEnergyUnits: "837.44 units",
            refrigerant: "R32 (Eco-friendly)",
            compressorType: "Inverter",
            noiseLevelIndoor: "32 dB",
            indoorUnitDimensions: "295 x 1055 x 220 mm",
            outdoorUnitDimensions: "550 x 765 x 290 mm",
            colour: "White",
            wifiEnabled: "Yes",
            autoClean: "Yes",
          },
          inStock: true,
          warrantyYears: 5,
          installationIncluded: true,
        },
      };

      const product = mockProducts[slug];
      if (!product) throw new Error("Product not found");

      setProduct(product);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-300 rounded-lg h-96 animate-pulse" />
            <div className="space-y-4">
              <div className="bg-gray-300 rounded h-12 animate-pulse" />
              <div className="bg-gray-300 rounded h-8 animate-pulse w-1/2" />
              <div className="bg-gray-300 rounded h-8 animate-pulse w-2/3" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-red-500 block mb-4">
              error_outline
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Product Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              {error || "The product you are looking for does not exist."}
            </p>
            <Link
              href="/spare-parts/appliances/ac"
              className="inline-block bg-[#C8102E] hover:bg-[#A00826] text-white font-semibold py-3 px-8 rounded transition-colors"
            >
              Back to AC Products
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-600 flex-wrap">
          <Link href="/" className="hover:text-[#C8102E]">
            Home
          </Link>
          <span>/</span>
          <Link href="/spare-parts" className="hover:text-[#C8102E]">
            Spare Parts
          </Link>
          <span>/</span>
          <Link href="/spare-parts/appliances" className="hover:text-[#C8102E]">
            Appliances
          </Link>
          <span>/</span>
          <Link
            href="/spare-parts/appliances/ac"
            className="hover:text-[#C8102E]"
          >
            AC
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium line-clamp-1">
            {product.name}
          </span>
        </nav>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column: Image Gallery */}
          <div>
            <ACImageGallery
              images={product.images}
              productName={product.name}
            />
          </div>

          {/* Right Column: Product Info & CTA */}
          <div>
            {/* Product Title & Brand */}
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">
                    {product.brand} • {product.modelNumber}
                  </p>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {product.name}
                  </h1>
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <span
                        key={i}
                        className={`material-symbols-outlined ${
                          i < product.starRating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      >
                        star
                      </span>
                    ))}
                </div>
                <span className="text-sm font-semibold text-gray-700 ml-2">
                  {product.starRating} out of 5
                </span>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.inStock ? (
                  <span className="inline-flex items-center gap-2 text-green-700 font-semibold">
                    <span className="material-symbols-outlined text-lg">
                      local_shipping
                    </span>
                    In Stock - Ready to Deliver
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-red-700 font-semibold">
                    <span className="material-symbols-outlined text-lg">
                      block
                    </span>
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Price Block */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 mb-6 border border-blue-200">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-gray-900">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      ₹{product.originalPrice.toLocaleString("en-IN")}
                    </span>
                    {discountPercent > 0 && (
                      <span className="bg-[#C8102E] text-white text-sm font-bold px-2 py-1 rounded">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </>
                )}
              </div>
              {discountPercent > 0 && (
                <p className="text-sm text-gray-600">
                  You save ₹
                  {(product.originalPrice! - product.price).toLocaleString(
                    "en-IN",
                  )}
                </p>
              )}
            </div>

            {/* Quick Specs */}
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Specs</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Capacity</p>
                  <p className="font-bold text-gray-900">
                    {product.capacityTon} Ton
                  </p>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Type</p>
                  <p className="font-bold text-gray-900 capitalize">
                    {product.acType}
                  </p>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Star Rating</p>
                  <p className="font-bold text-gray-900">
                    {product.starRating}⭐
                  </p>
                </div>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Inverter</p>
                  <p className="font-bold text-gray-900">
                    {product.isInverter ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">
                Why Buy from Fixxer?
              </h3>
              <TrustBadgeStrip
                installationIncluded={product.installationIncluded}
                warrantyYears={product.warrantyYears}
                size="md"
              />
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Link
                href={`/spare-parts/enquiry?product=${product.slug}&type=appliance`}
                className="bg-[#C8102E] hover:bg-[#A00826] text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">mail</span>
                Enquire Now
              </Link>
              <button className="border-2 border-[#C8102E] text-[#C8102E] hover:bg-red-50 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">shopping_cart</span>
                Add to Cart
              </button>
            </div>

            {/* Delivery Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 flex items-start gap-2">
                <span className="material-symbols-outlined text-lg flex-shrink-0 mt-0.5">
                  check_circle
                </span>
                <span>
                  <strong>Delivery available</strong> across Patna & Bihar.
                  Professional installation included. Free service for 60 days.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Tab Buttons */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              {
                id: "description" as const,
                label: "Description",
                icon: "description",
              },
              {
                id: "specs" as const,
                label: "Specifications",
                icon: "dataset",
              },
              {
                id: "installation" as const,
                label: "Installation",
                icon: "build",
              },
              {
                id: "warranty" as const,
                label: "Warranty",
                icon: "card_giftcard",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-6 py-4 font-semibold transition-colors border-b-2 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "border-[#C8102E] text-[#C8102E]"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {tab.icon}
                </span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "description" && product.description && (
              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}

            {activeTab === "specs" && product.specs && (
              <ACSpecsTable specs={product.specs} />
            )}

            {activeTab === "installation" && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-lg">
                  Professional Installation
                </h3>
                <p className="text-gray-700">
                  Our expert technicians will install your AC unit at your home.
                  We ensure:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-green-600 flex-shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <span>
                      Proper placement and positioning of indoor and outdoor
                      units
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-green-600 flex-shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <span>Refrigerant charging and pressure testing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-green-600 flex-shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <span>Electrical connections and safety verification</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-green-600 flex-shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <span>Demonstration and user training</span>
                  </li>
                </ul>
                <p className="text-sm text-gray-600 mt-4">
                  Installation is completed within 2-3 days of order
                  confirmation.
                </p>
              </div>
            )}

            {activeTab === "warranty" && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-lg">
                  Warranty Coverage
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-bold text-blue-900 mb-2">
                      Manufacturer Warranty
                    </h4>
                    <p className="text-sm text-blue-800">
                      <strong>{product.warrantyYears} Years</strong> on
                      compressor and 1 year on all parts as per Godrej terms
                    </p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h4 className="font-bold text-amber-900 mb-2">
                      Fixxer Warranty
                    </h4>
                    <p className="text-sm text-amber-800">
                      <strong>60 Days</strong> free service and support from
                      date of installation
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  For warranty claims, contact our support team at +91 70047
                  71388 (8 AM – 11 PM)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
