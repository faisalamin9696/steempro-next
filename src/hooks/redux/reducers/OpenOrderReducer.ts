import { createSlice } from "@reduxjs/toolkit";

interface OpenOrder {
  id: number;
  created: string;
  expiration: string;
  seller: string;
  orderid: number;
  order_type: "buy" | "sell";
  steem_amount: number;
  sbd_amount: number;
  price: number;
  description: string;
  raw_price: {
    base: string;
    quote: string;
  };
}

type UserState = {
  value: OpenOrder[];
};

const initialState: UserState = {
  value: [],
};

const openOrdersReducer = createSlice({
  name: "openTrades",
  initialState,
  reducers: {
    saveOpenOrdersReducer: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { saveOpenOrdersReducer } = openOrdersReducer.actions;
export const OpenOrdersReducer = openOrdersReducer.reducer;
