import { createSlice } from "@reduxjs/toolkit";

interface SettingsState {
    value: Setting | undefined
};



const initialstate: SettingsState = {
    value: undefined
};

const settingsReducer = createSlice({
    name: 'settings',
    initialState: initialstate,
    reducers: {
        updateSettingsHandler: (state: SettingsState, actions) => {
            const payload = actions?.payload;
            if (payload) {
                state.value = payload;
            }
        },

    },
});


export const { updateSettingsHandler } = settingsReducer.actions;
export const SettingsReducer = settingsReducer.reducer;