importScripts("https://www.gstatic.com/firebasejs/12.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBzqHtgoEz3Y7w8dKi9Un0x1_PLMatX6WE",
  authDomain: "mychat-68f7b.firebaseapp.com",
  projectId: "mychat-68f7b",
  messagingSenderId: "1066904553831",
  appId: "1:1066904553831:web:1e200cd7590d5923e507c2",
});

const messaging = firebase.messaging();

// messaging.onBackgroundMessage(function (payload) {
//   const title = payload.notification?.title || payload.data?.title || "New message";
//   const options = {
//     body: payload.notification?.body || payload.data?.body || "You have a new notification.",
//     icon: payload.notification?.icon || "/favicon.ico",
//   };

  // self.registration.showNotification(title, options);
// });



messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background message:", payload);

  const title =
    payload.notification?.title || payload.data?.title || "New Message";
  const options = {
    body: payload.notification?.body || payload.data?.body || "",
    icon: "/favicon.ico",
  };

  self.registration.showNotification(title, options);
});

self.addEventListener("push", function (event) {
  console.log("🟦 Push event:", event);

  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch (err) {
      console.error("Error parsing push payload:", err);
    }
  }

  const title =
    payload.notification?.title || payload.data?.title || payload.title || "Static Notification";
  const options = {
    body:
      payload.notification?.body || payload.data?.body || payload.body || "This is a static fallback notification.",
    icon: "/favicon.ico",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
// self.addEventListener("notificationclick", function (event) {
//   event.notification.close();
//   event.waitUntil(
//     clients.matchAll({ type: "window" }).then(function (clientList) {
//       for (const client of clientList) {
//         if (client.url === "/" && "focus" in client) {
//           return client.focus();
//         }
//       }
//       if (clients.openWindow) {
//         return clients.openWindow("/");
//       }
//     })
//   );
// });
// self.addEventListener("push", function (event) {
//   const data = event.data?.json();

//   self.registration.showNotification(
//     payload.data.title || "New Message",
//     {
//       body: payload.data.body || "",
//       icon: "/favicon.ico",
//     }
//   );
// });
