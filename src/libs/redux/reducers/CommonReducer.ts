import { createSlice } from "@reduxjs/toolkit";

interface CommonState {
  values: {
    isLoadingAccount: boolean;
    isLoadingGlobals: boolean;
  };
}

const initialState: CommonState = {
  values: {
    isLoadingAccount: false,
    isLoadingGlobals: false,
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
          ...payload,
        };
      } 
    },
  },
});

export const { addCommonDataHandler } = commonReducer.actions;
export const CommonReducer = commonReducer.reducer;
