import { createSlice } from "@reduxjs/toolkit";

interface ProposalsState {
  values: Proposal[]; // Ensure values is always an object
}

const initialState: ProposalsState = {
  values: [],
};

const proposalsReducer = createSlice({
  name: "proposals",
  initialState,
  reducers: {
    addProposalsHandler: (state: ProposalsState, action) => {
      const payload = action.payload;
      if (payload) {
        state.values = payload;
      } else {
        state.values = [];
      }
    },
  },
});

export const { addProposalsHandler } = proposalsReducer.actions;
export const ProposalsReducer = proposalsReducer.reducer;
