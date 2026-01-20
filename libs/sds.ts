import { Constants } from "@/constants";
import { sdsFetcher } from "@/constants/functions";
import moment from "moment";
import { client } from "./steem";

class SdsApi {
  getFeedByApiPath(
    apiPath: string,
    observer: string | null = "steem",
    limit: number = 50,
    offset: number = 0,
  ): Promise<Feed[]> {
    const length = 500;
    return sdsFetcher(
      `/feeds_api/${apiPath}/${observer}/${length}/${limit}/${offset}`,
    );
  }

  getCommunityPinnedPosts(
    community: string,
    observer: string | null = "steem",
  ): Promise<Feed[]> {
    const length = 250;
    return sdsFetcher(
      `/communities_api/getCommunityPinnedPosts/${community}/${observer}/${length}`,
    );
  }

  async getAccountExt(
    username: string,
    observer: string | null = "steem",
    fields?: string[],
  ): Promise<AccountExt> {
    const essentialFields = [
      "name",
      "proxy",
      "posting_json_metadata",
      "created",
      "reputation",
      "observer_follows_author",
      "observer_ignores_author",
      "count_comments",
      "count_root_posts",
      "count_followers",
      "count_following",
      "last_action",
      "balance_steem",
      "balance_sbd",
      "rewards_sbd",
      "rewards_vests",
      "rewards_steem",
      "savings_steem",
      "savings_sbd",
      "vests_own",
      "vests_in",
      "vests_out",
      "powerdown",
      "powerdown_done",
      "powerdown_rate",
      "next_powerdown",
      "upvote_mana_percent",
      "downvote_mana_percent",
      "rc_mana_percent",
      "witness_votes",
      "owner_account_auths",
      "owner_key_auths",
      "owner_weight_threshold",
      "active_key_auths",
      "active_weight_threshold",
      "posting_account_auths",
      "posting_key_auths",
      "posting_weight_threshold",
      "memo_key",
      "recovery_account",
    ];
    return sdsFetcher<AccountExt>(
      `/accounts_api/getAccountExt/${username}/${observer}/${(
        fields ?? essentialFields
      ).join(",")}`,
    );
  }

  async getAccountsExt(
    usernames: string[],
    observer: string | null = "steem",
    fields?: string[],
  ): Promise<AccountExt[]> {
    const essentialFields = [
      "name",
      "proxy",
      "posting_json_metadata",
      "created",
      "reputation",
      "observer_follows_author",
      "observer_ignores_author",
      "count_comments",
      "count_root_posts",
      "count_followers",
      "count_following",
      "last_action",
      "balance_steem",
      "balance_sbd",
      "rewards_sbd",
      "rewards_vests",
      "rewards_steem",
      "savings_steem",
      "savings_sbd",
      "vests_own",
      "vests_in",
      "vests_out",
      "powerdown",
      "powerdown_done",
      "powerdown_rate",
      "next_powerdown",
      "upvote_mana_percent",
      "downvote_mana_percent",
      "rc_mana_percent",
      "witness_votes",
      "owner_account_auths",
      "owner_key_auths",
      "owner_weight_threshold",
      "active_key_auths",
      "active_weight_threshold",
      "posting_account_auths",
      "posting_key_auths",
      "posting_weight_threshold",
      "memo_key",
    ];
    return sdsFetcher<AccountExt[]>(
      `/accounts_api/getAccountsExt/${usernames.join(",")}/${observer}/${(
        fields ?? essentialFields
      ).join(",")}`,
    );
  }

  async getAccountsByPrefix(
    prefix: string,
    observer: string | null = "steem",
    requestOptions?: RequestInit,
  ): Promise<
    Pick<AccountExt, "name" | "reputation" | "posting_json_metadata">[]
  > {
    return sdsFetcher(
      `/accounts_api/getAccountsByPrefix/${prefix}/${observer}/name,reputation,posting_json_metadata/10`,
      requestOptions,
    );
  }

  async getContentHistory(
    author: string,
    permlink: string,
  ): Promise<
    {
      time: number;
      json_metadata: string;
      title: string;
      body: string;
    }[]
  > {
    return sdsFetcher(
      `/content_history_api/getContentHistory/${author}/${permlink}`,
    );
  }

  async getPostWithReplies(
    author: string,
    permlink: string,
    observer: string | null = "steem",
  ): Promise<Post[]> {
    return sdsFetcher(
      `/posts_api/getPostWithReplies/${author}/${permlink}/true/${observer}`,
    );
  }

  async getPost(
    author: string,
    permlink: string,
    observer: string | null = "steem",
  ): Promise<Post> {
    return sdsFetcher(
      `/posts_api/getPost/${author}/${permlink}/true/${observer}`,
    );
  }

  async getCommunity(
    name: string,
    observer: string | null = "steem",
  ): Promise<Community> {
    return sdsFetcher(`/communities_api/getCommunity/${name}/${observer}`);
  }

  async getCommunities(
    observer: string | null = "steem",
    limit: number = 1000,
    offset: number = 0,
  ): Promise<Community[]> {
    return sdsFetcher(
      `/communities_api/getCommunitiesByRank/${observer}/${limit}/${offset}`,
    );
  }

  async getCommunitiesBySubscriber(
    subscriber: string,
    observer: string | null = "steem",
    limit: number = 1000,
    offset: number = 0,
  ): Promise<Community[]> {
    return sdsFetcher(
      `/communities_api/getCommunitiesBySubscriber/${subscriber}/${observer}/${limit}/${offset}`,
    );
  }

  getUnreadNotificationsCount(username: string): Promise<number> {
    return sdsFetcher(
      `/notifications_api/getFilteredUnreadCount/${username}/${JSON.stringify(
        Constants.notifications_filter,
      )}`,
    );
  }

  getNotifications(
    username: string,
    typeFilter: NotificationType | "all" = "all",
    limit: number = 250,
    offset: number = 0,
  ): Promise<SDSNotification[]> {
    if (typeFilter === "all") {
      return sdsFetcher(
        `/notifications_api/getFilteredNotificationsByStatus/${username}/all/${JSON.stringify(
          Constants.notifications_filter,
        )}/${limit}/${offset}`,
      );
    } else {
      return sdsFetcher(
        `/notifications_api/getFilteredNotificationsByStatusType/${username}/all/${typeFilter}/${JSON.stringify(
          Constants.notifications_filter,
        )}/${limit}/${offset}`,
      );
    }
  }

  async getVoters(author: string, permlink: string): Promise<PostVote[]> {
    return sdsFetcher(`/posts_api/getVotes/${author}/${permlink}`);
  }

  async getGlobalProps(): Promise<GlobalProps> {
    return sdsFetcher("/steem_requests_api/getSteemProps", {
      keepalive: true,
      next: { revalidate: 60 },
    } as any);
  }

  async getSubscriberCommunities(username: string): Promise<Community[]> {
    return sdsFetcher(
      `/communities_api/getCommunitiesBySubscriber/${username}`,
    );
  }

  async getDelegations(
    account: string,
    delegationType: "incoming" | "outgoing" | "expiring" | "all" = "incoming",
    limit: number = 1000,
    offset: number = 0,
  ): Promise<Delegation[]> {
    if (delegationType === "all") {
      const [incoming, outgoing, expiring] = await Promise.all([
        this.getDelegations(account, "incoming", limit, offset),
        this.getDelegations(account, "outgoing", limit, offset),
        this.getDelegations(account, "expiring", limit, offset),
      ]);
      return [...incoming, ...outgoing, ...expiring];
    }
    const result = await sdsFetcher<Delegation[]>(
      `/delegations_api/${
        delegationType === "incoming"
          ? "getIncomingDelegations"
          : delegationType === "outgoing"
            ? "getOutgoingDelegations"
            : "getExpiringDelegations"
      }/${account}/${limit}/${offset}`,
    );

    return (result ?? []).map((item) => ({
      ...item,
      status: delegationType as any,
    }));
  }

  async getWitnessesByRank(
    observer: string | null = "steem",
    limit: number = 1000,
    offset: number = 0,
  ): Promise<Witness[]> {
    return sdsFetcher(
      `/witnesses_api/getWitnessesByRank/${observer}/${limit}/${offset}`,
    );
  }

  async getWitnessVotes(witness: string): Promise<WitnessVote[]> {
    return sdsFetcher(`/witnesses_api/getWitnessVotesSummary/${witness}`);
  }

  async getAccountHistory(
    account: string,
    typeFilter:
      | "transfer"
      | "transfer_to_vesting"
      | "withdraw_vesting"
      | "fill_vesting_withdraw"
      | "claim_reward_balance"
      | "all" = "all",
    limit: number = 2500,
    offset: number = 0,
  ): Promise<AccountHistory[]> {
    const essentialFields = [
      "transfer",
      // "transfer_from_savings",
      // "transfer_to_savings",
      "transfer_to_vesting",
      "withdraw_vesting",
      // "limit_order_create2",
      // "limit_order_cancel",
      "fill_vesting_withdraw",
      // "fill_transfer_from_savings",
      // "fill_order",
      // "fill_convert_request",
      "claim_reward_balance",
      // "cancel_transfer_from_savings",
      // "author_reward",
      // "comment_benefactor_reward",
    ];

    return sdsFetcher(
      `/account_history_api/getHistoryByOpTypesTime/${account}/${
        typeFilter === "all" ? essentialFields.join(",") : typeFilter
      }/${moment()
        .subtract(3, "months")
        .unix()}-${moment().unix()}/${limit}/${offset}`,
    );
  }

  async getProposal(id: number): Promise<Proposal> {
    const result = await client.call("condenser_api", "find_proposals", [[id]]);
    return result?.[0];
  }

  async getProposals(limit: number = 1000): Promise<Proposal[]> {
    return client.call("condenser_api", "list_proposals", [
      [-1],
      limit,
      "by_total_votes",
      "descending",
      "all",
    ]);
  }

  async getProposalVotes(
    proposalId: number,
    voter: string,
    limit: number = 1000,
  ): Promise<ProposalVote[]> {
    const votes: ProposalVote[] = [];
    let currentVoter = voter;
    let isFirst = true;

    while (votes.length < limit) {
      let fetchLimit = limit - votes.length;
      if (!isFirst) fetchLimit += 1;
      if (fetchLimit > 1000) fetchLimit = 1000;

      if (fetchLimit <= 0) break;

      const response: ProposalVote[] = await client.call(
        "condenser_api",
        "list_proposal_votes",
        [[proposalId, currentVoter], fetchLimit, "by_proposal_voter"],
      );

      if (!response || response.length === 0) break;

      const relevant = response.filter(
        (x) => x.proposal.proposal_id === proposalId,
      );

      if (relevant.length === 0) break;

      let chunk = relevant;
      if (!isFirst) {
        if (chunk[0].voter === currentVoter) {
          chunk = chunk.slice(1);
        }
      }

      if (chunk.length === 0) {
        if (response.length > relevant.length) break;
        if (response.length < fetchLimit) break;
        break;
      }

      votes.push(...chunk);

      currentVoter = relevant[relevant.length - 1].voter;
      isFirst = false;

      if (response.length < fetchLimit) break;
      if (relevant.length < response.length) break;
    }

    return votes;
  }

  getPostsByText(
    text: string,
    observer: string | null = "steem",
    limit: number = 1000,
    offset: number = 0,
  ): Promise<Post[]> {
    return sdsFetcher(
      `/content_search_api/getPostsByText/${text}/any/${observer}/500/time/DESC/${limit}/${offset}`,
    );
  }

  getPostsByAuthorText(
    author: string,
    text: string,
    observer: string | null = "steem",
    limit: number = 1000,
    offset: number = 0,
  ): Promise<Post[]> {
    return sdsFetcher(
      `/content_search_api/getPostsByAuthorText/${author}/${text}/any/${observer}/500/time/DESC/${limit}/${offset}`,
    );
  }

  getCommentsByText(
    text: string,
    observer: string | null = "steem",
    limit: number = 1000,
    offset: number = 0,
  ): Promise<Post[]> {
    return sdsFetcher(
      `/content_search_api/getCommentsByText/${text}/any/${observer}/500/time/DESC/${limit}/${offset}`,
    );
  }

  getCommentsByAuthorText(
    author: string,
    text: string,
    observer: string | null = "steem",
    limit: number = 1000,
    offset: number = 0,
  ): Promise<Post[]> {
    return sdsFetcher(
      `/content_search_api/getCommentsByAuthorText/${author}/${text}/any/${observer}/500/time/DESC/${limit}/${offset}`,
    );
  }

  async getPendingConversions(owner: string) {
    const res = await client.database.call("get_conversion_requests", [owner]);
    return res;
  }

  // Market

  private parseAssetAmount(asset: any): number {
    if (typeof asset === "number") return asset;
    if (typeof asset === "string") return parseFloat(asset.split(" ")[0]);
    if (asset && typeof asset === "object" && asset.amount)
      return parseFloat(asset.amount) / Math.pow(10, asset.precision || 3);
    return 0;
  }

  async getTicker(): Promise<MarketTicker> {
    const res = await client.database.call("get_ticker");
    return {
      latest: parseFloat(res.latest),
      lowest_ask: parseFloat(res.lowest_ask),
      highest_bid: parseFloat(res.highest_bid),
      percent_change: parseFloat(res.percent_change),
      steem_volume: parseFloat(res.steem_volume),
      sbd_volume: parseFloat(res.sbd_volume),
    };
  }

  async getVolume(): Promise<{ steem_volume: number; sbd_volume: number }> {
    const res = await client.database.call("get_volume");
    return {
      steem_volume: parseFloat(res.steem_volume),
      sbd_volume: parseFloat(res.sbd_volume),
    };
  }

  async getOrderBook(limit: number = 100): Promise<OrderBook> {
    const res = await client.database.call("get_order_book", [limit]);
    const mapper = (items: any[]) =>
      (items || []).map((item) => ({
        order_price: item.order_price,
        real_price: parseFloat(item.real_price),
        steem:
          this.parseAssetAmount(item.steem) /
          (typeof item.steem === "number" ? 1000 : 1),
        sbd:
          this.parseAssetAmount(item.sbd) /
          (typeof item.sbd === "number" ? 1000 : 1),
      }));

    return {
      bids: mapper(res.bids),
      asks: mapper(res.asks),
    };
  }

  async getTradeHistory(limit: number = 100): Promise<MarketTrade[]> {
    const end = new Date().toISOString().split(".")[0];
    const start = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split(".")[0];
    const res = await client.database.call("get_trade_history", [
      start,
      end,
      limit,
    ]);

    return (res || []).map((t: any) => ({
      date: moment.utc(t.date).unix(),
      current_pays: t.current_pays,
      open_pays: t.open_pays,
    }));
  }

  async getMarketHistory(
    bucketSeconds: number = 3600,
    hours: number = 24,
  ): Promise<MarketHistory[]> {
    const end = new Date().toISOString().split(".")[0];
    const start = new Date(Date.now() - hours * 60 * 60 * 1000)
      .toISOString()
      .split(".")[0];
    const res = await client.database.call("get_market_history", [
      bucketSeconds,
      start,
      end,
    ]);

    return (res || []).map((h: any) => {
      // Handle nested structure if present (some RPC versions use {steem: {}, non_steem: {}})
      const s = h.steem || {};
      const ns = h.non_steem || h.sbd || {};

      // Check if data is already flat or nested
      const open_steem = h.open_steem ?? s.open;
      const open_sbd = h.open_sbd ?? ns.open;
      const high_steem = h.high_steem ?? s.high;
      const high_sbd = h.high_sbd ?? ns.high;
      const low_steem = h.low_steem ?? s.low;
      const low_sbd = h.low_sbd ?? ns.low;
      const close_steem = h.close_steem ?? s.close;
      const close_sbd = h.close_sbd ?? ns.close;
      const steem_volume = h.steem_volume ?? s.volume;
      const sbd_volume = h.sbd_volume ?? ns.volume;

      const isSatoshis = typeof open_steem === "number";
      const scale = isSatoshis ? 1000 : 1;

      return {
        time: moment.utc(h.open).unix(),
        open_steem: this.parseAssetAmount(open_steem) / scale,
        open_sbd: this.parseAssetAmount(open_sbd) / scale,
        high_steem: this.parseAssetAmount(high_steem) / scale,
        high_sbd: this.parseAssetAmount(high_sbd) / scale,
        low_steem: this.parseAssetAmount(low_steem) / scale,
        low_sbd: this.parseAssetAmount(low_sbd) / scale,
        close_steem: this.parseAssetAmount(close_steem) / scale,
        close_sbd: this.parseAssetAmount(close_sbd) / scale,
        steem_volume: this.parseAssetAmount(steem_volume) / scale,
        sbd_volume: this.parseAssetAmount(sbd_volume) / scale,
      };
    });
  }

  async getOpenOrders(username: string): Promise<OpenOrder[]> {
    const res = await client.database.call("get_open_orders", [username]);
    return (res || []).map((o: any) => {
      const isSatoshis = typeof o.for_sale === "number";
      const scale = isSatoshis ? 1000 : 1;
      return {
        id: o.id,
        created: moment.utc(o.created).unix(),
        expiration: o.expiration,
        seller: o.seller,
        orderid: o.orderid,
        for_sale: this.parseAssetAmount(o.for_sale) / scale,
        sell_price: o.sell_price,
        real_price: parseFloat(o.real_price),
        reward: o.reward,
      };
    });
  }
}

// Create a singleton instance
export const sdsApi = new SdsApi();
