export interface SubCategory {
  id: string;
  name: string;
  price: string;
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  title: string;
  startingPrice: string;
  icon: string;
  image: string;
  description: string;
  features: string[];
  subCategories?: SubCategory[];
}

export const SERVICES: Service[] = [
  {
    id: "refrigerator",
    slug: "refrigerator",
    name: "Refrigerator",
    title: "Expert Refrigerator Repair",
    startingPrice: "₹249",
    icon: "ac_unit",
    image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=2000&auto=format&fit=crop",
    description: "Professional grade technical mastery for your kitchen's heart. Fixed base service charges depending on appliance type and category.",
    features: ["60 Days Service Warranty", "Up to 30 Days Part Warranty", "Transparent Pricing", "Genuine Spare Parts"],
    subCategories: [
      { id: "single-door", name: "Single Door Refrigerator", price: "₹249" },
      { id: "double-door", name: "Double Door Refrigerator", price: "₹349" },
      { id: "deep-freezer", name: "Deep Freezer", price: "₹449" },
    ],
  },
  {
    id: "washing-machine",
    slug: "washing-machine",
    name: "Washing Machine",
    title: "Premium Washing Machine Service",
    startingPrice: "₹249",
    icon: "local_laundry_service",
    image: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?q=80&w=2000&auto=format&fit=crop",
    description: "Don't let laundry pile up. We provide fast, reliable repairs with transparent pricing and standardized service experience.",
    features: ["60 Days Service Warranty", "Up to 30 Days Part Warranty", "Transparent Pricing", "Vibration & Noise Diagnosis"],
    subCategories: [
      { id: "semi-auto", name: "Semi-Automatic Washing Machine", price: "₹249" },
      { id: "top-load", name: "Fully Automatic (Top Load)", price: "₹349" },
      { id: "front-load", name: "Fully Automatic (Front Load)", price: "₹449–₹549" },
    ],
  },
  {
    id: "microwave",
    slug: "microwave",
    name: "Microwave",
    title: "Professional Microwave Repair",
    startingPrice: "₹249",
    icon: "cooking",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2000&auto=format&fit=crop",
    description: "Keep your kitchen running perfectly. Service pricing is based on appliance volume and capacity. Our technicians are factory-trained for all models.",
    features: ["60 Days Service Warranty", "Up to 30 Days Part Warranty", "Transparent Pricing", "Safety Radiation Checks"],
    subCategories: [
      { id: "standard", name: "Microwave Repair (Based on Volume)", price: "Starting ₹249" },
    ],
  },
  {
    id: "ac",
    slug: "ac",
    name: "Air Conditioner",
    title: "Modern AC Recovery",
    startingPrice: "₹249",
    icon: "thermostat",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2000&auto=format&fit=crop",
    description: "Climate master for your home. From installation to complex repairs, we restore your comfort quickly.",
    features: ["60 Days Service Warranty", "Up to 30 Days Part Warranty", "Transparent Pricing", "Installation & Uninstallation"],
    subCategories: [
      { id: "ac-install", name: "AC Installation", price: "₹1149" },
      { id: "ac-uninstall", name: "AC Uninstallation", price: "₹749" },
      { id: "ac-cleaning", name: "AC Cleaning & Repair", price: "₹549" },
      { id: "ac-service", name: "AC Service", price: "₹449" },
      { id: "ac-repair", name: "AC Repair", price: "₹249" },
    ],
  },
];

export function getServiceBySlug(slug: string) {
  return SERVICES.find((s) => s.slug === slug);
}
