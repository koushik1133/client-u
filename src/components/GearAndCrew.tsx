/**
 * GearAndCrew — the equipment vault and the two principals behind the lens.
 *
 * Structure: one section heading, a two-tab switch (Equipment / Crew), the
 * active panel, then a recognition strip. Splitting gear and people into tabs
 * keeps the section to roughly one screen instead of two, which is what makes
 * it read as a vault rather than a catalogue.
 *
 * Tab semantics follow the ARIA authoring practices pattern:
 *  - `role="tablist"` → `role="tab"` (with `aria-selected` + `aria-controls`)
 *    → `role="tabpanel"` (with `aria-labelledby`).
 *  - Roving tabindex: only the selected tab is in the tab order, and
 *    Left/Right/Home/End move selection *and* focus between tabs. Tab then
 *    moves out of the tablist and into the panel, which is why the panel
 *    carries `tabIndex={0}` — it holds no focusable content of its own.
 *  - The moving pill behind the labels is `aria-hidden`, so the accessibility
 *    tree sees a tablist containing exactly two tabs.
 *
 * Motion:
 *  - Panels crossfade through `<AnimatePresence mode="wait">` so the outgoing
 *    grid is gone before the incoming one starts — no cross-dissolve mush.
 *    `initial={false}` keeps the first paint static; only real tab switches
 *    animate.
 *  - The pill indicator translates by exactly its own width (the tablist is a
 *    2-column grid, so both tabs are the same width). Transform only — no
 *    `layout` prop, which would need `domMax`.
 *  - Cards cascade in through the shared `<Stagger>`; because the panel
 *    remounts on switch, the cascade replays on each tab change for free.
 *  - Every raw animation here is guarded by `useReducedMotion()`.
 *
 * Note on the Instagram glyph: lucide-react 1.x dropped all brand icons, so
 * the handle is marked with `AtSign` — the generic "this is a handle" glyph —
 * and the leading `@` is stripped from the string so the mark is not doubled.
 */

import { useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { Aperture, AtSign, Award, Camera, Trophy, Users } from 'lucide-react'

import { CREW_MEMBERS, GEAR_INVENTORY } from '../data/mockData'
import { AWARDS } from '../data/siteContent'
import { EASE, Stagger, StaggerItem } from '../lib/motion'
import { Img, SectionHeading, SpotlightCard, cx } from '../lib/ui'

/* ------------------------------------------------------------------ tabs -- */

type TabId = 'equipment' | 'crew'

interface TabDef {
  id: TabId
  label: string
  icon: typeof Aperture
  /** Gallery-wall label printed above the panel content. */
  caption: string
}

const TABS: TabDef[] = [
  {
    id: 'equipment',
    label: 'Equipment',
    icon: Aperture,
    caption: '04 systems · owned outright',
  },
  {
    id: 'crew',
    label: 'Crew',
    icon: Users,
    caption: '02 principals · one leads every shoot',
  },
]

const tabDomId = (id: TabId) => `studio-tab-${id}`
const panelDomId = (id: TabId) => `studio-panel-${id}`

/* --------------------------------------------------------------- helpers -- */

/** Mono label + trailing hairline. The section's recurring structural device. */
function RuleLabel({ children }: { children: string }) {
  return (
    <div className="mb-7 flex items-center gap-5">
      <span className="font-mono text-[11px] leading-none tracking-[0.2em] text-ink-mid uppercase">
        {children}
      </span>
      <span aria-hidden="true" className="rule-fade hidden h-px flex-1 sm:block" />
    </div>
  )
}

/* ------------------------------------------------------------- component -- */

export function GearAndCrew() {
  const [activeTab, setActiveTab] = useState<TabId>('equipment')
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const reduced = useReducedMotion()

  const activeIndex = TABS.findIndex((tab) => tab.id === activeTab)
  const active = TABS[activeIndex] ?? TABS[0]

  /**
   * Horizontal tablist, so only Left/Right move between tabs — Up/Down are
   * deliberately left alone, since swallowing them would break page scrolling
   * for anyone who happens to have a tab focused. Home/End jump to the ends.
   * Selection follows focus, which is the right model for two cheap panels.
   */
  const handleTabKeys = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = TABS.length - 1
    let next = -1

    if (event.key === 'ArrowRight') {
      next = index === last ? 0 : index + 1
    } else if (event.key === 'ArrowLeft') {
      next = index === 0 ? last : index - 1
    } else if (event.key === 'Home') {
      next = 0
    } else if (event.key === 'End') {
      next = last
    }

    if (next < 0) return
    event.preventDefault()
    setActiveTab(TABS[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <section id="studio" className="relative py-24 md:py-32 lg:py-40">
      {/* Hairline lid + a barely-there wash so the section lifts off the page. */}
      <div aria-hidden="true" className="rule-fade absolute inset-x-0 top-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] bg-gradient-to-b from-white/[0.022] to-transparent"
      />

      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
        <SectionHeading
          eyebrow="THE STUDIO"
          title={
            <>
              Cinema-grade glass.{' '}
              <span className="text-gradient-gold italic">And the people who point it.</span>
            </>
          }
          subtitle="Every body, lens and strobe on this page lives in the Sunset Blvd vault — owned outright, serviced quarterly, and loaded into the truck by the same two people who shoot with it."
        />

        {/* ------------------------------------------------------------ tabs -- */}
        <div className="mt-12 flex justify-center md:mt-14">
          <div
            role="tablist"
            aria-label="Studio detail"
            className="relative grid w-full max-w-[336px] grid-cols-2 rounded-full border border-white/10 bg-raise/70 p-1 backdrop-blur-sm"
          >
            {/* Moving pill. Width matches one column exactly, so x:100% lands it. */}
            <m.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full border border-gold-400/25 bg-gold-400/[0.10]"
              initial={false}
              animate={{ x: activeIndex === 0 ? '0%' : '100%' }}
              transition={{ duration: reduced ? 0 : 0.5, ease: EASE.outExpo }}
            />

            {TABS.map((tab, index) => {
              const selected = tab.id === activeTab
              const Icon = tab.icon

              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[index] = el
                  }}
                  type="button"
                  role="tab"
                  id={tabDomId(tab.id)}
                  aria-selected={selected}
                  aria-controls={panelDomId(tab.id)}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(event) => handleTabKeys(event, index)}
                  className={cx(
                    'relative z-10 inline-flex h-11 min-w-0 items-center justify-center gap-2 rounded-full',
                    'text-[13px] font-medium transition-colors duration-300 ease-out',
                    selected ? 'text-gold-200' : 'text-ink-mid hover:text-ink-hi'
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    className={cx(
                      'h-4 w-4 shrink-0 transition-colors duration-300',
                      selected ? 'text-gold-400' : 'text-ink-low'
                    )}
                  />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ---------------------------------------------------------- panel -- */}
        <div className="mt-12 md:mt-16">
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={active.id}
              role="tabpanel"
              id={panelDomId(active.id)}
              aria-labelledby={tabDomId(active.id)}
              tabIndex={0}
              initial={{ opacity: 0, y: reduced ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : -10 }}
              transition={{ duration: reduced ? 0 : 0.42, ease: EASE.outExpo }}
              className="focus-visible:outline-offset-8"
            >
              <RuleLabel>{active.caption}</RuleLabel>

              {active.id === 'equipment' ? <EquipmentPanel /> : <CrewPanel />}
            </m.div>
          </AnimatePresence>
        </div>

        {/* --------------------------------------------------------- awards -- */}
        <div className="mt-20 md:mt-24">
          <RuleLabel>Recognition</RuleLabel>

          <Stagger
            as="ul"
            gap={0.08}
            className="grid grid-cols-1 border-y border-white/[0.06] sm:grid-cols-2 lg:grid-cols-4"
          >
            {AWARDS.map((award, i) => (
              <StaggerItem
                key={award.id}
                as="li"
                className={cx(
                  'flex min-w-0 items-start gap-3.5 py-6 sm:py-7',
                  // Mobile: a hairline between every stacked row.
                  i > 0 && 'border-t border-white/[0.06]',
                  // 2-up: the second item starts a new column, not a new row.
                  i === 1 && 'sm:border-t-0',
                  i % 2 === 1 && 'sm:border-l sm:border-white/[0.06] sm:pl-6',
                  i % 2 === 0 && 'sm:pr-6',
                  // 4-up: one row, so every rule becomes vertical.
                  'lg:border-t-0',
                  i > 0 && 'lg:border-l lg:border-white/[0.06] lg:pl-6',
                  i < AWARDS.length - 1 && 'lg:pr-6'
                )}
              >
                <Trophy aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                <div className="min-w-0">
                  <p className="text-[14px] leading-snug font-medium text-ink-hi">{award.name}</p>
                  <p className="mt-1.5 font-mono text-[11px] tracking-[0.14em] text-ink-mid uppercase">
                    {award.body} · {award.year}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------- equipment panel -- */

function EquipmentPanel() {
  return (
    <Stagger gap={0.07} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {GEAR_INVENTORY.map((item) => (
        <StaggerItem key={item.id} className="min-w-0">
          <SpotlightCard
            radius={320}
            className={cx(
              'flex h-full flex-col rounded-2xl border border-line bg-panel/55',
              'transition-colors duration-500 ease-out hover:border-gold-400/30'
            )}
          >
            <Img
              src={item.image}
              alt={`${item.brand} ${item.name}`}
              ratio="4/3"
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 24vw"
              imgClassName="transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-panel via-panel/15 to-transparent"
              />
              <span className="absolute top-3 left-3 rounded-full border border-white/10 bg-void/70 px-2.5 py-1 font-mono text-[10px] tracking-[0.18em] text-ink-mid uppercase backdrop-blur-sm">
                {item.category}
              </span>
            </Img>

            <div className="flex flex-1 flex-col p-5">
              <p className="font-mono text-[10px] leading-none tracking-[0.2em] text-gold-400 uppercase">
                {item.brand}
              </p>

              <h3 className="mt-2.5 font-display text-base leading-snug text-ink-hi">
                {item.name}
              </h3>

              <p className="mt-2 text-[12px] leading-relaxed text-ink-mid">{item.specs}</p>

              <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/[0.07] pt-4">
                <span className="font-mono text-[13px] whitespace-nowrap text-ink-hi">
                  ${item.dailyRateUSD.toLocaleString('en-US')}
                  <span className="text-ink-mid"> / day</span>
                </span>

                <span className="inline-flex items-center gap-2 font-mono text-[11px] whitespace-nowrap tracking-[0.14em] uppercase">
                  <span
                    aria-hidden="true"
                    className={cx(
                      'h-1.5 w-1.5 shrink-0 rounded-full ring-[3px]',
                      item.available
                        ? 'bg-gold-400 ring-gold-400/15'
                        : 'bg-ink-low ring-white/[0.06]'
                    )}
                  />
                  <span className={item.available ? 'text-gold-300' : 'text-ink-mid'}>
                    {item.available ? 'Available' : 'On location'}
                  </span>
                </span>
              </div>
            </div>
          </SpotlightCard>
        </StaggerItem>
      ))}
    </Stagger>
  )
}

/* ------------------------------------------------------------ crew panel -- */

function CrewPanel() {
  return (
    <Stagger gap={0.09} className="grid gap-6 xl:grid-cols-2">
      {CREW_MEMBERS.map((member) => (
        <StaggerItem key={member.id} className="min-w-0">
          <SpotlightCard
            radius={520}
            className={cx(
              'flex h-full flex-col gap-6 rounded-3xl border border-line bg-panel/55 p-5',
              'transition-colors duration-500 ease-out hover:border-gold-400/25 sm:flex-row sm:gap-7 sm:p-7'
            )}
          >
            {/* Portrait: full width on phones, a fixed plate from sm up. */}
            <div className="w-full max-w-[220px] shrink-0 sm:w-[152px] sm:max-w-none lg:w-[176px]">
              <Img
                src={member.avatar}
                alt={member.name}
                ratio="1/1"
                sizes="(max-width: 640px) 60vw, 176px"
                className="rounded-2xl"
                imgClassName="transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10 ring-inset"
                />
              </Img>
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <h3 className="font-display text-2xl leading-tight text-ink-hi">{member.name}</h3>

              <p className="mt-2 font-mono text-[11px] leading-relaxed tracking-[0.16em] text-gold-400 uppercase">
                {member.role}
              </p>

              <dl className="mt-5 space-y-2.5 border-t border-white/[0.07] pt-5">
                <div className="flex items-start gap-2.5">
                  <dt className="mt-px shrink-0">
                    <Award aria-hidden="true" className="h-4 w-4 text-gold-400" />
                    <span className="sr-only">Awards</span>
                  </dt>
                  <dd className="min-w-0 text-[14px] leading-relaxed text-ink-mid">
                    {member.awards}
                  </dd>
                </div>

                <div className="flex items-start gap-2.5">
                  <dt className="mt-px shrink-0">
                    <Camera aria-hidden="true" className="h-4 w-4 text-gold-400" />
                    <span className="sr-only">Experience</span>
                  </dt>
                  <dd className="min-w-0 text-[14px] leading-relaxed text-ink-mid">
                    {member.experienceYears} years behind the lens
                  </dd>
                </div>
              </dl>

              <p className="mt-5 text-[15px] leading-relaxed text-ink-mid">{member.bio}</p>

              <ul className="mt-5 flex flex-wrap gap-2">
                {member.topShoots.map((shoot) => (
                  <li
                    key={shoot}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] leading-none text-ink-mid"
                  >
                    {shoot}
                  </li>
                ))}
              </ul>

              <p className="mt-auto flex items-center gap-2 pt-6 font-mono text-[12px] text-gold-300">
                <AtSign aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-gold-400" />
                <span className="sr-only">Instagram </span>
                <span className="min-w-0 truncate">{member.instagram.replace(/^@/, '')}</span>
              </p>
            </div>
          </SpotlightCard>
        </StaggerItem>
      ))}
    </Stagger>
  )
}
