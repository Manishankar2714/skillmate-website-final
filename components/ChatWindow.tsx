import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

export default function ChatWindow({ username, recipient }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to latest message
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Register and listen for incoming messages
  useEffect(() => {
    if (!username) return;

    socket.emit("register", username);

    const handleMessage = (msg) => {
      if (msg.from === recipient || msg.to === recipient) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("private_message", handleMessage);

    return () => {
      socket.off("private_message", handleMessage);
    };
  }, [username, recipient]);

  // Load chat history and mark as read
  useEffect(() => {
    const loadHistoryAndMarkRead = async () => {
      if (!username || !recipient) return;

      const res = await fetch(`/api/messages?from=${username}&to=${recipient}`);
      const data = await res.json();
      setMessages(data.messages || []);

      // Mark as read
      await fetch(`/api/messages/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: recipient, to: username }),
      });
    };

    loadHistoryAndMarkRead();
  }, [recipient, username]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (message.trim()) {
      const msg = {
        from: username,
        to: recipient,
        content: message,
        timestamp: new Date().toISOString(),
      };
      socket.emit("private_message", msg);
      setMessages((prev) => [...prev, msg]);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white dark:bg-gray-900 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Chat with {recipient}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-gray-100 dark:bg-gray-800">
        {messages.map((msg, index) => {
          const isOwn = msg.from === username;
          const time = new Date(msg.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={index}
              className={`max-w-[70%] px-4 py-2 rounded-xl shadow-sm text-sm whitespace-pre-wrap break-words ${
                isOwn
                  ? "bg-green-500 text-white self-end ml-auto"
                  : "bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 self-start"
              }`}
            >
              <div>{msg.content}</div>
              <div className="text-[10px] text-right opacity-60 mt-1">{time}</div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-white dark:bg-gray-900 flex items-center gap-2">
        <input
          type="text"
          className="flex-1 rounded-full px-4 py-2 border dark:border-gray-600 outline-none text-sm dark:bg-gray-800 dark:text-white"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={sendMessage}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition-all"
        >
          Send
        </button>
      </div>
    </div>
  );
}
