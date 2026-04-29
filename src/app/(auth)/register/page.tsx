"use client";

import { useState } from "react";
import { auth } from "@/src/app/firebase/config";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";


export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create the user in Firebase
      const res = await createUserWithEmailAndPassword(auth, email, password);
  const user = res.user;
      // 2. Add their Name to their profile
      await updateProfile(user, {
        displayName: name,
      });
    

      // 3. Success! Go to chat
      router.push("/chat");
    } catch (err: any) {
      alert("Registration failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-sm text-slate-500">Join the chat today</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Display Name</label>
            <input
              required
              type="text"
              className="w-full mt-1 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none transition-all"
              placeholder="Your name"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              required
              type="email"
              className="w-full mt-1 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none transition-all"
              placeholder="email@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              required
              type="password"
              minLength={6}
              className="w-full mt-1 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none transition-all"
              placeholder="Min. 6 characters"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          

          <button
            disabled={loading}
            type="submit"
            className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}