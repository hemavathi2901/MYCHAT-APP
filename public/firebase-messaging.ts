"use client";

import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging";
import { app } from "../src/app/firebase/config";
import { saveTokenToFirestore } from "../src/app/firebase/notificationService";
import { toast } from "react-hot-toast";

const VAPID_KEY =
  "BMFEpPGTcot3BGEyfoOD9fbEpgBoXZcokttE7ZP8Uv0x63d6StGpFPRZc0yM1yA_mrC7QDw8-Bitk6umh07cmpg";

let messaging: any = null;

// ✅ GET MESSAGING INSTANCE
const getMessagingInstance = async () => {
  try {
    const supported = await isSupported();
    console.log("Firebase messaging supported:", supported);

    if (!supported) {
      console.warn("Firebase messaging not supported in this browser");
      return null;
    }

    if (!messaging) {
      messaging = getMessaging(app);
    }

    return messaging;
  } catch (err) {
    console.error("Messaging init error:", err);
    return null;
  }
};

// ✅ REGISTER SERVICE WORKER
const registerServiceWorker = async () => {
  console.log(" :: Registering service worker...");
  console.log(" :: navigator.serviceWorker:", navigator.serviceWorker);
  console.log(" :: window:", window);
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    console.log("✅ Service Worker registered:", registration);
    await navigator.serviceWorker.ready;

    console.log("✅ Service Worker ready");

    return registration;
  } catch (err) {
    console.error("Service worker registration failed:", err);
    return null;
  }
};

// ✅ REQUEST PERMISSION + GET TOKEN
export const requestPermissionAndToken = async () => {
  try {
    if (typeof window === "undefined") return null;

    const messaging = await getMessagingInstance();
    if (!messaging) return null;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("❌ Notification permission denied");
      return null;
    }

    const serviceWorkerRegistration = await registerServiceWorker();

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: serviceWorkerRegistration ?? undefined,
    });

    if (token) {
      console.log("✅ FCM token:", token);
      await saveTokenToFirestore(token);
      return token;
    }

    console.log("❌ No token available");
    return null;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

// ✅ LISTEN FOREGROUND MESSAGES (FINAL FIXED)
export const listenForegroundMessages = async () => {
  console.log("🔥 message listener started...");

  try {
    if (typeof window === "undefined") return;

    const messaging = await getMessagingInstance();
    if (!messaging) return;
    console.log("attaching ONMSG")

    onMessage(messaging, async (payload) => {
      console.log(" Foreground message:", payload);

      const title =
        payload.notification?.title || payload.data?.title || "New Message";
      const body =
        payload.notification?.body || payload.data?.body || "You have a message";

      if (Notification.permission === "granted") {
        console.log("Showing Notification directly from page");
        const notification = new Notification(title, {
          body,
          icon: "/favicon.ico",
        });
        notification.onshow = () => console.log("Browser notification shown");
        notification.onerror = (event) => console.error("Browser notification error", event);
      } else {
        console.warn("❌ Notification permission not granted");
      }
    });
  } catch (error) {
    console.error("Error listening to messages:", error);
  }
};