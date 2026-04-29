import { create } from "zustand";
import { User } from "firebase/auth";

interface ChatState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) =>
    set({
      user,
      isLoading: false,
    }),
}));