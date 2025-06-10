import { createSlice } from "@reduxjs/toolkit";

interface CommentState {
  values: Record<string, any>; // Ensure values is always an object
}

const initialState: CommentState = {
  values: {},
};

const commentReducer = createSlice({
  name: "comments",
  initialState,
  reducers: {
    addCommentHandler: (state: CommentState, action) => {
      const payload = action.payload;
      if (payload) {
        state.values = {
          ...state.values,
          [`${payload?.author}/${payload?.permlink}`]: payload,
        };
      } else {
        state.values = {};
      }
    },

    clearCommentHandler: (state: CommentState) => {
      state.values = {}; // Corrected from `[]` to `{}`
    },
  },
});

export const { addCommentHandler, clearCommentHandler } =
  commentReducer.actions;
export const CommentReducer = commentReducer.reducer;
