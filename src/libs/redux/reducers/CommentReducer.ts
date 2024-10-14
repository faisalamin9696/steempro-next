import { createSlice } from "@reduxjs/toolkit";

interface CommentState {
  values: Post | Feed | {};
}

const initialstate: CommentState = {
  values: {},
};

const commentReducer = createSlice({
  name: "comments",
  initialState: initialstate,
  reducers: {
    addCommentHandler: (state: CommentState, actions) => {
      const payload = actions.payload;
      if (payload)
        state.values[`${payload?.author}/${payload?.permlink}`] = payload;
      else state.values = initialstate;
    },

    clearCommentHandler: (state: CommentState) => {
      state.values = [];
    },
  },
});

export const { addCommentHandler, clearCommentHandler } =
  commentReducer.actions;
export const CommentReducer = commentReducer.reducer;
