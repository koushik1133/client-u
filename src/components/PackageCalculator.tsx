/**
 * Package & budget configurator — section `#packages`.
 *
 * Four visible steps (production type, duration, location, add-ons) feed a live
 * itemised quote. Every figure is derived in a single `useMemo` and computed in
 * whole dollars / integer cents so the displayed total can never drift.
 *
 * Motion budget: entrance reveals only (transform + opacity), one animated
 * MotionValue on the headline total. No layout animation anywhere.
 */

import {
  animate,
  m,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import {
  ArrowRight,
  Briefcase,
  Camera,
  Check,
  ChevronDown,
  Clock,
  Film,
  Heart,
  MapPin,
  Plus,
  Receipt,
  ShieldCheck,
  Smartphone,
  Video,
  type LucideIcon,
} from 'lucide-react'

import { GEAR_ADDONS, LOCATIONS, SHOOT_CATEGORIES } from '../data/mockData'
import { EASE, Magnetic, Reveal, Stagger, StaggerItem } from '../lib/motion'
import { BorderBeam, Button, SectionHeading, SpotlightCard, cx } from '../lib/ui'

interface PackageCalculatorProps {
  onNavigate: (sectionId: string) => void
}

/* ------------------------------------------------------------- constants -- */

/** Sales tax applied to the subtotal. Held as basis points of a dollar. */
const TAX_RATE_PERCENT = 8.875
/** Every hour past the package's base day costs this share of the base price. */
const HOURLY_UPLIFT_RATE = 0.12
/** How far the duration slider travels beyond the package's base day. */
const MAX_EXTRA_HOURS = 8
const DEPOSIT_RATE = 0.25

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Camera,
  Video,
  Film,
  Heart,
  Smartphone,
  Briefcase,
}

const STEP_LABELS = ['01', '02', '03', '04'] as const

/* --------------------------------------------------------------- helpers -- */

/** Rounded dollars — used for every line item and headline figure. */
const usd0 = (value: number) =>
  value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })

/** Exact dollars and cents — tax and total only. */
const usd2 = (value: number) =>
  value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

interface QuoteLine {
  id: string
  label: string
  note: string
  amount: number
}

/* -------------------------------------------------------- AnimatedTotal -- */

/**
 * Rolls the headline total from its previous value to the new one.
 *
 * Written through a MotionValue so the tween never re-renders React, and
 * mirrored by an `sr-only` live region (below) because a value changing at
 * 60fps is useless to a screen reader.
 */
function AnimatedTotal({ value, className }: { value: number; className?: string }) {
  const reduced = useReducedMotion()
  const amount = useMotionValue(value)
  const text = useTransform(amount, (v) => usd2(v))

  useEffect(() => {
    if (reduced) {
      amount.set(value)
      return
    }
    const controls = animate(amount, value, { duration: 0.7, ease: EASE.outExpo })
    return () => controls.stop()
  }, [value, reduced, amount])

  return (
    <m.span aria-hidden="true" className={className}>
      {text as unknown as MotionValue<string>}
    </m.span>
  )
}

/* ------------------------------------------------------------- component -- */

export function PackageCalculator({ onNavigate }: PackageCalculatorProps) {
  const [categoryId, setCategoryId] = useState<string>(SHOOT_CATEGORIES[1].id)
  const [extraHours, setExtraHours] = useState<number>(2)
  const [locationId, setLocationId] = useState<string>(LOCATIONS[0].id)
  const [addonIds, setAddonIds] = useState<string[]>([GEAR_ADDONS[0].id])

  const cardRefs = useRef<Array<HTMLButtonElement | null>>([])

  const category =
    SHOOT_CATEGORIES.find((item) => item.id === categoryId) ?? SHOOT_CATEGORIES[0]
  const location = LOCATIONS.find((item) => item.id === locationId) ?? LOCATIONS[0]

  const baseHours = category.durationHours
  const totalHours = baseHours + extraHours

  const quote = useMemo(() => {
    const base = category.basePriceUSD
    // Integer dollars per hour, so the extra-hours line is always exact.
    const hourlyUplift = Math.round(base * HOURLY_UPLIFT_RATE)
    const extraHoursCost = hourlyUplift * extraHours
    const locationFee = location.extraFeeUSD

    const addons = GEAR_ADDONS.filter((addon) => addonIds.includes(addon.id))
    const addonsTotal = addons.reduce((sum, addon) => sum + addon.priceUSD, 0)

    const subtotal = base + extraHoursCost + locationFee + addonsTotal

    // Everything past this point stays in integer cents — no float drift.
    const taxCents = Math.round(subtotal * TAX_RATE_PERCENT)
    const totalCents = subtotal * 100 + taxCents
    const depositCents = Math.round(totalCents * DEPOSIT_RATE)

    const lines: QuoteLine[] = [
      {
        id: 'base',
        label: category.title,
        note: `${category.durationHours}h base production`,
        amount: base,
      },
    ]

    if (extraHours > 0) {
      lines.push({
        id: 'extra-hours',
        label: `${extraHours} additional ${extraHours === 1 ? 'hour' : 'hours'}`,
        note: `${usd0(hourlyUplift)} per hour · 12% of base`,
        amount: extraHoursCost,
      })
    }

    lines.push({
      id: 'location',
      label: location.name,
      note: location.area,
      amount: locationFee,
    })

    for (const addon of addons) {
      lines.push({
        id: addon.id,
        label: addon.name,
        note: addon.category.toUpperCase(),
        amount: addon.priceUSD,
      })
    }

    return {
      hourlyUplift,
      subtotal,
      tax: taxCents / 100,
      total: totalCents / 100,
      deposit: depositCents / 100,
      addonCount: addons.length,
      lines,
    }
  }, [category, extraHours, location, addonIds])

  const toggleAddon = useCallback((id: string) => {
    setAddonIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }, [])

  /** Arrow / Home / End move selection inside the production-type radiogroup. */
  const handleCategoryKeys = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
      const last = SHOOT_CATEGORIES.length - 1
      let next = index

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          next = index === last ? 0 : index + 1
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          next = index === 0 ? last : index - 1
          break
        case 'Home':
          next = 0
          break
        case 'End':
          next = last
          break
        default:
          return
      }

      event.preventDefault()
      setCategoryId(SHOOT_CATEGORIES[next].id)
      cardRefs.current[next]?.focus()
    },
    []
  )

  return (
    <section id="packages" className="relative isolate py-24 md:py-32 lg:py-40">
      {/* Decorative ground: hairline, soft lift, 35mm grain. Never over content. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-raise/55 to-transparent" />
        <div className="grain absolute inset-0" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="BUILD YOUR PACKAGE"
          title={
            <>
              Build the package,{' '}
              <span className="text-gradient-gold">see the number</span>
            </>
          }
          subtitle="The same rate card our producers quote from. Pick a production type, set the day length, choose where we shoot — the figure on the right moves with you. No hidden line items, no discovery call required."
          className="mb-16 lg:mb-24"
        />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          {/* ------------------------------------------------ configurator -- */}
          <div className="lg:col-span-7">
            <div className="space-y-12">
              {/* ---- 01 · Production type ---- */}
              <Reveal direction="up">
                <StepHeader
                  index={0}
                  id="pkg-step-type"
                  title="Production type"
                  hint="Six standing crews. Each price covers the full base day, gear, and the deliverables listed on the service card."
                />

                <div
                  role="radiogroup"
                  aria-labelledby="pkg-step-type"
                  className="mt-6"
                >
                  <Stagger gap={0.05} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {SHOOT_CATEGORIES.map((item, index) => {
                      const Icon = CATEGORY_ICONS[item.iconName] ?? Camera
                      const selected = item.id === categoryId

                      return (
                        <StaggerItem key={item.id} className="h-full">
                          <button
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            ref={(el) => {
                              cardRefs.current[index] = el
                            }}
                            onClick={() => setCategoryId(item.id)}
                            onKeyDown={(event) => handleCategoryKeys(event, index)}
                            className={cx(
                              'flex h-full w-full flex-col gap-4 rounded-2xl border p-4 text-left',
                              'transition-colors duration-300 ease-out',
                              selected
                                ? 'border-gold-500/70 bg-gold-500/[0.07] shadow-gold'
                                : 'border-line bg-panel/55 hover:border-gold-500/35 hover:bg-panel'
                            )}
                          >
                            <span className="flex items-center justify-between gap-2">
                              <span
                                className={cx(
                                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-300',
                                  selected
                                    ? 'border-gold-500/45 bg-gold-500/15 text-gold-300'
                                    : 'border-line bg-void/60 text-ink-mid'
                                )}
                              >
                                <Icon className="h-4 w-4" aria-hidden="true" />
                              </span>

                              <span className="flex items-center gap-2">
                                {item.popular && (
                                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ember-300">
                                    Most booked
                                  </span>
                                )}
                                <span
                                  className={cx(
                                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-300',
                                    selected
                                      ? 'border-gold-400 bg-gold-400 text-void'
                                      : 'border-line'
                                  )}
                                >
                                  {selected && (
                                    <Check
                                      className="h-3 w-3"
                                      strokeWidth={3}
                                      aria-hidden="true"
                                    />
                                  )}
                                </span>
                              </span>
                            </span>

                            <span className="block">
                              <span className="block text-[13.5px] font-medium leading-snug text-ink-hi">
                                {item.title}
                              </span>
                              <span className="mt-1.5 line-clamp-2 block font-mono text-[11px] leading-snug text-ink-mid">
                                {item.subtitle}
                              </span>
                            </span>

                            <span className="mt-auto flex items-baseline justify-between gap-2 border-t border-line/70 pt-3">
                              <span className="font-display text-xl leading-none text-gold-300">
                                {usd0(item.basePriceUSD)}
                              </span>
                              <span className="font-mono text-[11px] text-ink-mid">
                                {item.durationHours}h base
                              </span>
                            </span>
                          </button>
                        </StaggerItem>
                      )
                    })}
                  </Stagger>
                </div>
              </Reveal>

              <div className="rule-fade" aria-hidden="true" />

              {/* ---- 02 · Shoot duration ---- */}
              <Reveal direction="up">
                <StepHeader
                  index={1}
                  id="pkg-step-duration"
                  title="Shoot duration"
                  hint={`Base day is ${baseHours} hours. Each hour past that adds ${usd0(quote.hourlyUplift)} — 12% of the base price — and covers crew, gear hold, and cards.`}
                />

                <div className="mt-6 rounded-2xl border border-line bg-panel/55 p-5 sm:p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <label
                      htmlFor="pkg-duration"
                      className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mid"
                    >
                      Hours on site
                    </label>
                    <p className="font-display text-3xl leading-none text-gold-300">
                      {totalHours}
                      <span className="ml-1.5 font-mono text-[13px] tracking-normal text-ink-mid">
                        hrs
                      </span>
                    </p>
                  </div>

                  <div className="py-4">
                    <input
                      id="pkg-duration"
                      type="range"
                      min={baseHours}
                      max={baseHours + MAX_EXTRA_HOURS}
                      step={1}
                      value={totalHours}
                      aria-valuetext={`${totalHours} hours on site`}
                      aria-describedby="pkg-duration-help"
                      onChange={(event) =>
                        setExtraHours(Number(event.target.value) - baseHours)
                      }
                      className="w-full cursor-pointer accent-gold-400"
                    />
                  </div>

                  <div
                    aria-hidden="true"
                    className="flex justify-between font-mono text-[11px] text-ink-mid"
                  >
                    <span>{baseHours}h base</span>
                    <span>{baseHours + MAX_EXTRA_HOURS / 2}h</span>
                    <span>{baseHours + MAX_EXTRA_HOURS}h max</span>
                  </div>

                  <p
                    id="pkg-duration-help"
                    className="mt-4 flex items-start gap-2 border-t border-line/70 pt-4 font-mono text-[11px] leading-relaxed text-ink-mid"
                  >
                    <Clock className="mt-px h-3.5 w-3.5 shrink-0 text-gold-500" aria-hidden="true" />
                    {extraHours === 0
                      ? 'Base day only. Overtime can still be added on the day at the same rate.'
                      : `${extraHours} extra ${extraHours === 1 ? 'hour' : 'hours'} at ${usd0(quote.hourlyUplift)} each.`}
                  </p>
                </div>
              </Reveal>

              <div className="rule-fade" aria-hidden="true" />

              {/* ---- 03 · Location ---- */}
              <Reveal direction="up">
                <StepHeader
                  index={2}
                  id="pkg-step-location"
                  title="Location"
                  hint="Our two owned stages carry no travel line. Estates and client venues add a fixed mobilisation fee that covers the production truck and permits."
                />

                <div className="mt-6">
                  <label
                    htmlFor="pkg-location"
                    className="mb-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mid"
                  >
                    Stage or venue
                  </label>

                  <div className="relative">
                    <select
                      id="pkg-location"
                      value={locationId}
                      onChange={(event) => setLocationId(event.target.value)}
                      className="w-full appearance-none rounded-2xl border border-line bg-panel/70 py-3.5 pl-4 pr-11 text-[14px] text-ink-hi transition-colors duration-300 hover:border-gold-500/40"
                    >
                      {LOCATIONS.map((item) => (
                        <option key={item.id} value={item.id} className="bg-panel text-ink-hi">
                          {item.name}
                          {item.extraFeeUSD > 0
                            ? ` — +${usd0(item.extraFeeUSD)}`
                            : ' — no travel fee'}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-400"
                      aria-hidden="true"
                    />
                  </div>

                  <p className="mt-3 flex items-start gap-2 text-[13px] leading-relaxed text-ink-mid">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-500" aria-hidden="true" />
                    <span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-mid">
                        {location.area}
                      </span>
                      <span className="mt-1 block">{location.description}</span>
                    </span>
                  </p>
                </div>
              </Reveal>

              <div className="rule-fade" aria-hidden="true" />

              {/* ---- 04 · Add-ons ---- */}
              <Reveal direction="up">
                <StepHeader
                  index={3}
                  id="pkg-step-addons"
                  title="Add-ons"
                  hint="Priced per production, not per day. Anything you leave off here can still be added up to 72 hours before the call time."
                />

                <div
                  role="group"
                  aria-labelledby="pkg-step-addons"
                  className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2"
                >
                  {GEAR_ADDONS.map((addon) => {
                    const selected = addonIds.includes(addon.id)

                    return (
                      <button
                        key={addon.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleAddon(addon.id)}
                        title={addon.description}
                        className={cx(
                          'flex min-h-[56px] w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left',
                          'transition-colors duration-300 ease-out',
                          selected
                            ? 'border-gold-500/70 bg-gold-500/[0.07]'
                            : 'border-line bg-panel/55 hover:border-gold-500/35 hover:bg-panel'
                        )}
                      >
                        <span
                          className={cx(
                            'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-300',
                            selected
                              ? 'border-gold-400 bg-gold-400 text-void'
                              : 'border-line text-ink-mid'
                          )}
                        >
                          {selected ? (
                            <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                          ) : (
                            <Plus className="h-3 w-3" aria-hidden="true" />
                          )}
                        </span>

                        <span
                          className={cx(
                            'min-w-0 flex-1 text-[13px] leading-snug transition-colors duration-300',
                            selected ? 'text-ink-hi' : 'text-ink-mid'
                          )}
                        >
                          {addon.name}
                        </span>

                        <span
                          className={cx(
                            'shrink-0 font-mono text-[12px] tabular-nums transition-colors duration-300',
                            selected ? 'text-gold-300' : 'text-ink-mid'
                          )}
                        >
                          +{usd0(addon.priceUSD)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </Reveal>
            </div>
          </div>

          {/* ------------------------------------------------------ quote -- */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
            <Reveal direction="up" delay={0.08}>
              <SpotlightCard
                radius={420}
                className="glass-strong rounded-3xl shadow-deep"
              >
                <BorderBeam duration={14} />

                <div className="relative p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <p className="eyebrow">Live quote</p>
                    <span className="font-mono text-[11px] tracking-wide text-ink-mid">
                      {quote.addonCount} add-on{quote.addonCount === 1 ? '' : 's'}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-2xl leading-snug text-ink-hi">
                    {category.title}
                  </h3>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[11px] text-ink-mid">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-gold-500" aria-hidden="true" />
                      {totalHours}h on site
                    </span>
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <MapPin className="h-3 w-3 shrink-0 text-gold-500" aria-hidden="true" />
                      <span className="truncate">{location.area}</span>
                    </span>
                  </div>

                  <div className="mt-6 rule-fade" aria-hidden="true" />

                  {/* Itemised rows */}
                  <div className="mt-2 divide-y divide-line/60">
                    {quote.lines.map((line) => (
                      <m.div
                        key={line.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, ease: EASE.outQuint }}
                        className="flex items-start justify-between gap-4 py-3"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] leading-snug text-ink-hi">
                            {line.label}
                          </span>
                          <span className="mt-1 block truncate font-mono text-[11px] tracking-wide text-ink-mid">
                            {line.note}
                          </span>
                        </span>
                        <span className="shrink-0 font-mono text-[13px] tabular-nums text-ink-hi">
                          {line.amount === 0 ? (
                            <span className="text-ink-mid">Included</span>
                          ) : (
                            usd0(line.amount)
                          )}
                        </span>
                      </m.div>
                    ))}
                  </div>

                  <div className="rule-fade" aria-hidden="true" />

                  {/* Subtotal + tax */}
                  <dl className="mt-4 space-y-2.5">
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mid">
                        Subtotal
                      </dt>
                      <dd className="font-mono text-[13px] tabular-nums text-ink-hi">
                        {usd0(quote.subtotal)}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-mid">
                        Sales tax · 8.875%
                      </dt>
                      <dd className="font-mono text-[13px] tabular-nums text-ink-mid">
                        {usd2(quote.tax)}
                      </dd>
                    </div>
                  </dl>

                  {/* Total */}
                  <div className="mt-7">
                    <p className="eyebrow">Total investment</p>
                    <p className="mt-2.5">
                      <AnimatedTotal
                        value={quote.total}
                        className="block font-display text-[2.5rem] leading-none tracking-[-0.02em] text-gradient-gold sm:text-5xl"
                      />
                      <span className="sr-only" aria-live="polite">
                        Total investment {usd2(quote.total)}
                      </span>
                    </p>
                  </div>

                  {/* Deposit */}
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-2xl border border-gold-500/25 bg-gold-500/[0.06] px-4 py-3">
                    <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-wide text-gold-200">
                      <Receipt className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      Deposit due today (25%)
                    </span>
                    <span className="ml-auto font-mono text-[13px] tabular-nums text-gold-200">
                      {usd0(quote.deposit)}
                    </span>
                  </div>

                  <Magnetic strength={10} className="mt-6 block">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full px-5 text-[14px] sm:px-8 sm:text-[15px]"
                      onClick={() => onNavigate('booking')}
                    >
                      Reserve this package
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </Magnetic>

                  <p className="mt-4 flex items-start gap-2 font-mono text-[11px] leading-relaxed tracking-wide text-ink-mid">
                    <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-gold-500" aria-hidden="true" />
                    Quote held for 14 days. Balance due on wrap, full commercial usage
                    rights included.
                  </p>
                </div>
              </SpotlightCard>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ----------------------------------------------------------- StepHeader -- */

interface StepHeaderProps {
  index: number
  id: string
  title: string
  hint: string
}

function StepHeader({ index, id, title, hint }: StepHeaderProps) {
  return (
    <>
      <div className="flex items-baseline gap-3">
        <span
          aria-hidden="true"
          className="font-mono text-[11px] tracking-[0.2em] text-gold-500"
        >
          {STEP_LABELS[index]}
        </span>
        <h3 id={id} className="font-display text-[22px] leading-tight text-ink-hi">
          {title}
        </h3>
      </div>
      <p className="mt-2.5 max-w-xl text-[14px] leading-relaxed text-ink-mid">{hint}</p>
    </>
  )
}
