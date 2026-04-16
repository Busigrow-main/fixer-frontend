export interface SparePart {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: string;
  manufacturer: string;
  seller: string;
  deliveryEta: string;
  warranty: string;
  supportsServiceBooking: boolean;
  compatibleModels: string[];
  highlights: string[];
  image: string;
  description: string;
}

export const SPARE_PARTS: SparePart[] = [
  {
    id: "compressor-inverter-10",
    slug: "inverter-compressor-module",
    name: "Inverter Compressor Module",
    category: "Refrigerator",
    price: "₹6,499",
    manufacturer: "CoolCore Appliances Pvt Ltd",
    seller: "Fixxer OEM Hub",
    deliveryEta: "2-3 business days",
    warranty: "12 months OEM warranty",
    supportsServiceBooking: true,
    compatibleModels: ["FrostPro 340L", "FrostPro 420L", "EcoFreeze Plus 390"],
    highlights: [
      "Factory-sealed copper winding",
      "Low-noise inverter driver",
      "Energy class A+ support",
    ],
    image:
      "https://images.unsplash.com/photo-1571172964276-91faaa704e1d?q=80&w=1600&auto=format&fit=crop",
    description:
      "High-efficiency compressor unit for premium refrigerators, calibrated for stable cooling and lower power draw.",
  },
  {
    id: "wm-drum-belt-8kg",
    slug: "drum-belt-8kg",
    name: "Washer Drum Belt 8kg",
    category: "Washing Machine",
    price: "₹899",
    manufacturer: "SpinTech Industries",
    seller: "Fixxer Parts Partner",
    deliveryEta: "Same day dispatch",
    warranty: "6 months replacement warranty",
    supportsServiceBooking: true,
    compatibleModels: [
      "WashMate TopLoad 8",
      "HydroClean 7.5",
      "AquaSpin Pro 8",
    ],
    highlights: [
      "Heat-resistant polymer blend",
      "Anti-slip groove profile",
      "High tensile weave",
    ],
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1600&auto=format&fit=crop",
    description:
      "Durable replacement drive belt engineered for smooth drum rotation and reduced vibration in 7-8kg machines.",
  },
  {
    id: "ac-pcb-main",
    slug: "main-control-pcb",
    name: "Main Control PCB",
    category: "Air Conditioner",
    price: "₹3,250",
    manufacturer: "ThermaLogic Electronics",
    seller: "Fixxer OEM Hub",
    deliveryEta: "1-2 business days",
    warranty: "9 months seller warranty",
    supportsServiceBooking: true,
    compatibleModels: ["BreezeX 1.5T", "BreezeX 2T", "PolarNest Inverter 1.5T"],
    highlights: [
      "Firmware pre-flashed",
      "Short-circuit protection",
      "Humidity-safe conformal coating",
    ],
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop",
    description:
      "Primary logic board for split AC systems, enabling compressor control, sensor reads, and thermostat communication.",
  },
  {
    id: "mw-magnetron-2m246",
    slug: "magnetron-2m246",
    name: "Magnetron 2M246",
    category: "Microwave",
    price: "₹1,799",
    manufacturer: "HeatWave Components",
    seller: "City Appliance Spares",
    deliveryEta: "2 business days",
    warranty: "3 months functional warranty",
    supportsServiceBooking: true,
    compatibleModels: [
      "QuickHeat 25L",
      "QuickHeat Grill 30L",
      "ChefWave Neo 28L",
    ],
    highlights: [
      "Stable frequency output",
      "Thermal shield included",
      "OEM connector fit",
    ],
    image:
      "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?q=80&w=1600&auto=format&fit=crop",
    description:
      "Replacement magnetron for uniform microwave heating performance with verified compatibility pins.",
  },
];

export function getSparePartBySlug(slug: string) {
  return SPARE_PARTS.find((part) => part.slug === slug);
}

export function getSparePartById(id: string) {
  return SPARE_PARTS.find((part) => part.id === id);
}
