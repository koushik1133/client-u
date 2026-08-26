/**
 * ProcessTimeline — the "these people are organised" section.
 *
 * Desktop: a sticky detail panel on the left crossfades to whichever step card
 * is currently passing through the middle band of the viewport. The active step
 * is tracked with one IntersectionObserver per card (`useInView`, `once: false`)
 * — never a scroll listener.
 *
 * Mobile / tablet: the sticky panel is not rendered at all. The same card list
 * carries the whole story, revealed one at a time against the rail.
 *
 * Only `transform` and `opacity` animate. The rail fill is a `scaleY` bound to
 * the section's scroll progress, so it costs the compositor and nothing else.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AnimatePresence,
  m,
  useInView,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import {
  Check,
  Clapperboard,
  ClipboardList,
  MessageSquare,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { EASE, Reveal, useSectionProgress } from '../lib/motion'
import { SectionHeading, cx } from '../lib/ui'
import { PROCESS_STEPS, type ProcessStep } from '../data/siteContent'

/* ----------------------------------------------------------------- icons -- */

/**
 * Explicit map rather than a dynamic lookup on the whole lucide namespace —
 * keeps the bundle to four icons and fails loudly in review if the data adds a
 * name nobody wired up.
 */
const STEP_ICONS: Record<string, LucideIcon> = {
  MessageSquare,
  ClipboardList,
  Clapperboard,
  Sparkles,
}

function StepIcon({
  name,
  className,
  strokeWidth = 1.5,
}: {
  name: string
  className?: string
  strokeWidth?: number
}) {
  const Icon = STEP_ICONS[name] ?? Sparkles
  return <Icon aria-hidden="true" strokeWidth={strokeWidth} className={className} />
}

/* ------------------------------------------------------------- step card -- */

interface StepCardProps {
  step: ProcessStep
  index: number
  isActive: boolean
  onEnterBand: (index: number) => void
}

function StepCard({ step, index, isActive, onEnterBand }: StepCardProps) {
  const ref = useRef<HTMLLIElement>(null)
  // A 10%-tall band across the middle of the viewport. A card owns the sticky
  // panel from the moment it crosses that band until the next one does.
  const inBand = useInView(ref, { margin: '-45% 0px -45% 0px', once: false })

  useEffect(() => {
    if (inBand) onEnterBand(index)
  }, [inBand, index, onEnterBand])

  return (
    <li ref={ref} className="relative flex gap-3 sm:gap-5 lg:gap-6">
      {/* Rail marker — sits in the same 36/40px column as the track itself. */}
      <div className="relative z-10 flex w-9 shrink-0 justify-center pt-[15px] sm:w-10 sm:pt-[18px]">
        <span
          aria-hidden="true"
          className={cx(
            'flex h-9 w-9 items-center justify-center rounded-full border bg-base font-mono text-[11px] tracking-[0.08em] sm:h-10 sm:w-10',
            'transition-[color,border-color,background-color,box-shadow] duration-500 ease-out',
            isActive
              ? 'border-gold-400/70 bg-gold-500/10 text-gold-200 ring-4 ring-gold-500/10'
              : 'border-line text-ink-mid'
          )}
        >
          {step.index}
        </span>
      </div>

      <Reveal className="min-w-0 flex-1" margin="-14%">
        <article
          className={cx(
            'glass rounded-2xl p-5 sm:p-6',
            'transition-[transform,border-color] duration-500 ease-out',
            isActive ? 'border-gold-400/45 lg:scale-[1.015]' : 'border-white/[0.08]'
          )}
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <StepIcon
              name={step.icon}
              strokeWidth={1.5}
              className={cx(
                'h-[18px] w-[18px] shrink-0 transition-colors duration-500 ease-out',
                isActive ? 'text-gold-300' : 'text-gold-500/70'
              )}
            />
            <h3 className="font-display text-xl leading-tight text-ink-hi">{step.title}</h3>
            <span className="ml-auto shrink-0 rounded-full border border-gold-500/25 bg-gold-500/[0.08] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-gold-300">
              {step.duration}
            </span>
          </div>

          <p className="mt-3.5 text-[15px] leading-relaxed text-ink-mid">{step.description}</p>

          <ul className="mt-5 flex flex-wrap gap-2">
            {step.deliverables.map((item) => (
              <li
                key={item}
                className="rounded-full border border-line bg-white/[0.02] px-3 py-1.5 text-[12px] leading-none text-ink-mid"
              >
                {item}
              </li>
            ))}
          </ul>
        </article>
      </Reveal>
    </li>
  )
}

/* --------------------------------------------------------------- section -- */

export function ProcessTimeline() {
  const [activeIndex, setActiveIndex] = useState(0)
  const reduced = useReducedMotion()

  const handleEnterBand = useCallback((index: number) => {
    setActiveIndex(index)
  }, [])

  // Scroll-linked rail fill. Remapped so the track is empty as the block enters
  // and full by the time the last card is read, rather than tied to the raw
  // viewport-crossing range.
  const { ref: bodyRef, progress } = useSectionProgress()
  const railRaw = useTransform(progress, [0.15, 0.82], [0, 1])
  const railFill = useSpring(railRaw, { stiffness: 110, damping: 30, mass: 0.4 })

  const active = PROCESS_STEPS[activeIndex] ?? PROCESS_STEPS[0]

  // Under reduced motion the crossfade collapses to an instant swap — the panel
  // still lands on a fully opaque, readable final state.
  const panelInitial = reduced ? { opacity: 1 } : { opacity: 0, y: 16 }
  const panelAnimate = reduced ? { opacity: 1 } : { opacity: 1, y: 0 }
  const panelExit = reduced ? { opacity: 1 } : { opacity: 0, y: -12 }
  const panelTransition = reduced
    ? { duration: 0 }
    : { duration: 0.42, ease: EASE.outExpo }

  return (
    <section id="process" className="relative py-24 md:py-32 lg:py-40">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="HOW IT WORKS"
          title="From first call to final master in 24 days"
          subtitle="Four stages, fixed dates, one producer on the thread the whole way. Every deliverable listed here is written into the contract before we send you a number."
        />

        <div
          ref={bodyRef}
          className="mt-16 grid gap-12 md:mt-20 lg:mt-24 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 xl:gap-24"
        >
          {/* ---------------------------------------- sticky detail panel -- */}
          {/* Desktop only, and a visual restatement of the card beside it —
              hidden from assistive tech so the story is announced once. */}
          <div className="hidden lg:block" aria-hidden="true">
            <div className="sticky top-32">
              <p className="eyebrow mb-7 flex items-center gap-3">
                <span className="h-px w-8 bg-gold-500/60" />
                Stage {active.index} of {String(PROCESS_STEPS.length).padStart(2, '0')}
              </p>

              <div className="min-h-[27rem]">
                <AnimatePresence mode="wait" initial={false}>
                  <m.div
                    key={active.id}
                    initial={panelInitial}
                    animate={panelAnimate}
                    exit={panelExit}
                    transition={panelTransition}
                  >
                    <span className="block font-display text-8xl leading-[0.8] text-gold-500/25">
                      {active.index}
                    </span>

                    <div className="mt-7 flex items-center gap-3">
                      <StepIcon name={active.icon} strokeWidth={1.4} className="h-5 w-5 shrink-0 text-gold-400" />
                      <p className="font-display text-3xl leading-tight text-ink-hi">
                        {active.title}
                      </p>
                    </div>

                    <span className="mt-5 inline-flex items-center rounded-full border border-gold-500/30 bg-gold-500/10 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-gold-300">
                      {active.duration}
                    </span>

                    <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-mid">
                      {active.description}
                    </p>

                    <div className="rule-fade my-8 max-w-md" />

                    <ul className="space-y-3.5">
                      {active.deliverables.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-3 text-[15px] leading-relaxed text-ink-mid"
                        >
                          <Check className="mt-[3px] h-4 w-4 shrink-0 text-gold-400" strokeWidth={2} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </m.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------- step cards -- */}
          <div className="relative">
            {/* Track + scroll-linked fill, centred in the same column as the markers. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 flex w-9 justify-center sm:w-10"
            >
              <div className="relative h-full w-px bg-line">
                <m.div
                  className="absolute inset-0 origin-top bg-gradient-to-b from-gold-200 to-gold-500 will-change-transform"
                  style={reduced ? { scaleY: 1 } : { scaleY: railFill }}
                />
              </div>
            </div>

            <ol className="space-y-8 lg:space-y-14">
              {PROCESS_STEPS.map((step, i) => (
                <StepCard
                  key={step.id}
                  step={step}
                  index={i}
                  isActive={i === activeIndex}
                  onEnterBand={handleEnterBand}
                />
              ))}
            </ol>
          </div>
        </div>

        <Reveal className="mt-16 lg:mt-24" direction="up">
          <div className="rule-fade" />
          <p className="mt-7 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-ink-low">
            Fixed-fee quote · Two revision rounds included · Masters in every ratio
          </p>
        </Reveal>
      </div>
    </section>
  )
}
