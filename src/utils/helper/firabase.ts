import { FirebaseApp, initializeApp } from "@firebase/app";
import { Analytics, getAnalytics, logEvent } from "@firebase/analytics";

let app: FirebaseApp;
export let analytics: Analytics;

export function initFirebase() {
  if (typeof window === "undefined") {
    return;
  }

  app = initializeApp({
    apiKey: "AIzaSyCjxJmBY_aeejCaF7N8AF5zrGq7dwrLQ0g",
    authDomain: "steemcn.firebaseapp.com",
    databaseURL: "https://steemcn-default-rtdb.firebaseio.com",
    projectId: "steemcn",
    storageBucket: "steemcn.firebasestorage.app",
    messagingSenderId: "570660684965",
    appId: "1:570660684965:web:065cfb434510e2d8b4794c",
    measurementId: "G-WNFSHQ2XVV"
  });

  analytics = getAnalytics(app);

  logEvent(analytics, "test-event");
}
