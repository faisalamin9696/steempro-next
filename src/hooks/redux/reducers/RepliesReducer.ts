import { createSlice } from "@reduxjs/toolkit";

interface InfoState {
  values: Record<string, any>; // Ensure `values` remains an object
}

export const initialstate: InfoState = {
  values: {},
};

const repliesReducer = createSlice({
  name: "replies",
  initialState: initialstate,
  reducers: {
    addRepliesHandler: (state: InfoState, actions) => {
      const { comment, replies } = actions.payload;
      if (comment && comment.author && comment.permlink) {
        state.values = {
          ...state.values,
          [`${comment.author}/${comment.permlink}`]: replies,
        };
      }
    },
  },
});

export const { addRepliesHandler } = repliesReducer.actions;
export const RepliesReducer = repliesReducer.reducer;
