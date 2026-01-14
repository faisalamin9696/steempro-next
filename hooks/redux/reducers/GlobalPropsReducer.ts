import { createSlice } from "@reduxjs/toolkit";

type GlobalState = {
  value: GlobalProps;
};

const initialState: GlobalState = {
  value: {
    last_irreversible_block: 0,
    head_block: 0,
    head_block_time: 0,
    current_witness: "",
    total_vesting_fund_steem: 0,
    total_vesting_shares: 0,
    steem_per_share: 0,
    pending_rewarded_shares: 0,
    pending_rewarded_steem: 0,
    sbd_interest_rate: 0,
    sbd_print_rate: 0,
    sbd_debt_start: 0,
    max_block_size: 0,
    delegation_return_period: 0,
    median_price: 0,
    recent_reward_claims: 0,
    fund_per_rshare: 0,
    sbd_per_rshare: 0,
    author_reward_curve: "",
    author_reward_percent: 0,
    curation_reward_percent: 0,
    total_reward_fund: 0,
  },
};

const globalPropsReducer = createSlice({
  name: "globals",
  initialState,
  reducers: {
    addGlobalPropsHandler: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { addGlobalPropsHandler } = globalPropsReducer.actions;
export const GlobalPropsReducer = globalPropsReducer.reducer;
