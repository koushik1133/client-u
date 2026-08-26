/**
 * HeroSection — the opening frame.
 *
 * One wide still, buried under a two-axis scrim so the left-aligned type never
 * fights the image. Everything that moves here moves on `transform` / `opacity`
 * only: the backdrop drifts via <Parallax>, the headline arrives word by word
 * via <TextReveal>, and the whole block fades and sinks as the section leaves
 * the viewport (a single useScroll pass, no scroll listeners).
 *
 * Entrance choreography is `initial` + `animate` rather than `whileInView` —
 * the hero is already on screen at mount, so an intersection observer would
 * either fire instantly or, worse, race the first paint.
 */

import { useRef } from 'react'
import { m, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import { EASE, Parallax, TextReveal } from '../lib/motion'
import { Button, Img } from '../lib/ui'

/** Wide cinema still. `<Img>` rewrites this to a WebP srcset at render time. */
const BACKDROP_SRC = 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4'

const CREDENTIALS = ['Emmy Award 2024', 'Cannes Lion', '480+ Productions']

interface HeroSectionProps {
  onNavigate: (sectionId: string) => void
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  // Progress from "hero pinned to the top of the viewport" (0) to "hero fully
  // scrolled past" (1). Drives the exit, so the hero hands off to the next
  // section instead of sliding away as a solid slab.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.62], [1, 0])
  const y = useTransform(scrollYProgress, [0, 1], [0, 80])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.965])

  const driftOut = reduced ? undefined : { opacity, y, scale }
  const fadeOut = reduced ? undefined : { opacity }

  /**
   * Shared mount transition. One shape in both branches so the spread stays
   * cleanly typed, and a zero-length tween under reduced motion.
   */
  const enter = (delay: number) => ({
    initial: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 24 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduced ? 0 : 0.95,
      delay: reduced ? 0 : delay,
      ease: EASE.outExpo,
    },
  })

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="grain relative isolate flex min-h-[100svh] items-center overflow-hidden"
    >
      {/* ------------------------------------------------------- backdrop -- */}
      {/* Overscanned by 6rem top and bottom so the parallax drift never
          exposes an edge. `grid` makes the <Parallax> inner layer a stretched
          grid item, which is what gives the image a definite height to fill. */}
      <Parallax distance={80} className="absolute inset-x-0 -inset-y-24 grid overflow-hidden">
        <Img
          priority
          ratio="16/9"
          src={BACKDROP_SRC}
          alt="Cinema camera crew lining up a wide shot on a night exterior set"
          sizes="100vw"
          className="h-full min-h-[calc(100svh_+_12rem)] w-full"
          imgClassName="object-cover"
          style={{ backgroundColor: 'var(--color-void)' }}
        />
      </Parallax>

      {/* Vertical scrim: sinks the still into the page background at the base. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-base/70 via-base/50 to-base"
      />
      {/* Horizontal scrim: keeps the left-aligned column legible over any frame. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-base via-base/60 to-transparent"
      />
      {/* Extra weight under the fixed navbar. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-base/85 to-transparent"
      />

      {/* Viewfinder corner marks — the one decorative flourish in the section. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-8 hidden lg:block">
        <span className="absolute left-0 top-0 h-6 w-6 border-l border-t border-white/[0.09]" />
        <span className="absolute right-0 top-0 h-6 w-6 border-r border-t border-white/[0.09]" />
        <span className="absolute bottom-0 left-0 h-6 w-6 border-b border-l border-white/[0.09]" />
        <span className="absolute bottom-0 right-0 h-6 w-6 border-b border-r border-white/[0.09]" />
      </div>

      {/* -------------------------------------------------------- content -- */}
      <m.div
        style={driftOut}
        className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-24 pt-28 sm:px-8 sm:pb-32 sm:pt-32 lg:px-12 lg:pb-40 lg:pt-40"
      >
        <div className="text-center lg:text-left">
          {/* 1 — availability ------------------------------------------- */}
          <m.div {...enter(0.1)} className="flex justify-center lg:justify-start">
            <span className="inline-flex max-w-full items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-sm">
              <span className="relative flex h-2 w-2 shrink-0 items-center justify-center">
                <span
                  aria-hidden="true"
                  className="pulse-ring absolute -inset-[3px] rounded-full bg-gold-400/30"
                />
                <span className="relative h-2 w-2 rounded-full bg-gold-400" />
              </span>
              <span className="font-mono text-[11px] uppercase leading-[1.55] tracking-[0.1em] text-ink-mid sm:tracking-[0.16em]">
                Booking Q3 2026 <span className="text-ink-low">·</span> 3 dates left in{' '}
                <span className="whitespace-nowrap text-gold-200">Los Angeles</span>
              </span>
            </span>
          </m.div>

          {/* 2 — headline ----------------------------------------------- */}
          {/* Each line is its own block. TextReveal clips every word to its own
              line box, so the blocks carry a leading that clears the descender
              in "everyone"; the negative margin puts the two baselines back at
              the 0.92em rhythm on desktop, where neither line ever wraps. */}
          <h1 className="mt-8 font-display text-[length:var(--text-display-lg)] font-normal leading-[0.92] tracking-[-0.025em] text-ink-hi">
            <span className="block leading-[1.28]">
              <TextReveal text="We shoot the frame" delay={0.2} />
            </span>
            <span className="block leading-[1.28] lg:-mt-[0.36em]">
              <TextReveal text="everyone" delay={0.34} />{' '}
              <TextReveal
                text="remembers."
                delay={0.42}
                wordClassName="text-gradient-gold"
              />
            </span>
          </h1>

          {/* 3 — deck ---------------------------------------------------- */}
          <m.p
            {...enter(0.5)}
            className="mx-auto mt-6 max-w-xl text-[16px] leading-relaxed text-ink-mid sm:text-[17px] lg:mx-0 lg:mt-7"
          >
            Dual-recorded 8K RAW, graded frame by frame. An Emmy and a Cannes Lion on the
            shelf, a crew that works between Los Angeles, New York and Miami, and a teaser
            cut in your hands 38 hours after wrap.
          </m.p>

          {/* 4 — CTAs ---------------------------------------------------- */}
          <m.div
            {...enter(0.7)}
            className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4 lg:mt-10 lg:justify-start"
          >
            <Button
              size="lg"
              magnetic
              className="w-full sm:w-auto"
              onClick={() => onNavigate('booking')}
            >
              Book a Shoot
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => onNavigate('work')}
            >
              <Play className="h-4 w-4 fill-current" aria-hidden="true" />
              Watch the Reel
            </Button>
          </m.div>

          {/* 5 — credentials --------------------------------------------- */}
          <m.div {...enter(0.9)} className="mx-auto mt-12 max-w-xl lg:mx-0 lg:mt-14">
            <div className="rule-fade" aria-hidden="true" />
            <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-mid lg:justify-start lg:gap-x-7">
              {CREDENTIALS.map((credential, i) => (
                <li key={credential} className="flex items-center gap-x-5 lg:gap-x-7">
                  {i > 0 ? (
                    <span aria-hidden="true" className="hidden h-2.5 w-px bg-white/15 lg:block" />
                  ) : null}
                  {credential}
                </li>
              ))}
            </ul>
          </m.div>
        </div>
      </m.div>

      {/* ------------------------------------------------------ scroll cue -- */}
      <m.div
        aria-hidden="true"
        style={fadeOut}
        className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center"
      >
        <m.div {...enter(1.15)} className="flex flex-col items-center gap-3">
          <span className="float-soft flex h-9 w-[22px] justify-center rounded-full border border-white/20 pt-2">
            <span className="h-2 w-px rounded-full bg-gold-300" />
          </span>
          <span className="pl-[0.16em] font-mono text-[11px] uppercase tracking-[0.3em] text-ink-low">
            Scroll
          </span>
        </m.div>
      </m.div>
    </section>
  )
}
