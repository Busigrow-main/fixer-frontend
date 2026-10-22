"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getShopHome, type ShopHomeResponse } from "@/app/lib/shop-api";

export function useShopHome() {
  const [shopData, setShopData] = useState<ShopHomeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const requestController = useRef<AbortController | null>(null);

  const requestShopHome = useCallback(() => {
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;

    getShopHome(controller.signal, 24)
      .then((data) => {
        if (!controller.signal.aborted) setShopData(data);
      })
      .catch((loadError) => {
        if (loadError?.name !== "AbortError") {
          setError(true);
          console.error(loadError);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
  }, []);

  const loadShopHome = useCallback(() => {
    setLoading(true);
    setError(false);
    requestShopHome();
  }, [requestShopHome]);

  useEffect(() => {
    requestShopHome();
    return () => requestController.current?.abort();
  }, [requestShopHome]);

  return { shopData, loading, error, loadShopHome };
}
