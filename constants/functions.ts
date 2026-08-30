import { Constants } from "@/constants";

// SDS endpoints with automatic failover (sds0 → sds1 → sds)
const SDS_ENDPOINTS = Constants.sds_endpoints;

export const sdsFetcher = async <T>(
  api: string,
  opts?: RequestInit,
  retries: number = 2,
  delayMs: number = 500,
): Promise<T> => {
  if (!api) throw new Error(`Invalid HTTP request`);

  let lastError: Error | null = null;

  for (const baseUrl of SDS_ENDPOINTS) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const res = await fetch(baseUrl + api, {
          ...opts,
        });

        if (!res.ok) {
          if (res.status >= 500 || res.status === 429) {
            lastError = new Error(`HTTP ${res.status}`);
            if (attempt < retries) {
              await new Promise((r) => setTimeout(r, delayMs * attempt));
              continue;
            }
            break; // move to next endpoint
          }
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        if (data.code !== 0) throw new Error(data.error || "SDS error");
        return mapSds(data) as T;
      } catch (error) {
        lastError = error as Error;
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, delayMs * attempt));
        }
      }
    }
  }

  throw lastError ?? new Error("SDS request failed after all retries");
};

export const mapSds = (data: any): any => {
  const { cols, rows } = data.result ?? data ?? {};
  return cols
    ? (rows?.map((r: any) =>
        Object.fromEntries(
          Object.keys(cols).map((k, i) => [k, Object.values(r)[i]]),
        ),
      ) ?? [])
    : (data.result ?? data);
};
