/* eslint-disable react-hooks/immutability */
"use client";

import { useAuth } from "@/contexts/AuthContext";
import React, { useState, useRef, useEffect } from "react";

// SVG Icon Components
const MessageSquareIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MenuIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const SendIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SparklesIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3l1.545 4.635L18.18 9.18l-4.635 1.545L12 15.36l-1.545-4.635L5.82 9.18l4.635-1.545z" />
    <path d="M8 3l.364 1.091L9.455 4.8l-1.091.364L8 6.255l-.364-1.091L6.545 4.8l1.091-.364z" />
    <path d="M18 15l.364 1.091L19.455 16.8l-1.091.364L18 18.255l-.364-1.091L16.545 16.8l1.091-.364z" />
  </svg>
);

const CodeIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const LightbulbIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8a6 6 0 1 0-12 0c0 1.33.47 2.55 1.5 3.5.76.76 1.23 1.52 1.41 2.5" />
  </svg>
);

const HelpCircleIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ChevronDownIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const LogOutIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function EnhancedChatUI() {
  const { user, isLoading, logout } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content:
        "Hello! I'm Georgia, your AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const [currentApp, setCurrentApp] = useState("region14");

  const appConfig = {
    dashboard: { name: "Dashboard", color: "bg-blue-500", url: "/dashboard" },
    region14: { name: "Region 14", color: "bg-indigo-500", url: "/region14" },
    region2: { name: "Region 2", color: "bg-purple-500", url: "/region2" },
  };

  const conversations = [
    { id: 1, title: "Current conversation", active: true, date: "Today" },
    { id: 2, title: "Georgia", active: false, date: "Today" },
    {
      id: 3,
      title: "Project planning discussion",
      active: false,
      date: "Yesterday",
    },
    { id: 4, title: "Code review feedback", active: false, date: "Yesterday" },
  ];

  const promptCards = [
    {
      icon: <SparklesIcon className="w-5 h-5" />,
      title: "Get creative",
      description: "Help me brainstorm ideas for a new project",
      color: "text-purple-600",
    },
    {
      icon: <MessageSquareIcon className="w-5 h-5" />,
      title: "Explain concepts",
      description: "Explain quantum computing in simple terms",
      color: "text-blue-600",
    },
    {
      icon: <CodeIcon className="w-5 h-5" />,
      title: "Write code",
      description: "Write a Python function to sort a list",
      color: "text-green-600",
    },
    {
      icon: <HelpCircleIcon className="w-5 h-5" />,
      title: "Get advice",
      description: "What are best practices for API design?",
      color: "text-orange-600",
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setShowPrompts(false);

    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: `I understand you're asking about "${userMessage.content}". I'm here to help! This is a demonstration of how I would respond with detailed, thoughtful answers to your questions. In a production environment, I would connect to an AI service to provide intelligent, context-aware responses.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNewChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        content:
          "Hello! I'm Georgia, your AI assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
    setInput("");
    setShowPrompts(true);
  };

  const handlePromptClick = (prompt) => {
    setInput(prompt.description);
    textareaRef.current?.focus();
  };

  const handleLogout = async () => {
    await logout();
    localStorage.clear();
    window.location.href = "http://localhost:3000/login";
  };

  const handleAppSwitch = (appId) => {
    setCurrentApp(appId);
    setIsDropdownOpen(false);
    window.location.href = appConfig[appId].url;
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm z-20">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              >
                <MenuIcon className="w-5 h-5 text-gray-700" />
              </button>

              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${appConfig[currentApp].color}`}
                />
                <h1 className="text-xl font-semibold text-gray-900">
                  {appConfig[currentApp].name}
                </h1>
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                >
                  <span>Switch App</span>
                  <ChevronDownIcon className="w-4 h-4" />
                </button>

                {isDropdownOpen && (
                  <>
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-30 overflow-hidden">
                      <div className="py-1">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Switch Application
                        </div>
                        {(user?.assignedApps || user?.appAccess)?.map(
                          (appId) => (
                            <button
                              key={appId}
                              onClick={() => handleAppSwitch(appId)}
                              className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 ${
                                currentApp === appId
                                  ? "bg-indigo-50 text-indigo-700 font-medium"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${appConfig[appId].color}`}
                              />
                              {appConfig[appId].name}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:inline">
                {user?.email}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 border border-indigo-200">
                {user?.role}
              </span>
              <button
                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                onClick={handleLogout}
              >
                <LogOutIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? "w-72" : "w-0"
          } bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden shadow-sm`}
        >
          <div className="p-4 border-b border-gray-100">
            <button
              onClick={startNewChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              <PlusIcon className="w-5 h-5" />
              <span>New chat</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Today
              </div>
              {conversations
                .filter((c) => c.date === "Today")
                .map((conv) => (
                  <button
                    key={conv.id}
                    className={`w-full text-left px-3 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 group ${
                      conv.active
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <MessageSquareIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate text-sm">{conv.title}</span>
                  </button>
                ))}

              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mt-6">
                Yesterday
              </div>
              {conversations
                .filter((c) => c.date === "Yesterday")
                .map((conv) => (
                  <button
                    key={conv.id}
                    className="w-full text-left px-3 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-3 group text-gray-700"
                  >
                    <MessageSquareIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate text-sm">{conv.title}</span>
                  </button>
                ))}
            </div>
          </div>

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 py-8">
              {showPrompts && messages.length === 1 && (
                <div className="mb-12 animate-fadeIn">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg">
                      <MessageSquareIcon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      How can I help you today?
                    </h2>
                    <p className="text-gray-600">
                      Start a conversation or try one of these prompts
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {promptCards.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handlePromptClick(prompt)}
                        className="text-left p-5 rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-200 group"
                      >
                        <div className={`${prompt.color}`}>{prompt.icon}</div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {prompt.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {prompt.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-8 flex gap-4 animate-fadeIn ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                      message.role === "user"
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                        : "bg-gradient-to-br from-emerald-400 to-cyan-500"
                    }`}
                  >
                    {message.role === "user" ? (
                      <UserIcon className="w-5 h-5 text-white" />
                    ) : (
                      <SparklesIcon className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm font-semibold mb-2 text-gray-700 ${
                        message.role === "user" ? "text-right" : ""
                      }`}
                    >
                      {message.role === "user" ? "You" : "Georgia"}
                    </div>
                    <div
                      className={`${
                        message.role === "user"
                          ? "bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 px-5 py-3 rounded-2xl inline-block float-right max-w-full"
                          : ""
                      }`}
                    >
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="mb-8 flex gap-4 animate-fadeIn">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <SparklesIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold mb-2 text-gray-700">
                      Georgia
                    </div>
                    <div className="flex gap-1.5 py-3">
                      <div
                        className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-gradient-to-t from-gray-50 to-white">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3 items-end bg-white border-2 border-gray-300 rounded-2xl shadow-sm hover:shadow-md focus-within:border-indigo-400 focus-within:shadow-lg transition-all duration-200 p-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message Georgia..."
                  disabled={isTyping}
                  className="flex-1 resize-none outline-none px-3 py-3 max-h-40 text-gray-800 placeholder-gray-400 disabled:opacity-50 bg-transparent"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className={`p-3 rounded-xl transition-all duration-200 flex-shrink-0 ${
                    input.trim() && !isTyping
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 shadow-md"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <SendIcon className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-center text-gray-500 mt-3">
                Press Enter to send, Shift + Enter for new line
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
