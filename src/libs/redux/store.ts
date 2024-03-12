import { configureStore } from '@reduxjs/toolkit';
import { ProfileReducer } from './reducers/ProfileReducer';
import { SettingsReducer } from './reducers/SettingsReducer';
import { CommentReducer } from './reducers/CommentReducer';
import { SteemGlobalsReducer } from './reducers/SteemGlobalReducer';
import { RepliesReducer } from './reducers/RepliesReducer';
import { LoginReducer } from './reducers/LoginReducer';
import { CommunityReducer } from './reducers/CommunityReducer';

export const store = configureStore({
    reducer: {
        profileReducer: ProfileReducer,
        settingsReducer: SettingsReducer,
        commentReducer: CommentReducer,
        communityReducer: CommunityReducer,
        steemGlobalsReducer: SteemGlobalsReducer,
        repliesReducer: RepliesReducer,
        loginReducer: LoginReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        immutableCheck: { warnAfter: 128 },
        serializableCheck: { warnAfter: 128 },
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch

