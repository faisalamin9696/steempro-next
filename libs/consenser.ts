import { client } from "./steem";

class CondenserApi {
  constructor() {}

  private async call<T>(method: string, params: any[] = []): Promise<T> {
    return await client.call("condenser_api", method, params);
  }

  // ── Global Properties ──────────────────────────────────────────────
  getDynamicGlobalProperties = () =>
    this.call<DynamicGlobalProperties>("get_dynamic_global_properties");

  getChainProperties = () => this.call<ChainProperties>("get_chain_properties");

  getRewardFund = (name: string = "post") =>
    this.call<RewardFund>("get_reward_fund", [name]);

  getCurrentMedianHistoryPrice = () =>
    this.call<MedianPrice>("get_current_median_history_price");

  getFeedHistory = () => this.call<FeedHistory>("get_feed_history");

  getConfig = () => this.call<SteemConfig>("get_config");

  // ── Blocks & Transactions ─────────────────────────────────────────
  getBlock = (blockNum: number) =>
    this.call<SteemBlock>("get_block", [blockNum]);

  getBlockHeader = (blockNum: number) =>
    this.call<BlockHeader>("get_block_header", [blockNum]);

  getOpsInBlock = (blockNum: number, onlyVirtual: boolean = false) =>
    this.call<BlockOperation[]>("get_ops_in_block", [blockNum, onlyVirtual]);

  getTransaction = (trxId: string) =>
    this.call<SteemTransaction>("get_transaction", [trxId]);

  // ── Accounts ───────────────────────────────────────────────────────
  getAccounts = (accounts: string[]) =>
    this.call<SteemAccount[]>("get_accounts", [accounts]);

  lookupAccounts = (lowerBound: string, limit: number = 10) =>
    this.call<string[]>("lookup_accounts", [lowerBound, limit]);

  getAccountCount = () => this.call<number>("get_account_count");

  getAccountHistory = (
    account: string,
    from: number = -1,
    limit: number = 100,
  ) => this.call<any[]>("get_account_history", [account, from, limit]);

  // ── Witnesses ──────────────────────────────────────────────────────
  getWitnessesByVote = (from: string = "", limit: number = 100) =>
    this.call<SteemWitness[]>("get_witnesses_by_vote", [from, limit]);

  getActiveWitnesses = () => this.call<string[]>("get_active_witnesses");

  getWitnessSchedule = () => this.call<WitnessSchedule>("get_witness_schedule");

  getWitnessByAccount = (account: string) =>
    this.call<SteemWitness>("get_witness_by_account", [account]);

  // ── Market ─────────────────────────────────────────────────────────
  getOrderBook = (limit: number = 50) =>
    this.call<OrderBook>("get_order_book", [limit]);

  getTicker = () => this.call<Ticker>("get_ticker");

  getVolume = () => this.call<Volume>("get_volume");

  // ── Hardfork ───────────────────────────────────────────────────────
  getHardforkVersion = () => this.call<string>("get_hardfork_version");

  getNextScheduledHardfork = () =>
    this.call<ScheduledHardfork>("get_next_scheduled_hardfork");

  // ── Utility ────────────────────────────────────────────────────────
  getVestingDelegations = (
    account: string,
    from: string = "",
    limit: number = 100,
  ) =>
    this.call<VestingDelegation[]>("get_vesting_delegations", [
      account,
      from,
      limit,
    ]);

  // helper: convert VESTS to STEEM
  vestsToSteem = (
    vests: number,
    totalVestingShares: number,
    totalVestingFundSteem: number,
  ): number => {
    return (vests / totalVestingShares) * totalVestingFundSteem;
  };

  // ── Resource Credits ────────────────────────────────────────────────
  findRCAccounts = async (accounts: string[]): Promise<RCAccount[]> => {
    const result = await client.call("rc_api", "find_rc_accounts", {
      accounts,
    });
    return result?.rc_accounts || [];
  };
}

export const condenserApi = new CondenserApi();

// ── Type Definitions ────────────────────────────────────────────────

export interface DynamicGlobalProperties {
  head_block_number: number;
  head_block_id: string;
  time: string;
  current_witness: string;
  total_pow: number;
  num_pow_witnesses: number;
  virtual_supply: string;
  current_supply: string;
  init_sbd_supply: string;
  current_sbd_supply: string;
  total_vesting_fund_steem: string;
  total_vesting_shares: string;
  total_reward_fund_steem: string;
  pending_rewarded_vesting_shares: string;
  pending_rewarded_vesting_steem: string;
  sbd_interest_rate: number;
  sbd_print_rate: number;
  maximum_block_size: number;
  current_aslot: number;
  recent_slots_filled: string;
  participation_count: number;
  last_irreversible_block_num: number;
  vote_power_reserve_rate: number;
  delegation_return_period: number;
  reverse_auction_seconds: number;
  sbd_stop_percent: number;
  sbd_start_percent: number;
  average_block_size: number;
  current_reserve_ratio: number;
  max_virtual_bandwidth: string;
}

export interface ChainProperties {
  account_creation_fee: string;
  maximum_block_size: number;
  sbd_interest_rate: number;
  account_subsidy_budget: number;
  account_subsidy_decay: number;
}

export interface RewardFund {
  id: number;
  name: string;
  reward_balance: string;
  recent_claims: string;
  last_update: string;
  content_constant: string;
  percent_curation_rewards: number;
  percent_content_rewards: number;
  author_reward_curve: string;
  curation_reward_curve: string;
}

export interface MedianPrice {
  base: string;
  quote: string;
}

export interface FeedHistory {
  current_median_history: MedianPrice;
  price_history: MedianPrice[];
}

export interface SteemConfig {
  [key: string]: any;
}

export interface SteemBlock {
  previous: string;
  timestamp: string;
  witness: string;
  transaction_merkle_root: string;
  extensions: any[];
  witness_signature: string;
  transactions: SteemTransaction[];
  block_id: string;
  signing_key: string;
  transaction_ids: string[];
}

export interface BlockHeader {
  previous: string;
  timestamp: string;
  witness: string;
  transaction_merkle_root: string;
  extensions: any[];
}

export interface BlockOperation {
  trx_id: string;
  block: number;
  trx_in_block: number;
  op_in_trx: number;
  virtual_op: number;
  timestamp: string;
  op: [string, any];
}

export interface SteemTransaction {
  ref_block_num: number;
  ref_block_prefix: number;
  expiration: string;
  operations: [string, any][];
  extensions: any[];
  signatures: string[];
  transaction_id: string;
  block_num: number;
  transaction_num: number;
}

export interface SteemAccount {
  id: number;
  name: string;
  owner: { weight_threshold: number; account_auths: any[]; key_auths: any[] };
  active: { weight_threshold: number; account_auths: any[]; key_auths: any[] };
  posting: { weight_threshold: number; account_auths: any[]; key_auths: any[] };
  memo_key: string;
  json_metadata: string;
  posting_json_metadata: string;
  proxy: string;
  last_owner_update: string;
  last_account_update: string;
  created: string;
  mined: boolean;
  recovery_account: string;
  reset_account: string;
  comment_count: number;
  lifetime_vote_count: number;
  post_count: number;
  can_vote: boolean;
  voting_power: number;
  voting_manabar: { current_mana: string; last_update_time: number };
  downvote_manabar: { current_mana: string; last_update_time: number };
  balance: string;
  savings_balance: string;
  sbd_balance: string;
  savings_sbd_balance: string;
  savings_withdraw_requests: number;
  reward_sbd_balance: string;
  reward_steem_balance: string;
  reward_vesting_balance: string;
  reward_vesting_steem: string;
  vesting_shares: string;
  delegated_vesting_shares: string;
  received_vesting_shares: string;
  vesting_withdraw_rate: string;
  post_voting_power: string;
  next_vesting_withdrawal: string;
  withdrawn: number;
  to_withdraw: number;
  withdraw_routes: number;
  curation_rewards: number;
  posting_rewards: number;
  proxied_vsf_votes: number[];
  witnesses_voted_for: number;
  last_post: string;
  last_root_post: string;
  last_vote_time: string;
  reputation: string;
  transfer_history: any[];
  witness_votes: string[];
  guest_bloggers: any[];
}

export interface SteemWitness {
  id: number;
  owner: string;
  created: string;
  url: string;
  votes: string;
  virtual_last_update: string;
  virtual_position: string;
  virtual_scheduled_time: string;
  total_missed: number;
  last_aslot: number;
  last_confirmed_block_num: number;
  pow_worker: number;
  signing_key: string;
  props: {
    account_creation_fee: string;
    maximum_block_size: number;
    sbd_interest_rate: number;
    account_subsidy_budget: number;
    account_subsidy_decay: number;
  };
  sbd_exchange_rate: { base: string; quote: string };
  last_sbd_exchange_update: string;
  last_work: string;
  running_version: string;
  hardfork_version_vote: string;
  hardfork_time_vote: string;
  available_witness_account_subsidies: number;
}

export interface WitnessSchedule {
  id: number;
  current_virtual_time: string;
  next_shuffle_block_num: number;
  current_shuffled_witnesses: string[];
  num_scheduled_witnesses: number;
  elected_weight: number;
  timeshare_weight: number;
  miner_weight: number;
  witness_pay_normalization_factor: number;
  median_props: ChainProperties;
  majority_version: string;
  max_voted_witnesses: number;
  max_miner_witnesses: number;
  max_runner_witnesses: number;
  hardfork_required_witnesses: number;
  account_subsidy_rd: any;
  account_subsidy_witness_rd: any;
  min_witness_account_subsidy_decay: number;
}

export interface OrderBook {
  bids: {
    order_price: { base: string; quote: string };
    real_price: string;
    steem: number;
    sbd: number;
    created: string;
  }[];
  asks: {
    order_price: { base: string; quote: string };
    real_price: string;
    steem: number;
    sbd: number;
    created: string;
  }[];
}

export interface Ticker {
  latest: string;
  lowest_ask: string;
  highest_bid: string;
  percent_change: string;
  steem_volume: string;
  sbd_volume: string;
}

export interface Volume {
  steem_volume: string;
  sbd_volume: string;
}

export interface ScheduledHardfork {
  hf_version: string;
  live_time: string;
}

export interface VestingDelegation {
  id: number;
  delegator: string;
  delegatee: string;
  vesting_shares: string;
  min_delegation_time: string;
}

export interface RCAccount {
  account: string;
  rc_manabar: {
    current_mana: string;
    last_update_time: number;
  };
  max_rc: string;
  max_rc_creation_adjustment: {
    amount: string;
    precision: number;
    nai: string;
  };
}
