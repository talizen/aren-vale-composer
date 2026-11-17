// @ts-nocheck
// Cylinder "space view" gallery — a port of the original Stage / SphereGallery / GalleryImage /
// Controls / MotionBlurPass components, minus the intro fly-in and audio.
// It sizes itself to the canvas's parent box rather than the window and imports nothing but the core
// `three` module, so it renders the same on the site and inside the Creght editor canvas (which zooms the
// page with a CSS transform and resolves `three` through its own import map).
import * as THREE from 'three'
import gsap from 'gsap'

const vertexShader = /* glsl */ `
uniform float uCurveAmountX;
uniform float uCurveAmountY;
uniform float uImageWidth;
uniform float uImageHeight;
uniform float uSizeFactorX;
uniform float uSizeFactorY;
uniform float uTiltAngle;

varying vec2 vUv;
varying float fogDepth;

void main() {
  vUv = uv;
  vec3 pos = position;

  float percentageX = (abs(pos.x) / (uImageWidth * 0.5)) * 1000.0;
  float percentageY = (abs(pos.y) / (uImageHeight * 0.5)) * 1000.0;
  pos.z += uCurveAmountX * pow(percentageX, 2.0) * 0.003 * uSizeFactorX;
  pos.z += uCurveAmountY * pow(percentageY, 2.0) * 0.003 * uSizeFactorY;

  pos.z += pos.y * tan(uTiltAngle);

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  fogDepth = -mvPosition.z;
  gl_Position = projectionMatrix * mvPosition;
}`

const fragmentShader = /* glsl */ `
uniform sampler2D uTexture;
uniform float uOpacity;
uniform float uWarpProgress;

varying vec2 vUv;

void main() {
  vec2 centeredUV = vUv - 0.5;
  float x = smoothstep(0.0, 1.0, (uWarpProgress * 2.0 + abs(centeredUV.y) * 2.0 - 1.0));
  vec2 warpedUV = mix(vUv, centeredUV * (1.0 - x) + 0.5, x);
  vec4 texColor = texture2D(uTexture, warpedUV);
  float warpOpacity = mix(1.0, 0.0, x);
  texColor.a *= uOpacity * warpOpacity;
  gl_FragColor = texColor;
}`

const quadVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`

// BlendShader with opacity 1: mix(current frame, saved previous frame, mixRatio)
const blendFragment = /* glsl */ `
uniform sampler2D tDiffuse1;
uniform sampler2D tDiffuse2;
uniform float mixRatio;
varying vec2 vUv;
void main() {
  gl_FragColor = mix(texture2D(tDiffuse1, vUv), texture2D(tDiffuse2, vUv), mixRatio);
}`

const copyFragment = /* glsl */ `
uniform sampler2D tDiffuse;
varying vec2 vUv;
void main() {
  gl_FragColor = texture2D(tDiffuse, vUv);
}`

// MotionBlurPass as the original composed it (RenderPass → BlendShader → SavePass → CopyShader): every frame
// is mixed 50/50 with the saved previous mixed frame. The original asked for a quarter-res save target, but
// EffectComposer.addPass resizes every pass to full size, so on the live site it is full-res (crisp strobe
// copies while moving, nothing extra at rest); this keeps that. The scene target is also multisampled,
// which the original lacked — renderer antialias does not reach render targets, hence its jagged edges.
class MotionBlur {
  constructor(renderer, w, h) {
    this.renderer = renderer
    const full = { type: THREE.HalfFloatType, depthBuffer: true, samples: 4 }
    this.scene = new THREE.WebGLRenderTarget(1, 1, full)
    this.mixed = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: false })
    this.saved = new THREE.WebGLRenderTarget(1, 1, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      depthBuffer: false,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
    })
    const material = (fragmentShader, uniforms) =>
      new THREE.ShaderMaterial({ uniforms, vertexShader: quadVertex, fragmentShader, depthTest: false, depthWrite: false })
    this.blend = material(blendFragment, {
      tDiffuse1: { value: this.scene.texture },
      tDiffuse2: { value: this.saved.texture },
      mixRatio: { value: 0.5 },
    })
    this.copy = material(copyFragment, { tDiffuse: { value: this.mixed.texture } })
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.blend)
    this.quad.frustumCulled = false
    this.quadScene = new THREE.Scene()
    this.quadScene.add(this.quad)
    this.quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    this.setSize(w, h)
  }

  setSize(w, h) {
    const pr = this.renderer.getPixelRatio()
    this.scene.setSize(w * pr, h * pr)
    this.mixed.setSize(w * pr, h * pr)
    this.saved.setSize(w * pr, h * pr)
  }

  pass(material, target) {
    this.quad.material = material
    this.renderer.setRenderTarget(target)
    this.renderer.render(this.quadScene, this.quadCamera)
  }

  render(scene, camera) {
    const r = this.renderer
    r.setRenderTarget(this.scene)
    r.render(scene, camera)
    this.pass(this.blend, this.mixed)
    this.copy.uniforms.tDiffuse.value = this.mixed.texture
    this.pass(this.copy, this.saved)
    this.pass(this.copy, null)
  }

  dispose() {
    this.scene.dispose()
    this.mixed.dispose()
    this.saved.dispose()
    this.blend.dispose()
    this.copy.dispose()
    this.quad.geometry.dispose()
  }
}

const CAMERA_DISTANCE = 800 // Perspective.vue: fov derived from viewport height at this distance
const MOBILE_FOV = 74
const MIN_RADIUS = 2500
const MAX_RADIUS = 5500
const MAX_TILT_DEG = 30
const TOUCH_SPEED = 6.5
const SWAY_PADDING = 0.15

export function isMobileOrTablet() {
  return window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 1200
}

// lodash-style trailing debounce
function debounce(fn, wait) {
  let t = null
  const d = (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), wait)
  }
  d.cancel = () => clearTimeout(t)
  return d
}

export class Stage {
  constructor(canvas, { images, mobileImages, onHover, onSelect }) {
    this.canvas = canvas
    this.box = canvas.parentElement
    this.mobile = isMobileOrTablet()
    this.images = this.mobile && mobileImages?.length ? mobileImages : images
    this.onHover = onHover
    this.onSelect = onSelect
    this.meshes = []
    this.hovered = null
    this.clicked = null
    this.menuHovered = false
    this.active = false
    // the injected "mouse" is the viewport centre until the pointer first moves
    const { w, h } = this.size()
    this.mouse = { x: w / 2, y: h / 2 }
    this.velocity = { x: 0, y: 0, ySigned: 0 }
    this.curve = 0
    this.tilt = 0

    this.panoW = this.mobile ? 2137 : 5760
    this.panoH = this.mobile ? 1644 : 3100
    this.populatedAngle = this.mobile ? 360 : 270
    this.usedCircumference = 2 * Math.PI * MIN_RADIUS * (this.populatedAngle / 360)
    this.cylinderHeight = this.usedCircumference / (this.panoW / this.panoH)
    this.scaleUpFactor = this.usedCircumference / this.panoW

    this.initRenderer()
    this.initScene()
    this.bind()
    this.updateRanges()
    this.sway(this.mouse, true)
    this.render = this.render.bind(this)
    gsap.ticker.add(this.render)
  }

  // everything is laid out in the box the canvas fills, not the window
  size() {
    return { w: this.box.clientWidth || window.innerWidth, h: this.box.clientHeight || window.innerHeight }
  }

  // pointer position inside the box, in unscaled CSS pixels (the editor canvas may be zoomed)
  local(clientX, clientY) {
    const r = this.canvas.getBoundingClientRect()
    return {
      x: ((clientX - r.left) / (r.width || 1)) * this.width,
      y: ((clientY - r.top) / (r.height || 1)) * this.height,
    }
  }

  initRenderer() {
    const { w, h } = this.size()
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      precision: 'highp',
      powerPreference: 'high-performance',
    })
    this.renderer.setPixelRatio(this.mobile ? Math.min(2, Math.max(1, window.devicePixelRatio || 1)) : 1)
    this.renderer.setSize(w, h, false)

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(this.fovFor(h), w / h, 1, 20000)
    this.camera.position.set(0, 0, 0)

    // MotionBlurPass: desktop only, like the original
    this.blur = this.mobile ? null : new MotionBlur(this.renderer, w, h)

    this.raycaster = new THREE.Raycaster()
  }

  fovFor(h) {
    return this.mobile ? MOBILE_FOV : (180 * (2 * Math.atan(h / 2 / CAMERA_DISTANCE))) / Math.PI
  }

  initScene() {
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy()
    const anisotropy = this.mobile ? Math.min(maxAniso, 8) : maxAniso
    const segments = this.mobile ? 10 : 20
    const halfAngle = ((this.populatedAngle / 2) * Math.PI) / 180

    this.images.forEach((img) => {
      const height = img.width * (img.h / img.w)
      const sizeBoost = 1 + img.z * 1.2
      const baseW = img.width * this.scaleUpFactor
      const baseH = height * this.scaleUpFactor
      const width = baseW * sizeBoost
      const meshH = baseH * sizeBoost

      const hPos = img.x / this.panoW + baseW / this.usedCircumference / 2
      const vPos = img.y / this.panoH + baseH / this.cylinderHeight / 2
      const distanceFactor = img.z >= 0 && img.z <= 1 ? img.z : Math.random()
      const radius = MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * distanceFactor
      const angle = -Math.PI / 2 + (hPos * this.populatedAngle * Math.PI) / 180 - halfAngle
      const y = (0.5 - vPos) * this.cylinderHeight

      // NB: no colorSpace — the original passes sRGB texels straight through the custom shader
      const texture = loader.load(withParams(sized(img, this.mobile), this.mobile))
      texture.anisotropy = anisotropy
      texture.minFilter = THREE.LinearMipmapLinearFilter
      texture.magFilter = THREE.LinearFilter
      texture.generateMipmaps = true

      const geometry = new THREE.PlaneGeometry(width, meshH, segments, segments)
      const material = new THREE.ShaderMaterial({
        precision: 'highp',
        uniforms: {
          uCurveAmountX: { value: 0 },
          uCurveAmountY: { value: 0 },
          uImageHeight: { value: meshH },
          uImageWidth: { value: width },
          uSizeFactorX: { value: width / 2000 },
          uSizeFactorY: { value: meshH / 2000 },
          uTiltAngle: { value: 0 },
          uTexture: { value: texture },
          uOpacity: { value: img.opacity || 1 },
          uWarpProgress: { value: 0 },
        },
        vertexShader,
        fragmentShader,
        side: THREE.DoubleSide,
        transparent: true,
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(radius * Math.cos(angle), y, radius * Math.sin(angle))
      mesh.lookAt(new THREE.Vector3(0, y, 0))
      mesh.originalQuaternion = mesh.quaternion.clone()
      mesh.baseOpacity = img.opacity || 1
      mesh.baseScale = mesh.scale.x
      mesh.project = img.project
      this.scene.add(mesh)
      this.meshes.push(mesh)
    })
  }

  updateRanges() {
    const { w, h } = this.size()
    const cam = this.camera
    const hfov = (2 * Math.atan(Math.tan((cam.fov * Math.PI) / 180 / 2) * cam.aspect) * 180) / Math.PI
    this.rotRange = THREE.MathUtils.degToRad(this.mobile ? 135 - hfov / 8 : 135 - hfov / 2)
    const halfCyl = this.cylinderHeight / 2
    this.yRange = this.mobile ? halfCyl - h * 0.25 : halfCyl - h + h * SWAY_PADDING
    this.width = w
    this.height = h
  }

  bind() {
    this.onResize = () => {
      const { w, h } = this.size()
      if (w === this.width && h === this.height) return
      this.camera.fov = this.fovFor(h)
      this.camera.aspect = w / h
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(w, h, false)
      this.blur?.setSize(w, h)
      this.updateRanges()
    }
    window.addEventListener('resize', this.onResize)
    this.resizeObserver = new ResizeObserver(this.onResize)
    this.resizeObserver.observe(this.box)

    // SphereGallery: pointer velocity → curvature (x) and tilt (y)
    let last = null
    let resetTimer = null
    const resetVelocity = () => {
      this.velocity = { x: 0, y: 0, ySigned: 0 }
      last = null
      this.updateDeform()
    }
    const trackVelocity = (x, y) => {
      const now = performance.now()
      if (last) {
        const dt = (now - last.t) / 1000
        const vx = (x - last.x) / dt
        const vy = (y - last.y) / dt
        this.velocity = { x: Math.abs(vx), y: Math.abs(vy), ySigned: vy }
        this.updateDeform()
      }
      clearTimeout(resetTimer)
      resetTimer = setTimeout(resetVelocity, 100)
      last = { x, y, t: now }
    }

    this.debouncedRaycast = debounce((x, y) => this.raycast(x, y), 100)

    this.onMouseMove = (e) => {
      const { x, y } = this.local(e.clientX, e.clientY)
      this.mouse = { x, y }
      if (this.mobile) return
      this.sway(this.mouse)
      trackVelocity(x, y)
      this.debouncedRaycast(x, y)
    }
    this.onLeave = resetVelocity
    window.addEventListener('mousemove', this.onMouseMove, { passive: true })
    document.addEventListener('mouseleave', this.onLeave)

    this.onClick = () => this.select()
    this.canvas.addEventListener('click', this.onClick)

    // Controls.vue touch handling
    let touch = null
    this.onTouchStart = (e) => {
      if (!this.active) return
      touch = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    this.onTouchMove = (e) => {
      if (!this.active || !touch) return
      e.preventDefault()
      const dx = e.touches[0].clientX - touch.x
      const dy = e.touches[0].clientY - touch.y
      touch = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      const aspect = this.width / this.height
      const px = (-dx / this.width) * TOUCH_SPEED * aspect
      const py = (-dy / this.height) * TOUCH_SPEED
      const rotY = this.camera.rotation.y - px * this.rotRange
      const max = this.yRange * 0.9
      const posY = THREE.MathUtils.clamp(this.camera.position.y - py * this.yRange, -max, max)
      const onUpdate = () => this.raycast(this.width / 2, this.height / 2)
      gsap.to(this.camera.rotation, { y: rotY, duration: 1.5, ease: 'power4.out', overwrite: true, onUpdate })
      gsap.to(this.camera.position, { y: posY, duration: 1.5, ease: 'power4.out', overwrite: true, onUpdate })
    }
    this.canvas.addEventListener('touchstart', this.onTouchStart, { passive: true })
    this.canvas.addEventListener('touchmove', this.onTouchMove, { passive: false })
  }

  // Controls.vue: mouse x → yaw, mouse y → camera height
  sway({ x, y }, immediate = false) {
    if (this.mobile) return
    const nx = (x / this.width) * 2 - 1
    const ny = -(y / this.height) * 2 + 1
    const duration = immediate ? 0 : 2
    gsap.to(this.camera.rotation, { y: -(nx * this.rotRange), duration, ease: 'power4.out' })
    gsap.to(this.camera.position, { y: ny * this.yRange, duration, ease: 'power4.out' })
  }

  updateDeform() {
    // curveAmountX = clamp(lerp(0, .2, |vx|*2/500/2), 0, .3), rounded to 3 decimals
    const raw = THREE.MathUtils.clamp(
      THREE.MathUtils.lerp(0, 0.2, (Math.abs(this.velocity.x) * 2) / 500 / 2),
      0,
      0.3,
    )
    const curve = Math.round(raw * 1000) / 1000
    if (curve !== this.curve) {
      const ease = curve > this.curve ? 'power4.in' : 'power4.out'
      this.curve = curve
      this.meshes.forEach((m) =>
        gsap.to(m.material.uniforms.uCurveAmountX, { value: curve, duration: 0.75, ease, overwrite: true }),
      )
    }

    const vy = this.velocity.ySigned
    const deg = Math.abs(vy) > 50 ? THREE.MathUtils.clamp((vy / 100) * MAX_TILT_DEG, -MAX_TILT_DEG, MAX_TILT_DEG) : 0
    const tilt = THREE.MathUtils.degToRad(deg)
    if (tilt !== this.tilt) {
      this.tilt = tilt
      this.meshes.forEach((m) => {
        gsap.to(m.material.uniforms.uTiltAngle, { value: this.isFocused(m) ? 0 : tilt, duration: 1.5, overwrite: true })
      })
    }
  }

  raycast(x, y) {
    if (!this.active || this.clicked) return
    if (this.menuHovered) return this.setHovered(null)
    const ndc = new THREE.Vector2((x / this.width) * 2 - 1, -(y / this.height) * 2 + 1)
    this.raycaster.setFromCamera(ndc, this.camera)
    const hit = this.raycaster.intersectObjects(this.meshes)[0]
    clearTimeout(this.hoverTimer)
    if (hit?.object.project) {
      const project = hit.object.project
      if (this.mobile) this.setHovered(project)
      else this.hoverTimer = setTimeout(() => this.setHovered(project), 100)
    } else {
      this.setHovered(null)
    }
  }

  setMenuHovered(hovered) {
    this.menuHovered = hovered
    if (hovered) {
      clearTimeout(this.hoverTimer)
      this.setHovered(null)
    }
  }

  isFocused(m) {
    return (this.clicked && m.project === this.clicked) || (this.hovered && m.project === this.hovered)
  }

  setHovered(project) {
    if (project === this.hovered) return
    this.hovered = project
    this.canvas.classList.toggle('is-pointer', !!project)
    this.onHover?.(project)
    this.updateImages()
  }

  // GalleryImage.vue watchers: opacity, rotation toward the viewer, scale and tilt
  updateImages() {
    const duration = this.clicked ? 0.35 : 0.75
    this.meshes.forEach((m) => {
      const focused = this.isFocused(m)
      const ease = focused ? 'power4.out' : 'power1.inOut'

      let opacity = m.baseOpacity
      if (this.clicked) opacity = m.project === this.clicked ? m.baseOpacity : 0
      else if (this.hovered) opacity = m.project === this.hovered ? m.baseOpacity : m.baseOpacity * 0.2
      gsap.to(m.material.uniforms.uOpacity, { value: opacity, duration, ease, overwrite: true })

      const q = focused ? this.turnedQuaternion(m, 8) : m.originalQuaternion
      gsap.killTweensOf(m.quaternion)
      gsap.to(m.quaternion, { x: q.x, y: q.y, z: q.z, w: q.w, duration, ease })

      const scale = m.baseScale * (this.clicked ? (m.project === this.clicked ? 0.975 : 0.9) : 1)
      gsap.to(m.scale, { x: scale, y: scale, z: scale, duration: 1, ease: 'power3.out', overwrite: true })

      if (focused) gsap.to(m.material.uniforms.uTiltAngle, { value: 0, duration: 1.5, overwrite: true })
    })
  }

  turnedQuaternion(mesh, divisor) {
    const screenX = new THREE.Vector3().setFromMatrixPosition(mesh.matrixWorld).project(this.camera).x
    const angle = screenX < 0 ? Math.PI / divisor : -Math.PI / divisor
    return new THREE.Quaternion()
      .copy(mesh.originalQuaternion)
      .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle))
  }

  // Stage.vue click: keep the selected project's images, fade the rest, then route
  select(project = this.hovered) {
    if (!this.active || !project || this.clicked) return
    this.clicked = project
    this.updateImages()
    this.onSelect?.(project)
  }

  show() {
    this.clicked = null
    this.hovered = null
    this.active = true
    this.canvas.classList.remove('is-hidden', 'is-pointer')
    this.meshes.forEach((m) => {
      gsap.killTweensOf([m.quaternion, m.scale, m.material.uniforms.uOpacity])
      m.quaternion.copy(m.originalQuaternion)
      m.scale.setScalar(m.baseScale)
      m.material.uniforms.uOpacity.value = m.baseOpacity
      m.material.uniforms.uTiltAngle.value = 0
    })
    this.sway(this.mouse, true)
  }

  hide() {
    this.active = false
    this.debouncedRaycast?.cancel()
    clearTimeout(this.hoverTimer)
    if (this.hovered && !this.clicked) {
      this.hovered = null
      this.onHover?.(null)
    }
    this.canvas.classList.add('is-hidden')
  }

  render() {
    if (!this.active && this.canvas.classList.contains('is-hidden')) return
    if (this.blur) this.blur.render(this.scene, this.camera)
    else this.renderer.render(this.scene, this.camera)
  }

  // the page unmounts on navigation and on every editor re-render, so release everything bind() took
  destroy() {
    gsap.ticker.remove(this.render)
    this.debouncedRaycast?.cancel()
    clearTimeout(this.hoverTimer)
    window.removeEventListener('resize', this.onResize)
    this.resizeObserver?.disconnect()
    window.removeEventListener('mousemove', this.onMouseMove)
    document.removeEventListener('mouseleave', this.onLeave)
    this.canvas.removeEventListener('click', this.onClick)
    this.canvas.removeEventListener('touchstart', this.onTouchStart)
    this.canvas.removeEventListener('touchmove', this.onTouchMove)
    gsap.killTweensOf([this.camera.rotation, this.camera.position])
    this.meshes.forEach((m) => {
      gsap.killTweensOf([m.quaternion, m.scale, m.material.uniforms.uOpacity])
      m.geometry.dispose()
      m.material.uniforms.uTexture.value?.dispose()
      m.material.dispose()
    })
    this.blur?.dispose()
    this.renderer.dispose()
  }
}

// Desktop renders at 1x and a photo covers ~0.65 × its layout `width` in screen pixels (more for the near,
// hovered ones), while the files are ~2 × `width` wide, so ask the CDN for ~1.8 × `width` — 1.3 was
// visibly softer than the original on hovered photos (rounded up to 64 px so similar photos share sizes).
// q=75 because the CDN re-encodes resized variants near full quality; at this size the difference is invisible. Phones render at up to 2x with a wider lens, so they keep the full file.
function sized(img, mobile) {
  if (mobile || !/^https:\/\/fsu\.creght\.com\//.test(img.src)) return img.src
  const w = Math.ceil((img.width * 1.8) / 64) * 64
  return w < img.w ? `${img.src}?w=${w}&q=75` : `${img.src}?q=75`
}

// imgix params the original applies on mobile; only meaningful for imgix-backed URLs
function withParams(src, mobile) {
  if (!mobile || !/imgix|cachely\.io/.test(src)) return src
  const u = new URL(src)
  u.searchParams.set('auto', 'format')
  u.searchParams.set('dpr', '2')
  u.searchParams.set('fit', 'crop')
  u.searchParams.set('q', '90')
  u.searchParams.set('sharpen', '40')
  return u.toString()
}
