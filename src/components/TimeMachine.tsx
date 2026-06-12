// Time Machine: search any word and see its history, revisit "on this day",
// and relive the biggest conversations ever. All scans run live, in-memory.
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { Analysis } from '../lib/analyze'
import type { Msg } from '../lib/parser'
import { fmt, fmtDate, fmtDuration, monthKey, fmtMonth, pct } from '../lib/format'
import { rise, Sparkline, RankBars } from './charts'
import { SectionHead, Bubble } from './Dashboard'

export function TimeMachine({ a, messages }: { a: Analysis; messages: Msg[] }) {
  return (
    <div>
      <WordTracker a={a} messages={messages} />
      <OnThisDay a={a} messages={messages} />
      <Marathons a={a} />
    </div>
  )
}

// ------------------------------------------------ word tracker
function WordTracker({ a, messages }: { a: Analysis; messages: Msg[] }) {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 220)
    return () => clearTimeout(t)
  }, [query])

  const result = useMemo(() => {
    if (debounced.length < 2) return null
    const q = debounced.toLowerCase()
    const perMonth = new Map<string, number>()
    const perPerson = new Map<string, number>()
    const hits: Msg[] = []
    let total = 0
    for (const m of messages) {
      if (m.kind !== 'text') continue
      if (m.text.toLowerCase().includes(q)) {
        total++
        perMonth.set(monthKey(m.ts), (perMonth.get(monthKey(m.ts)) ?? 0) + 1)
        perPerson.set(m.sender, (perPerson.get(m.sender) ?? 0) + 1)
        hits.push(m)
      }
    }
    // align month series to the chat's full month range
    const series = a.monthly.map((mo) => ({ label: fmtMonth(mo.key), v: perMonth.get(mo.key) ?? 0 }))
    const first = hits[0] ?? null
    const last = hits.length > 1 ? hits[hits.length - 1] : null
    const peak = [...perMonth.entries()].sort((x, y) => y[1] - x[1])[0] ?? null
    return { total, series, perPerson, first, last, peak, recent: hits.slice(-4).reverse() }
  }, [debounced, messages, a.monthly])

  const suggestions = useMemo(() => {
    const pool = new Set<string>()
    for (const p of a.people) for (const w of p.distinctive.slice(0, 2)) pool.add(w.word)
    return [...pool].slice(0, 6)
  }, [a])

  return (
    <div>
      <SectionHead
        title="The word tracker"
        sub="Type anything — a name, an inside joke, a place — and see its entire history in this chat."
      />
      <motion.div {...rise} className="panel panel-pad-lg">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="try “poker” … “miami” … “love” … a name …"
          aria-label="search the chat"
          style={{
            width: '100%', boxSizing: 'border-box', background: 'var(--bg2)',
            border: '1px solid var(--line2)', borderRadius: 14, color: 'var(--ink)',
            font: '500 17px var(--sans)', padding: '15px 19px', outline: 'none',
          }}
        />
        {!result && (
          <div style={{ marginTop: 12, display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="faint" style={{ fontSize: 12.5 }}>this chat’s greatest hits:</span>
            {suggestions.map((s) => (
              <button key={s} className="wchip" style={{ cursor: 'pointer', fontSize: 12.5, background: 'var(--panel2)', color: 'var(--ink)', border: '1px solid var(--line2)' }} onClick={() => setQuery(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        {result && result.total === 0 && (
          <div className="muted" style={{ marginTop: 18 }}>
            Not once. “{debounced}” has never been said here. You could be the first.
          </div>
        )}
        {result && result.total > 0 && (
          <div style={{ marginTop: 22 }}>
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'baseline' }}>
              <div>
                <span className="mono grad-text" style={{ fontSize: 44, fontWeight: 640, letterSpacing: '-0.04em' }}>{fmt(result.total)}</span>
                <span className="muted" style={{ marginLeft: 9 }}>mentions</span>
              </div>
              {result.first && <div className="muted" style={{ fontSize: 13.5 }}>first: <b>{fmtDate(result.first.ts)}</b> by {result.first.sender}</div>}
              {result.peak && <div className="muted" style={{ fontSize: 13.5 }}>peak: <b>{fmtMonth(result.peak[0])}</b> ({result.peak[1]}×)</div>}
            </div>
            <div style={{ marginTop: 14 }}>
              <Sparkline values={result.series.map((s) => s.v)} labels={result.series.map((s) => s.label)} color="var(--pink)" />
            </div>
            <div className="grid grid-2" style={{ marginTop: 18 }}>
              <div>
                <div className="label" style={{ marginBottom: 11 }}>who says it</div>
                <RankBars
                  rows={[...result.perPerson.entries()].sort((x, y) => y[1] - x[1]).slice(0, 5).map(([name, v]) => ({
                    label: name, value: v, color: a.byName.get(name)?.color,
                  }))}
                  format={(v) => fmt(v)}
                />
              </div>
              <div>
                <div className="label" style={{ marginBottom: 11 }}>latest sightings</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {result.recent.map((m, i) => (
                    <Bubble key={i} msg={m} color={a.byName.get(m.sender)?.color} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ------------------------------------------------ on this day
function OnThisDay({ a, messages }: { a: Analysis; messages: Msg[] }) {
  const today = new Date()
  const flashbacks = useMemo(() => {
    const out: { year: number; count: number; sample: Msg | null }[] = []
    const byYear = new Map<number, Msg[]>()
    for (const m of messages) {
      const d = new Date(m.ts)
      if (d.getMonth() === today.getMonth() && d.getDate() === today.getDate() && d.getFullYear() !== today.getFullYear()) {
        if (!byYear.has(d.getFullYear())) byYear.set(d.getFullYear(), [])
        byYear.get(d.getFullYear())!.push(m)
      }
    }
    for (const [year, msgs] of [...byYear.entries()].sort((x, y) => y[0] - x[0])) {
      const texts = msgs.filter((m) => m.kind === 'text' && m.text.length > 8 && m.text.length < 200)
      const sample = texts.length ? texts[Math.floor(texts.length / 2)] : null
      out.push({ year, count: msgs.length, sample })
    }
    return out
  }, [messages])

  if (flashbacks.length === 0) return null
  return (
    <div>
      <SectionHead
        title="On this day"
        sub={`${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}, in previous years of this chat.`}
      />
      <div className="grid grid-2">
        {flashbacks.map((f, i) => (
          <motion.div key={f.year} {...rise} transition={{ ...rise.transition, delay: (i % 2) * 0.07 }} className="panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="display" style={{ fontSize: 30 }}><em className="grad-text">{f.year}</em></span>
              <span className="mono muted" style={{ fontSize: 12.5 }}>{fmt(f.count)} messages that day</span>
            </div>
            {f.sample ? (
              <div style={{ marginTop: 12 }}>
                <Bubble msg={f.sample} color={a.byName.get(f.sample.sender)?.color} />
              </div>
            ) : (
              <div className="faint" style={{ marginTop: 12, fontSize: 13 }}>only photos and stickers survive from this day</div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ------------------------------------------------ marathons
function Marathons({ a }: { a: Analysis }) {
  if (a.topSessions.length === 0) return null
  return (
    <div>
      <SectionHead
        title="The marathons"
        sub={`The biggest single conversations ever. A “conversation” here means messages with no ${fmtDuration(a.sessionGapMs)}+ pause — tuned to this chat’s own rhythm.`}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {a.topSessions.map((s, i) => (
          <motion.div key={s.start} {...rise} transition={{ ...rise.transition, delay: i * 0.05 }} className="panel" style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div className="mono" style={{ fontSize: 34, fontWeight: 640, color: i === 0 ? 'var(--lime)' : 'var(--muted)', minWidth: 56 }}>
              #{i + 1}
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {fmt(s.count)} messages · {fmtDuration(s.durMs)} straight
              </div>
              <div className="muted" style={{ fontSize: 13.5, marginTop: 3 }}>
                {fmtDate(s.start)} · led by <b style={{ color: a.byName.get(s.lead)?.color }}>{s.lead}</b> ({pct(s.leadCount / s.count)} of it)
              </div>
              {s.firstMsgs.length > 0 && (
                <div style={{ marginTop: 11, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="label" style={{ fontSize: 10 }}>how it started</div>
                  {s.firstMsgs.map((m, j) => (
                    <Bubble key={j} msg={m} color={a.byName.get(m.sender)?.color} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
