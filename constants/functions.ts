import { Constants } from "@/constants";

export const sdsFetcher = async <T>(
  api: string,
  opts?: RequestInit,
  retries: number = 3,
  delayMs: number = 600
): Promise<T> => {
  if (!api) throw new Error(`Invalid HTTP request`);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(Constants.sds_url + api, {
        keepalive: false,
        cache: "default",
        ...opts,
      });

      if (!res.ok) {
        if ((res.status >= 500 || res.status === 429) && attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
          continue;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.code !== 0) throw new Error(data.error || "SDS error");
      return mapSds(data) as T;
    } catch (error) {
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
        continue;
      }
      throw error;
    }
  }

  throw new Error("SDS request failed after retries");
};

export const mapSds = (data: any): any => {
  const { cols, rows } = data.result ?? data ?? {};
  return cols
    ? rows?.map((r: any) =>
        Object.fromEntries(
          Object.keys(cols).map((k, i) => [k, Object.values(r)[i]])
        )
      ) ?? []
    : data.result ?? data;
};

