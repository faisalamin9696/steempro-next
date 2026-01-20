import { initBotId } from "botid/client/core";

initBotId({
  protect: [
    {
      path: "/api/translate",
      method: "POST",
    },
    {
      path: "/api/chat",
      method: "POST",
    },
    {
      path: "/api/track",
      method: "POST",
    },
    {
      path: "/api/auth/*",
      method: "POST",
    },
    {
      path: "/schedules",
      method: "POST",
    },
    {
      path: "/submit",
      method: "POST",
    },
  ],
});
