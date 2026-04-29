import { ref, set, onDisconnect, serverTimestamp } from "firebase/database";
import { rtdb } from "./config";

/**
 *  Set user ONLINE
 * - Marks user as online immediately
 * - Automatically sets offline when user disconnects (tab close / crash / network loss)
 */
export const setUserOnline = (uid: string,email: string) => {
  const userRef = ref(rtdb, `status/${uid}`);

  // Set user online
  set(userRef, {
    online: true,
    email: email,
    lastSeen: serverTimestamp(),
  });

  // Auto set offline when user disconnects
  onDisconnect(userRef).set({
    online: false,
    email: email,
    lastSeen: serverTimestamp(),
  });
};

/**
 * 🔴 Set user OFFLINE manually (logout case)
 */
export const setUserOffline = (uid: string,email: string) => {
  const userRef = ref(rtdb, `status/${uid}`);

  set(userRef, {
    online: false,
    email: email,
    lastSeen: serverTimestamp(),
  });
};