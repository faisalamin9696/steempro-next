import { empty_profile } from "@/libs/constants/Placeholders";
import { createSlice } from "@reduxjs/toolkit";

interface LoginState {
  value: AccountExt;
}

const initialstate: LoginState = {
  value: empty_profile(""),
};

const loginReducer = createSlice({
  name: "login",
  initialState: initialstate,
  reducers: {
    saveLoginHandler: (state: LoginState, actions) => {
      state.value = actions.payload;
    },
    logoutHandler: (state: LoginState) => {
      state.value = empty_profile("");
    },
  },
});

export const { saveLoginHandler, logoutHandler } = loginReducer.actions;
export const LoginReducer = loginReducer.reducer;
