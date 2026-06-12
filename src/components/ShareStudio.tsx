// Share cards styled as printed receipts. Rendered as DOM, exported to PNG
// entirely client-side via html-to-image.
import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { toPng } from 'html-to-image'
import type { Analysis, Person } from '../lib/analyze'
import { fmt, fmtDuration, fmtDate, pct } from '../lib/format'
import { rise } from './charts'
import { SectionHead } from './Dashboard'

type CardKind = 'audit' | 'superlative' | 'compat' | 'records'

export function ShareStudio({ a }: { a: Analysis }) {
  const cards: { id: CardKind; label: string; show: boolean }[] = [
    { id: 'audit', label: '🧾 The Audit', show: true },
    { id: 'superlative', label: '🏆 Superlative', show: a.awards.length > 0 },
    { id: 'compat', label: '💘 Compatibility', show: !!a.compatibility },
    { id: 'records', label: '🥇 Records', show: a.records.length > 2 },
  ]
  const [kind, setKind] = useState<CardKind>('audit')
  const [person, setPerson] = useState(a.awards[0]?.person ?? a.people[0].name)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const fileName = `receipts-${a.chatName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${kind}.png`

  const exportPng = async (): Promise<string> => {
    const node = cardRef.current!
    return toPng(node, { pixelRatio: 3, cacheBust: true })
  }

  const download = async () => {
    setBusy(true)
    try {
      const url = await exportPng()
      const link = document.createElement('a')
      link.download = fileName
      link.href = url
      link.click()
      setSaved(true)
      setTimeout(() => setSaved(false), 2400)
    } finally { setBusy(false) }
  }

  const share = async () => {
    setBusy(true)
    try {
      const url = await exportPng()
      const blob = await (await fetch(url)).blob()
      const file = new File([blob], fileName, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'the receipts are in' })
      } else {
        const link = document.createElement('a')
        link.download = fileName
        link.href = url
        link.click()
      }
    } catch { /* user cancelled */ }
    finally { setBusy(false) }
  }

  return (
    <div>
      <SectionHead
        title="The printer"
        sub="Pick a card, print the receipt, post it wherever it'll cause the most conversation. Exports as a crisp PNG — generated on your device, like everything else here."
      />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        {cards.filter((c) => c.show).map((c) => (
          <button key={c.id} className={`mode-tab ${kind === c.id ? 'active' : ''}`} style={{ border: '1px solid var(--line)' }} onClick={() => setKind(c.id)}>
            {c.label}
          </button>
        ))}
      </div>
      {kind === 'superlative' && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          {[...new Set(a.awards.map((w) => w.person))].map((name) => (
            <button key={name} className={`mode-tab ${person === name ? 'active' : ''}`} style={{ border: '1px solid var(--line)', fontSize: 12.5, padding: '6px 12px' }} onClick={() => setPerson(name)}>
              {name}
            </button>
          ))}
        </div>
      )}

      <motion.div
        {...rise}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, padding: '34px 0 10px' }}
      >
        <motion.div
          key={kind + person}
          initial={{ y: -26, opacity: 0, rotate: 0 }}
          animate={{ y: 0, opacity: 1, rotate: -1.4 }}
          transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div ref={cardRef} style={{ padding: 18 }}>
            {kind === 'audit' && <AuditReceipt a={a} />}
            {kind === 'superlative' && <SuperlativeReceipt a={a} person={person} />}
            {kind === 'compat' && a.compatibility && <CompatReceipt a={a} />}
            {kind === 'records' && <RecordsReceipt a={a} />}
          </div>
        </motion.div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary" onClick={download} disabled={busy}>
            {busy ? 'printing…' : saved ? 'saved ✓' : '↓ download PNG'}
          </button>
          <button className="btn" onClick={share} disabled={busy}>share…</button>
        </div>
      </motion.div>
    </div>
  )
}

// ------------------------------------------------------------ pieces
function RHead({ a, tag }: { a: Analysis; tag: string }) {
  return (
    <div className="r-center">
      <div className="r-store">RECEIPTS*</div>
      <div className="r-tag">{a.period ? a.period.toUpperCase() : tag}</div>
      <div style={{ marginTop: 10, fontWeight: 700, fontSize: 14 }}>{a.chatName.toUpperCase()}</div>
      <div className="r-small">{fmtDate(a.range.start)} — {fmtDate(a.range.end)}</div>
    </div>
  )
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className="r-row" style={bold ? { fontWeight: 800 } : undefined}>
      <span>{k}</span>
      <span className="dots">{'.'.repeat(60)}</span>
      <b>{v}</b>
    </div>
  )
}

function RFoot({ note }: { note: string }) {
  return (
    <>
      <hr className="r-hr" />
      <div className="r-barcode" />
      <div className="r-center r-small" style={{ letterSpacing: '0.14em', marginTop: 6 }}>{note}</div>
      <div className="r-center r-small" style={{ marginTop: 4 }}>generated in your browser · nothing uploaded</div>
    </>
  )
}

function AuditReceipt({ a }: { a: Analysis }) {
  return (
    <div className="receipt">
      <RHead a={a} tag={a.isGroup ? 'GROUP CHAT AUDIT' : 'PRIVATE CHAT AUDIT'} />
      <hr className="r-hr" />
      <Row k="MESSAGES" v={fmt(a.totals.messages)} />
      <Row k="WORDS" v={fmt(a.totals.words)} />
      <Row k="DAYS OF HISTORY" v={fmt(a.range.days)} />
      <Row k="LAUGHS" v={fmt(a.totals.laughs)} />
      <Row k="PHOTOS & MEDIA" v={fmt(a.totals.media)} />
      <Row k="EMOJIS" v={fmt(a.totals.emojis)} />
      <Row k="QUESTIONS ASKED" v={fmt(a.totals.questions)} />
      {a.totals.deleted > 0 && <Row k="MSGS DELETED 👀" v={fmt(a.totals.deleted)} />}
      <hr className="r-hr" />
      {a.people.slice(0, 6).map((p) => (
        <Row key={p.name} k={p.name.toUpperCase().slice(0, 14)} v={pct(p.share)} />
      ))}
      <hr className="r-hr" />
      <div className="r-row r-total">
        <span>TOTAL</span>
        <span className="dots">{'.'.repeat(40)}</span>
        <span>PRICELESS</span>
      </div>
      <RFoot note="THANK YOU FOR OVERSHARING" />
    </div>
  )
}

function SuperlativeReceipt({ a, person }: { a: Analysis; person: string }) {
  const p = a.byName.get(person) as Person
  const awards = a.awards.filter((w) => w.person === person)
  return (
    <div className="receipt">
      <RHead a={a} tag="OFFICIAL SUPERLATIVE" />
      <hr className="r-hr" />
      <div className="r-center" style={{ padding: '6px 0 2px' }}>
        <div style={{ fontSize: 44 }}>{awards[0]?.emoji ?? '🏆'}</div>
        <div style={{ fontSize: 17, fontWeight: 800, marginTop: 4 }}>{awards[0]?.title.toUpperCase() ?? 'PARTICIPANT'}</div>
        <div style={{ fontSize: 14, marginTop: 4 }}>awarded to</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{person.toUpperCase()}</div>
        <div className="r-small" style={{ marginTop: 6 }}>{awards[0]?.stat}</div>
      </div>
      <hr className="r-hr" />
      <Row k="MESSAGES" v={fmt(p.msgCount)} />
      <Row k="SHARE OF CHAT" v={pct(p.share)} />
      <Row k="MEDIAN REPLY" v={p.replyMedianMs ? fmtDuration(p.replyMedianMs) : 'N/A'} />
      <Row k="LAUGHS EARNED" v={fmt(p.laughsEarned)} />
      {p.topEmojis[0] && <Row k="SIGNATURE EMOJI" v={p.topEmojis[0][0]} />}
      {awards.slice(1, 3).map((w) => (
        <Row key={w.id} k={`ALSO: ${w.title.toUpperCase().replace('THE ', '')}`} v={w.emoji} />
      ))}
      <RFoot note="CERTIFIED BY THE DATA" />
    </div>
  )
}

function CompatReceipt({ a }: { a: Analysis }) {
  const c = a.compatibility!
  return (
    <div className="receipt">
      <RHead a={a} tag="COMPATIBILITY REPORT" />
      <hr className="r-hr" />
      <div className="r-center" style={{ padding: '4px 0' }}>
        <div style={{ fontSize: 46, fontWeight: 800, letterSpacing: '-0.02em' }}>{c.score}%</div>
        <div className="r-small" style={{ letterSpacing: '0.18em' }}>COMPATIBLE</div>
      </div>
      <hr className="r-hr" />
      {c.parts.map((part) => (
        <Row key={part.label} k={part.label.toUpperCase()} v={`${Math.round(part.score * 100)}/100`} />
      ))}
      <hr className="r-hr" />
      <div className="r-small r-center">
        {fmt(a.totals.messages)} messages · {fmt(a.range.days)} days ·{' '}
        {fmt(a.people.reduce((s, p) => s + p.hearts, 0))} hearts
      </div>
      <RFoot note="SCIENTIFICALLY UNSERIOUS" />
    </div>
  )
}

function RecordsReceipt({ a }: { a: Analysis }) {
  return (
    <div className="receipt">
      <RHead a={a} tag="HALL OF FAME" />
      <hr className="r-hr" />
      {a.records.slice(0, 7).map((r) => (
        <div key={r.id} style={{ margin: '7px 0' }}>
          <div className="r-row"><span>{r.emoji} {r.title.toUpperCase()}</span></div>
          <div className="r-row"><span className="r-small" style={{ paddingLeft: 18 }}>{r.detail.slice(0, 38)}</span><b style={{ fontSize: 12 }}>{r.value}</b></div>
        </div>
      ))}
      <RFoot note="RECORDS ARE MEANT TO BE BROKEN" />
    </div>
  )
}
