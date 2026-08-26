/**
 * ServicesShowcase — the productised offer grid (`#services`).
 *
 * Renders the six `SHOOT_CATEGORIES` as a bento grid. The two entries flagged
 * `popular` occupy two of the three large-screen columns and carry a wider
 * cover frame, a "MOST BOOKED" pill and a travelling border beam.
 *
 * Layout arithmetic (why `arrangeForBento` exists):
 *   2 wide cards (2 columns each) + 4 standard cards (1 column each) = 8 column
 *   units, which does not divide evenly into a 3-column grid. Source order
 *   [wide, wide, …] would strand an empty cell in the first row. Weaving one
 *   standard card behind each wide card fills rows 1 and 2 exactly, and the
 *   closing "custom scope" tile takes the final cell — so the grid is flush at
 *   every breakpoint with no `grid-flow-dense` (which would desync the DOM
 *   order from the visual order for keyboard and screen-reader users).
 */

import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Camera,
  Check,
  Clock,
  Film,
  Heart,
  Smartphone,
  Video,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { SHOOT_CATEGORIES } from '../data/mockData'
import { Stagger, StaggerItem } from '../lib/motion'
import { BorderBeam, Button, Img, SectionHeading, SpotlightCard, TiltCard, cx } from '../lib/ui'
import type { ShootCategory } from '../types/flashCinema'

/* ------------------------------------------------------------------ icons -- */

/**
 * Explicit name → component map. Deliberately not `Icons[name]` dynamic
 * indexing: that pulls the entire lucide barrel into the bundle and gives back
 * an untyped component.
 */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Camera,
  Video,
  Film,
  Heart,
  Smartphone,
  Briefcase,
}

/* ------------------------------------------------------------------ order -- */

function arrangeForBento(categories: ShootCategory[]): ShootCategory[] {
  const wide = categories.filter((category) => category.popular)
  const standard = categories.filter((category) => !category.popular)
  const ordered: ShootCategory[] = []

  for (const feature of wide) {
    ordered.push(feature)
    const filler = standard.shift()
    if (filler) ordered.push(filler)
  }

  return [...ordered, ...standard]
}

const BENTO_ORDER = arrangeForBento(SHOOT_CATEGORIES)

/**
 * `<Img>` only transitions opacity on its inner `<img>`. Raising the selector
 * to a child variant (`.class > img`, specificity 0-1-1) lets the cover
 * transition transform as well, without editing the shared primitive. The
 * duration/easing are repeated at the same specificity so they still win.
 */
const COVER_TRANSITION =
  '[&>img]:transition-[transform,opacity] [&>img]:duration-700 [&>img]:ease-out'

/* ------------------------------------------------------------------- card -- */

interface CategoryCardProps {
  category: ShootCategory
  onBook: (categoryId: string) => void
}

function CategoryCard({ category, onBook }: CategoryCardProps) {
  const Icon = CATEGORY_ICONS[category.iconName] ?? Camera
  const isWide = category.popular === true
  const price = `$${category.basePriceUSD.toLocaleString('en-US')}`

  return (
    <SpotlightCard className="h-full rounded-2xl" radius={420}>
      <TiltCard max={5} className="h-full">
        <div className="glass relative flex h-full flex-col overflow-hidden rounded-2xl">
          {/*
            Cover. Clearing `<Img>`'s inline aspect-ratio hands the frame over
            to the classes below, so the two-column cards can widen at `lg`
            instead of doubling in height and stretching their row-mates.
          */}
          <Img
            src={category.coverImage}
            alt={`${category.title} — production still`}
            ratio="16/10"
            style={{ aspectRatio: undefined }}
            sizes={
              isWide
                ? '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 66vw'
                : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
            }
            className={cx(
              'aspect-[16/10] shrink-0',
              COVER_TRANSITION,
              isWide && 'lg:aspect-[21/9]'
            )}
            imgClassName="group-hover:scale-[1.06]"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-panel via-panel/20 to-transparent"
            />
            <div
              aria-hidden="true"
              className="absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-void/55 text-gold-300 backdrop-blur-md"
            >
              <Icon className="h-5 w-5" strokeWidth={1.6} />
            </div>
          </Img>

          {isWide && (
            <p className="absolute right-4 top-4 z-20 rounded-full border border-gold-400/25 bg-void/70 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-gold-200 backdrop-blur-md">
              Most booked
            </p>
          )}

          {/* ----------------------------------------------------------- body */}
          <div className="flex flex-1 flex-col p-5 sm:p-6">
            <h3
              className={cx(
                'font-display text-xl leading-snug text-ink-hi',
                isWide && 'lg:text-2xl'
              )}
            >
              {category.title}
            </h3>

            <p className="mt-2 font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] text-gold-400">
              {category.subtitle}
            </p>

            <p
              className={cx(
                'mt-3 line-clamp-2 text-[14px] leading-relaxed text-ink-mid',
                isWide && 'lg:max-w-2xl'
              )}
            >
              {category.description}
            </p>

            <ul
              className={cx(
                'mt-5 flex flex-col gap-2.5',
                isWide && 'lg:grid lg:grid-cols-3 lg:items-start lg:gap-x-6'
              )}
            >
              {category.features.slice(0, 3).map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2.5 text-[13px] leading-snug text-ink-mid"
                >
                  <Check
                    aria-hidden="true"
                    strokeWidth={2.4}
                    className="mt-px h-3.5 w-3.5 shrink-0 text-gold-500"
                  />
                  <span className="min-w-0">{feature}</span>
                </li>
              ))}
            </ul>

            {/* --------------------------------------------------- price rail */}
            <div className="mt-auto pt-6">
              <div className="rule-fade" aria-hidden="true" />

              <div className="mt-5 flex flex-wrap items-center justify-between gap-x-5 gap-y-4">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-mid">
                    From
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-display text-2xl leading-none text-ink-hi">{price}</span>
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-mid">
                      <Clock aria-hidden="true" className="h-3.5 w-3.5 text-gold-500" />
                      {category.durationHours} hr on set
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-11"
                  onClick={() => onBook(category.id)}
                >
                  Book this
                  <span className="sr-only">: {category.title}</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                  />
                </Button>
              </div>
            </div>
          </div>

          {isWide && <BorderBeam duration={9} />}
        </div>
      </TiltCard>
    </SpotlightCard>
  )
}

/* ---------------------------------------------------------------- section -- */

interface ServicesShowcaseProps {
  onBookCategory: (categoryId: string) => void
}

export function ServicesShowcase({ onBookCategory }: ServicesShowcaseProps) {
  return (
    <section id="services" className="relative py-24 md:py-32 lg:py-40">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="WHAT WE MAKE"
          title={
            <>
              Six ways to <span className="text-gradient-gold">put your brand on film</span>
            </>
          }
          subtitle="Every production below is a fixed-fee build — scope, crew, gear and delivery window agreed in writing before we roll, with no change orders and no day-rate creep."
        />

        <Stagger
          gap={0.06}
          className="mt-14 grid gap-5 md:mt-16 md:grid-cols-2 lg:grid-cols-3"
        >
          {BENTO_ORDER.map((category) => (
            <StaggerItem
              key={category.id}
              className={cx('min-w-0', category.popular && 'lg:col-span-2')}
            >
              <CategoryCard category={category} onBook={onBookCategory} />
            </StaggerItem>
          ))}

          {/* Closes the last row so the bento reads flush rather than gap-toothed. */}
          <StaggerItem className="min-w-0 md:col-span-2 lg:col-span-1">
            <a
              href="#booking"
              className="group glass flex h-full min-h-[200px] flex-col justify-between rounded-2xl border-dashed border-white/12 p-6 transition-colors duration-300 ease-out hover:border-gold-400/45"
            >
              <div>
                <p className="eyebrow">Something else</p>
                <p className="mt-4 font-display text-xl leading-snug text-ink-hi">
                  A scope that is not on this list
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-ink-mid">
                  Send the brief. You get a fixed quote and a crew plan inside one business day.
                </p>
              </div>

              <span className="mt-6 inline-flex items-center gap-2 text-[13px] font-medium text-gold-300">
                Start a brief
                <ArrowUpRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </span>
            </a>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  )
}
