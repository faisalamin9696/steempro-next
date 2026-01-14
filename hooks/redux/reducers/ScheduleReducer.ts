import { createSlice } from "@reduxjs/toolkit";

interface ScheduleState {
  values: Record<string, any>; // Ensure values remains an object
}

const initialState: ScheduleState = {
  values: {},
};

const scheduleReducer = createSlice({
  name: "schedules",
  initialState,
  reducers: {
    addScheduleHandler: (state: ScheduleState, action) => {
      const payload = action.payload;
      if (payload) {
        state.values = {
          ...state.values,
          [`${payload?.id}/${payload?.username}`]: payload,
        };
      } else {
        state.values = {}; // Corrected reset
      }
    },
  },
});

export const { addScheduleHandler } = scheduleReducer.actions;
export const ScheduleReducer = scheduleReducer.reducer;
