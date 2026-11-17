// @ts-nocheck
// Projects index: hovering a title plays that project's preview loop behind the list.
export function mountProjects(root) {
  const preview = root.querySelector('.index-preview')
  const video = preview.querySelector('video')
  const list = root.querySelector('.index-list')
  let leaveTimer = null
  const offs = []

  list.querySelectorAll('a').forEach((a) => {
    const enter = () => {
      clearTimeout(leaveTimer)
      const src = a.dataset.preview
      if (!src) return
      if (video.getAttribute('src') !== src) video.src = src
      video.play().catch(() => {})
      preview.classList.add('is-visible')
      list.classList.add('has-hover')
    }
    const leave = () => {
      list.classList.remove('has-hover')
      preview.classList.remove('is-visible')
      leaveTimer = setTimeout(() => video.pause(), 500)
    }
    a.addEventListener('mouseenter', enter)
    a.addEventListener('mouseleave', leave)
    offs.push(() => {
      a.removeEventListener('mouseenter', enter)
      a.removeEventListener('mouseleave', leave)
    })
  })

  return () => {
    offs.forEach((off) => off())
    clearTimeout(leaveTimer)
    video.pause()
    video.removeAttribute('src')
  }
}
