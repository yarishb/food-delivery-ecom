import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useEffect, useRef, useState } from "react"

// ── Nav icon ──────────────────────────────────────────────────────────────────
const SparklesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="20"
    height="20"
  >
    <path
      fillRule="evenodd"
      d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a3.375 3.375 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a3.375 3.375 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5z"
      clipRule="evenodd"
    />
  </svg>
)

// ── Types ─────────────────────────────────────────────────────────────────────
type Role = "user" | "assistant"

type Message = {
  id: string
  role: Role
  content: string
  timestamp: Date
  error?: boolean
}

// ── Suggested prompts ─────────────────────────────────────────────────────────
const SUGGESTIONS = [
  "Скільки активних замовлень сьогодні?",
  "Які страви найпопулярніші цього тижня?",
  "Як створити нову знижку для клієнтів?",
  "Покажи статус раціонних планів",
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(date: Date) {
  return date.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })
}

function uid() {
  return Math.random().toString(36).slice(2)
}

function parseContent(text: string) {
  return text.split("\n").map((line, i) => (
    <span key={i}>
      {line}
      {i < text.split("\n").length - 1 && <br />}
    </span>
  ))
}

// ── Typing indicator ──────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-ui-fg-muted animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user"

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} items-end`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
          isUser
            ? "bg-ui-button-inverted text-ui-fg-on-inverted"
            : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
        }`}
      >
        {isUser ? "Ви" : "AI"}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[72%] group relative ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}
      >
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isUser
              ? "bg-ui-button-inverted text-ui-fg-on-inverted rounded-br-sm"
              : msg.error
                ? "bg-red-50 text-red-700 border border-red-200 rounded-bl-sm"
                : "bg-ui-bg-base text-ui-fg-base border border-ui-border-base rounded-bl-sm"
          }`}
        >
          {parseContent(msg.content)}
        </div>
        <span className="text-[11px] text-ui-fg-muted px-1">
          {formatTime(msg.timestamp)}
        </span>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
const AiChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(),
      role: "assistant",
      content:
        "Привіт! Я AI-асистент Green Balance 🌿\n\nЯ допоможу вам керувати меню, замовленнями та клієнтами. Запитайте мене про будь-що!",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: Message = {
      id: uid(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    }

    const history = messages
      .filter((m) => !m.error)
      .map((m) => ({ role: m.role, content: m.content }))

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/admin/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: trimmed, history }),
      })

      const data = await res.json()

      const aiMsg: Message = {
        id: uid(),
        role: "assistant",
        content: res.ok
          ? data.reply
          : data.error ?? "Сталася невідома помилка.",
        timestamp: new Date(),
        error: !res.ok,
      }

      setMessages((prev) => [...prev, aiMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          content: "Не вдалося зв'язатись із сервером. Перевірте підключення.",
          timestamp: new Date(),
          error: true,
        },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  const isEmpty = messages.length === 1

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-ui-bg-subtle">
      {/* ── Header ── */}
      <div className="flex-shrink-0 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <SparklesIcon />
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg leading-tight">
              AI-Асистент
            </h1>
            <p className="text-emerald-100 text-xs">Green Balance · Завжди онлайн</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span className="text-emerald-100 text-xs">Активний</span>
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {/* Suggested prompts — shown only when chat is fresh */}
        {isEmpty && (
          <div className="flex flex-col items-center gap-4 mt-4 mb-2">
            <p className="text-sm text-ui-fg-muted font-medium">
              Спробуйте запитати:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="px-3 py-2 text-xs rounded-xl bg-ui-bg-base border border-ui-border-base text-ui-fg-subtle hover:bg-ui-bg-base-hover hover:text-ui-fg-base hover:border-emerald-400 transition-all shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {loading && (
          <div className="flex items-end gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0">
              AI
            </div>
            <div className="bg-ui-bg-base border border-ui-border-base rounded-2xl rounded-bl-sm shadow-sm">
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div className="flex-shrink-0 bg-ui-bg-base border-t border-ui-border-base px-4 py-3">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                e.target.style.height = "auto"
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`
              }}
              onKeyDown={handleKeyDown}
              placeholder="Напишіть повідомлення… (Enter — надіслати, Shift+Enter — новий рядок)"
              rows={1}
              disabled={loading}
              className="w-full resize-none rounded-xl border border-ui-border-base bg-ui-bg-field px-4 py-3 text-sm text-ui-fg-base placeholder-ui-fg-muted focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 transition-all leading-relaxed"
              style={{ minHeight: "44px", maxHeight: "120px" }}
            />
          </div>

          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm hover:from-emerald-600 hover:to-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            title="Надіслати"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 rotate-90"
            >
              <path d="M3.105 2.288a.75.75 0 00-.826.95l1.414 4.926A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.897 28.897 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.288z" />
            </svg>
          </button>
        </div>

        <p className="text-center text-[11px] text-ui-fg-muted mt-2">
          AI може помилятися. Перевіряйте важливу інформацію.
        </p>
      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "AI-Асистент",
  icon: SparklesIcon,
})

export default AiChatPage
