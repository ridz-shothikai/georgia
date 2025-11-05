/* eslint-disable react-hooks/immutability */
"use client";

import ChatApp from "./components/ChatApp";
import { useAuth } from "@/contexts/AuthContext";

export default function App2Dashboard() {
  const { user: userData, isLoading, logout } = useAuth();

  const user = userData?.user || userData;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (!user) {
    window.location.href = "http://localhost:3000/login";
  }

  return <ChatApp />;
}
