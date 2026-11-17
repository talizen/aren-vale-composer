// @ts-nocheck
// Lenis smooth scroll shared by the long pages (project, about).
import Lenis from 'lenis'
import gsap from 'gsap'

let lenis = null
const listeners = new Set()

function raf(time) {
  lenis?.raf(time * 1000)
}

export function startSmoothScroll() {
  if (lenis) return lenis
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
  lenis.on('scroll', () => listeners.forEach((fn) => fn(window.scrollY)))
  gsap.ticker.add(raf)
  return lenis
}

export function stopSmoothScroll() {
  if (!lenis) return
  gsap.ticker.remove(raf)
  lenis.destroy()
  lenis = null
  listeners.clear()
}

export function scrollTo(y, opts) {
  if (lenis) lenis.scrollTo(y, opts)
  else window.scrollTo(0, y)
}

export function onScroll(fn) {
  listeners.add(fn)
  fn(window.scrollY)
  return () => listeners.delete(fn)
}
