import { FirebaseApp, initializeApp } from "@firebase/app";
import { Analytics, getAnalytics, logEvent } from "@firebase/analytics";

let app: FirebaseApp;
export let analytics: Analytics;

export function initFirebase() {
  if (typeof window === "undefined") {
    return;
  }

  app = initializeApp({
    apiKey: "AIzaSyC0ew706rM7IFyF5yvvT4VigBX0FvqIAT0",
    authDomain: "steempro-next.firebaseapp.com",
    projectId: "steempro-next",
    storageBucket: "steempro-next.firebasestorage.app",
    messagingSenderId: "691442331419",
    appId: "1:691442331419:web:8e4e8d47f0fe08a5486dbe",
    measurementId: "G-4TNHNTQ4YD",
  });
  analytics = getAnalytics(app);
}
