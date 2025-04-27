import { createSlice } from "@reduxjs/toolkit";

interface CommonState {
  values: {
    isLoadingAccount: boolean;
    isLoadingGlobals: boolean;
    unread_count: number;
    unread_count_chat: number;
  };
}

const initialState: CommonState = {
  values: {
    isLoadingAccount: false,
    isLoadingGlobals: false,
    unread_count: 0,
    unread_count_chat: 0,
  },
};

const commonReducer = createSlice({
  name: "common",
  initialState,
  reducers: {
    addCommonDataHandler: (state: CommonState, action) => {
      const payload = action.payload;
      if (payload) {
        state.values = {
          ...state.values,
          ...payload,
        };
      }
    },
  },
});

export const { addCommonDataHandler } = commonReducer.actions;
export const CommonReducer = commonReducer.reducer;
