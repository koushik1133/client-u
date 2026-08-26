import { useState, type FormEvent, type SVGProps } from 'react'
import { Aperture } from 'lucide-react'
import { SHOOT_CATEGORIES } from '../data/mockData'
import { STUDIO_LOCATIONS } from '../data/siteContent'
import { Stagger, StaggerItem } from '../lib/motion'
import { Button, cx } from '../lib/ui'

interface FooterProps {
  onNavigate: (sectionId: string) => void
}

/* lucide-react 1.x dropped brand icons, so the four social marks are inline
   SVGs drawn on the same 24px / 2px-stroke grid lucide uses. */
type IconProps = SVGProps<SVGSVGElement>

const iconBase: IconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

function InstagramIcon(props: IconProps) {
  return (
    <svg {...iconBase} {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function YoutubeIcon(props: IconProps) {
  return (
    <svg {...iconBase} {...props}>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  )
}

function LinkedinIcon(props: IconProps) {
  return (
    <svg {...iconBase} {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function XIcon(props: IconProps) {
  return (
    <svg {...iconBase} {...props}>
      <path d="m4 4 16 16" />
      <path d="M20 4 4 20" />
    </svg>
  )
}

const SOCIALS = [
  { id: 'instagram', label: 'CP Studios on Instagram', icon: InstagramIcon },
  { id: 'youtube', label: 'CP Studios on YouTube', icon: YoutubeIcon },
  { id: 'linkedin', label: 'CP Studios on LinkedIn', icon: LinkedinIcon },
  { id: 'twitter', label: 'CP Studios on X', icon: XIcon },
] as const

const STUDIO_LINKS = [
  { id: 'work', label: 'Selected Work' },
  { id: 'services', label: 'Services' },
  { id: 'process', label: 'How It Works' },
  { id: 'studio', label: 'Gear & Crew' },
] as const

const LEGAL_LINKS = ['Privacy', 'Terms', 'Accessibility'] as const

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function Footer({ onNavigate }: FooterProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!EMAIL_RE.test(trimmed)) {
      setError('Enter a valid email address.')
      return
    }
    setError(null)
    setSubscribed(true)
  }

  return (
    <footer className="border-t border-white/[0.07] bg-void pb-10 pt-20">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <Stagger className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <StaggerItem>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-400 to-ember-500 text-[#0a0a0a]">
                <Aperture className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-display text-lg font-semibold leading-none text-ink-hi">
                  CP
                </span>
                <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.3em] text-ink-low">
                  Studios
                </span>
              </span>
            </div>
            <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-ink-mid">
              An award-winning US cinema house shooting 8K commercials, luxury wedding films
              and editorial fashion campaigns. Los Angeles born, coast to coast.
            </p>
            <ul className="mt-6 flex items-center gap-2">
              {SOCIALS.map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <a
                    href="#"
                    rel="noreferrer"
                    aria-label={label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-ink-mid transition-colors duration-300 hover:border-gold-400/60 hover:text-gold-300"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </StaggerItem>

          {/* Studio nav */}
          <StaggerItem>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.24em] text-gold-400">
              Studio
            </h3>
            <ul className="mt-5 space-y-3">
              {STUDIO_LINKS.map(({ id, label }) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(id)}
                    className="text-[14px] text-ink-mid transition-colors duration-300 hover:text-gold-300"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </StaggerItem>

          {/* Services */}
          <StaggerItem>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.24em] text-gold-400">
              Services
            </h3>
            <ul className="mt-5 space-y-3">
              {SHOOT_CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate('services')}
                    className="text-left text-[14px] text-ink-mid transition-colors duration-300 hover:text-gold-300"
                  >
                    {cat.title}
                  </button>
                </li>
              ))}
            </ul>
          </StaggerItem>

          {/* Locations */}
          <StaggerItem>
            <h3 className="font-mono text-[11px] uppercase tracking-[0.24em] text-gold-400">
              Locations
            </h3>
            <ul className="mt-5 space-y-5">
              {STUDIO_LOCATIONS.map((loc) => (
                <li key={loc.city}>
                  <p className="flex items-center gap-2 text-[14px] font-medium text-ink-hi">
                    {loc.city}
                    {loc.primary && (
                      <span className="rounded-full bg-gold-400/15 px-2 py-0.5 font-mono text-[9px] tracking-[0.2em] text-gold-300">
                        HQ
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-low">{loc.address}</p>
                  <a
                    href={`tel:${loc.phone.replace(/[^+\d]/g, '')}`}
                    className="mt-0.5 inline-block font-mono text-[12px] text-ink-mid transition-colors duration-300 hover:text-gold-300"
                  >
                    {loc.phone}
                  </a>
                </li>
              ))}
            </ul>
          </StaggerItem>
        </Stagger>

        {/* Newsletter */}
        <div className="mt-16 rounded-2xl border border-white/[0.07] bg-raise/60 p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-display text-lg text-ink-hi">Behind the lens, monthly.</p>
              <p className="mt-1 text-[13px] text-ink-mid">
                One email a month — lighting breakdowns, gear tests and open shoot dates.
              </p>
            </div>

            {subscribed ? (
              <p className="text-[14px] font-medium text-gold-300" role="status">
                You&apos;re on the list. First issue lands next month.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} noValidate className="w-full max-w-md">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                    <label
                      htmlFor="footer-email"
                      className="mb-1.5 block text-[12px] font-medium text-ink-mid"
                    >
                      Email address
                    </label>
                    <input
                      id="footer-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (error) setError(null)
                      }}
                      placeholder="you@company.com"
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? 'footer-email-error' : undefined}
                      className={cx(
                        'h-11 w-full rounded-full border bg-base/80 px-5 text-[14px] text-ink-hi placeholder:text-ink-low',
                        error ? 'border-ember-500/70' : 'border-white/10 focus:border-gold-400/60'
                      )}
                    />
                    {error && (
                      <p id="footer-email-error" role="alert" className="mt-1.5 text-[12px] text-ember-400">
                        {error}
                      </p>
                    )}
                  </div>
                  <div className="sm:pt-[26px]">
                    <Button type="submit" className="w-full sm:w-auto">
                      Subscribe
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="rule-fade mt-12" aria-hidden="true" />
        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-[12px] text-ink-low">
            © 2026 CP Studios. All rights reserved.
          </p>
          <ul className="flex items-center gap-6">
            {LEGAL_LINKS.map((label) => (
              <li key={label}>
                <a
                  href="#"
                  className="text-[12px] text-ink-low transition-colors duration-300 hover:text-ink-hi"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
