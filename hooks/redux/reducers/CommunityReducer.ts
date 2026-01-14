import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CommunityState {
  values: Record<string, Community>; // Ensure values remains an object
}

const initialState: CommunityState = {
  values: {},
};

const communityReducer = createSlice({
  name: "communities",
  initialState,
  reducers: {
    addCommunityHandler: (state, action: PayloadAction<Community>) => {
      const payload = action.payload;
      if (payload) {
        state.values = {
          ...state.values,
          [`${payload?.account}`]: payload,
        };
      } else {
        state.values = {}; // Corrected reset
      }
    },
  },
});

export const { addCommunityHandler } = communityReducer.actions;
export const CommunityReducer = communityReducer.reducer;
