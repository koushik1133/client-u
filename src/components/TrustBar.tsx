/**
 * TrustBar — the credibility band that sits directly beneath the hero.
 *
 * Design notes:
 *  - Wordmarks are rendered as *text*, not images, so the band costs zero
 *    network requests and stays perfectly crisp at any density.
 *  - `<Marquee>` already mounts two copies of its children and marks the
 *    second one `aria-hidden`, so the loop is seamless and screen readers
 *    hear the client list exactly once. No duplicate is added here.
 *  - The whole band is ~157px tall on a 320px viewport (1px rule + 48px pad
 *    + 11px label + 20px gap + 28px marquee line + 48px pad + 1px rule),
 *    which keeps it slim enough to sit under the hero without stealing the
 *    fold.
 *  - The letter-spaced label and wordmarks carry a matching `text-indent`
 *    so the trailing tracking space does not push the optical centre left.
 */

import { CLIENT_LOGOS } from '../data/siteContent'
import { Reveal } from '../lib/motion'
import { Marquee } from '../lib/ui'

const LABEL_ID = 'trust-bar-label'

export function TrustBar() {
  return (
    <Reveal direction="up" duration={0.7} margin="-6%">
      <section
        aria-labelledby={LABEL_ID}
        className="border-y border-white/[0.06] bg-void/40 py-12 overflow-hidden"
      >
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
          <p
            id={LABEL_ID}
            className="text-center font-mono text-[11px] leading-none tracking-[0.24em] text-ink-low uppercase [text-indent:0.24em]"
          >
            Trusted by the brands you already know
          </p>
        </div>

        <Marquee speed={45} className="mt-5">
          {CLIENT_LOGOS.map((wordmark) => (
            <span
              key={wordmark}
              className="shrink-0 px-10 font-display text-xl tracking-[0.18em] whitespace-nowrap text-ink-low/70 transition-colors duration-300 ease-out select-none hover:text-ink-hi md:text-2xl [text-indent:0.18em]"
            >
              {wordmark}
            </span>
          ))}
        </Marquee>
      </section>
    </Reveal>
  )
}
