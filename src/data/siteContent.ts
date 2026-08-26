/**
 * Editorial content for the marketing sections added in the v2 rebuild.
 * Kept separate from `mockData.ts` (which models the booking domain) so the
 * two concerns can evolve independently.
 */

export interface Testimonial {
  id: string
  quote: string
  author: string
  role: string
  company: string
  avatar: string
  rating: number
}

export interface ProcessStep {
  id: string
  index: string
  title: string
  duration: string
  description: string
  deliverables: string[]
  icon: string
}

export interface StudioStat {
  id: string
  value: number
  suffix: string
  decimals?: number
  label: string
  detail: string
}

export interface Award {
  id: string
  name: string
  body: string
  year: string
}

/* ------------------------------------------------------------ clients -- */

/** Wordmarks for the trust bar. Rendered as text, so zero image requests. */
export const CLIENT_LOGOS: string[] = [
  'PORSCHE',
  'VOGUE',
  'NETFLIX',
  'RIMOWA',
  'AESOP',
  'BELMOND',
  'MOËT',
  'A24',
  'TIFFANY & CO.',
  'FOUR SEASONS',
]

/* ------------------------------------------------------- testimonials -- */

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    quote:
      'They shot our GT3 RS campaign across three states in nine days and still delivered the broadcast master a week early. The night-drive sequence is the best automotive footage we have ever put our badge on.',
    author: 'Daniel Reyes',
    role: 'Global Brand Director',
    company: 'Porsche North America',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
    rating: 5,
  },
  {
    id: 't-2',
    quote:
      'Marcus lit our September editorial in a way the retoucher barely had to touch. Every frame came off the card looking like the final page.',
    author: 'Elena Whitmore',
    role: 'Senior Photo Editor',
    company: 'Vogue US',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    rating: 5,
  },
  {
    id: 't-3',
    quote:
      'We had 340 guests at a Napa estate and never once noticed a camera. Then the teaser landed 36 hours later and my wife cried at her desk. Worth every dollar.',
    author: 'James Sterling',
    role: 'Client',
    company: 'Sterling / Vance Wedding',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
  },
  {
    id: 't-4',
    quote:
      'The FPV drone work through our Manhattan flagship became the anchor of the entire launch. Our engagement rate tripled against the previous quarter.',
    author: 'Priya Raghunathan',
    role: 'VP Marketing',
    company: 'RIMOWA Americas',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80',
    rating: 5,
  },
  {
    id: 't-5',
    quote:
      'Six shoot days, four cities, one crew, zero drama. Their pre-production deck alone was more thorough than most agencies deliver as a final cut.',
    author: 'Thomas Beckett',
    role: 'Executive Producer',
    company: 'A24 Commercial',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    rating: 5,
  },
  {
    id: 't-6',
    quote:
      'I have booked studios in Paris, Milan and New York. This is the only one where the colour grade came back exactly as briefed on the first pass.',
    author: 'Camille Fontaine',
    role: 'Creative Director',
    company: 'Moët Hennessy',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    rating: 5,
  },
]

/* ------------------------------------------------------------ process -- */

export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: 'p-1',
    index: '01',
    title: 'Creative Brief',
    duration: 'Day 1–3',
    description:
      'A 60-minute call with the director who will actually be on set. We leave with a locked mood board, shot hierarchy and a fixed quote — no change orders later.',
    deliverables: ['Director call', 'Mood board & references', 'Fixed-fee quote', 'Shot hierarchy'],
    icon: 'MessageSquare',
  },
  {
    id: 'p-2',
    index: '02',
    title: 'Pre-Production',
    duration: 'Day 4–12',
    description:
      'Location scouting, permits, casting and a full lighting plot. You approve a shot-by-shot storyboard before a single case leaves the building.',
    deliverables: ['Location scout & permits', 'Lighting plot', 'Storyboard approval', 'Crew call sheet'],
    icon: 'ClipboardList',
  },
  {
    id: 'p-3',
    index: '03',
    title: 'Shoot Day',
    duration: 'Day 13',
    description:
      'Our crew arrives two hours ahead of call time. Dual-recorded 8K RAW, on-set data wrangling and a live monitor feed so you approve frames as they happen.',
    deliverables: ['8K RAW dual-record', 'Live client monitor', 'On-set data backup', 'Same-day selects'],
    icon: 'Clapperboard',
  },
  {
    id: 'p-4',
    index: '04',
    title: 'Post & Delivery',
    duration: 'Day 14–24',
    description:
      'DaVinci Resolve grade, Dolby Atmos mix and two rounds of revisions built into the price. Masters land in your drive in every aspect ratio you need.',
    deliverables: ['DaVinci colour grade', 'Dolby Atmos mix', '2 revision rounds', 'All-ratio masters'],
    icon: 'Sparkles',
  },
]

/* -------------------------------------------------------------- stats -- */

export const STUDIO_STATS: StudioStat[] = [
  { id: 's-1', value: 480, suffix: '+', label: 'Productions Delivered', detail: 'Since 2011' },
  { id: 's-2', value: 27, suffix: '', label: 'Industry Awards', detail: 'Emmy, Cannes Lions, Clio' },
  { id: 's-3', value: 4.9, suffix: '/5', decimals: 1, label: 'Client Rating', detail: 'Across 312 reviews' },
  { id: 's-4', value: 38, suffix: 'hr', label: 'Average Teaser Turnaround', detail: 'From final wrap' },
]

/* ------------------------------------------------------------- awards -- */

export const AWARDS: Award[] = [
  { id: 'a-1', name: 'Best Cinematography', body: 'Emmy Awards', year: '2024' },
  { id: 'a-2', name: 'Bronze Lion — Film Craft', body: 'Cannes Lions', year: '2024' },
  { id: 'a-3', name: 'Photographer of the Year', body: 'IPA Americas', year: '2023' },
  { id: 'a-4', name: 'Best Branded Content', body: 'Clio Awards', year: '2023' },
]

/* --------------------------------------------------------------- misc -- */

export const STUDIO_LOCATIONS = [
  { city: 'Los Angeles', address: '6420 Sunset Blvd, Hollywood, CA 90028', phone: '+1 (323) 555-0142', primary: true },
  { city: 'New York', address: '112 Greene St, SoHo, NY 10012', phone: '+1 (212) 555-0188', primary: false },
  { city: 'Miami', address: '2100 Collins Ave, Miami Beach, FL 33139', phone: '+1 (305) 555-0164', primary: false },
]
