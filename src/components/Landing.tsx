import { useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { rise } from './charts'

const FLOATERS = [
  { text: 'who is up 👀', x: '6%', y: '16%', d: 0 },
  { text: '48,213 messages later…', x: '74%', y: '12%', d: 1.2 },
  { text: 'median reply: 38s ⚡', x: '80%', y: '58%', d: 2.1 },
  { text: 'someone here is a night owl 🦉', x: '4%', y: '64%', d: 0.7 },
  { text: '💀💀💀', x: '14%', y: '40%', d: 2.8 },
  { text: 'THE LURKER: exposed', x: '70%', y: '36%', d: 1.7 },
]

const MODES = [
  ['⚖️', 'The Verdict', 'the headline numbers, beautifully'],
  ['💓', 'Pulse', 'a 7×24 heatmap of when you talk'],
  ['⚡', 'Reflexes', 'who replies in seconds, who ghosts'],
  ['🗣️', 'Vocabulary', 'each person’s signature words'],
  ['🗿', 'Hieroglyphics', 'your emoji DNA, decoded'],
  ['🏆', 'Superlatives', 'awards nobody asked for'],
  ['🥇', 'Hall of Fame', 'records & all-time moments'],
  ['📖', 'The Saga', 'your chat as a story, with receipts'],
  ['🎭', 'The Cast', 'profiles & chemistry, per person'],
  ['🧾', 'Share Cards', 'print the receipt, post it'],
] as const

export function Landing({
  onFile, onDemo, busy, error,
}: {
  onFile: (f: File) => void
  onDemo: (which: 'group' | 'couple') => void
  busy: boolean
  error: string | null
}) {
  const [over, setOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) onFile(f)
  }, [onFile])

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* floating teaser bubbles */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {FLOATERS.map((f) => (
          <motion.div
            key={f.text}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: [0, 0.5, 0.5, 0], y: [16, -10, -26, -44] }}
            transition={{ duration: 11, delay: f.d, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }}
            className="mono"
            style={{
              position: 'absolute', left: f.x, top: f.y, fontSize: 12.5,
              border: '1px solid var(--line)', borderRadius: 999, padding: '7px 14px',
              background: 'color-mix(in srgb, var(--panel) 75%, transparent)', color: 'var(--muted)',
              whiteSpace: 'nowrap',
            }}
          >
            {f.text}
          </motion.div>
        ))}
      </div>

      <div className="shell" style={{ paddingTop: 'clamp(60px, 11vh, 130px)', textAlign: 'center', position: 'relative' }}>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="privacy-pill">
            <span className="dot" />
            100% private — your chat never leaves this browser
          </span>
        </motion.div>

        <motion.h1
          className="display"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.12, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ fontSize: 'clamp(52px, 9.5vw, 118px)', margin: '30px 0 0' }}
        >
          Your chat has <em>secrets.</em>
        </motion.h1>
        <motion.h1
          className="display"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.26, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ fontSize: 'clamp(52px, 9.5vw, 118px)', margin: 0 }}
        >
          Get the <em>receipts.</em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="muted"
          style={{ fontSize: 'clamp(16px, 2.2vw, 19px)', maxWidth: 640, margin: '26px auto 0' }}
        >
          Drop a WhatsApp export and watch years of your group chat — or your texts with
          one very specific person — turn into something between a documentary and a roast.
          Ten lenses. Zero uploads.
        </motion.p>

        {/* dropzone */}
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.62, duration: 0.7 }}
          style={{ maxWidth: 620, margin: '42px auto 0' }}>
          <div
            className={`dropzone ${over ? 'over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setOver(true) }}
            onDragLeave={() => setOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            role="button"
            aria-label="upload a WhatsApp chat export"
          >
            <input
              ref={inputRef}
              type="file"
              accept=".txt,.zip,text/plain,application/zip"
              hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f) }}
            />
            <div style={{ fontSize: 40 }}>{busy ? '⏳' : '🧾'}</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginTop: 8 }}>
              {busy ? 'Reading your chat…' : 'Drop your WhatsApp export here'}
            </div>
            <div className="muted" style={{ fontSize: 14, marginTop: 5 }}>
              .txt or .zip — or click to browse
            </div>
          </div>
          {error && (
            <div style={{ marginTop: 14, color: 'var(--coral)', fontSize: 14, fontWeight: 600 }}>{error}</div>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => onDemo('group')}>👀 Demo: a group chat</button>
            <button className="btn" onClick={() => onDemo('couple')}>💌 Demo: a couple</button>
          </div>
        </motion.div>

        {/* how to export */}
        <motion.details {...rise} style={{ maxWidth: 620, margin: '26px auto 0', textAlign: 'left' }}>
          <summary style={{ cursor: 'pointer', color: 'var(--muted)', fontSize: 14, textAlign: 'center', listStyle: 'none' }}>
            How do I export a chat from WhatsApp? ↓
          </summary>
          <div className="panel" style={{ marginTop: 14, fontSize: 14.5, lineHeight: 1.8 }}>
            <b>On your phone:</b> open the chat → tap the name at the top →
            scroll down → <b>Export Chat</b> → choose <b>Without Media</b> →
            save / AirDrop / email the file to yourself → drop it here.
            <div className="muted" style={{ marginTop: 8, fontSize: 13.5 }}>
              Works with iPhone and Android exports, any date format, groups or 1-on-1.
              “Without media” keeps the file small — we still count every photo and voice note.
            </div>
          </div>
        </motion.details>
      </div>

      {/* privacy statement */}
      <div className="shell" style={{ marginTop: 110 }}>
        <motion.div {...rise} className="panel panel-pad-lg" style={{ textAlign: 'center', background: 'var(--grad-soft)' }}>
          <div style={{ fontSize: 34 }}>🔒</div>
          <h2 className="display" style={{ fontSize: 'clamp(26px, 4vw, 40px)', marginTop: 8 }}>
            Nothing is uploaded. <em>Ever.</em>
          </h2>
          <p className="muted" style={{ maxWidth: 660, margin: '14px auto 0', fontSize: 15.5 }}>
            Every byte of analysis happens in your browser, on your device. There is no server,
            no account, no analytics on your messages, no “anonymized” anything. Close the tab
            and it’s gone. That’s the entire point — these are your private conversations,
            and they should stay that way. Don’t take our word for it: open DevTools,
            watch the network tab, drop a chat. Silence.
          </p>
        </motion.div>
      </div>

      {/* modes grid */}
      <div className="shell" style={{ marginTop: 96 }}>
        <motion.div {...rise} style={{ textAlign: 'center', marginBottom: 30 }}>
          <h2 className="display" style={{ fontSize: 'clamp(30px, 4.6vw, 48px)' }}>
            Ten lenses. <em>One chat.</em>
          </h2>
          <p className="muted" style={{ marginTop: 10 }}>There’s always another thing to discover.</p>
        </motion.div>
        <div className="grid grid-2" style={{ gap: 12 }}>
          {MODES.map(([emoji, title, sub], i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
              className="panel"
              style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px' }}
            >
              <span style={{ fontSize: 26 }}>{emoji}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 20 }}>{title}</div>
                <div className="muted" style={{ fontSize: 13.5 }}>{sub}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="shell foot" style={{ textAlign: 'center' }}>
        <span className="mono">receipts</span> — the new ConvoAnalyzer · free · private · in your browser ·
        no chats were uploaded in the making of this product
      </div>
    </div>
  )
}
