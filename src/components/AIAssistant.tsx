import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { Send, Sparkles, X } from 'lucide-react'
import type { ChatMessage } from '../types/flashCinema'
import { EASE } from '../lib/motion'
import { cx } from '../lib/ui'

/* ------------------------------------------------------------ canned AI -- */

interface CannedReply {
  keywords: string[]
  text: string
  suggestions: string[]
}

const REPLIES: CannedReply[] = [
  {
    keywords: ['price', 'cost', 'much', 'budget', 'rate'],
    text: 'Productions start at $1,200 for social reels and run to $6,500 for full commercial shoots. Every quote is fixed on the first call — no change orders, ever. The package builder on this page gives you a live number in about 30 seconds.',
    suggestions: ['What does a wedding film cost?', 'How fast is delivery?', 'Do you travel outside California?'],
  },
  {
    keywords: ['wedding', 'engagement', 'bride', 'married'],
    text: 'Our cinematic wedding films start at $4,500 for 8 hours with three cinema operators, FPV drone coverage and a 15-minute film plus a 60-second teaser delivered within 48 hours. Napa, Malibu, the Hamptons — we cover them all.',
    suggestions: ['Which dates are open?', 'What gear do you shoot on?', 'How fast is delivery?'],
  },
  {
    keywords: ['commercial', 'brand', 'music', 'advert', 'ad'],
    text: 'Commercial and music video productions run on RED 8K cinema bodies with Cooke anamorphic glass, a director-led lighting crew and full DaVinci Resolve grading. Base package is $6,500 for a 10-hour day with broadcast and social cutdowns included.',
    suggestions: ['What does pre-production look like?', 'Which dates are open?', 'What does it cost?'],
  },
  {
    keywords: ['drone', 'aerial', 'fpv', 'fly'],
    text: 'We fly FAA-licensed FPV and heavy-lift drones — the DJI Inspire 3 shoots full-frame 8K ProRes RAW. Aerial coverage adds $450 to any package and pairs beautifully with estate and coastal shoots.',
    suggestions: ['What does a wedding film cost?', 'Do you travel outside California?', 'Which dates are open?'],
  },
  {
    keywords: ['available', 'availability', 'date', 'open', 'when', 'book', 'schedule'],
    text: 'Q3 2026 is nearly locked — three Los Angeles dates remain, with more room in New York and Miami. The booking engine above shows live slots in your timezone, and a 25% deposit holds any date for 14 days.',
    suggestions: ['What does it cost?', 'How fast is delivery?', 'What gear do you shoot on?'],
  },
  {
    keywords: ['turnaround', 'delivery', 'deliver', 'fast', 'quick', 'long', 'timeline'],
    text: 'A color-graded 60-second teaser lands within 48 hours of wrap — 24 with the express add-on. Full masters follow in 10 working days with two revision rounds built into every package.',
    suggestions: ['What does it cost?', 'Which dates are open?', 'Do you travel outside California?'],
  },
  {
    keywords: ['location', 'travel', 'where', 'outside', 'city', 'state'],
    text: 'Flagship studios in Los Angeles, New York and Miami, and a mobile production truck that deploys anywhere in the continental US. Travel outside California adds a $500 mobilization fee — everything else stays fixed.',
    suggestions: ['Which dates are open?', 'What does a wedding film cost?', 'What gear do you shoot on?'],
  },
  {
    keywords: ['gear', 'camera', 'equipment', 'red', 'lens', 'shoot on'],
    text: 'RED V-Raptor 8K VV, ARRI Alexa Mini LF, Sony FX6, Cooke anamorphic primes and Profoto Pro-11 flash packs — all owned, not rented, so nothing ever arrives late to set. The Studio Vault section below has the full inventory.',
    suggestions: ['What does it cost?', 'Which dates are open?', 'How fast is delivery?'],
  },
]

const FALLBACK: CannedReply = {
  keywords: [],
  text: 'Happy to help with that. I can walk you through pricing, open dates, gear, delivery timelines or travel — or a producer can call you back within one business day. What matters most for your shoot?',
  suggestions: ['What does a wedding film cost?', 'Do you travel outside California?', 'How fast is delivery?'],
}

function pickReply(input: string): CannedReply {
  const lower = input.toLowerCase()
  let best: CannedReply | null = null
  let bestHits = 0
  for (const reply of REPLIES) {
    const hits = reply.keywords.filter((k) => lower.includes(k)).length
    if (hits > bestHits) {
      bestHits = hits
      best = reply
    }
  }
  return best ?? FALLBACK
}

function nowStamp(): string {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

const SEED_MESSAGE: ChatMessage = {
  id: 'seed-1',
  sender: 'assistant',
  text: 'Welcome to CP Studios. I can price a shoot, check open dates or talk you through the gear — what are you planning?',
  timestamp: '',
  suggestions: ['What does a wedding film cost?', 'Do you travel outside California?', 'How fast is delivery?'],
}

/* -------------------------------------------------------------- widget -- */

export function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([SEED_MESSAGE])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)

  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<number | null>(null)
  const reduced = useReducedMotion()

  // Auto-scroll the log — scrollTop only, never scrollIntoView (which would
  // yank the whole page).
  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, typing, open])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  // Clear any pending reply timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [])

  const send = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || typing) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: nowStamp(),
    }
    setMessages((prev) => [...prev, userMsg])
    setDraft('')
    setTyping(true)

    const reply = pickReply(trimmed)
    timerRef.current = window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: reply.text,
          timestamp: nowStamp(),
          suggestions: reply.suggestions,
        },
      ])
      setTyping(false)
    }, 700)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    send(draft)
  }

  const lastAssistant = [...messages].reverse().find((msg) => msg.sender === 'assistant')
  const suggestions = lastAssistant?.suggestions ?? []

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close the shoot consultant' : 'Open the shoot consultant'}
        aria-expanded={open}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-ember-500 text-[#0a0a0a] shadow-[0_14px_40px_-10px_rgb(224_168_46/0.7)] transition-transform duration-300 hover:scale-105 active:scale-95"
      >
        {!open && !reduced && (
          <span
            className="pulse-ring absolute inset-0 rounded-full bg-gold-400/50"
            aria-hidden="true"
          />
        )}
        {open ? (
          <X className="relative h-6 w-6" aria-hidden="true" />
        ) : (
          <Sparkles className="relative h-6 w-6" aria-hidden="true" />
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.28, ease: EASE.outExpo }}
            style={{ transformOrigin: 'bottom right' }}
            className="glass-strong fixed bottom-24 right-6 z-50 flex h-[560px] max-h-[75svh] w-[min(92vw,384px)] flex-col overflow-hidden rounded-3xl shadow-deep"
            role="region"
            aria-label="Shoot consultant chat"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/[0.08] px-5 py-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-ember-500 text-[#0a0a0a]">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="flex-1">
                <p className="text-[14px] font-semibold text-ink-hi">Shoot Consultant</p>
                <p className="flex items-center gap-1.5 text-[11px] text-ink-mid">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
                  Online — replies instantly
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-mid transition-colors hover:bg-white/[0.06] hover:text-ink-hi"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={listRef}
              role="log"
              aria-live="polite"
              className="flex-1 space-y-4 overflow-y-auto px-5 py-4"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cx('flex flex-col', msg.sender === 'user' ? 'items-end' : 'items-start')}
                >
                  <div
                    className={cx(
                      'max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed',
                      msg.sender === 'user'
                        ? 'rounded-br-md bg-gold-400/90 text-[#141414]'
                        : 'glass rounded-bl-md text-ink-hi'
                    )}
                  >
                    {msg.text}
                  </div>
                  {msg.timestamp && (
                    <span className="mt-1 px-1 font-mono text-[10px] text-ink-low">
                      {msg.timestamp}
                    </span>
                  )}
                </div>
              ))}

              {typing && (
                <div className="flex items-start">
                  <div className="glass flex items-center gap-1.5 rounded-2xl rounded-bl-md px-4 py-3.5">
                    {[0, 1, 2].map((i) => (
                      <m.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-ink-mid"
                        animate={reduced ? undefined : { y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                    <span className="sr-only">Consultant is typing</span>
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && !typing && (
              <div className="flex flex-wrap gap-2 px-5 pb-3">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-white/10 px-3 py-2 text-[11px] text-ink-mid transition-colors duration-300 hover:border-gold-400/60 hover:text-gold-300"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Composer */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 border-t border-white/[0.08] px-4 py-3"
            >
              <label htmlFor="assistant-input" className="sr-only">
                Ask about your shoot
              </label>
              <input
                id="assistant-input"
                ref={inputRef}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask about pricing, dates, gear…"
                className="h-11 flex-1 rounded-full border border-white/10 bg-base/70 px-4 text-[13px] text-ink-hi placeholder:text-ink-low focus:border-gold-400/60"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={!draft.trim() || typing}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-400 text-[#0a0a0a] transition-all duration-300 hover:bg-gold-300 disabled:opacity-40"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
