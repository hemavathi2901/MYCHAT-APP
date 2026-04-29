"use client";

import { useEffect, useState, useRef } from "react";
import { db, auth } from "@/src/app/firebase/config";
import {updateDoc, doc, getDoc } from "firebase/firestore";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { logoutUser } from "@/src/app/firebase/services";
import {
  requestPermissionAndToken,
  listenForegroundMessages,
} from "@/public/firebase-messaging";

// FOR 1-1 CHATS
const getChatId = (uid1: string, uid2: string) => {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};

type ChatMessage = {
  id: string;
  text: string;
  user: string;
  createdAt?: any;
};

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false); // ✅ FIX: hydration

  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");

  // ✅ FIX: mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (uid && users.length > 0) {
      const foundUser = users.find((u) => u.uid === uid);
      if (foundUser && foundUser.uid !== selectedUser?.uid) {
        setSelectedUser(foundUser);
      }
    }
  }, [uid, users]);

  // AUTH GUARD
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // ✅ FIX: notifications ONLY on click
  const handleEnableNotifications = async () => {
    const token = await requestPermissionAndToken();
    const user = auth.currentUser;

    console.log("📱 FRONTEND TOKEN:", token);
    if (!user) {
      console.error("User not logged in");
      return;
    }

    if (token) {
      setNotificationsEnabled(true);
      setFcmToken(token);
      await updateDoc(doc(db, "users", user.uid), {
        fcmToken: token,
      });
      listenForegroundMessages();
      console.log("FCM token saved to Firestore:", token);
    }
  };

  const handleTestNotification = async () => {
    if (typeof window === "undefined") return;

    console.log("Notification.permission before request:", Notification.permission);
    let permission = Notification.permission;
    if (permission !== "granted") {
      permission = await Notification.requestPermission();
    }

    console.log("Notification.permission after request:", permission);
    if (permission !== "granted") {
      console.warn("Notification permission not granted");
      return;
    }

    const title = "Test Push Notification";
    const options = {
      body: "This is a manual test notification.",
      icon: "/favicon.ico",
    };

    console.log("Showing desktop notification directly");
    const notification = new Notification(title, options);
    notification.onshow = () => console.log("Browser notification shown");
    notification.onerror = (error) => console.error("Browser notification error", error);
    notification.onclose = () => console.log("Browser notification closed");
    console.log("Created direct Notification:", notification);
  };

  // useEffect(() => {
  //   requestPermissionAndToken();
  //   listenForegroundMessages();
  // }, []);
  // RESET when user changes
  useEffect(() => {
    setMessages([]);
    setLoading(true);
  }, [selectedUser]);

  // REALTIME MESSAGES
  useEffect(() => {
    if (!selectedUser || !auth.currentUser) return;

    const chatId = getChatId(
      auth.currentUser.uid,
      selectedUser.uid
    );

    const q = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));

      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedUser]);

  // USERS LIST
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    });

    return () => unsubscribe();
  }, []);

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // SEND MESSAGE
  const handleSend = async () => {
    if (!message.trim()) return;
    if (!selectedUser || !auth.currentUser) return;
    

    const chatId = getChatId(
      auth.currentUser.uid,
      selectedUser.uid
    );

    await addDoc(collection(db, "messages"), {
      text: message,
      user: auth.currentUser.email,
      senderId: auth.currentUser.uid,
      receiverId: selectedUser.uid,
      chatId: chatId,
      createdAt: serverTimestamp(),
    });

    const receiverDoc = await getDoc(doc(db, "users", selectedUser.uid));
    const receiverToken = receiverDoc.exists()
      ? (receiverDoc.data()?.fcmToken as string | undefined)
      : undefined;

    if (receiverToken) {
      console.log("Sending FCM to token:", receiverToken);
      const res=await fetch("/api/send-fcm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: receiverToken,
          title: `New message from ${auth.currentUser.email}`,
          body: message,
          data: {
            chatId,
            senderId: auth.currentUser.uid,
          },
        }),
      });
      
      const result = await res.json();
      if (!res.ok) {
        console.error("FCM send failed:", result);
      } else {
        console.log("FCM send success:", result);
      }
    }

    setMessage("");
  };

  
 
 
  // LOGOUT
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout failed:", err);
      setLoggingOut(false);
    }
  };

  //   useEffect(() => {
  //   console.log("🔥 INIT NOTIFICATIONS");

  //  // requestPermissionAndToken();      // already working
  //   listenForegroundMessages();       // 🚨 THIS WAS MISSING

  // }, []);

  return (
    <div className="flex flex-col md:flex-row bg-green-300">
      
      {/* LEFT SIDE */}
<div className="w-full md:w-1/4 bg-gray-200 p-3 overflow-y-auto sticky top-0  md:h-screen">  
      <h2 className="font-bold mb-3">Users</h2>

        {users
          .filter((u) => u.uid !== auth.currentUser?.uid)
          .map((u) => (
            <div
              key={u.id}
              onClick={() => {
                setSelectedUser(u);
                router.push(`/chat?uid=${u.uid}`);
              }}
              className={`p-2 rounded mb-2 cursor-pointer ${
                selectedUser?.uid === u.uid ? "bg-blue-300" : "bg-white"
              }`}
            >
              {u.email}
            </div>
          ))}
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden bg-green-300">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 bg-blue-600 text-white">
          <h1 className="font-bold text-lg">Chat Room 💬</h1>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className={`px-3 py-1 rounded ${
              loggingOut ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>

        {!selectedUser && (
          <p className="text-center text-gray-500 mt-4">
            Select a user to start chatting
          </p>
        )}

        {/* ✅ FIXED NOTIFICATION UI */}
        {mounted && (
          <div className="p-4 text-sm text-gray-700 bg-white border-t space-y-2">
            {notificationsEnabled ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <span className="text-green-700">Notifications enabled ✅</span>
                <button
                  onClick={handleTestNotification}
                  className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600"
                >
                  Test push notification
                </button>
              </div>
            ) : (
              <button
                onClick={handleEnableNotifications}
                className="text-blue-600 underline"
              >
                Enable Notifications 🔔
              </button>
            )}
          </div>
        )}

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="text-center text-gray-600">Loading messages...</p>
          ) : (
            messages.map((msg) => {
              const isMe = msg.user === auth.currentUser?.email;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`p-3 rounded-xl max-w-[70%] shadow ${
                      isMe
                        ? "bg-blue-600 text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    <p className="text-xs opacity-70">{msg.user}</p>
                    <p>{msg.text}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="p-4 flex gap-2 bg-white border-t">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              selectedUser ? "Type a message..." : "Select a user to chat"
            }
            disabled={!selectedUser}
            className="flex-1 p-3 border rounded-xl"
          />

          <button
            onClick={handleSend}
            disabled={!selectedUser}
            className={`px-5 rounded-xl text-white ${
              selectedUser
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400"
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}