import { motion } from 'framer-motion'
import type { Msg } from '../lib/parser'
import { HEART_RE, LOVE_RE } from '../lib/text'
import type { Analysis, Person } from '../lib/analyze'
import { fmt, fmtCompact, fmtDuration, fmtDate, fmtMonth, pct } from '../lib/format'
import { CountUp, rise, Avatar, Matrix, ScoreRing } from './charts'
import { SectionHead, Bubble, Evidence } from './Dashboard'
import type { TabId } from './Dashboard'

export function ModesFun({ a, tab, messages }: { a: Analysis; tab: TabId; messages: Msg[] }) {
  if (tab === 'emoji') return <Hieroglyphics a={a} messages={messages} />
  if (tab === 'awards') return <Superlatives a={a} />
  if (tab === 'records') return <HallOfFame a={a} />
  if (tab === 'saga') return <Saga a={a} />
  return <Cast a={a} />
}

// ============================================================ Hieroglyphics
function Hieroglyphics({ a, messages }: { a: Analysis; messages: Msg[] }) {
  const max = a.topEmojis.length ? a.topEmojis[0][1] : 1
  const monthsWithEmoji = a.monthly.filter((m) => m.topEmoji)
  return (
    <div>
      <SectionHead
        title="Hieroglyphics"
        sub={`${fmt(a.totals.emojis)} emojis across ${a.emojiTotalDistinct} distinct glyphs. Future archaeologists will study this.`}
      />
      <motion.div {...rise} className="panel panel-pad-lg">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {a.topEmojis.map(([e, n], i) => {
            const t = n / max
            return (
              <motion.div
                key={e}
                initial={{ opacity: 0, scale: 0.4 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: i * 0.035, type: 'spring', bounce: 0.45 }}
                title={`${e} — ${fmt(n)} times`}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  padding: '12px 10px 8px', borderRadius: 16,
                  border: '1px solid var(--line)',
                  background: i === 0 ? 'var(--grad-soft)' : 'var(--panel2)',
                  minWidth: 64,
                }}
              >
                <span style={{ fontSize: 16 + t * 26, lineHeight: 1.2 }}>{e}</span>
                <span className="mono faint" style={{ fontSize: 11 }}>{fmtCompact(n)}</span>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      <SectionHead title="Signature emoji" sub="Everyone has one. It chose them." />
      <div className="grid grid-3">
        {a.people.filter((p) => p.topEmojis.length > 0).map((p, i) => (
          <motion.div key={p.name} {...rise} transition={{ ...rise.transition, delay: (i % 3) * 0.06 }} className="panel" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 52, lineHeight: 1.1 }}>{p.topEmojis[0][0]}</div>
            <div style={{ fontWeight: 700, marginTop: 8 }}>{p.name}</div>
            <div className="mono muted" style={{ fontSize: 12.5, marginTop: 3 }}>
              used {fmt(p.topEmojis[0][1])} times · {(p.emojiCount / Math.max(1, p.msgCount)).toFixed(2)} per message
            </div>
            <div style={{ marginTop: 10, fontSize: 19, letterSpacing: 4 }}>
              {p.topEmojis.slice(1, 6).map(([e]) => e).join('')}
            </div>
          </motion.div>
        ))}
      </div>

      {monthsWithEmoji.length > 5 && (
        <>
          <SectionHead title="Mood ring" sub="The most-used emoji of every month. A tiny emotional history." />
          <motion.div {...rise} className="panel" style={{ overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: 6, minWidth: 'max-content', padding: '4px 2px' }}>
              {monthsWithEmoji.map((m, i) => (
                <motion.div
                  key={m.key}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.02, 0.8), duration: 0.4 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 52 }}
                  title={`${fmtMonth(m.key)}: ${m.topEmoji}`}
                >
                  <span style={{ fontSize: 24 }}>{m.topEmoji}</span>
                  <span className="faint mono" style={{ fontSize: 9.5, whiteSpace: 'nowrap' }}>{fmtMonth(m.key)}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      <div className="grid grid-2" style={{ marginTop: 14 }}>
        <motion.div {...rise} className="panel">
          <div className="label">hearts sent ❤️</div>
          <div className="stat-big" style={{ marginTop: 12 }}>
            <CountUp value={a.people.reduce((s, p) => s + p.hearts, 0)} />
          </div>
          <div className="stat-unit">messages containing a heart of any color</div>
          <Evidence
            messages={messages}
            test={(m) => HEART_RE.test(m.text) || LOVE_RE.test(m.text)}
            byName={a.byName}
            label="read the love notes"
          />
        </motion.div>
        <motion.div {...rise} className="panel">
          <div className="label">emoji-to-word ratio champion</div>
          {(() => {
            const champ = [...a.people].sort((x, y) => y.emojiCount / Math.max(1, y.msgCount) - x.emojiCount / Math.max(1, x.msgCount))[0]
            return (
              <>
                <div className="display" style={{ fontSize: 30, marginTop: 10 }}><em style={{ color: champ.color }}>{champ.name}</em></div>
                <div className="stat-unit">{(champ.emojiCount / Math.max(1, champ.msgCount)).toFixed(2)} emojis per message. words are optional.</div>
              </>
            )
          })()}
        </motion.div>
      </div>
    </div>
  )
}

// ============================================================ Superlatives
function Superlatives({ a }: { a: Analysis }) {
  return (
    <div>
      <SectionHead
        title="The Superlatives"
        sub="Yearbook awards your chat never voted on. The data did. Sorry in advance."
      />
      <div className="grid grid-3">
        {a.awards.map((w, i) => {
          const p = a.byName.get(w.person)
          return (
            <motion.div
              key={w.id + w.person}
              initial={{ opacity: 0, y: 26, rotate: -1 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: (i % 3) * 0.09, ease: [0.2, 0.8, 0.2, 1] }}
              className="award-card"
            >
              <div className="award-emoji">{w.emoji}</div>
              <div className="award-title">{w.title}</div>
              <div className="award-person" style={{ color: p?.color }}>{w.person}</div>
              <div className="award-stat">{w.stat}</div>
              <div className="award-flavor">{w.flavor}</div>
            </motion.div>
          )
        })}
      </div>
      <motion.p {...rise} className="faint" style={{ textAlign: 'center', marginTop: 36, fontSize: 13.5 }}>
        Disagree with an award? The numbers are in the other nine tabs. Take it up with them.
      </motion.p>
    </div>
  )
}

// ============================================================ Hall of Fame
function HallOfFame({ a }: { a: Analysis }) {
  return (
    <div>
      <SectionHead title="Hall of Fame" sub="All-time records. These actually happened." />
      <div className="grid grid-2">
        {a.records.map((r, i) => (
          <motion.div key={r.id} {...rise} transition={{ ...rise.transition, delay: (i % 2) * 0.07 }} className="panel">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <span style={{ fontSize: 30 }}>{r.emoji}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="label">{r.title}</div>
                <div className="display" style={{ fontSize: 'clamp(20px, 2.6vw, 27px)', marginTop: 6 }}><em>{r.value}</em></div>
                <div className="muted" style={{ fontSize: 13.5, marginTop: 4 }}>{r.detail}</div>
                {r.msg && r.msg.kind === 'text' && r.msg.text && (
                  <div style={{ marginTop: 12 }}>
                    <Bubble msg={r.msg} color={a.byName.get(r.msg.sender)?.color} />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ============================================================ The Saga
function Saga({ a }: { a: Analysis }) {
  let lastYear = ''
  return (
    <div>
      <SectionHead title="The Saga" sub={`${a.chatName}, told in chapters. Based on a true story.`} />
      <div className="saga" style={{ maxWidth: 760, margin: '0 auto' }}>
        {a.milestones.map((m, i) => {
          const year = String(new Date(m.ts).getFullYear())
          const showYear = year !== lastYear
          lastYear = year
          return (
            <div key={i}>
              {showYear && (
                <motion.div {...rise} className="display" style={{ fontSize: 38, margin: '8px 0 26px', marginLeft: -34 }}>
                  <em className="grad-text">{year}</em>
                </motion.div>
              )}
              <motion.div {...rise} transition={{ ...rise.transition, delay: 0.05 }} className="saga-item">
                <div className="saga-dot">{m.emoji}</div>
                <div className="panel" style={{ padding: '18px 20px' }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{m.title}</div>
                  <div className="muted" style={{ fontSize: 13.5, marginTop: 3 }}>{m.detail}</div>
                  {m.quote && (
                    <div style={{ marginTop: 12 }}>
                      <Bubble
                        msg={{ ts: m.ts, sender: m.quote.sender, text: m.quote.text, kind: 'text' }}
                        color={a.byName.get(m.quote.sender)?.color}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================ The Cast
function Cast({ a }: { a: Analysis }) {
  const colors = new Map(a.people.map((p) => [p.name, p.color]))
  return (
    <div>
      <SectionHead title="The Cast" sub="Everyone, profiled. With love. Mostly." />

      {a.compatibility && (
        <motion.div {...rise} className="panel panel-pad-lg" style={{ marginBottom: 14 }}>
          <div className="grid grid-2" style={{ alignItems: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ScoreRing score={a.compatibility.score} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {a.compatibility.parts.map((part) => (
                <div key={part.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 4 }}>
                    <b>{part.label}</b>
                    <span className="mono muted">{Math.round(part.score * 100)}</span>
                  </div>
                  <div className="meter" style={{ height: 7 }}>
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${part.score * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.9 }} />
                  </div>
                  <div className="faint" style={{ fontSize: 12, marginTop: 3 }}>{part.note}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="faint" style={{ fontSize: 12, marginTop: 18, textAlign: 'center' }}>
            scientifically unserious · emotionally accurate
          </div>
        </motion.div>
      )}

      <div className="grid grid-2">
        {a.people.map((p, i) => (
          <PersonCard key={p.name} p={p} a={a} delay={(i % 2) * 0.07} />
        ))}
      </div>

      {a.matrix && a.matrix.names.length > 2 && (
        <>
          <SectionHead title="The chemistry grid" sub="Who actually replies to whom (within 15 minutes). Rows reply to columns." />
          <motion.div {...rise} className="panel">
            <Matrix names={a.matrix.names} counts={a.matrix.counts} colors={colors} />
          </motion.div>
        </>
      )}
    </div>
  )
}

function PersonCard({ p, a, delay }: { p: Person; a: Analysis; delay: number }) {
  const awards = a.awards.filter((w) => w.person === p.name)
  const facts: [string, string][] = [
    ['messages', `${fmt(p.msgCount)} (${pct(p.share)})`],
    ['words', fmt(p.wordCount)],
    ['avg message', `${Math.round(p.avgLen)} chars`],
    ['median reply', p.replyMedianMs ? fmtDuration(p.replyMedianMs) : '—'],
    ['conversations started', fmt(p.starts)],
    ['media sent', fmt(p.mediaCount)],
    ['laughs earned', fmt(p.laughsEarned)],
    ['chronotype', p.chronotype],
  ]
  return (
    <motion.div {...rise} transition={{ ...rise.transition, delay }} className="panel">
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
        <Avatar name={p.name} color={p.color} size={52} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 19 }}>{p.name}</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>
            {awards.length > 0 ? awards.map((w) => `${w.emoji} ${w.title}`).join(' · ') : 'civilian'}
          </div>
        </div>
        {p.topEmojis[0] && <span style={{ marginLeft: 'auto', fontSize: 30 }}>{p.topEmojis[0][0]}</span>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px 16px' }}>
        {facts.map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13, borderBottom: '1px dashed var(--line)', paddingBottom: 6 }}>
            <span className="muted">{k}</span>
            <span className="mono" style={{ fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>
      {p.distinctive.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {p.distinctive.slice(0, 4).map((w) => (
            <span key={w.word} className="wchip" style={{ fontSize: 12 }}>{w.word}</span>
          ))}
        </div>
      )}
    </motion.div>
  )
}
