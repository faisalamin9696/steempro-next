import { createSlice } from "@reduxjs/toolkit";

interface InfoState {
    values: {}
};


export const initialstate: InfoState = {
    values: {}
};

const repliesReducer = createSlice({
    name: 'postReplies',
    initialState: initialstate,
    reducers: {
        addRepliesHandler: (state: InfoState, actions) => {
            const { comment, replies } = actions.payload;
            state.values[`${comment?.author}/${comment?.permlink}`] = replies;
        },

    },
});


export const { addRepliesHandler } = repliesReducer.actions;
export const RepliesReducer = repliesReducer.reducer;