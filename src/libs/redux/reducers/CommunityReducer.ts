import { createSlice } from "@reduxjs/toolkit";


interface CommunityState {
    values: Community | {}
};



const initialstate: CommunityState = {
    values: {}
};

const communityReducer = createSlice({
    name: 'communities',
    initialState: initialstate,
    reducers: {
        addCommunityHandler: (state: CommunityState, actions) => {
            const payload = actions.payload;
            if (payload)
                state.values[`${payload?.account}`] = payload;
            else state.values = initialstate;

        },

    },
});


export const { addCommunityHandler } = communityReducer.actions;
export const CommunityReducer = communityReducer.reducer;