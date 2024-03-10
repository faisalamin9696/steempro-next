import { createSlice } from "@reduxjs/toolkit";

type GlobalState = {
    value: SteemProps
};


const initialstate: GlobalState = {
    value: {
        last_irreversible_block: 73069921,
        head_block: 73069936,
        head_block_time: 1679410980,
        current_witness: 'faisalamin',
        total_vesting_fund_steem: 171841966.354,
        total_vesting_shares: 304755682423.4238,
        steem_per_share: 0.000563867964618441,
        pending_rewarded_shares: 930341966.54605,
        pending_rewarded_steem: 489039.308,
        current_supply: 429704003.678,
        current_sbd_supply: 12036165.406,
        virtual_supply: 477448895.087,
        sbd_interest_rate: 0,
        sbd_print_rate: 0,
        sbd_debt_start: 9,
        sbd_debt_stop: 10,
        max_block_size: 65536,
        delegation_return_period: 432000,
        reverse_auction_seconds: 300,
        vote_power_reserve_rate: 10,
        median_price: 0.252093261720352,
        market_cap_steem: 120361649.26725999,
        sbd_debt_percent: 10.000000398194944,
        sbd_payout_factor: 0,
        total_reward_fund: 882636.996,
        recent_reward_claims: 619135359000211300,
        fund_per_rshare: 1.4255961691887457e-12,
        sbd_per_rshare: 3.593831881868297e-13,
        author_reward_curve: 'convergent_linear',
        author_reward_percent: 0.5,
        curation_reward_curve: 'convergent_square_root',
        curation_reward_percent: 0.5,
        reward_content_constant: 20000000000002033,
        ticker_latest: 0.07246376811594203,
        ticker_lowest_ask: 0.07399978887364088,
        ticker_highest_bid: 0.07321995778837964,
        ticker_percent_change: 0,
        ticker_volume_steem: 125.307,
        ticker_volume_sbd: 9.191,
    },
};

const steemGlobalsReducer = createSlice({
    name: 'steemGlobals',
    initialState: initialstate,
    reducers: {
        saveSteemGlobals: (state: GlobalState, actions) => {
            state.value = actions.payload
        },

    },
});


export const { saveSteemGlobals } = steemGlobalsReducer.actions;
export const SteemGlobalsReducer = steemGlobalsReducer.reducer;