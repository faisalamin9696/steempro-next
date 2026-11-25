import { cache } from "react";
import { notFound } from "next/navigation";
import { SdsError } from "@/constants/functions";
import { sdsApi } from "./sds";

/**
 * Server-side reads that turn "this does not exist" into a real 404.
 *
 * Before this, an unknown account rendered a 200 profile shell: crawlers kept
 * the URL in their queue and indexed an empty page, and every hit cost an SDS
 * round trip. A 404 is both the honest answer and the cheap one.
 *
 * Only non-retryable failures become 404s — a 503 from SDS still surfaces as a
 * server error, because "upstream is down" is not the same as "no such user".
 *
 * Each helper is wrapped in React's `cache`, so the layout and the page that
 * both need the same account share one upstream read per request instead of
 * paying for it twice.
 */

export const accountOr404 = cache(
  async (
    username: string,
    observer?: string | null,
  ): Promise<AccountExt> => {
    try {
      const account = await sdsApi.getAccountExt(username, observer ?? "steem");
      if (!account?.name) notFound();
      return account;
    } catch (error) {
      if (error instanceof SdsError && !error.retryable) notFound();
      throw error;
    }
  },
);

export const postOr404 = cache(
  async (
    author: string,
    permlink: string,
    observer?: string | null,
  ): Promise<Post> => {
    try {
      const post = await sdsApi.getPost(author, permlink, observer ?? "steem");
      // SDS answers a missing permlink with an empty object rather than an error.
      if (!post || !post.author || !post.permlink) notFound();
      return post;
    } catch (error) {
      if (error instanceof SdsError && !error.retryable) notFound();
      throw error;
    }
  },
);

export const communityOr404 = cache(
  async (
    community: string,
    observer?: string | null,
  ): Promise<{ account: AccountExt; community: Community }> => {
    try {
      const [account, details] = await Promise.all([
        sdsApi.getAccountExt(community, observer ?? "steem"),
        sdsApi.getCommunity(community, observer ?? "steem"),
      ]);
      if (!account?.name || !details?.account) notFound();
      return { account, community: details };
    } catch (error) {
      if (error instanceof SdsError && !error.retryable) notFound();
      throw error;
    }
  },
);

export const proposalOr404 = cache(async (id: number): Promise<Proposal> => {
  const proposal = await sdsApi.getProposal(id);
  // An id that does not exist comes back undefined; reading `proposal.creator`
  // afterwards used to throw a TypeError and turn the URL into a 500.
  if (!proposal?.creator) notFound();
  return proposal;
});
