import { updateSettings } from "@/utils/user";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Constants } from "@/constants";

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
    updateSettingsHandler: (
      state: SettingsState,
      action: PayloadAction<Partial<Setting>>
    ) => {
      const payload = action.payload;
      if (payload && state.value) {
        state.value = {
          ...state.value,
          ...payload,
        };

        const updatedSettings = {
          ...state.value,
          ...payload,
        };
        updateSettings(updatedSettings);
      } else if (payload) {
        state.value = { ...Constants.activeSettings, ...payload };
        updateSettings(state.value);
      }
    },
  },
});

export const { updateSettingsHandler } = settingsReducer.actions;
export const SettingsReducer = settingsReducer.reducer;
