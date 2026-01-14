"use client";

import useSWR from "swr";
import { sdsFetcher } from "@/constants/functions";

export const useSds = <T = any>(api: string | null) =>
  useSWR<T>(api, sdsFetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });

export const useSdsList = <T = any>(api: string | null) =>
  useSWR<T[]>(api, sdsFetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    dedupingInterval: 60000,
    keepPreviousData: true,
  });

export const useSdsSingle = <T = any>(api: string | null) => useSds<T>(api);
