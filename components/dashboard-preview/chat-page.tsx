"use client";

import * as React from "react";
import { ImagePlus, Send, Smile } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { usePreview } from "@/components/dashboard-preview/preview-context";

type Msg = {
  id: number;
  author?: string;
  key?: string;
  text?: string;
  me?: boolean;
  image?: boolean;
};

const CHANNELS = [
  { id: "c0", key: "chat.ch1", unread: 0 },
  { id: "c1", key: "chat.ch2", unread: 2 },
  { id: "c2", key: "chat.ch3", unread: 0 },
];

const MEMBERS = [
  { id: "dm0", name: "Sarah M.", color: "#E6550D", online: true },
  { id: "dm1", name: "Tom K.", color: "#1F78B4", online: true },
  { id: "dm2", name: "Lena B.", color: "#31A354", online: false },
  { id: "dm3", name: "Jonas R.", color: "#008080", online: true },
];

function initialMessages(t: (key: string) => string): Record<string, Msg[]> {
  void t;
  return {
    c0: [
      { id: 1, key: "chat.m1", author: "chat.a1" },
      { id: 2, key: "chat.m2", me: true },
    ],
    c1: [{ id: 1, key: "chat.m1", author: "chat.a1" }],
    c2: [],
    dm0: [
      { id: 1, key: "chat.dm1", author: "chat.a1" },
      { id: 2, key: "chat.dm2", me: true },
    ],
    dm1: [],
    dm2: [],
    dm3: [],
  };
}

export function ChatPanel() {
  const { t, v } = usePreview();
  const [mode, setMode] = React.useState<"channels" | "direct">("channels");
  const [active, setActive] = React.useState("c0");
  const [messages, setMessages] = React.useState<Record<string, Msg[]>>(() => initialMessages(t));
  const [input, setInput] = React.useState("");
  const nextId = React.useRef(100);

  const thread = messages[active] ?? [];

  function send() {
    const text = input.trim();
    if (!text) return;
    nextId.current += 1;
    setMessages((m) => ({ ...m, [active]: [...(m[active] ?? []), { id: nextId.current, text, me: true }] }));
    setInput("");
  }

  function attachImage() {
    nextId.current += 1;
    setMessages((m) => ({ ...m, [active]: [...(m[active] ?? []), { id: nextId.current, me: true, image: true }] }));
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between">
        <p className={cn("text-xs font-semibold", v.subtle)}>{t("sections.chatHeader")}</p>
        <div className={cn("flex rounded-full p-0.5", v.input)}>
          {(["channels", "direct"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setMode(k)}
              className={cn(
                "rounded-full px-3 py-1 text-[9px] font-semibold transition-colors",
                mode === k ? v.chipActive : v.muted
              )}
            >
              {t(`sections.${k}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-3">
        {/* Conversation list */}
        <div className="hidden w-36 shrink-0 flex-col gap-1.5 overflow-y-auto sm:flex">
          {mode === "channels"
            ? CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setActive(ch.id)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-2 text-[10px] font-medium transition-colors",
                    active === ch.id ? "bg-teal-brand text-white" : cn("text-left", v.chip)
                  )}
                >
                  # {t(ch.key)}
                  {ch.unread > 0 && (
                    <span className="rounded-full bg-orange-brand px-1.5 py-0.5 text-[8px] font-bold text-white">
                      {ch.unread}
                    </span>
                  )}
                </button>
              ))
            : MEMBERS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActive(m.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-2.5 py-2 text-[10px] font-medium transition-colors",
                    active === m.id ? "bg-teal-brand text-white" : v.chip
                  )}
                >
                  <span className="relative">
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-white"
                      style={{ backgroundColor: m.color }}
                    >
                      {m.name.slice(0, 1)}
                    </span>
                    {m.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-navy-deep bg-green-brand" />
                    )}
                  </span>
                  <span className="truncate">{m.name}</span>
                </button>
              ))}
        </div>

        {/* Conversation */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
            {thread.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  "mb-2 max-w-[85%] px-3 py-2",
                  msg.me
                    ? "self-end rounded-2xl rounded-tr-sm bg-teal-brand text-white"
                    : cn("self-start rounded-2xl rounded-tl-sm", v.input)
                )}
              >
                {!msg.me && msg.author && (
                  <p className="text-[8px] font-bold text-teal-300">{t(msg.author)}</p>
                )}
                {msg.image ? (
                  <div className="flex h-24 w-40 flex-col items-center justify-center gap-1 rounded-xl bg-linear-to-br from-blue-brand to-teal-brand text-2xl">
                    🖼️
                    <span className="text-[8px] font-semibold text-white/80">image.jpg</span>
                  </div>
                ) : (
                  <p className="text-[10px] leading-snug">
                    {msg.key ? t(msg.key) : msg.text}
                  </p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Composer */}
          <div className={cn("flex items-center gap-1.5 rounded-full px-2 py-1.5", v.input)}>
            <button
              type="button"
              title={t("sections.emoji")}
              onClick={() => setInput((s) => `${s} 😊`)}
              className={cn("shrink-0 p-1 transition-transform hover:scale-110", v.muted)}
            >
              <Smile className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              title={t("sections.attach")}
              onClick={attachImage}
              className={cn("shrink-0 p-1 transition-transform hover:scale-110", v.muted)}
            >
              <ImagePlus className="h-3.5 w-3.5" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={t("sections.messagePlaceholder")}
              className="w-full bg-transparent text-[10.5px] outline-none"
            />
            <button
              type="button"
              title={t("chat.send")}
              onClick={send}
              disabled={!input.trim()}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-brand text-white transition-transform hover:scale-110 disabled:opacity-50"
            >
              <Send className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile conv switch note */}
      {mode === "direct" && (
        <p className={cn("mt-2 text-center text-[8px] sm:hidden", v.faint)}>
          {MEMBERS.find((m) => m.id === active)?.name}
        </p>
      )}
    </div>
  );
}
