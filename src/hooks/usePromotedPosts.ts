import { supabase } from "@/libs/supabase/supabase";
import useSWR from "swr";

const fetchPromotedPosts = async (): Promise<PromotedPost[]> => {
  const { data, error } = (await supabase.rpc("get_promoted_posts")) as {
    data?: PromotedPost[];
    error?: any;
  };
  if (error) {
    throw new Error(error.message ?? String(error));
  }

  return data ?? [];
};

export function usePromotedPosts() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    PromotedPost[]
  >("promoted-posts", fetchPromotedPosts, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 300000,
    dedupingInterval: 60000,
    errorRetryCount: 3,
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error: error?.message ?? null,
    isValidating,
    mutate,
  };
}

export function usePromotedPostsAdvanced(options?: {
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
}) {
  return useSWR<PromotedPost[]>("promoted-posts", fetchPromotedPosts, {
    revalidateOnFocus: options?.revalidateOnFocus ?? false,
    refreshInterval: options?.refreshInterval ?? 300000,
    revalidateOnReconnect: true,
    dedupingInterval: 60000,
    errorRetryCount: 3,
  });
}
