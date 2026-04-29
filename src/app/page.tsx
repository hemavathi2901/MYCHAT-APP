"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/src/app/store/useChatStore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/src/app/firebase/config";

export default function HomePage() {
  const router = useRouter();
  const { setUser, user, isLoading } = useChatStore();

  useEffect(() => {
    // 1. Listen for Auth changes
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      // 2. Redirect based on status
      if (currentUser) {
        router.push("/chat");
      } else {
        router.push("/login");
      }
    });

    return () => unsub();
  }, [router, setUser]);

  // Loading Screen while checking if user is logged in
  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        {/* Modern Spinner */}
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-slate-500 font-medium animate-pulse">Connecting to Chat...</p>
      </div>
    </div>
  );
}