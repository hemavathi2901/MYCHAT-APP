import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "./config";

export const saveTokenToFirestore = async (token: string) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log("No user logged in");
      return;
    }

    await setDoc(
      doc(db, "users", user.uid),
      {
        fcmToken: token,
        notificationsEnabled: true,
      },
      { merge: true }
    );

    console.log("FCM token stored in Firestore");
  } catch (error) {
    console.error("Error saving token:", error);
  }
};