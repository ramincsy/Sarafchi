import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAApqxJhB2ANDKaxjYyV5ehgEkqft3lfaY",
  authDomain: "sarafchi-33502.firebaseapp.com",
  projectId: "sarafchi-33502",
  storageBucket: "sarafchi-33502.firebasestorage.app",
  messagingSenderId: "574710124731",
  appId: "1:574710124731:web:1e54c0f644107fe3dc999e",
  measurementId: "G-3F3FSEC9P1",
};

const vapidKey =
  "BD9OTZyzPGeWsmpeghi3Us3Vfwe45mg98HvXoFRoClIUzzFvTZTORcC91mg3VFZ78s1i81StJE6fMXXsqu3tcp8";

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// درخواست توکن برای Push Notifications
export const requestForToken = async () => {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service Worker is not supported in this browser.");
    return null;
  }

  try {
    const registration = await registerServiceWorker();
    if (!registration) {
      console.warn("Service Worker registration failed.");
      return null;
    }

    const currentToken = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (currentToken) {
      console.log("Token received:", currentToken);
      try {
        await fetch("/api/notifications/save-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: currentToken }),
        });
        console.log("Token saved successfully on server");
      } catch (err) {
        console.error("Error saving token on server:", err);
      }
      return currentToken;
    } else {
      console.warn("No registration token available.");
      return null;
    }
  } catch (err) {
    console.error("Error retrieving token:", err);
    return null;
  }
};

// ثبت Service Worker
export const registerServiceWorker = async () => {
  try {
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );
    console.log("Service Worker registered successfully:", registration);
    return registration;
  } catch (error) {
    console.error("Error registering Service Worker:", error);
    throw new Error("Failed to register Service Worker");
  }
};

// Listener برای دریافت پیام‌های Push در حالت آنلاین
export const onMessageListener = () =>
  new Promise((resolve, reject) => {
    onMessage(
      messaging,
      (payload) => {
        if (payload?.notification) {
          console.log("Message received:", payload);
          resolve(payload);
        } else {
          console.warn(
            "Message payload does not contain notification data:",
            payload
          );
          reject(new Error("Invalid message payload"));
        }
      },
      (error) => {
        console.error("Error in onMessage listener:", error);
        reject(error);
      }
    );
  });
