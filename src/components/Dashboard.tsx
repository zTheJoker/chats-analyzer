import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Analysis } from '../lib/analyze'
import type { Msg } from '../lib/parser'
import {
  fmt, fmtCompact, fmtDuration, fmtDate, fmtTime, fmtHour, fmtMonthFull,
  DOW_FULL, pct, tsOfKey,
} from '../lib/format'
import {
  CountUp, Donut, Heatmap, MonthlyArea, RankBars, HourBars, DowBars,
  BucketBars, rise, Avatar, Calendar, VibeLine,
} from './charts'
import { SWEARS, isLaugh, tokenizeWords } from '../lib/text'
import { ModesFun } from './modes-fun'
import { TimeMachine } from './TimeMachine'
import { ShareStudio } from './ShareStudio'

const TABS = [
  ['verdict', '⚖️', 'The Verdict'],
  ['pulse', '💓', 'Pulse'],
  ['reflexes', '⚡', 'Reflexes'],
  ['words', '🗣️', 'Vocabulary'],
  ['emoji', '🗿', 'Hieroglyphics'],
  ['awards', '🏆', 'Superlatives'],
  ['records', '🥇', 'Hall of Fame'],
  ['saga', '📖', 'The Saga'],
  ['time', '🕰️', 'Time Machine'],
  ['cast', '🎭', 'The Cast'],
  ['share', '🧾', 'Share'],
] as const
export type TabId = (typeof TABS)[number][0]

export function Dashboard({ a, messages, years, year, setYear, onReset, theme, setTheme }: {
  a: Analysis
  messages: Msg[]
  years: number[]
  year: number | null
  setYear: (y: number | null) => void
  onReset: () => void
  theme: string
  setTheme: (t: string) => void
}) {
  const [tab, setTab] = useState<TabId>('verdict')
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }) }, [tab])

  return (
    <div>
      {/* header */}
      <div className="shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, minWidth: 0 }}>
          <span className="display" style={{ fontSize: 26 }}>receipts<span className="grad-text">*</span></span>
          <span className="mono muted" style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '38vw' }}>
            / {a.chatName}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-sm btn-ghost" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="btn btn-sm" onClick={onReset}>↺ new chat</button>
        </div>
      </div>

      {/* year filter */}
      {years.length > 1 && (
        <div className="shell" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', paddingBottom: 12 }}>
          <span className="label" style={{ marginRight: 6 }}>rewind</span>
          <button
            className={`mode-tab ${year === null ? 'active' : ''}`}
            style={{ border: '1px solid var(--line)', padding: '5px 13px', fontSize: 12.5 }}
            onClick={() => setYear(null)}
          >
            all time
          </button>
          {years.map((y) => (
            <button
              key={y}
              className={`mode-tab ${year === y ? 'active' : ''}`}
              style={{ border: '1px solid var(--line)', padding: '5px 13px', fontSize: 12.5 }}
              onClick={() => setYear(y)}
            >
              {y}{year === y ? ' wrapped' : ''}
            </button>
          ))}
        </div>
      )}

      {/* mode tabs */}
      <nav className="modebar">
        <div className="modebar-inner">
          {TABS.map(([id, emoji, label]) => (
            <button key={id} className={`mode-tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
              <span>{emoji}</span>{label}
            </button>
          ))}
        </div>
      </nav>

      <AnimatePresence mode="wait">
        <motion.main
          key={tab + (year ?? 'all')}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          className="shell"
          style={{ paddingBottom: 80 }}
        >
          {tab === 'verdict' && <Verdict a={a} messages={messages} />}
          {tab === 'pulse' && <Pulse a={a} />}
          {tab === 'reflexes' && <Reflexes a={a} />}
          {tab === 'words' && <Vocabulary a={a} messages={messages} />}
          {(tab === 'emoji' || tab === 'awards' || tab === 'records' || tab === 'saga' || tab === 'cast') && (
            <ModesFun a={a} tab={tab} messages={messages} />
          )}
          {tab === 'time' && <TimeMachine a={a} messages={messages} />}
          {tab === 'share' && <ShareStudio a={a} />}
        </motion.main>
      </AnimatePresence>
    </div>
  )
}

export function SectionHead({ title, sub, tag }: { title: string; sub?: string; tag?: string }) {
  return (
    <div style={{ margin: '46px 0 18px' }}>
      <h2 className="section-title">
        <em className="grad-text" style={{ fontStyle: 'italic' }}>{title}</em>
        {tag && <span className="tag">{tag}</span>}
      </h2>
      {sub && <p className="section-sub">{sub}</p>}
    </div>
  )
}

export function Bubble({ msg, color }: { msg: Msg; color?: string }) {
  return (
    <div className="bubble">
      <div className="bubble-sender" style={{ color: color ?? 'var(--lime)' }}>{msg.sender}</div>
      {msg.text.length > 420 ? msg.text.slice(0, 420) + ' …' : msg.text}
      <div className="bubble-time">{fmtDate(msg.ts)} · {fmtTime(msg.ts)}</div>
    </div>
  )
}

// Evidence drawer: "the data says X" is good; showing the actual messages is
// better. Samples spread across the whole history, reshuffleable.
export function Evidence({ messages, test, byName, label = 'see the receipts' }: {
  messages: Msg[]
  test: (m: Msg) => boolean
  byName: Map<string, { color: string }>
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const [round, setRound] = useState(0)
  const [matches, setMatches] = useState<Msg[] | null>(null)

  const reveal = () => {
    if (!matches) setMatches(messages.filter((m) => (m.kind === 'text' || (m.kind === 'media' && m.text.length > 0)) && test(m)))
    setOpen(!open)
  }
  const shown = (() => {
    if (!open || !matches || matches.length === 0) return []
    const want = Math.min(6, matches.length)
    const out: Msg[] = []
    for (let i = 0; i < want; i++) {
      out.push(matches[(Math.floor((i * matches.length) / want) + round * 7) % matches.length])
    }
    return out.sort((x, y) => x.ts - y.ts)
  })()

  return (
    <div style={{ marginTop: 16 }}>
      <button className="btn btn-sm btn-ghost" style={{ color: 'var(--muted)' }} onClick={reveal}>
        {open ? '▲ hide' : `👀 ${label}`}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            {matches && matches.length === 0 ? (
              <div className="faint" style={{ padding: '12px 2px', fontSize: 13 }}>nothing on record. suspiciously clean.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, padding: '14px 2px 4px' }}>
                {shown.map((m, i) => (
                  <Bubble key={`${m.ts}-${i}`} msg={m} color={byName.get(m.sender)?.color} />
                ))}
                {matches && matches.length > 6 && (
                  <button className="btn btn-sm btn-ghost" style={{ alignSelf: 'flex-start', color: 'var(--faint)' }} onClick={() => setRound((r) => r + 1)}>
                    🎲 show {matches.length - 6 > 6 ? 'different' : 'other'} ones · {fmt(matches.length)} total
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================ The Verdict
function Verdict({ a, messages }: { a: Analysis; messages: Msg[] }) {
  const perDay = a.totals.messages / Math.max(1, a.range.days)
  const stats: [string, number, string][] = [
    ['messages', a.totals.messages, `${perDay.toFixed(1)} per day`],
    ['words', a.totals.words, `${fmt(a.totals.chars)} characters`],
    ['days of history', a.range.days, `${fmt(a.range.activeDays)} with at least one message`],
    ['laughs', a.totals.laughs, `${pct(a.totals.laughs / Math.max(1, a.totals.messages))} of all messages`],
    ['photos & media', a.totals.media, `${fmt(a.totals.links)} links shared`],
    ['emojis', a.totals.emojis, `${a.emojiTotalDistinct} distinct ones`],
  ]
  return (
    <div>
      <motion.div {...rise} style={{ margin: '44px 0 10px' }}>
        <div className="label">the verdict on {a.chatName}</div>
        <h1 className="display" style={{ fontSize: 'clamp(30px, 5vw, 54px)', maxWidth: 880, marginTop: 12 }}>
          <em>{a.headline}</em>
        </h1>
      </motion.div>

      <div className="grid grid-3" style={{ marginTop: 30 }}>
        {stats.map(([label, value, sub], i) => (
          <motion.div key={label} {...rise} transition={{ ...rise.transition, delay: i * 0.06 }} className="panel">
            <div className="label">{label}</div>
            <div className="stat-big" style={{ marginTop: 10 }}><CountUp value={value} /></div>
            <div className="stat-unit">{sub}</div>
            {label === 'laughs' && value > 0 && (
              <Evidence messages={messages} test={(m) => isLaugh(m.text)} byName={a.byName} label="hear the laughs" />
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-3" style={{ marginTop: 14 }}>
        <motion.div {...rise} className="panel">
          <div className="label">conversations</div>
          <div className="stat-big" style={{ marginTop: 10 }}><CountUp value={a.totals.sessions} /></div>
          <div className="stat-unit">{a.avgSessionMsgs.toFixed(1)} messages per conversation</div>
        </motion.div>
        <motion.div {...rise} className="panel">
          <div className="label">estimated thumb-time 👍</div>
          <div className="stat-big" style={{ marginTop: 10 }}>
            <CountUp value={a.thumbTimeMs / 3600e3} format={(n) => `${Math.round(n).toLocaleString()}h`} />
          </div>
          <div className="stat-unit">
            ≈ {(a.thumbTimeMs / 86400e3).toFixed(1)} full days spent typing & reading this chat
          </div>
        </motion.div>
        <motion.div {...rise} className="panel">
          <div className="label">questions asked</div>
          <div className="stat-big" style={{ marginTop: 10 }}><CountUp value={a.totals.questions} /></div>
          <div className="stat-unit">{fmt(a.totals.edited)} edits · {fmt(a.totals.deleted)} deletions 👀</div>
        </motion.div>
      </div>

      <SectionHead title="Who does the talking" sub="Share of all messages. The donut does not lie." />
      <div className="grid grid-2">
        <motion.div {...rise} className="panel" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Donut people={a.people} />
        </motion.div>
        <motion.div {...rise} className="panel">
          <RankBars
            rows={a.people.map((p) => ({ label: p.name, value: p.msgCount, color: p.color, sub: pct(p.share) }))}
          />
        </motion.div>
      </div>

      <SectionHead title="The shape of it" sub="Every month since the beginning, stacked by person." />
      <motion.div {...rise} className="panel">
        <MonthlyArea monthly={a.monthly} people={a.people} />
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 14 }}>
          {a.people.slice(0, 6).map((p) => (
            <span key={p.name} className="pchip" style={{ fontSize: 13 }}>
              <span className="pdot" style={{ background: p.color }} />{p.name}
            </span>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-3" style={{ marginTop: 14 }}>
        <motion.div {...rise} className="panel">
          <div className="label">peak month</div>
          <div className="display" style={{ fontSize: 26, marginTop: 8 }}><em>{fmtMonthFull(a.busiest.monthKey)}</em></div>
          <div className="stat-unit">{fmt(a.monthly.find((m) => m.key === a.busiest.monthKey)?.total ?? 0)} messages</div>
        </motion.div>
        <motion.div {...rise} className="panel">
          <div className="label">peak day of week</div>
          <div className="display" style={{ fontSize: 26, marginTop: 8 }}><em>{DOW_FULL[a.busiest.dow]}s</em></div>
          <div className="stat-unit">{fmt(a.dowHist[a.busiest.dow])} messages all-time</div>
        </motion.div>
        <motion.div {...rise} className="panel">
          <div className="label">peak hour</div>
          <div className="display" style={{ fontSize: 26, marginTop: 8 }}><em>{fmtHour(a.busiest.hour)}</em></div>
          <div className="stat-unit">when this chat truly lives</div>
        </motion.div>
      </div>

      {a.vibeRange.best && a.vibeRange.worst && a.vibeRange.best.key !== a.vibeRange.worst.key && (
        <>
          <SectionHead title="Vibe report" sub="Each month measured against this chat’s own baseline: the language used (with negation handled, so “not great” counts right), how much affection flows, and whether the chat suddenly goes quiet — because a cold month rarely announces itself in words." />
          <motion.div {...rise} className="panel" style={{ marginBottom: 14 }}>
            <VibeLine monthly={a.monthly} />
          </motion.div>
          <div className="grid grid-2">
            <motion.div {...rise} className="panel">
              <div className="label">sunniest month ☀️</div>
              <div className="display" style={{ fontSize: 26, marginTop: 8 }}><em>{fmtMonthFull(a.vibeRange.best.key)}</em></div>
              <div className="stat-unit">{a.vibeRange.best.topEmoji ? `signature emoji: ${a.vibeRange.best.topEmoji}` : `${fmt(a.vibeRange.best.total)} messages`}</div>
            </motion.div>
            <motion.div {...rise} className="panel">
              <div className="label">rockiest month 🌧️</div>
              <div className="display" style={{ fontSize: 26, marginTop: 8 }}><em>{fmtMonthFull(a.vibeRange.worst.key)}</em></div>
              <div className="stat-unit">we’ve all been there</div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}

// ============================================================ Pulse
function Pulse({ a }: { a: Analysis }) {
  const owls = [...a.people].sort((x, y) => y.nightShare - x.nightShare)
  const [who, setWho] = useState<string | null>(null)
  const grid = who ? a.byName.get(who)?.heatmap ?? a.heatmap : a.heatmap
  return (
    <div>
      <motion.div {...rise}>
        <SectionHead
          title="The pulse"
          sub={`Every message, mapped to its hour. This chat peaks ${DOW_FULL[a.busiest.dow]}s around ${fmtHour(a.busiest.hour)}.`}
        />
      </motion.div>
      <motion.div {...rise} className="panel panel-pad-lg">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          <button className={`mode-tab ${who === null ? 'active' : ''}`} style={{ border: '1px solid var(--line)', padding: '5px 12px', fontSize: 12.5 }} onClick={() => setWho(null)}>
            everyone
          </button>
          {a.people.slice(0, 8).map((p) => (
            <button key={p.name} className={`mode-tab ${who === p.name ? 'active' : ''}`} style={{ border: '1px solid var(--line)', padding: '5px 12px', fontSize: 12.5 }} onClick={() => setWho(p.name)}>
              <span className="pdot" style={{ background: p.color }} />{p.name}
            </button>
          ))}
        </div>
        <Heatmap key={who ?? 'all'} grid={grid} />
        <div className="faint" style={{ fontSize: 12, marginTop: 12 }}>
          ⏱ times are your phone’s local clock at export — WhatsApp writes the export in whatever timezone the exporting device was in.
        </div>
      </motion.div>

      <SectionHead title="Every single day" sub="One square per day, like a commit graph for your friendship. Scroll back through time →" />
      <motion.div {...rise} className="panel">
        <Calendar daily={a.daily} start={a.range.start} end={a.range.end} />
      </motion.div>

      <div className="grid grid-2" style={{ marginTop: 14 }}>
        <motion.div {...rise} className="panel">
          <div className="label" style={{ marginBottom: 14 }}>by hour of day</div>
          <HourBars hist={a.hourHist} />
        </motion.div>
        <motion.div {...rise} className="panel">
          <div className="label" style={{ marginBottom: 14 }}>by day of week</div>
          <DowBars hist={a.dowHist} />
        </motion.div>
      </div>

      <SectionHead title="Chronotypes" sub="Some people text at sunrise. Some people are a problem." />
      <div className="grid grid-2">
        {owls.map((p, i) => (
          <motion.div key={p.name} {...rise} transition={{ ...rise.transition, delay: i * 0.05 }} className="panel" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Avatar name={p.name} color={p.color} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700 }}>{p.name}
                <span style={{ marginLeft: 9, fontSize: 12.5, color: 'var(--muted)', fontWeight: 500 }}>
                  {p.chronotype === 'night owl' ? '🦉 night owl' : p.chronotype === 'early bird' ? '🐦 early bird' : '☀️ day texter'}
                </span>
              </div>
              <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>
                {pct(p.nightShare)} of their messages between 11 PM and 5 AM
              </div>
              <div className="meter" style={{ marginTop: 9 }}>
                <motion.div initial={{ width: 0 }} whileInView={{ width: `${Math.min(100, p.nightShare * 250)}%` }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ background: p.color }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <SectionHead title="Streaks & silences" />
      <div className="grid grid-3">
        <motion.div {...rise} className="panel">
          <div className="label">longest streak ⛓️</div>
          <div className="stat-big" style={{ marginTop: 10 }}><CountUp value={a.streak.len} /> <span style={{ fontSize: 20 }}>days</span></div>
          <div className="stat-unit">{fmtDate(tsOfKey(a.streak.start))} → {fmtDate(tsOfKey(a.streak.end))}, not one day missed</div>
        </motion.div>
        <motion.div {...rise} className="panel">
          <div className="label">talk-rate</div>
          <div className="stat-big" style={{ marginTop: 10 }}><CountUp value={(a.range.activeDays / a.range.days) * 100} format={(n) => `${Math.round(n)}%`} /></div>
          <div className="stat-unit">of all {fmt(a.range.days)} days had at least one message</div>
        </motion.div>
        <motion.div {...rise} className="panel">
          <div className="label">longest silence 🦗</div>
          <div className="stat-big" style={{ marginTop: 10 }}>{a.silence ? fmtDuration(a.silence.ms) : '—'}</div>
          <div className="stat-unit">{a.silence?.breaker ? `until ${a.silence.breaker.sender} cracked` : 'this chat never sleeps'}</div>
        </motion.div>
      </div>
      {a.silence?.breaker && a.silence.breaker.kind === 'text' && (
        <motion.div {...rise} className="panel" style={{ marginTop: 14 }}>
          <div className="label" style={{ marginBottom: 12 }}>the message that broke the silence</div>
          <Bubble msg={a.silence.breaker} color={a.byName.get(a.silence.breaker.sender)?.color} />
        </motion.div>
      )}
    </div>
  )
}

// ============================================================ Reflexes
function Reflexes({ a }: { a: Analysis }) {
  const ranked = [...a.people].filter((p) => p.replyMedianMs !== null && p.replies >= 5).sort((x, y) => x.replyMedianMs! - y.replyMedianMs!)
  const maxMed = Math.max(...ranked.map((p) => p.replyMedianMs!), 1)
  const doubles = [...a.people].sort((x, y) => y.doubleTexts - x.doubleTexts)
  return (
    <div>
      <SectionHead
        title="Reflexes"
        sub="How long a reply takes, measured on every back-and-forth. Median, so one nap doesn’t ruin your record."
      />
      <motion.div {...rise} className="panel">
        <RankBars
          rows={ranked.map((p, i) => ({
            label: `${i === 0 ? '⚡ ' : i === ranked.length - 1 && ranked.length > 2 ? '👻 ' : ''}${p.name}`,
            value: p.replyMedianMs!,
            color: p.color,
            sub: `${fmtCompact(p.replies)} replies measured`,
          }))}
          format={(v) => fmtDuration(v)}
          maxOverride={maxMed}
        />
      </motion.div>

      <div className="grid grid-2" style={{ marginTop: 14 }}>
        <motion.div {...rise} className="panel">
          <div className="label" style={{ marginBottom: 12 }}>how fast replies happen overall</div>
          <BucketBars buckets={a.replyBuckets} />
        </motion.div>
        <motion.div {...rise} className="panel">
          <div className="label" style={{ marginBottom: 12 }}>the double-text leaderboard 📲</div>
          <RankBars
            rows={doubles.slice(0, 6).map((p) => ({ label: p.name, value: p.doubleTexts, color: p.color }))}
            format={(v) => fmt(v)}
          />
          <div className="faint" style={{ fontSize: 12.5, marginTop: 14 }}>
            a double-text: following up on your own message after 10+ minutes of nothing
          </div>
        </motion.div>
      </div>

      {a.fastestReply && (
        <>
          <SectionHead title="Caught on record" sub="Actual receipts. We checked." />
          <div className="grid grid-2">
            <motion.div {...rise} className="panel">
              <div className="label" style={{ marginBottom: 12 }}>⚡ fastest reply ever — {fmtDuration(a.fastestReply.ms)}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Bubble msg={a.fastestReply.prev} color={a.byName.get(a.fastestReply.prev.sender)?.color} />
                <Bubble msg={a.fastestReply.reply} color={a.byName.get(a.fastestReply.reply.sender)?.color} />
              </div>
            </motion.div>
            {a.slowestReply && (
              <motion.div {...rise} className="panel">
                <div className="label" style={{ marginBottom: 12 }}>🐢 slowest reply that still arrived — {fmtDuration(a.slowestReply.ms)}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Bubble msg={a.slowestReply.prev} color={a.byName.get(a.slowestReply.prev.sender)?.color} />
                  <div className="faint mono" style={{ fontSize: 12, padding: '2px 6px' }}>· · · {fmtDuration(a.slowestReply.ms)} pass · · ·</div>
                  <Bubble msg={a.slowestReply.reply} color={a.byName.get(a.slowestReply.reply.sender)?.color} />
                </div>
              </motion.div>
            )}
          </div>
        </>
      )}

      <SectionHead title="Left on read" sub="Questions that never got an answer. We counted. Painful." />
      <motion.div {...rise} className="panel">
        <RankBars
          rows={[...a.people].sort((x, y) => y.unansweredQs - x.unansweredQs).slice(0, 6).map((p) => ({
            label: p.name, value: p.unansweredQs, color: p.color, sub: 'questions into the void',
          }))}
          format={(v) => fmt(v)}
        />
      </motion.div>
    </div>
  )
}

// ============================================================ Vocabulary
function Vocabulary({ a, messages }: { a: Analysis; messages: Msg[] }) {
  const byLen = [...a.people].sort((x, y) => y.avgLen - x.avgLen)
  const caps = [...a.people].sort((x, y) => y.capsCount - x.capsCount).filter((p) => p.capsCount > 0)
  const swears = [...a.people].sort((x, y) => y.swears - x.swears).filter((p) => p.swears > 0)
  return (
    <div>
      <SectionHead
        title="Vocabulary"
        sub="The words each person uses far more than everyone else — statistically, not vibes. (Well. Statistical vibes.)"
      />
      <div className="grid grid-2">
        {a.people.filter((p) => p.distinctive.length > 0).map((p, i) => (
          <motion.div key={p.name} {...rise} transition={{ ...rise.transition, delay: (i % 2) * 0.07 }} className="panel">
            <div className="pchip" style={{ marginBottom: 10 }}>
              <Avatar name={p.name} color={p.color} size={34} />
              <span style={{ fontWeight: 700 }}>{p.name}</span>
              <span className="faint" style={{ fontWeight: 400, fontSize: 12.5 }}>says these like nobody else</span>
            </div>
            <div>
              {p.distinctive.slice(0, 8).map((w, j) => (
                <span key={w.word} className="wchip" style={{
                  fontSize: Math.max(12, 19 - j * 1.1),
                  borderColor: j === 0 ? p.color : undefined,
                  color: j < 2 ? p.color : undefined,
                }}>
                  {w.word}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <SectionHead title="Message length" sub="Average characters per message. Novelists vs. people who text “k”." />
      <motion.div {...rise} className="panel">
        <RankBars
          rows={byLen.map((p, i) => ({
            label: `${i === 0 ? '📜 ' : ''}${p.name}`,
            value: p.avgLen,
            color: p.color,
            sub: `longest: ${fmt(p.longestMsg?.text.length ?? 0)} chars`,
          }))}
          format={(v) => `${Math.round(v)} chars`}
        />
      </motion.div>

      <div className="grid grid-2" style={{ marginTop: 14 }}>
        <motion.div {...rise} className="panel">
          <div className="label" style={{ marginBottom: 12 }}>🔎 the interrogation index</div>
          <RankBars
            rows={[...a.people].sort((x, y) => y.questions - x.questions).slice(0, 6).map((p) => ({
              label: p.name, value: p.questions, color: p.color,
              sub: `${pct(p.questions / Math.max(1, p.msgCount))} of their messages`,
            }))}
            format={(v) => fmt(v)}
          />
        </motion.div>
        <motion.div {...rise} className="panel">
          <div className="label" style={{ marginBottom: 12 }}>📣 ALL-CAPS MOMENTS</div>
          {caps.length > 0 ? (
            <>
              <RankBars
                rows={caps.slice(0, 6).map((p) => ({ label: p.name, value: p.capsCount, color: p.color }))}
                format={(v) => fmt(v)}
              />
              <Evidence
                messages={messages}
                test={(m) => { const L = m.text.replace(/[^a-zA-Z]/g, ''); return L.length >= 6 && L === L.toUpperCase() }}
                byName={a.byName}
                label="WITNESS THE SHOUTING"
              />
            </>
          ) : <div className="muted">a remarkably calm chat. zero shouting detected.</div>}
        </motion.div>
      </div>

      {swears.length > 0 && (
        <div className="grid grid-2" style={{ marginTop: 14 }}>
          <motion.div {...rise} className="panel">
            <div className="label" style={{ marginBottom: 12 }}>🫙 the swear jar</div>
            <RankBars
              rows={swears.slice(0, 6).map((p) => ({ label: p.name, value: p.swears, color: p.color, sub: 'coins owed' }))}
              format={(v) => fmt(v)}
            />
            <Evidence
              messages={messages}
              test={(m) => tokenizeWords(m.text).some((w) => SWEARS.has(w))}
              byName={a.byName}
              label="open the jar"
            />
          </motion.div>
          <motion.div {...rise} className="panel">
            <div className="label" style={{ marginBottom: 12 }}>collective damage</div>
            <div className="stat-big" style={{ marginTop: 16 }}>
              <CountUp value={swears.reduce((s, p) => s + p.swears, 0)} />
            </div>
            <div className="stat-unit">jar contributions, all-time. at $1 each that’s a decent dinner.</div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
