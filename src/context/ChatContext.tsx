import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ChatMessage } from "../types";

interface ChatContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  hasUnread: boolean;
  setHasUnread: React.Dispatch<React.SetStateAction<boolean>>;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  handleSendMessage: (e?: React.FormEvent, customInput?: string) => Promise<void>;
  showContactModal: boolean;
  setShowContactModal: React.Dispatch<React.SetStateAction<boolean>>;
  showCalendarModal: boolean;
  setShowCalendarModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-greeting",
      role: "model",
      content:
        "Hey! I'm Vincent, Von's AI automation assistant at **SE7ENLABS**. I can walk you through Von's **autonomous systems**, **core projects**, or **technical capabilities**. What would you like to explore?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || !isOpen) return;
      if (showContactModal) {
        setShowContactModal(false);
      } else if (showCalendarModal) {
        setShowCalendarModal(false);
      } else {
        setIsOpen(false);
        setHasUnread(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, showContactModal, showCalendarModal]);

  const handleSendMessage = async (e?: React.FormEvent, customInput?: string) => {
    if (e) e.preventDefault();
    const msgText = customInput !== undefined ? customInput : input;
    if (!msgText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      content: msgText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (customInput === undefined) {
      setInput("");
    }
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role === "model" ? "model" : "user",
            content: msg.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to retrieve response.");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          role: "model",
          content: data.text || "I was unable to retrieve a response from the model. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (error: any) {
      console.error("Failed to fetch chat response:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          role: "model",
          content: error.message || "Oops! I encountered an off-grid connection issue. Von's server is still live but my AI core is currently cycling. Try checking back in 10 seconds or drop Von a direct note on the contact form!",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
      setHasUnread(!isOpen);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        setIsOpen,
        hasUnread,
        setHasUnread,
        messages,
        setMessages,
        input,
        setInput,
        isLoading,
        setIsLoading,
        handleSendMessage,
        showContactModal,
        setShowContactModal,
        showCalendarModal,
        setShowCalendarModal,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
