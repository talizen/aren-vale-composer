// @ts-nocheck
// The header, word menu and #view come from component/SiteShell.tsx; page behaviour reaches them through here.
import gsap from 'gsap'

export function setMenuHidden(hidden) {
  document.querySelector('.app-menu')?.classList.toggle('is-hidden', hidden)
}

export function setHeaderHidden(hidden) {
  document.querySelector('.app-header')?.classList.toggle('is-hidden', hidden)
}

// Every route is its own page now, so the old in-app transition becomes: fade #view out, then load the next URL.
let leaving = false
export async function go(href) {
  if (leaving) return
  leaving = true
  const view = document.getElementById('view')
  if (view) await gsap.to(view, { opacity: 0, duration: 0.35, ease: 'linear' })
  window.location.assign(href)
}

// coming back through the bfcache restores the faded-out view
export function resetLeaving() {
  leaving = false
  const view = document.getElementById('view')
  if (view) gsap.set(view, { clearProps: 'opacity' })
}
