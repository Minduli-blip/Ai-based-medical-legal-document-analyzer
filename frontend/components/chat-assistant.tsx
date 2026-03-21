"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Bot, User } from "lucide-react"

const initialMessages = [
  {
    role: "user" as const,
    content: "Explain the liability clause simply",
  },
  {
    role: "assistant" as const,
    content:
      "The liability clause says that the Licensor (the company giving the license) won't be responsible for any indirect damages \u2014 like lost profits or business interruptions \u2014 no matter what causes the issue. Essentially, if something goes wrong, they'll only cover direct damages, not the ripple effects.",
  },
]

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState("")

  function handleSend() {
    if (!input.trim()) return
    const userMsg = { role: "user" as const, content: input.trim() }
    setMessages((prev) => [
      ...prev,
      userMsg,
      {
        role: "assistant" as const,
        content:
          "I've analyzed the clause you mentioned. This is a standard contractual provision, but I'd recommend having your legal team review the specific terms to ensure they align with your risk tolerance.",
      },
    ])
    setInput("")
  }

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform"
          aria-label="Open chat assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-h-[520px] flex flex-col rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold text-sm">Legal AI Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-[hsl(0,0%,100%)]/20 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 max-h-[360px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex items-start justify-center w-7 h-7 rounded-full bg-primary/10 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-primary mt-1.5" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="flex items-start justify-center w-7 h-7 rounded-full bg-secondary shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-muted-foreground mt-1.5" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your document..."
              className="text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend()
              }}
            />
            <Button size="icon" onClick={handleSend} aria-label="Send message">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
