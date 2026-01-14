import { configureStore } from "@reduxjs/toolkit";
import { SettingsReducer } from "./reducers/SettingsReducer";
import { CommentReducer } from "./reducers/CommentReducer";
import { RepliesReducer } from "./reducers/RepliesReducer";
import { CommunityReducer } from "./reducers/CommunityReducer";
import { ScheduleReducer } from "./reducers/ScheduleReducer";
import { CommonReducer } from "./reducers/CommonReducer";
import { OpenOrdersReducer } from "./reducers/OpenOrderReducer";
import { ProposalsReducer } from "./reducers/ProposalsReducer";
import { GlobalPropsReducer } from "./reducers/GlobalPropsReducer";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { LoginReducer } from "./reducers/LoginReducer";
import { ProfileReducer } from "./reducers/ProfileReducer";
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch: () => AppDispatch = useDispatch;

export const store = configureStore({
  reducer: {
    profileReducer: ProfileReducer,
    loginReducer: LoginReducer,
    settingsReducer: SettingsReducer,
    commentReducer: CommentReducer,
    communityReducer: CommunityReducer,
    globalPropsReducer: GlobalPropsReducer,
    repliesReducer: RepliesReducer,
    scheduleReducer: ScheduleReducer,
    commonReducer: CommonReducer,
    openOrdersReducer: OpenOrdersReducer,
    proposalsReducer: ProposalsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: { warnAfter: 128 },
      serializableCheck: { warnAfter: 128 },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
