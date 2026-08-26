import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { Eye, EyeOff, Loader2, ShieldAlert, X } from 'lucide-react'
import type { User } from '../types/flashCinema'
import { EASE } from '../lib/motion'
import { Button, cx } from '../lib/ui'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: (user: User) => void
}

type Mode = 'signin' | 'signup'

interface FieldErrors {
  name?: string
  email?: string
  password?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * Demo sign-in modal. There is no backend: the password field exists for
 * realism only, is never stored anywhere and never leaves component state.
 */
export function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [company, setCompany] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)

  const panelRef = useRef<HTMLDivElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  const timerRef = useRef<number | null>(null)

  const titleId = useId()
  const uid = useId()

  /* ------------------------------------------------ open/close side effects */

  useEffect(() => {
    if (!isOpen) return

    previousFocus.current = document.activeElement as HTMLElement | null

    // Lock body scroll without a layout jump
    const scrollbarGap = window.innerWidth - document.documentElement.clientWidth
    const prevOverflow = document.body.style.overflow
    const prevPadding = document.body.style.paddingRight
    document.body.style.overflow = 'hidden'
    if (scrollbarGap > 0) document.body.style.paddingRight = `${scrollbarGap}px`

    // Focus the first field once the panel is mounted
    const focusTimer = window.setTimeout(() => firstFieldRef.current?.focus(), 60)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      // Trap Tab inside the panel
      const panel = panelRef.current
      if (!panel) return
      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (e.shiftKey) {
        if (active === first || !panel.contains(active)) {
          e.preventDefault()
          last.focus()
        }
      } else if (active === last || !panel.contains(active)) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(focusTimer)
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPadding
      previousFocus.current?.focus()
    }
  }, [isOpen, onClose])

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    }
  }, [])

  /* ------------------------------------------------------------- validation */

  const validate = useCallback((): FieldErrors => {
    const next: FieldErrors = {}
    if (mode === 'signup' && !name.trim()) next.name = 'Enter your name.'
    if (!email.trim()) next.email = 'Enter your email address.'
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Enter a password.'
    else if (password.length < 8) next.password = 'Password must be at least 8 characters.'
    return next
  }, [mode, name, email, password])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    timerRef.current = window.setTimeout(() => {
      const trimmedEmail = email.trim()
      const displayName =
        mode === 'signup'
          ? name.trim()
          : trimmedEmail
              .split('@')[0]
              .replace(/[._-]+/g, ' ')
              .replace(/\b\w/g, (c) => c.toUpperCase())

      const user: User = {
        id: `client-${Date.now()}`,
        name: displayName,
        email: trimmedEmail,
        role: 'client',
        timezone: 'PST',
        createdAt: new Date().toISOString(),
        ...(mode === 'signup' && company.trim() ? { company: company.trim() } : {}),
      }

      setLoading(false)
      setPassword('')
      onLoginSuccess(user)
      onClose()
    }, 900)
  }

  const switchMode = (next: Mode) => {
    setMode(next)
    setErrors({})
  }

  const fieldClass = (invalid: boolean) =>
    cx(
      'h-12 w-full rounded-xl border bg-base/80 px-4 text-[14px] text-ink-hi placeholder:text-ink-low',
      invalid ? 'border-ember-500/70' : 'border-white/10 focus:border-gold-400/60'
    )

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-void/90 p-4 backdrop-blur-md"
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.3, ease: EASE.outExpo }}
            className="glass-strong max-h-[90svh] w-full max-w-md overflow-y-auto rounded-3xl p-6 shadow-deep sm:p-8"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 id={titleId} className="font-display text-2xl text-ink-hi">
                  {mode === 'signin' ? 'Welcome back' : 'Create your portal'}
                </h2>
                <p className="mt-1.5 text-[13px] text-ink-mid">
                  {mode === 'signin'
                    ? 'Track productions, review proofs, download masters.'
                    : 'One account for every shoot you book with us.'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-mid transition-colors hover:bg-white/[0.06] hover:text-ink-hi"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Mode toggle */}
            <div className="mt-6 grid grid-cols-2 gap-1 rounded-full border border-white/10 bg-base/60 p-1">
              {(
                [
                  ['signin', 'Sign in'],
                  ['signup', 'Create account'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => switchMode(value)}
                  aria-pressed={mode === value}
                  className={cx(
                    'h-10 rounded-full text-[13px] font-medium transition-colors duration-300',
                    mode === value
                      ? 'bg-gold-400 text-[#0a0a0a]'
                      : 'text-ink-mid hover:text-ink-hi'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} noValidate className="mt-6">
              <AnimatePresence mode="wait" initial={false}>
                <m.div
                  key={mode}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {mode === 'signup' && (
                    <div>
                      <label
                        htmlFor={`${uid}-name`}
                        className="mb-1.5 block text-[13px] font-medium text-ink-mid"
                      >
                        Full name
                      </label>
                      <input
                        id={`${uid}-name`}
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Rivera"
                        aria-invalid={errors.name ? true : undefined}
                        aria-describedby={errors.name ? `${uid}-name-err` : undefined}
                        className={fieldClass(Boolean(errors.name))}
                      />
                      {errors.name && (
                        <p id={`${uid}-name-err`} className="mt-1.5 text-[12px] text-ember-400">
                          {errors.name}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor={`${uid}-email`}
                      className="mb-1.5 block text-[13px] font-medium text-ink-mid"
                    >
                      Email address
                    </label>
                    <input
                      id={`${uid}-email`}
                      ref={firstFieldRef}
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={errors.email ? `${uid}-email-err` : undefined}
                      className={fieldClass(Boolean(errors.email))}
                    />
                    {errors.email && (
                      <p id={`${uid}-email-err`} className="mt-1.5 text-[12px] text-ember-400">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor={`${uid}-password`}
                      className="mb-1.5 block text-[13px] font-medium text-ink-mid"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id={`${uid}-password`}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        aria-invalid={errors.password ? true : undefined}
                        aria-describedby={errors.password ? `${uid}-password-err` : undefined}
                        className={cx(fieldClass(Boolean(errors.password)), 'pr-12')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showPassword}
                        className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink-mid transition-colors hover:text-ink-hi"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p id={`${uid}-password-err`} className="mt-1.5 text-[12px] text-ember-400">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {mode === 'signup' && (
                    <div>
                      <label
                        htmlFor={`${uid}-company`}
                        className="mb-1.5 block text-[13px] font-medium text-ink-mid"
                      >
                        Company <span className="text-ink-low">(optional)</span>
                      </label>
                      <input
                        id={`${uid}-company`}
                        type="text"
                        autoComplete="organization"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Acme Inc."
                        className={fieldClass(false)}
                      />
                    </div>
                  )}
                </m.div>
              </AnimatePresence>

              <Button type="submit" size="lg" disabled={loading} className="mt-6 w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    {mode === 'signin' ? 'Signing in…' : 'Creating account…'}
                  </>
                ) : mode === 'signin' ? (
                  'Sign in'
                ) : (
                  'Create account'
                )}
              </Button>
            </form>

            <p className="mt-5 flex items-start gap-2 rounded-xl border border-white/[0.07] bg-base/50 px-4 py-3 text-[12px] leading-relaxed text-ink-low">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-500" aria-hidden="true" />
              Demo environment — no real credentials are stored, transmitted or validated.
            </p>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
