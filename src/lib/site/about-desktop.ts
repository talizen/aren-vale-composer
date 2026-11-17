// @ts-nocheck
// pages/about/index.vue + components/about/*: the whole page is one paused GSAP timeline scrubbed by
// scroll over a 2000vh wrapper, and every section is a fixed layer. Tweens are added in the order the
// original components mounted (children before parents), because labels added with "+=0" land on the
// timeline's length at that moment and later sections are positioned from those labels.
// The markup is component/about/AboutDesktop.tsx; this only animates it.
import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { startSmoothScroll, stopSmoothScroll, onScroll, scrollTo } from './scroll'

gsap.registerPlugin(MotionPathPlugin)

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
// timeline position: numbers are added, labels get a relative offset
const pos = (base, off = 0) =>
  typeof base === 'number' ? base + off : off ? `${base}${off < 0 ? '-=' : '+='}${Math.abs(off)}` : base

// SectionIndicatorAndMusic.vue
const CHAPTER_LABELS = [null, 'introVideosEnded', 'simpleMagicTextEnded', 'countries', 'magicText']

// MagicExplodingTextRows.vue: per-letter targets, authored for a 16-letter row
const EXPLODE_IN = [
  ['-30rem', '-20rem', '-10deg'], ['-20rem', '-10rem', '-30deg'], ['-17rem', '-12rem', '-10deg'], ['-12rem', '-15rem', '-20deg'],
  ['-8rem', '-12rem', '-10deg'], ['-4rem', '-18rem', '-12deg'], ['-2rem', '-20rem', '-10deg'], ['-20rem', '10rem', '-30deg'],
  ['14rem', '-10rem', '-10deg'], ['18rem', '-8rem', '-10deg'], ['-20rem', '-10rem', '-30deg'], ['6rem', '6rem', '-10deg'],
  ['16rem', '10rem', '10deg'], ['20rem', '8rem', '-5deg'], ['22rem', '12rem', '10deg'], ['30rem', '16rem', '-10deg'],
]
const EXPLODE_OUT = [
  ['-50rem', '-22rem', '-10deg', 0, 2.5, '1px'], ['-20rem', '-35rem', '-10deg', 0.4, 12, '1px'], ['-38rem', '-22rem', '-10deg', 0.4, 4, '1px'],
  ['-32rem', '-20rem', '-20deg', 0.2, 4, '0.5px'], ['-16rem', '-20rem', '-10deg', 0.4, 8, '1px'], ['-4rem', '-22rem', '-10deg', 0.4, 5, '1px'],
  ['-12rem', '-40rem', '10deg', 0, 5, '1px'], ['-20rem', '10rem', '-30deg', 0.4, 5, '1px'], ['6rem', '-14rem', '10deg', 0.4, 8, '1px'],
  ['18rem', '-12rem', '2deg', 0.4, 8, '1px'], ['-20rem', '-10rem', '-30deg', 0.4, 5, '1px'], ['-2rem', '-26rem', '-10deg', 0.4, 5, '1px'],
  ['14rem', '-28rem', '10deg', 0.4, 5, '1px'], ['26rem', '-32rem', '-10deg', 0.4, 12, '1px'], ['30rem', '-18rem', '-10deg', 0.4, 4, '1px'],
  ['50rem', '-26rem', '-20deg', 0, 5, '1px'],
]

const MASK_PROP = typeof document !== 'undefined' && !('maskImage' in document.documentElement.style) ? 'webkitMaskImage' : 'maskImage'
const MASK_FROM = 'linear-gradient(to left, rgba(0, 0, 0, 0) 100%, rgba(0, 0, 0, 1) 100%)'
const MASK_TO = 'linear-gradient(to left, rgba(0, 0, 0, 0) -100%, rgba(0, 0, 0, 1) 100%)'

export function mountAboutDesktop(root) {
  const $ = (ref) => root.querySelector(`[data-r="${ref}"]`)
  const $$ = (sel, ctx = root) => [...ctx.querySelectorAll(sel)]

  const allNodes = [root, ...root.querySelectorAll('*')]
  const initialStyles = allNodes.map((n) => n.getAttribute('style'))
  const videoLayers = [
    [$('introVideos'), $$('video', $('introVideos'))],
    [$('vtVideo'), $$('video', $('vtVideo'))],
    [$('fvWrap'), $$('video', $('fvWrap'))],
  ]
  const momImgs = $$('.ab-mom')
  const socialsEl = $('socials')
  const indItems = $$('.ab-ind-item')
  const indBox = root.querySelector('.ab-ind-box')

  // Countries.vue: names bow out to the right at both ends of the list
  const mid = Math.floor($$('[data-cn]').length / 2)
  const countryX = $$('[data-cn]').map((_, o) => 10 * Math.pow(Math.abs(o - mid) / mid, 2))

  let tl = null

  function build() {
    const vh = window.innerHeight
    const vw = window.innerWidth
    tl = gsap.timeline({ paused: true })
    const add = (targets, { from, to, at = 0, label, labelAt = '+=0' }) => {
      if (!targets || (Array.isArray(targets) && !targets.length)) return
      const tween = from && to ? gsap.fromTo(targets, from, to) : from ? gsap.from(targets, from) : gsap.to(targets, to)
      tl.add(tween, at)
      if (label) tl.addLabel(label, labelAt)
    }

    // MagicText1.vue: words fly off up-left, split words drop their letters, and the block wipes in with a mask
    const magicText = (h3, words, delay, label) => {
      const n = words.length
      const fly = () => ({ y: '-12rem', x: `-${n * 0.5}rem`, opacity: 0, duration: 0.4, ease: 'Power1.easeIn' })
      ;[...h3.children].forEach((w, i) => {
        const off = 0.45 + i * 0.035
        if (!w.hasAttribute('data-split')) return add(w, { to: fly(), at: pos(delay, off) })
        add(w.querySelector('.ab-hollow-word'), { to: fly(), at: pos(delay, off) })
        $$('.ab-fill', w).forEach((l, u) =>
          add(l, {
            to: { y: `${4 + u * 2}rem`, x: `${1 + u}rem`, opacity: 0, duration: 0.4, ease: 'Power1.easeIn' },
            at: pos(delay, off - u * 0.01),
          }),
        )
      })
      add(h3, { from: { [MASK_PROP]: MASK_FROM }, to: { [MASK_PROP]: MASK_TO, duration: 0.95 }, at: delay, label })
    }

    // 1. first chapter headline
    magicText($('magic1'), [...$('magic1').children], 1.55, 'firstMagicTextEnded')

    // 2. MagicExplodingText2.vue (rows first, they are its child component)
    {
      const D = 'firstMagicTextEnded'
      const rows = $('mt2Rows')
      const ml = $$('[data-ml]', rows)
      const k = (e) => Math.round((e * (EXPLODE_IN.length - 1)) / Math.max(1, ml.length - 1))
      add($$('[data-row]', rows), { from: { opacity: 0, y: () => '2rem', stagger: 0.035, ease: 'Power1.easeOut', duration: 0.4 }, at: D })
      add($$('[data-hl]', rows), {
        from: { opacity: 0, y: (e) => `${-10 - e}rem`, x: (e) => `-${10 + e}rem`, stagger: -0.035, ease: 'Power2.easeOut', duration: 0.4 },
        at: pos(D, -0.4),
      })
      add(ml, {
        to: { x: (e) => EXPLODE_IN[k(e)][0], y: (e) => EXPLODE_IN[k(e)][1], rotate: (e) => EXPLODE_IN[k(e)][2], scale: 1.6, ease: 'Power1.easeOut', duration: 0.4 },
        at: pos(D, 0.8),
      })
      add(ml, {
        to: {
          x: (e) => EXPLODE_OUT[k(e)][0],
          y: (e) => EXPLODE_OUT[k(e)][1],
          rotate: (e) => EXPLODE_OUT[k(e)][2],
          opacity: (e) => EXPLODE_OUT[k(e)][3],
          scale: (e) => EXPLODE_OUT[k(e)][4],
          filter: (e) => `blur(${EXPLODE_OUT[k(e)][5]})`,
          ease: 'Power1.easeInOut',
          duration: 1,
        },
        at: pos(D, 1.25),
      })
      add(ml, {
        to: {
          opacity: 0,
          x: `${Math.random() * 10}rem`,
          y: '-=20rem',
          rotate: `+=${gsap.utils.random(-40, 40)}deg`,
          scale: `+=${gsap.utils.random(0, 3)}`,
          filter: 'blur(2px)',
          ease: 'Power1.easeInOut',
          duration: 1,
        },
        at: pos(D, 2.25),
      })
      add($$('[data-fade]', rows), {
        to: { opacity: 0, y: (e) => `${-(15 - e * 0.5)}rem`, duration: 0.4, stagger: 0.015, ease: 'Power1.easeIn' },
        at: pos(D, 0.65),
      })

      const big = $('mt2Big')
      const small = $('mt2Small')
      add(big, {
        from: { opacity: 0, scale: 1.5, y: '80vh', rotation: -20 },
        to: { opacity: 1, scale: 1, y: 0, rotation: 0, ease: 'Power1.easeOut', duration: 0.45 },
        at: pos(D, 0.75),
        label: 'magicText2Ended',
        labelAt: '-=1.85',
      })
      add(small, {
        from: { opacity: 0, scale: 1.5, y: '80vh', x: '100%', rotation: -20 },
        to: { opacity: 1, scale: 1, y: 0, x: 0, rotation: 0, ease: 'Power1.easeOut', duration: 0.45 },
        at: pos(D, 0.75),
      })
      for (const img of [big, small])
        add(img, { to: { y: '-50vh', scale: 0.8, duration: 0.45, opacity: 0.5, rotation: -10, ease: 'Power1.easeInOut' }, at: pos(D, 1.2) })
      for (const img of [big, small])
        add(img, { to: { y: '-100vh', duration: 1, opacity: 0, scale: 0.65, ease: 'linear' }, at: pos(D, 2.5) })
    }

    // 3. SwirlyText.vue: words ride the SVG paths in from the bottom of the screen
    {
      const D = 'magicText2Ended'
      const path = (name) => root.querySelector(`[data-path="${name}"]`)
      const ride = (p, k) => ({
        motionPath: { path: p, align: p, end: (c) => 1 - c * k },
        stagger: k,
        duration: (c) => 1 - c * k,
        ease: 'Power1.easeInOut',
      })
      const words = $$('[data-sw]')
      const left = $$('[data-swl]')
      const right = $$('[data-swr]')
      const middle = $$('[data-swm]')
      add(words, { to: ride(path('swirly'), 0.0455), at: D })
      add(left, { to: ride(path('left'), 0.0475), at: D })
      add(right, { to: ride(path('right'), 0.0475), at: D })
      add(middle, { to: ride(path('middle'), 0.0475), at: D })
      add(words, {
        from: { opacity: 1 },
        to: { y: '-100vh', x: '-35vw', duration: 1, stagger: 0.0475, opacity: 0, ease: 'Power1.easeInOut' },
        at: pos(D, 1),
        label: 'swirlyTextEnded',
        labelAt: '-=0.25',
      })
      for (const group of [left, right, middle]) add(group, { to: { opacity: 0, duration: 0.35, ease: 'linear' }, at: pos(D, 0.5) })
    }

    // 4. MagicText2.vue + MagicTextRows.vue
    {
      const D = 'swirlyTextEnded'
      const rows = $$('[data-row]', $('smRows'))
      rows.forEach((row) => {
        $$('[data-hl]', row).forEach((l, s) =>
          add(l, {
            from: { opacity: 0, x: `${-(10 - s)}rem`, y: `${-(10 + s)}rem` },
            to: { opacity: 1, y: 0, x: 0, duration: 0.4, ease: 'Power2.easeOut' },
            at: pos(D, -s * 0.035),
          }),
        )
        $$('[data-ml]', row).forEach((l, s) =>
          add(l, {
            to: { opacity: 1, duration: 0.65, x: `${30 + s * 2}rem`, y: `${10 + s}rem`, rotate: `${s * -30}deg`, ease: 'Power1.easeIn' },
            at: pos(D, 1 - s * 0.015),
          }),
        )
      })
      add(rows, { from: { opacity: 0, y: () => '2rem', stagger: 0.035, ease: 'Power1.easeOut', duration: 0.4 }, at: D })
      add(rows, {
        to: { opacity: 0, y: (t) => `${-(15 - t * 0.5)}rem`, stagger: 0.015, ease: 'Power1.easeIn', duration: 0.4 },
        at: pos(D, 0.85),
        label: 'simpleMagicTextEnded',
        labelAt: '-=0.25',
      })
    }

    // 5. VideoAndText.vue
    {
      const D = 'simpleMagicTextEnded'
      $$('[data-vrow]').forEach((row) => {
        const kind = row.dataset.vrow
        if (kind === 'zz') return add(row, { to: { opacity: 0, duration: 0.4 }, at: pos(D, 0.75) })
        const ls = $$('[data-l]', row)
        ls.forEach((l, s) => {
          if (kind === 'in')
            add(l, {
              from: { opacity: 0, y: -400, scale: 0.75, x: `-${ls.length * 2 - s * 2 + 1.25}rem` },
              to: { opacity: 1, y: 0, duration: 0.4, x: 0, delay: 0.4 - s * 0.05, scale: 1, ease: 'Power1.easeOut' },
              at: D,
            })
          else
            add(l, {
              to: { opacity: 0, duration: 0.4, x: '50vw', y: '100vh', delay: 0.55 - s * 0.035, ease: 'Power1.easeIn' },
              at: pos(D, 0.5),
            })
        })
      })
      const vid = $('vtVideo')
      const head = $('vtHead')
      add(vid, { from: { opacity: 0 }, to: { opacity: 1, duration: 0.5 }, at: D })
      add(head, { from: { opacity: 0, scale: 0.35, y: '50%' }, to: { opacity: 1, scale: 1, y: 0, duration: 0.75 }, at: pos(D, -0.1) })
      add(head, { to: { y: '-60vh', scale: 0.5, opacity: 0, duration: 0.75 }, at: pos(D, 0.85), label: 'videoEnded', labelAt: '-=0' })
      add($('vtCap'), { to: { opacity: 0, duration: 0.25 }, at: pos(D, 0.85) })
      add(vid, { to: { opacity: 0, duration: 0.4 }, at: pos(D, 0.75) })
    }

    // 6. Countries.vue (+ CountriesBottomCaption.vue, mounted first)
    {
      const bottom = $('cBottom')
      ;[...bottom.children].forEach((w, i) => {
        if (!w.hasAttribute('data-split'))
          return add(w, {
            from: { y: '5vw', x: '2vw', opacity: 0 },
            to: { y: 0, x: 0, opacity: 1, duration: 0.4, stagger: 0.15, delay: i * 0.0275, ease: 'Power1.easeOut' },
            at: 'videoEnded+=1.125',
          })
        $$('.ab-fill', w).forEach((l, u) =>
          add(l, {
            from: { y: 0, x: 0, opacity: 1 },
            to: { y: `${4 + u * 2}rem`, x: '4vw', opacity: 0, duration: 1, delay: 0.55 - u * 0.04, ease: 'Power1.easeOut' },
            at: 'videoEnded+=1.5',
          }),
        )
        add(w, {
          from: { y: '5vw', x: '2vw', opacity: 0 },
          to: { y: 0, x: 0, opacity: 1, duration: 0.4, stagger: 0.035, delay: i * 0.0275, ease: 'Power1.easeOut' },
          at: 'videoEnded+=1.19',
        })
      })
      add(bottom, {
        from: { opacity: 1, x: 0, y: 0 },
        to: { x: '-1vw', y: '-5vw', opacity: 0, duration: 0.4, stagger: 0.025, ease: 'Power1.easeIn' },
        at: 'videoEnded+=1.6',
      })

      const outer = $('cOuter')
      const wrap = $('cWrap')
      const caps = $$('[data-cc]')
      const names = $$('[data-cn]')
      const slider = $('cSlider')
      const listH = wrap.offsetHeight
      add(outer, {
        from: { scale: 2.5, transformOrigin: 'top left' },
        to: { x: 0, scale: 1, duration: 0.75, transformOrigin: 'top left', ease: 'Power1.easeInOut' },
        at: 'videoEnded+=0.15',
      })
      add(outer, {
        from: { y: '0vh', transformOrigin: 'top left' },
        to: { y: vh - listH - vh / 3, duration: 2.4, transformOrigin: 'top left', ease: 'Power1.easeIn' },
        at: 'videoEnded-=0.25',
      })
      add(caps, {
        from: { y: '5vw', opacity: 0, x: (t) => `${t * -0.25}vw` },
        to: { y: 0, x: 0, opacity: 1, duration: 0.5, stagger: 0.045, ease: 'Power1.easeOut' },
        at: 'videoEnded-=0.5',
      })
      add(names, {
        from: { y: '5vw', opacity: 0, x: (t) => `${t > mid ? 1 : -1}vw` },
        to: { y: 0, x: 0, opacity: 1, duration: 0.5, stagger: 0.0275, ease: 'Power1.easeOut' },
        at: 'videoEnded-=0.35',
      })
      add(wrap, {
        to: { scale: 3, x: '-15vw', y: '5vw', duration: 3, transformOrigin: 'bottom left', ease: 'Power1.easeInOut' },
        at: 'videoEnded+=0.15',
      })
      add(caps, {
        to: { y: '-5vw', opacity: 0, x: (t) => `${t * -0.25}vw`, duration: 0.4, stagger: 0.03, ease: 'Power1.easeIn' },
        at: 'videoEnded+=0.2',
      })
      add(names, {
        to: { y: '-5vw', opacity: 0, duration: 0.4, stagger: 0.025, x: (t) => `${-countryX[t] * 0.1}vw`, ease: 'Power1.easeIn' },
        at: 'videoEnded+=0.3',
      })
      add(slider, {
        from: { scale: 1.5, x: '40vw', y: vh / 2 + vw * 0.11, opacity: 0.25, transformOrigin: 'top left' },
        to: { scale: 1, x: 0, y: 0, opacity: 1, duration: 0.65, ease: 'Power1.easeInOut', transformOrigin: 'top left' },
        at: 'videoEnded+=0.25',
      })
      add(slider, {
        to: { scale: 1.5, x: vw * 0.1, y: vh * -0.3, duration: 0.4, opacity: 0, ease: 'Power1.easeIn', transformOrigin: 'bottom left' },
        at: 'videoEnded+=1.25',
      })
      tl.addLabel('countries', 'videoEnded+=2')
    }

    // 7. FourVideosAndText.vue: the video tunnel spins in, two text blocks swap in its middle
    {
      const wrap = $('fvWrap')
      const t1 = $('fvT1')
      const t2 = $('fvT2')
      add(wrap, { from: { scale: 2, rotate: -40, opacity: 0 }, to: { scale: 1.25, rotate: -20, opacity: 1, duration: 0.8, ease: 'Power2.easeOut' }, at: 'countries' })
      add(wrap, { to: { scale: 0.85, rotate: 20, duration: 1, ease: 'Power2.easeInOut' }, at: '>' })
      add(wrap, { to: { scale: 0.5, duration: 0.5, rotate: 40, opacity: 0 }, at: '>+0.1' })
      add(t1, { from: { scale: 1.2, transformOrigin: 'center' }, to: { scale: 1, duration: 0.5 }, at: 'countries' })
      add($$('[data-fv1]'), { from: { opacity: 0, y: 20 }, to: { opacity: 1, y: 0, stagger: 0.05, duration: 0.5 }, at: 'countries' })
      add(t1, { to: { opacity: 0, scale: 1.05, duration: 0.35 }, at: '>' })
      add(t2, { from: { opacity: 0, scale: 0.9 }, to: { opacity: 1, scale: 1, duration: 0.5 }, at: '>' })
      add(t2, { to: { opacity: 0, duration: 0.5 }, at: '>+0.1', label: 'videosAndText' })
    }

    // 8. last chapter headline
    magicText($('magic2'), [...$('magic2').children], 'videosAndText', 'magicText')

    // 9. ImageGrid.vue: headlines fly in around the main image, which zooms into the image cloud
    {
      const L = $$('[data-gl]').length
      const R = $$('[data-gr]').length
      const D = 'magicText-=0.1'
      const main = $('gMain')
      const wrap = $('gWrap')
      const gl = $$('[data-gl]')
      const gr = $$('[data-gr]')
      add($('gHead'), { from: { opacity: 0 }, to: { opacity: 1, duration: 0.5 }, at: D })
      add(main, { from: { opacity: 0, scale: 0.95 }, to: { opacity: 1, scale: 3, duration: 1 }, at: D })
      add(gl, {
        from: { opacity: 0, y: (t) => `${-L * 5 + t * 5}rem`, x: (t) => `-${L - t + 4}rem` },
        to: { opacity: 1, y: 0, x: 0, stagger: -0.025, duration: 1 - L * 0.025 },
        at: D,
      })
      add(gr, {
        from: { opacity: 0, y: (t) => `${-R * 5 + t * 5}rem`, x: (t) => `-${R - t + 4}rem` },
        to: { opacity: 1, y: 0, x: 0, stagger: -0.025, duration: 1 - R * 0.025 },
        at: D,
        label: 'startImageGrid',
      })
      add(main, { to: { scale: 1, duration: 1, ease: 'Power1.easeInOut' }, at: 'startImageGrid', label: 'fadeOutImage' })
      add(wrap, { from: { scale: 3 }, to: { scale: 1, duration: 1, ease: 'Power1.easeInOut' }, at: 'startImageGrid' })
      add(wrap, { from: { opacity: 0 }, to: { opacity: 1, duration: 0.5, ease: 'Power1.easeInOut' }, at: 'startImageGrid' })
      add(main, { to: { opacity: 0, scale: 0.9, duration: 0.5, ease: 'Power1.easeIn' }, at: 'fadeOutImage', label: 'imageGridEnded' })
      add(wrap, { to: { opacity: 0, duration: 0.5, scale: 0.9, ease: 'Power1.easeIn' }, at: 'fadeOutImage' })
      add($('gLT'), { to: { opacity: 0, duration: 0 }, at: 'startImageGrid' })
      add($('gRT'), { to: { opacity: 0, duration: 0 }, at: 'startImageGrid' })
      add(gl, {
        to: {
          x: (t) => `-${(L + 1 - t) * 4}rem`,
          y: (t) => `${-L * 5 + t * 5}rem`,
          rotate: (t) => -(L - t) * 10,
          opacity: 0,
          duration: 0.5,
          ease: 'Power1.easeInOut',
        },
        at: 'startImageGrid',
      })
      add(gr, {
        to: { x: (t) => `${R + t * 4}rem`, y: (t) => `${t * 5}rem`, rotate: (t) => t * 10, opacity: 0, duration: 0.5, ease: 'Power1.easeInOut' },
        at: 'startImageGrid',
      })
      add($('gLC'), { to: { opacity: 0, duration: 0.25 }, at: 'startImageGrid+=0.25' })
      add($('gRC'), { to: { opacity: 0, duration: 0.25 }, at: 'startImageGrid+=0.25' })
    }

    // 10. Socials.vue (desktop branch)
    {
      const H = $$('[data-sh]').length
      add($('socHollow'), { from: { y: '3rem', opacity: 0 }, to: { y: 0, opacity: 1, duration: 0.5 }, at: 'imageGridEnded-=0.1' })
      add($$('[data-sh]'), {
        from: { opacity: 0, y: (n) => `-${(H - n) * 3}rem`, x: (n) => `-${(H - n) * 2}rem` },
        to: { opacity: 1, y: 0, x: 0, duration: 0.5 },
        at: 'imageGridEnded-=0.1',
      })
      add($('socTitle'), { from: { y: '3rem', opacity: 0 }, to: { y: 0, opacity: 1, duration: 0.5 }, at: 'imageGridEnded-=0.05' })
      add($('socMid'), { from: { y: '3rem', opacity: 0 }, to: { y: 0, opacity: 1, duration: 0.5 }, at: 'imageGridEnded' })
      add($$('[data-sli]'), { from: { opacity: 0, y: '3rem' }, to: { opacity: 1, y: 0, duration: 0.5, stagger: 0.05 }, at: 'imageGridEnded+=0.05' })
    }

    // 11. about/index.vue's own intro tweens: video 2 slides aside to reveal video 1, headlines swap
    add($('introWipe'), {
      from: { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', scale: 1, x: 0 },
      to: { clipPath: 'polygon(40% 0, 100% 0, 100% 100%, 40% 100%)', scale: 1.2, x: '12%', transformOrigin: 'center center', duration: 1 },
      at: 0,
    })
    add($('aboutText1'), { from: { opacity: 1 }, to: { opacity: 0, duration: 0.5 }, at: 0.15 })
    add($('aboutText2'), { from: { opacity: 0 }, to: { opacity: 1, duration: 0.5 }, at: 0.65 })
    add($('aboutText2'), { to: { opacity: 0, duration: 0.5 }, at: 1.15 })
    add($('introVideos'), { from: { opacity: 1 }, to: { opacity: 0, duration: 0.5 }, at: 1.15, label: 'introVideosEnded', labelAt: 1.5 })
    tl.addLabel('start', 0)

    momImgs.forEach((m) => (m._left = m.offsetLeft + m.offsetWidth < vw / 2))
  }

  // SliderWithCaptions.vue: autoplays every 2.5s, click advances
  const slideImgs = $$('img', $('slider'))
  const slides = slideImgs.map((img) => ({ country: img.dataset.country, caption: img.dataset.caption }))
  const sliderCap = $('sliderCap')
  let slide = 0
  let slideTimer = null
  function showSlide(i, instant = false) {
    const prev = slideImgs[slide]
    slide = i
    const next = slideImgs[i]
    if (instant) {
      gsap.set(slideImgs, { opacity: 0, scale: 1.1 })
      gsap.set(next, { opacity: 1, scale: 1 })
    } else {
      if (prev !== next) gsap.to(prev, { opacity: 0, scale: 1.1, duration: 0.8, overwrite: true })
      gsap.fromTo(next, { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 0.8, delay: 0.2, overwrite: true })
    }
    sliderCap.querySelector('.ab-slider-label').innerHTML = slides[i].country || ''
    sliderCap.querySelector('.ab-slider-text').innerHTML = slides[i].caption || ''
    if (!instant) gsap.fromTo(sliderCap, { opacity: 0 }, { opacity: 1, duration: 0.6, overwrite: true })
  }
  const nextSlide = () => showSlide((slide + 1) % slides.length)
  const startSlider = () => {
    clearInterval(slideTimer)
    slideTimer = setInterval(nextSlide, 2500)
  }
  const onSliderClick = () => {
    nextSlide()
    startSlider()
  }
  $('slider').addEventListener('click', onSliderClick)

  // the scroll velocity in px/s past a 100px/s dead zone (Lenis.vue "scrollMomentum") tilts the image cloud
  let lastY = window.scrollY
  let lastT = performance.now()
  let momentum = 0
  function trackMomentum(y) {
    const now = performance.now()
    const dt = (now - lastT) / 1000
    let m = 0
    if (dt > 0) {
      const v = (y - lastY) / dt
      m = Math.abs(v) > 100 ? (v > 0 ? v - 100 : v + 100) : 0
    }
    lastY = y
    lastT = now
    if (m === momentum) return
    momentum = m
    if (gsap.getProperty($('gWrap'), 'opacity') <= 0) return
    const r = clamp(m / 30, -50, 50)
    momImgs.forEach((img) => gsap.to(img, { rotateY: r * (img._left ? 1 : -1), duration: 2.5, ease: 'Power2.easeOut', overwrite: 'auto' }))
  }

  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight

  function update(y = window.scrollY) {
    if (!tl) return
    tl.progress(clamp(y / maxScroll(), 0, 1))
    trackMomentum(y)

    for (const [layer, vids] of videoLayers) {
      const on = gsap.getProperty(layer, 'opacity') > 0.01
      vids.forEach((v) => {
        if (on && v.paused) v.play().catch(() => {})
        else if (!on && !v.paused) v.pause()
      })
    }

    // SectionIndicatorAndMusic.vue: the latest chapter label already passed
    const t = tl.time()
    let current = null
    CHAPTER_LABELS.forEach((l) => {
      const at = l && tl.labels[l]
      if (at !== undefined && at !== null && at <= t && (!current || at > tl.labels[current])) current = l
    })
    const idx = Math.max(0, CHAPTER_LABELS.indexOf(current))
    indBox.style.transform = `translateY(${idx * 100}%)`
    indItems.forEach((item, i) => item.classList.toggle('is-active', i === idx))

    socialsEl.classList.toggle('is-active', tl.labels.imageGridEnded !== undefined && t >= tl.labels.imageGridEnded)
  }

  const indClicks = indItems.map((item, i) => () => {
    const l = CHAPTER_LABELS[i]
    const at = l ? tl.labels[l] : 0
    scrollTo((at / tl.duration()) * maxScroll() + 1)
  })
  indItems.forEach((item, i) => item.addEventListener('click', indClicks[i]))

  let resizeTimer = null
  function rebuild() {
    const p = tl ? tl.progress() : 0
    tl?.kill()
    gsap.killTweensOf(momImgs)
    gsap.set(allNodes, { clearProps: 'all' })
    allNodes.forEach((n, i) => (initialStyles[i] === null ? n.removeAttribute('style') : n.setAttribute('style', initialStyles[i])))
    build()
    tl.progress(p)
    showSlide(slide, true)
    update()
  }
  const onResize = () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(rebuild, 200)
  }

  let offScroll = null

  // both layouts are in the page; only the one in use should download its videos
  root.querySelectorAll('video').forEach((v) => (v.preload = 'auto'))
  // the opening videos only start loading now, so fade each in on its first frame instead of popping
  const introVids = $$('video', $('introVideos')).filter((v) => v.readyState < 2)
  const onFirstFrame = (e) => gsap.to(e.target, { opacity: 1, duration: 0.6, ease: 'linear' })
  introVids.forEach((v) => {
    gsap.set(v, { opacity: 0 })
    v.addEventListener('loadeddata', onFirstFrame, { once: true })
  })
  build()
  showSlide(0, true)
  startSlider()
  startSmoothScroll()
  offScroll = onScroll(update)
  window.addEventListener('resize', onResize)
  // index.css hides every layer but the opening screen until the timeline has set their start states
  root.classList.add('is-ready')

  return () => {
    root.classList.remove('is-ready')
    introVids.forEach((v) => v.removeEventListener('loadeddata', onFirstFrame))
    offScroll?.()
    window.removeEventListener('resize', onResize)
    $('slider').removeEventListener('click', onSliderClick)
    indItems.forEach((item, i) => item.removeEventListener('click', indClicks[i]))
    clearTimeout(resizeTimer)
    clearInterval(slideTimer)
    tl?.kill()
    gsap.killTweensOf([...momImgs, ...slideImgs, sliderCap])
    // the timeline leaves inline transforms behind; drop them so a remount starts from the rendered markup
    gsap.set(allNodes, { clearProps: 'all' })
    allNodes.forEach((n, i) => (initialStyles[i] === null ? n.removeAttribute('style') : n.setAttribute('style', initialStyles[i])))
    root.querySelectorAll('video').forEach((v) => v.pause())
    stopSmoothScroll()
  }
}
