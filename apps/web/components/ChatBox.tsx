"use client";

import React, { useState, useEffect, useRef } from "react";

interface Message {
  metadata?: {
    progress: [];
  };
  _id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatProps {
  sessionId: string;
  systemPrompt?: string;
}

export const Chat: React.FC<ChatProps> = ({ sessionId }) => {
  const api = "http://localhost:3001";
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTdjOTM2ZjNiMTk0Mjc2NGIwNTc2ZDYiLCJpYXQiOjE3NzAxMzIwOTcsImV4cCI6MTc3MDIxODQ5N30.2HbedaIHRzK2o_emEo25l96-0J4qwaJGyqMRje4FQz0";
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // const userMessage: Message = {
    //   role: "user",
    //   content: input,
    //   timestamp: new Date().toISOString(),
    // };

    // // Optimistically add user message
    // setMessages((prev) => [...prev, userMessage]);
    // setInput("");
    // setLoading(true);

    try {
      // Call your Inngest API endpoint
      const res = await fetch(`${api}/chat/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: input,
          role: "user",
        }),
      });

      if (!res.ok) {
        // If HTTP status is not 2xx, throw an error
        const errorText = await res.text();
        console.error("Failed to send message:", res.status, errorText);
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // Parse JSON response
      const data = await res.json();
      console.log(data);

      setMessages([...data]);
    } catch (err) {
      console.error("Failed to send message:", err);

      const errorMsg: Message = {
        role: "assistant",
        content: "Something went wrong. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-xl mx-auto border rounded-xl shadow p-4 bg-white">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-3 p-2 rounded-lg max-w-[80%] ${
              msg.role === "user"
                ? "bg-blue-100 self-end"
                : "bg-gray-100 self-start"
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 border rounded px-3 py-2"
          placeholder="Type your message..."
          disabled={loading}
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
};
