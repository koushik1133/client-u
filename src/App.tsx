import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Booking, TimezoneOption, User } from './types/flashCinema'
import { SAMPLE_BOOKINGS, TIMEZONES } from './data/mockData'
import { ScrollProgress } from './lib/ui'

import { Navbar } from './components/Navbar'
import { HeroSection } from './components/HeroSection'
import { TrustBar } from './components/TrustBar'
import { ServicesShowcase } from './components/ServicesShowcase'
import { PortfolioGrid } from './components/PortfolioGrid'
import { StatsBand } from './components/StatsBand'
import { ProcessTimeline } from './components/ProcessTimeline'
import { PackageCalculator } from './components/PackageCalculator'
import { BookingEngine } from './components/BookingEngine'
import { GearAndCrew } from './components/GearAndCrew'
import { Testimonials } from './components/Testimonials'
import { ClientDashboard } from './components/ClientDashboard'
import { CTASection } from './components/CTASection'
import { Footer } from './components/Footer'

/**
 * The modal and the chat widget are the only things a visitor may never open, so
 * they are the only things worth splitting out of the initial bundle. The page
 * sections stay eager: they all need to be in the DOM for the scroll-spy
 * observer, and streaming them in would cause layout shift mid-scroll.
 */
const AuthModal = lazy(() =>
  import('./components/AuthModal').then((m) => ({ default: m.AuthModal }))
)
const AIAssistant = lazy(() =>
  import('./components/AIAssistant').then((m) => ({ default: m.AIAssistant }))
)

const STORAGE_USER = 'cp_studios_user'
const STORAGE_BOOKINGS = 'cp_studios_bookings'

/** Sections that participate in nav highlighting, in document order. */
const SECTION_IDS = [
  'hero',
  'work',
  'services',
  'process',
  'packages',
  'booking',
  'studio',
  'voices',
  'portal',
] as const

/** localStorage can throw (Safari private mode, disabled site data) — never let it break boot. */
function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStored(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota or blocked storage — the session simply is not persisted */
  }
}

export function App() {
  const [user, setUser] = useState<User | null>(() => readStored<User | null>(STORAGE_USER, null))
  const [selectedTimezone, setSelectedTimezone] = useState<TimezoneOption>(TIMEZONES[0])
  const [userBookings, setUserBookings] = useState<Booking[]>(() =>
    readStored<Booking[]>(STORAGE_BOOKINGS, SAMPLE_BOOKINGS)
  )

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('hero')
  const [preselectedCategoryId, setPreselectedCategoryId] = useState<string | null>(null)

  /** Set when the assistant should mount — deferred until the browser is idle. */
  const [assistantReady, setAssistantReady] = useState(false)

  useEffect(() => {
    if (user) writeStored(STORAGE_USER, user)
    else {
      try {
        localStorage.removeItem(STORAGE_USER)
      } catch {
        /* ignore */
      }
    }
  }, [user])

  useEffect(() => {
    writeStored(STORAGE_BOOKINGS, userBookings)
  }, [userBookings])

  /* --------------------------------------------------------------- nav --- */

  const navigate = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId)
    if (!el) return
    // `scroll-padding-top` in index.css keeps the fixed navbar off the heading.
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveSection(sectionId)
  }, [])

  const handleBookCategory = useCallback(
    (categoryId: string) => {
      setPreselectedCategoryId(categoryId)
      navigate('booking')
    },
    [navigate]
  )

  /* --------------------------------------------------------- scroll spy --- */

  // Tracks how much of each section is visible so the navbar can highlight the
  // one the reader is actually looking at. IntersectionObserver only — no
  // scroll listener, so this costs nothing per frame.
  const ratios = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    )
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.current.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0)
        }

        let bestId = ''
        let bestRatio = 0
        for (const [id, ratio] of ratios.current) {
          if (ratio > bestRatio) {
            bestRatio = ratio
            bestId = id
          }
        }
        if (bestId && bestRatio > 0.08) {
          setActiveSection((prev) => (prev === bestId ? prev : bestId))
        }
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1], rootMargin: '-15% 0px -35% 0px' }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  /* ------------------------------------------- defer the chat assistant --- */

  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      cancelIdleCallback?: (handle: number) => void
    }

    if (typeof w.requestIdleCallback === 'function') {
      const handle = w.requestIdleCallback(() => setAssistantReady(true), { timeout: 2500 })
      return () => w.cancelIdleCallback?.(handle)
    }

    const timer = window.setTimeout(() => setAssistantReady(true), 1800)
    return () => window.clearTimeout(timer)
  }, [])

  /* ------------------------------------------------------------ handlers --- */

  const handleLoginSuccess = useCallback((loggedUser: User) => {
    setUser(loggedUser)
  }, [])

  const handleLogout = useCallback(() => {
    setUser(null)
  }, [])

  const handleBookingConfirmed = useCallback((booking: Booking) => {
    setUserBookings((prev) => [booking, ...prev])
  }, [])

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), [])
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), [])

  const navProps = useMemo(
    () => ({
      user,
      selectedTimezone,
      onSelectTimezone: setSelectedTimezone,
      onOpenAuthModal: openAuthModal,
      onLogout: handleLogout,
      onNavigate: navigate,
      activeSection,
    }),
    [user, selectedTimezone, openAuthModal, handleLogout, navigate, activeSection]
  )

  return (
    <>
      <ScrollProgress />

      {/* Keyboard users land here first — lets them jump the nav entirely. */}
      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-gold-400 focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-[#0a0a0a]"
      >
        Skip to content
      </a>

      <Navbar {...navProps} />

      <main>
        <HeroSection onNavigate={navigate} />
        <TrustBar />
        <PortfolioGrid />
        <ServicesShowcase onBookCategory={handleBookCategory} />
        <StatsBand />
        <ProcessTimeline />
        <PackageCalculator onNavigate={navigate} />
        <BookingEngine
          user={user}
          selectedTimezone={selectedTimezone}
          onSelectTimezone={setSelectedTimezone}
          onBookingConfirmed={handleBookingConfirmed}
          onOpenAuthModal={openAuthModal}
          preselectedCategoryId={preselectedCategoryId}
        />
        <GearAndCrew />
        <Testimonials />
        <ClientDashboard
          user={user}
          userBookings={userBookings}
          onOpenAuthModal={openAuthModal}
          onNavigate={navigate}
        />
        <CTASection onNavigate={navigate} />
      </main>

      <Footer onNavigate={navigate} />

      {assistantReady && (
        <Suspense fallback={null}>
          <AIAssistant />
        </Suspense>
      )}

      {/* Only pay for the modal's JS once the visitor actually asks for it. */}
      {isAuthModalOpen && (
        <Suspense fallback={null}>
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={closeAuthModal}
            onLoginSuccess={handleLoginSuccess}
          />
        </Suspense>
      )}
    </>
  )
}

export default App
