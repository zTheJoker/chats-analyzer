// The post-upload reveal: a full-screen, auto-advancing sequence of the
// chat's biggest numbers before landing on the dashboard.
import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Analysis } from '../lib/analyze'
import { fmt, fmtDate, fmtDuration, fmtDateFull, pct, tsOfKey } from '../lib/format'
import { CountUp } from './charts'

interface Slide {
  kicker: string
  big: React.ReactNode
  sub?: string
}

const HP1_WORDS = 76944 // Harry Potter #1 word count — the canonical yardstick

export function Reveal({ a, onDone }: { a: Analysis; onDone: () => void }) {
  const slides = useMemo<Slide[]>(() => {
    const s: Slide[] = []
    s.push({
      kicker: 'we read every message in',
      big: <span className="display" style={{ fontSize: 'clamp(40px,7.5vw,84px)' }}><em>{a.chatName}</em></span>,
      sub: 'well — your browser did. nothing was uploaded.',
    })
    s.push({
      kicker: 'and found',
      big: <BigNum value={a.totals.messages} unit="messages" />,
      sub: `across ${fmt(a.range.days)} days — that's ${(a.totals.messages / Math.max(1, a.range.days)).toFixed(1)} per day, every day`,
    })
    if (a.totals.words > 20000) {
      const hp = a.totals.words / HP1_WORDS
      s.push({
        kicker: 'you wrote',
        big: <BigNum value={a.totals.words} unit="words" />,
        sub: hp >= 0.8
          ? `that's ${hp.toFixed(1)}× the first Harry Potter book. unedited. unpublishable.`
          : `a respectable ${Math.round((a.totals.words / HP1_WORDS) * 100)}% of a Harry Potter book`,
      })
    }
    s.push({
      kicker: 'your busiest day was',
      big: <span className="display" style={{ fontSize: 'clamp(34px,6vw,66px)' }}><em>{fmtDateFull(tsOfKey(a.busiest.dayKey))}</em></span>,
      sub: `${fmt(a.busiest.dayCount)} messages in one day. something happened. you know what it was.`,
    })
    const starter = [...a.people].sort((x, y) => y.starts - x.starts)[0]
    if (starter && a.totals.sessions > 20) {
      s.push({
        kicker: 'conversations get started by',
        big: <Name name={starter.name} color={starter.color} />,
        sub: `${pct(starter.starts / Math.max(1, a.totals.sessions))} of the time. without them: silence.`,
      })
    }
    const sniper = a.awards.find((w) => w.id === 'sniper')
    if (sniper) {
      const p = a.byName.get(sniper.person)!
      s.push({
        kicker: 'fastest fingers in the chat',
        big: <Name name={p.name} color={p.color} />,
        sub: `median reply: ${fmtDuration(p.replyMedianMs!)} — ${sniper.flavor.toLowerCase()}`,
      })
    }
    if (a.totals.laughs > 50) {
      const comedian = a.awards.find((w) => w.id === 'comedian')
      s.push({
        kicker: 'the laugh count stands at',
        big: <BigNum value={a.totals.laughs} unit="laughs" />,
        sub: comedian ? `${comedian.person} caused a disproportionate number of them` : undefined,
      })
    }
    s.push({
      kicker: 'we have so much more',
      big: <span className="display" style={{ fontSize: 'clamp(40px,7vw,80px)' }}>Let’s open the <em>receipts.</em></span>,
      sub: 'tap anywhere',
    })
    return s
  }, [a])

  const [idx, setIdx] = useState(0)
  const last = idx === slides.length - 1

  useEffect(() => {
    if (last) return
    const t = setTimeout(() => setIdx((i) => i + 1), 3600)
    return () => clearTimeout(t)
  }, [idx, last])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDone()
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
        setIdx((i) => (i >= slides.length - 1 ? (onDone(), i) : i + 1))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [slides.length, onDone])

  return (
    <div
      className="reveal-stage"
      onClick={() => (last ? onDone() : setIdx((i) => i + 1))}
      role="button"
      aria-label="reveal — click to advance"
    >
      <div className="ambient" aria-hidden>
        <div className="orb orb-a" /><div className="orb orb-b" /><div className="orb orb-c" />
      </div>
      <div className="reveal-progress" style={{ width: `${((idx + 1) / slides.length) * 100}%` }} />
      <button
        className="btn btn-sm btn-ghost"
        style={{ position: 'fixed', top: 18, right: 18, zIndex: 102, color: 'var(--muted)' }}
        onClick={(e) => { e.stopPropagation(); onDone() }}
      >
        skip →
      </button>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 30, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -26, scale: 0.99 }}
          transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ maxWidth: 900, position: 'relative', zIndex: 2 }}
        >
          <div className="label" style={{ marginBottom: 22 }}>{slides[idx].kicker}</div>
          <div>{slides[idx].big}</div>
          {slides[idx].sub && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="muted"
              style={{ marginTop: 24, fontSize: 'clamp(14px, 2vw, 17px)' }}
            >
              {slides[idx].sub}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function BigNum({ value, unit }: { value: number; unit: string }) {
  return (
    <div>
      <span className="mono grad-text" style={{ fontSize: 'clamp(56px, 11vw, 130px)', fontWeight: 640, letterSpacing: '-0.05em', fontStyle: 'normal' }}>
        <CountUp value={value} duration={1.7} />
      </span>
      <div className="display" style={{ fontSize: 'clamp(22px, 3.4vw, 34px)', marginTop: 6 }}><em>{unit}</em></div>
    </div>
  )
}

function Name({ name, color }: { name: string; color: string }) {
  return (
    <span className="display" style={{ fontSize: 'clamp(44px, 8.5vw, 96px)' }}>
      <em style={{ color, WebkitTextFillColor: color }}>{name}</em>
    </span>
  )
}
