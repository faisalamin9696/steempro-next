import { configureStore } from "@reduxjs/toolkit";
import { ProfileReducer } from "./reducers/ProfileReducer";
import { SettingsReducer } from "./reducers/SettingsReducer";
import { CommentReducer } from "./reducers/CommentReducer";
import { SteemGlobalsReducer } from "./reducers/SteemGlobalReducer";
import { RepliesReducer } from "./reducers/RepliesReducer";
import { LoginReducer } from "./reducers/LoginReducer";
import { CommunityReducer } from "./reducers/CommunityReducer";
import { ScheduleReducer } from "./reducers/ScheduleReducer";
import { CommonReducer } from "./reducers/CommonReducer";
import { OpenOrdersReducer } from "./reducers/OpenOrderReducer";

export const store = configureStore({
  reducer: {
    profileReducer: ProfileReducer,
    settingsReducer: SettingsReducer,
    commentReducer: CommentReducer,
    communityReducer: CommunityReducer,
    steemGlobalsReducer: SteemGlobalsReducer,
    repliesReducer: RepliesReducer,
    loginReducer: LoginReducer,
    scheduleReducer: ScheduleReducer,
    commonReducer: CommonReducer,
    openOrdersReducer: OpenOrdersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: { warnAfter: 128 },
      serializableCheck: { warnAfter: 128 },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
