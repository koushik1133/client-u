/**
 * PortfolioGrid — the "Selected Work" showcase (`#work`).
 *
 * The single most important section on the site: it is the only place a
 * prospective client actually sees the product. Three things carry the weight
 * here — the imagery, the restraint around it, and how the lightbox behaves.
 *
 * Layout notes
 *  - `featured` items span both columns and run 21/9 at md+ (cinematic banner).
 *  - A trailing non-featured card that would otherwise sit alone in a two-up row
 *    is promoted to a full-width 16/9 tile, so the grid never ends on a hole.
 *  - Card media is clipped by the `<button>`; only the `<Img>` wrapper scales on
 *    hover, so there is exactly one transition-property declaration per element
 *    and no Tailwind utility-collision guesswork.
 *
 * Motion notes
 *  - `m` only (the app mounts `LazyMotion` with `domAnimation`, strict).
 *  - No `layout` / `layoutId`: filter transitions are opacity + scale on stable
 *    `key={item.id}` children inside a plain `<AnimatePresence>`.
 *  - Every reveal is `whileInView` + `viewport={{ once: true }}`.
 *
 * Accessibility notes
 *  - Each card is a real `<button>` (`aria-haspopup="dialog"`).
 *  - The lightbox is a labelled modal dialog: focus moves to Close on open,
 *    Tab is trapped inside the panel, Escape closes, focus returns to the card
 *    that opened it, and body scroll is locked with scrollbar-gutter
 *    compensation so the page never jumps.
 */

import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, Eye, Heart, Maximize2, Play, X } from 'lucide-react'

import { PORTFOLIO_ITEMS } from '../data/mockData'
import type { PortfolioItem } from '../types/flashCinema'
import { EASE, Reveal } from '../lib/motion'
import { Button, Img, SectionHeading, cx } from '../lib/ui'

/* ------------------------------------------------------------- card shape -- */

type CardShape = 'banner' | 'wide' | 'tile'

/** Aspect classes live on the wrapper, never inline, so md: overrides work. */
const ASPECT: Record<CardShape, string> = {
  banner: 'aspect-video md:aspect-[21/9]',
  wide: 'aspect-[4/3] md:aspect-video',
  tile: 'aspect-[4/3]',
}

const SPAN: Record<CardShape, string> = {
  banner: 'md:col-span-2',
  wide: 'md:col-span-2',
  tile: '',
}

const IMG_SIZES: Record<CardShape, string> = {
  banner: '(max-width: 767px) 100vw, (max-width: 1360px) 92vw, 1216px',
  wide: '(max-width: 767px) 100vw, (max-width: 1360px) 92vw, 1216px',
  tile: '(max-width: 767px) 100vw, (max-width: 1360px) 46vw, 600px',
}

/* ----------------------------------------------------------- lightbox data -- */

interface LightboxMedia {
  key: string
  kind: 'video' | 'image'
  src: string
  poster: string
}

/** Film first (when there is one), then de-duplicated stills. */
function buildMedia(item: PortfolioItem): LightboxMedia[] {
  const stills = Array.from(new Set([item.coverImage, ...item.galleryImages]))
  const images: LightboxMedia[] = stills.map((src, i) => ({
    key: `still-${i}`,
    kind: 'image',
    src,
    poster: src,
  }))

  return item.videoUrl
    ? [{ key: 'film', kind: 'video', src: item.videoUrl, poster: item.coverImage }, ...images]
    : images
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])'

/* ------------------------------------------------------------------- card -- */

interface WorkCardProps {
  item: PortfolioItem
  shape: CardShape
  index: number
  onOpen: (item: PortfolioItem, trigger: HTMLButtonElement) => void
}

function WorkCard({ item, shape, index, onOpen }: WorkCardProps) {
  const reduced = useReducedMotion()
  const tags = item.tags.slice(0, 3)

  return (
    <m.div
      className={SPAN[shape]}
      initial={reduced ? false : { opacity: 0, y: 22, scale: 0.99 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-8%' }}
      exit={
        reduced
          ? { opacity: 0, transition: { duration: 0.16 } }
          : { opacity: 0, scale: 0.97, transition: { duration: 0.22, ease: EASE.inOutSoft } }
      }
      transition={{ duration: 0.7, delay: Math.min(index, 3) * 0.08, ease: EASE.outExpo }}
    >
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={(event) => onOpen(item, event.currentTarget)}
        className={cx(
          'group relative block w-full overflow-hidden rounded-2xl border border-white/[0.07] bg-raise text-left',
          'transition-[border-color,box-shadow,transform] duration-500 ease-out',
          'hover:border-gold-400/40 hover:shadow-gold focus-visible:border-gold-400/50',
          'motion-safe:hover:-translate-y-1'
        )}
      >
        <span className={cx('relative isolate block w-full', ASPECT[shape])}>
          <Img
            src={item.coverImage}
            alt={item.title}
            sizes={IMG_SIZES[shape]}
            // Inline wins over Img's own `aspectRatio` and its `relative` class,
            // so the wrapper span (which carries the responsive aspect utilities)
            // is the single source of truth for the box.
            style={{ aspectRatio: 'auto', position: 'absolute', inset: 0 }}
            className="h-full w-full transition-transform duration-700 ease-out will-change-transform group-hover:scale-105 group-focus-visible:scale-105"
          />

          {/* Scrims: a flat wash for consistency, a bottom ramp for the caption,
              and a top ramp that only appears with the hover meta. */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-void/15" />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-void via-void/72 to-transparent"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-void/75 to-transparent opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-focus-visible:opacity-100"
          />

          {/* Reach — surfaced on intent only, so the resting card stays quiet. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-4 flex -translate-y-1 items-center gap-3 rounded-full border border-white/10 bg-void/70 px-3 py-1.5 font-mono text-[11px] tabular-nums text-ink-mid opacity-0 backdrop-blur-[2px] transition-[opacity,transform] duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
          >
            <span className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-gold-400" />
              {item.views}
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-ember-400" />
              {item.likes.toLocaleString('en-US')}
            </span>
          </span>

          {/* Play (or Maximize for stills-only work). */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="grid h-14 w-14 scale-90 place-items-center rounded-full bg-gold-400 text-void opacity-0 shadow-[0_18px_44px_-14px_rgb(239_195_94/0.85)] transition-[opacity,transform] duration-500 ease-out group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100 md:h-16 md:w-16">
              {item.videoUrl ? (
                <Play className="h-5 w-5 translate-x-[1px] fill-current md:h-6 md:w-6" />
              ) : (
                <Maximize2 className="h-5 w-5 md:h-6 md:w-6" />
              )}
            </span>
          </span>

          {/* Always-visible caption. */}
          <span className="absolute inset-x-0 bottom-0 block p-4 sm:p-5 md:p-6">
            <span className="block font-display text-lg leading-snug text-ink-hi transition-colors duration-500 ease-out group-hover:text-gold-200 group-focus-visible:text-gold-200 md:text-xl">
              {item.title}
            </span>
            <span className="mt-1.5 block truncate text-[12px] leading-relaxed text-ink-mid">
              {item.client} · {item.location}
            </span>
            <span className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/[0.12] bg-void/55 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mid backdrop-blur-[2px]"
                >
                  {tag}
                </span>
              ))}
            </span>
          </span>
        </span>
      </button>
    </m.div>
  )
}

/* --------------------------------------------------------------- section -- */

export function PortfolioGrid() {
  const reduced = useReducedMotion()
  const dialogTitleId = useId()

  const [activeCategory, setActiveCategory] = useState('All')
  const [active, setActive] = useState<PortfolioItem | null>(null)
  const [mediaIndex, setMediaIndex] = useState(0)

  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(PORTFOLIO_ITEMS.map((item) => item.category)))],
    []
  )

  const counts = useMemo(() => {
    const map = new Map<string, number>([['All', PORTFOLIO_ITEMS.length]])
    for (const item of PORTFOLIO_ITEMS) {
      map.set(item.category, (map.get(item.category) ?? 0) + 1)
    }
    return map
  }, [])

  const filtered = useMemo(
    () =>
      activeCategory === 'All'
        ? PORTFOLIO_ITEMS
        : PORTFOLIO_ITEMS.filter((item) => item.category === activeCategory),
    [activeCategory]
  )

  /**
   * Walk the filtered list tracking the two-up column cursor. Featured work
   * always takes the full width; a lone trailing tile is promoted rather than
   * left stranded beside an empty cell.
   */
  const cards = useMemo(() => {
    const result: { item: (typeof filtered)[number]; shape: CardShape }[] = []
    let column = 0
    for (let i = 0; i < filtered.length; i++) {
      const item = filtered[i]
      if (item.featured) {
        column = 0
        result.push({ item, shape: 'banner' as CardShape })
        continue
      }
      if (i === filtered.length - 1 && column === 0) {
        result.push({ item, shape: 'wide' as CardShape })
        continue
      }
      column = column === 0 ? 1 : 0
      result.push({ item, shape: 'tile' as CardShape })
    }
    return result
  }, [filtered])

  const media = useMemo<LightboxMedia[]>(() => (active ? buildMedia(active) : []), [active])
  const current: LightboxMedia | undefined = media[Math.min(mediaIndex, media.length - 1)]
  const isOpen = active !== null

  /* Modal side effects: scroll lock, initial focus, focus trap, Escape, restore. */
  useEffect(() => {
    if (!isOpen) return

    const trigger = triggerRef.current
    const body = document.body
    const previousOverflow = body.style.overflow
    const previousPaddingRight = body.style.paddingRight
    // Reserve the space the scrollbar occupied so nothing reflows sideways.
    const gutter = window.innerWidth - document.documentElement.clientWidth

    body.style.overflow = 'hidden'
    if (gutter > 0) body.style.paddingRight = `${gutter}px`

    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setActive(null)
        return
      }
      if (event.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return

      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (node) => node.getClientRects().length > 0
      )
      if (focusables.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const focused = document.activeElement as HTMLElement | null
      const inside = focused ? panel.contains(focused) : false

      if (event.shiftKey) {
        if (!inside || focused === first) {
          event.preventDefault()
          last.focus()
        }
      } else if (!inside || focused === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPaddingRight
      trigger?.focus()
    }
  }, [isOpen])

  const openItem = (item: PortfolioItem, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger
    setMediaIndex(0)
    setActive(item)
  }

  const close = () => setActive(null)

  const goToArchive = () => {
    document.getElementById('booking')?.scrollIntoView({
      behavior: reduced ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  const specs = active
    ? [
        { label: 'Location', value: active.location },
        { label: 'Camera', value: active.cameraGear },
        { label: 'Lens', value: active.lens },
        { label: 'Director', value: active.director },
        { label: 'Views', value: active.views },
        { label: 'Likes', value: active.likes.toLocaleString('en-US') },
      ]
    : []

  return (
    <section id="work" className="relative py-24 md:py-32 lg:py-40">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="SELECTED WORK"
          title={
            <>
              Work that <span className="text-gradient-gold italic">holds the room</span>
            </>
          }
          subtitle="Four recent productions, from a Napa estate to Angeles Crest at 2 a.m. Shot on RED, ARRI and Hasselblad, graded in-house, mastered in 38 hours."
        />

        {/* -------------------------------------------------------- filters -- */}
        <Reveal className="mt-10 md:mt-12" delay={0.08}>
          <div
            role="group"
            aria-label="Filter work by category"
            className="flex flex-wrap items-center justify-center gap-2.5"
          >
            {categories.map((category) => {
              const isActive = category === activeCategory
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveCategory(category)}
                  className={cx(
                    'inline-flex h-11 items-center rounded-full border px-5 font-mono text-[12px] uppercase tracking-[0.16em]',
                    'transition-[background-color,border-color,color,box-shadow] duration-300 ease-out',
                    isActive
                      ? 'border-gold-400 bg-gold-400 text-void shadow-[0_12px_32px_-16px_rgb(239_195_94/0.9)]'
                      : 'border-white/[0.12] bg-white/[0.03] text-ink-mid hover:border-gold-400/50 hover:bg-gold-400/[0.06] hover:text-gold-200'
                  )}
                >
                  {category}
                  <span className="ml-2.5 text-[10px] tabular-nums opacity-55" aria-hidden="true">
                    {String(counts.get(category) ?? 0).padStart(2, '0')}
                  </span>
                </button>
              )
            })}
          </div>
        </Reveal>

        {/* ----------------------------------------------------------- grid -- */}
        <div className="mt-10 grid gap-5 md:mt-12 md:grid-cols-2">
          <AnimatePresence>
            {cards.map(({ item, shape }, i) => (
              <WorkCard key={item.id} item={item} shape={shape} index={i} onOpen={openItem} />
            ))}
          </AnimatePresence>
        </div>

        {/* ------------------------------------------------------- archive -- */}
        <Reveal className="mt-16 md:mt-20" direction="up">
          <div className="rule-fade" aria-hidden="true" />
          <div className="mt-10 flex flex-col items-center gap-5 text-center">
            <Button variant="outline" size="lg" magnetic onClick={goToArchive}>
              View the full archive
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <p className="max-w-md text-[15px] leading-relaxed text-ink-mid">
              This grid is a sample. Unlisted reels, full case studies and client references are
              shared on the intro call.
            </p>
          </div>
        </Reveal>
      </div>

      {/* -------------------------------------------------------- lightbox -- */}
      <AnimatePresence>
        {active && current && (
          <m.div
            key="work-lightbox"
            className="fixed inset-0 z-[70] flex items-start justify-center overflow-hidden bg-void/92 p-4 backdrop-blur-md sm:items-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE.inOutSoft }}
            onClick={(event) => {
              if (event.target === event.currentTarget) close()
            }}
          >
            <m.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={dialogTitleId}
              className="glass-strong relative max-h-[90svh] w-full max-w-5xl overflow-y-auto overscroll-contain rounded-3xl shadow-deep"
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.975, y: 14 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={
                reduced
                  ? { opacity: 0, transition: { duration: 0.18 } }
                  : { opacity: 0, scale: 0.985, y: 8, transition: { duration: 0.22, ease: EASE.inOutSoft } }
              }
              transition={{ duration: 0.5, ease: EASE.outExpo }}
            >
              {/* Zero-height sticky rail keeps Close pinned while the panel scrolls. */}
              <div className="pointer-events-none sticky top-0 z-30 h-0">
                <button
                  ref={closeRef}
                  type="button"
                  aria-label="Close"
                  onClick={close}
                  className="pointer-events-auto absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full border border-white/[0.14] bg-void/75 text-ink-mid backdrop-blur-sm transition-colors duration-300 ease-out hover:border-gold-400/60 hover:text-gold-200"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="p-4 sm:p-6 md:p-8">
                <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-void">
                  {current.kind === 'video' ? (
                    <video
                      key={current.src}
                      className="aspect-video w-full bg-void object-cover"
                      src={current.src}
                      poster={active.coverImage}
                      controls
                      playsInline
                      preload="none"
                    />
                  ) : (
                    <Img
                      src={current.src}
                      alt={`${active.title} — frame ${mediaIndex + 1}`}
                      ratio="16/9"
                      priority
                      sizes="(max-width: 1024px) 92vw, 960px"
                    />
                  )}
                </div>

                {media.length > 1 && (
                  <div
                    role="group"
                    aria-label="Media from this production"
                    className="mt-3 flex gap-3 overflow-x-auto pb-2"
                  >
                    {media.map((entry, i) => {
                      const selected = i === mediaIndex
                      return (
                        <button
                          key={entry.key}
                          type="button"
                          onClick={() => setMediaIndex(i)}
                          aria-current={selected}
                          aria-label={
                            entry.kind === 'video' ? 'Play the film' : `View frame ${i + 1}`
                          }
                          className={cx(
                            'relative shrink-0 overflow-hidden rounded-lg border transition-[border-color,opacity] duration-300 ease-out',
                            selected
                              ? 'border-gold-400 opacity-100'
                              : 'border-white/10 opacity-55 hover:border-white/25 hover:opacity-90'
                          )}
                        >
                          <Img
                            src={entry.poster}
                            alt=""
                            ratio="16/9"
                            sizes="112px"
                            className="w-[112px]"
                          />
                          {entry.kind === 'video' && (
                            <span
                              aria-hidden="true"
                              className="absolute inset-0 grid place-items-center bg-void/40"
                            >
                              <Play className="h-4 w-4 fill-current text-gold-300" />
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}

                <div className="mt-7 pr-12 sm:pr-0">
                  <p className="eyebrow">{active.category}</p>
                  <h3
                    id={dialogTitleId}
                    className="mt-3 font-display text-2xl leading-[1.1] text-ink-hi sm:text-3xl lg:text-[2.5rem]"
                  >
                    {active.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-mid">{active.client}</p>
                </div>

                <div className="rule-fade mt-8" aria-hidden="true" />

                <dl className="mt-7 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                  {specs.map((spec) => (
                    <div key={spec.label} className="border-t border-white/[0.08] pt-3">
                      <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-mid">
                        {spec.label}
                      </dt>
                      <dd className="mt-2 font-mono text-[13px] leading-relaxed text-ink-hi">
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </section>
  )
}
