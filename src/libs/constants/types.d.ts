type Feed = {
  link_id: number;
  link_status: number;
  author_reputation: number;
  author_status: number;
  author_role: "muted" | "guest" | "member" | "mod" | "admin" | "owner";
  author_title: string;
  author: string;
  permlink: string;
  created: number;
  cashout_time: number;
  last_update: number;
  payout: number;
  payout_comments: number;
  promoted: number;
  net_rshares: number;
  children: number;
  resteem_count: number;
  upvote_count: number;
  downvote_count: number;
  downvote_weight: number;
  word_count: number;
  is_muted: 0 | 1 | number;
  is_pinned: 0 | 1 | number;
  last_reply: number;
  category: string;
  community: string;
  json_metadata: string;
  title: string;
  body: string;
  observer_follows_author: 0 | 1 | number;
  observer_ignores_author: 0 | 1 | number;
  observer_resteem: 0 | 1 | number;
  is_author_muted: 0 | 1 | number;
  json_images: string;
  observer_role: "muted" | "guest" | "member" | "mod" | "admin" | "owner";
  observer_title: string;
  observer_vote: 0 | 1 | number;
  observer_vote_percent: number;
  observer_vote_rshares: number;

  // undefined for Feed API
  replies: Post[];
  // undefined for Feed API
  depth: number;
  status: "upvoting" | "downvoting" | "resteeming" | "idle" = "idle";
  max_accepted_payout: number;
  percent_steem_dollars: number;
  is_new: number = 0;
};

type Post = Feed & {
  parent_author: string;
  parent_permlink: string;
  root_author: string;
  root_permlink: string;
  root_title: string;
  last_sync: number;
  total_payout_value: number;
  curator_payout_value: number;
  pending_payout_value: number;
  total_vote_weight: number;
  allow_curation_rewards: number;
  allow_replies: number;
  allow_votes: number;
  depth: number;
  beneficiaries: string[];
  votes: string[];
};

type KeyTypes = {
  POSTING: "POSTING";
  ACTIVE: "ACTIVE";
  OWNER: "OWNER";
  MASTER: "MASTER";
  MEMO: "MEMO";
};
type AccountExt = {
  name: string = "";
  creator: string;
  recovery_account: string;
  reset_account: string;
  proxy: string;
  json_metadata: string;
  posting_json_metadata: string;
  created: number;
  last_action: number;
  last_comment: number;
  last_root_post: number;
  last_vote: number;
  last_account_recovery: number;
  last_account_update: number;
  last_owner_update: number;
  last_update: number;
  last_sync: number;
  reputation: number;
  voting_csi: number;
  selfvote_rate: number;
  curation_rewards: number;
  posting_rewards: number;
  mined: number;
  observer_follows_author: number;
  observer_ignores_author: number;
  can_vote: number;
  count_comments: number;
  count_root_posts: number;
  count_active_posts: number;
  count_replies: number;
  count_upvotes: number;
  count_upvoted: number;
  count_downvotes: number;
  count_downvoted: number;
  count_followers: number;
  count_following: number;
  balance_steem: number;
  balance_sbd: number;
  rewards_steem: number;
  rewards_sbd: number;
  rewards_vests: number;
  savings_steem: number;
  savings_sbd: number;
  vests_own: number;
  vests_in: number;
  vests_out: number;
  powerdown: number;
  powerdown_done: number;
  powerdown_rate: number;
  next_powerdown: number;
  upvote_mana_current: number;
  upvote_mana_max: number;
  upvote_mana_percent: number;
  upvote_mana_last_update: number;
  downvote_mana_current: number;
  downvote_mana_max: number;
  downvote_mana_percent: number;
  downvote_mana_last_update: number;
  rc_mana_current: number;
  rc_mana_max: number;
  rc_mana_percent: number;
  rc_mana_last_update: number;
  witness_votes: string[];
  withdraw_routes: number;
  savings_withdraw_requests: number;
  pending_claimed_accounts: string[];
  sbd_seconds: number;
  sbd_seconds_last_update: number;
  sbd_last_interest_payment: number;
  savings_sbd_seconds: number;
  savings_sbd_seconds_last_update: number;
  savings_sbd_last_interest_payment: number;
  owner_account_auths: string[];
  owner_weight_threshold: number;
  owner_key_auths: string[];
  active_account_auths: string[];
  active_key_auths: string[];
  active_weight_threshold: number;
  posting_account_auths: string[];
  posting_key_auths: string[];
  posting_weight_threshold: number;
  memo_key: string;
  login: boolean | null | undefined;
  communities?: Community[];
  last_fetch: number;
  encKey: string;
  unread_count: number = 0;
  // notification: {
  //   status: boolean;
  //   vote: {
  //     status: boolean,
  //     minRep: number,
  //     minSp: number,
  //     minVote: number
  //   },
  //   reply: {
  //     status: boolean,
  //     minRep: number,
  //     minSp: number,
  //   },
  //   follow: {
  //     status: boolean,
  //     minRep: number,
  //     minSp: number,
  //   },
  //   mention: {
  //     status: boolean,
  //     minRep: number,
  //     minSp: number,
  //   },
  //   resteem: {
  //     status: boolean,
  //     minRep: number,
  //     minSp: number,
  //   },
  // }
  status: "following" | "unfollowing" | "idle" = "idle";
};

type Community = {
  id: number;
  type: string;
  account: string;
  account_reputation: number;
  created: number;
  rank: number;
  sum_pending: number;
  count_pending: number;
  count_authors: number;
  count_subs: number;
  lang: string;
  title: string;
  about: string;
  description: string;
  flag_text: string;
  is_nsfw: number;
  settings: any;
  observer_subscribed: number;
  observer_role: "muted" | "guest" | "member" | "mod" | "admin" | "owner";
  observer_title: string;
  status: "joining" | "leaving" | "idle" = "idle";
  roles: any;
};

type AccountHistory = {
  id: number;
  time: number;
  block_num: number;
  trans_index: number;
  op_index: number;
  virtual: number;
  op: any[];
};

type AccountHistoryOperation = {
  required_auths: string[];
  required_posting_auths: string[];
  id: string;
  json: string;
};

type Notification = {
  id: number;
  time: number;
  type: string;
  is_read: number;
  is_update: number;
  link_depth: number;
  account: string;
  author: string;
  permlink: string;
  voted_rshares: number;
};

type SDSNotification = {
  id: number;
  time: number;
  type:
    | "new_community"
    | "set_role"
    | "set_props"
    | "set_label"
    | "mute_post"
    | "unmute_post"
    | "pin_post"
    | "unpin_post"
    | "flag_post"
    | "error"
    | "subscribe"
    | "reply"
    | "reblog"
    | "follow"
    | "mention"
    | "vote";
  is_read: number;
  is_update: number;
  account: string;
  author: string;
  permlink: string;
  voted_rshares: number;
};

type SteemProps = {
  last_irreversible_block: number;
  head_block: number;
  head_block_time: number;
  current_witness: string;
  total_vesting_fund_steem: number;
  total_vesting_shares: number;
  steem_per_share: number;
  pending_rewarded_shares: number;
  pending_rewarded_steem: number;
  current_supply: number;
  current_sbd_supply: number;
  virtual_supply: number;
  sbd_interest_rate: number;
  sbd_print_rate: number;
  sbd_debt_start: number;
  sbd_debt_stop: number;
  max_block_size: number;
  delegation_return_period: number;
  reverse_auction_seconds: number;
  vote_power_reserve_rate: number;
  median_price: number;
  market_cap_steem: number;
  sbd_debt_percent: number;
  sbd_payout_factor: number;
  total_reward_fund: number;
  recent_reward_claims: number;
  fund_per_rshare: number;
  sbd_per_rshare: number;
  author_reward_curve: string;
  author_reward_percent: number;
  curation_reward_curve: string;
  curation_reward_percent: number;
  reward_content_constant: number;
  ticker_latest: number;
  ticker_lowest_ask: number;
  ticker_highest_bid: number;
  ticker_percent_change: number;
  ticker_volume_steem: number;
  ticker_volume_sbd: number;
};

type SteemKey = {
  POSTING: string;
  ACTIVE: string;
  OWNERLstring;
  MASTER: string;
  MEMO: string;
};

type ClubData = {
  powered_up: number;
  transfer_in: number;
  transfer_out: number;
};

type ThemeMode = "dark" | "light" | "system";
type NSFW = "Always show" | "Always hide" | "Always warn";

type LanguagesCode = "en" | "bn" | "tr" | "cn" | "kr";

type Language = {
  title: string;
  code: LanguagesCode;
};
type Setting = {
  // isThemeDark: boolean;
  rpc: string;
  theme: ThemeMode;
  // language: string;
  // currency: string;
  // notification: FirebaseNotificationSettings;
  // nsfw: string;
  // lastUpdateCheck: undefined;
  // languageTo: { title: string; code: string };
  feedStyle: FeedStyle;
  lang: Language;
  nsfw: NSFW = "Always warn";
  // pinEnabled: boolean;
  // fingerprintEnabled: boolean;
};

type FeedStyle = "blogs" | "list" | "grid";

type PostingContent = {
  author: AccountExtType;
  title: string;
  body: string;
  parent_author: string;
  parent_permlink: string;
  json_metadata: any;
  permlink: string;
};

type VoteData = {
  full_vote: number;
  current_vote: number;
  voting_power: number;
  resource_credit: number;
};

type PostDraft = {
  title: string;
  body: string;
  tags: string[];
  category: string;
  community: Community | undefined;
  beneficiaries: Beneficiary[];
  reward: Payout;
};

type PostVote = {
  voter: string;
  time: number;
  percent: number;
  weight: number;
  rshares: number;
};

type PostResteem = {
  resteemer: string;
  time: number;
};

type Delegation = {
  time: number;
  expiration?: number;
  from: string;
  to: string;
  vests: number;
  status?: any;
};

type Witness = {
  name: string;
  rank: number;
  created: 2;
  last_sync: number;
  last_price_report: number;
  received_votes: number;
  produced_blocks: number;
  missed_blocks: number;
  running_version: string;
  hardfork_version_vote: string;
  hardfork_time_vote: number;
  last_confirmed_block: number;
  last_aslot: number;
  account_subsidies: number;
  signing_key: number;
  url: string;
  props: {
    account_creation_fee: string;
    maximum_block_size: number;
    sbd_interest_rate: number;
    account_subsidy_budget: number;
    account_subsidy_decay: number;
  };
  reported_price: {
    base: string;
    quote: string;
  };
  observer_votes_witness: number;
};

type CommunityReport = {
  author: string;
  total_post_count: number;
  total_comment_count: number;
  unique_comment_count: number;
};

type FirestoreUser = {
  name: string;
  userId: string;
  timestamp: number;
  snippets: Snippet[];
};

type Snippet = {
  id: string;
  title: string;
  body: string;
};

type DelegationExpiring = {
  time: number;
  expiration: number;
  from: string;
  to: string;
  vests: number;
};

type SteemTron = {
  username: string;
  tron_addr: string;
  pending_claim_tron_reward: string;
  tip_count: string;
  trx_balance: number;
};

type FirebaseNotificationSettings = {
  status: boolean;
  vote: {
    status: boolean;
    minRep: number;
    minSp: number;
    minVote: number;
  };
  reply: {
    status: boolean;
    minRep: number;
    minSp: number;
  };
  follow: {
    status: boolean;
    minRep: number;
    minSp: number;
  };
  mention: {
    status: boolean;
    minRep: number;
    minSp: number;
  };
  resteem: {
    status: boolean;
    minRep: number;
    minSp: number;
  };
};

type Payout = {
  title: string;
  shortTitle: string;
  payout: number;
};

type Beneficiary = {
  account: string;
  weight: number;
};
type User = {
  username: string;
  key: string;
  type: Keys;
  memo: string;
};

type ValidCategories = "created" | "trending" | "payout" | "pinned" | "about";

type Role = {
  created: number;
  account: string;
  title: string;
  role: string;
};

type Club = {
  powered_up: number;
  transfer_in: number;
  transfer_out: number;
};

type Transfer = {
  time: number;
  from: string;
  to: string;
  amount: number;
  unit: string;
  memo: string;
};

type RewardSum = {
  author_reward: { sbd: number; steem: number; vests: number };
  comment_benefactor_reward: { sbd: number; steem: number; vests: number };
  curation_reward: { vests: number };
  liquidity_reward: { steem: number };
  producer_reward: { vests: number };
  interest: { sbd: number };
};
type Stats = {
  account: AccountExt;
  steem_props: SteemProps;
  rewards_sums: any;
  transfers_in: Transfer;
  transfers_out: Transfer;
  delegations_in: Delegation;
  delegations_out: Delegation;
  vesting_in: Transfer;
  vesting_out: Transfer;
  cancelled_orders: any;
  created_orders: any;
  filled_orders: any;
  filled_conversions: any;
  filled_savings_withdrawals: any;
  filled_withdrawals: any;
};

type Schedule = {
  id: number;
  username: string;
  title: string;
  body: string;
  tags: string;
  parent_permlink: string;
  options: string;
  time: string;
  status: number;
  permlink?: string;
  message?: string;
};

type Keys = "POSTING" | "ACTIVE" | "OWNER" | "MASTER" | "MEMO";
type SteemTokens = "steem" | "steem_power" | "steem_dollar" | "saving";
