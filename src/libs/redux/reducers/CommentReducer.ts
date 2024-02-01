import { createSlice } from "@reduxjs/toolkit";


type CommentState = {
    values: Post | Feed | {}
};



const initialstate: CommentState = {
    values: {}
};

const commentReducer = createSlice({
    name: 'comments',
    initialState: initialstate,
    reducers: {
        addCommentHandler: (state: CommentState, actions) => {
            const payload = actions.payload;
            if (payload)
                state.values[`${payload?.author}/${payload?.permlink}`] = payload;
            else state.values = initialstate;

        },

    },
});


export const { addCommentHandler } = commentReducer.actions;
export const CommentReducer = commentReducer.reducer;