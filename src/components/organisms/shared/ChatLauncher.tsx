"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import styles from "./ChatLauncher.module.css";

type ChatMessage = {
  id: string;
  role: "bot" | "user";
  text: string;
};

const INITIAL_GREETING: ChatMessage = {
  id: "greet-1",
  role: "bot",
  text:
    "Hi! I'm the Romega Solutions assistant. Ask about our services, talent, careers, or how to reach our team.",
};

const INITIAL_SUGGESTIONS = [
  "What services do you offer?",
  "How can I apply for a role?",
  "How do I contact your team?",
];

function makeId() {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function ChatIcon() {
  return (
    <svg
      className={styles.launcherIcon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M21 12a8 8 0 0 1-11.7 7.1L4 20l1-4.5A8 8 0 1 1 21 12Z" />
      <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

const WORD_STAGGER_S = 0.025;
const WORD_DURATION_S = 0.14;

type WordRevealProps = {
  text: string;
  animate: boolean;
  onTick?: () => void;
  onDone?: () => void;
};

function WordReveal({ text, animate, onTick, onDone }: WordRevealProps) {
  const tokens = useMemo(() => text.split(/(\s+)/), [text]);
  const { lastWordIdx, orderByIndex } = useMemo(() => {
    const order = new Map<number, number>();
    let last = -1;
    let count = 0;
    tokens.forEach((tok, i) => {
      if (tok.trim().length > 0) {
        order.set(i, count++);
        last = i;
      }
    });
    return { lastWordIdx: last, orderByIndex: order };
  }, [tokens]);

  // Throttle onTick to one call per animation frame across all word animations
  const tickPendingRef = useRef(false);
  const handleTick = useCallback(() => {
    if (!onTick || tickPendingRef.current) return;
    tickPendingRef.current = true;
    requestAnimationFrame(() => {
      tickPendingRef.current = false;
      onTick();
    });
  }, [onTick]);

  if (!animate) {
    return <>{text}</>;
  }

  return (
    <>
      {tokens.map((token, i) => {
        if (!token.trim()) return <Fragment key={i}>{token}</Fragment>;
        const order = orderByIndex.get(i) ?? 0;
        return (
          <motion.span
            key={i}
            style={{ display: "inline-block", willChange: "transform, opacity" }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: WORD_DURATION_S,
              delay: order * WORD_STAGGER_S,
              ease: "easeOut",
            }}
            onUpdate={handleTick}
            onAnimationComplete={() => {
              if (i === lastWordIdx) onDone?.();
            }}
          >
            {token}
          </motion.span>
        );
      })}
    </>
  );
}

function SendIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
    </svg>
  );
}

export function ChatLauncher() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [suggestions, setSuggestions] = useState<string[]>(INITIAL_SUGGESTIONS);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animatingBotId, setAnimatingBotId] = useState<string | null>(null);

  const panelId = useId();
  const titleId = useId();
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const reduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  // Track viewport size so aria-modal reflects the modal-on-mobile UX
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const pinScrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    pinScrollToBottom();
  }, [messages, isSending, pinScrollToBottom]);

  // Focus input when opening; restore focus to launcher when closing
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
    // Only return focus to the launcher if we're actually closing (not on mount)
    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      launcherRef.current?.focus();
    }
  }, [open]);

  // Esc to close + Tab focus trap inside the panel
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !panel.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const sendMessage = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed || isSending) return;

      setError(null);
      setSuggestions([]);
      const userMsg: ChatMessage = { id: makeId(), role: "user", text: trimmed };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsSending(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed }),
        });

        if (!res.ok) {
          const errMsg =
            res.status === 429
              ? "You're sending messages a bit quickly — please wait a moment."
              : res.status >= 500
                ? "Our assistant is briefly unavailable. Please try again."
                : "I couldn't process that message. Please try again.";
          setError(errMsg);
          const botId = makeId();
          setMessages((prev) => [
            ...prev,
            { id: botId, role: "bot", text: errMsg },
          ]);
          setAnimatingBotId(reduceMotion ? null : botId);
          setSuggestions(INITIAL_SUGGESTIONS);
          return;
        }

        const data = (await res.json()) as {
          reply?: { text?: string; suggestions?: string[] };
        };

        const text =
          data.reply?.text ??
          "Sorry, I couldn't generate a response. Please try again or reach us via /contact.";

        const botId = makeId();
        setMessages((prev) => [...prev, { id: botId, role: "bot", text }]);
        setAnimatingBotId(reduceMotion ? null : botId);
        if (Array.isArray(data.reply?.suggestions)) {
          setSuggestions(data.reply.suggestions);
        }
      } catch {
        setError("Network hiccup — please try again.");
        const botId = makeId();
        setMessages((prev) => [
          ...prev,
          {
            id: botId,
            role: "bot",
            text: "I had trouble reaching the server. Please try again in a moment.",
          },
        ]);
        setAnimatingBotId(reduceMotion ? null : botId);
        setSuggestions(INITIAL_SUGGESTIONS);
      } finally {
        setIsSending(false);
      }
    },
    [isSending, reduceMotion],
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  const launcherTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 380, damping: 30 };

  return (
    <div className={styles.launcherShell}>
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              key="backdrop"
              type="button"
              aria-label="Close chat"
              className={styles.panelBackdrop}
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.18 }}
            />
            <motion.div
              key="panel"
              ref={panelRef}
              id={panelId}
              role="dialog"
              aria-modal={isMobile ? "true" : "false"}
              aria-labelledby={titleId}
              className={styles.panel}
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={launcherTransition}
            >
              <header className={styles.panelHeader}>
                <span className={styles.headerAvatar} aria-hidden="true">
                  <ChatIcon />
                </span>
                <span className={styles.headerTextGroup}>
                  <span id={titleId} className={styles.headerTitle}>
                    Romega Assistant
                  </span>
                  <span className={styles.headerSubtitle}>Online · typically replies in seconds</span>
                </span>
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                >
                  <CloseIcon />
                </button>
              </header>

              <div
                ref={scrollRef}
                className={styles.messages}
                role="log"
                aria-live="polite"
                aria-label="Chat messages"
              >
                {messages.map((m) => {
                  const shouldAnimate =
                    m.role === "bot" && m.id === animatingBotId;
                  return (
                    <div
                      key={m.id}
                      className={`${styles.messageRow} ${
                        m.role === "user" ? styles.messageRowUser : ""
                      }`}
                    >
                      <div
                        className={`${styles.bubble} ${
                          m.role === "user" ? styles.bubbleUser : styles.bubbleBot
                        }`}
                      >
                        <WordReveal
                          text={m.text}
                          animate={shouldAnimate}
                          onTick={shouldAnimate ? pinScrollToBottom : undefined}
                          onDone={
                            shouldAnimate
                              ? () => setAnimatingBotId(null)
                              : undefined
                          }
                        />
                      </div>
                    </div>
                  );
                })}
                {isSending && (
                  <div className={styles.messageRow}>
                    <div className={styles.typing} aria-label="Assistant is typing">
                      <span className={styles.typingDot} />
                      <span className={styles.typingDot} />
                      <span className={styles.typingDot} />
                    </div>
                  </div>
                )}
              </div>

              {suggestions.length > 0 && !isSending && (
                <div className={styles.suggestions}>
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={styles.suggestionChip}
                      onClick={() => void sendMessage(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <form className={styles.composer} onSubmit={handleSubmit}>
                <label htmlFor={`${panelId}-input`} className="sr-only">
                  Type your message
                </label>
                <textarea
                  id={`${panelId}-input`}
                  ref={inputRef}
                  className={styles.composerInput}
                  placeholder="Ask about services, talent, careers…"
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={1000}
                  disabled={isSending}
                />
                <button
                  type="submit"
                  className={styles.sendButton}
                  aria-label="Send message"
                  disabled={isSending || input.trim().length === 0}
                >
                  <SendIcon />
                </button>
              </form>

              <p className={styles.footerNote}>
                {error
                  ? error
                  : "Quick replies from the Romega assistant. For complex inquiries, visit /contact."}
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.button
        ref={launcherRef}
        type="button"
        className={styles.launcherButton}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat with Romega assistant"}
        aria-expanded={open}
        aria-controls={panelId}
        whileTap={reduceMotion ? undefined : { scale: 0.94 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ opacity: 0, rotate: -45 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 45 }}
              transition={{ duration: reduceMotion ? 0 : 0.16 }}
              className={styles.launcherIcon}
              style={{ display: "inline-flex" }}
            >
              <CloseIcon />
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ opacity: 0, rotate: 30 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -30 }}
              transition={{ duration: reduceMotion ? 0 : 0.16 }}
              className={styles.launcherIcon}
              style={{ display: "inline-flex" }}
            >
              <ChatIcon />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && <span className={styles.statusDot} aria-hidden="true" />}
      </motion.button>
    </div>
  );
}

export default ChatLauncher;
