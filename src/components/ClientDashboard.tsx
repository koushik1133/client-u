import { useMemo, useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import {
  Calendar,
  ChevronDown,
  Download,
  Film,
  ImageIcon,
  Lock,
  MapPin,
  Wallet,
} from 'lucide-react'
import type { Booking, User } from '../types/flashCinema'
import { Reveal } from '../lib/motion'
import { Button, Img, SectionHeading, cx } from '../lib/ui'

interface ClientDashboardProps {
  user: User | null
  userBookings: Booking[]
  onOpenAuthModal: () => void
  onNavigate: (sectionId: string) => void
}

/* -------------------------------------------------------------- status -- */

const STATUS_ORDER: Booking['status'][] = [
  'booked',
  'pre-production',
  'shoot-day',
  'color-grading',
  'delivered',
]

const STATUS_META: Record<Booking['status'], { label: string; chip: string }> = {
  booked: { label: 'Booked', chip: 'bg-white/[0.08] text-ink-mid' },
  'pre-production': { label: 'Pre-Production', chip: 'bg-gold-400/15 text-gold-300' },
  'shoot-day': { label: 'Shoot Day', chip: 'bg-ember-500/15 text-ember-300' },
  'color-grading': { label: 'Color Grading', chip: 'bg-gold-400/15 text-gold-300' },
  delivered: { label: 'Delivered', chip: 'bg-gold-400/20 text-gold-200' },
}

const PROOF_STATUS: Record<string, { label: string; chip: string }> = {
  draft: { label: 'Draft', chip: 'bg-white/[0.08] text-ink-mid' },
  approved: { label: 'Approved', chip: 'bg-gold-400/15 text-gold-300' },
  'revision-requested': { label: 'Revision requested', chip: 'bg-ember-500/15 text-ember-300' },
}

const USD = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function formatDateLong(iso: string): string {
  const [y, mo, d] = iso.split('-').map(Number)
  if (!y || !mo || !d) return iso
  return new Date(y, mo - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/* ------------------------------------------------------- progress rail -- */

function ProgressRail({ status }: { status: Booking['status'] }) {
  const activeIndex = STATUS_ORDER.indexOf(status)
  return (
    <div
      className="mt-4"
      role="img"
      aria-label={`Production stage ${activeIndex + 1} of 5: ${STATUS_META[status].label}`}
    >
      <div className="flex items-center">
        {STATUS_ORDER.map((stage, i) => (
          <div key={stage} className={cx('flex items-center', i > 0 && 'flex-1')}>
            {i > 0 && (
              <span
                className={cx(
                  'h-px flex-1',
                  i <= activeIndex ? 'bg-gold-400/70' : 'bg-white/[0.1]'
                )}
                aria-hidden="true"
              />
            )}
            <span
              className={cx(
                'mx-0.5 h-2.5 w-2.5 shrink-0 rounded-full border',
                i <= activeIndex
                  ? 'border-gold-400 bg-gold-400'
                  : 'border-white/20 bg-transparent'
              )}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>
      <div className="mt-2 hidden justify-between sm:flex">
        {STATUS_ORDER.map((stage, i) => (
          <span
            key={stage}
            className={cx(
              'font-mono text-[9px] uppercase tracking-[0.12em]',
              i <= activeIndex ? 'text-gold-400' : 'text-ink-low'
            )}
          >
            {STATUS_META[stage].label}
          </span>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------- booking card -- */

function BookingCard({ booking }: { booking: Booking }) {
  const [expanded, setExpanded] = useState(false)
  const bodyId = `booking-body-${booking.id}`
  const meta = STATUS_META[booking.status]

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={bodyId}
        className="w-full px-5 py-5 text-left transition-colors duration-300 hover:bg-white/[0.02] sm:px-6"
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="font-mono text-[11px] tracking-[0.14em] text-gold-400">
            {booking.id}
          </span>
          <span className={cx('rounded-full px-2.5 py-1 text-[11px] font-medium', meta.chip)}>
            {meta.label}
          </span>
          <span className="ml-auto flex items-center gap-2 text-ink-mid">
            <span className="font-display text-lg text-ink-hi">{USD(booking.totalUSD)}</span>
            <ChevronDown
              className={cx(
                'h-4 w-4 transition-transform duration-300',
                expanded && 'rotate-180'
              )}
              aria-hidden="true"
            />
          </span>
        </div>

        <p className="mt-2.5 font-display text-xl text-ink-hi">{booking.category.title}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12px] text-ink-mid">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-gold-500" aria-hidden="true" />
            {formatDateLong(booking.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-gold-500" aria-hidden="true" />
            {booking.location.name}
          </span>
        </div>

        <ProgressRail status={booking.status} />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <m.div
            id={bodyId}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="border-t border-white/[0.07] px-5 py-5 sm:px-6"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-low">
                  Schedule
                </h4>
                <p className="mt-2 text-[13px] text-ink-hi">{booking.convertedTime}</p>
                <p className="mt-0.5 text-[12px] text-ink-mid">
                  {booking.clientTimezone.name}
                </p>

                {booking.selectedAddons.length > 0 && (
                  <>
                    <h4 className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-low">
                      Add-ons
                    </h4>
                    <ul className="mt-2 space-y-1.5">
                      {booking.selectedAddons.map((addon) => (
                        <li
                          key={addon.id}
                          className="flex items-center justify-between text-[13px] text-ink-mid"
                        >
                          {addon.name}
                          <span className="font-mono text-[12px] text-ink-hi">
                            {USD(addon.priceUSD)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              <div>
                <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-low">
                  Investment
                </h4>
                <dl className="mt-2 space-y-1.5 text-[13px]">
                  <div className="flex justify-between text-ink-mid">
                    <dt>Subtotal</dt>
                    <dd className="font-mono">{USD(booking.subtotalUSD)}</dd>
                  </div>
                  <div className="flex justify-between text-ink-mid">
                    <dt>Tax</dt>
                    <dd className="font-mono">
                      {booking.taxUSD.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      })}
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-white/[0.07] pt-1.5 font-medium text-ink-hi">
                    <dt>Total</dt>
                    <dd className="font-mono">
                      {booking.totalUSD.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      })}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {booking.proofMedia && booking.proofMedia.length > 0 && (
              <div className="mt-6">
                <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-low">
                  Proofs for review
                </h4>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  {booking.proofMedia.map((proof) => {
                    const pMeta = PROOF_STATUS[proof.status] ?? PROOF_STATUS.draft
                    return (
                      <div
                        key={proof.id}
                        className="overflow-hidden rounded-xl border border-white/[0.07] bg-base/50"
                      >
                        <Img src={proof.thumbnail} alt={proof.title} ratio="16/9">
                          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-void/80 px-2.5 py-1 font-mono text-[10px] text-ink-hi">
                            {proof.type === 'video' ? (
                              <Film className="h-3 w-3" aria-hidden="true" />
                            ) : (
                              <ImageIcon className="h-3 w-3" aria-hidden="true" />
                            )}
                            {proof.type === 'video' ? 'VIDEO' : 'PHOTO'}
                          </span>
                        </Img>
                        <div className="p-4">
                          <p className="text-[13px] font-medium text-ink-hi">{proof.title}</p>
                          <p className="mt-1 font-mono text-[11px] text-ink-low">
                            {proof.resolution} · {proof.fileSize}
                          </p>
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <span
                              className={cx(
                                'rounded-full px-2.5 py-1 text-[11px] font-medium',
                                pMeta.chip
                              )}
                            >
                              {pMeta.label}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              aria-label={`Download master of ${proof.title}`}
                            >
                              <Download className="h-3.5 w-3.5" aria-hidden="true" />
                              Master
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------- section -- */

export function ClientDashboard({
  user,
  userBookings,
  onOpenAuthModal,
  onNavigate,
}: ClientDashboardProps) {
  const summary = useMemo(() => {
    const totalInvested = userBookings.reduce((sum, b) => sum + b.totalUSD, 0)
    const upcoming = userBookings
      .map((b) => b.date)
      .filter((d) => d >= new Date().toISOString().slice(0, 10))
      .sort()[0]
    const proofsPending = userBookings.reduce(
      (sum, b) => sum + (b.proofMedia?.filter((p) => p.status === 'draft').length ?? 0),
      0
    )
    return { totalInvested, upcoming, proofsPending }
  }, [userBookings])

  const firstName = user?.name.split(' ')[0] ?? ''

  return (
    <section id="portal" className="relative py-24 md:py-32 lg:py-40">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="CLIENT PORTAL"
          title={
            <>
              Every production, <span className="text-gradient-gold">tracked frame by frame</span>
            </>
          }
          subtitle="Clients follow their shoot from deposit to delivery — live production status, proof reviews and master downloads, all in one place."
        />

        <div className="mt-14">
          {!user ? (
            /* ------------------------------------------------ signed out -- */
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl">
                {/* Dimmed faux dashboard */}
                <div
                  className="pointer-events-none select-none opacity-40 blur-[6px]"
                  aria-hidden="true"
                >
                  <div className="glass rounded-3xl p-8">
                    <div className="grid gap-4 sm:grid-cols-3">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="rounded-2xl bg-panel/80 p-5">
                          <div className="h-3 w-16 rounded bg-white/[0.1]" />
                          <div className="mt-4 h-8 w-24 rounded bg-white/[0.14]" />
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 h-36 rounded-2xl bg-panel/80" />
                  </div>
                </div>

                {/* Lock panel */}
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="glass-strong max-w-md rounded-3xl p-8 text-center shadow-deep">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-400/15">
                      <Lock className="h-6 w-6 text-gold-400" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 font-display text-2xl text-ink-hi">
                      Your productions live here
                    </h3>
                    <p className="mt-3 text-[14px] leading-relaxed text-ink-mid">
                      Track shoot status in real time, review and approve proofs, and download
                      final masters — available the moment you book.
                    </p>
                    <Button size="lg" onClick={onOpenAuthModal} className="mt-6">
                      Sign in to your portal
                    </Button>
                  </div>
                </div>

                {/* Spacer to give the overlay height on small screens */}
                <div className="invisible p-8" aria-hidden="true">
                  <div className="h-72" />
                </div>
              </div>
            </Reveal>
          ) : (
            /* ------------------------------------------------- signed in -- */
            <div>
              <Reveal>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-ember-500 font-display text-xl text-[#0a0a0a]">
                    {firstName.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <h3 className="font-display text-2xl text-ink-hi">
                      Welcome back, {firstName}
                    </h3>
                    <p className="mt-0.5 text-[13px] text-ink-mid">
                      {user.company ? `${user.company} · ` : ''}
                      Member since{' '}
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {[
                    {
                      id: 'count',
                      icon: Film,
                      label: 'Productions',
                      value: String(userBookings.length),
                    },
                    {
                      id: 'next',
                      icon: Calendar,
                      label: 'Next shoot',
                      value: summary.upcoming ? formatDateLong(summary.upcoming) : 'None scheduled',
                    },
                    {
                      id: 'invested',
                      icon: Wallet,
                      label: 'Total invested',
                      value: USD(summary.totalInvested),
                    },
                    {
                      id: 'proofs',
                      icon: ImageIcon,
                      label: 'Proofs awaiting review',
                      value: String(summary.proofsPending),
                    },
                  ].map(({ id, icon: Icon, label, value }) => (
                    <div key={id} className="glass rounded-2xl p-5">
                      <Icon className="h-4 w-4 text-gold-400" aria-hidden="true" />
                      <p className="mt-3 truncate font-display text-lg text-ink-hi sm:text-xl">
                        {value}
                      </p>
                      <p className="mt-1 text-[12px] text-ink-mid">{label}</p>
                    </div>
                  ))}
                </div>
              </Reveal>

              <div className="mt-8 space-y-4">
                {userBookings.length === 0 ? (
                  <Reveal>
                    <div className="glass rounded-3xl p-10 text-center">
                      <p className="font-display text-xl text-ink-hi">
                        No productions yet — let&apos;s fix that.
                      </p>
                      <p className="mx-auto mt-2 max-w-md text-[14px] text-ink-mid">
                        Book your first shoot and it will appear here with live status tracking.
                      </p>
                      <Button size="lg" onClick={() => onNavigate('booking')} className="mt-6">
                        Book your first shoot
                      </Button>
                    </div>
                  </Reveal>
                ) : (
                  userBookings.map((booking, i) => (
                    <Reveal key={booking.id} delay={Math.min(i * 0.06, 0.3)}>
                      <BookingCard booking={booking} />
                    </Reveal>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
