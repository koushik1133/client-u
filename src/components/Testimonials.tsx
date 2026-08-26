/**
 * Testimonials — the social-proof band that sits immediately before the final
 * CTA, which is where evaluated-purchase research says it converts hardest.
 *
 * Design notes:
 *  - Two `<Marquee>` rows running in opposite directions at 60s / 70s. The
 *    speeds are deliberately coprime-ish so the two lines never visually sync
 *    into a single moving block; the eye reads them as an ambient wall of
 *    voices rather than a carousel it has to keep up with.
 *  - The rows are full-bleed (outside the max-w-7xl container) so the CSS mask
 *    baked into `.marquee` can fade both ends into the page ground instead of
 *    hard-cutting at a container edge.
 *  - `<Marquee>` owns the overflow, so the fixed-width cards can be wider than
 *    a 320px viewport without ever producing page-level horizontal scroll. It
 *    also mounts the second copy of the children with `aria-hidden`, so a
 *    screen reader hears each quote exactly once, and it collapses to a plain
 *    horizontally scrollable row under `prefers-reduced-motion`.
 *  - Cards use `self-stretch` so every card in a row shares the tallest card's
 *    height, and the attribution block is pushed to the bottom by a `flex-1`
 *    quote. Long quotes are never clamped — the card grows, the row grows, and
 *    all footers still land on the same baseline.
 *
 * Motion: two `<Reveal>` observers (one per row) plus one for the aggregate
 * line. Transform and opacity only; the marquee itself is a pure CSS transform
 * keyframe. Nothing here listens to scroll.
 */

import { Quote, Star } from 'lucide-react'
import { TESTIMONIALS, type Testimonial } from '../data/siteContent'
import { Reveal } from '../lib/motion'
import { Img, Marquee, SectionHeading, cx } from '../lib/ui'

/** Split once at module scope — the data is static, so this never re-runs. */
const ROW_TOP = TESTIMONIALS.slice(0, 3)
const ROW_BOTTOM = TESTIMONIALS.slice(3)

/* ------------------------------------------------------------- star row -- */

interface StarsProps {
  /** Number of filled stars to draw. */
  count: number
  className?: string
  /**
   * Announced to assistive tech as a single string. Omit it when a nearby
   * text node already states the rating — the row then goes fully decorative.
   */
  label?: string
}

function Stars({ count, className, label }: StarsProps) {
  const stars = Array.from({ length: count }, (_, i) => i)

  return (
    <div
      className={cx('flex items-center gap-1', className)}
      // An aria-label on a generic div is ignored by most screen readers, so
      // role="img" is what turns the row into one labelled graphic.
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {stars.map((i) => (
        <Star
          key={i}
          aria-hidden="true"
          strokeWidth={1.5}
          className="h-3.5 w-3.5 fill-gold-400 text-gold-400"
        />
      ))}
    </div>
  )
}

/* ----------------------------------------------------------- quote card -- */

function QuoteCard({ testimonial }: { testimonial: Testimonial }) {
  const { quote, author, role, company, avatar, rating } = testimonial

  return (
    <figure
      className={cx(
        'group/card glass relative mx-3 flex w-[340px] shrink-0 self-stretch flex-col',
        'overflow-hidden rounded-2xl p-6 sm:w-[400px]',
        'transition-colors duration-500 ease-out hover:border-gold-400/25'
      )}
    >
      {/* Decorative pull-quote glyph. Thin stroke at low opacity reads as an
          engraved mark rather than a sticker; it warms a touch on hover. */}
      <Quote
        aria-hidden="true"
        strokeWidth={1.25}
        className="pointer-events-none absolute -top-1 right-4 h-14 w-14 text-gold-400/15 transition-colors duration-500 ease-out group-hover/card:text-gold-400/30"
      />

      <Stars count={rating} label={`${rating} out of 5 stars`} className="relative" />

      {/* flex-1 keeps the attribution pinned to the bottom of an equal-height
          card no matter how long the quote runs. */}
      <blockquote className="relative mt-5 flex-1 text-[14px] leading-relaxed text-ink-mid">
        {quote}
      </blockquote>

      <figcaption className="mt-6 flex items-center gap-3 border-t border-white/[0.07] pt-5">
        <Img
          src={avatar}
          alt=""
          ratio="1/1"
          sizes="44px"
          className="h-11 w-11 shrink-0 rounded-full"
        />
        <div className="min-w-0">
          <div className="text-[14px] leading-snug font-medium text-ink-hi">{author}</div>
          <div className="mt-0.5 text-[12px] leading-snug text-ink-low">
            {role} · {company}
          </div>
        </div>
      </figcaption>
    </figure>
  )
}

/* ---------------------------------------------------------------- section -- */

export function Testimonials() {
  return (
    <section id="voices" aria-label="Client testimonials" className="relative py-24 md:py-32 lg:py-40">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="CLIENT VOICES"
          title="What the people who signed the cheque said"
          subtitle="Six of the 312 reviews on file. Nothing trimmed, nothing anonymized — every name here approved the quote next to it."
        />
      </div>

      {/* Full-bleed rows: the marquee mask needs the viewport edge to fade into. */}
      <div className="mt-14 md:mt-20">
        <Reveal direction="up" duration={0.7} margin="-8%">
          <Marquee speed={60} className="py-1">
            {ROW_TOP.map((testimonial) => (
              <QuoteCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </Marquee>
        </Reveal>

        <Reveal direction="up" duration={0.7} delay={0.08} margin="-8%" className="mt-5 md:mt-6">
          <Marquee speed={70} reverse className="py-1">
            {ROW_BOTTOM.map((testimonial) => (
              <QuoteCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </Marquee>
        </Reveal>
      </div>

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <Reveal direction="up" delay={0.1} margin="-6%" className="mt-14 md:mt-16">
          {/* A <div>, not a <p> — the star row is a div, and phrasing content
              is all a paragraph may legally hold. */}
          <div className="flex flex-col items-center justify-center gap-2.5 text-center sm:flex-row sm:gap-3">
            <Stars count={5} className="shrink-0" />
            <p className="text-[13px] leading-relaxed text-ink-mid">
              <span className="font-medium text-ink-hi">4.9 out of 5</span> from 312 verified
              client reviews
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
