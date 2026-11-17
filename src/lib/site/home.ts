// @ts-nocheck
// Stage.vue overlay: a <Gsap mode="out-in"> slot that shows either the "Index View" link or the hovered
// project's info. All of them are already rendered by page/Index.tsx; this only swaps which one is visible.
import gsap from 'gsap'
import { Stage } from './stage'
import { images, mobileImages } from './stage-images'
import { setupCursor } from './cursor'
import { go } from './shell'

export function mountHome(root) {
  const FADE = { duration: 0.3, ease: 'linear', overwrite: true }
  const slots = Object.fromEntries([...root.querySelectorAll('[data-slot]')].map((n) => [n.dataset.slot, n]))
  const cursor = setupCursor(document.querySelector('.a-cursor'))

  let current = slots.index
  let currentKey = 'index'
  let wantedKey = 'index'
  let swapping = false

  async function swap() {
    if (swapping) return
    swapping = true
    while (currentKey !== wantedKey) {
      if (current) {
        current.style.pointerEvents = 'none'
        await gsap.to(current, { opacity: 0, ...FADE })
        current.hidden = true
        current = null
        currentKey = null
      }
      const key = wantedKey
      const node = key ? slots[key] : null
      if (node) {
        node.hidden = false
        node.style.pointerEvents = ''
        current = node
        currentKey = key
        await gsap.fromTo(node, { opacity: 0 }, { opacity: 1, ...FADE })
      } else {
        currentKey = key
      }
    }
    swapping = false
  }

  function show(key) {
    wantedKey = key
    swap()
  }

  const stage = new Stage(root.querySelector('#stage'), {
    images,
    mobileImages,
    onHover: (uid) => {
      // photos may point at a project that is not (or no longer) in the CMS
      if (uid && slots[uid]) {
        show(uid)
        cursor.show()
      } else {
        show('index')
        cursor.hide()
      }
    },
    onSelect: (uid) => slots[uid] && go(`/projects/${uid}`),
  })

  const infoClicks = Object.entries(slots)
    .filter(([key]) => key !== 'index')
    .map(([uid, node]) => {
      const fn = () => stage.select(uid)
      node.addEventListener('click', fn)
      return () => node.removeEventListener('click', fn)
    })

  const menu = document.querySelector('.app-menu')
  const onMenuEnter = () => stage.setMenuHovered(true)
  const onMenuLeave = () => stage.setMenuHovered(false)
  menu.addEventListener('mouseenter', onMenuEnter)
  menu.addEventListener('mouseleave', onMenuLeave)

  stage.show()

  return () => {
    infoClicks.forEach((off) => off())
    menu.removeEventListener('mouseenter', onMenuEnter)
    menu.removeEventListener('mouseleave', onMenuLeave)
    gsap.killTweensOf(Object.values(slots))
    stage.hide()
    stage.destroy()
    cursor.destroy()
  }
}
