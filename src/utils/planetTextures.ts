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

// ============ 地球（高斯椭圆叠加 + fBm 海岸扰动） ============

// 高斯大陆种子：[lat, lon, radius_lat(°), radius_lon(°), weight]
// 每个种子是一个大致位于大陆核心的正态分布椭圆，
// 多个种子重叠叠加形成自然的大洲轮廓，经 fBm 噪声扰动后海岸线不再呈椭圆形状。
const CONTINENT_SEEDS: [number, number, number, number, number][] = [
  // 北美洲
  [50, -100, 18, 18, 4.0],    // 中部主大陆
  [58, -115, 10, 12, 2.0],    // 加拿大西部
  [65, -140, 10, 14, 1.5],    // 阿拉斯加
  [26, -95, 10, 12, 2.0],     // 墨西哥/德州
  [15, -86, 8, 8, 1.5],       // 中美洲
  [46, -72, 6, 8, 1.2],       // 魁北克/海洋省
  [28, -82, 5, 6, 0.8],       // 佛罗里达

  // 南美洲
  [-8, -55, 14, 12, 4.0],     // 巴西/亚马孙
  [-22, -62, 12, 10, 2.5],   // 秘鲁/玻利维亚
  [-36, -62, 10, 8, 2.0],    // 阿根廷/智利
  [5, -70, 8, 8, 2.0],       // 哥伦比亚/委内瑞拉
  [-48, -70, 8, 6, 1.0],     // 巴塔哥尼亚
  [-5, -42, 6, 6, 0.8],      // 巴西东北角

  // 非洲
  [10, 12, 14, 16, 4.0],     // 中非/西非
  [-2, 22, 12, 12, 2.5],     // 中非/刚果
  [-18, 26, 10, 10, 2.0],    // 南部非洲
  [24, 30, 6, 8, 1.5],       // 埃及/东北非
  [10, 40, 6, 8, 1.2],       // 非洲之角
  [34, -4, 6, 8, 1.2],       // 摩洛哥/北非海岸

  // 欧洲
  [50, 10, 10, 12, 3.0],     // 中欧
  [56, 6, 6, 8, 1.5],        // 北欧/斯堪的纳维亚
  [42, -2, 6, 8, 1.2],       // 伊比利亚
  [46, 24, 6, 10, 1.2],      // 东欧/喀尔巴阡
  [60, 30, 6, 10, 1.0],      // 斯堪的纳维亚北部
  [42, 16, 4, 6, 0.8],       // 意大利

  // 亚洲
  [50, 80, 16, 28, 4.0],     // 俄罗斯/西伯利亚
  [42, 108, 12, 18, 3.0],    // 中国/蒙古
  [28, 76, 10, 12, 3.0],     // 印度
  [42, 132, 10, 12, 2.0],    // 东亚/日本
  [52, 52, 8, 12, 1.5],      // 乌拉尔
  [24, 96, 8, 12, 1.5],      // 东南亚（缅甸/泰国/越南）
  [28, 46, 6, 10, 1.2],      // 阿拉伯半岛
  [38, 68, 4, 6, 0.8],       // 中亚
  [4, 106, 6, 10, 1.0],      // 印度尼西亚（苏门答腊/爪哇/婆罗洲）
  [-4, 132, 5, 8, 0.8],      // 新几内亚

  // 澳大利亚
  [-26, 132, 10, 14, 3.0],   // 澳大利亚主体
  [-20, 146, 6, 8, 1.2],     // 澳洲东海岸
  [-34, 136, 5, 6, 0.8],     // 澳洲南海岸

  // 格陵兰
  [74, -40, 8, 12, 2.5],
  [80, -28, 6, 8, 1.0],

  // 南极洲
  [-75, 0, 10, 180, 2.0],
  [-70, 60, 8, 60, 1.5],
  [-70, -60, 8, 60, 1.5],

  // 马达加斯加
  [-20, 46, 5, 4, 1.5],

  // 日本（额外叠加在亚洲种子上）
  [36, 138, 4, 4, 1.0],

  // 英伦三岛
  [56, -4, 3, 4, 1.2],

  // 古巴
  [22, -80, 2, 4, 1.0],
]

function generateEarthTexture(): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(1024, 512)
  const imgData = ctx.getImageData(0, 0, 1024, 512)
  const data = imgData.data

  // 预计算每个种子对像素的最近影响，加速渲染
  // 将种子按经度分格 (60° 每格)，减少每个像素的检查数
  type SeedWithLon = { lat: number; lon: number; rlat: number; rlon: number; w: number; lon180: number }
  const seeds: SeedWithLon[] = CONTINENT_SEEDS.map(s => ({
    lat: s[0], lon: s[1], rlat: s[2], rlon: s[3], w: s[4],
    lon180: s[1] < 0 ? s[1] + 360 : s[1],
  }))

  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 1024; x++) {
      const nx = x / 1024
      const ny = y / 512
      // 经纬度（等距投影）
      const lon = (x / 1024) * 360 - 180
      const lat = 90 - (y / 512) * 180
      const lon180 = lon < 0 ? lon + 360 : lon
      const latFactor = Math.abs(ny - 0.5) * 2

      // --- 高斯种子叠加计算大陆概率 ---
      let landScore = 0
      for (const seed of seeds) {
        const dlat = (lat - seed.lat) / seed.rlat
        // 处理经度环绕
        let dlon = (lon180 - seed.lon180) / seed.rlon
        if (dlon > 180 / seed.rlon) dlon -= 360 / seed.rlon
        if (dlon < -180 / seed.rlon) dlon += 360 / seed.rlon
        const dist2 = dlat * dlat + dlon * dlon
        landScore += seed.w / (1 + dist2 * 2.5)
      }

      // 噪声海岸扰动（对半球坐标使用不同种子，产生多样海岸线形状）
      const coastNoise = fBm(lat * 0.06 + 10, lon * 0.06, 4, 77) * 0.35
        + fBm(lat * 0.12 + 20, lon * 0.12, 3, 88) * 0.15

      // 纬度阈值：高纬度略降低大陆概率（避免噪声产生太厚极地大陆）
      // 地球陆地仅占 ~29%，提高阈值使约 70% 区域为海洋
      const latAdjust = 1 - Math.pow(latFactor, 3) * 0.15
      const threshold = 0.68 * latAdjust
      const isLand = landScore + coastNoise > threshold

      // 海拔细节
      const elevation = fBm(nx * 18 + 5, ny * 18 + 5, 5, 3) * 0.5 + 0.3

      let r: number, g: number, b: number

      if (isLand) {
        // 纬度 + 海拔着色
        if (latFactor > 0.85) {
          // 极地冰盖
          const ice = (latFactor - 0.85) * 6
          r = 150 + (228 - 150) * ice
          g = 165 + (233 - 165) * ice
          b = 175 + (243 - 175) * ice
        } else if (latFactor < 0.35) {
          // 赤道带：热带雨林/草原，海拔影响暗度
          r = 30 + elevation * 30
          g = 95 + elevation * 45
          b = 18 + elevation * 15
        } else if (latFactor < 0.6) {
          // 温带：用噪声决定干旱/森林
          const dryNoise = fBm(nx * 12, ny * 12, 4, 55)
          if (dryNoise > 0.15) {
            // 沙漠/灌木
            r = 145 + dryNoise * 50
            g = 122 + dryNoise * 20
            b = 70 + dryNoise * 5
          } else {
            // 森林
            r = 48 + elevation * 30
            g = 88 + elevation * 28
            b = 32 + elevation * 8
          }
        } else {
          // 亚寒带
          r = 110 + elevation * 35
          g = 125 + elevation * 15
          b = 95 + elevation * 5
        }

        // 细尺度地形变化
        const detail = fBm(nx * 45, ny * 45, 3, 4) * 6
        r += detail
        g += detail
        b += detail * 0.4
      } else {
        // 海洋：纬度决定颜色深度
        const oceanNoise = fBm(nx * 6, ny * 6, 3, 33) * 0.3
        if (latFactor > 0.8) {
          // 极地海洋更亮（冰水混合）
          const iceMix = (latFactor - 0.8) * 5
          r = 30 + oceanNoise * 10 + iceMix * 30
          g = 60 + oceanNoise * 20 + iceMix * 40
          b = 100 + oceanNoise * 30 + iceMix * 30
        } else {
          // 低纬度海洋深蓝
          r = 8 + oceanNoise * 10
          g = 32 + oceanNoise * 22
          b = 82 + oceanNoise * 45
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
