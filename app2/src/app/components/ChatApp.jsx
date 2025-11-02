import React, { useState, useRef, useEffect } from "react";

export default function ChatApp() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey! How are you?",
      sender: "other",
      time: "10:30 AM",
      avatar: "🧑",
    },
    {
      id: 2,
      text: "I'm doing great! Just finished working on a new project.",
      sender: "me",
      time: "10:32 AM",
    },
    {
      id: 3,
      text: "That sounds exciting! What kind of project?",
      sender: "other",
      time: "10:33 AM",
      avatar: "🧑",
    },
    {
      id: 4,
      text: "It's a chat application with a modern UI. Want to see it?",
      sender: "me",
      time: "10:35 AM",
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: inputValue,
        sender: "me",
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages([...messages, newMessage]);
      setInputValue("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[93vh] bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Chats</h1>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {[
            {
              name: "Alex Johnson",
              message: "That sounds exciting! What kind...",
              time: "10:33 AM",
              unread: 2,
              avatar: "🧑",
              active: true,
            },
            {
              name: "Sarah Miller",
              message: "See you tomorrow!",
              time: "Yesterday",
              unread: 0,
              avatar: "👩",
              active: false,
            },
            {
              name: "Team Chat",
              message: "Great work everyone!",
              time: "Yesterday",
              unread: 5,
              avatar: "👥",
              active: false,
            },
            {
              name: "Mike Chen",
              message: "Thanks for the update",
              time: "2 days ago",
              unread: 0,
              avatar: "👨",
              active: false,
            },
          ].map((chat, idx) => (
            <div
              key={idx}
              className={`p-4 border-b border-gray-100 cursor-pointer transition ${
                chat.active ? "bg-blue-50" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{chat.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {chat.name}
                    </h3>
                    <span className="text-xs text-gray-500">{chat.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">
                      {chat.message}
                    </p>
                    {chat.unread > 0 && (
                      <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🧑</div>
              <div>
                <h2 className="font-semibold text-gray-800">Alex Johnson</h2>
                <p className="text-sm text-green-500">Active now</p>
              </div>
            </div>
            {/* <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition">
                <Phone className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition">
                <Video className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div> */}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "me" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-end space-x-2 max-w-md ${
                  msg.sender === "me" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                {msg.sender === "other" && (
                  <div className="text-2xl">{msg.avatar}</div>
                )}
                <div>
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      msg.sender === "me"
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-800 border border-gray-200"
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                  <p
                    className={`text-xs text-gray-500 mt-1 ${
                      msg.sender === "me" ? "text-right" : "text-left"
                    }`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-end space-x-2">
            {/* <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <Paperclip className="w-5 h-5 text-gray-600" />
            </button> */}
            <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full bg-transparent resize-none focus:outline-none text-gray-800"
                rows="1"
              />
            </div>
            {/* <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <Smile className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleSend}
              className="p-3 bg-blue-500 hover:bg-blue-600 rounded-full transition"
            >
              <Send className="w-5 h-5 text-white" />
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}
