const TEXT = 'ادارة شؤون الطلبة والامتحانات بالدقهلية'
const COLS = 8
const ROWS = 28
const DX = 260
const DY = 52
const ORIGIN_X = 12
const ORIGIN_Y = 36
const SEAT_NUMBER_ROWS = 3
/**
 * Diagonal tiled security mark as live SVG text. A CSS background of the same
 * tile gets rasterised at screen DPI when Chrome prints; `url(#pattern)` fills
 * also vanish under a `<base href>`, so the glyphs are stamped as `<text>`.
 */
export function PrintWatermark() {
  const marks = []
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const x = ORIGIN_X + col * DX
      const y = ORIGIN_Y + row * DY
      marks.push(
        <text
          key={`${row}-${col}`}
          x={x}
          y={y}
          transform={`rotate(-25 ${x} ${y})`}
          fontFamily="'Arial', sans-serif"
          fontSize="20"
          fontWeight="800"
          fill="#000"
          fillOpacity="0.20"
        >
          {TEXT}
        </text>,
      )
    }
  }

  return (
    <svg className="print-watermark" aria-hidden="true">
      {marks}
    </svg>
  )
}

/** One centred column of the seat number, spaced evenly down the sheet. */
export function SeatWatermark({ value }: { value: string }) {
  const seat = value.trim()
  if (seat === '') return null

  return (
    <div className="seat-watermark" aria-hidden="true">
      {Array.from({ length: SEAT_NUMBER_ROWS }, (_, index) => (
        <span key={index}>{seat}</span>
      ))}
    </div>
  )
}
