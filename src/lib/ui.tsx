/**
 * Reusable UI primitives, in the spirit of the 21st.dev registry
 * (spotlight card, marquee, border beam, tilt, shiny text, scroll progress)
 * but written against this project's own tokens so there is no runtime
 * dependency and no extra network request.
 */

import { m, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import {
  useCallback,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { Magnetic } from './motion'

/* ------------------------------------------------------------------- cx -- */

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

/* ------------------------------------------------------- ScrollProgress -- */

/** Hairline gold bar across the top of the viewport tracking page scroll. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 30, restDelta: 0.001 })

  return (
    <m.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-gold-500 via-gold-300 to-ember-400"
      style={{ scaleX }}
    />
  )
}

/* ------------------------------------------------------------------ Img -- */

const UNSPLASH_WIDTHS = [480, 768, 1080, 1600, 2000]

/** Rewrites an Unsplash URL to request WebP at an exact width. */
function unsplashAt(url: string, width: number, quality = 72) {
  const [base] = url.split('?')
  return `${base}?auto=format&fit=crop&fm=webp&w=${width}&q=${quality}`
}

function isUnsplash(url: string) {
  return url.includes('images.unsplash.com')
}

interface ImgProps {
  src: string
  alt: string
  /** `width / height`, e.g. `16/9`. Reserves space so nothing shifts (CLS = 0). */
  ratio?: string
  className?: string
  imgClassName?: string
  /** Above-the-fold images: eager + high priority, skips lazy loading. */
  priority?: boolean
  sizes?: string
  style?: CSSProperties
  children?: ReactNode
}

/**
 * Image with the layout box reserved up front and a WebP srcset generated for
 * Unsplash sources. Ships roughly a third of the bytes of the original
 * `?w=1200&q=80` JPEG URLs the mock data used, and eliminates layout shift.
 */
export function Img({
  src,
  alt,
  ratio = '16/9',
  className,
  imgClassName,
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  style,
  children,
}: ImgProps) {
  const [loaded, setLoaded] = useState(false)
  const remote = isUnsplash(src)

  const srcSet = remote
    ? UNSPLASH_WIDTHS.map((w) => `${unsplashAt(src, w)} ${w}w`).join(', ')
    : undefined

  return (
    <div
      className={cx('relative overflow-hidden bg-panel', className)}
      style={{ aspectRatio: ratio, ...style }}
    >
      <img
        src={remote ? unsplashAt(src, 1080) : src}
        srcSet={srcSet}
        sizes={remote ? sizes : undefined}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        className={cx(
          'h-full w-full object-cover transition-opacity duration-700 ease-out',
          loaded ? 'opacity-100' : 'opacity-0',
          imgClassName
        )}
      />
      {children}
    </div>
  )
}

/* -------------------------------------------------------- SpotlightCard -- */

interface SpotlightCardProps {
  children: ReactNode
  className?: string
  /** Radius of the cursor glow in px. */
  radius?: number
}

/**
 * Card that lights up under the cursor. The glow position is written to CSS
 * custom properties rather than React state, so moving the mouse never
 * triggers a re-render.
 */
export function SpotlightCard({ children, className, radius = 380 }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`)
    el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`)
    el.style.setProperty('--spot-opacity', '1')
  }, [])

  const handleLeave = useCallback(() => {
    ref.current?.style.setProperty('--spot-opacity', '0')
  }, [])

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={cx('group relative overflow-hidden', className)}
      style={{ '--spot-opacity': 0 } as CSSProperties}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          opacity: 'var(--spot-opacity)',
          background: `radial-gradient(${radius}px circle at var(--spot-x) var(--spot-y), rgb(239 195 94 / 0.14), transparent 70%)`,
        }}
      />
      {children}
    </div>
  )
}

/* ------------------------------------------------------------ TiltCard -- */

interface TiltCardProps {
  children: ReactNode
  className?: string
  /** Max rotation in degrees. Subtle beats dramatic here. */
  max?: number
}

/** Tips toward the cursor in 3D. Mouse-only, and off under reduced motion. */
export function TiltCard({ children, className, max = 7 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const srx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 220, damping: 24 })
  const sry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 220, damping: 24 })

  if (reduced) return <div className={className}>{children}</div>

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    px.set((e.clientX - rect.left) / rect.width)
    py.set((e.clientY - rect.top) / rect.height)
  }

  const reset = () => {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <m.div
      ref={ref}
      className={className}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      style={{ rotateX: srx, rotateY: sry, transformPerspective: 1000, transformStyle: 'preserve-3d' }}
    >
      {children}
    </m.div>
  )
}

/* ------------------------------------------------------------ BorderBeam -- */

/** A light that travels around a container's border. Purely decorative. */
export function BorderBeam({ className, duration = 8 }: { className?: string; duration?: number }) {
  return (
    <span
      aria-hidden="true"
      className={cx('pointer-events-none absolute inset-0 rounded-[inherit]', className)}
      style={{
        padding: '1px',
        background: `conic-gradient(from var(--beam-angle, 0deg), transparent 0deg, transparent 300deg, var(--color-gold-400) 340deg, var(--color-ember-400) 350deg, transparent 360deg)`,
        WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        animation: `beam-spin ${duration}s linear infinite`,
      }}
    />
  )
}

/* ------------------------------------------------------------ ShinyText -- */

/** Text with a light sweeping across it. Used sparingly for premium accents. */
export function ShinyText({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion()
  return (
    <span
      className={cx(reduced ? 'text-gold-300' : 'shiny-text', className)}
      style={reduced ? undefined : { animationDuration: '4.5s' }}
    >
      {children}
    </span>
  )
}

/* -------------------------------------------------------------- Marquee -- */

interface MarqueeProps {
  children: ReactNode
  /** Seconds for one full pass. Higher = slower. */
  speed?: number
  reverse?: boolean
  className?: string
  pauseOnHover?: boolean
}

/**
 * Seamless infinite scroll. The track holds two identical copies and
 * translates by exactly -50%, so the loop point is invisible.
 */
export function Marquee({
  children,
  speed = 40,
  reverse = false,
  className,
  pauseOnHover = true,
}: MarqueeProps) {
  const reduced = useReducedMotion()

  if (reduced) {
    return (
      <div className={cx('flex gap-6 overflow-x-auto', className)}>
        <div className="flex shrink-0 items-center gap-6">{children}</div>
      </div>
    )
  }

  return (
    <div
      className={cx('marquee group relative flex overflow-hidden', className)}
      style={
        {
          '--marquee-duration': `${speed}s`,
          '--marquee-direction': reverse ? 'reverse' : 'normal',
        } as CSSProperties
      }
    >
      <div className={cx('marquee-track flex shrink-0 items-center', pauseOnHover && 'group-hover:[animation-play-state:paused]')}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- Button -- */

type Variant = 'primary' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  /** Wrap in a `<Magnetic>` so it leans toward the cursor. */
  magnetic?: boolean
  children: ReactNode
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-gold-400 to-gold-500 text-[#0a0a0a] font-semibold shadow-[0_10px_36px_-12px_rgb(224_168_46/0.65)] hover:from-gold-300 hover:to-gold-400 hover:shadow-[0_14px_44px_-10px_rgb(224_168_46/0.8)]',
  outline:
    'border border-white/15 bg-white/[0.03] text-ink-hi hover:border-gold-400/60 hover:bg-gold-400/[0.08] hover:text-gold-200',
  ghost: 'text-ink-mid hover:bg-white/[0.06] hover:text-ink-hi',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-[13px] gap-1.5',
  md: 'h-11 px-6 text-sm gap-2',
  lg: 'h-[52px] px-8 text-[15px] gap-2.5',
}

/** All interactive CTAs on the site route through this so states stay uniform. */
export function Button({
  variant = 'primary',
  size = 'md',
  magnetic = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  const node = (
    <button
      className={cx(
        'relative inline-flex items-center justify-center rounded-full whitespace-nowrap',
        'transition-[background,border-color,color,box-shadow,transform] duration-300 ease-out',
        'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )

  return magnetic ? <Magnetic className="inline-block">{node}</Magnetic> : node
}

/* -------------------------------------------------------- SectionHeading -- */

interface SectionHeadingProps {
  eyebrow?: string
  title: ReactNode
  subtitle?: string
  align?: 'left' | 'center'
  className?: string
}

/** Consistent eyebrow → headline → deck block above every major section. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className,
}: SectionHeadingProps) {
  const centered = align === 'center'
  return (
    <div className={cx('max-w-3xl', centered && 'mx-auto text-center', className)}>
      {eyebrow && (
        <m.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.5 }}
          className={cx('eyebrow mb-4 flex items-center gap-3', centered && 'justify-center')}
        >
          <span className="h-px w-8 bg-gold-500/60" aria-hidden="true" />
          {eyebrow}
          <span className="h-px w-8 bg-gold-500/60" aria-hidden="true" />
        </m.p>
      )}

      <h2 className="font-display text-[length:var(--text-display-sm)] leading-[1.06] text-ink-hi">
        {title}
      </h2>

      {subtitle && (
        <m.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className={cx('mt-5 text-[15px] leading-relaxed text-ink-mid', centered && 'mx-auto max-w-2xl')}
        >
          {subtitle}
        </m.p>
      )}
    </div>
  )
}
