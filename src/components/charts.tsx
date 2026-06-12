// Hand-rolled SVG charts + small shared atoms. No chart library — every pixel intentional.
import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import type { Person, MonthRow } from '../lib/analyze'
import { fmtCompact, fmtMonth, fmtHour, DOW } from '../lib/format'

// ---------- count-up number
export function CountUp({ value, duration = 1.4, format }: { value: number; duration?: number; format?: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (!inView) return
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / (duration * 1000))
      const eased = 1 - Math.pow(1 - p, 3.2)
      setShown(value * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
      else setShown(value)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, duration])
  const f = format ?? ((n: number) => Math.round(n).toLocaleString('en-US'))
  return <span ref={ref}>{f(shown)}</span>
}

export const rise = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.65, ease: [0.2, 0.8, 0.2, 1] as const },
}

export function Avatar({ name, color, size = 44 }: { name: string; color: string; size?: number }) {
  return (
    <div
      className="avatar"
      style={{
        width: size, height: size, fontSize: size * 0.42,
        background: `linear-gradient(140deg, ${color}, ${color}88)`,
        boxShadow: `0 6px 18px ${color}33`,
      }}
    >
      {name.trim().charAt(0).toUpperCase()}
    </div>
  )
}

// ---------- donut: share of messages
export function Donut({ people, size = 230 }: { people: Person[]; size?: number }) {
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const total = people.reduce((s, p) => s + p.msgCount, 0)
  const R = size / 2 - 16
  const C = 2 * Math.PI * R
  let acc = 0
  return (
    <svg ref={ref} width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="share of messages">
      {people.map((p, i) => {
        const frac = p.msgCount / total
        const offset = acc
        acc += frac
        return (
          <circle
            key={p.name}
            cx={size / 2} cy={size / 2} r={R}
            fill="none"
            stroke={p.color}
            strokeWidth={20}
            strokeLinecap="butt"
            strokeDasharray={`${Math.max(0, frac * C - 3)} ${C}`}
            strokeDashoffset={-offset * C}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{
              opacity: inView ? 1 : 0,
              transition: `opacity .5s ease ${i * 0.12}s, stroke-dasharray 1s cubic-bezier(.2,.8,.2,1) ${i * 0.12}s`,
            }}
          />
        )
      })}
      <text x="50%" y="47%" textAnchor="middle" fill="var(--ink)" style={{ font: `640 ${size * 0.13}px var(--mono)`, letterSpacing: '-0.03em' }}>
        {fmtCompact(total)}
      </text>
      <text x="50%" y="57%" textAnchor="middle" fill="var(--muted)" style={{ font: `500 ${size * 0.05}px var(--sans)` }}>
        messages
      </text>
    </svg>
  )
}

// ---------- 7×24 heatmap
export function Heatmap({ grid }: { grid: number[][] }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const max = Math.max(1, ...grid.flat())
  const W = 24
  const cell = 100 / W
  return (
    <div ref={ref}>
      <svg viewBox="0 0 108 40" width="100%" role="img" aria-label="activity by hour and weekday">
        {grid.map((row, d) =>
          row.map((v, h) => {
            // sqrt scale: one monster peak shouldn't make every other cell black
            const t = Math.sqrt(v / max)
            const color =
              v === 0 ? 'var(--bg2)'
                : t < 0.3 ? '#352647'
                : t < 0.45 ? '#503767'
                : t < 0.6 ? '#7a4d8f'
                : t < 0.75 ? '#b0549b'
                : t < 0.9 ? '#e05a78'
                : '#ff5c39'
            return (
              <rect
                key={`${d}-${h}`}
                x={8 + h * cell * 0.97}
                y={d * 5.2 + 1}
                width={cell * 0.97 - 0.55}
                height={4.4}
                rx={0.9}
                fill={color}
                className="hm-cell"
                style={{
                  opacity: inView ? (t === 0 ? 0.5 : 0.92) : 0,
                  transitionDelay: `${(h * 7 + d) * 9}ms`,
                }}
              >
                <title>{`${DOW[d]} ${fmtHour(h)} — ${v.toLocaleString()} messages`}</title>
              </rect>
            )
          }),
        )}
        {DOW.map((d, i) => (
          <text key={d} x={0} y={i * 5.2 + 4.4} fill="var(--faint)" style={{ font: '500 2.8px var(--sans)' }}>
            {d}
          </text>
        ))}
        {[0, 6, 12, 18, 23].map((h) => (
          <text key={h} x={8 + h * cell * 0.97 + 1} y={39.4} fill="var(--faint)" style={{ font: '500 2.6px var(--sans)' }}>
            {h === 0 ? '12a' : h === 12 ? '12p' : h < 12 ? `${h}a` : `${h - 12}p`}
          </text>
        ))}
      </svg>
    </div>
  )
}

// ---------- monthly stacked area
export function MonthlyArea({ monthly, people }: { monthly: MonthRow[]; people: Person[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  if (monthly.length < 2) return null
  const W = 600
  const H = 190
  const padL = 4
  const padB = 22
  const top = people.slice(0, 6)
  const maxTotal = Math.max(...monthly.map((m) => m.total))
  const x = (i: number) => padL + (i / (monthly.length - 1)) * (W - padL * 2)
  const y = (v: number) => H - padB - (v / maxTotal) * (H - padB - 10)

  // stacked series
  const layers = top.map((p, pi) => {
    const lower = (i: number) => top.slice(0, pi).reduce((s, q) => s + (monthly[i].perPerson[q.name] ?? 0), 0)
    const upper = (i: number) => lower(i) + (monthly[i].perPerson[p.name] ?? 0)
    let dTop = `M ${x(0)} ${y(upper(0))}`
    for (let i = 1; i < monthly.length; i++) dTop += ` L ${x(i)} ${y(upper(i))}`
    let dBot = ''
    for (let i = monthly.length - 1; i >= 0; i--) dBot += ` L ${x(i)} ${y(lower(i))}`
    return { p, d: dTop + dBot + ' Z' }
  })

  const labelEvery = Math.ceil(monthly.length / 7)
  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="messages per month">
        {layers.map(({ p, d }, i) => (
          <path
            key={p.name}
            d={d}
            fill={p.color}
            opacity={inView ? 0.78 : 0}
            style={{ transition: `opacity .8s ease ${i * 0.1}s` }}
          >
            <title>{p.name}</title>
          </path>
        ))}
        {monthly.map((m, i) =>
          i % labelEvery === 0 ? (
            <text key={m.key} x={x(i)} y={H - 6} fill="var(--faint)" style={{ font: '500 10px var(--sans)' }}>
              {fmtMonth(m.key)}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  )
}

// ---------- horizontal ranked bars
export function RankBars({
  rows, format, maxOverride,
}: {
  rows: { label: string; value: number; color?: string; sub?: string }[]
  format?: (v: number) => string
  maxOverride?: number
}) {
  const max = maxOverride ?? Math.max(1, ...rows.map((r) => r.value))
  const f = format ?? ((v: number) => fmtCompact(v))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      {rows.map((r, i) => (
        <div key={r.label + i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 5 }}>
            <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              {r.color && <span className="pdot" style={{ background: r.color }} />}
              {r.label}
              {r.sub && <span className="faint" style={{ fontWeight: 400, fontSize: 12 }}>{r.sub}</span>}
            </span>
            <span className="mono" style={{ color: 'var(--muted)' }}>{f(r.value)}</span>
          </div>
          <div className="meter">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${(r.value / max) * 100}%` }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.9, delay: i * 0.07, ease: [0.2, 0.8, 0.2, 1] }}
              style={r.color ? { background: r.color } : undefined}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------- 24h histogram
export function HourBars({ hist, color = 'url(#hourgrad)' }: { hist: number[]; color?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-30px' })
  const max = Math.max(1, ...hist)
  const W = 600
  const H = 130
  const bw = W / 24
  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="messages by hour of day">
        <defs>
          <linearGradient id="hourgrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="var(--violet)" />
            <stop offset="100%" stopColor="var(--coral)" />
          </linearGradient>
        </defs>
        {hist.map((v, h) => {
          const bh = (v / max) * (H - 30)
          return (
            <g key={h}>
              <rect
                x={h * bw + 2.5}
                y={inView ? H - 18 - bh : H - 18}
                width={bw - 5}
                height={inView ? bh : 0}
                rx={4}
                fill={color}
                style={{ transition: `all .7s cubic-bezier(.2,.8,.2,1) ${h * 28}ms` }}
              >
                <title>{`${fmtHour(h)} — ${v.toLocaleString()}`}</title>
              </rect>
              {h % 6 === 0 && (
                <text x={h * bw + 2.5} y={H - 4} fill="var(--faint)" style={{ font: '500 10px var(--sans)' }}>
                  {fmtHour(h)}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export function DowBars({ hist }: { hist: number[] }) {
  const max = Math.max(1, ...hist)
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 120 }}>
      {hist.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: `${(v / max) * 82}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ width: '100%', borderRadius: 8, background: 'var(--grad)', opacity: 0.55 + 0.45 * (v / max), minHeight: 2 }}
            title={`${DOW[i]}: ${v.toLocaleString()}`}
          />
          <span className="faint" style={{ fontSize: 11 }}>{DOW[i]}</span>
        </div>
      ))}
    </div>
  )
}

// ---------- reply-time distribution
export function BucketBars({ buckets }: { buckets: { label: string; count: number }[] }) {
  const max = Math.max(1, ...buckets.map((b) => b.count))
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 150 }}>
      {buckets.map((b, i) => (
        <div key={b.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, height: '100%', justifyContent: 'flex-end' }}>
          <span className="mono faint" style={{ fontSize: 11 }}>{fmtCompact(b.count)}</span>
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: `${(b.count / max) * 72}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.07, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ width: '100%', borderRadius: 9, background: i < 2 ? 'var(--lime)' : i < 4 ? 'var(--cyan)' : 'var(--violet)', opacity: 0.85, minHeight: 2 }}
          />
          <span className="faint" style={{ fontSize: 10.5, whiteSpace: 'nowrap' }}>{b.label}</span>
        </div>
      ))}
    </div>
  )
}

// ---------- who-replies-to-whom matrix
export function Matrix({ names, counts, colors }: { names: string[]; counts: number[][]; colors: Map<string, string> }) {
  const max = Math.max(1, ...counts.flat())
  const short = (n: string) => (n.length > 8 ? n.slice(0, 7) + '…' : n)
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: 4, margin: '0 auto' }}>
        <thead>
          <tr>
            <th style={{ font: '500 11px var(--sans)', color: 'var(--faint)', textAlign: 'right', padding: '0 6px' }}>replies ↓ to →</th>
            {names.map((n) => (
              <th key={n} style={{ font: '600 12px var(--sans)', color: colors.get(n), padding: '0 4px', maxWidth: 64, overflow: 'hidden' }}>{short(n)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {names.map((from, i) => (
            <tr key={from}>
              <td style={{ font: '600 12px var(--sans)', color: colors.get(from), textAlign: 'right', padding: '0 6px' }}>{short(from)}</td>
              {names.map((to, j) => {
                const v = counts[i][j]
                const t = v / max
                return (
                  <td key={to} title={`${from} → ${to}: ${v.toLocaleString()} replies`}
                    style={{
                      width: 44, height: 36, borderRadius: 9, textAlign: 'center',
                      font: '600 11px var(--mono)',
                      background: i === j ? 'transparent' : `color-mix(in srgb, var(--violet) ${Math.round(t * 75)}%, var(--bg2))`,
                      color: t > 0.5 ? '#fff' : 'var(--muted)',
                      border: i === j ? '1px dashed var(--line)' : '1px solid var(--line)',
                    }}>
                    {i === j ? '—' : fmtCompact(v)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---------- GitHub-style contribution calendar
const HEAT_COLORS = ['var(--bg2)', '#3b2a4f', '#7a4d8f', '#c75a93', '#ff5c39']

export function Calendar({ daily, start, end }: { daily: { key: string; count: number }[]; start: number; end: number }) {
  const byKey = new Map(daily.map((d) => [d.key, d.count]))
  const counts = daily.map((d) => d.count).sort((a, b) => a - b)
  const q = (p: number) => counts[Math.min(counts.length - 1, Math.floor(counts.length * p))] || 1
  const t1 = q(0.35), t2 = q(0.6), t3 = q(0.85)
  const level = (c: number) => (c === 0 ? 0 : c <= t1 ? 1 : c <= t2 ? 2 : c <= t3 ? 3 : 4)

  const s = new Date(start)
  const first = new Date(s.getFullYear(), s.getMonth(), s.getDate() - s.getDay()) // back to Sunday
  const endD = new Date(end)
  const weeks: { key: string; count: number; ts: number }[][] = []
  const cur = new Date(first)
  while (cur.getTime() <= endD.getTime()) {
    const week: { key: string; count: number; ts: number }[] = []
    for (let d = 0; d < 7; d++) {
      const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`
      week.push({ key, count: byKey.get(key) ?? 0, ts: cur.getTime() })
      cur.setDate(cur.getDate() + 1)
    }
    weeks.push(week)
  }
  const CW = 11
  const width = weeks.length * CW + 4
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return (
    <div style={{ overflowX: 'auto', direction: 'rtl' }}>
      <svg width={width} height={7 * CW + 18} style={{ direction: 'ltr', display: 'block' }} role="img" aria-label="daily activity calendar">
        {weeks.map((week, wi) => {
          const firstDay = new Date(week[0].ts)
          const showMonth = firstDay.getDate() <= 7
          return (
            <g key={wi}>
              {showMonth && (
                <text x={wi * CW} y={9} fill="var(--faint)" style={{ font: '500 8.5px var(--sans)' }}>
                  {firstDay.getDate() <= 7 && firstDay.getMonth() === 0 ? String(firstDay.getFullYear()) : MONTHS[firstDay.getMonth()]}
                </text>
              )}
              {week.map((day, di) =>
                day.ts >= start - 86400e3 && day.ts <= end ? (
                  <rect
                    key={day.key}
                    x={wi * CW}
                    y={14 + di * CW}
                    width={CW - 2.5}
                    height={CW - 2.5}
                    rx={2.4}
                    fill={HEAT_COLORS[level(day.count)]}
                    opacity={day.count === 0 ? 0.55 : 1}
                  >
                    <title>{`${day.key} — ${day.count.toLocaleString()} messages`}</title>
                  </rect>
                ) : null,
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ---------- sparkline (area) for arbitrary series
export function Sparkline({ values, labels, height = 110, color = 'var(--cyan)' }: {
  values: number[]; labels?: string[]; height?: number; color?: string
}) {
  if (values.length === 0) return null
  const W = 600
  const H = height
  const max = Math.max(1, ...values)
  const x = (i: number) => (values.length === 1 ? W / 2 : (i / (values.length - 1)) * (W - 8) + 4)
  const y = (v: number) => H - 20 - (v / max) * (H - 32)
  let d = `M ${x(0)} ${y(values[0])}`
  for (let i = 1; i < values.length; i++) d += ` L ${x(i)} ${y(values[i])}`
  const area = d + ` L ${x(values.length - 1)} ${H - 20} L ${x(0)} ${H - 20} Z`
  const every = labels ? Math.ceil(labels.length / 6) : 1
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      <path d={area} fill={color} opacity={0.14} />
      <path d={d} fill="none" stroke={color} strokeWidth={2.4} strokeLinejoin="round" />
      {labels?.map((l, i) =>
        i % every === 0 ? (
          <text key={i} x={x(i)} y={H - 5} fill="var(--faint)" textAnchor="middle" style={{ font: '500 9.5px var(--sans)' }}>{l}</text>
        ) : null,
      )}
    </svg>
  )
}

// ---------- monthly vibe line (diverging around zero)
export function VibeLine({ monthly }: { monthly: MonthRow[] }) {
  const pts = monthly.filter((m) => m.total > 20)
  if (pts.length < 3) return null
  const W = 600
  const H = 150
  const maxAbs = Math.max(0.2, ...pts.map((m) => Math.abs(m.vibe)))
  const x = (i: number) => (i / (pts.length - 1)) * (W - 10) + 5
  const y = (v: number) => H / 2 - 12 - (v / maxAbs) * (H / 2 - 30)
  let d = `M ${x(0)} ${y(pts[0].vibe)}`
  for (let i = 1; i < pts.length; i++) d += ` L ${x(i)} ${y(pts[i].vibe)}`
  const every = Math.ceil(pts.length / 7)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="vibe per month">
      <defs>
        <linearGradient id="vibegrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--lime)" />
          <stop offset="50%" stopColor="var(--cyan)" />
          <stop offset="100%" stopColor="var(--coral)" />
        </linearGradient>
      </defs>
      <line x1={0} x2={W} y1={y(0)} y2={y(0)} stroke="var(--line2)" strokeDasharray="3 5" />
      <text x={W - 4} y={y(0) - 6} fill="var(--faint)" textAnchor="end" style={{ font: '500 9.5px var(--sans)' }}>this chat’s usual</text>
      <path d={d} fill="none" stroke="url(#vibegrad)" strokeWidth={2.6} strokeLinejoin="round" />
      {pts.map((m, i) => (
        <circle key={m.key} cx={x(i)} cy={y(m.vibe)} r={2.6} fill={m.vibe >= 0 ? 'var(--lime)' : 'var(--coral)'}>
          <title>{`${fmtMonth(m.key)}: ${m.vibe >= 0 ? '+' : ''}${m.vibe.toFixed(2)}`}</title>
        </circle>
      ))}
      {pts.map((m, i) =>
        i % every === 0 ? (
          <text key={m.key + 'l'} x={x(i)} y={H - 4} fill="var(--faint)" textAnchor="middle" style={{ font: '500 9.5px var(--sans)' }}>{fmtMonth(m.key)}</text>
        ) : null,
      )}
    </svg>
  )
}

// ---------- big ring score
export function ScoreRing({ score, size = 200 }: { score: number; size?: number }) {
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const R = size / 2 - 14
  const C = 2 * Math.PI * R
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg ref={ref} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="ringgrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--coral)" />
            <stop offset="55%" stopColor="var(--pink)" />
            <stop offset="100%" stopColor="var(--violet)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="var(--line)" strokeWidth={13} />
        <circle
          cx={size / 2} cy={size / 2} r={R} fill="none"
          stroke="url(#ringgrad)" strokeWidth={13} strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={inView ? C * (1 - score / 100) : C}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1.6s cubic-bezier(.2,.8,.2,1) .2s' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <span className="mono" style={{ fontSize: size * 0.2, fontWeight: 640, letterSpacing: '-0.04em', lineHeight: 1 }}>
          <CountUp value={score} duration={1.6} format={(n) => `${Math.round(n)}%`} />
        </span>
        <span className="muted" style={{ fontSize: size * 0.055 }}>compatibility</span>
      </div>
    </div>
  )
}
