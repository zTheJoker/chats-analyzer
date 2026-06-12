export const fmt = (n: number): string => Math.round(n).toLocaleString('en-US')

export function fmtCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1) + 'M'
  if (n >= 10_000) return Math.round(n / 1000) + 'k'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(Math.round(n))
}

export function fmtDuration(ms: number): string {
  const s = ms / 1000
  if (s < 60) return `${Math.round(s)}s`
  const m = s / 60
  if (m < 60) return `${Math.round(m)}m`
  const h = m / 60
  if (h < 24) return h < 10 ? `${h.toFixed(1)}h` : `${Math.round(h)}h`
  const d = h / 24
  return d < 10 ? `${d.toFixed(1)} days` : `${Math.round(d)} days`
}

export function fmtDurationLong(ms: number): string {
  const s = ms / 1000
  if (s < 60) return `${Math.round(s)} seconds`
  const m = s / 60
  if (m < 60) return `${Math.round(m)} minute${Math.round(m) === 1 ? '' : 's'}`
  const h = m / 60
  if (h < 48) return `${Math.round(h)} hour${Math.round(h) === 1 ? '' : 's'}`
  const d = h / 24
  return `${Math.round(d)} days`
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
export const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const DOW_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function fmtDate(ts: number): string {
  const d = new Date(ts)
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}
export function fmtDateFull(ts: number): string {
  const d = new Date(ts)
  return `${DOW_FULL[d.getDay()]}, ${MONTHS_FULL[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}
export function fmtMonth(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return `${MONTHS[m - 1]} ${y}`
}
export function fmtMonthFull(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return `${MONTHS_FULL[m - 1]} ${y}`
}
export function fmtTime(ts: number): string {
  const d = new Date(ts)
  let h = d.getHours() % 12
  if (h === 0) h = 12
  return `${h}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() < 12 ? 'AM' : 'PM'}`
}
export function fmtHour(h: number): string {
  if (h === 0) return '12 AM'
  if (h === 12) return '12 PM'
  return h < 12 ? `${h} AM` : `${h - 12} PM`
}
// parse a YYYY-MM-DD key as LOCAL time — `new Date('2024-08-10')` would be
// UTC midnight, which renders as the previous day anywhere west of Greenwich
export function tsOfKey(key: string): number {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).getTime()
}

export function dateKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export function monthKey(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
export function pct(x: number, digits = 0): string {
  return (x * 100).toFixed(digits) + '%'
}

export const PALETTE = ['#ff5c39', '#a06bff', '#54e0ff', '#d8ff4f', '#ff7ad9', '#ffc24d', '#6dffb8', '#ff5c7a', '#8fa1ff', '#ffa07a']
