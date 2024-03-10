import { createSlice } from "@reduxjs/toolkit";


interface ProfileState {
    value: AccountExt | {}
};



const initialstate: ProfileState = {
    value: {}
};

const profileReducer = createSlice({
    name: 'profile',
    initialState: initialstate,
    reducers: {
        addProfileHandler: (state: ProfileState, actions) => {
            const payload = actions?.payload;
            if (payload)
                state.value[`${payload?.name}`] = payload;
        },

    },
});


export const { addProfileHandler } = profileReducer.actions;
export const ProfileReducer = profileReducer.reducer;