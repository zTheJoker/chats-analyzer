// End-to-end check: parse every sample export + a tricky fixture, run the full
// analysis, print key numbers. Run with: npm run test:parse
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseChat } from '../src/lib/parser'
import { analyze } from '../src/lib/analyze'
import { scoreText } from '../src/lib/sentiment'
import { extractEmojis } from '../src/lib/text'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
let failures = 0
const check = (label: string, cond: boolean, extra = '') => {
  console.log(`  ${cond ? '✓' : '✗ FAIL'} ${label}${extra ? ` — ${extra}` : ''}`)
  if (!cond) failures++
}

function run(label: string, raw: string, fileName?: string) {
  console.log(`\n=== ${label} ===`)
  const parsed = parseChat(raw, fileName)
  console.log(`  format=${parsed.format} group=${parsed.isGroup} name="${parsed.chatName}"`)
  console.log(`  participants: ${parsed.participants.join(', ')}`)
  console.log(`  messages: ${parsed.messages.length}, system: ${parsed.systemEvents.length}`)
  const a = analyze(parsed)
  console.log(`  totals: words=${a.totals.words} media=${a.totals.media} emojis=${a.totals.emojis} laughs=${a.totals.laughs} sessions=${a.totals.sessions}`)
  console.log(`  range: ${a.range.days} days, busiest day ${a.busiest.dayKey} (${a.busiest.dayCount}), streak ${a.streak.len}d`)
  console.log(`  awards: ${a.awards.map((w) => `${w.emoji}${w.title}→${w.person}`).join(' | ')}`)
  if (a.silence) console.log(`  silence: ${(a.silence.ms / 86400e3).toFixed(1)}d broken by ${a.silence.breaker?.sender}: "${a.silence.breaker?.text.slice(0, 60)}"`)
  if (a.fastestReply) console.log(`  fastest reply: ${a.fastestReply.ms / 1000}s ${a.fastestReply.reply.sender} ← ${a.fastestReply.prev.sender}`)
  if (a.compatibility) console.log(`  compatibility: ${a.compatibility.score}% [${a.compatibility.parts.map((p) => `${p.label}:${Math.round(p.score * 100)}`).join(' ')}]`)
  console.log(`  headline: ${a.headline}`)
  return { parsed, a }
}

// 1. group (Android, DD/MM)
{
  const { parsed, a } = run('group.txt (Android DMY)', readFileSync(join(ROOT, 'public/samples/group.txt'), 'utf8'))
  check('5 participants', parsed.participants.length === 5)
  check('detected as group', parsed.isGroup)
  check('chat name from rename', parsed.chatName === 'the boys 🐐', parsed.chatName)
  check('>10k messages', parsed.messages.length > 10000, String(parsed.messages.length))
  check('format ios? no — android/DMY', parsed.format === 'android/DMY', parsed.format)
  check('long silence found (8–30d)', !!a.silence && a.silence.ms > 8 * 86400e3 && a.silence.ms < 30 * 86400e3)
  check('silence broken by Shloimy', a.silence?.breaker?.sender === 'Shloimy')
  check('media counted', a.totals.media > 100, String(a.totals.media))
  check('multi-line preserved', parsed.messages.some((m) => m.text.includes('\n')))
  check('edited counted', a.totals.edited > 0, String(a.totals.edited))
  check('deleted counted', a.totals.deleted > 0, String(a.totals.deleted))
  check('matrix exists', !!a.matrix)
  check('awards ≥ 8', a.awards.length >= 8, String(a.awards.length))
  const gBottom2 = [...a.monthly].filter((m) => m.total >= 20).sort((x, y) => x.vibe - y.vibe).slice(0, 2).map((m) => m.key)
  check('vibe engine ranks the silence month (2024-08) bottom-2', gBottom2.includes('2024-08'), gBottom2.join(','))
  check('night owl is Yanky', a.awards.find((w) => w.id === 'night-owl')?.person === 'Yanky')
  check('sniper is Ari', a.awards.find((w) => w.id === 'sniper')?.person === 'Ari')
  check('novelist is Moshe', a.awards.find((w) => w.id === 'novelist')?.person === 'Moshe')
  check('lurker is Shloimy', a.awards.find((w) => w.id === 'lurker')?.person === 'Shloimy')
}

// 2. couple (iOS, DD/MM, with seconds + LRM marks)
{
  const { parsed, a } = run('couple.txt (iOS DMY)', readFileSync(join(ROOT, 'public/samples/couple.txt'), 'utf8'))
  check('2 participants', parsed.participants.length === 2)
  check('not a group', !parsed.isGroup)
  check('format ios/DMY', parsed.format === 'ios/DMY', parsed.format)
  check('media kinds parsed (image omitted)', a.totals.media > 50, String(a.totals.media))
  check('compatibility computed', !!a.compatibility)
  check('love messages found', a.people.reduce((s, p) => s + p.loveMsgs, 0) > 100)
  check('fight silence found', !!a.silence)
  check('vibe engine finds the fight (worst month = 2025-10)', a.vibeRange.worst?.key === '2025-10', a.vibeRange.worst?.key)
}

// 3. US format (M/D/YY, 12h AM/PM)
{
  const { parsed } = run('us-format.txt (Android MDY 12h)', readFileSync(join(ROOT, 'public/samples/us-format.txt'), 'utf8'))
  check('format android/MDY', parsed.format === 'android/MDY', parsed.format)
  check('140 messages', parsed.messages.length === 140, String(parsed.messages.length))
  const first = parsed.messages[0]
  check('AM/PM parsed (first msg at 9:15)', new Date(first.ts).getHours() === 9)
  const pm = parsed.messages.find((m) => new Date(m.ts).getHours() >= 13)
  check('PM hours exist', !!pm)
}

// 4. hand-built tricky fixture
{
  const fixture = [
    '‎[12/03/2024, 11:45:02 PM] ‎Messages and calls are end-to-end encrypted.',
    '[12/03/2024, 11:46:10 PM] Ruti: hey are you up?',
    '[12/03/2024, 11:46:30 PM] Dov: yes lol',
    '[13/03/2024, 12:01:00 AM] Ruti: ok so',
    'line two of the same message',
    'line three: with a colon inside',
    '[13/03/2024, 12:02:11 AM] Dov: ‎image omitted',
    '[13/03/2024, 9:15:00 AM] Ruti: This message was deleted',
    '[14/03/2024, 10:00:00 AM] Dov: see you at 5: sharp',
  ].join('\n')
  const { parsed } = run('tricky fixture (iOS 12h + multiline + LRM)', fixture)
  check('6 messages', parsed.messages.length === 6, String(parsed.messages.length))
  const multi = parsed.messages.find((m) => m.text.startsWith('ok so'))
  check('multiline glued (3 lines)', !!multi && multi.text.split('\n').length === 3, JSON.stringify(multi?.text))
  check('12h PM → 23h', new Date(parsed.messages[0].ts).getHours() === 23)
  check('12:01 AM → 0h', !!multi && new Date(multi.ts).getHours() === 0)
  check('image omitted → media/photo', parsed.messages.some((m) => m.kind === 'media' && m.mediaType === 'photo'))
  check('deleted detected', parsed.messages.some((m) => m.kind === 'deleted'))
  check('colon in text kept', parsed.messages.some((m) => m.text === 'see you at 5: sharp'))
  check('day-first detected from 13/03', parsed.format.endsWith('DMY'), parsed.format)
}

// 4b. real-world iOS patterns: captions, sender-form system lines, doc files
{
  const fixture = [
    '[8/11/23, 5:56:32 PM] Mommy: ‎Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.',
    '[8/11/23, 8:42:52 PM] Eli: 46.5 ‎image omitted',
    '[8/16/23, 2:55:18 PM] Mommy: פרק 16.docx • ‎1 page ‎document omitted',
    '[8/17/23, 9:01:00 AM] Eli: ‎video note omitted',
    '[8/17/23, 9:02:00 AM] Mommy: ‎You created group “Family”',
    '[8/17/23, 9:03:00 AM] Eli: look at this beauty 😍 ‎image omitted',
    '[8/17/23, 9:05:00 AM] Mommy: normal message about an image I saw',
  ].join('\n')
  const { parsed, a } = run('iOS captions + sender-form system', fixture)
  check('encryption notice → system, not a message', parsed.messages.every((m) => !m.text.includes('end-to-end')) && parsed.systemEvents.length === 2)
  check('"created group" with sender → system', parsed.systemEvents.some((s) => s.text.includes('created group')))
  check('caption media: kind=media, caption kept', parsed.messages.some((m) => m.kind === 'media' && m.text === '46.5'))
  check('caption with emoji kept', parsed.messages.some((m) => m.kind === 'media' && m.text.includes('beauty')))
  check('doc file line → media/document, filename dropped', parsed.messages.some((m) => m.kind === 'media' && m.mediaType === 'document' && m.text === ''))
  check('video note → media/video', parsed.messages.some((m) => m.mediaType === 'video'))
  check('normal msg with word "image" stays text', parsed.messages.some((m) => m.kind === 'text' && m.text.startsWith('normal message')))
  check('no artifact words in stats', ![...a.people.flatMap((p) => p.topWords.map(([w]) => w))].includes('omitted'))
}

// 4c. multilingual: Spanish / Portuguese / German / Hebrew
{
  const fixture = [
    '12/3/24, 21:30 - Ana: <Multimedia omitido>',
    '12/3/24, 21:31 - Luis: jajaja no puede ser',
    '12/3/24, 21:32 - Ana: te quiero ❤️',
    '12/3/24, 21:33 - Luis: Se eliminó este mensaje',
    '13/3/24, 09:10 - Ana: kkkk demais',
    '13/3/24, 09:12 - Luis: <Mídia omitida>',
    '13/3/24, 10:00 - Ana: Bild weggelassen',
    '13/3/24, 10:05 - Luis: das ist sehr gut, danke!',
    '13/3/24, 11:00 - Ana: חחחח איזה קטע',
    '13/3/24, 11:01 - Luis: <מדיה הושמטה>',
    '14/3/24, 12:00 - Ana: mdr c\'est trop drôle',
    '14/3/24, 12:01 - Luis: wkwkwk iya betul',
  ].join('\n')
  const { a } = run('multilingual fixture', fixture)
  check('placeholders → media (3 angle-bracket + 1 iOS German)', a.totals.media === 4, String(a.totals.media))
  check('iOS German "Bild weggelassen" → media', a.totals.media >= 3 && !a.people.some((p) => p.topWords.some(([w]) => w === 'weggelassen')))
  check('Spanish deleted detected', a.totals.deleted === 1)
  check('multilingual laughs (jaja/kkkk/חחח/mdr/wkwk)', a.totals.laughs >= 5, String(a.totals.laughs))
  check('Spanish love detected', a.people.reduce((s, p) => s + p.loveMsgs, 0) >= 1)
  check('Spanish stopwords filtered ("no/ser" not top words)', !a.people.flatMap((p) => p.topWords.map(([w]) => w)).some((w) => ['no', 'ser', 'das', 'ist'].includes(w)))
}

// 4d. local-time date keys (the UTC off-by-one bug)
{
  const { tsOfKey } = await import('../src/lib/format')
  const ts = tsOfKey('2024-08-10')
  const d = new Date(ts)
  check('tsOfKey gives LOCAL Aug 10, not UTC-shifted', d.getDate() === 10 && d.getMonth() === 7 && d.getHours() === 0)
}

// 5. sentiment engine
{
  console.log('\n=== sentiment & emoji normalization ===')
  check('positive: "i love this so much"', scoreText('i love this so much') > 2, String(scoreText('i love this so much')))
  check('negative: "this is terrible"', scoreText('this is terrible') < 0)
  check('negation flips: "not good"', scoreText('not good') < 0, String(scoreText('not good')))
  check('negation flips: "never been happy"', scoreText('never been happy') < 0)
  check('booster amplifies: "really amazing" > "amazing"', scoreText('really amazing') > scoreText('amazing'))
  check('emoji valence: "💔" negative', scoreText('💔') < 0)
  check('emoji valence: "🥰🥰" positive', scoreText('🥰🥰') > 2)
  check('laugh bonus: "hahaha" positive', scoreText('hahaha ok') > 0)
  check('slang: "that was mid, kinda trash"', scoreText('that was mid, kinda trash') < 0)
  check('neutral stays ~0: "see you at 5"', Math.abs(scoreText('see you at 5')) < 0.5)
  check('skin tones merge: 👍🏽 + 👍 same key', extractEmojis('👍🏽👍')[0] === extractEmojis('👍🏽👍')[1])
  check('ZWJ sequence survives', extractEmojis('👨‍👩‍👧').length === 1, JSON.stringify(extractEmojis('👨‍👩‍👧')))
}

// 6. v2 analysis fields
{
  console.log('\n=== v2 analysis fields (group.txt) ===')
  const parsed = parseChat(readFileSync(join(ROOT, 'public/samples/group.txt'), 'utf8'))
  const a = analyze(parsed)
  check('adaptive session gap in [30m, 2h]', a.sessionGapMs >= 30 * 60e3 && a.sessionGapMs <= 2 * 3600e3, `${Math.round(a.sessionGapMs / 60e3)}m`)
  check('topSessions: 5 marathons', a.topSessions.length === 5)
  check('marathon has first messages', a.topSessions[0].firstMsgs.length > 0)
  check('marathons sorted desc', a.topSessions[0].count >= a.topSessions[4].count)
  check('daily calendar data', a.daily.length > 300, String(a.daily.length))
  check('daily sorted', a.daily[0].key < a.daily[a.daily.length - 1].key)
  check('thumb time plausible (40–200h)', a.thumbTimeMs > 40 * 3600e3 && a.thumbTimeMs < 200 * 3600e3, `${Math.round(a.thumbTimeMs / 3600e3)}h`)
  check('per-person heatmap sums to msgCount', a.people[0].heatmap.flat().reduce((s, x) => s + x, 0) === a.people[0].msgCount)
  check('marathon record exists', a.records.some((r) => r.id === 'marathon'))
  // year filter simulation (what App does for "2024 wrapped")
  const msgs24 = parsed.messages.filter((m) => new Date(m.ts).getFullYear() === 2024)
  const present = new Set(msgs24.map((m) => m.sender))
  const a24 = analyze({ ...parsed, messages: msgs24, systemEvents: [], participants: parsed.participants.filter((p) => present.has(p)) })
  check('2024 wrapped: all messages in 2024', a24.totals.messages === msgs24.length && msgs24.length > 1000)
  check('2024 wrapped: range within year', new Date(a24.range.start).getFullYear() === 2024 && new Date(a24.range.end).getFullYear() === 2024)
  check('2024 wrapped: awards regenerate', a24.awards.length >= 6, String(a24.awards.length))
}

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECKS FAILED`)
process.exit(failures === 0 ? 0 : 1)
