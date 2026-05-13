import * as THREE from 'three'

// 纹理缓存，避免重复生成
const textureCache = new Map<string, THREE.CanvasTexture>()

function createCanvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  return { canvas, ctx }
}

function hash(bodyId: string): number {
  let h = 0
  for (let i = 0; i < bodyId.length; i++) {
    h = (h * 31 + bodyId.charCodeAt(i)) >>> 0
  }
  return h
}

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// ============ 太阳 ============
function generateSunTexture(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(512, 512)
  const rand = seededRandom(42)

  // 径向渐变背景
  const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
  grad.addColorStop(0, '#FFF5D6')
  grad.addColorStop(0.15, '#FFD54F')
  grad.addColorStop(0.35, '#FF9800')
  grad.addColorStop(0.55, '#F57C00')
  grad.addColorStop(0.75, '#E65100')
  grad.addColorStop(1, '#8B2500')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 512, 512)

  // 表面光斑
  for (let i = 0; i < 120; i++) {
    const x = rand() * 512
    const y = rand() * 512
    const r = 2 + rand() * 18
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r)
    const brightness = 0.3 + rand() * 0.5
    glow.addColorStop(0, `rgba(255, 240, 180, ${brightness})`)
    glow.addColorStop(1, 'rgba(255, 160, 50, 0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, 512, 512)
  }

  // 太阳黑子
  for (let i = 0; i < 8; i++) {
    const x = rand() * 512
    const y = rand() * 512
    const r = 4 + rand() * 10
    const s = ctx.createRadialGradient(x, y, 0, x, y, r)
    s.addColorStop(0, 'rgba(80, 20, 0, 0.6)')
    s.addColorStop(1, 'rgba(100, 30, 0, 0)')
    ctx.fillStyle = s
    ctx.fillRect(0, 0, 512, 512)
  }

  return canvas
}

// ============ 水星 ============
function generateMercuryTexture(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(512, 256)
  const rand = seededRandom(1)

  // 灰色底
  ctx.fillStyle = '#8C8C8C'
  ctx.fillRect(0, 0, 512, 256)

  // 细微噪声纹理
  for (let y = 0; y < 256; y += 2) {
    for (let x = 0; x < 512; x += 2) {
      const v = 120 + rand() * 60
      ctx.fillStyle = `rgba(${v}, ${v}, ${v}, 0.3)`
      ctx.fillRect(x, y, 2, 2)
    }
  }

  // 陨石坑
  for (let i = 0; i < 60; i++) {
    const x = rand() * 512
    const y = rand() * 256
    const r = 3 + rand() * 15
    const crater = ctx.createRadialGradient(x, y, r * 0.3, x, y, r)
    crater.addColorStop(0, 'rgba(60, 60, 60, 0.5)')
    crater.addColorStop(0.7, 'rgba(70, 70, 70, 0.2)')
    crater.addColorStop(1, 'rgba(110, 110, 110, 0)')
    ctx.fillStyle = crater
    ctx.fillRect(0, 0, 512, 256)
  }

  // 亮斑（年轻撞击坑）
  for (let i = 0; i < 12; i++) {
    const x = rand() * 512
    const y = rand() * 256
    const r = 2 + rand() * 6
    const bright = ctx.createRadialGradient(x, y, 0, x, y, r)
    bright.addColorStop(0, 'rgba(180, 180, 180, 0.4)')
    bright.addColorStop(1, 'rgba(180, 180, 180, 0)')
    ctx.fillStyle = bright
    ctx.fillRect(0, 0, 512, 256)
  }

  return canvas
}

// ============ 金星 ============
function generateVenusTexture(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(512, 256)
  const rand = seededRandom(2)

  // 淡黄色底
  ctx.fillStyle = '#D4A84A'
  ctx.fillRect(0, 0, 512, 256)

  // 云雾层
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 512; x += 4) {
      const noise = Math.sin(x * 0.02 + y * 0.01) * 0.5 + Math.sin(x * 0.05 - y * 0.03) * 0.3
      const v = 180 + noise * 50 + rand() * 20
      ctx.fillStyle = `rgba(${v}, ${v * 0.8}, ${v * 0.5}, 0.15)`
      ctx.fillRect(x, y, 4, 1)
    }
  }

  // 云纹
  for (let i = 0; i < 20; i++) {
    const cx = rand() * 512
    const cy = rand() * 256
    const r = 30 + rand() * 60
    const cloud = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    cloud.addColorStop(0, 'rgba(230, 210, 160, 0.3)')
    cloud.addColorStop(1, 'rgba(230, 210, 160, 0)')
    ctx.fillStyle = cloud
    ctx.fillRect(0, 0, 512, 256)
  }

  return canvas
}

// ============ 地球 ============
function generateEarthTexture(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(512, 256)
  const rand = seededRandom(3)

  // 深海蓝底
  ctx.fillStyle = '#1A4D8C'
  ctx.fillRect(0, 0, 512, 256)

  // 简化大陆轮廓（大致分布）
  const continents = [
    { x: 120, y: 80, w: 80, h: 50 }, // 非洲/欧洲
    { x: 200, y: 60, w: 60, h: 60 }, // 亚洲
    { x: 60, y: 100, w: 50, h: 60 }, // 美洲
    { x: 300, y: 120, w: 70, h: 40 }, // 澳洲
    { x: 400, y: 70, w: 40, h: 50 }, // 部分亚洲
    { x: 30, y: 50, w: 35, h: 40 }, // 北美
  ]

  for (const c of continents) {
    // 大陆绿底
    ctx.fillStyle = `rgba(30, ${80 + rand() * 40}, 30, 0.85)`
    ctx.beginPath()
    ctx.ellipse(c.x, c.y, c.w / 2, c.h / 2, rand() * 0.5, 0, Math.PI * 2)
    ctx.fill()

    // 大陆边缘（海岸线）
    ctx.strokeStyle = 'rgba(20, 100, 20, 0.4)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.ellipse(c.x, c.y, c.w / 2 + 2, c.h / 2 + 2, rand() * 0.5, 0, Math.PI * 2)
    ctx.stroke()

    // 内部细节（森林/沙漠）
    for (let i = 0; i < 15; i++) {
      const dx = c.x + (rand() - 0.5) * c.w * 0.8
      const dy = c.y + (rand() - 0.5) * c.h * 0.8
      const r = 3 + rand() * 8
      ctx.fillStyle = `rgba(${20 + rand() * 20}, ${60 + rand() * 50}, ${10 + rand() * 15}, 0.4)`
      ctx.beginPath()
      ctx.arc(dx, dy, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // 云层
  for (let i = 0; i < 40; i++) {
    const x = rand() * 512
    const y = rand() * 256
    const w = 20 + rand() * 50
    const h = 5 + rand() * 15
    ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + rand() * 0.25})`
    ctx.beginPath()
    ctx.ellipse(x, y, w, h, rand() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }

  return canvas
}

// ============ 火星 ============
function generateMarsTexture(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(512, 256)
  const rand = seededRandom(4)

  // 橙红底
  ctx.fillStyle = '#B84A1E'
  ctx.fillRect(0, 0, 512, 256)

  // 表面变化
  for (let y = 0; y < 256; y += 2) {
    for (let x = 0; x < 512; x += 2) {
      const noise = Math.sin(x * 0.015 + y * 0.008) * 20
      const r = 150 + noise + rand() * 40
      const g = 60 + noise * 0.4 + rand() * 20
      const b = 20 + rand() * 10
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.2)`
      ctx.fillRect(x, y, 2, 2)
    }
  }

  // 暗斑（古老火山/撞击盆地）
  for (let i = 0; i < 20; i++) {
    const x = rand() * 512
    const y = rand() * 256
    const r = 8 + rand() * 25
    const dark = ctx.createRadialGradient(x, y, 0, x, y, r)
    dark.addColorStop(0, 'rgba(60, 20, 10, 0.6)')
    dark.addColorStop(1, 'rgba(60, 20, 10, 0)')
    ctx.fillStyle = dark
    ctx.fillRect(0, 0, 512, 256)
  }

  // 极地冰盖
  ctx.fillStyle = 'rgba(240, 240, 250, 0.5)'
  ctx.beginPath()
  ctx.ellipse(256, 10, 100, 20, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(256, 246, 80, 18, 0, 0, Math.PI * 2)
  ctx.fill()

  // 奥林帕斯山区域（亮斑）
  const olymX = 350
  const olymY = 80
  const olym = ctx.createRadialGradient(olymX, olymY, 0, olymX, olymY, 35)
  olym.addColorStop(0, 'rgba(200, 130, 80, 0.4)')
  olym.addColorStop(1, 'rgba(200, 130, 80, 0)')
  ctx.fillStyle = olym
  ctx.fillRect(0, 0, 512, 256)

  return canvas
}

// ============ 木星 ============
function generateJupiterTexture(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(512, 256)
  const rand = seededRandom(5)

  // 条纹底
  const bands = [
    { y: 0, h: 30, c: '#D4A76A' },
    { y: 30, h: 25, c: '#C88B4A' },
    { y: 55, h: 28, c: '#E0C090' },
    { y: 83, h: 22, c: '#B06A2E' },
    { y: 105, h: 20, c: '#D8B878' },
    { y: 125, h: 26, c: '#A0522D' },
    { y: 151, h: 24, c: '#C89050' },
    { y: 175, h: 22, c: '#E0C8A0' },
    { y: 197, h: 25, c: '#B87840' },
    { y: 222, h: 34, c: '#D4A060' },
  ]

  for (const band of bands) {
    ctx.fillStyle = band.c
    ctx.fillRect(0, band.y, 512, band.h)
  }

  // 条纹扰动
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 512; x += 4) {
      const wave = Math.sin(x * 0.01 + y * 0.02) * 10
      const v = wave + rand() * 8
      ctx.fillStyle = `rgba(${v > 0 ? 255 : 0}, ${v > 0 ? 240 : 0}, ${v > 0 ? 220 : 0}, 0.08)`
      ctx.fillRect(x, y, 4, 1)
    }
  }

  // 大红斑
  const spotX = 380
  const spotY = 140
  const spotW = 45
  const spotH = 30
  ctx.fillStyle = 'rgba(180, 50, 30, 0.7)'
  ctx.beginPath()
  ctx.ellipse(spotX, spotY, spotW, spotH, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(160, 40, 20, 0.5)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.ellipse(spotX, spotY, spotW + 3, spotH + 3, 0, 0, Math.PI * 2)
  ctx.stroke()

  // 小白斑
  for (let i = 0; i < 6; i++) {
    const x = rand() * 512
    const y = rand() * 256
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.beginPath()
    ctx.ellipse(x, y, 3 + rand() * 6, 2 + rand() * 4, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  return canvas
}

// ============ 土星 ============
function generateSaturnTexture(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(512, 256)
  const rand = seededRandom(6)

  // 柔和条纹底
  const bands = [
    { y: 0, h: 30, c: '#E8D4A0' },
    { y: 30, h: 25, c: '#D4C080' },
    { y: 55, h: 28, c: '#EAD4A0' },
    { y: 83, h: 22, c: '#C8B068' },
    { y: 105, h: 20, c: '#E0CCA0' },
    { y: 125, h: 26, c: '#B8A860' },
    { y: 151, h: 24, c: '#D8C890' },
    { y: 175, h: 22, c: '#E8D8B0' },
    { y: 197, h: 25, c: '#C0B070' },
    { y: 222, h: 34, c: '#DDD0A0' },
  ]

  for (const band of bands) {
    ctx.fillStyle = band.c
    ctx.fillRect(0, band.y, 512, band.h)
  }

  // 细微扰动
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 512; x += 4) {
      const v = rand() * 15
      ctx.fillStyle = `rgba(${v}, ${v}, ${v * 0.8}, 0.05)`
      ctx.fillRect(x, y, 4, 1)
    }
  }

  // 六边形风暴暗示（土星北极）
  ctx.strokeStyle = 'rgba(180, 160, 100, 0.15)'
  ctx.lineWidth = 2
  const cx = 256
  const cy = 20
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3
    const nextAngle = ((i + 1) * Math.PI) / 3
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(angle) * 12, cy + Math.sin(angle) * 6)
    ctx.lineTo(cx + Math.cos(nextAngle) * 12, cy + Math.sin(nextAngle) * 6)
    ctx.stroke()
  }

  return canvas
}

// ============ 天王星 ============
function generateUranusTexture(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(512, 256)
  const rand = seededRandom(7)

  // 均匀青色底
  ctx.fillStyle = '#7EC4C4'
  ctx.fillRect(0, 0, 512, 256)

  // 微弱条纹
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 512; x += 4) {
      const wave = Math.sin(x * 0.008 + y * 0.005) * 5
      const v = wave + rand() * 3
      ctx.fillStyle = `rgba(${v > 0 ? 180 : 80}, ${v > 0 ? 210 : 180}, ${v > 0 ? 210 : 200}, 0.06)`
      ctx.fillRect(x, y, 4, 1)
    }
  }

  // 甲烷云暗示（暗区）
  for (let i = 0; i < 10; i++) {
    const x = rand() * 512
    const y = rand() * 256
    const r = 20 + rand() * 40
    const cloud = ctx.createRadialGradient(x, y, 0, x, y, r)
    cloud.addColorStop(0, 'rgba(50, 120, 130, 0.1)')
    cloud.addColorStop(1, 'rgba(50, 120, 130, 0)')
    ctx.fillStyle = cloud
    ctx.fillRect(0, 0, 512, 256)
  }

  return canvas
}

// ============ 海王星 ============
function generateNeptuneTexture(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(512, 256)
  const rand = seededRandom(8)

  // 深蓝底
  ctx.fillStyle = '#2E4A8C'
  ctx.fillRect(0, 0, 512, 256)

  // 云带
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 512; x += 4) {
      const wave = Math.sin(x * 0.01 + y * 0.008) * 8
      const v = wave + rand() * 5
      ctx.fillStyle = `rgba(${v > 0 ? 100 : 20}, ${v > 0 ? 130 : 40}, ${v > 0 ? 200 : 120}, 0.08)`
      ctx.fillRect(x, y, 4, 1)
    }
  }

  // 大暗斑暗示
  const spotX = 180
  const spotY = 120
  const spot = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, 30)
  spot.addColorStop(0, 'rgba(20, 30, 60, 0.5)')
  spot.addColorStop(1, 'rgba(20, 30, 60, 0)')
  ctx.fillStyle = spot
  ctx.fillRect(0, 0, 512, 256)

  // 亮云
  for (let i = 0; i < 15; i++) {
    const x = rand() * 512
    const y = rand() * 256
    const r = 10 + rand() * 25
    const cloud = ctx.createRadialGradient(x, y, 0, x, y, r)
    cloud.addColorStop(0, 'rgba(120, 160, 230, 0.2)')
    cloud.addColorStop(1, 'rgba(120, 160, 230, 0)')
    ctx.fillStyle = cloud
    ctx.fillRect(0, 0, 512, 256)
  }

  return canvas
}

// ============ 月球 ============
function generateMoonTexture(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(512, 256)
  const rand = seededRandom(10)

  // 灰色底
  ctx.fillStyle = '#999999'
  ctx.fillRect(0, 0, 512, 256)

  // 月海（暗区）
  const maria = [
    { x: 150, y: 100, r: 35 },
    { x: 280, y: 80, r: 28 },
    { x: 360, y: 140, r: 22 },
    { x: 100, y: 160, r: 25 },
    { x: 420, y: 90, r: 20 },
    { x: 220, y: 180, r: 30 },
    { x: 50, y: 100, r: 18 },
  ]

  for (const m of maria) {
    const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r)
    g.addColorStop(0, 'rgba(60, 60, 60, 0.5)')
    g.addColorStop(1, 'rgba(60, 60, 60, 0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 512, 256)
  }

  // 陨石坑
  for (let i = 0; i < 80; i++) {
    const x = rand() * 512
    const y = rand() * 256
    const r = 2 + rand() * 12
    const crater = ctx.createRadialGradient(x, y, 0, x, y, r)
    crater.addColorStop(0, 'rgba(80, 80, 80, 0.4)')
    crater.addColorStop(0.6, 'rgba(70, 70, 70, 0.15)')
    crater.addColorStop(1, 'rgba(130, 130, 130, 0)')
    ctx.fillStyle = crater
    ctx.fillRect(0, 0, 512, 256)
  }

  // 环形山亮边
  for (let i = 0; i < 30; i++) {
    const x = rand() * 512
    const y = rand() * 256
    const r = 3 + rand() * 8
    ctx.strokeStyle = 'rgba(180, 180, 180, 0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.stroke()
  }

  // 高地亮区
  for (let i = 0; i < 15; i++) {
    const x = rand() * 512
    const y = rand() * 256
    const r = 10 + rand() * 25
    const bright = ctx.createRadialGradient(x, y, 0, x, y, r)
    bright.addColorStop(0, 'rgba(200, 200, 200, 0.15)')
    bright.addColorStop(1, 'rgba(200, 200, 200, 0)')
    ctx.fillStyle = bright
    ctx.fillRect(0, 0, 512, 256)
  }

  return canvas
}

// ============ 通用岩石纹理（卫星/矮行星） ============
function generateRockTexture(bodyId: string): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(512, 256)
  const seed = hash(bodyId)
  const rand = seededRandom(seed)

  // 灰色底
  const base = 100 + (seed % 40)
  ctx.fillStyle = `rgb(${base}, ${base}, ${base})`
  ctx.fillRect(0, 0, 512, 256)

  // 细微表面变化
  for (let y = 0; y < 256; y += 2) {
    for (let x = 0; x < 512; x += 2) {
      const v = base + (rand() - 0.5) * 40
      ctx.fillStyle = `rgba(${v}, ${v}, ${v}, 0.3)`
      ctx.fillRect(x, y, 2, 2)
    }
  }

  // 陨石坑
  for (let i = 0; i < 40; i++) {
    const x = rand() * 512
    const y = rand() * 256
    const r = 2 + rand() * 10
    const crater = ctx.createRadialGradient(x, y, 0, x, y, r)
    crater.addColorStop(0, 'rgba(50, 50, 50, 0.4)')
    crater.addColorStop(1, 'rgba(50, 50, 50, 0)')
    ctx.fillStyle = crater
    ctx.fillRect(0, 0, 512, 256)
  }

  return canvas
}

// ============ 主入口 ============

const TEXTURE_GENERATORS: Record<string, () => HTMLCanvasElement> = {
  sun: generateSunTexture,
  mercury: generateMercuryTexture,
  venus: generateVenusTexture,
  earth: generateEarthTexture,
  mars: generateMarsTexture,
  jupiter: generateJupiterTexture,
  saturn: generateSaturnTexture,
  uranus: generateUranusTexture,
  neptune: generateNeptuneTexture,
  moon: generateMoonTexture,
}

/**
 * 获取天体的纹理贴图。
 * 程序化生成，无需外部文件。结果会缓存。
 */
export function getPlanetTexture(bodyId: string): THREE.CanvasTexture | null {
  if (textureCache.has(bodyId)) {
    return textureCache.get(bodyId)!
  }

  const generator = TEXTURE_GENERATORS[bodyId]
  if (!generator) {
    // 未定义纹理的天体使用通用岩石纹理
    const canvas = generateRockTexture(bodyId)
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.colorSpace = THREE.SRGBColorSpace
    textureCache.set(bodyId, texture)
    return texture
  }

  const canvas = generator()
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  textureCache.set(bodyId, texture)
  return texture
}

/**
 * 清除纹理缓存（用于开发热更新等场景）
 */
export function clearPlanetTextureCache(): void {
  textureCache.clear()
}
