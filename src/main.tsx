import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LazyMotion, domAnimation } from 'framer-motion'
import './index.css'
import App from './App.tsx'

/**
 * `LazyMotion` + `domAnimation` loads only the animation features this site
 * actually uses (transforms, variants, whileInView, exit) instead of the full
 * feature set. Roughly halves the Framer Motion runtime.
 *
 * The trade-off: every component must import `m` rather than `motion`.
 * `strict` makes that a hard build-time error instead of a silent regression.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LazyMotion features={domAnimation} strict>
      <App />
    </LazyMotion>
  </StrictMode>
)
