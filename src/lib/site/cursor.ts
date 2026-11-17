// @ts-nocheck
// Cursor.vue: "Learn More" letters trail the pointer with a 0.025s stagger.
import gsap from 'gsap'

export function setupCursor(el, text = 'Learn More') {
  el.innerHTML = [...text].map((c) => `<span>${c === ' ' ? '&nbsp;' : c}</span>`).join('')
  const letters = [...el.children]
  const pos = { x: 0, y: 0 }
  let visible = false
  const touch = window.matchMedia('(pointer: coarse)').matches

  const onMove = (e) => {
    pos.x = e.clientX
    pos.y = e.clientY
    if (!visible) return
    gsap.to(letters, { x: pos.x, y: pos.y, duration: 1, ease: 'power4.out', stagger: 0.025, overwrite: 'auto' })
  }
  window.addEventListener('mousemove', onMove, { passive: true })

  return {
    show() {
      if (touch || visible) return
      visible = true
      gsap.fromTo(
        letters,
        { x: pos.x + 40, y: pos.y },
        { opacity: 1, x: pos.x, y: pos.y, duration: 1, stagger: 0.025, overwrite: 'auto', ease: 'power2.out' },
      )
    },
    hide() {
      if (!visible) return
      visible = false
      gsap.to(letters, { opacity: 0, duration: 0.2, overwrite: true, ease: 'linear' })
    },
    destroy() {
      window.removeEventListener('mousemove', onMove)
      gsap.killTweensOf(letters)
      el.innerHTML = ''
    },
  }
}
