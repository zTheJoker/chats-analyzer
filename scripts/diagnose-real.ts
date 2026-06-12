// Diagnose parsing quality on real exports. Prints ONLY metadata and
// aggregate stats — never message bodies.
import { readFileSync } from 'node:fs'
import { unzipSync } from 'fflate'
import { parseChat } from '../src/lib/parser'
import { analyze } from '../src/lib/analyze'

const ART_RE = /omit|attach|media|deleted|edited|image|video|audio|sticker|<|>|null/i

for (const path of process.argv.slice(2)) {
  console.log(`\n=== ${path.split('/').pop()} ===`)
  let text: string
  if (path.endsWith('.zip')) {
    const entries = unzipSync(new Uint8Array(readFileSync(path)), { filter: (f) => /\.txt$/i.test(f.name) })
    const names = Object.keys(entries).sort((a, b) => entries[b].length - entries[a].length)
    console.log('zip entries (.txt):', names.join(', '))
    text = new TextDecoder('utf-8').decode(entries[names[0]])
  } else {
    text = readFileSync(path, 'utf8')
  }
  // raw-line sniff: first timestamped line shape (timestamp only, no content)
  const firstLine = text.split('\n').find((l) => /\d{1,4}[./-]\d{1,2}[./-]\d{1,4}/.test(l)) ?? ''
  console.log('first line shape:', JSON.stringify(firstLine.replace(/\] .*$/, '] <…>').replace(/ - .*$/, ' - <…>').slice(0, 60)))
  try {
    const parsed = parseChat(text, path.split('/').pop())
    const a = analyze(parsed)
    console.log('format:', parsed.format, '| group:', parsed.isGroup, '| chatName:', parsed.chatName)
    console.log('participants:', parsed.participants.join(' | '))
    console.log('messages:', parsed.messages.length, '| system:', parsed.systemEvents.length, '| media:', a.totals.media, '| deleted:', a.totals.deleted, '| edited:', a.totals.edited, '| calls:', a.totals.calls)
    console.log('range:', new Date(a.range.start).toString().slice(0, 21), '→', new Date(a.range.end).toString().slice(0, 21))
    console.log('busiest day:', a.busiest.dayKey, `(${a.busiest.dayCount})`, '| peak hour:', a.busiest.hour)
    // word-leak check: artifact-looking tokens in top words
    const allTop = a.people.flatMap((p) => p.topWords.slice(0, 12).map(([w]) => w))
    const leaks = [...new Set(allTop.filter((w) => ART_RE.test(w)))]
    console.log('top-word artifacts:', leaks.length ? leaks.join(', ') : 'none ✓')
    // how many text messages still look like placeholders?
    const suspicious = parsed.messages.filter((m) => m.kind === 'text' && /omitted|attached|<media|file attached|tape back|deze berichten|left|joined/i.test(m.text) && m.text.length < 60)
    console.log('suspicious placeholder-ish text msgs:', suspicious.length)
    if (suspicious.length) {
      const shapes = [...new Set(suspicious.slice(0, 40).map((m) => m.text.replace(/[A-Za-z0-9-]+\.(jpg|jpeg|png|mp4|opus|webp|pdf|vcf)/gi, '<FILE>')))].slice(0, 8)
      console.log('  shapes:', JSON.stringify(shapes))
    }
    console.log('top emojis:', a.topEmojis.slice(0, 8).map(([e, n]) => `${e}×${n}`).join(' '))
    console.log('awards:', a.awards.slice(0, 6).map((w) => `${w.emoji}${w.title}→${w.person}`).join(' | '))
  } catch (e) {
    console.log('PARSE FAILED:', e instanceof Error ? e.message : e)
  }
}
