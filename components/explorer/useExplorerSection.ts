"use client";

import useSWR from "swr";

/**
 * SWR wrapper for /api/explorer sections.
 *
 * `query` is everything after `?` — e.g. `"statistics"` or
 * `"activity&range=7d"`. Retries are disabled so a failure lands in an
 * explicit error state with the section's own Retry button.
 */
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return res.json();
};

export interface ExplorerSectionState<T> {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  retry: () => void;
}

export function useExplorerSection<T>(query: string): ExplorerSectionState<T> {
  const { data, error, isLoading, mutate } = useSWR<T>(
    `/api/explorer?section=${query}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  return {
    data,
    error,
    isLoading,
    retry: () => void mutate(),
  };
}
