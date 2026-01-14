import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProfileState {
  values: Record<string, AccountExt>;
}

const initialState: ProfileState = {
  values: {},
};

const profileSlice = createSlice({
  name: "profiles",
  initialState,
  reducers: {
    addProfileHandler: (state, action: PayloadAction<AccountExt>) => {
      const { name } = action.payload;
      if (name) {
        state.values[name] = action.payload;
      }
    },
  },
});

export const { addProfileHandler } = profileSlice.actions;
export const ProfileReducer = profileSlice.reducer;
