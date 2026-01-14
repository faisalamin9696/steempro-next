import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InfoState {
  values: Record<string, Post[]>; // Ensure `values` remains an object
}

export const initialstate: InfoState = {
  values: {},
};

const repliesReducer = createSlice({
  name: "replies",
  initialState: initialstate,
  reducers: {
    addRepliesHandler: (
      state: InfoState,
      action: PayloadAction<{ comment: Post | Feed; replies: Post[] }>
    ) => {
      const { comment, replies } = action.payload;
      if (comment.author && comment.permlink) {
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
