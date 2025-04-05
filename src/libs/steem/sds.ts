import moment from "moment";
import { fetchSds, mapSds } from "../constants/AppFunctions";
import { FeedBodyLength } from "../constants/AppConstants";

export const getActiveFeed = async (
  category: ValidCategories,
  observer: string = "null",
  bodyLength: number = FeedBodyLength,
  limit: number = 1000,
  offset: number = 0
): Promise<Feed[]> => {
  try {
    if (!category) {
      throw new Error("Invalid request");
    }
    const R_API = `/feeds_api/getActivePostsBy${category}/${observer}/${bodyLength}/${limit}/${offset}`;
    console.log(R_API);

    const response = await fetchSds<any>(R_API);
    // if the response is successful, parse the JSON and check if it's valid
    if (response) {
      return response as Feed[];
    } else {
      throw new Error(response);
    }
  } catch (error: any) {
    // log and re-throw any errors that occur
    console.error("Failed to fetch post:", error);
    throw new Error(error);
  }
};

export const getActiveTagFeed = async (
  category: ValidCategories,
  tag: string,
  observer: string = "null",
  bodyLength: number = FeedBodyLength,
  limit: number = 1000,
  offset: number = 0
): Promise<Feed[]> => {
  try {
    if (!category) {
      throw new Error("Invalid request");
    }
    const R_API = `/feeds_api/getActivePostsByTag${category}/${observer}/${bodyLength}/${limit}/${offset}`;
    console.log(R_API);

    const response = await fetchSds<any>(R_API);
    // if the response is successful, parse the JSON and check if it's valid
    if (response) {
      return response as Feed[];
    } else {
      throw new Error(response);
    }
  } catch (error: any) {
    // log and re-throw any errors that occur
    console.error("Failed to fetch post:", error);
    throw new Error(error);
  }
};

export const getActiveCommunityFeed = async (
  category: ValidCategories,
  community: string,
  observer: string = "null",
  bodyLength: number = FeedBodyLength,
  limit: number = 1000,
  offset: number = 0
): Promise<Feed[]> => {
  try {
    if (!category) {
      throw new Error("Invalid request");
    }
    const R_API = `/feeds_api/getActiveCommunityPostsBy${category}/${community}/${observer}/${bodyLength}/${limit}/${offset} `;
    console.log(R_API);

    const response = await fetchSds<any>(R_API);
    // if the response is successful, parse the JSON and check if it's valid
    if (response) {
      return response as Feed[];
    } else {
      throw new Error(response);
    }
  } catch (error: any) {
    // log and re-throw any errors that occur
    console.error("Failed to fetch post:", error);
    throw new Error(error);
  }
};

export type FeedTypes =
  | "PostsByAuthor"
  | "AccountFriendsFeed"
  | "CommentsByAuthor"
  | "CommentsByParentAuthor"
  | "ActiveCommunityPostsByTrending"
  | "CommunityPostsByCreated"
  | "CommunityPinnedPosts"
  | "AccountBlog"
  | "ActivePostsByTrending"
  | "ActivePostsByCreated"
  | "ActivePostsByPayout"
  | "ActivePostsByHot"
  | "AccountCommunitiesFeedByCreated"
  | "ActivePostsByInteraction"
  | "ActivePostsByTagTrending"
  | "ActivePostsByTagCreated"
  | "ActivePostsByTagHot"
  | "ActivePostsByTagPayout"
  | "PostsByTagCreated";

export const getAuthorFeed = async (
  author: string,
  observer: string = "null",
  feedType: FeedTypes,
  bodyLength: number = FeedBodyLength,
  limit: number = 1000,
  offset: number = 0
): Promise<Feed[]> => {
  try {
    if (!author) {
      throw new Error("Invalid request");
    }
    const R_API = `/feeds_api/get${
      feedType ?? "PostsByAuthor"
    }/${author}/${observer}/${bodyLength}/${limit}/${offset}`;
    console.log(R_API);

    const response = await fetchSds<any>(R_API);
    // if the response is successful, parse the JSON and check if it's valid
    if (response) {
      return response as Feed[];
    } else {
      throw new Error(response);
    }
  } catch (error: any) {
    // log and re-throw any errors that occur
    console.error("Failed to fetch post:", error);
    throw new Error(error);
  }
};

export const getPinnedFeed = async (
  community: string,
  observer: string = "null",
  bodyLength: number = FeedBodyLength
): Promise<Feed[]> => {
  try {
    if (!community) {
      throw new Error("Invalid request");
    }
    const R_API = `/communities_api/getCommunityPinnedPosts/${community}/${observer}/${bodyLength}`;
    console.log(R_API);

    const response = await fetchSds<any>(R_API);
    // if the response is successful, parse the JSON and check if it's valid
    if (response) {
      return response as Feed[];
    } else {
      throw new Error(response);
    }
  } catch (error: any) {
    // log and re-throw any errors that occur
    console.error("Failed to fetch post:", error);
    throw new Error(error);
  }
};

export const getAccountExt = async (
  account: string,
  observer: string = "null"
): Promise<AccountExt> => {
  try {
    if (!account) {
      throw new Error("Invalid request");
    }
    const R_API = `/accounts_api/getAccountExt/${account}/${observer}`;
    console.log(R_API);

    const response = await fetchSds<any>(R_API);
    // if the response is successful, parse the JSON and check if it's valid
    if (response) {
      return response as AccountExt;
    } else {
      throw new Error(response);
    }
  } catch (error: any) {
    // log and re-throw any errors that occur
    console.error("Failed to fetch post:", error);
    throw new Error(error);
  }
};

export const getAccountsExt = async (
  accounts: string[],
  obserber: string = "null",
  fields: string = ""
): Promise<AccountExt[]> => {
  try {
    if (!accounts) {
      throw new Error("Invalid request");
    }
    const R_API = `/accounts_api/getAccountsExt/${accounts}/${obserber}/${fields}`;
    console.log(R_API);

    const response = await fetchSds<AccountExt[]>(R_API);
    // if the response is successful, parse the JSON and check if it's valid
    if (response) {
      return response as AccountExt[];
    } else {
      throw new Error(response);
    }
  } catch (error: any) {
    // log and re-throw any errors that occur
    console.error("Failed to fetch post:", error);
    throw new Error(error);
  }
};

export const getCommunity = async (
  community: string,
  observer: string = "null"
): Promise<Community> => {
  try {
    if (!community) {
      throw new Error("Invalid request");
    }
    const R_API = `/communities_api/getCommunity/${community}/${observer}`;
    console.log(R_API);

    const response = await fetchSds<any>(R_API);
    // if the response is successful, parse the JSON and check if it's valid
    if (response) {
      return response as Community;
    } else {
      throw new Error(response);
    }
  } catch (error: any) {
    // log and re-throw any errors that occur
    console.error("Failed to fetch post:", error);
    throw new Error(error);
  }
};

export const getAuthorCommunities = async (
  subscriber: string,
  observer: string = "null",
  limit: number = 50,
  offset: number = 0
): Promise<Community[]> => {
  try {
    if (!subscriber) {
      throw new Error("Invalid request");
    }
    const R_API = `/communities_api/getCommunitiesBySubscriber/${subscriber}/${observer}/${limit}/${offset}`;
    console.log(R_API);

    const response = await fetchSds<any>(R_API);
    // if the response is successful, parse the JSON and check if it's valid
    if (response) {
      return response as Community[];
    } else {
      throw new Error(response);
    }
  } catch (error: any) {
    // log and re-throw any errors that occur
    console.error("Failed to fetch post:", error);
    throw new Error(error);
  }
};

export const getPost = async (
  author: string,
  permlink: string,
  observer: string = "null",
  withVotes: boolean = false
): Promise<Post> => {
  try {
    if (!author) {
      throw new Error("Invalid request");
    }
    const R_API = `/posts_api/getPost/${author}/${permlink}/${withVotes}/${observer}`;
    console.log(R_API);

    const response = await fetchSds<any>(R_API);
    // if the response is successful, parse the JSON and check if it's valid
    if (response) {
      return response as Post;
    } else {
      throw new Error(response);
    }
  } catch (error: any) {
    // log and re-throw any errors that occur
    console.error("Failed to fetch post:", error);
    throw new Error(error);
  }
};

export const getVoteData = (
  account: AccountExt,
  steemprops: SteemProps,
  downvote?: boolean
): VoteData => {
  const total_vests = account.vests_own + account.vests_in - account.vests_out;
  const final_vest = total_vests * 1e6;
  const power =
    (downvote ? account.downvote_mana_percent : account.upvote_mana_percent) /
    50;
  const rshares = (power * final_vest) / 10000;

  const g =
    (steemprops.total_vesting_shares / steemprops.total_vesting_fund_steem) *
    (steemprops.total_reward_fund / steemprops.recent_reward_claims) *
    steemprops.median_price;

  const full_vote_value =
    (rshares / steemprops.recent_reward_claims) *
    steemprops.total_reward_fund *
    steemprops.median_price *
    100;

  const current_vp = downvote
    ? account.downvote_mana_percent
    : account.upvote_mana_percent;
  const current_vote_value = (full_vote_value * current_vp) / 100;

  return {
    full_vote: full_vote_value,
    current_vote: current_vote_value,
    voting_power: current_vp,
    resource_credit: account.rc_mana_percent,
  };
};

export const getSteemGlobal = async (): Promise<SteemProps> => {
  try {
    const R_API = `/steem_requests_api/getSteemProps`;
    console.log(R_API);
    const response = await fetchSds<any>(R_API);
    if (response) {
      return response;
    } else {
      throw new Error(response);
    }
  } catch (error: any) {
    console.error("Failed to fetch global variables:", error);
    throw new Error(error);
  }
};

export const getPostReplies = async (
  author: string,
  permlink: string,
  observer: string = "null",
  withVotes: boolean = true
): Promise<Post[]> => {
  try {
    const R_API = `/posts_api/getPostReplies/${author}/${permlink}/${withVotes}/${observer}`;
    console.log(R_API);
    const response = await fetchSds<any>(R_API);
    if (response) {
      return response as Post[];
    } else {
      throw new Error(response);
    }
  } catch (error: any) {
    console.error("Failed to fetch global variables:", error);
    throw new Error(error);
  }
};

export const getClubStatus = async (username: string) => {
  const date_from = moment().subtract(1, "months").unix();
  const date_to = moment().unix();
  const R_API = `/stats_api/getClubStats/${username}/${date_from}-${date_to}`;
  // console.log(R_API);
  try {
    const response = await fetchSds<Stats>(R_API);

    if (response) {
      const trx_out = mapSds(response.transfers_out) as Transfer[];
      const trx_in = mapSds(response.transfers_out) as Transfer[];
      const vests_in = mapSds(response.vesting_in) as Transfer[];
      const vests_out = mapSds(response.vesting_out) as Transfer[];

      let total_trx_out = trx_out.reduce((total, transaction) => {
        return total + transaction.amount;
      }, 0);

      let total_trx_in = trx_in.reduce((total, transaction) => {
        return total + transaction.amount;
      }, 0);

      let total_trx_vests_in = vests_in.reduce((total, transaction) => {
        return total + transaction.amount;
      }, 0);

      let total_trx_vests_out = vests_out.reduce((total, transaction) => {
        return total + transaction.amount;
      }, 0);

      const trx_steem_in = total_trx_vests_in - total_trx_vests_out;

      const grand_total = trx_steem_in + total_trx_out + total_trx_vests_out;

      const powered_up = (total_trx_vests_out / grand_total) * 100;
      const transfer_in = (trx_steem_in / grand_total) * 100;
      const transfer_out = (total_trx_out / grand_total) * 100;

      return { powered_up, transfer_in, transfer_out } satisfies Club;
    } else {
      throw new Error(response);
    }
  } catch (error: any) {
    console.error("Failed to fetch club data:", error);
    throw new Error(error);
  }
};

export const getAccountHistory = async (
  username: string,
  daysBefore?: number,
  filters?: string,
  limit: number = 1000
): Promise<AccountHistory[]> => {
  try {
    const start_date = moment()
      .subtract(daysBefore ?? 30, "days")
      .unix();
    const end_date = moment().unix();
    const default_filters = `withdraw_vesting,cancel_transfer_from_savings,claim_reward_balance,fill_convert_request,fill_order,fill_transfer_from_savings,fill_vesting_withdraw,
  transfer,transfer_from_savings,transfer_to_savings,transfer_to_vesting`;

    const R_API = `/account_history_api/getHistoryByOpTypesTime/${username}/${
      filters ?? default_filters
    }/${start_date}-${end_date}/${limit}`;
    console.log(R_API);
    const response = await fetchSds<any>(R_API);
    if (response) {
      return response as AccountHistory[];
    } else {
      throw new Error(response);
    }
  } catch (error: any) {
    console.error("Failed to fetch post:", error);
    throw new Error(error);
  }
};

export const getIncomingDelegations = async (
  username: string
): Promise<Delegation[]> => {
  try {
    const R_API = `/delegations_api/getIncomingDelegations/${username}`;
    console.log(R_API);
    const response = await fetchSds<any>(R_API);
    if (response) {
      return response as Delegation[];
    } else {
      throw new Error(response);
    }
  } catch (error: any) {
    console.error("Failed to fetch post:", error);
    throw new Error(error);
  }
};

export const getOutgoingDelegations = async (
  username: string
): Promise<Delegation[]> => {
  try {
    const R_API = `/delegations_api/getOutgoingDelegations/${username}`;
    console.log(R_API);
    const response = await fetchSds<any>(R_API);
    if (response) {
      return response as Delegation[];
    } else {
      throw new Error(response);
    }
  } catch (error: any) {
    console.error("Failed to fetch post:", error);
    throw new Error(error);
  }
};

export const getExpiringDelegations = async (
  username: string
): Promise<DelegationExpiring[]> => {
  try {
    const R_API = `/delegations_api/getExpiringDelegations/${username}`;
    console.log(R_API);
    const response = await fetchSds<any>(R_API);
    if (response) {
      return response as DelegationExpiring[];
    } else {
      throw new Error(response);
    }
  } catch (error: any) {
    console.error("Failed to fetch post:", error);
    throw new Error(error);
  }
};

export const getTronInformation = async (
  username: string
): Promise<SteemTron> => {
  try {
    const R_API = `https://steemitwallet.com/api/v1/tron/tron_user?username=${username}`;
    console.log(R_API);

    const response = await fetch(R_API);

    if (response.ok) {
      const result = await response.json();
      const trxInfo = result.result;
      const trxResponse = await fetch(
        `https://api.trongrid.io/v1/accounts/${trxInfo.tron_addr}`
      );
      const trxResult = await trxResponse.json();
      const trx_balance = (trxResult?.data?.[0]?.balance ?? 0) / 1000000;
      // await tronWeb.trx.getBalance(trxInfo.tron_addr);

      return { ...trxInfo, trx_balance: trx_balance ?? 0 } as SteemTron;
    } else {
      throw new Error(`HTTP error: ${response.status}`);
    }
  } catch (error: any) {
    console.error("Failed to fetch post:", error);
    throw new Error(error);
  }
};

export const getNotifications = async (
  username: string,
  filter: any,
  offset: number = 0
): Promise<SDSNotification[]> => {
  try {
    const R_API = `/notifications_api/getFilteredNotificationsByStatus/${username}/all/${filter}/50/${offset}`;

    console.log(R_API);

    const response = await fetchSds<any>(R_API);

    if (response.ok) {
      return response as SDSNotification[];
    } else {
      throw new Error(`HTTP error: ${response.status}`);
    }
  } catch (error: any) {
    console.error("Failed to fetch post:", error);
    // throw new Error(error);
    throw new Error(`Error: ${error}`);
  }
};

export const getUnreadNotifications = async (
  username: string,
  filter
): Promise<number> => {
  try {
    const R_API = `/notifications_api/getFilteredUnreadCount/${username}/${filter}`;

    console.log(R_API);
    const response = await fetchSds<any>(R_API);

    if (response.ok) {
      return response.result as number;
    } else {
      throw new Error(`HTTP error: ${response.status}`);
    }
  } catch (error: any) {
    console.error("Failed to fetch post:", error);
    // throw new Error(error);
    throw new Error(`Error: ${error}`);
  }
};

export const getAccountsByPrefix = async (
  prefix: string,
  observer: string = "null",
  fields: string = "name",
  limit: number = 7
): Promise<AccountExt[]> => {
  try {
    const R_API = `/accounts_api/getAccountsByPrefix/${prefix}/${observer}/${fields}/${limit}`;
    console.log(R_API);
    const response = await fetchSds<any>(R_API);
    if (response) {
      return response as AccountExt[];
    } else {
      throw new Error(response);
    }
  } catch (error: any) {
    console.error("Failed to fetch global variables:", error);
    throw new Error(error);
  }
};

export const getCommentHistory = async (
  author: string,
  permlink: string
): Promise<string[]> => {
  try {
    const R_API = `/content_history_api/getContentHistory/${author}/${permlink}`;
    console.log(R_API);
    const response = await fetchSds<any>(R_API);
    if (response) {
      return (response ?? []) as string[];
    } else {
      throw new Error(response);
    }
  } catch (error: any) {
    console.error("Failed to fetch global variables:", error);
    throw new Error(error);
  }
};

export const getTransfersByQuery = async (
  query: string
): Promise<Transfer[]> => {
  try {
    const R_API = `/transfers_api/getTransfers/${encodeURIComponent(query)}`;
    console.log(R_API);
    const response = await fetchSds<Transfer[]>(R_API);
    if (response) {
      return response ?? [];
    } else {
      throw new Error(response);
    }
  } catch (error: any) {
    console.error("Failed to fetch global variables:", error);
    throw new Error(error);
  }
};

export const getTransfersByTypeFrom = async (
  from: string,
  type: string = "transfer"
): Promise<Transfer[]> => {
  try {
    const R_API = `/transfers_api/getTransfersByTypeFrom/${type}/${from}`;
    console.log(R_API);
    const response = await fetchSds<Transfer[]>(R_API);
    if (response) {
      return response ?? [];
    } else {
      throw new Error(response);
    }
  } catch (error: any) {
    console.error("Failed to fetch global variables:", error);
    throw new Error(error);
  }
};

export const getWitnessVotes = async (
  witness: string
): Promise<WitnessVote[]> => {
  try {
    const R_API = `/witnesses_api/getWitnessVotesSummary/${witness}`;
    console.log(R_API);
    const response = await fetchSds<WitnessVote[]>(R_API);
    if (response) {
      return response ?? [];
    } else {
      throw new Error(response);
    }
  } catch (error: any) {
    console.error("Failed to fetch global variables:", error);
    throw new Error(error);
  }
};
