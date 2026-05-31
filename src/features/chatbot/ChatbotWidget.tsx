import { useEffect, useRef, useState } from "react";
import { MessageCircle, Minimize2, Send, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { createInitialMessage, generateResponse } from "./engine";
import type { ChatMessage } from "@/types";

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1">
      <span className="h-2 w-2 rounded-full bg-navy-300 animate-pulse-dot" style={{ animationDelay: "0ms" }} />
      <span className="h-2 w-2 rounded-full bg-navy-300 animate-pulse-dot" style={{ animationDelay: "200ms" }} />
      <span className="h-2 w-2 rounded-full bg-navy-300 animate-pulse-dot" style={{ animationDelay: "400ms" }} />
    </div>
  );
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createInitialMessage()]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  useEffect(() => {
    if (open && !minimized) inputRef.current?.focus();
  }, [open, minimized]);

  const send = async (payload: string, displayLabel?: string) => {
    const text = payload.trim();
    if (!text) return;
    const userMsg: ChatMessage = {
      id: `m-${Date.now()}-u`,
      role: "user",
      content: displayLabel ?? text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 400));
    const response = generateResponse(text);
    const botMsg: ChatMessage = {
      id: `m-${Date.now()}-b`,
      role: "bot",
      content: response.text,
      quickReplies: response.quickReplies,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, botMsg]);
    setTyping(false);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const lastBot = [...messages].reverse().find((m) => m.role === "bot");

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {open ? (
        <div
          className={cn(
            "rounded-2xl bg-white shadow-elevated border border-navy-100 flex flex-col overflow-hidden animate-slide-up",
            minimized
              ? "w-72 h-14"
              : "w-[22rem] max-w-[calc(100vw-2rem)] h-[32rem] max-h-[calc(100vh-2rem)]"
          )}
        >
          <div className="flex items-center justify-between bg-gradient-to-r from-primary to-navy-800 text-white px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-accent inline-flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">Assistant AFG</p>
                <p className="text-[10px] text-white/70 leading-tight">Assistance à l'inscription</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMinimized((m) => !m)}
                className="rounded p-1 hover:bg-white/10"
                aria-label="Réduire"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => { setOpen(false); setMinimized(false); }}
                className="rounded p-1 hover:bg-white/10"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-3 space-y-3 bg-navy-50/50"
              >
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line",
                        m.role === "user"
                          ? "bg-primary text-white rounded-br-md"
                          : "bg-white border border-navy-100 text-navy-900 rounded-bl-md"
                      )}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl px-3 py-2 bg-white border border-navy-100 rounded-bl-md">
                      <TypingIndicator />
                    </div>
                  </div>
                )}
                {!typing && lastBot?.quickReplies && (
                  <div className="flex flex-wrap gap-1.5 pl-1">
                    {lastBot.quickReplies.map((q) => (
                      <button
                        key={q.payload}
                        type="button"
                        onClick={() => send(q.payload, q.label)}
                        className="text-xs rounded-full border border-navy-200 bg-white px-2.5 py-1 hover:border-accent hover:bg-accent/5 transition-colors"
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <form
                onSubmit={onSubmit}
                className="border-t border-navy-100 bg-white px-3 py-2 flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Posez votre question..."
                  className="flex-1 h-9 rounded-lg border border-navy-200 px-3 text-sm focus:border-accent focus:ring-1 focus:ring-accent"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || typing}
                  className="h-9 w-9 rounded-lg bg-accent text-white inline-flex items-center justify-center hover:bg-accent-dark disabled:opacity-50"
                  aria-label="Envoyer"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "group relative h-14 w-14 rounded-full bg-accent text-white shadow-elevated",
            "flex items-center justify-center hover:bg-accent-dark transition-colors"
          )}
          aria-label="Ouvrir l'assistant"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-success ring-2 ring-white" />
          <span className="absolute right-full mr-3 whitespace-nowrap rounded-lg bg-navy-900 px-3 py-1.5 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Besoin d'aide ?
          </span>
        </button>
      )}
    </div>
  );
}
