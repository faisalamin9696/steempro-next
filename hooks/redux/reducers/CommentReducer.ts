import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CommentState {
  values: Record<string, Post | Feed>;
}

const initialState: CommentState = {
  values: {},
};

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    addCommentHandler: (state, action: PayloadAction<Post | Feed>) => {
      const { author, permlink } = action.payload;
      if (!author || !permlink) return; // guard against undefined
      state.values[`${author}/${permlink}`] = action.payload;
    },

    clearCommentHandler: (state) => {
      state.values = {};
    },
  },
});

export const { addCommentHandler, clearCommentHandler } = commentSlice.actions;
export const CommentReducer = commentSlice.reducer;
