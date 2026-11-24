/* A small QR code generator (byte mode, error level M, versions 1–6, up to 106 bytes), so the
   Instagram QR code on the front page is drawn as an SVG with no extra package.
   From the MIT-licensed Marginalia Portfolio Template by Kedhareswer Naidu. */
/* eslint-disable */

// ---- QR code: byte mode, error level M, versions 1–6 (up to 106 bytes).
const QR_EXP: number[] = []
const QR_LOG: number[] = []
;(function initGF() {
  let x = 1
  for (let i = 0; i < 255; i++) {
    QR_EXP[i] = x
    QR_LOG[x] = i
    x <<= 1
    if (x & 256) x ^= 0x11d
  }
  for (let i = 255; i < 512; i++) QR_EXP[i] = QR_EXP[i - 255]
})()

function gfMul(a: number, b: number): number {
  return a && b ? QR_EXP[QR_LOG[a] + QR_LOG[b]] : 0
}

function rsRemainder(data: number[], n: number): number[] {
  let gen = [1]
  for (let i = 0; i < n; i++) {
    const next = new Array(gen.length + 1).fill(0)
    for (let j = 0; j < gen.length; j++) {
      next[j] ^= gen[j]
      next[j + 1] ^= gfMul(gen[j], QR_EXP[i])
    }
    gen = next
  }
  const res = new Array(n).fill(0)
  for (const d of data) {
    const f = d ^ res[0]
    res.shift()
    res.push(0)
    for (let j = 0; j < n; j++) res[j] ^= gfMul(gen[j + 1], f)
  }
  return res
}

function utf8(s: string): number[] {
  const out: number[] = []
  for (const ch of s) {
    let c = ch.codePointAt(0) || 0
    if (c < 0x80) out.push(c)
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63))
    else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63))
    else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63))
  }
  return out
}

// [data codewords per block, EC codewords per block, blocks] at level M
const QR_M = [[0, 0, 0], [16, 10, 1], [28, 16, 1], [44, 26, 1], [32, 18, 2], [43, 24, 2], [27, 16, 4]]

function qrMask(m: number, x: number, y: number): boolean {
  switch (m) {
    case 0: return (x + y) % 2 === 0
    case 1: return y % 2 === 0
    case 2: return x % 3 === 0
    case 3: return (x + y) % 3 === 0
    case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0
    case 5: return ((x * y) % 2) + ((x * y) % 3) === 0
    case 6: return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0
    default: return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0
  }
}

function qrPenalty(g: boolean[][]): number {
  const n = g.length
  let p = 0
  let dark = 0
  for (let a = 0; a < n; a++) {
    for (const horiz of [true, false]) {
      let run = 1
      for (let b = 1; b <= n; b++) {
        const same = b < n && (horiz ? g[a][b] === g[a][b - 1] : g[b][a] === g[b - 1][a])
        if (same) run++
        else {
          if (run >= 5) p += run - 2
          run = 1
        }
      }
      for (let b = 0; b + 10 < n; b++) {
        let s = ""
        for (let k = 0; k < 11; k++) s += (horiz ? g[a][b + k] : g[b + k][a]) ? "1" : "0"
        if (s === "10111010000" || s === "00001011101") p += 40
      }
    }
  }
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      if (g[y][x]) dark++
      if (x < n - 1 && y < n - 1 && g[y][x] === g[y][x + 1] && g[y][x] === g[y + 1][x] && g[y][x] === g[y + 1][x + 1]) p += 3
    }
  p += Math.floor(Math.abs((dark * 20) / (n * n) - 10)) * 10
  return p
}

/** The QR module grid for `text` (true = dark), or null when it is too long. */
export function qrMatrix(text: string): boolean[][] | null {
  const bytes = utf8(text)
  let ver = 1
  while (ver <= 6 && 12 + bytes.length * 8 > QR_M[ver][0] * QR_M[ver][2] * 8) ver++
  if (ver > 6) return null
  const [per, ecn, blocks] = QR_M[ver]
  const cap = per * blocks
  const bits: number[] = []
  const put = (v: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((v >>> i) & 1)
  }
  put(4, 4)
  put(bytes.length, 8)
  for (const b of bytes) put(b, 8)
  put(0, Math.min(4, cap * 8 - bits.length))
  while (bits.length % 8) bits.push(0)
  const data: number[] = []
  for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(""), 2))
  for (let pad = 0xec; data.length < cap; pad ^= 0xec ^ 0x11) data.push(pad)
  const dataBlocks: number[][] = []
  const ecBlocks: number[][] = []
  for (let b = 0; b < blocks; b++) {
    const chunk = data.slice(b * per, (b + 1) * per)
    dataBlocks.push(chunk)
    ecBlocks.push(rsRemainder(chunk, ecn))
  }
  const stream: number[] = []
  for (let i = 0; i < per; i++) for (const blk of dataBlocks) stream.push(blk[i])
  for (let i = 0; i < ecn; i++) for (const blk of ecBlocks) stream.push(blk[i])

  const size = 17 + ver * 4
  const mods: boolean[][] = []
  const fn: boolean[][] = []
  for (let y = 0; y < size; y++) {
    mods.push(new Array(size).fill(false))
    fn.push(new Array(size).fill(false))
  }
  const set = (x: number, y: number, v: boolean) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return
    mods[y][x] = v
    fn[y][x] = true
  }
  for (const [fx, fy] of [[3, 3], [size - 4, 3], [3, size - 4]]) {
    for (let dy = -4; dy <= 4; dy++)
      for (let dx = -4; dx <= 4; dx++) {
        const d = Math.max(Math.abs(dx), Math.abs(dy))
        set(fx + dx, fy + dy, d !== 2 && d !== 4)
      }
  }
  for (let i = 8; i < size - 8; i++) {
    set(6, i, i % 2 === 0)
    set(i, 6, i % 2 === 0)
  }
  if (ver > 1) {
    const c = size - 7
    for (let dy = -2; dy <= 2; dy++)
      for (let dx = -2; dx <= 2; dx++) set(c + dx, c + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1)
  }
  const drawFormat = (mask: number) => {
    const d = mask // level M is 00
    let rem = d
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537)
    const f = ((d << 10) | rem) ^ 0x5412
    const bit = (i: number) => ((f >>> i) & 1) === 1
    for (let i = 0; i <= 5; i++) set(8, i, bit(i))
    set(8, 7, bit(6))
    set(8, 8, bit(7))
    set(7, 8, bit(8))
    for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i))
    for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i))
    for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i))
    set(8, size - 8, true)
  }
  drawFormat(0)
  let i = 0
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5
    for (let vert = 0; vert < size; vert++)
      for (let j = 0; j < 2; j++) {
        const x = right - j
        const y = ((right + 1) & 2) === 0 ? size - 1 - vert : vert
        if (!fn[y][x] && i < stream.length * 8) {
          mods[y][x] = ((stream[i >>> 3] >>> (7 - (i & 7))) & 1) === 1
          i++
        }
      }
  }
  let best: boolean[][] = mods
  let bestScore = Infinity
  for (let m = 0; m < 8; m++) {
    drawFormat(m)
    const g = mods.map((row, y) => row.map((v, x) => (fn[y][x] ? v : v !== qrMask(m, x, y))))
    const score = qrPenalty(g)
    if (score < bestScore) {
      bestScore = score
      best = g
    }
  }
  return best
}
