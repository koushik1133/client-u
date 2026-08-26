/**
 * Shared Framer Motion primitives.
 *
 * Every animated section on the site composes these, so timing and easing stay
 * identical everywhere instead of being re-invented per component.
 *
 * Performance rules baked in here:
 *  - Only `transform` and `opacity` are animated (both run on the compositor,
 *    so they never trigger layout or paint).
 *  - Scroll reveals use `whileInView` + `once`, which is IntersectionObserver
 *    under the hood — no scroll event listeners.
 *  - Every primitive collapses to its final state under `prefers-reduced-motion`.
 */

import {
  m,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  animate,
  type MotionValue,
  type Variants,
} from 'framer-motion'
import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react'

/* ---------------------------------------------------------------- easing -- */

/** Matches the `--ease-*` custom properties in index.css. */
export const EASE = {
  outExpo: [0.16, 1, 0.3, 1],
  outQuint: [0.22, 1, 0.36, 1],
  inOutSoft: [0.65, 0, 0.35, 1],
} as const

export const DURATION = {
  fast: 0.28,
  base: 0.55,
  slow: 0.85,
} as const

/* ---------------------------------------------------------------- Reveal -- */

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

const OFFSETS: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 28 },
  down: { x: 0, y: -28 },
  left: { x: 36, y: 0 },
  right: { x: -36, y: 0 },
  none: { x: 0, y: 0 },
}

interface RevealProps {
  children: ReactNode
  /** Direction the element travels *from*. Default `up`. */
  direction?: Direction
  delay?: number
  duration?: number
  className?: string
  style?: CSSProperties
  as?: ElementType
  /** How far into the viewport before it fires. Default `-12%`. */
  margin?: string
  id?: string
}

/**
 * Fade + slide an element in the first time it enters the viewport.
 * The workhorse — most scroll animation on the site is this.
 */
export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  duration = DURATION.base,
  className,
  style,
  as = 'div',
  margin = '-12%',
  id,
}: RevealProps) {
  const reduced = useReducedMotion()
  const offset = OFFSETS[direction]
  const MotionTag = m[as as 'div'] ?? m.div

  if (reduced) {
    const Tag = as as 'div'
    return (
      <Tag id={id} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  return (
    <MotionTag
      id={id}
      className={className}
      style={style}
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin }}
      transition={{ duration, delay, ease: EASE.outExpo }}
    >
      {children}
    </MotionTag>
  )
}

/* --------------------------------------------------------------- Stagger -- */

interface StaggerProps {
  children: ReactNode
  /** Seconds between each child. Keep <= 0.09 so the last item never lags. */
  gap?: number
  delay?: number
  className?: string
  style?: CSSProperties
  as?: ElementType
  margin?: string
  id?: string
}

/**
 * Parent that cascades its `<StaggerItem>` children into view.
 * Drives children through variants, so the whole list costs one observer.
 */
export function Stagger({
  children,
  gap = 0.07,
  delay = 0,
  className,
  style,
  as = 'div',
  margin = '-10%',
  id,
}: StaggerProps) {
  const reduced = useReducedMotion()
  const MotionTag = m[as as 'div'] ?? m.div

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduced ? 0 : gap,
        delayChildren: reduced ? 0 : delay,
      },
    },
  }

  return (
    <MotionTag
      id={id}
      className={className}
      style={style}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin }}
    >
      {children}
    </MotionTag>
  )
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE.outExpo },
  },
}

const itemVariantsReduced: Variants = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0 },
}

interface StaggerItemProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  as?: ElementType
}

/** A single cascading child. Must be inside a `<Stagger>`. */
export function StaggerItem({ children, className, style, as = 'div' }: StaggerItemProps) {
  const reduced = useReducedMotion()
  const MotionTag = m[as as 'div'] ?? m.div

  return (
    <MotionTag
      className={className}
      style={style}
      variants={reduced ? itemVariantsReduced : itemVariants}
    >
      {children}
    </MotionTag>
  )
}

/* ------------------------------------------------------------ TextReveal -- */

interface TextRevealProps {
  text: string
  className?: string
  /** Class applied to each word span — use for gradient runs. */
  wordClassName?: string
  delay?: number
  gap?: number
  as?: ElementType
}

/**
 * Reveals a headline word by word.
 *
 * Accessibility: the container carries the full string as `aria-label` and the
 * per-word spans are hidden from the a11y tree, so screen readers announce one
 * clean sentence rather than a stream of fragments.
 */
export function TextReveal({
  text,
  className,
  wordClassName,
  delay = 0,
  gap = 0.045,
  as = 'span',
}: TextRevealProps) {
  const reduced = useReducedMotion()
  const words = text.split(' ')
  const MotionTag = m[as as 'span'] ?? m.span

  if (reduced) {
    const Tag = as as 'span'
    return <Tag className={className}>{text}</Tag>
  }

  return (
    <MotionTag
      className={className}
      aria-label={text}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-8%' }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: gap, delayChildren: delay } },
      }}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          aria-hidden="true"
          // inline-block keeps the clip box tight to the word; the extra span
          // is what gets translated so the wrapper can hide the overflow.
          style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom' }}
        >
          <m.span
            className={wordClassName}
            style={{ display: 'inline-block', willChange: 'transform' }}
            variants={{
              hidden: { y: '110%', opacity: 0 },
              show: {
                y: '0%',
                opacity: 1,
                transition: { duration: 0.75, ease: EASE.outExpo },
              },
            }}
          >
            {word}
          </m.span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </MotionTag>
  )
}

/* -------------------------------------------------------------- Parallax -- */

interface ParallaxProps {
  children: ReactNode
  /** Pixels of drift across the full scroll pass. Keep modest (20–120). */
  distance?: number
  className?: string
  style?: CSSProperties
}

/**
 * Drifts a decorative layer against the scroll direction.
 * Never wrap body copy or controls in this — only backgrounds and imagery.
 */
export function Parallax({ children, distance = 60, className, style }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const raw = useTransform(scrollYProgress, [0, 1], [distance, -distance])
  const y = useSpring(raw, { stiffness: 120, damping: 30, mass: 0.4 })

  return (
    <div ref={ref} className={className} style={style}>
      <m.div style={reduced ? undefined : { y, willChange: 'transform' }}>{children}</m.div>
    </div>
  )
}

/** Raw scroll progress (0→1) for a section — for custom scroll-linked effects. */
export function useSectionProgress(offset: ['start end', 'end start'] | ['start start', 'end end'] = ['start end', 'end start']) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset })
  return { ref, progress: scrollYProgress }
}

/* -------------------------------------------------------------- Magnetic -- */

interface MagneticProps {
  children: ReactNode
  /** How far the element leans toward the cursor, in px. */
  strength?: number
  className?: string
}

/**
 * Pulls an element gently toward the pointer while hovered.
 * Pointer-only: disabled under reduced motion and on coarse (touch) pointers,
 * where there is no hover state to respond to.
 */
export function Magnetic({ children, strength = 14, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 22, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 260, damping: 22, mass: 0.4 })

  if (reduced) return <div className={className}>{children}</div>

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const relX = (e.clientX - rect.left) / rect.width - 0.5
    const relY = (e.clientY - rect.top) / rect.height - 0.5
    x.set(relX * strength * 2)
    y.set(relY * strength * 2)
  }

  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <m.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy }}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      {children}
    </m.div>
  )
}

/* ---------------------------------------------------------------- Counter -- */

interface CounterProps {
  to: number
  /** Decimal places to keep. Default 0. */
  decimals?: number
  duration?: number
  className?: string
}

/**
 * Counts up to `to` the first time it scrolls into view.
 * Writes through a MotionValue so the tween never re-renders React.
 */
export function Counter({ to, decimals = 0, duration = 1.6, className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15%' })
  const reduced = useReducedMotion()

  const count = useMotionValue(0)
  const text = useTransform(count, (v) =>
    v.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  )

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      count.set(to)
      return
    }
    const controls = animate(count, to, { duration, ease: EASE.outExpo })
    return () => controls.stop()
  }, [inView, to, duration, reduced, count])

  return (
    <span ref={ref} className={className}>
      <m.span>{text as unknown as MotionValue<string>}</m.span>
    </span>
  )
}
