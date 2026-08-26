import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  MapPin,
  PartyPopper,
  Zap,
} from 'lucide-react'
import type {
  Booking,
  GearAddon,
  LocationOption,
  ShootCategory,
  TimeSlot,
  TimezoneOption,
  User,
} from '../types/flashCinema'
import {
  GEAR_ADDONS,
  LOCATIONS,
  SHOOT_CATEGORIES,
  TIMEZONES,
  TIME_SLOTS_PST,
} from '../data/mockData'
import { EASE } from '../lib/motion'
import { Button, SectionHeading, cx } from '../lib/ui'

interface BookingEngineProps {
  user: User | null
  selectedTimezone: TimezoneOption
  onSelectTimezone: (tz: TimezoneOption) => void
  onBookingConfirmed: (booking: Booking) => void
  onOpenAuthModal: () => void
  preselectedCategoryId?: string | null
}

/* --------------------------------------------------------------- money -- */

const TAX_RATE = 0.08875

const USD0 = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const USD2 = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })

/* ------------------------------------------------------------ timezone -- */

const PST_OFFSET = -8

/** "07:00 AM" -> hour 7 / "05:30 PM" -> 17.5-ish parts. */
function parsePstTime(time: string): { hour: number; minute: number } {
  const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) return { hour: 0, minute: 0 }
  let hour = parseInt(match[1], 10) % 12
  if (match[3].toUpperCase() === 'PM') hour += 12
  return { hour, minute: parseInt(match[2], 10) }
}

function formatHour(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM'
  const display = hour % 12 === 0 ? 12 : hour % 12
  return `${display}:${String(minute).padStart(2, '0')} ${period}`
}

/** Converts a PST slot into the client's timezone, noting day rollover. */
function convertSlot(timePST: string, tz: TimezoneOption): { time: string; dayShift: string } {
  const { hour, minute } = parsePstTime(timePST)
  const raw = hour + (tz.utcOffsetHours - PST_OFFSET)
  const wrapped = ((raw % 24) + 24) % 24
  const dayShift = raw >= 24 ? ' (+1 day)' : raw < 0 ? ' (−1 day)' : ''
  return { time: formatHour(wrapped, minute), dayShift }
}

/* ------------------------------------------------------------ calendar -- */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function toIsoDate(y: number, mo: number, d: number): string {
  return `${y}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/* --------------------------------------------------------------- steps -- */

type StepIndex = 0 | 1 | 2 | 3

const STEPS = [
  { id: 0, label: 'Production' },
  { id: 1, label: 'Date & Time' },
  { id: 2, label: 'Details' },
  { id: 3, label: 'Confirm' },
] as const

interface DetailErrors {
  name?: string
  email?: string
  phone?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^\+?[\d\s().-]{7,}$/

/* ============================================================== engine -- */

export function BookingEngine({
  user,
  selectedTimezone,
  onSelectTimezone,
  onBookingConfirmed,
  onOpenAuthModal,
  preselectedCategoryId,
}: BookingEngineProps) {
  const today = useMemo(() => {
    const now = new Date()
    return { y: now.getFullYear(), mo: now.getMonth(), d: now.getDate() }
  }, [])

  const [step, setStep] = useState<StepIndex>(0)
  const [direction, setDirection] = useState(1)

  const [category, setCategory] = useState<ShootCategory | null>(null)
  const [viewYear, setViewYear] = useState(today.y)
  const [viewMonth, setViewMonth] = useState(today.mo)
  const [date, setDate] = useState<string | null>(null)
  const [slot, setSlot] = useState<TimeSlot | null>(null)
  const [location, setLocation] = useState<LocationOption>(LOCATIONS[0])
  const [addons, setAddons] = useState<GearAddon[]>([])
  const [tzOpen, setTzOpen] = useState(false)

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [instructions, setInstructions] = useState('')
  const [errors, setErrors] = useState<DetailErrors>({})

  const [confirmed, setConfirmed] = useState<Booking | null>(null)
  const tzRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  /* Preselect a category chosen from the services grid */
  useEffect(() => {
    if (!preselectedCategoryId) return
    const match = SHOOT_CATEGORIES.find((c) => c.id === preselectedCategoryId)
    if (match) {
      setCategory(match)
      setConfirmed(null)
      setStep(1)
      setDirection(1)
    }
  }, [preselectedCategoryId])

  /* Prefill details when the user signs in */
  useEffect(() => {
    if (!user) return
    setName((prev) => prev || user.name)
    setEmail((prev) => prev || user.email)
    if (user.phone) setPhone((prev) => prev || user.phone!)
  }, [user])

  /* Close the timezone menu on outside pointerdown */
  useEffect(() => {
    if (!tzOpen) return
    const onPointer = (e: PointerEvent) => {
      if (tzRef.current && !tzRef.current.contains(e.target as Node)) setTzOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTzOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [tzOpen])

  /* ------------------------------------------------------------- totals -- */

  const money = useMemo(() => {
    const base = category?.basePriceUSD ?? 0
    const locationFee = location.extraFeeUSD
    const addonTotal = addons.reduce((sum, a) => sum + a.priceUSD, 0)
    const subtotal = base + locationFee + addonTotal
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100
    return { base, locationFee, addonTotal, subtotal, tax, total: subtotal + tax }
  }, [category, location, addons])

  /* ------------------------------------------------------------ validity -- */

  const detailErrors = useMemo((): DetailErrors => {
    const next: DetailErrors = {}
    if (!name.trim()) next.name = 'Enter your full name.'
    if (!email.trim()) next.email = 'Enter your email address.'
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email address.'
    if (!phone.trim()) next.phone = 'Enter a phone number.'
    else if (!PHONE_RE.test(phone.trim())) next.phone = 'Enter a valid phone number.'
    return next
  }, [name, email, phone])

  const stepValid: Record<StepIndex, boolean> = {
    0: category !== null,
    1: date !== null && slot !== null,
    2: Object.keys(detailErrors).length === 0,
    3: true,
  }

  const goTo = (next: StepIndex) => {
    setDirection(next > step ? 1 : -1)
    setStep(next)
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleContinue = () => {
    if (step === 2) {
      setErrors(detailErrors)
      if (Object.keys(detailErrors).length > 0) return
    }
    if (step < 3 && stepValid[step]) goTo((step + 1) as StepIndex)
  }

  /* ------------------------------------------------------------- confirm -- */

  const handleConfirm = () => {
    if (!user) {
      onOpenAuthModal()
      return
    }
    if (!category || !date || !slot) return

    const converted = convertSlot(slot.timePST, selectedTimezone)
    const booking: Booking = {
      id: `CP-US-${String(Math.floor(1000 + Math.random() * 9000))}`,
      userId: user.id,
      clientName: name.trim(),
      clientEmail: email.trim(),
      clientPhone: phone.trim(),
      category,
      date,
      timeSlotPST: slot.timePST,
      convertedTime: `${slot.timePST} PST (${converted.time}${converted.dayShift} ${selectedTimezone.code})`,
      clientTimezone: selectedTimezone,
      location,
      selectedAddons: addons,
      ...(instructions.trim() ? { specialInstructions: instructions.trim() } : {}),
      subtotalUSD: money.subtotal,
      taxUSD: money.tax,
      totalUSD: money.total,
      status: 'booked',
      createdAt: new Date().toISOString(),
    }

    onBookingConfirmed(booking)
    setConfirmed(booking)
  }

  const resetFlow = () => {
    setConfirmed(null)
    setCategory(null)
    setDate(null)
    setSlot(null)
    setAddons([])
    setInstructions('')
    setStep(0)
    setDirection(-1)
  }

  /* ------------------------------------------------------------ calendar -- */

  const calendarCells = useMemo(() => {
    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const cells: Array<{ day: number; iso: string; past: boolean; isToday: boolean; weekend: boolean } | null> = []
    for (let i = 0; i < firstWeekday; i++) cells.push(null)
    const todayIso = toIsoDate(today.y, today.mo, today.d)
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = toIsoDate(viewYear, viewMonth, d)
      const weekday = new Date(viewYear, viewMonth, d).getDay()
      cells.push({
        day: d,
        iso,
        past: iso < todayIso,
        isToday: iso === todayIso,
        weekend: weekday === 0 || weekday === 6,
      })
    }
    return cells
  }, [viewYear, viewMonth, today])

  const canGoPrevMonth = viewYear > today.y || (viewYear === today.y && viewMonth > today.mo)

  const shiftMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(next.getFullYear())
    setViewMonth(next.getMonth())
  }

  const formatSelectedDate = (iso: string) => {
    const [y, mo, d] = iso.split('-').map(Number)
    return new Date(y, mo - 1, d).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  /* -------------------------------------------------------------- render -- */

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 36 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir * -36 }),
  }

  return (
    <section ref={sectionRef} id="booking" className="relative bg-raise/40 py-24 md:py-32 lg:py-40">
      <div className="rule-fade absolute inset-x-0 top-0" aria-hidden="true" />
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="RESERVE YOUR DATE"
          title={
            <>
              Book a shoot in <span className="text-gradient-gold">under two minutes</span>
            </>
          }
          subtitle="Pick a production, lock a date in your own timezone and get an itemised quote on the spot. A 25% deposit holds any date for 14 days."
        />

        {confirmed ? (
          /* --------------------------------------------------- success -- */
          <m.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE.outExpo }}
            className="glass-strong mx-auto mt-14 max-w-xl rounded-3xl p-8 text-center sm:p-10"
          >
            <m.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15, ease: EASE.outExpo }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-400 text-[#0a0a0a]"
            >
              <Check className="h-8 w-8" aria-hidden="true" />
            </m.span>
            <h3 className="mt-6 font-display text-3xl text-ink-hi">You&apos;re booked.</h3>
            <p className="mt-2 font-mono text-[13px] tracking-[0.14em] text-gold-400">
              {confirmed.id}
            </p>
            <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed text-ink-mid">
              {confirmed.category.title} · {formatSelectedDate(confirmed.date)} ·{' '}
              {confirmed.convertedTime}. A producer will call within one business day to kick off
              pre-production.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                onClick={() => {
                  document.getElementById('portal')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                <PartyPopper className="h-4 w-4" aria-hidden="true" />
                View in your portal
              </Button>
              <Button variant="outline" onClick={resetFlow}>
                Book another
              </Button>
            </div>
          </m.div>
        ) : (
          <div className="mt-14">
            {/* ------------------------------------------------- stepper -- */}
            <ol className="flex items-center justify-center gap-2 sm:gap-4" aria-label="Booking steps">
              {STEPS.map((s, i) => {
                const isDone = i < step
                const isCurrent = i === step
                return (
                  <li key={s.id} className="flex items-center gap-2 sm:gap-4">
                    {i > 0 && (
                      <span
                        className={cx('h-px w-6 sm:w-12', isDone || isCurrent ? 'bg-gold-400/60' : 'bg-white/[0.1]')}
                        aria-hidden="true"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => isDone && goTo(i as StepIndex)}
                      disabled={!isDone}
                      aria-current={isCurrent ? 'step' : undefined}
                      className={cx(
                        'flex items-center gap-2 rounded-full py-2 pl-2 pr-3 transition-colors duration-300',
                        isDone && 'cursor-pointer hover:bg-white/[0.05]'
                      )}
                    >
                      <span
                        className={cx(
                          'flex h-8 w-8 items-center justify-center rounded-full border text-[13px] font-semibold',
                          isCurrent
                            ? 'border-gold-400 bg-gold-400 text-[#0a0a0a]'
                            : isDone
                              ? 'border-gold-400/60 text-gold-400'
                              : 'border-white/15 text-ink-low'
                        )}
                      >
                        {isDone ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
                      </span>
                      <span
                        className={cx(
                          'hidden text-[13px] font-medium md:block',
                          isCurrent ? 'text-ink-hi' : isDone ? 'text-ink-mid' : 'text-ink-low'
                        )}
                      >
                        {s.label}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>

            {/* --------------------------------------------------- panes -- */}
            <div className="mt-10 overflow-hidden">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <m.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: EASE.outExpo }}
                >
                  {/* ============================== STEP 1: production == */}
                  {step === 0 && (
                    <div
                      role="radiogroup"
                      aria-label="Production type"
                      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    >
                      {SHOOT_CATEGORIES.map((cat) => {
                        const active = category?.id === cat.id
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => setCategory(cat)}
                            className={cx(
                              'glass rounded-2xl p-5 text-left transition-all duration-300',
                              active
                                ? 'border-gold-400/70 shadow-gold'
                                : 'hover:border-white/20'
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="font-display text-lg leading-snug text-ink-hi">
                                {cat.title}
                              </p>
                              <span
                                className={cx(
                                  'mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                                  active ? 'border-gold-400 bg-gold-400' : 'border-white/25'
                                )}
                                aria-hidden="true"
                              >
                                {active && <Check className="h-3 w-3 text-[#0a0a0a]" />}
                              </span>
                            </div>
                            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-gold-400">
                              {cat.subtitle}
                            </p>
                            <div className="mt-4 flex items-center justify-between text-[13px]">
                              <span className="text-ink-mid">
                                <Clock className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                                {cat.durationHours}h shoot
                              </span>
                              <span className="font-medium text-ink-hi">
                                from {USD0(cat.basePriceUSD)}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* =========================== STEP 2: date & time == */}
                  {step === 1 && (
                    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
                      {/* Calendar */}
                      <div className="glass rounded-2xl p-5 sm:p-6">
                        <div className="flex items-center justify-between">
                          <h3 className="flex items-center gap-2 font-display text-lg text-ink-hi">
                            <Calendar className="h-4 w-4 text-gold-400" aria-hidden="true" />
                            {MONTH_NAMES[viewMonth]} {viewYear}
                          </h3>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => shiftMonth(-1)}
                              disabled={!canGoPrevMonth}
                              aria-label="Previous month"
                              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-mid transition-colors hover:bg-white/[0.06] hover:text-ink-hi disabled:opacity-30"
                            >
                              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => shiftMonth(1)}
                              aria-label="Next month"
                              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-mid transition-colors hover:bg-white/[0.06] hover:text-ink-hi"
                            >
                              <ChevronRight className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-7 gap-1">
                          {WEEKDAYS.map((wd) => (
                            <span
                              key={wd}
                              className="py-1 text-center font-mono text-[10px] uppercase tracking-wider text-ink-low"
                            >
                              {wd}
                            </span>
                          ))}
                          {calendarCells.map((cell, i) =>
                            cell === null ? (
                              <span key={`blank-${i}`} aria-hidden="true" />
                            ) : (
                              <button
                                key={cell.iso}
                                type="button"
                                disabled={cell.past}
                                onClick={() => setDate(cell.iso)}
                                aria-label={formatSelectedDate(cell.iso)}
                                aria-pressed={date === cell.iso}
                                className={cx(
                                  'flex aspect-square items-center justify-center rounded-lg text-[13px] transition-colors duration-200',
                                  cell.past && 'text-ink-low/40',
                                  !cell.past && date !== cell.iso && 'text-ink-mid hover:bg-white/[0.07] hover:text-ink-hi',
                                  !cell.past && cell.weekend && date !== cell.iso && 'text-gold-300/80',
                                  cell.isToday && date !== cell.iso && 'ring-1 ring-inset ring-gold-400/50',
                                  date === cell.iso && 'bg-gold-400 font-semibold text-[#0a0a0a]'
                                )}
                              >
                                {cell.day}
                              </button>
                            )
                          )}
                        </div>
                        {date && (
                          <p className="mt-4 text-[13px] text-gold-300">
                            {formatSelectedDate(date)}
                          </p>
                        )}
                      </div>

                      <div className="space-y-6">
                        {/* Timezone */}
                        <div ref={tzRef} className="relative">
                          <p className="mb-2 flex items-center gap-2 text-[13px] font-medium text-ink-mid">
                            <Globe className="h-3.5 w-3.5 text-gold-400" aria-hidden="true" />
                            Your timezone
                          </p>
                          <button
                            type="button"
                            onClick={() => setTzOpen((v) => !v)}
                            aria-expanded={tzOpen}
                            aria-haspopup="listbox"
                            className="glass flex h-12 w-full items-center justify-between rounded-xl px-4 text-[13px] text-ink-hi transition-colors hover:border-white/20"
                          >
                            <span className="truncate">{selectedTimezone.name}</span>
                            <ChevronDown
                              className={cx('h-4 w-4 shrink-0 text-ink-mid transition-transform duration-200', tzOpen && 'rotate-180')}
                              aria-hidden="true"
                            />
                          </button>
                          <AnimatePresence>
                            {tzOpen && (
                              <m.ul
                                role="listbox"
                                aria-label="Timezone"
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.18 }}
                                className="glass-strong absolute z-20 mt-2 w-full overflow-hidden rounded-xl py-1 shadow-deep"
                              >
                                {TIMEZONES.map((tz) => (
                                  <li key={tz.id}>
                                    <button
                                      type="button"
                                      role="option"
                                      aria-selected={tz.id === selectedTimezone.id}
                                      onClick={() => {
                                        onSelectTimezone(tz)
                                        setTzOpen(false)
                                      }}
                                      className={cx(
                                        'flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] transition-colors',
                                        tz.id === selectedTimezone.id
                                          ? 'text-gold-300'
                                          : 'text-ink-mid hover:bg-white/[0.05] hover:text-ink-hi'
                                      )}
                                    >
                                      <span className="truncate">{tz.name}</span>
                                      <span className="ml-2 font-mono text-[11px] text-ink-low">
                                        {tz.offset}
                                      </span>
                                    </button>
                                  </li>
                                ))}
                              </m.ul>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Slots */}
                        <div>
                          <p className="mb-2 flex items-center gap-2 text-[13px] font-medium text-ink-mid">
                            <Clock className="h-3.5 w-3.5 text-gold-400" aria-hidden="true" />
                            Shoot window
                          </p>
                          <div className="space-y-2">
                            {TIME_SLOTS_PST.map((s) => {
                              const conv = convertSlot(s.timePST, selectedTimezone)
                              const active = slot?.id === s.id
                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  disabled={!s.available}
                                  onClick={() => setSlot(s)}
                                  aria-pressed={active}
                                  className={cx(
                                    'glass flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-all duration-300',
                                    active ? 'border-gold-400/70 shadow-gold' : 'hover:border-white/20',
                                    !s.available && 'opacity-40'
                                  )}
                                >
                                  <span>
                                    <span className="flex items-center gap-2 text-[14px] font-medium text-ink-hi">
                                      {s.timePST} PST
                                      {s.isPeak && (
                                        <span className="flex items-center gap-1 rounded-full bg-gold-400/15 px-2 py-0.5 font-mono text-[9px] tracking-[0.14em] text-gold-300">
                                          <Zap className="h-2.5 w-2.5" aria-hidden="true" />
                                          PEAK
                                        </span>
                                      )}
                                    </span>
                                    <span className="mt-0.5 block text-[12px] text-ink-mid">
                                      {s.label}
                                    </span>
                                  </span>
                                  {selectedTimezone.id !== 'pst' && (
                                    <span className="shrink-0 font-mono text-[11px] text-ink-low">
                                      {conv.time}
                                      {conv.dayShift} {selectedTimezone.code}
                                    </span>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>

                        {/* Location */}
                        <div>
                          <p className="mb-2 flex items-center gap-2 text-[13px] font-medium text-ink-mid">
                            <MapPin className="h-3.5 w-3.5 text-gold-400" aria-hidden="true" />
                            Location
                          </p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {LOCATIONS.map((loc) => {
                              const active = location.id === loc.id
                              return (
                                <button
                                  key={loc.id}
                                  type="button"
                                  onClick={() => setLocation(loc)}
                                  aria-pressed={active}
                                  className={cx(
                                    'glass rounded-xl px-4 py-3 text-left transition-all duration-300',
                                    active ? 'border-gold-400/70' : 'hover:border-white/20'
                                  )}
                                >
                                  <span className="block text-[13px] font-medium leading-snug text-ink-hi">
                                    {loc.name}
                                  </span>
                                  <span className="mt-1 block text-[11px] text-ink-mid">
                                    {loc.extraFeeUSD === 0
                                      ? 'Included'
                                      : `+${USD0(loc.extraFeeUSD)}`}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ================================ STEP 3: details == */}
                  {step === 2 && (
                    <form
                      noValidate
                      onSubmit={(e: FormEvent<HTMLFormElement>) => {
                        e.preventDefault()
                        handleContinue()
                      }}
                      className="mx-auto grid max-w-3xl gap-6 lg:grid-cols-2"
                    >
                      <div className="space-y-4">
                        {(
                          [
                            {
                              id: 'bk-name', label: 'Full name', type: 'text', value: name,
                              set: setName, error: errors.name, auto: 'name', ph: 'Alex Rivera',
                            },
                            {
                              id: 'bk-email', label: 'Email address', type: 'email', value: email,
                              set: setEmail, error: errors.email, auto: 'email', ph: 'you@company.com',
                            },
                            {
                              id: 'bk-phone', label: 'Phone', type: 'tel', value: phone,
                              set: setPhone, error: errors.phone, auto: 'tel', ph: '+1 (310) 555-0142',
                            },
                          ] as const
                        ).map((f) => (
                          <div key={f.id}>
                            <label htmlFor={f.id} className="mb-1.5 block text-[13px] font-medium text-ink-mid">
                              {f.label}
                            </label>
                            <input
                              id={f.id}
                              type={f.type}
                              autoComplete={f.auto}
                              value={f.value}
                              placeholder={f.ph}
                              onChange={(e) => f.set(e.target.value)}
                              onBlur={() => setErrors(detailErrors)}
                              aria-invalid={f.error ? true : undefined}
                              aria-describedby={f.error ? `${f.id}-err` : undefined}
                              className={cx(
                                'h-12 w-full rounded-xl border bg-base/80 px-4 text-[14px] text-ink-hi placeholder:text-ink-low',
                                f.error ? 'border-ember-500/70' : 'border-white/10 focus:border-gold-400/60'
                              )}
                            />
                            {f.error && (
                              <p id={`${f.id}-err`} className="mt-1.5 text-[12px] text-ember-400">
                                {f.error}
                              </p>
                            )}
                          </div>
                        ))}

                        <div>
                          <label htmlFor="bk-notes" className="mb-1.5 block text-[13px] font-medium text-ink-mid">
                            Special instructions <span className="text-ink-low">(optional)</span>
                          </label>
                          <textarea
                            id="bk-notes"
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            rows={3}
                            placeholder="Shot list ideas, references, access notes…"
                            className="w-full resize-none rounded-xl border border-white/10 bg-base/80 px-4 py-3 text-[14px] text-ink-hi placeholder:text-ink-low focus:border-gold-400/60"
                          />
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-[13px] font-medium text-ink-mid">
                          Add-ons <span className="text-ink-low">(optional)</span>
                        </p>
                        <div className="space-y-2">
                          {GEAR_ADDONS.map((addon) => {
                            const active = addons.some((a) => a.id === addon.id)
                            return (
                              <button
                                key={addon.id}
                                type="button"
                                aria-pressed={active}
                                onClick={() =>
                                  setAddons((prev) =>
                                    active
                                      ? prev.filter((a) => a.id !== addon.id)
                                      : [...prev, addon]
                                  )
                                }
                                className={cx(
                                  'glass flex w-full items-start gap-3 rounded-xl px-4 py-3 text-left transition-all duration-300',
                                  active ? 'border-gold-400/70' : 'hover:border-white/20'
                                )}
                              >
                                <span
                                  className={cx(
                                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border',
                                    active ? 'border-gold-400 bg-gold-400' : 'border-white/25'
                                  )}
                                  aria-hidden="true"
                                >
                                  {active && <Check className="h-3 w-3 text-[#0a0a0a]" />}
                                </span>
                                <span className="flex-1">
                                  <span className="flex items-center justify-between gap-2 text-[13px] font-medium text-ink-hi">
                                    {addon.name}
                                    <span className="font-mono text-[12px] text-gold-300">
                                      +{USD0(addon.priceUSD)}
                                    </span>
                                  </span>
                                  <span className="mt-0.5 block text-[12px] leading-relaxed text-ink-mid">
                                    {addon.description}
                                  </span>
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </form>
                  )}

                  {/* ================================ STEP 4: confirm == */}
                  {step === 3 && category && date && slot && (
                    <div className="mx-auto max-w-2xl">
                      <div className="glass-strong rounded-3xl p-6 sm:p-8">
                        <h3 className="font-display text-2xl text-ink-hi">Review your booking</h3>

                        <dl className="mt-6 space-y-3 text-[14px]">
                          {[
                            ['Production', category.title],
                            ['Date', formatSelectedDate(date)],
                            [
                              'Time',
                              `${slot.timePST} PST (${convertSlot(slot.timePST, selectedTimezone).time}${convertSlot(slot.timePST, selectedTimezone).dayShift} ${selectedTimezone.code})`,
                            ],
                            ['Location', location.name],
                            ['Contact', `${name.trim()} · ${email.trim()}`],
                          ].map(([label, value]) => (
                            <div key={label} className="flex justify-between gap-6">
                              <dt className="shrink-0 text-ink-low">{label}</dt>
                              <dd className="text-right text-ink-hi">{value}</dd>
                            </div>
                          ))}
                        </dl>

                        <div className="rule-fade my-6" aria-hidden="true" />

                        <dl className="space-y-2 text-[14px]">
                          <div className="flex justify-between text-ink-mid">
                            <dt>{category.title}</dt>
                            <dd className="font-mono">{USD0(money.base)}</dd>
                          </div>
                          {money.locationFee > 0 && (
                            <div className="flex justify-between text-ink-mid">
                              <dt>Location fee</dt>
                              <dd className="font-mono">{USD0(money.locationFee)}</dd>
                            </div>
                          )}
                          {addons.map((addon) => (
                            <div key={addon.id} className="flex justify-between text-ink-mid">
                              <dt>{addon.name}</dt>
                              <dd className="font-mono">{USD0(addon.priceUSD)}</dd>
                            </div>
                          ))}
                          <div className="flex justify-between text-ink-mid">
                            <dt>Tax (8.875%)</dt>
                            <dd className="font-mono">{USD2(money.tax)}</dd>
                          </div>
                          <div className="flex items-baseline justify-between border-t border-white/[0.09] pt-3">
                            <dt className="text-[15px] font-medium text-ink-hi">Total</dt>
                            <dd className="font-display text-3xl text-gradient-gold">
                              {USD2(money.total)}
                            </dd>
                          </div>
                          <div className="flex justify-between pt-1 text-[12px] text-ink-low">
                            <dt>Deposit due today (25%)</dt>
                            <dd className="font-mono">{USD2(money.total * 0.25)}</dd>
                          </div>
                        </dl>

                        <div className="mt-8">
                          {user ? (
                            <Button size="lg" magnetic onClick={handleConfirm} className="w-full">
                              Confirm booking
                            </Button>
                          ) : (
                            <Button size="lg" onClick={onOpenAuthModal} className="w-full">
                              Sign in to confirm
                            </Button>
                          )}
                          <p className="mt-3 text-center font-mono text-[11px] text-ink-low">
                            Quote held for 14 days · No payment collected in this demo
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </m.div>
              </AnimatePresence>
            </div>

            {/* ---------------------------------------------- nav row -- */}
            {step < 3 ? (
              <div className="mt-10 flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={() => step > 0 && goTo((step - 1) as StepIndex)}
                  disabled={step === 0}
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Back
                </Button>
                <Button onClick={handleContinue} disabled={!stepValid[step]}>
                  Continue
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            ) : (
              <div className="mt-10 flex justify-start">
                <Button variant="ghost" onClick={() => goTo(2)}>
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Back
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
