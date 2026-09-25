// Generates the PWA PNG icons (dumbbell on dark background) with zero dependencies.
// Usage: npm run icons
import fs from 'node:fs'
import zlib from 'node:zlib'

const BG = [9, 9, 11]
const FG = [16, 185, 129]

// Shapes in normalized 0..1 coordinates, kept inside the maskable safe zone.
const RECTS = [
  [0.25, 0.47, 0.75, 0.53],
  [0.3, 0.33, 0.37, 0.67],
  [0.63, 0.33, 0.7, 0.67],
  [0.22, 0.38, 0.3, 0.62],
  [0.7, 0.38, 0.78, 0.62],
]
const inside = (x, y) => RECTS.some(([x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1)

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}

function png(size) {
  const SS = 4 // supersampling for anti-aliasing
  const raw = Buffer.alloc((size * 3 + 1) * size)
  for (let y = 0; y < size; y++) {
    const row = y * (size * 3 + 1)
    for (let x = 0; x < size; x++) {
      let hits = 0
      for (let sy = 0; sy < SS; sy++)
        for (let sx = 0; sx < SS; sx++)
          if (inside((x + (sx + 0.5) / SS) / size, (y + (sy + 0.5) / SS) / size)) hits++
      const t = hits / (SS * SS)
      for (let c = 0; c < 3; c++) raw[row + 1 + x * 3 + c] = Math.round(BG[c] + (FG[c] - BG[c]) * t)
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

for (const [name, size] of [['pwa-192.png', 192], ['pwa-512.png', 512], ['apple-touch-icon.png', 180]]) {
  fs.writeFileSync(new URL(`../public/${name}`, import.meta.url), png(size))
  console.log(`wrote public/${name}`)
}
