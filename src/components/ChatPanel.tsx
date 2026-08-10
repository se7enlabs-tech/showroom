import React, { useRef, useEffect, useState } from "react";
import Lenis from "lenis";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Bot, Send, X, Mail, CheckCircle2, Loader2, Calendar } from "lucide-react";
import { useChat } from "../context/ChatContext";
import CalEmbed from "./CalEmbed";

interface ChatPanelProps {
  theme?: "dark" | "light";
  showCloseButton?: boolean;
  onClose?: () => void;
  className?: string;
}

export default function ChatPanel({ theme = "dark", showCloseButton = false, onClose, className = "" }: ChatPanelProps) {
  const {
    messages,
    input,
    setInput,
    isLoading,
    handleSendMessage,
    showContactModal,
    setShowContactModal,
    showCalendarModal,
    setShowCalendarModal,
  } = useChat();

  const [formData, setFormData] = useState({ name: "", email: "", subject: "Chatbot Inquiry", message: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    setFormLoading(true);
    setFormSuccess(null);
    setFormError(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setFormSuccess("Your message has been sent!");
        setFormData({ name: "", email: "", subject: "Chatbot Inquiry", message: "" });
      } else {
        setFormError(data.error || "Failed to send message. Please try again.");
      }
    } catch (err) {
      setFormError("An error occurred while sending the message.");
    } finally {
      setFormLoading(false);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  // Initialize smooth Lenis scrolling inside the chat window
  useEffect(() => {
    if (!chatHistoryRef.current) return;

    const lenis = new Lenis({
      wrapper: chatHistoryRef.current,
      content: (chatHistoryRef.current.firstElementChild as HTMLElement) || undefined,
      lerp: 0.08,
      wheelMultiplier: 1.1,
      smoothWheel: true,
      syncTouch: false,
    });
    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Auto scroll to bottom of messages
  useEffect(() => {
    const scrollToBottom = () => {
      if (lenisRef.current && messagesEndRef.current) {
        lenisRef.current.scrollTo(messagesEndRef.current, { immediate: true });
      }
      if (chatHistoryRef.current) {
        chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
      }
    };

    // Ensure DOM is fully updated before scrolling
    requestAnimationFrame(() => {
      requestAnimationFrame(scrollToBottom);
    });
  }, [messages, isLoading]);

  // Helper to render message content with text animation and theme colored highlights
  const renderMessageContent = (text: string) => {
    // Strip hash headers if present
    const cleanText = text.replace(/#/g, "");
    const lines = cleanText.split("\n");

    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="space-y-1"
      >
        {lines.map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) return <p key={i} className="h-1" />;

          if (trimmed.includes("[ACTION: SHOW_CONTACT_FORM]")) {
            return (
              <motion.button
                key={i}
                type="button"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setShowContactModal(true)}
                className={`mt-2 mb-2 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer ${
                  theme === "light"
                    ? "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md"
                    : "bg-aurora-teal text-slate-950 hover:bg-[#00e6bc] hover:shadow-[0_0_15px_rgba(0,255,209,0.3)]"
                }`}
              >
                <MessageSquare className="w-4 h-4" /> Open Contact Form
              </motion.button>
            );
          }

          if (trimmed.includes("[ACTION: SHOW_CALENDAR_FORM]")) {
            return (
              <motion.button
                key={i}
                type="button"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setShowCalendarModal(true)}
                className={`mt-2 mb-2 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer ${
                  theme === "light"
                    ? "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md"
                    : "bg-aurora-teal text-slate-950 hover:bg-[#00e6bc] hover:shadow-[0_0_15px_rgba(0,255,209,0.3)]"
                }`}
              >
                <Bot className="w-4 h-4" /> Book Discovery Call
              </motion.button>
            );
          }

          const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ");
          const contentText = isBullet ? trimmed.substring(2) : line;

          // Parse **important text** for theme coloring
          const parts: React.ReactNode[] = [];
          const boldRegex = /\*\*(.*?)\*\*/g;
          let lastIndex = 0;
          let match: RegExpExecArray | null;

          while ((match = boldRegex.exec(contentText)) !== null) {
            if (match.index > lastIndex) {
              parts.push(contentText.substring(lastIndex, match.index));
            }
            parts.push(
              <strong key={match.index} className="text-aurora-teal font-semibold font-mono">
                {match[1]}
              </strong>
            );
            lastIndex = boldRegex.lastIndex;
          }
          if (lastIndex < contentText.length) {
            parts.push(contentText.substring(lastIndex));
          }

          const renderedText = parts.length > 0 ? parts : contentText;

          return isBullet ? (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
              className={`ml-4 list-disc text-xs md:text-sm my-1 leading-relaxed ${
                theme === "light" ? "text-slate-700" : "text-slate-300"
              }`}
            >
              {renderedText}
            </motion.li>
          ) : (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.02 }}
              className={`text-xs md:text-sm leading-relaxed my-1 ${
                theme === "light" ? "text-slate-700" : "text-slate-300"
              }`}
            >
              {renderedText}
            </motion.p>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className={`flex flex-col h-full w-full ${className}`}>
      {/* Header */}
      <div className={`p-4 bg-gradient-to-r border-b flex items-center justify-between cursor-default flex-shrink-0 ${
        theme === "light"
          ? "from-aurora-teal/10 to-aurora-blue/10 border-slate-200/50"
          : "from-aurora-teal/10 to-aurora-blue/10 border-white/5"
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="p-2 rounded-xl bg-aurora-teal/10 border border-aurora-teal/20 text-aurora-teal">
              <Bot className="w-4 h-4" />
            </div>
            <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 ${
              theme === "light" ? "border-white" : "border-aurora-bg"
            }`} />
          </div>
          <div>
            <h4 className={`font-display font-bold text-sm flex items-center gap-1.5 ${
              theme === "light" ? "text-slate-900" : "text-white"
            }`}>
              Vincent
            </h4>
            <p className="text-[10px] font-mono text-slate-400">Von's Automation Assistant</p>
          </div>
        </div>
        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              theme === "light"
                ? "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                : "text-slate-400 hover:text-white hover:bg-white/10"
            }`}
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Chat History */}
      <div
        ref={chatHistoryRef}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className="flex-1 p-4 overflow-y-auto overscroll-contain touch-pan-y min-h-0 focus:outline-none"
      >
        <div className="space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-end gap-2`}
            >
              {msg.role === "model" && (
                <div className="flex-shrink-0 mb-1">
                  <div className="h-6 w-6 rounded-full bg-aurora-teal/10 border border-aurora-teal/20 text-aurora-teal flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-[18px] px-4 py-3 text-xs md:text-sm shadow-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-aurora-teal to-aurora-blue text-slate-950 rounded-br-none font-medium"
                    : theme === "light"
                      ? "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
                      : "bg-white/[0.03] border border-white/5 text-slate-200 rounded-bl-none"
                }`}
              >
                {msg.role === "user" ? (
                  <p className="leading-relaxed">{msg.content}</p>
                ) : (
                  renderMessageContent(msg.content)
                )}
                <div
                  className={`text-[9px] mt-1.5 text-right font-mono ${
                    msg.role === "user" ? "text-slate-900/60" : "text-slate-500"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Loader indicator */}
          {isLoading && (
            <div className="flex justify-start items-end gap-2">
              <div className="flex-shrink-0 mb-1">
                <div className="h-6 w-6 rounded-full bg-aurora-teal/10 border border-aurora-teal/20 text-aurora-teal flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className={`max-w-[85%] rounded-[18px] px-4 py-3 rounded-bl-none ${
                theme === "light"
                  ? "bg-white border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
                  : "bg-white/[0.03] border border-white/5"
              }`}>
                <div className="flex items-center gap-1.5 py-1 px-0.5">
                  <span className="h-2 w-2 rounded-full bg-aurora-teal animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-aurora-teal/70 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-aurora-teal/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input form */}
      <form
        onSubmit={handleSendMessage}
        className={`p-3 flex items-center gap-2 cursor-default flex-shrink-0 border-t ${
          theme === "light"
            ? "bg-white/40 border-slate-200/50"
            : "bg-slate-900/40 border-white/10"
        }`}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Von's work..."
          className={`flex-grow min-w-0 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition-all placeholder:text-slate-500 ${
            theme === "light"
              ? "bg-slate-100/50 border border-slate-200 text-slate-900 focus:border-aurora-teal/50 hover:border-slate-300"
              : "bg-white/5 border border-white/10 text-white focus:border-aurora-teal/50 hover:border-white/20"
          }`}
          disabled={isLoading}
        />
        <button
          type="submit"
          title="Send Message"
          aria-label="Send Message"
          disabled={isLoading}
          className="p-2.5 rounded-xl bg-gradient-to-r from-aurora-teal to-aurora-blue text-slate-950 hover:shadow-[0_0_15px_rgba(0,255,209,0.35)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Overlays */}
      <AnimatePresence>
        {showContactModal && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`absolute inset-0 z-50 flex flex-col ${theme === "light" ? "bg-white" : "bg-slate-950"}`}
          >
            <div className={`flex items-center justify-between p-4 border-b ${theme === "light" ? "border-slate-200" : "border-white/10"}`}>
              <h3 className={`font-bold flex items-center gap-2 ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                <Mail className="w-4 h-4 text-aurora-teal" /> Contact Von
              </h3>
              <button type="button" onClick={() => setShowContactModal(false)} className={`p-1.5 rounded-lg transition-colors cursor-pointer ${theme === "light" ? "hover:bg-slate-100 text-slate-500" : "hover:bg-white/10 text-slate-400"}`}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
              {formSuccess ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className={`font-bold text-lg ${theme === "light" ? "text-slate-900" : "text-white"}`}>Message Sent!</h4>
                    <p className={`text-sm mt-2 ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>{formSuccess}</p>
                  </div>
                  <button type="button" onClick={() => setShowContactModal(false)} className="mt-4 px-6 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors text-sm font-medium cursor-pointer">Close</button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4 text-sm flex flex-col h-full">
                  <div className="space-y-1.5">
                    <label className={`text-xs font-mono ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>Name</label>
                    <input type="text" required placeholder="Jane Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`w-full px-3.5 py-2.5 rounded-xl border transition-colors focus:outline-none focus:border-aurora-teal/50 ${theme === "light" ? "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400" : "bg-white/5 border-white/10 text-white placeholder:text-slate-500"}`} disabled={formLoading} />
                  </div>
                  <div className="space-y-1.5">
                    <label className={`text-xs font-mono ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>Email Address</label>
                    <input type="email" required placeholder="jane@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`w-full px-3.5 py-2.5 rounded-xl border transition-colors focus:outline-none focus:border-aurora-teal/50 ${theme === "light" ? "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400" : "bg-white/5 border-white/10 text-white placeholder:text-slate-500"}`} disabled={formLoading} />
                  </div>
                  <div className="space-y-1.5 flex-grow flex flex-col">
                    <label className={`text-xs font-mono ${theme === "light" ? "text-slate-500" : "text-slate-400"}`}>Message</label>
                    <textarea required placeholder="How can I help you?" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className={`w-full px-3.5 py-2.5 rounded-xl border transition-colors focus:outline-none focus:border-aurora-teal/50 flex-grow resize-none ${theme === "light" ? "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400" : "bg-white/5 border-white/10 text-white placeholder:text-slate-500"}`} disabled={formLoading} />
                  </div>
                  {formError && <p className="text-red-400 text-xs mt-1">{formError}</p>}
                  <button type="submit" disabled={formLoading} className="w-full mt-2 py-3 px-4 rounded-xl font-bold bg-gradient-to-r from-aurora-teal to-aurora-blue text-slate-950 hover:shadow-[0_0_20px_rgba(0,255,209,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer">
                    {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send Message</>}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
        {showCalendarModal && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`absolute inset-0 z-50 flex flex-col ${theme === "light" ? "bg-white" : "bg-slate-950"}`}
          >
            <div className={`flex items-center justify-between p-4 border-b ${theme === "light" ? "border-slate-200" : "border-white/10"}`}>
              <h3 className={`font-bold flex items-center gap-2 ${theme === "light" ? "text-slate-900" : "text-white"}`}>
                <Calendar className="w-4 h-4 text-aurora-teal" /> Book Discovery Call
              </h3>
              <button type="button" onClick={() => setShowCalendarModal(false)} className={`p-1.5 rounded-lg transition-colors cursor-pointer ${theme === "light" ? "hover:bg-slate-100 text-slate-500" : "hover:bg-white/10 text-slate-400"}`}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-grow w-full bg-transparent overflow-hidden overscroll-contain rounded-b-[24px]">
              <CalEmbed theme={theme} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
