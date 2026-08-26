/**
 * Fixed top navigation — the first thing a client sees.
 *
 * Behaviour notes:
 *  - Transparent over the hero, then a floating glass pill past ~40px of scroll.
 *    The pill is a separate absolutely-positioned layer whose *opacity* is
 *    transitioned by a class swap, so crossing the threshold never touches
 *    layout (no width/height/padding animation anywhere).
 *  - The active-section underline is a per-link `<m.span>` that fades + scales
 *    in. No `layoutId` — `domMax` is not loaded.
 *  - Both dropdowns and the mobile drawer close on Escape and on an outside
 *    `pointerdown`; every listener is removed in its cleanup.
 */

import {
  AnimatePresence,
  m,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'framer-motion'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Aperture,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import type { TimezoneOption, User } from '../types/flashCinema'
import { TIMEZONES } from '../data/mockData'
import { Button, cx } from '../lib/ui'
import { EASE } from '../lib/motion'

interface NavbarProps {
  user: User | null
  selectedTimezone: TimezoneOption
  onSelectTimezone: (tz: TimezoneOption) => void
  onOpenAuthModal: () => void
  onLogout: () => void
  onNavigate: (sectionId: string) => void
  activeSection: string
}

/* ----------------------------------------------------------------- data -- */

interface NavLink {
  id: string
  label: string
  /** Two-digit index, shown only in the mobile drawer. */
  index: string
}

const NAV_LINKS: NavLink[] = [
  { id: 'work', label: 'Work', index: '01' },
  { id: 'services', label: 'Services', index: '02' },
  { id: 'process', label: 'Process', index: '03' },
  { id: 'packages', label: 'Packages', index: '04' },
  { id: 'booking', label: 'Booking', index: '05' },
  { id: 'studio', label: 'Studio', index: '06' },
]

const SCROLL_THRESHOLD = 40

type MenuKey = 'timezone' | 'account'

/** `Pacific Standard Time (Los Angeles / SF)` -> zone + cities. */
function splitZoneName(name: string): { zone: string; cities: string } {
  const open = name.indexOf(' (')
  if (open === -1 || !name.endsWith(')')) return { zone: name, cities: '' }
  return { zone: name.slice(0, open), cities: name.slice(open + 2, -1) }
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'AF'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/* ------------------------------------------------------------ fragments -- */

/** Gold initials disc used by the account controls. */
function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600',
        'font-mono font-semibold tracking-[0.04em] text-void',
        size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-10 w-10 text-[12px]'
      )}
    >
      {initialsOf(name)}
    </span>
  )
}

interface MenuPanelProps {
  id: string
  labelledBy: string
  className?: string
  children: ReactNode
}

/**
 * Shared dropdown surface. Animates opacity + y only, so the frosted backdrop
 * never has to re-blur at a new scale.
 */
function MenuPanel({ id, labelledBy, className, children }: MenuPanelProps) {
  const reduced = useReducedMotion()
  return (
    <m.div
      id={id}
      role="menu"
      aria-labelledby={labelledBy}
      className={cx(
        'glass-strong absolute right-0 top-full z-30 mt-3 overflow-hidden rounded-2xl p-1.5 shadow-deep',
        className
      )}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
      transition={{ duration: reduced ? 0.12 : 0.28, ease: EASE.outExpo }}
    >
      {children}
    </m.div>
  )
}

/* --------------------------------------------------------------- navbar -- */

export function Navbar({
  user,
  selectedTimezone,
  onSelectTimezone,
  onOpenAuthModal,
  onLogout,
  onNavigate,
  activeSection,
}: NavbarProps) {
  const reduced = useReducedMotion()

  const [scrolled, setScrolled] = useState<boolean>(
    () => typeof window !== 'undefined' && window.scrollY > SCROLL_THRESHOLD
  )
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const timezoneRef = useRef<HTMLDivElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const drawerCloseRef = useRef<HTMLButtonElement>(null)
  const drawerOpenRef = useRef(false)

  /* -- scroll state: one boolean, flipped at the threshold ---------------- */

  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (latest: number) => {
    const next = latest > SCROLL_THRESHOLD
    setScrolled((prev) => (prev === next ? prev : next))
  })

  useEffect(() => {
    drawerOpenRef.current = drawerOpen
  }, [drawerOpen])

  /* -- close / navigate helpers ------------------------------------------- */

  const closeDrawer = useCallback((restoreFocus = false) => {
    const wasOpen = drawerOpenRef.current
    drawerOpenRef.current = false
    setDrawerOpen(false)
    if (wasOpen && restoreFocus) {
      hamburgerRef.current?.focus({ preventScroll: true })
    }
  }, [])

  const go = useCallback(
    (sectionId: string) => {
      setOpenMenu(null)
      drawerOpenRef.current = false
      setDrawerOpen(false)
      onNavigate(sectionId)
    },
    [onNavigate]
  )

  const toggleMenu = useCallback((key: MenuKey) => {
    setOpenMenu((prev) => (prev === key ? null : key))
  }, [])

  /* -- Escape closes whatever is open ------------------------------------- */

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpenMenu(null)
      closeDrawer(true)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [closeDrawer])

  /* -- outside pointerdown closes the open dropdown ----------------------- */

  useEffect(() => {
    if (!openMenu) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (timezoneRef.current?.contains(target)) return
      if (accountRef.current?.contains(target)) return
      setOpenMenu(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [openMenu])

  /* -- body scroll lock while the drawer is open -------------------------- */

  useEffect(() => {
    if (!drawerOpen) return
    const body = document.body
    const previous = body.style.overflow
    body.style.overflow = 'hidden'
    return () => {
      body.style.overflow = previous
    }
  }, [drawerOpen])

  /* -- opening the drawer parks focus on its close button ----------------- */

  useEffect(() => {
    if (!drawerOpen) return
    setOpenMenu(null)
    drawerCloseRef.current?.focus({ preventScroll: true })
  }, [drawerOpen])

  const timezoneOpen = openMenu === 'timezone'
  const accountOpen = openMenu === 'account'
  const firstName = user ? user.name.trim().split(/\s+/)[0] : ''

  /* ------------------------------------------------------------ render -- */

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Scrim that keeps the wordmark legible over the hero; gone once the pill lands */}
      <div
        aria-hidden="true"
        className={cx(
          'pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-void/80 via-void/35 to-transparent',
          'transition-opacity duration-500 ease-out',
          scrolled ? 'opacity-0' : 'opacity-100'
        )}
      />

      <div className="mx-auto w-full max-w-7xl px-4 pt-3 sm:px-6 sm:pt-4 lg:px-6 xl:px-8">
        <div className="relative flex h-16 items-center justify-between gap-3 sm:h-[68px] lg:h-[72px] lg:gap-5 xl:gap-8">
          {/* Floating glass pill — opacity only, never geometry */}
          <div
            aria-hidden="true"
            className={cx(
              'glass-strong pointer-events-none absolute -inset-x-2 -inset-y-1 rounded-full shadow-deep',
              'sm:-inset-x-3 sm:-inset-y-1.5',
              'transition-opacity duration-500 ease-out',
              scrolled ? 'opacity-100' : 'opacity-0'
            )}
          />

          {/* --------------------------------------------------- brand -- */}
          <button
            type="button"
            onClick={() => go('hero')}
            className="group relative flex shrink-0 items-center gap-2.5 rounded-2xl py-1 pr-1 text-left"
            aria-label="CP Studios — back to top"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold-500/25 bg-gold-500/[0.06] transition-colors duration-500 ease-out group-hover:border-gold-400/60 group-hover:bg-gold-400/[0.12]">
              <Aperture
                aria-hidden="true"
                strokeWidth={1.4}
                className="h-[18px] w-[18px] text-gold-400 transition-transform duration-700 ease-out group-hover:rotate-90"
              />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-[18px] font-semibold tracking-[-0.01em] text-ink-hi transition-colors duration-500 ease-out group-hover:text-gold-200">
                CP
              </span>
              <span className="mt-[4px] font-mono text-[9px] tracking-[0.3em] text-ink-low">
                STUDIOS
              </span>
            </span>
          </button>

          {/* ----------------------------------------------- desktop nav -- */}
          <nav aria-label="Primary" className="relative hidden lg:block">
            <ul className="flex items-center gap-0.5 xl:gap-1">
              {NAV_LINKS.map((link) => {
                const active = activeSection === link.id
                return (
                  <li key={link.id}>
                    <button
                      type="button"
                      onClick={() => go(link.id)}
                      aria-current={active ? 'true' : undefined}
                      className={cx(
                        'relative inline-flex h-11 items-center whitespace-nowrap rounded-full px-2 text-[13px] xl:px-3.5',
                        'transition-colors duration-300 ease-out',
                        active ? 'text-ink-hi' : 'text-ink-mid hover:text-ink-hi'
                      )}
                    >
                      {link.label}
                      <AnimatePresence initial={false}>
                        {active && (
                          <m.span
                            key="rule"
                            aria-hidden="true"
                            className="absolute inset-x-2 bottom-[9px] h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent xl:inset-x-3.5"
                            initial={reduced ? { opacity: 0 } : { opacity: 0, scaleX: 0.3 }}
                            animate={reduced ? { opacity: 1 } : { opacity: 1, scaleX: 1 }}
                            exit={reduced ? { opacity: 0 } : { opacity: 0, scaleX: 0.3 }}
                            transition={{ duration: reduced ? 0.12 : 0.45, ease: EASE.outExpo }}
                          />
                        )}
                      </AnimatePresence>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* -------------------------------------------- right controls -- */}
          <div className="relative flex shrink-0 items-center gap-2">
            {/* Timezone selector */}
            <div ref={timezoneRef} className="relative hidden sm:block">
              <button
                type="button"
                id="cp-tz-trigger"
                onClick={() => toggleMenu('timezone')}
                aria-haspopup="menu"
                aria-expanded={timezoneOpen}
                aria-controls="cp-tz-menu"
                aria-label={`Studio timezone: ${selectedTimezone.name}. Change timezone`}
                className={cx(
                  'inline-flex h-11 items-center gap-2 rounded-full border px-3 transition-colors duration-300 ease-out',
                  timezoneOpen
                    ? 'border-gold-400/50 bg-gold-400/[0.09] text-ink-hi'
                    : 'border-white/10 bg-white/[0.03] text-ink-mid hover:border-gold-400/40 hover:text-ink-hi'
                )}
              >
                <Clock aria-hidden="true" strokeWidth={1.6} className="h-3.5 w-3.5 text-gold-400" />
                <span className="font-mono text-[11px] tracking-[0.16em]">
                  {selectedTimezone.code}
                </span>
                <ChevronDown
                  aria-hidden="true"
                  strokeWidth={1.6}
                  className={cx(
                    'h-3 w-3 text-ink-low transition-transform duration-300 ease-out',
                    timezoneOpen && 'rotate-180'
                  )}
                />
              </button>

              <AnimatePresence>
                {timezoneOpen && (
                  <MenuPanel
                    id="cp-tz-menu"
                    labelledBy="cp-tz-trigger"
                    className="w-[300px]"
                  >
                    <p aria-hidden="true" className="eyebrow px-3 pb-2 pt-2.5">
                      Studio Time
                    </p>
                    {TIMEZONES.map((tz) => {
                      const { zone, cities } = splitZoneName(tz.name)
                      const selected = tz.id === selectedTimezone.id
                      return (
                        <button
                          key={tz.id}
                          type="button"
                          role="menuitemradio"
                          aria-checked={selected}
                          onClick={() => {
                            onSelectTimezone(tz)
                            setOpenMenu(null)
                          }}
                          className={cx(
                            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-200 ease-out',
                            selected
                              ? 'bg-gold-400/[0.10] text-ink-hi'
                              : 'text-ink-mid hover:bg-white/[0.05] hover:text-ink-hi'
                          )}
                        >
                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-[13px]">{zone}</span>
                            {cities !== '' && (
                              <span className="truncate font-mono text-[10px] tracking-[0.08em] text-ink-mid">
                                {cities}
                              </span>
                            )}
                          </span>
                          <span className="shrink-0 font-mono text-[10px] text-ink-mid">
                            {tz.offset}
                          </span>
                          <span className="grid h-4 w-4 shrink-0 place-items-center">
                            {selected && (
                              <Check
                                aria-hidden="true"
                                strokeWidth={2}
                                className="h-3.5 w-3.5 text-gold-400"
                              />
                            )}
                          </span>
                        </button>
                      )
                    })}
                  </MenuPanel>
                )}
              </AnimatePresence>
            </div>

            {/* Account / auth — desktop only */}
            {user ? (
              <div ref={accountRef} className="relative hidden lg:block">
                <button
                  type="button"
                  id="cp-account-trigger"
                  onClick={() => toggleMenu('account')}
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  aria-controls="cp-account-menu"
                  aria-label={`Client portal for ${user.name}`}
                  className={cx(
                    'inline-flex h-11 items-center gap-2 rounded-full border py-1 pl-1 pr-2.5 transition-colors duration-300 ease-out xl:pr-3',
                    accountOpen
                      ? 'border-gold-400/50 bg-gold-400/[0.09]'
                      : 'border-white/10 bg-white/[0.03] hover:border-gold-400/40'
                  )}
                >
                  <Avatar name={user.name} />
                  <span className="hidden max-w-[104px] truncate text-[13px] text-ink-hi xl:block">
                    {firstName}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    strokeWidth={1.6}
                    className={cx(
                      'h-3 w-3 text-ink-low transition-transform duration-300 ease-out',
                      accountOpen && 'rotate-180'
                    )}
                  />
                </button>

                <AnimatePresence>
                  {accountOpen && (
                    <MenuPanel
                      id="cp-account-menu"
                      labelledBy="cp-account-trigger"
                      className="w-[268px]"
                    >
                      <div role="none" className="flex items-center gap-3 px-3 py-3">
                        <Avatar name={user.name} size="md" />
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate text-[14px] text-ink-hi">{user.name}</span>
                          <span className="truncate font-mono text-[11px] text-ink-mid">
                            {user.email}
                          </span>
                        </span>
                      </div>

                      <div className="rule-fade mx-2" aria-hidden="true" />

                      <div role="none" className="pt-1.5">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => go('portal')}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] text-ink-mid transition-colors duration-200 ease-out hover:bg-white/[0.05] hover:text-ink-hi"
                        >
                          <LayoutDashboard
                            aria-hidden="true"
                            strokeWidth={1.5}
                            className="h-4 w-4 text-gold-400"
                          />
                          Client Portal
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setOpenMenu(null)
                            onLogout()
                          }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] text-ink-mid transition-colors duration-200 ease-out hover:bg-white/[0.05] hover:text-ember-300"
                        >
                          <LogOut aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </MenuPanel>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onOpenAuthModal}
                className="hidden h-11 px-4 lg:inline-flex"
              >
                Sign In
              </Button>
            )}

            <div className="hidden lg:block">
              <Button
                type="button"
                variant="primary"
                size="sm"
                magnetic
                onClick={() => go('booking')}
                className="h-11 px-5"
              >
                Book a Shoot
              </Button>
            </div>

            {/* Hamburger */}
            <button
              ref={hamburgerRef}
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              aria-haspopup="dialog"
              aria-expanded={drawerOpen}
              aria-controls="cp-mobile-nav"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-ink-mid transition-colors duration-300 ease-out hover:border-gold-400/40 hover:text-ink-hi lg:hidden"
            >
              <Menu aria-hidden="true" strokeWidth={1.6} className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------- mobile drawer -- */}
      <AnimatePresence>
        {drawerOpen && (
          <m.div
            key="cp-nav-scrim"
            aria-hidden="true"
            onClick={() => closeDrawer(false)}
            className="fixed inset-0 z-40 bg-void/80 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.12 : 0.32, ease: EASE.inOutSoft }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {drawerOpen && (
          <m.div
            key="cp-nav-drawer"
            id="cp-mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="glass-strong fixed inset-y-0 right-0 z-40 flex w-[88%] max-w-[400px] flex-col border-l border-white/10 lg:hidden"
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: '100%' }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, x: '0%' }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: '100%' }}
            transition={{ duration: reduced ? 0.14 : 0.52, ease: EASE.outExpo }}
          >
            {/* drawer header */}
            <div className="flex h-16 shrink-0 items-center justify-between gap-3 px-5 sm:h-[68px] sm:px-6">
              <span className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-full border border-gold-500/25 bg-gold-500/[0.06]">
                  <Aperture aria-hidden="true" strokeWidth={1.4} className="h-4 w-4 text-gold-400" />
                </span>
                <span className="font-mono text-[9px] tracking-[0.3em] text-ink-low">STUDIOS</span>
              </span>
              <button
                ref={drawerCloseRef}
                type="button"
                onClick={() => closeDrawer(true)}
                aria-label="Close navigation menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-ink-mid transition-colors duration-300 ease-out hover:border-gold-400/40 hover:text-ink-hi"
              >
                <X aria-hidden="true" strokeWidth={1.6} className="h-[18px] w-[18px]" />
              </button>
            </div>

            <div className="rule-fade mx-5 sm:mx-6" aria-hidden="true" />

            {/* drawer body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-6">
              <nav aria-label="Primary mobile">
                <ul className="space-y-1">
                  {NAV_LINKS.map((link) => {
                    const active = activeSection === link.id
                    return (
                      <li key={link.id}>
                        <button
                          type="button"
                          onClick={() => go(link.id)}
                          aria-current={active ? 'true' : undefined}
                          className={cx(
                            'group flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors duration-300 ease-out',
                            active ? 'text-gold-200' : 'text-ink-hi hover:text-gold-200'
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={cx(
                              'w-6 shrink-0 font-mono text-[10px] tracking-[0.18em] transition-colors duration-300 ease-out',
                              active ? 'text-gold-400' : 'text-ink-low'
                            )}
                          >
                            {link.index}
                          </span>
                          <span className="font-display text-2xl leading-none">{link.label}</span>
                          <ArrowUpRight
                            aria-hidden="true"
                            strokeWidth={1.4}
                            className={cx(
                              'ml-auto h-4 w-4 text-gold-400 transition-opacity duration-300 ease-out',
                              active ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                            )}
                          />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </nav>

              <div className="rule-fade my-6" aria-hidden="true" />

              {/* timezone picker */}
              <div>
                <p className="eyebrow mb-3">Studio Time</p>
                <div className="flex flex-wrap gap-2">
                  {TIMEZONES.map((tz) => {
                    const selected = tz.id === selectedTimezone.id
                    return (
                      <button
                        key={tz.id}
                        type="button"
                        onClick={() => onSelectTimezone(tz)}
                        aria-pressed={selected}
                        aria-label={tz.name}
                        className={cx(
                          'inline-flex h-11 items-center gap-2 rounded-full border px-3.5 transition-colors duration-300 ease-out',
                          selected
                            ? 'border-gold-400/50 bg-gold-400/[0.10] text-ink-hi'
                            : 'border-white/10 bg-white/[0.03] text-ink-mid hover:border-gold-400/40 hover:text-ink-hi'
                        )}
                      >
                        <span className="font-mono text-[11px] tracking-[0.16em]">{tz.code}</span>
                        <span className="font-mono text-[10px] text-ink-mid">{tz.offset}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="rule-fade my-6" aria-hidden="true" />

              {/* account block */}
              {user ? (
                <div className="rounded-2xl border border-line bg-panel/60 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} size="md" />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-[14px] text-ink-hi">{user.name}</span>
                      <span className="truncate font-mono text-[11px] text-ink-mid">
                        {user.email}
                      </span>
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => go('portal')}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 text-[13px] text-ink-mid transition-colors duration-300 ease-out hover:border-gold-400/40 hover:text-ink-hi"
                    >
                      <LayoutDashboard
                        aria-hidden="true"
                        strokeWidth={1.5}
                        className="h-4 w-4 text-gold-400"
                      />
                      Portal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        closeDrawer(false)
                        onLogout()
                      }}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 text-[13px] text-ink-mid transition-colors duration-300 ease-out hover:border-ember-400/40 hover:text-ember-300"
                    >
                      <LogOut aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    closeDrawer(false)
                    onOpenAuthModal()
                  }}
                  className="w-full"
                >
                  Sign In
                </Button>
              )}
            </div>

            {/* drawer footer CTA */}
            <div
              className="shrink-0 px-5 pt-2 sm:px-6"
              style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
            >
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={() => go('booking')}
                className="w-full"
              >
                Book a Shoot
              </Button>
              <p className="mt-3 text-center font-mono text-[10px] tracking-[0.18em] text-ink-mid">
                LOS ANGELES · NEW YORK · MIAMI
              </p>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  )
}
