import React, { useMemo } from 'react'

/**
 * A lightweight, self-contained QR Code generator in pure TypeScript/SVG.
 * Implements standard QR Code (Version 1-4 with Byte mode & Byte packing + Reed-Solomon EC)
 * with zero external dependencies, no remote images and instant rendering.
 */

// Simple Reed-Solomon GF(256) log and antilog tables
const EXP_TABLE = new Uint8Array(512)
const LOG_TABLE = new Uint8Array(256)

;(() => {
  let x = 1
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x
    EXP_TABLE[i + 255] = x
    LOG_TABLE[x] = i
    x = (x << 1) ^ (x & 0x80 ? 0x11d : 0)
  }
  LOG_TABLE[0] = 0
})()

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0
  return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]]
}

function polyMul(p1: number[], p2: number[]): number[] {
  const result = new Array(p1.length + p2.length - 1).fill(0)
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      result[i + j] ^= gfMul(p1[i], p2[j])
    }
  }
  return result
}

function getGeneratorPoly(degree: number): number[] {
  let poly = [1]
  for (let i = 0; i < degree; i++) {
    poly = polyMul(poly, [1, EXP_TABLE[i]])
  }
  return poly
}

function calcErrorCorrection(data: number[], ecCount: number): number[] {
  const gen = getGeneratorPoly(ecCount)
  const result = new Array(ecCount).fill(0)

  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ result[0]
    result.shift()
    result.push(0)
    if (factor !== 0) {
      for (let j = 0; j < ecCount; j++) {
        result[j] ^= gfMul(gen[j + 1], factor)
      }
    }
  }
  return result
}

// QR Code Version specs (Version 1, 2, 3, 4 - Low / Medium EC)
interface QRVersionSpec {
  version: number
  size: number
  dataCapacityBytes: number
  ecBytes: number
}

const QR_SPECS: QRVersionSpec[] = [
  { version: 1, size: 21, dataCapacityBytes: 19, ecBytes: 7 }, // L
  { version: 2, size: 25, dataCapacityBytes: 34, ecBytes: 10 },
  { version: 3, size: 29, dataCapacityBytes: 55, ecBytes: 15 },
  { version: 4, size: 33, dataCapacityBytes: 80, ecBytes: 20 },
  { version: 5, size: 37, dataCapacityBytes: 108, ecBytes: 26 },
]

/**
 * Encodes an ASCII/UTF-8 string into a binary module grid (boolean[][])
 */
function generateQRCodeMatrix(text: string): boolean[][] {
  const textBytes = new TextEncoder().encode(text)
  const len = textBytes.length

  // Find smallest matching version
  // Header: Mode (4 bits: 0100 for Byte mode) + Count (8 bits for versions 1-9) => 12 bits = 1.5 bytes
  const neededDataBytes = len + 2
  const spec =
    QR_SPECS.find((s) => s.dataCapacityBytes >= neededDataBytes) || QR_SPECS[QR_SPECS.length - 1]

  const size = spec.size
  const grid: (boolean | null)[][] = Array.from({ length: size }, () => new Array(size).fill(null))

  // 1. Finder patterns (top-left, top-right, bottom-left)
  const placeFinder = (r: number, c: number) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const row = r + dr
        const col = c + dc
        if (row < 0 || row >= size || col < 0 || col >= size) continue
        const isBorder = dr === -1 || dr === 7 || dc === -1 || dc === 7
        const isOuter = dr === 0 || dr === 6 || dc === 0 || dc === 6
        const isCenter = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4
        if (isBorder) {
          grid[row][col] = false
        } else if (isOuter || isCenter) {
          grid[row][col] = true
        } else {
          grid[row][col] = false
        }
      }
    }
  }

  placeFinder(0, 0)
  placeFinder(0, size - 7)
  placeFinder(size - 7, 0)

  // 2. Alignment pattern (for version >= 2)
  if (spec.version >= 2) {
    const alignPos = size - 7
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const row = alignPos + dr
        const col = alignPos + dc
        if (grid[row][col] === null) {
          const isOuter = Math.abs(dr) === 2 || Math.abs(dc) === 2
          const isCenter = dr === 0 && dc === 0
          grid[row][col] = isOuter || isCenter
        }
      }
    }
  }

  // 3. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (grid[6][i] === null) grid[6][i] = i % 2 === 0
    if (grid[i][6] === null) grid[i][6] = i % 2 === 0
  }

  // Dark module
  grid[4 * spec.version + 9][8] = true

  // 4. Reserve Format info areas
  for (let i = 0; i < 9; i++) {
    if (grid[8][i] === null) grid[8][i] = false
    if (grid[i][8] === null) grid[i][8] = false
  }
  for (let i = 0; i < 8; i++) {
    if (grid[8][size - 1 - i] === null) grid[8][size - 1 - i] = false
    if (grid[size - 1 - i][8] === null) grid[size - 1 - i][8] = false
  }

  // 5. Build bit stream
  // Mode: 0100 (Byte)
  // Character count: 8 bits
  let bitBuffer = ''
  bitBuffer += '0100'
  bitBuffer += len.toString(2).padStart(8, '0')
  for (let i = 0; i < len; i++) {
    bitBuffer += textBytes[i].toString(2).padStart(8, '0')
  }

  // Terminator (up to 4 zeroes)
  const maxBits = spec.dataCapacityBytes * 8
  const termLen = Math.min(4, maxBits - bitBuffer.length)
  bitBuffer += '0'.repeat(termLen)

  // Byte align
  while (bitBuffer.length % 8 !== 0) {
    bitBuffer += '0'
  }

  // Pad bytes: 0xEC, 0x11
  const padPatterns = ['11101100', '00010001']
  let padIdx = 0
  while (bitBuffer.length < maxBits) {
    bitBuffer += padPatterns[padIdx % 2]
    padIdx++
  }

  const dataCodewords: number[] = []
  for (let i = 0; i < bitBuffer.length; i += 8) {
    dataCodewords.push(parseInt(bitBuffer.substring(i, i + 8), 2))
  }

  // Calculate EC codewords
  const ecCodewords = calcErrorCorrection(dataCodewords, spec.ecBytes)
  const finalCodewords = [...dataCodewords, ...ecCodewords]

  // Flatten to bits
  let finalBits = ''
  for (const cw of finalCodewords) {
    finalBits += cw.toString(2).padStart(8, '0')
  }

  // 6. Place data bits in matrix (right to left, zig-zag)
  let bitIdx = 0
  let upwards = true
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right-- // skip timing pattern column
    const cols = [right, right - 1]
    const rowRange = upwards
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i)

    for (const r of rowRange) {
      for (const c of cols) {
        if (grid[r][c] === null) {
          let bit = false
          if (bitIdx < finalBits.length) {
            bit = finalBits[bitIdx] === '1'
            bitIdx++
          }

          // Apply Mask 0: (row + col) % 2 === 0
          const mask = (r + c) % 2 === 0
          grid[r][c] = mask ? !bit : bit
        }
      }
    }
    upwards = !upwards
  }

  // 7. Write Format Information (Mask 0 + Error Level L = 0b111011111000100)
  const formatBits = '111011111000100'
  // Along top-left
  const formatCoordsTL = [
    [8, 0],
    [8, 1],
    [8, 2],
    [8, 3],
    [8, 4],
    [8, 5],
    [8, 7],
    [8, 8],
    [7, 8],
    [5, 8],
    [4, 8],
    [3, 8],
    [2, 8],
    [1, 8],
    [0, 8],
  ]
  formatCoordsTL.forEach(([r, c], i) => {
    grid[r][c] = formatBits[i] === '1'
  })

  // Along corners
  const formatCoordsCorners = [
    [size - 1, 8],
    [size - 2, 8],
    [size - 3, 8],
    [size - 4, 8],
    [size - 5, 8],
    [size - 6, 8],
    [size - 7, 8],
    [8, size - 8],
    [8, size - 7],
    [8, size - 6],
    [8, size - 5],
    [8, size - 4],
    [8, size - 3],
    [8, size - 2],
    [8, size - 1],
  ]
  formatCoordsCorners.forEach(([r, c], i) => {
    grid[r][c] = formatBits[i] === '1'
  })

  return grid.map((row) => row.map((cell) => cell ?? false))
}

export interface CompactQrCodeProps {
  url: string
  size?: number
  className?: string
  fgColor?: string
  bgColor?: string
}

export const CompactQrCode: React.FC<CompactQrCodeProps> = ({
  url,
  size = 140,
  className = '',
  fgColor = '#0F172A',
  bgColor = '#FFFFFF',
}) => {
  const matrix = useMemo(() => {
    try {
      return generateQRCodeMatrix(url)
    } catch (e) {
      console.warn('QR generation fallback', e)
      return null
    }
  }, [url])

  if (!matrix) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center bg-slate-100 rounded-xl text-[10px] text-slate-400"
      >
        QR
      </div>
    )
  }

  const modCount = matrix.length
  // Add a quiet border of 2 modules
  const margin = 2
  const totalUnits = modCount + margin * 2

  return (
    <svg
      viewBox={`0 0 ${totalUnits} ${totalUnits}`}
      width={size}
      height={size}
      className={`rounded-xl shadow-xs ${className}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`QR Code para ${url}`}
    >
      <rect x="0" y="0" width={totalUnits} height={totalUnits} fill={bgColor} />
      {matrix.map((row, r) =>
        row.map((isDark, c) => {
          if (!isDark) return null
          return (
            <rect
              key={`${r}-${c}`}
              x={c + margin}
              y={r + margin}
              width="1"
              height="1"
              fill={fgColor}
            />
          )
        }),
      )}
    </svg>
  )
}

export default CompactQrCode
