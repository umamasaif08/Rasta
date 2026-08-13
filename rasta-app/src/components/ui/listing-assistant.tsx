"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createNotification } from "@/lib/notifications";
import type { Resource } from "@/types";
import type { ChatMessage, ChatResponse } from "@/app/api/ai-chat/route";

interface ListingAssistantProps {
  resource: Resource;
  onNotesUpdated: (notes: string) => void;
}

export default function ListingAssistant({ resource, onNotesUpdated }: ListingAssistantProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (open && !done) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, done]);

  async function startChat() {
    setOpen(true);
    setMessages([]);
    setDone(false);
    setError(null);
    setLoading(true);

    // Send initial greeting with context
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "user", content: "Hi! I'd like help improving my listing." },
          ],
          resourceData: {
            name: resource.name,
            description: resource.description,
            address: resource.address,
            phone: resource.phone,
            hours: resource.hours,
            languages: resource.languages,
          },
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to start chat");
      }

      const data: ChatResponse = await res.json();

      setMessages([
        { role: "user", content: "Hi! I'd like help improving my listing." },
        { role: "assistant", content: data.message },
      ]);

      if (data.done && data.summary) {
        await saveSummary(data.summary);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start chat");
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          resourceData: {
            name: resource.name,
            description: resource.description,
            address: resource.address,
            phone: resource.phone,
            hours: resource.hours,
            languages: resource.languages,
          },
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Request failed");
      }

      const data: ChatResponse = await res.json();

      setMessages([...updatedMessages, { role: "assistant", content: data.message }]);

      if (data.done && data.summary) {
        setDone(true);
        await saveSummary(data.summary);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  async function saveSummary(summary: string) {
    if (!resource.id) return;
    
    setSaving(true);
    try {
      await updateDoc(doc(db, "resources", resource.id), {
        aiReviewNotes: summary,
      });
      onNotesUpdated(summary);

      // Create notification for the org
      if (resource.createdBy) {
        try {
          await createNotification(
            resource.createdBy,
            "Your AI review is ready! Check your dashboard to see suggestions for improving your listing.",
            "ai_review_ready"
          );
        } catch (error) {
          console.error("[ListingAssistant] Failed to create notification:", error);
          // Don't throw - summary was saved successfully
        }
      }
    } catch (err) {
      console.error("Failed to save summary:", err);
      setError("Summary generated but couldn't save to database. Please try refreshing.");
    } finally {
      setSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Trigger button */}
      <Button
        onClick={startChat}
        variant="outline"
        className="gap-2 border-[var(--color-teal)] text-[var(--color-teal)] hover:bg-[var(--color-teal-light)]"
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
        Chat with our assistant to strengthen your listing
      </Button>

      {/* Chat modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[var(--color-surface)] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[600px]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-teal-light)]">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-[var(--color-teal)]" aria-hidden />
                  <h2 className="font-semibold text-[var(--color-ink)]">
                    Listing Assistant
                  </h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.role === "user"
                          ? "bg-[var(--color-teal)] text-white"
                          : "bg-[var(--color-surface-2)] text-[var(--color-ink)]"
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-[var(--color-surface-2)] rounded-2xl px-4 py-3 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-[var(--color-teal)]" aria-hidden />
                      <span className="text-xs text-[var(--color-ink-muted)]">Typing...</span>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <div className="bg-[var(--color-terracotta-light)] border border-[var(--color-terracotta)] text-[var(--color-terracotta)] rounded-lg px-3 py-2 text-sm">
                    {error}
                  </div>
                )}

                {done && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[var(--color-teal-light)] border border-[var(--color-teal)] rounded-lg p-4 text-center"
                  >
                    <CheckCircle2 className="h-8 w-8 text-[var(--color-teal)] mx-auto mb-2" aria-hidden />
                    <p className="text-sm text-[var(--color-ink)] font-medium">
                      {saving ? "Saving notes..." : "Notes saved to your listing!"}
                    </p>
                    <p className="text-xs text-[var(--color-ink-muted)] mt-1">
                      You can view them anytime in your dashboard.
                    </p>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {!done && (
                <div className="p-4 border-t border-[var(--color-teal-light)]">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your response..."
                      disabled={loading}
                      className="flex-1 h-10 rounded-full border border-[var(--color-teal-light)] bg-[var(--color-surface)] px-4 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-teal)] disabled:opacity-50"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={loading || !input.trim()}
                      aria-label="Send message"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-teal)] text-white hover:bg-[var(--color-teal-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
