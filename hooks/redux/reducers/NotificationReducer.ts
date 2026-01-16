import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CustomNotification } from "@/hooks/useNotifications";

interface NotificationValues {
    [username: string]: CustomNotification[];
}

interface NotificationState {
    values: NotificationValues;
}

const initialState: NotificationState = {
    values: {},
};

const notificationReducer = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        addNotificationsHandler: (
            state: NotificationState,
            action: PayloadAction<{ username: string; notifications: CustomNotification[]; reset?: boolean }>
        ) => {
            const { username, notifications, reset } = action.payload;
            if (reset) {
                state.values[username] = notifications;
            } else {
                const existing = state.values[username] || [];
                // Simple deduplication based on ID
                const newOnes = notifications.filter(n => !existing.some(e => e.id === n.id));
                state.values[username] = [...existing, ...newOnes];
            }
        },
        markNotificationAsReadHandler: (
            state: NotificationState,
            action: PayloadAction<{ username: string; id: number }>
        ) => {
            const { username, id } = action.payload;
            if (state.values[username]) {
                state.values[username] = state.values[username].map(n =>
                    n.id === id ? { ...n, read: true } : n
                );
            }
        },
        markAllNotificationsReadHandler: (
            state: NotificationState,
            action: PayloadAction<{ username: string }>
        ) => {
            const { username } = action.payload;
            if (state.values[username]) {
                state.values[username] = state.values[username].map(n => ({ ...n, read: true }));
            }
        }
    },
});

export const { 
    addNotificationsHandler, 
    markNotificationAsReadHandler, 
    markAllNotificationsReadHandler 
} = notificationReducer.actions;
export const NotificationReducer = notificationReducer.reducer;
