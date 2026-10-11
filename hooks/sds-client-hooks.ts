"use client";

import useSWR from "swr";
import { mapSds } from "@steempro/sds-api";
import { sds } from "@/libs/sds-client";

/**
 * SWR keys are raw SDS paths (several components pass data-driven feed paths
 * straight through as props). `sds.request` is the library's raw GET, so
 * failover, `{ code, result }` unwrapping and structured errors all apply —
 * nothing here reimplements fetching.
 */
const fetchSds = async <T,>(api: string): Promise<T> =>
  mapSds<T>(await sds.request(api));

export const useSds = <T = any>(api: string | null) =>
  useSWR<T>(api, fetchSds, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });

export const useSdsList = <T = any>(api: string | null) =>
  useSWR<T[]>(api, fetchSds, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 60000,
    keepPreviousData: true,
  });

export const useSdsSingle = <T = any>(api: string | null) => useSds<T>(api);
