/* eslint-disable react-hooks/immutability */
"use client";

import { useAuth } from "@/contexts/AuthContext";
import ChatApp from "../components/ChatApp";

export default function App1HomePage() {
  const { user: userData, isLoading } = useAuth();

  const user = userData?.user || userData;
  console.log("🚀 ~ App1HomePage ~ user:777", user);

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
