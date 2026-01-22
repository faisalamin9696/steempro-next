import { useState, useEffect, useCallback } from "react";

interface PriceResponse {
  steem: { usd: number };
  "steem-dollars": { usd: number };
}

export const usePriceData = () => {
  const [steemUsd, setSteemUsd] = useState<number>(0);
  const [sbdUsd, setSbdUsd] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPriceData = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/price", { signal, method: "POST" });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data: PriceResponse = await res.json();

      if (!data?.steem || !data["steem-dollars"]) {
        throw new Error("Invalid response");
      }

      setSteemUsd(data.steem.usd);
      setSbdUsd(data["steem-dollars"].usd);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Price fetch error:", err);
        setError("Failed to fetch price data");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchPriceData(controller.signal);

    return () => controller.abort();
  }, [fetchPriceData]);

  return {
    steemUsd,
    sbdUsd,
    isLoading,
    error,
    refresh: () => fetchPriceData(), // ✅ manual refresh
  };
};
