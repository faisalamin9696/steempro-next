import { Constants } from "@/constants";

export const sdsFetcher = async <T>(
  api: string,
  opts?: RequestInit
): Promise<T> => {
  if (!api) throw new Error(`Invalid HTTP request`);
  const res = await fetch(Constants.sds_url + api, {
    keepalive: false,
    cache: "default",
    ...opts,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.code !== 0) throw new Error(data.error || "SDS error");
  return mapSds(data) as T;
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

