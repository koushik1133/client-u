/**
 * StatsBand — the four-up metric band that sits between the work grid and the
 * process section.
 *
 * Design intent: a quiet rule-to-rule band, not a card row. The numbers do the
 * talking, so there is no heading, no panel, no icon — just a hairline above
 * and below, generous air, and four columns separated by vertical hairlines on
 * desktop. Never collapses to one column: two-up on phones keeps the band
 * reading as a band rather than a list.
 *
 * Markup is a real `<dl>` (term / description pairs) with the visual order
 * flipped by flex `order`, so the value reads first on screen while the DOM
 * still announces "Productions Delivered, 480+, Since 2011".
 *
 * Motion: one `<Stagger>` observer cascades the four columns; each figure is a
 * shared `<Counter>`, which owns its own in-view trigger and already collapses
 * to the final value under `prefers-reduced-motion`. Transform and opacity only.
 */

import { Counter, Stagger, StaggerItem } from '../lib/motion'
import { cx } from '../lib/ui'
import { STUDIO_STATS } from '../data/siteContent'

export function StatsBand() {
  return (
    <section aria-label="Studio by the numbers" className="relative py-20 md:py-24">
      {/* Hairline rules top and bottom — the only framing the band gets. */}
      <div aria-hidden="true" className="rule-fade absolute inset-x-0 top-0" />
      <div aria-hidden="true" className="rule-fade absolute inset-x-0 bottom-0" />

      {/* Barely-there vertical wash so the band lifts off the page ground. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent"
      />

      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <Stagger
          as="dl"
          gap={0.08}
          className="grid grid-cols-2 gap-8 gap-y-10 md:gap-6 md:gap-y-14 lg:grid-cols-4"
        >
          {STUDIO_STATS.map((stat, i) => (
            <StaggerItem
              key={stat.id}
              className={cx(
                'flex min-w-0 flex-col',
                // Dividers are lg-only: both the border width and its colour are
                // scoped to the breakpoint, so the two-column phone layout never
                // picks up a stray hairline. Left padding matches the 24px grid
                // gap, which centres each rule in its gutter.
                i > 0 && 'lg:border-l lg:border-white/[0.06] lg:pl-6'
              )}
            >
              {/* order-2 — the label sits under the figure visually. */}
              <dt className="order-2 mt-5 text-[13px] leading-snug font-medium text-ink-hi">
                {stat.label}
              </dt>

              {/* order-1 — the figure. Counter and suffix share one gradient run
                  and one baseline because both are inline inside this box.
                  `w-fit` matters: .text-gradient-gold maps its ramp across the
                  element box, so a full-width box would hand "27" a paler slice
                  than "480+". Hugging the text makes all four figures render the
                  identical gold ramp. */}
              <dd className="order-1 w-fit font-display text-5xl leading-none tracking-[-0.02em] whitespace-nowrap text-gradient-gold md:text-6xl">
                <Counter to={stat.value} decimals={stat.decimals ?? 0} className="tabular-nums" />
                {stat.suffix}
              </dd>

              <dd className="order-3 mt-1.5 font-mono text-[11px] leading-relaxed text-ink-low">
                {stat.detail}
              </dd>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
