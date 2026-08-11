import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Bot } from "lucide-react";
import { useChat } from "../context/ChatContext";
import ChatPanel from "./ChatPanel";

export default function ChatBubble({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const { isOpen, setIsOpen, hasUnread, setHasUnread } = useChat();

  const handleToggle = () => {
    console.log("ChatBubble toggled. Current isOpen:", isOpen);
    setIsOpen((prev) => {
      const nextState = !prev;
      if (nextState) {
        setHasUnread(false);
      }
      return nextState;
    });
  };

  return (
    <>
      {/* Floating Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            id="ai-chat-bubble-panel"
            data-lenis-prevent="true"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 250, damping: 25 }}
            style={{ zIndex: 9999 }}
            className="fixed bottom-20 right-4 left-4 sm:bottom-24 sm:right-6 sm:left-auto w-auto sm:w-[400px] h-[520px] max-h-[calc(100vh-120px)] rounded-[24px] glass-panel chat-glass flex flex-col overflow-hidden"
          >
            <ChatPanel theme={theme} showCloseButton={true} onClose={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Toggle Button */}
      <motion.button
        id="ai-chat-bubble-toggle"
        onClick={handleToggle}
        style={{ zIndex: 10000 }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-14 w-14 rounded-full bg-gradient-to-tr from-aurora-teal to-aurora-blue text-slate-950 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,209,0.4)] cursor-pointer hover:scale-105 transition-all"
        animate={{
          boxShadow: isOpen
            ? "0 0 20px rgba(155, 93, 229, 0.4)"
            : ["0 0 15px rgba(0,255,209,0.3)", "0 0 30px rgba(0,255,209,0.6)", "0 0 15px rgba(0,255,209,0.3)"],
        }}
        transition={isOpen ? { duration: 0.2 } : { repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="message"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageSquare className="w-6 h-6" />
              {hasUnread && (
                <>
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-aurora-magenta animate-ping" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-aurora-magenta" />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
