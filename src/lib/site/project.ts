// @ts-nocheck
// Project page behaviour on top of the markup from page/projects/[uid].tsx: "More Info" toggle, the song
// player, the "Inside the score" instruments panel and the full-screen video with its separate music track.
import gsap from 'gsap'
import { startSmoothScroll, stopSmoothScroll } from './scroll'
import { setMenuHidden, setHeaderHidden } from './shell'

export const formatTime = (sec) => {
  if (!isFinite(sec)) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

const playIcon = `<svg viewBox="0 0 10 10"><path d="M2 1 L9 5 L2 9 Z" fill="none" stroke="currentColor" stroke-width="0.9"/></svg>`
const pauseIcon = `<svg viewBox="0 0 10 10"><path d="M3 1 V9 M7 1 V9" stroke="currentColor" stroke-width="1"/></svg>`
const PLAY_SOUND = '&#9655; Play Sound'
const STOP_SOUND = '&#10073;&#10073; Stop Sound'

// p: { songs: [{ url }], video, music_for_video }
export function mountProject(root, p) {
  const cleanups = []
  const on = (target, ev, fn, opts) => {
    if (!target) return
    target.addEventListener(ev, fn, opts)
    cleanups.push(() => target.removeEventListener(ev, fn, opts))
  }

  // --- More info toggle ---
  const more = root.querySelector('.project-more')
  const moreBtn = root.querySelector('.project-head .link-plus')
  if (more && moreBtn) {
    let open = false
    on(moreBtn, 'click', () => {
      open = !open
      more.style.height = open ? `${more.scrollHeight}px` : '0px'
      moreBtn.querySelector('.plus').classList.toggle('is-close', open)
      moreBtn.querySelector('.label').textContent = open ? 'Close' : 'More Info'
    })
  }

  // --- Song player ---
  const songs = p.songs || []
  const audio = new Audio()
  audio.preload = 'none'
  let currentSong = null
  const songRows = [...root.querySelectorAll('.song')]
  const probes = []

  songRows.forEach((row, i) => {
    // fetch durations
    const probe = new Audio()
    probe.preload = 'metadata'
    probe.src = songs[i]?.url || ''
    probe.addEventListener('loadedmetadata', () => {
      row.querySelector('.dur').textContent = formatTime(probe.duration)
      probe.src = ''
    })
    probes.push(probe)
    on(row, 'click', () => toggleSong(i))
  })

  function setRowState(i, playing) {
    const row = songRows[i]
    if (!row) return
    row.classList.toggle('is-playing', playing)
    row.querySelector('.s-play').innerHTML = playing ? pauseIcon : playIcon
  }

  function toggleSong(i) {
    stopInstrumentSound()
    if (currentSong === i) {
      if (audio.paused) {
        audio.play()
        setRowState(i, true)
      } else {
        audio.pause()
        setRowState(i, false)
      }
      return
    }
    if (currentSong !== null) {
      setRowState(currentSong, false)
      songRows[currentSong].querySelector('.progress').style.width = '0'
      songRows[currentSong].querySelector('.cur').textContent = '0:00'
    }
    currentSong = i
    audio.src = songs[i].url
    audio.play().catch(() => {})
    setRowState(i, true)
  }

  on(audio, 'timeupdate', () => {
    if (currentSong === null) return
    const row = songRows[currentSong]
    row.querySelector('.cur').textContent = formatTime(audio.currentTime)
    row.querySelector('.progress').style.width = `${(audio.currentTime / audio.duration) * 100 || 0}%`
  })
  on(audio, 'ended', () => {
    const nextI = currentSong + 1
    setRowState(currentSong, false)
    if (nextI < songRows.length) toggleSong(nextI)
    else currentSong = null
  })

  // --- Instruments panel ---
  const panel = root.querySelector('.behind-panel')
  const overlay = root.querySelector('.behind-overlay')
  const instrumentAudio = new Audio()
  let playingSoundBtn = null

  function stopInstrumentSound() {
    instrumentAudio.pause()
    if (playingSoundBtn) {
      const v = playingSoundBtn.closest('.instrument-body').querySelector('video')
      if (v) v.muted = true
      playingSoundBtn.innerHTML = PLAY_SOUND
      playingSoundBtn = null
    }
  }

  if (panel) {
    const openPanel = (open) => {
      panel.classList.toggle('is-open', open)
      overlay.classList.toggle('is-open', open)
      setMenuHidden(open)
      const v = panel.querySelector('.instrument.is-open video')
      if (open) v?.play().catch(() => {})
      else {
        panel.querySelectorAll('video').forEach((x) => x.pause())
        stopInstrumentSound()
      }
    }
    on(root.querySelector('.behind-badge'), 'click', () => openPanel(true))
    on(overlay, 'click', () => openPanel(false))
    on(panel.querySelector('.behind-close'), 'click', () => openPanel(false))

    panel.querySelectorAll('.instrument').forEach((ins) => {
      on(ins.querySelector('.instrument-head'), 'click', () => {
        stopInstrumentSound()
        panel.querySelectorAll('.instrument').forEach((o) => {
          o.classList.toggle('is-open', o === ins)
          o.querySelector('video')?.pause()
        })
        ins.querySelector('video')?.play().catch(() => {})
      })
      const btn = ins.querySelector('.play-sound')
      if (!btn) return
      on(btn, 'click', () => {
        if (playingSoundBtn === btn) return stopInstrumentSound()
        stopInstrumentSound()
        if (!audio.paused) {
          audio.pause()
          setRowState(currentSong, false)
        }
        const video = ins.querySelector('video')
        if (btn.dataset.sound) {
          instrumentAudio.src = btn.dataset.sound
          instrumentAudio.play().catch(() => {})
        } else if (video) {
          video.muted = false
          video.currentTime = 0
          video.play().catch(() => {})
        }
        btn.innerHTML = STOP_SOUND
        playingSoundBtn = btn
      })
    })
    on(instrumentAudio, 'ended', stopInstrumentSound)
  }

  // --- Full video player ---
  const vo = root.querySelector('.video-overlay')
  if (vo) {
    const video = vo.querySelector('video')
    const music = new Audio()
    music.preload = 'none'
    const fill = vo.querySelector('.vo-fill')
    const time = vo.querySelector('.vo-time')
    const toggle = vo.querySelector('.vo-toggle')

    const sync = () => {
      if (Math.abs(music.currentTime - video.currentTime) > 0.25) music.currentTime = video.currentTime
    }
    const playBoth = () => {
      video.play().catch(() => {})
      if (p.music_for_video) {
        sync()
        music.play().catch(() => {})
      }
      toggle.textContent = 'Pause'
    }
    const pauseBoth = () => {
      video.pause()
      music.pause()
      toggle.textContent = 'Play'
    }
    const open = () => {
      stopInstrumentSound()
      if (!audio.paused) {
        audio.pause()
        setRowState(currentSong, false)
      }
      if (!video.src) {
        video.src = p.video
        if (p.music_for_video) {
          music.src = p.music_for_video
          video.muted = true
        }
      }
      vo.classList.add('is-open')
      setMenuHidden(true)
      setHeaderHidden(true)
      video.currentTime = 0
      music.currentTime = 0
      playBoth()
    }
    const close = () => {
      pauseBoth()
      vo.classList.remove('is-open')
      setMenuHidden(false)
      setHeaderHidden(false)
    }
    on(root.querySelector('[data-play-video]'), 'click', open)
    on(vo.querySelector('.vo-close'), 'click', close)
    on(toggle, 'click', () => (video.paused ? playBoth() : pauseBoth()))
    on(video, 'click', () => (video.paused ? playBoth() : pauseBoth()))
    on(video, 'timeupdate', () => {
      fill.style.width = `${(video.currentTime / video.duration) * 100 || 0}%`
      time.textContent = `${formatTime(video.currentTime)}/${formatTime(video.duration)}`
      if (!video.paused) sync()
    })
    on(video, 'waiting', () => music.pause())
    on(video, 'playing', () => p.music_for_video && music.play().catch(() => {}))
    on(video, 'ended', close)
    on(vo.querySelector('.vo-track'), 'click', (e) => {
      const r = e.currentTarget.getBoundingClientRect()
      video.currentTime = ((e.clientX - r.left) / r.width) * video.duration
      music.currentTime = video.currentTime
    })
    on(window, 'keydown', (e) => e.key === 'Escape' && vo.classList.contains('is-open') && close())
    cleanups.push(() => {
      music.pause()
      music.src = ''
      video.pause()
    })
  }

  startSmoothScroll()
  const intro = gsap.from(root.querySelectorAll('.song'), { opacity: 0, y: 12, duration: 0.8, stagger: 0.06, delay: 0.2 })

  return () => {
    cleanups.forEach((fn) => fn())
    intro.kill()
    probes.forEach((x) => (x.src = ''))
    audio.pause()
    audio.src = ''
    instrumentAudio.pause()
    instrumentAudio.src = ''
    root.querySelectorAll('video').forEach((v) => v.pause())
    setMenuHidden(false)
    setHeaderHidden(false)
    stopSmoothScroll()
  }
}
