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

// ============ 2D Value Noise + fBm ============

function valueNoise2D(x: number, y: number, seed: number): number {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  // Smoothstep
  const sx = fx * fx * (3 - 2 * fx)
  const sy = fy * fy * (3 - 2 * fy)

  function hash11(n: number): number {
    let s = (seed + n * 7919) | 0
    s = ((s * 16807) % 2147483647)
    return ((s - 1) / 2147483646)
  }
  function gridVal(cx: number, cy: number): number {
    return hash11(cx + cy * 100003)
  }

  const n00 = gridVal(ix, iy)
  const n10 = gridVal(ix + 1, iy)
  const n01 = gridVal(ix, iy + 1)
  const n11 = gridVal(ix + 1, iy + 1)

  const nx0 = n00 * (1 - sx) + n10 * sx
  const nx1 = n01 * (1 - sx) + n11 * sx
  return nx0 * (1 - sy) + nx1 * sy
}

function fBm(x: number, y: number, octaves: number, seed: number): number {
  let value = 0
  let amp = 0.5
  let freq = 1
  for (let i = 0; i < octaves; i++) {
    value += amp * valueNoise2D(x * freq, y * freq, seed + i * 137)
    amp *= 0.5
    freq *= 2
  }
  return value
}

function domainWarp(x: number, y: number, seed: number): number {
  // 用噪声偏移坐标，创造漩涡/流动效果
  const dx = valueNoise2D(x * 0.5 + 100, y * 0.5, seed)
  const dy = valueNoise2D(x * 0.5, y * 0.5 + 100, seed + 50)
  return fBm(x + dx * 0.8, y + dy * 0.8, 5, seed + 200)
}

// ============ 太阳 ============
function generateSunTexture(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(1024, 1024)
  const rand = seededRandom(42)

  // 径向渐变底
  const grad = ctx.createRadialGradient(512, 512, 0, 512, 512, 512)
  grad.addColorStop(0, '#FFF5D6')
  grad.addColorStop(0.2, '#FFD54F')
  grad.addColorStop(0.4, '#FF9800')
  grad.addColorStop(0.6, '#F57C00')
  grad.addColorStop(0.8, '#E65100')
  grad.addColorStop(1, '#8B2500')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 1024, 1024)

  // 米粒组织（高频颗粒噪声）
  const imgData = ctx.getImageData(0, 0, 1024, 1024)
  const data = imgData.data
  for (let y = 0; y < 1024; y++) {
    for (let x = 0; x < 1024; x++) {
      const n = fBm(x * 0.03, y * 0.03, 4, 100) * 2 - 1
      const i = (y * 1024 + x) * 4
      data[i] = Math.min(255, data[i] + n * 30)
      data[i + 1] = Math.min(255, data[i + 1] + n * 20)
      data[i + 2] = Math.min(255, data[i + 2] + n * 10)
    }
  }
  ctx.putImageData(imgData, 0, 0)

  // 光斑（大尺度亮区）
  for (let i = 0; i < 80; i++) {
    const x = rand() * 1024
    const y = rand() * 1024
    const r = 10 + rand() * 40
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r)
    const brightness = 0.2 + rand() * 0.4
    glow.addColorStop(0, `rgba(255, 240, 180, ${brightness})`)
    glow.addColorStop(1, 'rgba(255, 160, 50, 0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, 1024, 1024)
  }

  // 黑子群（本影 + 半影）
  for (let i = 0; i < 6; i++) {
    const cx = rand() * 1024
    const cy = rand() * 1024
    const r = 8 + rand() * 16
    // 半影
    const penumbra = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.5)
    penumbra.addColorStop(0, 'rgba(120, 40, 0, 0.4)')
    penumbra.addColorStop(0.4, 'rgba(80, 30, 0, 0.25)')
    penumbra.addColorStop(1, 'rgba(100, 30, 0, 0)')
    ctx.fillStyle = penumbra
    ctx.fillRect(0, 0, 1024, 1024)
    // 本影
    const umbra = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    umbra.addColorStop(0, 'rgba(40, 10, 0, 0.7)')
    umbra.addColorStop(1, 'rgba(60, 20, 0, 0)')
    ctx.fillStyle = umbra
    ctx.fillRect(0, 0, 1024, 1024)
  }

  return canvas
}

// ============ 水星 ============
function generateMercuryTexture(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(1024, 512)
  const rand = seededRandom(1)

  // 暖灰底色 + 地形噪声
  const imgData = ctx.getImageData(0, 0, 1024, 512)
  const data = imgData.data
  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 1024; x++) {
      const nx = x / 1024
      const ny = y / 512
      const n = fBm(nx * 10, ny * 8, 5, 1)

      // 暖灰偏棕：R略高，B略低
      const rBase = 105 + n * 48
      const gBase = 95 + n * 42
      const bBase = 78 + n * 35

      // 亮地形区（高反照率）
      const bright = fBm(nx * 3 + 10, ny * 3 + 20, 3, 5)
      if (bright > 0.55) {
        const boost = (bright - 0.55) * 60
        data[(y * 1024 + x) * 4]     = Math.min(220, rBase + boost)
        data[(y * 1024 + x) * 4 + 1] = Math.min(210, gBase + boost * 0.85)
        data[(y * 1024 + x) * 4 + 2] = Math.min(190, bBase + boost * 0.7)
      } else {
        data[(y * 1024 + x) * 4]     = Math.min(210, Math.max(70, rBase))
        data[(y * 1024 + x) * 4 + 1] = Math.min(200, Math.max(65, gBase))
        data[(y * 1024 + x) * 4 + 2] = Math.min(180, Math.max(50, bBase))
      }
      data[(y * 1024 + x) * 4 + 3] = 255
    }
  }
  ctx.putImageData(imgData, 0, 0)

  // 陨石坑
  for (let i = 0; i < 180; i++) {
    const x = rand() * 1024
    const y = rand() * 512
    const r = 3 + rand() * (i < 30 ? 45 : 18) // 前30个大坑
    const depth = 0.3 + rand() * 0.5

    // 辐射纹（年轻撞击）
    if (rand() > 0.5 && r > 8) {
      for (let j = 0; j < 10 + rand() * 6; j++) {
        const angle = rand() * Math.PI * 2
        const len = r * (3 + rand() * 6)
        const g = ctx.createRadialGradient(x, y, 0, x + Math.cos(angle) * len, y + Math.sin(angle) * len, len * 0.25)
        g.addColorStop(0, 'rgba(190, 185, 175, 0)')
        g.addColorStop(0.2, 'rgba(200, 195, 185, 0.25)')
        g.addColorStop(1, 'rgba(200, 195, 185, 0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, 1024, 512)
      }
    }

    // 坑洞阴影
    const crater = ctx.createRadialGradient(x - r * 0.15, y - r * 0.15, r * 0.15, x, y, r)
    crater.addColorStop(0, `rgba(45, 40, 35, ${depth * 0.7})`)
    crater.addColorStop(0.5, `rgba(60, 55, 50, ${depth * 0.35})`)
    crater.addColorStop(1, 'rgba(110, 105, 95, 0)')
    ctx.fillStyle = crater
    ctx.fillRect(0, 0, 1024, 512)

    // 坑缘亮边（受光侧）
    ctx.strokeStyle = `rgba(170, 162, 150, ${0.15 + rand() * 0.15})`
    ctx.lineWidth = 1.2 + rand() * 0.8
    ctx.beginPath()
    ctx.arc(x + r * 0.1, y + r * 0.1, r * 0.75, -0.3, Math.PI * 0.8)
    ctx.stroke()
  }

  // 大型撞击盆地（卡洛里盆地等）
  for (let i = 0; i < 4; i++) {
    const x = 150 + rand() * 700
    const y = 50 + rand() * 400
    const r = 40 + rand() * 35
    const basin = ctx.createRadialGradient(x, y, 0, x, y, r)
    basin.addColorStop(0, 'rgba(130, 120, 105, 0.25)')
    basin.addColorStop(0.6, 'rgba(115, 105, 90, 0.15)')
    basin.addColorStop(1, 'rgba(140, 130, 115, 0)')
    ctx.fillStyle = basin
    ctx.fillRect(0, 0, 1024, 512)
    // 盆地环状山脉
    ctx.strokeStyle = 'rgba(155, 145, 130, 0.15)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y, r * 0.85, 0, Math.PI * 2)
    ctx.stroke()
    ctx.strokeStyle = 'rgba(140, 130, 115, 0.1)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(x, y, r * 1.05, 0, Math.PI * 2)
    ctx.stroke()
  }

  // 收缩皱脊（scarp）暗线
  for (let i = 0; i < 8; i++) {
    const x0 = rand() * 1024
    const y0 = rand() * 512
    const segs = 5 + rand() * 8
    ctx.strokeStyle = `rgba(60, 55, 48, ${0.06 + rand() * 0.06})`
    ctx.lineWidth = 1 + rand() * 1.5
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    for (let j = 1; j < segs; j++) {
      ctx.lineTo(x0 + (rand() - 0.5) * 120, y0 + (rand() - 0.5) * 40)
    }
    ctx.stroke()
  }

  return canvas
}

// ============ 金星 ============
function generateVenusTexture(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(1024, 512)

  // 暖黄底色
  ctx.fillStyle = '#DDB05A'
  ctx.fillRect(0, 0, 1024, 512)

  const imgData = ctx.getImageData(0, 0, 1024, 512)
  const data = imgData.data
  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 1024; x++) {
      const nx = x / 1024
      const ny = y / 512

      // 纬向云带：急流条纹
      const zonal = fBm(ny * 20 + Math.sin(nx * 6) * 0.2, nx * 2, 2, 7)
      // domainWarp 旋涡
      const warp = domainWarp(nx * 6, ny * 5, 2)
      // 低纬更亮，极区略暗
      const latFade = 1 - Math.abs(ny - 0.5) * 0.25

      const bright = 175 + (zonal * 0.5 + warp * 0.5) * 40 * latFade

      // Y 形 UV 暗纹（沿赤道的分散暗带）
      let uvDark = 0
      for (let k = 0; k < 5; k++) {
        const cx = 0.2 + k * 0.18 + Math.sin(ny * 8 + k) * 0.06
        const cy = 0.35 + Math.sin(k * 2.5) * 0.12
        const dx = (nx - cx) / 0.12
        const dy = (ny - cy) / 0.06
        uvDark += Math.exp(-(dx * dx + dy * dy) * 1.5) * 0.3
      }

      const finalBright = bright - uvDark * 25 * latFade

      const i = (y * 1024 + x) * 4
      data[i]     = Math.min(245, Math.max(140, finalBright))
      data[i + 1] = Math.min(220, Math.max(110, finalBright * 0.82))
      data[i + 2] = Math.min(160, Math.max(75,  finalBright * 0.52))
    }
  }
  ctx.putImageData(imgData, 0, 0)

  // 南极漩涡（暗涡旋）
  for (const side of ['south', 'north'] as const) {
    const cy = side === 'south' ? 470 : 42
    const vortex = ctx.createRadialGradient(512, cy, 0, 512, cy, 80)
    vortex.addColorStop(0, 'rgba(90, 75, 45, 0.25)')
    vortex.addColorStop(0.4, 'rgba(110, 90, 55, 0.12)')
    vortex.addColorStop(1, 'rgba(140, 120, 80, 0)')
    ctx.fillStyle = vortex
    ctx.fillRect(0, 0, 1024, 512)
    // 漩涡臂
    for (let a = 0; a < 4; a++) {
      const angle = a * Math.PI / 2
      const g = ctx.createRadialGradient(
        512 + Math.cos(angle) * 30, cy + Math.sin(angle) * 30, 0,
        512 + Math.cos(angle) * 60, cy + Math.sin(angle) * 60, 40
      )
      g.addColorStop(0, 'rgba(100, 82, 50, 0.15)')
      g.addColorStop(1, 'rgba(100, 82, 50, 0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, 1024, 512)
    }
  }

  return canvas
}

// ============ 地球（Canvas 多边形路径绘制大陆，fBm 海岸扰动） ============

// 将 [lat, lon] 度数转为 1024x512 等距投影像素坐标
function llToPx(lat: number, lon: number): [number, number] {
  return [(lon + 180) / 360 * 1024, (90 - lat) / 180 * 512]
}

/** 在 ctx 上用闭合多边形绘制一个大陆（lat/lon 顶点数组） */
function drawContinent(ctx: CanvasRenderingContext2D, pts: [number, number][]): void {
  if (pts.length < 3) return
  const [sx, sy] = llToPx(pts[0][0], pts[0][1])
  ctx.beginPath()
  ctx.moveTo(sx, sy)
  for (let i = 1; i < pts.length; i++) {
    const [x, y] = llToPx(pts[i][0], pts[i][1])
    ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
}

// 各大洲轮廓（经纬度度，等距投影）
const CONTINENT_POLYGONS: [number, number][][] = [
  // ===== 北美洲 =====
  [
    [65, -168], [72, -160], [72, -140], [70, -125], [68, -110], [62, -97],
    [60, -93], [58, -88], [55, -82], [58, -78], [55, -63], [52, -56],
    [48, -52], [47, -55], [46, -58], [44, -63], [42, -68], [40, -74],
    [38, -76], [35, -78], [32, -80], [30, -82], [28, -82], [25, -80],
    [28, -84], [26, -88], [30, -90], [28, -94], [26, -98], [28, -100],
    [25, -98], [22, -100], [18, -96], [16, -92], [15, -88], [10, -84],
    [8, -78], [10, -76], [12, -80], [15, -84], [18, -88], [20, -92],
    [22, -98], [24, -104], [28, -110], [30, -114], [32, -117], [34, -120],
    [38, -123], [42, -124], [45, -124], [48, -126], [52, -130], [56, -135],
    [60, -145], [65, -168],
  ],
  // ===== 南美洲 =====
  [
    [12, -72], [12, -68], [10, -62], [7, -58], [5, -54], [2, -50],
    [0, -48], [-2, -48], [-5, -50], [-8, -42], [-12, -38], [-16, -42],
    [-20, -42], [-24, -44], [-28, -48], [-32, -50], [-35, -54], [-38, -58],
    [-42, -62], [-46, -66], [-48, -68], [-52, -70], [-55, -68], [-52, -72],
    [-48, -74], [-42, -74], [-38, -72], [-32, -70], [-25, -72], [-20, -70],
    [-15, -76], [-10, -78], [-5, -76], [0, -74], [2, -78], [5, -78],
    [8, -78], [10, -76], [12, -72],
  ],
  // ===== 非洲 =====
  [
    [35, -5], [36, 0], [36, 10], [34, 20], [32, 24], [30, 28], [28, 32],
    [22, 38], [18, 42], [12, 44], [8, 42], [5, 42], [2, 42],
    [-2, 40], [-5, 38], [-10, 38], [-12, 38], [-16, 36], [-20, 36],
    [-22, 34], [-26, 32], [-28, 32], [-32, 28], [-34, 26], [-34, 20],
    [-28, 16], [-22, 16], [-18, 14], [-14, 14], [-10, 12], [-4, 10],
    [0, 10], [4, 8], [5, 5], [8, -2], [12, -5], [15, -8], [18, -12],
    [22, -14], [26, -12], [30, -8], [33, -5], [35, -5],
  ],
  // ===== 欧洲 =====
  [
    [42, -10], [44, -8], [44, -2], [46, -2], [48, -5], [48, -2],
    [50, -2], [50, 2], [52, 4], [54, 8], [55, 10], [55, 12], [54, 14],
    [54, 18], [53, 20], [52, 22], [50, 24], [48, 22], [46, 20],
    [44, 18], [42, 18], [40, 20], [38, 22], [36, 24], [36, 26],
    [34, 28], [32, 30], [30, 32], [28, 34], [26, 36], [24, 36],
    [22, 38], [20, 40], [22, 36], [24, 32], [26, 28], [28, 24],
    [30, 20], [34, 18], [36, 14], [38, 12], [40, 8], [40, 4],
    [40, 0], [40, -4], [42, -6], [42, -10],
  ],
  // ===== 亚洲 =====
  [
    [58, 28], [60, 24], [62, 20], [64, 22], [66, 25], [70, 30],
    [72, 35], [74, 40], [75, 45], [73, 50], [72, 55], [70, 60],
    [68, 65], [65, 72], [62, 78], [58, 85], [56, 90], [54, 95],
    [50, 102], [48, 106], [46, 110], [44, 112], [42, 116], [40, 120],
    [38, 122], [36, 124], [34, 128], [32, 132], [30, 134], [28, 138],
    [25, 140], [22, 142], [20, 140], [16, 138], [10, 136],
    [5, 132], [2, 128], [1, 126], [1, 118], [-2, 116], [-5, 114],
    [-6, 110], [-8, 114], [-8, 118], [-6, 124], [-2, 130],
    [2, 134], [5, 130], [8, 128], [12, 126], [15, 124], [20, 120],
    [22, 118], [24, 116], [24, 112], [22, 108], [20, 106], [18, 104],
    [14, 102], [10, 100], [8, 98], [5, 96], [2, 92], [0, 90],
    [-2, 88], [-6, 84], [-5, 80], [-2, 78], [2, 76], [6, 76],
    [8, 78], [12, 80], [15, 82], [18, 80], [20, 78], [22, 76],
    [24, 74], [26, 72], [28, 70], [30, 66], [30, 62], [28, 60],
    [26, 58], [24, 56], [22, 54], [20, 50], [20, 46], [22, 42],
    [24, 40], [26, 38], [28, 36], [30, 34], [32, 32], [34, 30],
    [36, 28], [38, 26], [40, 24], [42, 22], [44, 20], [46, 22],
    [48, 24], [50, 26], [52, 28], [54, 28], [56, 28], [58, 28],
  ],
  // ===== 澳大利亚 =====
  [
    [-12, 132], [-14, 128], [-16, 124], [-18, 122], [-20, 118],
    [-22, 116], [-24, 114], [-26, 114], [-28, 116], [-30, 118],
    [-32, 120], [-34, 122], [-36, 126], [-38, 130], [-36, 134],
    [-34, 138], [-32, 142], [-30, 144], [-28, 146], [-26, 148],
    [-24, 150], [-20, 148], [-18, 146], [-16, 144], [-14, 140],
    [-12, 136], [-12, 132],
  ],
  // ===== 格陵兰 =====
  [
    [82, -50], [80, -32], [78, -20], [76, -18], [72, -22], [68, -30],
    [64, -35], [62, -42], [64, -48], [66, -54], [70, -58], [74, -56],
    [78, -52], [80, -50], [82, -50],
  ],
  // ===== 南极洲 =====
  [
    [-65, -180], [-62, -120], [-62, -60], [-65, 0], [-68, 60],
    [-68, 120], [-65, 180],
  ],
  // ===== 英伦三岛 =====
  [
    [58, -6], [58, -2], [55, -2], [52, -6], [54, -8], [56, -8], [58, -6],
  ],
  // ===== 马达加斯加 =====
  [
    [-12, 44], [-12, 48], [-16, 50], [-20, 50], [-24, 48], [-26, 44],
    [-24, 42], [-20, 42], [-16, 42], [-12, 44],
  ],
  // ===== 日本（本州+北海道+九州） =====
  [
    [45, 142], [42, 140], [38, 138], [34, 135], [32, 132], [30, 130],
    [30, 132], [32, 134], [34, 136], [36, 138], [38, 140], [40, 142],
    [42, 144], [44, 146], [45, 142],
  ],
  // ===== 新西兰 =====
  [
    [-35, 174], [-38, 174], [-40, 172], [-42, 172], [-44, 168],
    [-46, 168], [-46, 170], [-44, 172], [-42, 174], [-40, 176],
    [-38, 176], [-36, 176], [-35, 174],
  ],
  // ===== 东南亚群岛 =====
  [
    [5, 96], [2, 98], [-2, 96], [-5, 102], [-6, 106], [-8, 108],
    [-8, 112], [-5, 114], [-2, 112], [0, 110], [2, 108], [5, 106],
    [5, 100], [5, 96],
  ],
  [
    [-4, 114], [-2, 116], [2, 118], [5, 118], [8, 116], [8, 112],
    [5, 110], [2, 112], [-2, 112], [-4, 114],
  ],
  [
    [-8, 130], [-6, 134], [-4, 136], [-2, 138], [0, 140], [-2, 142],
    [-4, 140], [-6, 138], [-8, 136], [-8, 132], [-8, 130],
  ],
  // ===== 冰岛 =====
  [
    [66, -24], [66, -14], [64, -14], [62, -20], [64, -24], [66, -24],
  ],
  // ===== 古巴 =====
  [
    [22, -84], [20, -82], [22, -78], [24, -76], [24, -80], [22, -82], [22, -84],
  ],
  // ===== 哈德逊湾/加拿大群岛 =====
  [
    [59, -92], [60, -88], [62, -84], [64, -80], [62, -76], [60, -80],
    [58, -84], [56, -88], [58, -92], [59, -92],
  ],
  [
    [74, -90], [76, -82], [78, -78], [76, -72], [74, -76], [72, -80],
    [72, -86], [74, -90],
  ],
]

function generateEarthTexture(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(1024, 512)

  // ——— 第一步：在临时 canvas 上绘制大陆 mask（白色陆地，黑色海洋）———
  const maskCanvas = document.createElement('canvas')
  maskCanvas.width = 1024
  maskCanvas.height = 512
  const mCtx = maskCanvas.getContext('2d')!
  mCtx.fillStyle = '#000'
  mCtx.fillRect(0, 0, 1024, 512)
  mCtx.fillStyle = '#fff'
  for (const poly of CONTINENT_POLYGONS) {
    drawContinent(mCtx, poly)
  }
  const maskData = mCtx.getImageData(0, 0, 1024, 512)
  const mask = maskData.data  // R channel = 255 for land, 0 for ocean

  // ——— 第二步：用噪声扰动生成海岸线，并着色 ———
  const imgData = ctx.getImageData(0, 0, 1024, 512)
  const data = imgData.data

  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 1024; x++) {
      const i = (y * 1024 + x) * 4
      const nx = x / 1024
      const ny = y / 512
      const latFactor = Math.abs(ny - 0.5) * 2

      // 基础大陆判定：读取 mask + fBm 海岸扰动
      const coastNoise = fBm(x * 0.008 + 10, y * 0.008, 4, 77) * 0.4
        + fBm(x * 0.016 + 30, y * 0.016, 3, 88) * 0.15
      const baseLand = mask[i] > 128  // 白色 = 陆地
      // 在海岸线区域用噪声微调（mask 边缘 ±~10px）
      const isLand = baseLand
        ? (coastNoise > -0.25)
        : (coastNoise > 0.35)

      const elevation = fBm(nx * 18 + 5, ny * 18 + 5, 5, 3) * 0.5 + 0.3

      let r: number, g: number, b: number

      if (isLand) {
        if (latFactor > 0.85) {
          const ice = (latFactor - 0.85) * 6
          r = 150 + (228 - 150) * ice
          g = 165 + (233 - 165) * ice
          b = 175 + (243 - 175) * ice
        } else if (latFactor < 0.35) {
          r = 30 + elevation * 30
          g = 95 + elevation * 45
          b = 18 + elevation * 15
        } else if (latFactor < 0.6) {
          const dryNoise = fBm(nx * 12, ny * 12, 4, 55)
          if (dryNoise > 0.15) {
            r = 145 + dryNoise * 50
            g = 122 + dryNoise * 20
            b = 70 + dryNoise * 5
          } else {
            r = 48 + elevation * 30
            g = 88 + elevation * 28
            b = 32 + elevation * 8
          }
        } else {
          r = 110 + elevation * 35
          g = 125 + elevation * 15
          b = 95 + elevation * 5
        }
        const detail = fBm(nx * 45, ny * 45, 3, 4) * 6
        r += detail
        g += detail
        b += detail * 0.4
      } else {
        const oceanNoise = fBm(nx * 6, ny * 6, 3, 33) * 0.3
        if (latFactor > 0.8) {
          const iceMix = (latFactor - 0.8) * 5
          r = 30 + oceanNoise * 10 + iceMix * 30
          g = 60 + oceanNoise * 20 + iceMix * 40
          b = 100 + oceanNoise * 30 + iceMix * 30
        } else {
          r = 8 + oceanNoise * 10
          g = 32 + oceanNoise * 22
          b = 82 + oceanNoise * 45
        }
      }

      data[i] = Math.min(255, Math.max(0, r))
      data[i + 1] = Math.min(255, Math.max(0, g))
      data[i + 2] = Math.min(255, Math.max(0, b))
      data[i + 3] = 255
    }
  }
  ctx.putImageData(imgData, 0, 0)

  return canvas
}

// ============ 火星 ============
function generateMarsTexture(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(1024, 512)

  // 橙红底
  ctx.fillStyle = '#D06028'
  ctx.fillRect(0, 0, 1024, 512)

  const imgData = ctx.getImageData(0, 0, 1024, 512)
  const data = imgData.data
  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 1024; x++) {
      const nx = x / 1024
      const ny = y / 512
      const latFactor = Math.abs(ny - 0.5) * 2

      // 地形噪声（高分辨率）
      const terrain = fBm(nx * 18, ny * 16, 6, 4)
      // 大尺度亮暗区（南半球高地亮，北半球平原暗）
      const albedo = fBm(nx * 3.5, ny * 3.5, 4, 10)
      // 纬度调暗（极区更亮因为冰）
      const latDark = 1 - (1 - latFactor) * 0.15

      let r = 145 + terrain * 35 + albedo * 25
      let g = 55 + terrain * 18 + albedo * 8
      let b = 18 + terrain * 6 + albedo * 3

      // 暗区（古老玄武岩平原 — 北半球）
      if (albedo < 0.38) {
        r -= 28
        g -= 14
        b -= 5
      }

      // 极地冰盖（螺旋状边缘模拟）
      if (latFactor > 0.82) {
        const iceAmount = (latFactor - 0.82) * 6
        const spiral = Math.sin(nx * 30 + ny * 15) * 0.03
        const iceEdge = iceAmount + spiral
        r = r + (235 - r) * iceEdge
        g = g + (235 - g) * iceEdge
        b = b + (248 - b) * iceEdge
      }

      // 水手号峡谷（蜿蜒裂谷）
      const canyonNx = 0.65 + (ny - 0.44) * 0.04
      const canyonNy = 0.44 + (nx - 0.65) * 0.08
      const distCanyon = Math.sqrt(
        ((nx - canyonNx) / 0.08) ** 2 + ((ny - canyonNy) / 0.025) ** 2
      )
      if (distCanyon < 0.6) {
        const cDepth = (1 - distCanyon / 0.6) * 0.6
        r -= cDepth * 40
        g -= cDepth * 20
        b -= cDepth * 8
        // 峡谷北壁阴影
        if (ny > canyonNy) {
          const shadow = Math.min(cDepth * 0.5, 0.3)
          r -= shadow * 25
          g -= shadow * 12
        }
      }
      // 分支峡谷（水系网络）
      for (let bC = 0; bC < 3; bC++) {
        const bx = 0.58 + bC * 0.035
        const by = 0.47 + bC * 0.015
        const branchDist = Math.sqrt(
          ((nx - bx) / 0.025) ** 2 + ((ny - by) / 0.012) ** 2
        )
        if (branchDist < 0.5) {
          const bD = (1 - branchDist / 0.5) * 0.3
          r -= bD * 20
          g -= bD * 10
        }
      }

      r *= latDark
      g *= latDark
      b *= latDark

      const i = (y * 1024 + x) * 4
      data[i] = Math.min(255, Math.max(0, r))
      data[i + 1] = Math.min(255, Math.max(0, g))
      data[i + 2] = Math.min(255, Math.max(0, b))
      data[i + 3] = 255
    }
  }
  ctx.putImageData(imgData, 0, 0)

  // 奥林帕斯山（大型亮斑）
  const olymGrad = ctx.createRadialGradient(700, 165, 0, 700, 165, 75)
  olymGrad.addColorStop(0, 'rgba(220, 160, 95, 0.4)')
  olymGrad.addColorStop(0.5, 'rgba(215, 155, 90, 0.2)')
  olymGrad.addColorStop(1, 'rgba(200, 140, 80, 0)')
  ctx.fillStyle = olymGrad
  ctx.fillRect(0, 0, 1024, 512)
  // 火山口
  ctx.fillStyle = 'rgba(180, 120, 60, 0.3)'
  ctx.beginPath()
  ctx.arc(700, 165, 8, 0, Math.PI * 2)
  ctx.fill()

  // 埃律西姆山（Elysium Mons）
  const elyGrad = ctx.createRadialGradient(820, 290, 0, 820, 290, 40)
  elyGrad.addColorStop(0, 'rgba(215, 155, 90, 0.3)')
  elyGrad.addColorStop(1, 'rgba(200, 140, 80, 0)')
  ctx.fillStyle = elyGrad
  ctx.fillRect(0, 0, 1024, 512)

  // 大瑟提斯高原（Syrtis Major Planum — 暗色火山岩区）
  const syrtis = ctx.createRadialGradient(560, 325, 0, 560, 325, 55)
  syrtis.addColorStop(0, 'rgba(80, 50, 30, 0.25)')
  syrtis.addColorStop(1, 'rgba(80, 50, 30, 0)')
  ctx.fillStyle = syrtis
  ctx.fillRect(0, 0, 1024, 512)

  // 希腊盆地（Hellas Planitia — 大型撞击坑）
  const hellas = ctx.createRadialGradient(330, 340, 0, 330, 340, 50)
  hellas.addColorStop(0, 'rgba(195, 160, 110, 0.2)')
  hellas.addColorStop(1, 'rgba(195, 160, 110, 0)')
  ctx.fillStyle = hellas
  ctx.fillRect(0, 0, 1024, 512)

  return canvas
}

// ============ 木星 ============
function generateJupiterTexture(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(1024, 512)
  const rand = seededRandom(5)

  const imgData = ctx.getImageData(0, 0, 1024, 512)
  const data = imgData.data

  // 条带基础色
  const bandColors: Array<{ y: number; h: number; c: [number, number, number] }> = [
    { y: 0, h: 40, c: [200, 180, 150] },
    { y: 40, h: 30, c: [180, 140, 90] },
    { y: 70, h: 35, c: [210, 190, 160] },
    { y: 105, h: 30, c: [160, 110, 60] },
    { y: 135, h: 25, c: [190, 170, 140] },
    { y: 160, h: 35, c: [145, 85, 40] },
    { y: 195, h: 30, c: [200, 180, 150] },
    { y: 225, h: 25, c: [170, 130, 80] },
    { y: 250, h: 30, c: [190, 165, 130] },
    { y: 280, h: 25, c: [160, 100, 55] },
    { y: 305, h: 30, c: [205, 185, 155] },
    { y: 335, h: 28, c: [175, 135, 85] },
    { y: 363, h: 35, c: [195, 175, 145] },
    { y: 398, h: 30, c: [165, 115, 65] },
    { y: 428, h: 35, c: [185, 165, 135] },
    { y: 463, h: 30, c: [200, 180, 150] },
    { y: 493, h: 19, c: [160, 110, 60] },
  ]

  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 1024; x++) {
      const nx = x / 1024
      const ny = y / 512
      const lat = (y / 512) * bandColors.length

      // 用噪声扰动条带边界
      const bandWarp = fBm(nx * 4 + 20, ny * 3, 4, 6) * 0.15

      let bandIdx = 0
      const local = lat % 1
      let cumulative = 0
      for (let b = 0; b < bandColors.length; b++) {
        const bandHeight = bandColors[b].h / 512
        if (local < cumulative + bandHeight) {
          bandIdx = b
          break
        }
        cumulative += bandHeight
      }

      const bc = bandColors[bandIdx].c
      const turb = fBm(nx * 8 + (ny + bandWarp) * 6, ny * 6, 4, 5) * 0.5

      let r = bc[0] + turb * 30
      let g = bc[1] + turb * 25
      let bVal = bc[2] + turb * 20

      // 大红斑区域
      const spotX = 0.75
      const spotY = 0.28
      const dx = (nx - spotX) / 0.08
      const dy = (ny - spotY) / 0.05
      const distFromSpot = Math.sqrt(dx * dx + dy * dy)
      if (distFromSpot < 1) {
        const spotFactor = 1 - distFromSpot
        r -= spotFactor * 50
        g -= spotFactor * 70
        bVal -= spotFactor * 40
        // 红斑外围湍流
        r += spotFactor * Math.sin(nx * 60 + ny * 40) * 15
      }

      const i = (y * 1024 + x) * 4
      data[i] = Math.min(255, Math.max(0, r))
      data[i + 1] = Math.min(255, Math.max(0, g))
      data[i + 2] = Math.min(255, Math.max(0, bVal))
      data[i + 3] = 255
    }
  }
  ctx.putImageData(imgData, 0, 0)

  // 小白斑叠加
  for (let i = 0; i < 8; i++) {
    const cx = rand() * 1024
    const cy = rand() * 512
    const wr = 5 + rand() * 15
    const wh = 3 + rand() * 8
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
    ctx.beginPath()
    ctx.ellipse(cx, cy, wr, wh, rand() * 0.5, 0, Math.PI * 2)
    ctx.fill()
  }

  return canvas
}

// ============ 土星 ============
function generateSaturnTexture(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(1024, 512)
  const rand = seededRandom(6)

  const imgData = ctx.getImageData(0, 0, 1024, 512)
  const data = imgData.data

  // 条带定义：[起始y, 高度, R, G, B] — 暖金基调，赤道亮带增强，极区暗沉
  const bandColors: Array<{ y: number; h: number; c: [number, number, number] }> = [
    { y: 0,   h: 32, c: [175, 162, 148] },  // 南极区
    { y: 32,  h: 20, c: [200, 188, 165] },  // 南温带1
    { y: 52,  h: 22, c: [215, 202, 178] },
    { y: 74,  h: 18, c: [228, 215, 190] },
    { y: 92,  h: 20, c: [210, 198, 172] },
    { y: 112, h: 22, c: [235, 222, 198] },  // 南赤道带
    { y: 134, h: 30, c: [248, 235, 205] },  // ← 赤道亮带（最亮）
    { y: 164, h: 30, c: [250, 238, 208] },  // ← 赤道亮带延续
    { y: 194, h: 22, c: [240, 228, 198] },
    { y: 216, h: 18, c: [228, 215, 185] },  // 北赤道带
    { y: 234, h: 20, c: [215, 202, 172] },
    { y: 254, h: 22, c: [225, 212, 182] },
    { y: 276, h: 25, c: [208, 195, 165] },
    { y: 301, h: 22, c: [220, 206, 178] },
    { y: 323, h: 20, c: [205, 192, 162] },
    { y: 343, h: 22, c: [215, 200, 172] },
    { y: 365, h: 25, c: [195, 180, 155] },
    { y: 390, h: 28, c: [200, 185, 160] },
    { y: 418, h: 25, c: [188, 172, 148] },
    { y: 443, h: 22, c: [180, 165, 142] },
    { y: 465, h: 22, c: [170, 155, 132] },
    { y: 487, h: 25, c: [160, 145, 125] },  // 北极区
  ]

  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 1024; x++) {
      const nx = x / 1024
      const ny = y / 512

      // 条带扭曲（更柔和的波动）
      const bandWarp = fBm(nx * 4 + 40, ny * 3.5, 3, 7) * 0.06

      let bandIdx = 0
      let cumulative = 0
      for (let b = 0; b < bandColors.length; b++) {
        if (ny * 512 < cumulative + bandColors[b].h) {
          bandIdx = b
          break
        }
        cumulative += bandColors[b].h
      }

      const bc = bandColors[bandIdx].c
      // 减半噪声幅度，保留质感但不破坏条带
      const turb = fBm(nx * 6 + bandWarp, ny * 5, 3, 8) * 0.15
      const fineNoise = fBm(nx * 20, ny * 18, 2, 12) * 0.04

      let r = bc[0] + (turb + fineNoise) * 30
      let g = bc[1] + (turb + fineNoise) * 25
      let bVal = bc[2] + (turb + fineNoise) * 20

      // 赤道亮带高斯增强（ny ≈ 0.3-0.4）
      const eqDist = Math.abs(ny - 0.35)
      if (eqDist < 0.12) {
        const eqBoost = (1 - eqDist / 0.12) * 20
        r += eqBoost; g += eqBoost; bVal += eqBoost * 0.8
      }

      // 北极六边形（更醒目的淡青色）
      if (ny < 0.07) {
        const hexY = ny / 0.07
        const angle = Math.atan2(nx - 0.5, 0.5) * 3
        const hexRim = Math.abs(Math.sin(angle * 3)) * 0.35
        const hexGlow = Math.max(0, 1 - Math.abs(hexY - hexRim) * 5)
        r += hexGlow * 8
        g += hexGlow * 15
        bVal += hexGlow * 20
      }

      const i = (y * 1024 + x) * 4
      data[i]     = Math.min(255, Math.max(0, r))
      data[i + 1] = Math.min(255, Math.max(0, g))
      data[i + 2] = Math.min(255, Math.max(0, bVal))
      data[i + 3] = 255
    }
  }
  ctx.putImageData(imgData, 0, 0)

  // 2-3 个淡色椭圆风暴斑点（白色卵形）
  for (let i = 0; i < 3; i++) {
    const cx = 100 + rand() * 824
    const cy = 60 + rand() * 260 // 避开赤道亮带和极区
    const wr = 20 + rand() * 35
    const wh = 6 + rand() * 10
    ctx.fillStyle = `rgba(255, 248, 235, ${0.08 + rand() * 0.06})`
    ctx.beginPath()
    ctx.ellipse(cx, cy, wr, wh, rand() * 0.4, 0, Math.PI * 2)
    ctx.fill()
  }
  // 薄层大气涡旋纹
  for (let i = 0; i < 6; i++) {
    const cx = rand() * 1024
    const cy = 30 + rand() * 452
    const wr = 40 + rand() * 60
    const wh = 3 + rand() * 5
    ctx.fillStyle = `rgba(255, 242, 220, ${0.03 + rand() * 0.03})`
    ctx.beginPath()
    ctx.ellipse(cx, cy, wr, wh, rand() * 0.2, 0, Math.PI * 2)
    ctx.fill()
  }

  return canvas
}

// ============ 天王星 ============
function generateUranusTexture(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(1024, 512)

  const imgData = ctx.getImageData(0, 0, 1024, 512)
  const data = imgData.data

  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 1024; x++) {
      const nx = x / 1024
      const ny = y / 512

      // 纬度渐变：赤道浅青 → 极区深蓝绿
      const latFade = Math.abs(ny - 0.5) * 2

      // 多层条带
      const band1 = Math.sin(ny * 28 + Math.sin(nx * 10) * 0.3) * 0.06
      const band2 = Math.sin(ny * 16 + 1.2 + Math.sin(nx * 6) * 0.2) * 0.04
      const noise = fBm(nx * 8, ny * 7, 3, 7) * 0.04
      const band = band1 + band2 + noise

      // 微弱对流斑点
      const spot = fBm(nx * 12 + 30, ny * 8 + 50, 3, 11)
      const spotBright = Math.max(0, spot - 0.55) * 0.6

      const baseR = 190 - latFade * 55
      const baseG = 218 - latFade * 48
      const baseB = 228 - latFade * 42

      let r = baseR + band * 60 + spotBright * 20
      let g = baseG + band * 45 + spotBright * 15
      let b = baseB + band * 35 + spotBright * 10

      // 极冠（极区更暗更蓝）
      if (latFade > 0.6) {
        const polar = (latFade - 0.6) * 0.8
        r -= polar * 30
        g -= polar * 15
        b += polar * 5
      }

      const i = (y * 1024 + x) * 4
      data[i]     = Math.min(235, Math.max(90,  r))
      data[i + 1] = Math.min(240, Math.max(130, g))
      data[i + 2] = Math.min(245, Math.max(150, b))
      data[i + 3] = 255
    }
  }
  ctx.putImageData(imgData, 0, 0)

  return canvas
}

// ============ 海王星 ============
function generateNeptuneTexture(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(1024, 512)

  const imgData = ctx.getImageData(0, 0, 1024, 512)
  const data = imgData.data

  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 1024; x++) {
      const nx = x / 1024
      const ny = y / 512

      // 云带湍流（更高对比度）
      const band = fBm(nx * 6, ny * 10, 4, 9) * 0.2
      const turb = fBm(nx * 10 + ny * 2, ny * 5, 3, 10) * 0.08
      const fine = fBm(nx * 24, ny * 18, 2, 14) * 0.04

      // 饱和度提升的深蓝基调
      let r = 18 + (band + turb + fine) * 100
      let g = 42 + (band + turb + fine) * 110
      let b = 145 + (band + turb + fine) * 90

      // 大暗斑（GDS-89）
      const ddx = (nx - 0.5) / 0.10
      const ddy = (ny - 0.45) / 0.075
      const darkSpot = Math.exp(-(ddx * ddx + ddy * ddy) * 2)
      r -= darkSpot * 20
      g -= darkSpot * 35
      b -= darkSpot * 55

      // 暗斑边缘的亮伴生云
      const edgeX = 0.5 + (nx - 0.5) * 1.3
      const edgeY = 0.45 + (ny - 0.45) * 1.2
      const edgeDist = Math.sqrt(
        ((nx - 0.5) / 0.12) ** 2 + ((ny - 0.45) / 0.09) ** 2
      )
      if (edgeDist > 0.7 && edgeDist < 1.2) {
        const edgeBright = (1 - Math.abs(edgeDist - 0.95) / 0.25) * 0.5
        r += edgeBright * 50
        g += edgeBright * 40
        b += edgeBright * 30
      }

      // 第二暗斑（南半球小暗斑）
      const ddx2 = (nx - 0.35) / 0.06
      const ddy2 = (ny - 0.65) / 0.05
      const darkSpot2 = Math.exp(-(ddx2 * ddx2 + ddy2 * ddy2) * 2)
      r -= darkSpot2 * 10
      g -= darkSpot2 * 18
      b -= darkSpot2 * 30

      // 高空甲烷云（亮白斑点，经向拉长）
      const cloudNoise = fBm(nx * 14 + 100, ny * 8, 4, 11)
      const brightCloud = Math.max(0, cloudNoise - 0.55) * 1.8
      const cloudR = brightCloud * 70
      const cloudG = brightCloud * 55
      const cloudB = brightCloud * 40

      // 南极暗斑
      const southPolarDist = Math.sqrt(
        ((ny - 0.92) / 0.06) ** 2
      )
      if (southPolarDist < 1) {
        const sp = (1 - southPolarDist) * 0.3
        r -= sp * 25
        g -= sp * 20
        b += sp * 5
      }

      const i = (y * 1024 + x) * 4
      data[i]     = Math.min(255, Math.max(5,  r + cloudR))
      data[i + 1] = Math.min(255, Math.max(15, g + cloudG))
      data[i + 2] = Math.min(255, Math.max(55, b + cloudB))
      data[i + 3] = 255
    }
  }
  ctx.putImageData(imgData, 0, 0)

  return canvas
}

// ============ 月球 ============
function generateMoonTexture(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(1024, 512)
  const rand = seededRandom(10)

  // 灰色底 + 微地形
  const imgData = ctx.getImageData(0, 0, 1024, 512)
  const data = imgData.data
  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 1024; x++) {
      const nx = x / 1024
      const ny = y / 512
      const terrain = fBm(nx * 12, ny * 12, 5, 12)
      const base = 130 + terrain * 40
      const i = (y * 1024 + x) * 4
      data[i] = data[i + 1] = data[i + 2] = Math.min(200, Math.max(80, base))
      data[i + 3] = 255
    }
  }
  ctx.putImageData(imgData, 0, 0)

  // 月海（不规则形状暗区）
  const maria = [
    { x: 300, y: 200, r: 70 },
    { x: 560, y: 160, r: 55 },
    { x: 720, y: 280, r: 45 },
    { x: 200, y: 320, r: 50 },
    { x: 840, y: 180, r: 40 },
    { x: 440, y: 360, r: 60 },
    { x: 100, y: 200, r: 36 },
  ]

  for (const m of maria) {
    // 用噪声扰动月海边界
    const imgData2 = ctx.getImageData(0, 0, 1024, 512)
    const data2 = imgData2.data
    for (let py = Math.max(0, Math.floor(m.y - m.r)); py < Math.min(512, Math.ceil(m.y + m.r)); py++) {
      for (let px = Math.max(0, Math.floor(m.x - m.r)); px < Math.min(1024, Math.ceil(m.x + m.r)); px++) {
        const dx = (px - m.x) / m.r
        const dy = (py - m.y) / m.r * 1.4
        const noise = fBm(px * 0.04 + 50, py * 0.04, 3, 13) * 0.3
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist + noise < 1) {
          const blend = 1 - (dist + noise)
          const i2 = (py * 1024 + px) * 4
          data2[i2] = data2[i2] * (1 - blend * 0.5)
          data2[i2 + 1] = data2[i2 + 1] * (1 - blend * 0.5)
          data2[i2 + 2] = data2[i2 + 2] * (1 - blend * 0.5)
        }
      }
    }
    ctx.putImageData(imgData2, 0, 0)
  }

  // 陨石坑（含辐射纹）
  for (let i = 0; i < 100; i++) {
    const x = rand() * 1024
    const y = rand() * 512
    const r = 2 + rand() * 16 * (1 - Math.abs(y - 256) / 512)

    // 年轻陨石坑有辐射纹
    if (r > 6 && rand() > 0.5) {
      for (let j = 0; j < 6; j++) {
        const angle = rand() * Math.PI * 2
        const len = r * (3 + rand() * 4)
        const ray = ctx.createRadialGradient(x, y, 0, x + Math.cos(angle) * len, y + Math.sin(angle) * len, len * 0.3)
        ray.addColorStop(0, 'rgba(190, 190, 190, 0)')
        ray.addColorStop(0.2, 'rgba(200, 200, 200, 0.15)')
        ray.addColorStop(1, 'rgba(200, 200, 200, 0)')
        ctx.fillStyle = ray
        ctx.fillRect(0, 0, 1024, 512)
      }
    }

    // 坑洞
    const crater = ctx.createRadialGradient(x, y, r * 0.15, x, y, r)
    crater.addColorStop(0, 'rgba(60, 60, 60, 0.5)')
    crater.addColorStop(0.5, 'rgba(80, 80, 80, 0.25)')
    crater.addColorStop(1, 'rgba(120, 120, 120, 0)')
    ctx.fillStyle = crater
    ctx.fillRect(0, 0, 1024, 512)
  }

  // 高地亮纹
  for (let i = 0; i < 20; i++) {
    const x = rand() * 1024
    const y = rand() * 512
    const r = 15 + rand() * 35
    const bright = ctx.createRadialGradient(x, y, 0, x, y, r)
    bright.addColorStop(0, 'rgba(180, 180, 180, 0.1)')
    bright.addColorStop(1, 'rgba(180, 180, 180, 0)')
    ctx.fillStyle = bright
    ctx.fillRect(0, 0, 1024, 512)
  }

  return canvas
}

// ============ 通用岩石纹理（卫星/矮行星） ============
function generateRockTexture(bodyId: string): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(512, 256)
  const seed = hash(bodyId)

  const imgData = ctx.getImageData(0, 0, 512, 256)
  const data = imgData.data
  const base = 100 + (seed % 40)

  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 512; x++) {
      const nx = x / 512
      const ny = y / 256
      const n = fBm(nx * 10 + seed * 0.01, ny * 10, 4, seed + 200)
      const v = base + n * 40
      const i = (y * 512 + x) * 4
      data[i] = data[i + 1] = data[i + 2] = Math.min(200, Math.max(60, v))
      data[i + 3] = 255
    }
  }
  ctx.putImageData(imgData, 0, 0)

  // 陨石坑
  const rand = seededRandom(seed + 500)
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

// ─── 光环纹理 ─────────────────────────────────────────

/** 生成土星环的径向密度纹理（暖金明亮色调） */
function generateRingTexture(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(512, 128)
  const imgData = ctx.getImageData(0, 0, 512, 128)
  const data = imgData.data

  // 五段径向区域定义：[归一化起始y, 归一化结束y, 基准R, G, B]
  const zones: Array<[number, number, number, number, number]> = [
    [0.00, 0.27, 215, 205, 180],   // C 环：浅灰金
    [0.27, 0.68, 245, 225, 185],   // B 环：暖金（最亮）
    [0.68, 0.73, 35,  30,  25],    // 卡西尼缝：深暗
    [0.73, 0.97, 235, 215, 175],   // A 环：浅金
    [0.97, 1.00, 110, 100, 80],    // 外缘渐暗
  ]

  for (let y = 0; y < 128; y++) {
    const v = y / 128

    let zone: typeof zones[0] | null = null
    for (const z of zones) {
      if (v >= z[0] && v < z[1]) { zone = z; break }
    }
    if (!zone) zone = zones[0]

    for (let x = 0; x < 512; x++) {
      const u = x / 512

      // 环形密度波动（径向条纹）：仅 25% 幅度的明暗变化
      const radialWave = 0.75 + 0.25 * Math.sin(v * 50 + zone[0] * 35)
      // 角向噪声：轻微不均匀感
      const angularNoise = fBm(u * 6, v * 10, 2, 42) * 0.12
      // 细颗粒冰晶感
      const grain = fBm(u * 40 + v * 2, v * 30, 1, 7) * 0.08

      const brightness = radialWave + angularNoise + grain

      let r = zone[2] * brightness
      let g = zone[3] * brightness
      let b = zone[4] * brightness

      // 卡西尼缝边缘堆积亮边
      if (zone === zones[2]) {
        const edgeDist = Math.min(Math.abs(v - 0.68), Math.abs(v - 0.73))
        if (edgeDist < 0.012) {
          const glow = (1 - edgeDist / 0.012) * 120
          r += glow; g += glow * 0.9; b += glow * 0.7
        }
      }

      const i = (y * 512 + x) * 4
      data[i]     = Math.min(255, Math.max(0, r))
      data[i + 1] = Math.min(255, Math.max(0, g))
      data[i + 2] = Math.min(255, Math.max(0, b))
      data[i + 3] = 255
    }
  }
  ctx.putImageData(imgData, 0, 0)
  return canvas
}

let ringTextureCache: THREE.CanvasTexture | null = null

export function getRingTexture(): THREE.CanvasTexture {
  if (ringTextureCache) return ringTextureCache
  const canvas = generateRingTexture()
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  ringTextureCache = texture
  return texture
}
