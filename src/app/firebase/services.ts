import { auth } from "@/src/app/firebase/config";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { setUserOffline } from "./statusService";

export const loginUser = async (email: string, pass: string) => {
  return await signInWithEmailAndPassword(auth, email, pass);
};

export const logoutUser = async () => {
  const user = auth.currentUser;

  if (user) {
    setUserOffline(user.uid, user.email || ""); 
  }
  return await signOut(auth);
};

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};