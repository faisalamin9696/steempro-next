import { createSlice } from "@reduxjs/toolkit";

interface SettingsState {
  value: Setting | null; // Prefer `null` over `undefined`
}

const initialState: SettingsState = {
  value: null,
};

const settingsReducer = createSlice({
  name: "settings",
  initialState,
  reducers: {
    updateSettingsHandler: (state: SettingsState, action) => {
      const payload = action.payload;
      if (payload) {
        state.value = payload;
      }
    },
  },
});

export const { updateSettingsHandler } = settingsReducer.actions;
export const SettingsReducer = settingsReducer.reducer;
