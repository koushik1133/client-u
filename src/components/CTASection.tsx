import { BadgeCheck, Clock, ShieldCheck } from 'lucide-react'
import { Parallax, Reveal, TextReveal } from '../lib/motion'
import { Button, Img } from '../lib/ui'

interface CTASectionProps {
  onNavigate: (sectionId: string) => void
}

const REASSURANCES = [
  { id: 'fixed', icon: ShieldCheck, label: 'Fixed-fee quote' },
  { id: 'teaser', icon: Clock, label: '48-hour teaser' },
  { id: 'insured', icon: BadgeCheck, label: 'Fully insured & permitted' },
] as const

/** Final climax CTA — the last ask before the footer. */
export function CTASection({ onNavigate }: CTASectionProps) {
  return (
    <section className="grain relative overflow-hidden py-28 md:py-36" aria-labelledby="cta-heading">
      <div className="rule-fade absolute inset-x-0 top-0" aria-hidden="true" />

      {/* Cinematic backdrop behind a heavy scrim */}
      <div className="absolute inset-0" aria-hidden="true">
        <Parallax distance={50} className="h-full">
          <Img
            src="https://images.unsplash.com/photo-1485846234645-a62644f84728"
            alt=""
            ratio="16/9"
            sizes="100vw"
            className="h-[130%] min-h-full w-full bg-void"
            imgClassName="object-cover"
          />
        </Parallax>
        <div className="absolute inset-0 bg-base/85" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(42rem 26rem at 50% 45%, rgb(224 168 46 / 0.14), transparent 68%)',
          }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-3xl px-5 text-center sm:px-8">
        <Reveal>
          <p className="eyebrow mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold-500/60" aria-hidden="true" />
            NEXT AVAILABLE BLOCK
            <span className="h-px w-8 bg-gold-500/60" aria-hidden="true" />
          </p>
        </Reveal>

        <h2
          id="cta-heading"
          className="font-display text-[length:var(--text-display-md)] leading-[1.05] text-ink-hi"
        >
          <TextReveal text="Your story deserves a crew that shows up two hours early." />
        </h2>

        <Reveal delay={0.25}>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-ink-mid">
            Lock a date in under two minutes. You get a fixed quote on the first call, a
            storyboard before we load a single case, and a graded teaser 48 hours after wrap.
          </p>
        </Reveal>

        <Reveal delay={0.4}>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" magnetic onClick={() => onNavigate('booking')}>
              Book a Shoot
            </Button>
            <Button size="lg" variant="outline" onClick={() => onNavigate('booking')}>
              Talk to a director
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.55}>
          <ul className="mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
            {REASSURANCES.map(({ id, icon: Icon, label }) => (
              <li key={id} className="flex items-center gap-2 text-[13px] text-ink-mid">
                <Icon className="h-4 w-4 text-gold-400" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
