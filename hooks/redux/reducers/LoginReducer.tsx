import { empty_profile } from "@/constants/templates";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
    addLoginHandler: (
      state: LoginState,
      action: PayloadAction<AccountExt>
    ) => {
      state.value = action.payload;
    },
    logoutHandler: (state: LoginState) => {
      state.value = empty_profile("");
    },
  },
});

export const { addLoginHandler, logoutHandler } = loginReducer.actions;
export const LoginReducer = loginReducer.reducer;
