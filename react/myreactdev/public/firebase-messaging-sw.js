// Log when the script starts
console.log("Service Worker script started");

// Import Firebase scripts
try {
  importScripts("https://www.gstatic.com/firebasejs/8.2.6/firebase-app.js");
  importScripts(
    "https://www.gstatic.com/firebasejs/8.2.6/firebase-messaging.js"
  );
  console.log("Firebase scripts imported successfully");
} catch (error) {
  console.error("Error importing Firebase scripts:", error);
  throw error; // Stop execution if scripts fail to load
}

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAApqxJhB2ANDKaxjYyV5ehgEkqft3lfaY",
  authDomain: "sarafchi-33502.firebaseapp.com",
  projectId: "sarafchi-33502",
  storageBucket: "sarafchi-33502.firebasestorage.app",
  messagingSenderId: "574710124731",
  appId: "1:574710124731:web:1e54c0f644107fe3dc999e",
  measurementId: "G-3F3FSEC9P1",
};
// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
  throw error; // Stop execution if Firebase fails to initialize
}

// Get Firebase Messaging instance
const messaging = firebase.messaging();

// Log when Firebase Messaging is ready
console.log("Firebase Messaging initialized");

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload);

  // Check if the payload contains notification data
  if (payload.notification) {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      //icon: "/path/to/icon.png", // Replace with the correct path to your icon
    };

    // Show the notification
    self.registration
      .showNotification(notificationTitle, notificationOptions)
      .then(() => {
        console.log("Notification shown successfully");
      })
      .catch((error) => {
        console.error("Error showing notification:", error);
      });
  } else {
    console.warn("Payload does not contain notification data:", payload);
  }
});

// Log when the Service Worker is fully loaded
console.log("Service Worker script loaded successfully");
