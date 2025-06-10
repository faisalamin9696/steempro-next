import { createSlice } from "@reduxjs/toolkit";

interface ProfileState {
  value: Record<string, any>; // Ensures value remains an object
}

const initialState: ProfileState = {
  value: {},
};

const profileReducer = createSlice({
  name: "profiles",
  initialState,
  reducers: {
    addProfileHandler: (state: ProfileState, action) => {
      const payload = action?.payload;
      if (payload) {
        state.value = {
          ...state.value,
          [`${payload?.name}`]: payload,
        };
      }
    },
  },
});

export const { addProfileHandler } = profileReducer.actions;
export const ProfileReducer = profileReducer.reducer;
