"use client";

import { useSearchParams } from "next/navigation";

export default function ChatContent({ setSelectedUser, users, selectedUser }: any) {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");

  // Sync selected user from URL
  if (uid && users.length > 0) {
    const foundUser = users.find((u: any) => u.uid === uid);
    if (foundUser && foundUser.uid !== selectedUser?.uid) {
      setSelectedUser(foundUser);
    }
  }

  return null; // this component is just for logic
}