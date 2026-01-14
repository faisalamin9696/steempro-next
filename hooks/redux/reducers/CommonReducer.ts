import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CommonValues {
  isLoadingAccount: boolean;
  isLoadingGlobals: boolean;
  unread_notifications_count: number;
  unread_count_chat: number;
}

interface CommonState {
  values: CommonValues;
}

const initialState: CommonState = {
  values: {
    isLoadingAccount: false,
    isLoadingGlobals: false,
    unread_notifications_count: 0,
    unread_count_chat: 0,
  },
};

const commonReducer = createSlice({
  name: "common",
  initialState,
  reducers: {
    addCommonDataHandler: (
      state: CommonState,
      action: PayloadAction<Partial<CommonValues>>
    ) => {
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
