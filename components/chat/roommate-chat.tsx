"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

interface ChatProps {
  roommateId: string;
  roommateName: string;
  currentUserId: string;
  messages?: Message[];
  onSendMessage?: (content: string) => Promise<void>;
}

export function RoommateChat({
  roommateId,
  roommateName,
  currentUserId,
  messages = [],
  onSendMessage,
}: ChatProps) {
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [displayMessages, setDisplayMessages] = useState(messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages]);

  const handleSend = async () => {
    if (!messageInput.trim()) return;

    setSending(true);
    try {
      // Add optimistic message
      const newMessage: Message = {
        id: Math.random().toString(),
        senderId: currentUserId,
        senderName: "You",
        content: messageInput,
        timestamp: new Date(),
        isOwn: true,
      };

      setDisplayMessages((prev) => [...prev, newMessage]);
      setMessageInput("");

      // Send to backend
      if (onSendMessage) {
        await onSendMessage(messageInput);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="glass-sm flex flex-col h-[600px]">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">💬</span>
          Chat with {roommateName}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto pt-6 space-y-4">
        {displayMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-center">
              <span className="text-3xl block mb-2">👋</span>
              No messages yet. Start a conversation!
            </p>
          </div>
        ) : (
          displayMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  message.isOwn
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-br-none"
                    : "glass rounded-bl-none"
                }`}
              >
                <p className="text-sm font-semibold">{message.senderName}</p>
                <p className="text-sm mt-1">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="border-t border-white/10 p-4 space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={sending}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={sending || !messageInput.trim()}
            className="px-6"
          >
            {sending ? "..." : "Send"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </Card>
  );
}

interface ChatListProps {
  roommates: Array<{ id: string; fullName: string }>;
  selectedRoommateId?: string;
  onSelectRoommate: (id: string) => void;
}

export function RoommateChatList({
  roommates,
  selectedRoommateId,
  onSelectRoommate,
}: ChatListProps) {
  return (
    <Card className="glass-sm">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">💬</span>
          Messages
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-2">
        {roommates.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No roommates yet
          </p>
        ) : (
          roommates.map((roommate) => (
            <button
              key={roommate.id}
              onClick={() => onSelectRoommate(roommate.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                selectedRoommateId === roommate.id
                  ? "glass border-2 border-primary bg-primary/20"
                  : "glass hover:bg-white/10"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                {roommate.fullName.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{roommate.fullName}</p>
                <p className="text-xs text-muted-foreground">Click to chat</p>
              </div>
              <span className="text-lg">→</span>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
}
