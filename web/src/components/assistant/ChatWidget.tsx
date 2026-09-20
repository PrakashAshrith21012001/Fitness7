"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles, X, Send, ArrowUpRight } from "lucide-react";
import { brand, wa } from "@f7/content";
import { Logo } from "@/components/Logo";

type Msg = { role: "user" | "assistant"; content: string; chips?: string[] };

const STORAGE = "f7-chat";
const OPENING: Msg = {
  role: "assistant",
  content: `Hi, I'm the ${brand.name} assistant. Ask me about hours, membership, the free trial, or this month's trek — or tap one below.`,
  chips: ["Opening hours", "Membership prices", "Free trial", "Next trek", "Where are you?", "Talk on WhatsApp"],
};

function load(): Msg[] {
  try {
    const raw = sessionStorage.getItem(STORAGE);
    if (raw) return JSON.parse(raw) as Msg[];
  } catch {
    /* fine */
  }
  return [OPENING];
}

/**
 * The floating assistant. Answers come from /api/chat, which reads the same
 * content file the page does — so nothing it says can disagree with the page.
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([OPENING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [unread, setUnread] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const fab = useRef<HTMLButtonElement>(null);

  useEffect(() => setMessages(load()), []);
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE, JSON.stringify(messages.slice(-30)));
    } catch {
      /* fine */
    }
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    field.current?.focus();
    setUnread(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        fab.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || busy) return;

      if (/^talk on whatsapp$/i.test(q) || /^book a trek slot$/i.test(q)) {
        window.open(wa.general(), "_blank", "noopener");
      }

      const next: Msg[] = [...messages, { role: "user", content: q }];
      setMessages(next);
      setInput("");
      setBusy(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) }),
        });
        const json = (await res.json()) as { reply?: string; chips?: string[]; error?: string };
        const reply = json.reply ?? json.error ?? "Something went wrong — try WhatsApp and we'll sort it there.";
        setMessages((m) => [...m, { role: "assistant", content: reply, chips: json.chips }]);
        if (!open) setUnread(true);
      } catch {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "I can't reach the server right now. WhatsApp will get you a human straight away.", chips: ["Talk on WhatsApp"] },
        ]);
      } finally {
        setBusy(false);
      }
    },
    [messages, busy, open],
  );

  const lastChips = [...messages].reverse().find((m) => m.role === "assistant")?.chips ?? [];

  return (
    <>
      {/* Panel */}
      <div
        role="dialog"
        aria-label={`${brand.name} assistant`}
        aria-hidden={!open}
        className={`fixed inset-x-0 bottom-0 z-50 flex max-h-[85svh] flex-col overflow-hidden rounded-t-3xl border border-line bg-surface shadow-2xl transition-all duration-300 sm:inset-x-auto sm:bottom-24 sm:right-6 sm:h-[600px] sm:max-h-[calc(100svh-8rem)] sm:w-[400px] sm:rounded-3xl ${
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        }`}
      >
        <header className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Logo className="h-8" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{brand.name} assistant</p>
            <p className="truncate text-[11px] text-muted">Hours · membership · trial · treks</p>
          </div>
          <a
            href={wa.general()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1 rounded-full border border-line px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:border-lime hover:text-lime sm:inline-flex"
          >
            WhatsApp <ArrowUpRight className="size-3" strokeWidth={2.4} />
          </a>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            className="grid size-11 place-items-center rounded-full text-muted transition-colors hover:text-white"
          >
            <X className="size-5" strokeWidth={2} />
          </button>
        </header>

        <div ref={list} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <p
                className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "rounded-br-md bg-green text-on-accent"
                    : "rounded-bl-md border border-line bg-ink text-white"
                }`}
              >
                {m.content}
              </p>
            </div>
          ))}
          {busy ? (
            <div className="flex justify-start">
              <span className="inline-flex gap-1 rounded-2xl rounded-bl-md border border-line bg-ink px-4 py-3" aria-label="Typing">
                {[0, 1, 2].map((d) => (
                  <span key={d} className="size-1.5 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${d * 120}ms` }} />
                ))}
              </span>
            </div>
          ) : null}
        </div>

        {lastChips.length ? (
          <div className="flex flex-wrap gap-2 border-t border-line px-4 py-3">
            {lastChips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => send(c)}
                disabled={busy}
                className="min-h-9 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-lime hover:text-lime disabled:opacity-50"
              >
                {c}
              </button>
            ))}
          </div>
        ) : null}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-line p-3"
        >
          <label htmlFor="chat-input" className="sr-only">Your question</label>
          <input
            id="chat-input"
            ref={field}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about the gym…"
            autoComplete="off"
            maxLength={500}
            className="min-h-11 flex-1 rounded-full border border-line bg-ink px-4 text-sm text-white placeholder:text-muted focus:border-lime focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-label="Send"
            className="btn-green grid size-11 place-items-center disabled:opacity-50"
          >
            <Send className="size-4" strokeWidth={2.4} />
          </button>
        </form>
      </div>

      {/* FAB */}
      <button
        ref={fab}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close chat" : `Chat with ${brand.name}`}
        className="btn-green fixed bottom-5 right-5 z-50 grid size-14 place-items-center rounded-full ring-[3px] ring-white/40 sm:bottom-6 sm:right-6"
      >
        {open ? <X className="size-6" strokeWidth={2.2} /> : <Sparkles className="size-6" strokeWidth={2} />}
        {unread && !open ? (
          <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-ink bg-white" aria-hidden="true" />
        ) : null}
      </button>
    </>
  );
}
