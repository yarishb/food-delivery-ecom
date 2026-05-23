import { defineRouteConfig } from "@medusajs/admin-sdk";
import { useEffect, useRef, useState, useCallback } from "react";

import { formatRelativeDate, formatTime, generateUid } from "./utils/index";
import { ArrowRightIcon, SparklesIcon, TrashIcon } from "./components/index";
import { AI_SERVICE, SUGGESTIONS } from "./constants";

import { Message, Role, SessionSummary } from "./types";
import { parseMedusaMarkdown } from "./hooks";

const AiChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateUid(),
      role: "assistant",
      content:
        "Вітаю. Я ваш ШІ-асистент. Допоможу сформувати індивідуальні плани харчування, перевірити залишки страв на складі або скоригувати ціни в каталозі.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");

  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`${AI_SERVICE}/ai/sessions`);
      const data = await res.json();
      setSessions(data.sessions ?? []);
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    let savedSession = sessionStorage.getItem("medusa_ai_session");
    if (!savedSession) {
      savedSession = `session_${generateUid()}`;
      sessionStorage.setItem("medusa_ai_session", savedSession);
    }
    setSessionId(savedSession);
    setActiveSessionId(savedSession);
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startNewDialogue = () => {
    const newSession = `session_${generateUid()}`;
    sessionStorage.setItem("medusa_ai_session", newSession);
    setSessionId(newSession);
    setActiveSessionId(newSession);
    setMessages([
      {
        id: generateUid(),
        role: "assistant",
        content: "Попередній діалог закрито. Я готовий до нових розпоряджень.",
        timestamp: new Date(),
      },
    ]);
  };

  const loadSession = async (sid: string) => {
    try {
      const res = await fetch(`${AI_SERVICE}/ai/sessions/${sid}/messages`);
      const data = await res.json();
      const loaded: Message[] = (data.messages ?? []).map((m: any) => ({
        id: generateUid(),
        role: m.role as Role,
        content: m.content,
        timestamp: new Date(m.created_at),
      }));
      setMessages(
        loaded.length
          ? loaded
          : [
              {
                id: generateUid(),
                role: "assistant",
                content: "Цей діалог порожній.",
                timestamp: new Date(),
              },
            ],
      );
      setSessionId(sid);
      setActiveSessionId(sid);
      sessionStorage.setItem("medusa_ai_session", sid);
    } catch {
      // ignore
    }
  };

  const deleteSession = async (e: React.MouseEvent, sid: string) => {
    e.stopPropagation();
    try {
      await fetch(`${AI_SERVICE}/ai/sessions/${sid}`, { method: "DELETE" });
      setSessions((prev) => prev.filter((s) => s.id !== sid));
      if (sid === activeSessionId) startNewDialogue();
    } catch {
      // ignore
    }
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [
      ...prev,
      {
        id: generateUid(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      },
    ]);
    setInput("");
    setLoading(true);

    const assistantId = generateUid();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        streaming: true,
      },
    ]);

    try {
      const res = await fetch(`${AI_SERVICE}/ai/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, sessionId }),
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6);
          if (raw === "[DONE]") break;

          try {
            const event = JSON.parse(raw);
            if (event.token) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + event.token }
                    : m,
                ),
              );
            }
            if (event.error) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: `Помилка: ${event.error}`, error: true }
                    : m,
                ),
              );
            }
          } catch {
            // malformed SSE chunk
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, streaming: false } : m,
        ),
      );
      fetchSessions();
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: "Помилка зв'язку з сервером автоматизації.",
                error: true,
                streaming: false,
              }
            : m,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="-mx-6 -my-6 flex h-[calc(100vh-56px)] w-[calc(100%+48px)] bg-ui-bg-subtle font-sans overflow-hidden antialiased">
      {/* ── Clean & Natural Sidebar ── */}
      <aside className="w-68 flex-shrink-0 bg-ui-bg-base border-r border-ui-border-base flex flex-col overflow-hidden hidden lg:flex">
        <div className="p-4 border-b border-ui-border-base flex items-center justify-between">
          <span className="text-xs font-semibold text-ui-fg-muted tracking-tight">
            Історія діалогів
          </span>
          <button
            onClick={startNewDialogue}
            className="text-xs font-medium text-ui-fg-base border border-ui-border-base bg-ui-bg-base px-2.5 py-1.5 rounded-lg shadow-sm hover:bg-ui-bg-subtle transition-all active:scale-95 flex items-center gap-1.5"
          >
            <SparklesIcon className="w-3.5 h-3.5 text-ui-fg-subtle" />
            Новий чат
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-none">
          {sessions.length === 0 ? (
            <div className="text-xs text-ui-fg-muted py-8 text-center px-4">
              Немає збережених діалогів
            </div>
          ) : (
            sessions.map((s) => {
              const isActive = s.id === activeSessionId;
              return (
                <button
                  key={s.id}
                  onClick={() => loadSession(s.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg group transition-all flex items-center justify-between gap-3 ${
                    isActive
                      ? "bg-ui-bg-subtle shadow-inner"
                      : "hover:bg-ui-bg-subtle/50"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs ${isActive ? "font-semibold text-ui-fg-base" : "text-ui-fg-subtle font-medium"} truncate`}
                    >
                      {s.title}
                    </p>
                    <p className="text-[10px] text-ui-fg-muted mt-0.5">
                      {formatRelativeDate(s.updated_at)}
                      {s.message_count > 0 && ` · ${s.message_count} повід.`}
                    </p>
                  </div>
                  <span
                    onClick={(e) => deleteSession(e, s.id)}
                    className="flex-shrink-0 text-ui-fg-muted opacity-0 group-hover:opacity-100 hover:text-ui-fg-error p-1 hover:bg-ui-bg-component rounded-md transition-all"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ── Main Workspace ── */}
      <main className="flex flex-1 flex-col h-full overflow-hidden bg-ui-bg-base">
        {/* Simple Top Header */}
        <div className="flex-shrink-0 border-b border-ui-border-base px-6 py-3.5 flex items-center justify-between bg-ui-bg-base">
          <div className="flex items-center gap-2.5">
            <SparklesIcon className="w-4 h-4 text-ui-fg-subtle" />
            <span className="text-sm font-medium text-ui-fg-base">
              Асистент магазину
            </span>
          </div>
          <button
            onClick={startNewDialogue}
            className="lg:hidden text-xs font-medium text-ui-fg-muted border border-ui-border-base bg-ui-bg-base px-3 py-1.5 rounded-lg"
          >
            Новий чат
          </button>
        </div>

        {/* Chat Stream Viewport */}
        <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8 scrollbar-thin">
          <div className="max-w-3xl mx-auto space-y-8 h-full flex flex-col justify-between">
            <div className="space-y-8 flex-1">
              {/* Minimalist Suggestions View */}
              {messages.length === 1 && (
                <div className="space-y-6 pt-12 flex flex-col justify-center items-center h-full max-w-xl mx-auto animate-fade-in">
                  <div className="text-center space-y-1.5">
                    <h1 className="text-lg font-semibold text-ui-fg-base tracking-tight">
                      Чим я можу допомогти?
                    </h1>
                    <p className="text-xs text-ui-fg-muted leading-relaxed">
                      Я готовий допомогти з каталогом товарів, аналітикою
                      складів або налаштуванням планів. Оберіть готовий запит:
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="p-3.5 text-xs text-left rounded-xl bg-ui-bg-base border border-ui-border-base text-ui-fg-subtle hover:border-ui-border-strong hover:text-ui-fg-base hover:bg-ui-bg-subtle/30 transition-all font-medium flex items-center justify-between group"
                      >
                        <span className="line-clamp-2 pr-2">{s}</span>
                        <ArrowRightIcon className="w-3.5 h-3.5 text-ui-fg-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Feed Messages */}
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                const isEmpty = msg.streaming && !msg.content;

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
                  >
                    {/* Natural Avatar */}
                    {!isUser && (
                      <div className="w-7 h-7 rounded-lg bg-ui-bg-subtle border border-ui-border-base flex items-center justify-center flex-shrink-0 mt-0.5">
                        <SparklesIcon className="w-3.5 h-3.5 text-ui-fg-subtle" />
                      </div>
                    )}

                    <div
                      className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[78%] ${isUser ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`text-sm leading-relaxed ${
                          isUser
                            ? /* Натуральний, ненав'язливий блок для повідомлень користувача */
                              "px-4 py-2.5 bg-ui-bg-component border border-ui-border-base text-ui-fg-base rounded-2xl rounded-tr-none shadow-xs font-medium"
                            : msg.error
                              ? "px-4 py-2.5 bg-ui-bg-error border border-ui-border-error text-ui-fg-error rounded-2xl rounded-tl-none"
                              : /* Абсолютно чистий текст для відповідей ШІ (без рамок і фону) */
                                "bg-transparent border-none text-ui-fg-base py-1 px-0"
                        }`}
                      >
                        {isEmpty ? (
                          <div className="flex items-center gap-1 py-1.5 px-0">
                            <span
                              className="w-1.5 h-1.5 bg-ui-fg-muted rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            />
                            <span
                              className="w-1.5 h-1.5 bg-ui-fg-muted rounded-full animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            />
                            <span
                              className="w-1.5 h-1.5 bg-ui-fg-muted rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            />
                          </div>
                        ) : (
                          <div className="prose prose-sm max-w-none break-words">
                            {parseMedusaMarkdown(msg.content)}
                          </div>
                        )}
                      </div>

                      <span className="text-[9px] text-ui-fg-muted px-1 opacity-60">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div ref={bottomRef} className="h-2" />
          </div>
        </div>

        {/* ── Natural Minimalist Input Area ── */}
        <div className="flex-shrink-0 p-4 md:p-6 bg-ui-bg-base border-t border-ui-border-base">
          <div className="max-w-3xl mx-auto relative flex items-center bg-ui-bg-field border border-ui-border-base rounded-xl focus-within:border-ui-border-strong focus-within:ring-1 focus-within:ring-ui-border-strong transition-all shadow-xs px-3.5 py-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                !e.shiftKey &&
                (e.preventDefault(), send(input))
              }
              placeholder="Напишіть команду асинтенту..."
              rows={1}
              disabled={loading}
              className="w-full bg-transparent py-1.5 pr-12 text-sm text-ui-fg-base placeholder-ui-fg-muted focus:outline-none resize-none leading-relaxed max-h-28 scrollbar-none"
              style={{ minHeight: "24px" }}
            />

            <div className="absolute right-2.5 bottom-2.5">
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-lg bg-ui-button-inverted text-ui-fg-on-inverted shadow-sm hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center"
              >
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export const config = defineRouteConfig({
  label: "AI-Асистент",
  icon: SparklesIcon,
});

export default AiChatPage;
