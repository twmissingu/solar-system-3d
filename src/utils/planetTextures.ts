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

  // 灰色底 + 全局地形噪声
  const imgData = ctx.getImageData(0, 0, 1024, 512)
  const data = imgData.data
  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 1024; x++) {
      const n = fBm(x * 0.008, y * 0.008, 5, 1)
      const base = 100 + n * 50
      const i = (y * 1024 + x) * 4
      data[i] = data[i + 1] = data[i + 2] = Math.min(200, Math.max(60, base))
      data[i + 3] = 255
    }
  }
  ctx.putImageData(imgData, 0, 0)

  // 陨石坑 + 辐射纹
  for (let i = 0; i < 120; i++) {
    const x = rand() * 1024
    const y = rand() * 512
    const r = 3 + rand() * 20

    // 年轻撞击坑有辐射纹
    if (rand() > 0.6) {
      for (let j = 0; j < 8; j++) {
        const angle = rand() * Math.PI * 2
        const len = r * (3 + rand() * 5)
        const ray = ctx.createRadialGradient(x, y, 0, x + Math.cos(angle) * len, y + Math.sin(angle) * len, len * 0.3)
        ray.addColorStop(0, 'rgba(180, 180, 180, 0)')
        ray.addColorStop(0.3, 'rgba(200, 200, 200, 0.2)')
        ray.addColorStop(1, 'rgba(200, 200, 200, 0)')
        ctx.fillStyle = ray
        ctx.fillRect(0, 0, 1024, 512)
      }
    }

    // 坑洞
    const crater = ctx.createRadialGradient(x, y, r * 0.2, x, y, r)
    crater.addColorStop(0, 'rgba(50, 50, 50, 0.6)')
    crater.addColorStop(0.6, 'rgba(70, 70, 70, 0.3)')
    crater.addColorStop(1, 'rgba(120, 120, 120, 0)')
    ctx.fillStyle = crater
    ctx.fillRect(0, 0, 1024, 512)

    // 坑缘亮边
    ctx.strokeStyle = 'rgba(160, 160, 160, 0.2)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(x, y, r * 0.8, 0, Math.PI * 2)
    ctx.stroke()
  }

  // 平滑平原（暗区）
  for (let i = 0; i < 15; i++) {
    const x = rand() * 1024
    const y = rand() * 512
    const r = 20 + rand() * 50
    const plain = ctx.createRadialGradient(x, y, 0, x, y, r)
    plain.addColorStop(0, 'rgba(80, 80, 85, 0.15)')
    plain.addColorStop(1, 'rgba(80, 80, 85, 0)')
    ctx.fillStyle = plain
    ctx.fillRect(0, 0, 1024, 512)
  }

  return canvas
}

// ============ 金星 ============
function generateVenusTexture(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(1024, 512)

  // 淡黄色底
  ctx.fillStyle = '#D4A84A'
  ctx.fillRect(0, 0, 1024, 512)

  // 用 DomainWarp 生成旋涡云
  const imgData = ctx.getImageData(0, 0, 1024, 512)
  const data = imgData.data
  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 1024; x++) {
      const n = domainWarp(x * 0.006, y * 0.006, 2)
      const bright = 160 + n * 50
      const i = (y * 1024 + x) * 4
      data[i] = Math.min(240, bright)
      data[i + 1] = Math.min(210, bright * 0.8)
      data[i + 2] = Math.min(150, bright * 0.55)
    }
  }
  ctx.putImageData(imgData, 0, 0)

  // UV 暗斑（低层云特征）
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * 1024
    const y = Math.random() * 512
    const r = 15 + Math.random() * 50
    const dark = ctx.createRadialGradient(x, y, 0, x, y, r)
    dark.addColorStop(0, 'rgba(100, 80, 50, 0.2)')
    dark.addColorStop(1, 'rgba(100, 80, 50, 0)')
    ctx.fillStyle = dark
    ctx.fillRect(0, 0, 1024, 512)
  }

  return canvas
}

// ============ 地球（基于真实经纬度大陆轮廓） ============

// 将 [lat, lon] 度数转为 1024x512 等距投影像素坐标
function llToPx(lat: number, lon: number): [number, number] {
  return [(lon + 180) / 360 * 1024, (90 - lat) / 180 * 512]
}

// 主要大陆轮廓（简化但可识别的经纬度顶点）
const EARTH_CONTINENTS: [number, number][][] = [
  // 北美洲
  [
    [70, -168], [72, -160], [72, -140], [70, -125], [65, -110], [60, -98],
    [50, -90], [48, -82], [45, -74], [45, -70], [48, -58], [50, -56],
    [52, -55], [54, -58], [57, -60], [60, -70], [63, -80], [62, -95],
    [58, -105], [55, -115], [52, -124], [48, -126], [44, -126], [42, -124],
    [38, -123], [34, -120], [32, -117], [30, -110], [28, -100], [26, -98],
    [26, -90], [28, -84], [30, -82], [35, -76], [38, -76], [42, -70],
    [40, -75], [35, -78], [30, -82], [28, -86], [25, -80], [22, -85],
    [18, -88], [10, -84], [8, -78], [10, -76], [8, -78],
    [10, -84], [15, -88], [20, -92], [25, -98], [28, -96],
    [30, -96], [30, -90], [30, -85], [30, -82], [28, -80],
    [28, -80], [30, -82], [35, -76], [38, -76], [42, -70], [40, -75],
    [35, -78], [30, -82], [25, -80], [20, -87], [10, -84],
  ],
  // 南美洲
  [
    [10, -76], [12, -72], [12, -68], [10, -62], [8, -60], [5, -55],
    [2, -50], [0, -48], [-2, -48], [-5, -50], [-5, -42], [-8, -38],
    [-12, -38], [-16, -42], [-20, -42], [-24, -44], [-28, -48],
    [-32, -50], [-35, -55], [-38, -58], [-42, -62], [-46, -66],
    [-50, -70], [-55, -68], [-54, -72], [-48, -75], [-42, -74],
    [-38, -72], [-35, -72], [-30, -70], [-25, -72], [-20, -70],
    [-15, -75], [-10, -80], [-5, -78], [0, -75], [2, -78], [5, -78],
  ],
  // 非洲
  [
    [35, -5], [35, 10], [32, 25], [28, 32], [22, 38], [18, 42],
    [12, 44], [8, 42], [5, 42], [2, 42], [-2, 40], [-5, 38],
    [-8, 38], [-12, 38], [-16, 36], [-22, 36], [-26, 32],
    [-28, 32], [-32, 28], [-34, 28], [-35, 20], [-30, 18],
    [-22, 16], [-18, 14], [-14, 14], [-8, 12], [-2, 10],
    [2, 10], [5, 5], [8, -2], [12, -5], [15, -8], [20, -10],
    [24, -12], [28, -10], [32, -5], [35, -5],
  ],
  // 欧洲
  [
    [42, -10], [44, -8], [44, -2], [46, -2], [48, -5], [48, -2],
    [50, -2], [50, 2], [52, 4], [54, 8], [55, 10], [55, 12],
    [54, 14], [54, 18], [53, 20], [52, 22], [50, 24], [48, 22],
    [46, 20], [44, 18], [42, 18], [40, 20], [38, 22], [36, 24],
    [36, 26], [34, 28], [32, 30], [30, 32], [28, 34], [26, 36],
    [24, 36], [22, 38], [24, 30], [26, 24], [28, 22], [30, 20],
    [34, 18], [36, 15], [38, 12], [40, 8], [40, 4], [40, 0],
    [40, -4], [42, -6], [42, -10],
  ],
  // 亚洲（大轮廓，含印度、东南亚、中东/中国/日本等）
  [
    [58, 28], [60, 24], [62, 20], [64, 22], [66, 25], [68, 28],
    [70, 30], [72, 35], [74, 40], [75, 45], [74, 50], [72, 55],
    [70, 60], [68, 65], [65, 70], [62, 75], [60, 80], [58, 85],
    [56, 90], [54, 95], [50, 100], [48, 105], [46, 110], [44, 112],
    [42, 115], [40, 118], [38, 120], [36, 122], [34, 124], [32, 130],
    [30, 132], [28, 135], [26, 138], [24, 140], [22, 142], [20, 140],
    [16, 138], [12, 136], [8, 134], [4, 130], [2, 128], [1, 126],
    [1, 118], [-2, 116], [-5, 114], [-6, 110], [-8, 114],
    [-8, 118], [-8, 122], [-5, 126], [-2, 130], [2, 132],
    [5, 130], [8, 128], [12, 126], [15, 124], [18, 122],
    [20, 120], [22, 118], [24, 116], [24, 114], [24, 110],
    [22, 108], [20, 106], [18, 104], [16, 102], [14, 100],
    [12, 98], [10, 98], [8, 96], [6, 96], [4, 94],
    [2, 92], [0, 90], [-2, 88], [-5, 86], [-8, 84],
    [-6, 80], [-2, 78], [2, 76], [6, 76], [8, 78],
    [10, 80], [12, 82], [15, 82], [18, 80], [20, 78],
    [22, 76], [24, 74], [26, 72], [28, 70], [30, 68],
    [30, 64], [28, 62], [26, 60], [24, 58], [22, 56],
    [20, 54], [18, 52], [18, 48], [20, 44], [22, 42],
    [24, 40], [26, 38], [28, 36], [30, 34], [32, 32],
    [34, 30], [36, 28], [38, 26], [40, 24], [42, 22],
    [44, 20], [46, 22], [48, 24], [50, 26], [52, 28],
    [54, 28], [56, 28], [58, 28],
  ],
  // 澳大利亚
  [
    [-12, 132], [-14, 128], [-16, 124], [-18, 122], [-20, 118],
    [-22, 116], [-24, 114], [-26, 114], [-28, 116], [-30, 118],
    [-32, 120], [-34, 122], [-36, 126], [-38, 130], [-36, 134],
    [-34, 138], [-32, 140], [-30, 142], [-28, 144], [-26, 146],
    [-24, 148], [-22, 150], [-20, 148], [-18, 146], [-16, 144],
    [-14, 140], [-12, 136], [-12, 132],
  ],
  // 格陵兰
  [
    [82, -50], [80, -35], [78, -20], [76, -18], [72, -22],
    [68, -30], [64, -35], [62, -42], [64, -48], [66, -54],
    [70, -58], [74, -56], [78, -52], [80, -50], [82, -50],
  ],
  // 南极洲
  [
    [-65, -180], [-62, -120], [-62, -60], [-65, 0], [-68, 60],
    [-68, 120], [-65, 180],
  ],
]

// 次要岛屿（英伦三岛、马达加斯加、日本、新西兰、东南亚岛屿等）
const EARTH_ISLANDS: [number, number][][] = [
  // 英伦三岛
  [[58, -6], [58, -2], [55, -2], [52, -6], [54, -8], [56, -8], [58, -6]],
  // 马达加斯加
  [[-12, 44], [-12, 48], [-16, 50], [-20, 50], [-24, 48], [-26, 44], [-24, 42], [-20, 42], [-16, 42], [-12, 44]],
  // 日本（本州+北海道）
  [[45, 142], [42, 140], [38, 138], [34, 135], [32, 132], [30, 130], [30, 132], [32, 134], [34, 136], [36, 138], [38, 140], [40, 142], [42, 144], [44, 146]],
  // 新西兰
  [[-35, 174], [-38, 174], [-40, 172], [-42, 172], [-44, 168], [-46, 168], [-46, 170], [-44, 172], [-42, 174], [-40, 176], [-38, 176], [-36, 176], [-35, 174]],
  // 东南亚主要岛屿（苏门答腊、爪哇、婆罗洲、新几内亚）
  [[5, 96], [2, 98], [-2, 96], [-5, 102], [-6, 106], [-8, 108], [-8, 112], [-5, 114], [-2, 112], [0, 110], [2, 108], [5, 106], [5, 100], [5, 96]],
  [[-6, 106], [-8, 108], [-8, 110], [-6, 112], [-4, 110], [-4, 108], [-6, 106]],
  [[-4, 114], [-2, 116], [2, 118], [5, 118], [8, 116], [8, 112], [5, 110], [2, 112], [-2, 112], [-4, 114]],
  [[-8, 130], [-6, 134], [-4, 136], [-2, 138], [0, 140], [-2, 142], [-4, 140], [-6, 138], [-8, 136], [-8, 132], [-8, 130]],
  // 冰岛
  [[66, -24], [66, -14], [64, -14], [62, -20], [64, -24], [66, -24]],
  // 古巴
  [[22, -84], [20, -82], [22, -78], [24, -76], [24, -80], [22, -82], [22, -84]],
]

// 判断像素是否在陆地上的快速函数（基于大陆轮廓 + 噪声海岸扰动）
function isLandPixel(x: number, y: number, w: number, h: number, continents: [number, number][][], islands: [number, number][][]): boolean {
  // 将像素坐标转回经纬度
  const lon = (x / w) * 360 - 180
  const lat = 90 - (y / h) * 180

  // 点是否在多边形内的射线检测
  function pointInPoly(px: number, py: number, poly: [number, number][]): boolean {
    let inside = false
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1]
      const xj = poly[j][0], yj = poly[j][1]
      if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) {
        inside = !inside
      }
    }
    return inside
  }

  // 用噪声为海岸线添加细微扰动
  const coastalNoise = fBm(lat * 0.08, lon * 0.08, 3, 88) * 1.5
  const perturbedLat = lat + coastalNoise

  for (const poly of continents) {
    if (pointInPoly(lon, perturbedLat, poly)) return true
  }
  for (const poly of islands) {
    if (pointInPoly(lon, lat, poly)) return true
  }
  return false
}

function generateEarthTexture(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(1024, 512)
  const imgData = ctx.getImageData(0, 0, 1024, 512)
  const data = imgData.data

  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 1024; x++) {
      const nx = x / 1024
      const ny = y / 512
      const latFactor = Math.abs(ny - 0.5) * 2

      const land = isLandPixel(x, y, 1024, 512, EARTH_CONTINENTS, EARTH_ISLANDS)

      // 海拔细节
      const elevation = fBm(nx * 20, ny * 20, 5, 3) * 0.5 + 0.3

      let r: number, g: number, b: number

      if (land) {
        // 纬度决定植被/冰
        if (latFactor > 0.85) {
          // 极地冰盖
          const iceAmt = (latFactor - 0.85) * 6
          r = 160 + (230 - 160) * iceAmt
          g = 170 + (235 - 170) * iceAmt
          b = 180 + (245 - 180) * iceAmt
        } else if (latFactor < 0.35) {
          // 赤道热带
          r = 35 + elevation * 30
          g = 100 + elevation * 45
          b = 20 + elevation * 15
        } else if (latFactor < 0.6) {
          // 温带
          const dry = fBm(nx * 15, ny * 15, 3, 55)
          if (dry > 0.1) {
            // 沙漠/干旱
            r = 140 + dry * 60
            g = 120 + dry * 30
            b = 70 + dry * 10
          } else {
            r = 50 + elevation * 30
            g = 85 + elevation * 30
            b = 30 + elevation * 10
          }
        } else {
          // 亚寒带/苔原
          r = 100 + elevation * 40
          g = 120 + elevation * 20
          b = 80 + elevation * 10
        }

        // 地形细微差异
        const detail = fBm(nx * 50, ny * 50, 3, 4) * 8
        r += detail
        g += detail
        b += detail * 0.5
      } else {
        // 海洋：深度感
        const deepNoise = fBm(nx * 8, ny * 8, 3, 33)
        r = 10 + deepNoise * 8
        g = 35 + deepNoise * 20
        b = 80 + deepNoise * 40
        // 浅海近海岸（latFactor 较大的区域极地冰区外围）
        if (latFactor > 0.75) {
          const shelf = (latFactor - 0.75) * 4
          r += shelf * 15
          g += shelf * 25
          b += shelf * 20
        }
      }

      const i = (y * 1024 + x) * 4
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
  ctx.fillStyle = '#B84A1E'
  ctx.fillRect(0, 0, 1024, 512)

  const imgData = ctx.getImageData(0, 0, 1024, 512)
  const data = imgData.data
  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 1024; x++) {
      const nx = x / 1024
      const ny = y / 512
      const latFactor = Math.abs(ny - 0.5) * 2

      // 地形噪声
      const terrain = fBm(nx * 16, ny * 16, 6, 4)
      // 大尺度亮暗区域
      const albedo = fBm(nx * 3, ny * 3, 4, 10)

      // 海拔影响颜色
      let r = 130 + terrain * 40 + albedo * 20
      let g = 50 + terrain * 20 + albedo * 5
      let b = 15 + terrain * 5

      // 暗区（古老玄武岩）
      if (albedo < 0.35) {
        r -= 30
        g -= 15
        b -= 5
      }

      // 极地冰盖
      if (latFactor > 0.85) {
        const iceAmount = (latFactor - 0.85) * 6
        r = r + (230 - r) * iceAmount
        g = g + (230 - g) * iceAmount
        b = b + (240 - b) * iceAmount
      }

      // 水手号峡谷区域（深色线）
      const canyonX = 0.65 + (ny - 0.4) * 0.05
      const canyonY = 0.42 + (nx - 0.65) * 0.15
      if (Math.abs(nx - 0.65) < 0.08 && Math.abs(ny - 0.45) < 0.03) {
        r -= 25
        g -= 10
      }

      const i = (y * 1024 + x) * 4
      data[i] = Math.min(255, Math.max(0, r))
      data[i + 1] = Math.min(255, Math.max(0, g))
      data[i + 2] = Math.min(255, Math.max(0, b))
      data[i + 3] = 255
    }
  }
  ctx.putImageData(imgData, 0, 0)

  // 奥林帕斯山（亮斑）
  const olymGrad = ctx.createRadialGradient(700, 160, 0, 700, 160, 70)
  olymGrad.addColorStop(0, 'rgba(210, 150, 90, 0.35)')
  olymGrad.addColorStop(1, 'rgba(210, 150, 90, 0)')
  ctx.fillStyle = olymGrad
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

  const bandColors: Array<{ y: number; h: number; c: [number, number, number] }> = [
    { y: 0, h: 35, c: [220, 208, 175] },
    { y: 35, h: 28, c: [205, 190, 155] },
    { y: 63, h: 30, c: [225, 215, 185] },
    { y: 93, h: 25, c: [195, 178, 140] },
    { y: 118, h: 22, c: [215, 205, 175] },
    { y: 140, h: 30, c: [185, 168, 130] },
    { y: 170, h: 25, c: [210, 198, 168] },
    { y: 195, h: 28, c: [200, 185, 148] },
    { y: 223, h: 22, c: [218, 208, 178] },
    { y: 245, h: 35, c: [190, 172, 135] },
    { y: 280, h: 28, c: [212, 200, 170] },
    { y: 308, h: 25, c: [195, 178, 140] },
    { y: 333, h: 30, c: [220, 210, 180] },
    { y: 363, h: 28, c: [188, 170, 132] },
    { y: 391, h: 25, c: [215, 203, 172] },
    { y: 416, h: 32, c: [200, 185, 148] },
    { y: 448, h: 30, c: [210, 198, 168] },
    { y: 478, h: 34, c: [195, 175, 138] },
  ]

  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 1024; x++) {
      const nx = x / 1024
      const ny = y / 512

      // 土星条带更柔和，噪声更温和
      const bandWarp = fBm(nx * 5 + 40, ny * 4, 3, 7) * 0.1

      let bandIdx = 0
      let cumulative = 0
      for (let b = 0; b < bandColors.length; b++) {
        const bandHeight = bandColors[b].h / 512
        if (ny * 512 < cumulative + bandHeight) {
          bandIdx = b
          break
        }
        cumulative += bandHeight
      }

      const bc = bandColors[bandIdx].c
      const turb = fBm(nx * 6 + bandWarp, ny * 5, 3, 8) * 0.3

      let r = bc[0] + turb * 20
      let g = bc[1] + turb * 18
      let bVal = bc[2] + turb * 15

      // 北极六边形区域
      if (ny < 0.06) {
        const hexY = ny / 0.06
        const angle = Math.atan2(nx - 0.5, 0.5) * 3
        const hexRim = Math.abs(Math.sin(angle * 3)) * 0.3
        const hexGlow = Math.max(0, 1 - Math.abs(hexY - hexRim) * 4)
        r += hexGlow * 15
        g += hexGlow * 10
        bVal += hexGlow * 5
      }

      const i = (y * 1024 + x) * 4
      data[i] = Math.min(255, Math.max(0, r))
      data[i + 1] = Math.min(255, Math.max(0, g))
      data[i + 2] = Math.min(255, Math.max(0, bVal))
      data[i + 3] = 255
    }
  }
  ctx.putImageData(imgData, 0, 0)

  // 轻微条带
  for (let i = 0; i < 10; i++) {
    const cx = rand() * 1024
    const cy = rand() * 512
    const wr = 15 + rand() * 40
    const wh = 4 + rand() * 12
    ctx.fillStyle = 'rgba(255, 245, 230, 0.06)'
    ctx.beginPath()
    ctx.ellipse(cx, cy, wr, wh, rand() * 0.3, 0, Math.PI * 2)
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

      // 极淡的条带
      const band = Math.sin(ny * 20 + Math.sin(nx * 8) * 0.3) * 0.04
      const noise = fBm(nx * 6, ny * 6, 3, 7) * 0.03

      // 青色基调，纬度渐变
      const latVar = Math.abs(ny - 0.5) * 0.06
      const r = 130 + (band + noise) * 80 - latVar * 80
      const g = 175 + (band + noise) * 60 - latVar * 50
      const b = 180 + (band + noise) * 50 - latVar * 40

      const i = (y * 1024 + x) * 4
      data[i] = Math.min(235, Math.max(100, r))
      data[i + 1] = Math.min(235, Math.max(140, g))
      data[i + 2] = Math.min(240, Math.max(150, b))
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

      // 云带湍流
      const band = fBm(nx * 5, ny * 8, 4, 9) * 0.15
      const turb = fBm(nx * 8 + ny * 2, ny * 5, 3, 10) * 0.06

      const r = 25 + (band + turb) * 120
      const g = 50 + (band + turb) * 120
      const b = 130 + (band + turb) * 100

      // 大暗斑
      const ddx = (nx - 0.5) / 0.12
      const ddy = (ny - 0.45) / 0.08
      const darkSpot = Math.exp(-(ddx * ddx + ddy * ddy) * 2)
      const finalR = r - darkSpot * 25
      const finalG = g - darkSpot * 35
      const finalB = b - darkSpot * 50

      // 亮甲烷云
      const cloudNoise = fBm(nx * 12 + 100, ny * 10, 4, 11)
      const brightCloud = Math.max(0, cloudNoise - 0.6) * 2

      const i = (y * 1024 + x) * 4
      data[i] = Math.min(255, Math.max(10, finalR + brightCloud * 80))
      data[i + 1] = Math.min(255, Math.max(20, finalG + brightCloud * 60))
      data[i + 2] = Math.min(255, Math.max(60, finalB + brightCloud * 40))
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
