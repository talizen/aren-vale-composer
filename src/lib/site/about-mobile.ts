// @ts-nocheck
// about/mobile/*: stacked sections, each with a short intro timeline that plays when it scrolls into view
// (Waypoint timeline) and resets once it is back below the viewport.
// The markup is component/about/AboutMobile.tsx; this only animates it.
import gsap from 'gsap'

export function mountAboutMobile(root) {
  const $ = (ref) => root.querySelector(`[data-r="${ref}"]`)
  const $$ = (sel, ctx = root) => [...ctx.querySelectorAll(sel)]

  // presets.fadeUp from the original Tween component
  const fadeUp = (tl, target, delay, rotate) =>
    tl.fromTo(
      target,
      { opacity: 0, y: '4rem', ...(rotate ? { rotate } : {}) },
      { opacity: 1, y: 0, ...(rotate ? { rotate: 0 } : {}), duration: 1, ease: 'Power2.easeOut', delay },
      0,
    )

  function buildTimeline(sec) {
    const tl = gsap.timeline({ paused: true })
    const kind = sec.dataset.wp
    if (kind === 'rows') {
      tl.from($$('.abm-row', sec), { opacity: 0, y: '2rem', stagger: 0.035, ease: 'Power1.easeOut', duration: 0.8 }, 0.3)
    } else if (kind === 'vt') {
      // durationMultiplier 2, no fade-out
      $$('[data-in] [data-l]', sec).forEach((l, s, all) =>
        tl.fromTo(
          l,
          { opacity: 0, y: -400, scale: 0.75, x: `-${all.length * 2 - s * 2 + 1.25}rem` },
          { opacity: 1, y: 0, x: 0, scale: 1, duration: 0.8, delay: 0.4 - s * 0.05, ease: 'Power1.easeOut' },
          0,
        ),
      )
      tl.fromTo($('vtVideo'), { opacity: 0 }, { opacity: 1, duration: 1 }, 0)
      tl.fromTo($('vtHead'), { opacity: 0, scale: 0.35, yPercent: 50 }, { opacity: 1, scale: 1, yPercent: 0, duration: 1.5 }, 0)
    } else if (kind === 'socials') {
      tl.fromTo($('socHollow'), { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0)
      tl.fromTo($('socTitle'), { y: '3rem', opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.05)
      tl.fromTo($('socMid'), { y: '3rem', opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.1)
      tl.fromTo($$('[data-sli]', sec), { opacity: 0, y: '3rem' }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05 }, 0.15)
    } else {
      $$('[data-fade]', sec).forEach((n) => fadeUp(tl, n, +n.dataset.fade, n.dataset.rotate ? +n.dataset.rotate : 0))
    }
    return tl
  }

  const sections = $$('[data-wp]')
  const timelines = new Map()
  const waypoints = new IntersectionObserver((entries) =>
    entries.forEach((e) => {
      const tl = timelines.get(e.target)
      if (!tl) return
      if (e.isIntersecting || e.boundingClientRect.top < 0) {
        if (!e.target._played) {
          e.target._played = true
          tl.play(0)
        }
      } else if (e.boundingClientRect.top > 0) {
        e.target._played = false
        tl.pause().progress(0)
      }
    }),
  )

  // videos only run while on screen
  const videos = $$('video')
  const videoWatch = new IntersectionObserver((entries) =>
    entries.forEach((e) => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause())),
  )

  // SliderWithCaptions.vue: 2.5s autoplay, tap to advance, caption "Country: caption" under the image
  const slideImgs = $$('img', $('slider'))
  const slides = slideImgs.map((img) => ({ country: img.dataset.country, caption: img.dataset.caption }))
  const sliderCap = $('sliderCap')
  let slide = 0
  let slideTimer = null
  const plain = (html) => {
    const d = document.createElement('div')
    d.innerHTML = html || ''
    return d.textContent.replace(/ /g, ' ')
  }
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
    const s = slides[i]
    sliderCap.textContent = `${s.country || ''}${s.country ? ': ' : ''}${plain(s.caption)}`
  }
  const startSlider = () => {
    clearInterval(slideTimer)
    slideTimer = setInterval(() => showSlide((slide + 1) % slides.length), 2500)
  }
  const onSliderClick = () => {
    showSlide((slide + 1) % slides.length)
    startSlider()
  }
  $('slider').addEventListener('click', onSliderClick)

  // Parallax.vue on the image grid
  const parallax = $$('[data-parallax]').filter((n) => +n.dataset.parallax)
  let raf = 0
  const onScrollParallax = () => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      const vh = window.innerHeight
      parallax.forEach((n) => {
        const r = n.getBoundingClientRect()
        if (r.bottom < -vh || r.top > 2 * vh) return
        gsap.set(n, { y: -(r.top + r.height / 2 - vh / 2) * +n.dataset.parallax })
      })
    })
  }

  // both layouts are in the page; only the one in use should download its videos
  videos.forEach((v) => (v.preload = 'auto'))
  sections.forEach((sec) => {
    timelines.set(sec, buildTimeline(sec))
    waypoints.observe(sec)
  })
  videos.forEach((v) => videoWatch.observe(v))
  showSlide(0, true)
  startSlider()
  window.addEventListener('scroll', onScrollParallax, { passive: true })
  onScrollParallax()
  // index.css keeps the animated pieces hidden until their timelines have set their start states
  root.classList.add('is-ready')

  return () => {
    root.classList.remove('is-ready')
    sections.forEach((sec) => (sec._played = false))
    waypoints.disconnect()
    videoWatch.disconnect()
    timelines.forEach((tl) => tl.kill())
    $('slider').removeEventListener('click', onSliderClick)
    clearInterval(slideTimer)
    cancelAnimationFrame(raf)
    window.removeEventListener('scroll', onScrollParallax)
    gsap.killTweensOf([...slideImgs, ...parallax])
    videos.forEach((v) => v.pause())
  }
}
