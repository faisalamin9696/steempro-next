import { createSlice } from "@reduxjs/toolkit";

interface ScheduleState {
  values: Schedule | {};
}

const initialstate: ScheduleState = {
  values: {},
};

const scheduleReducer = createSlice({
  name: "schedules",
  initialState: initialstate,
  reducers: {
    addScheduleHandler: (state: ScheduleState, actions) => {
      const payload = actions.payload;
      if (payload)
        state.values[`${payload?.id}/${payload?.username}`] = payload;
      else state.values = initialstate;
    },
  },
});

export const { addScheduleHandler } = scheduleReducer.actions;
export const ScheduleReducer = scheduleReducer.reducer;
