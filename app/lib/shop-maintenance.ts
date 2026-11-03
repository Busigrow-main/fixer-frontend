import { API_URL } from "@/app/config";

export type ShopStatus = {
  maintenance: boolean;
  message: string;
};

const DEFAULT_MESSAGE =
  "Fixxer Shop is under maintenance. Please check back soon.";

export async function getShopStatus(signal?: AbortSignal): Promise<ShopStatus> {
  try {
    const response = await fetch(`${API_URL}/shop/status`, {
      signal,
      cache: "no-store",
    });
    if (!response.ok) {
      return { maintenance: false, message: DEFAULT_MESSAGE };
    }
    const data = await response.json().catch(() => ({}));
    return {
      maintenance: Boolean(data?.maintenance),
      message:
        typeof data?.message === "string" && data.message.trim()
          ? data.message.trim()
          : DEFAULT_MESSAGE,
    };
  } catch (error) {
    // Abort is expected on unmount / Strict Mode remount — treat as soft fail.
    if ((error as Error)?.name === "AbortError") {
      return { maintenance: false, message: DEFAULT_MESSAGE };
    }
    return { maintenance: false, message: DEFAULT_MESSAGE };
  }
}

export function isShopSurfacePath(pathname: string) {
  return (
    pathname === "/shop" ||
    pathname.startsWith("/shop/") ||
    pathname === "/cart" ||
    pathname.startsWith("/cart/") ||
    pathname === "/checkout" ||
    pathname.startsWith("/checkout/") ||
    pathname === "/orders" ||
    pathname.startsWith("/orders/")
  );
}
