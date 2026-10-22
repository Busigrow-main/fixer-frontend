import { API_URL } from "@/app/config";

export interface ApiService {
  _id: string;
  slug: string;
  name: string;
  title: string;
  startingPrice: string;
  icon: string;
  image: string;
  description: string;
  features: string[];
  subCategories?: Array<{
    _id: string;
    name: string;
    price: string;
    priceNumeric?: number;
  }>;
}

const CACHE_MS = 30_000;
let servicesRequest: { promise: Promise<ApiService[]>; createdAt: number } | null = null;

/** Share the short-lived public catalog response between Home and booking UI. */
export function getServices(): Promise<ApiService[]> {
  if (servicesRequest && Date.now() - servicesRequest.createdAt < CACHE_MS) {
    return servicesRequest.promise;
  }

  const promise = fetch(`${API_URL}/services`).then(async (response) => {
    if (!response.ok) throw new Error("Could not load services");
    const data: unknown = await response.json();
    if (!Array.isArray(data)) throw new Error("Unexpected services response");
    return data as ApiService[];
  });

  servicesRequest = { promise, createdAt: Date.now() };
  promise.catch(() => {
    if (servicesRequest?.promise === promise) servicesRequest = null;
  });
  return promise;
}
