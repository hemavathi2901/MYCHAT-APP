"use client";

import { useState } from "react";
import { loginUser,loginWithGoogle  } from "@/src/app/firebase/services";
import { useRouter } from "next/navigation";

import Link from "next/link";
import { setDoc, doc } from "firebase/firestore";
import { db, auth } from "@/src/app/firebase/config";
import { setUserOnline } from "@/src/app/firebase/statusService";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
  setLoading(true);
  try {
    const res = await loginWithGoogle();

    const user = res.user;

    // store user in Firestore (same as email login)
    if (user) {
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        uid: user.uid,
      });
    }
console.log("Calling setUserOnline...");
setUserOnline(res.user.uid, res.user.email || "");
    router.push("/chat");
  } catch (err: any) {
    alert("Google Login Error: " + err.message);
  } finally {
    setLoading(false);
  }
};

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
     const res = await loginUser(email, password);
      setUserOnline(res.user.uid, res.user.email || "");
      router.push("/chat");

       const user = auth.currentUser;

    if (user) {
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        uid: user.uid,
      });
    }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-sm text-slate-500">Login to start chatting</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              required
              type="email"
              className="w-full mt-1 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              required
              type="password"
              className="w-full mt-1 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <button
  onClick={handleGoogleLogin}
  disabled={loading}
  className="w-full mt-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 active:scale-95 transition-all"
>
  Continue with Google
</button>

        <p className="mt-6 text-center text-sm text-slate-600">
          New here?{" "}
          <Link href="/register" className="font-bold text-blue-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
    
  );



  
}