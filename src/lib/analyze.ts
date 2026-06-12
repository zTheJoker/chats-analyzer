// The analysis engine. Takes a ParseResult, returns every insight the UI shows.
// Pure computation, no DOM, no network.
import type { Msg, ParseResult } from './parser'
import {
  extractEmojis, isLaugh, tokenizeWords, STOPWORDS, SWEARS, countLinks,
  LOVE_RE, HEART_RE, ARTIFACT_WORDS,
} from './text'
import { scoreText } from './sentiment'
import { dateKey, monthKey, tsOfKey, fmtDuration, fmtDurationLong, fmtDate, fmtHour, DOW_FULL, PALETTE, pct, fmt } from './format'

export interface Person {
  name: string
  color: string
  msgCount: number
  wordCount: number
  charCount: number
  mediaCount: number
  mediaTypes: Record<string, number>
  emojiCount: number
  topEmojis: [string, number][]
  topWords: [string, number][]
  distinctive: { word: string; score: number }[]
  avgLen: number
  questions: number
  capsCount: number
  swears: number
  links: number
  laughsSent: number
  laughsEarned: number
  starts: number
  enders: number
  replyMedianMs: number | null
  replies: number
  doubleTexts: number
  hourHist: number[]
  dowHist: number[]
  heatmap: number[][]
  nightShare: number
  chronotype: 'night owl' | 'early bird' | 'day texter'
  monthly: Map<string, number>
  loveMsgs: number
  hearts: number
  unansweredQs: number
  longestMsg: { text: string; ts: number } | null
  maxMonologue: number
  deleted: number
  share: number
}

export interface Award {
  id: string
  emoji: string
  title: string
  person: string
  stat: string
  flavor: string
}

export interface RecordCard {
  id: string
  emoji: string
  title: string
  value: string
  detail: string
  msg?: Msg
}

export interface Milestone {
  ts: number
  emoji: string
  title: string
  detail: string
  quote?: { sender: string; text: string }
  kind: 'origin' | 'count' | 'peak' | 'silence' | 'event' | 'now'
}

export interface ReplyPair { prev: Msg; reply: Msg; ms: number }

export interface SessionInfo {
  start: number
  end: number
  count: number
  durMs: number
  lead: string
  leadCount: number
  firstMsgs: Msg[]
}

export interface MonthRow {
  key: string
  total: number
  perPerson: Record<string, number>
  vibe: number
  topEmoji: string | null
}

export interface Analysis {
  isGroup: boolean
  chatName: string
  people: Person[]
  byName: Map<string, Person>
  totals: {
    messages: number; words: number; chars: number; media: number; emojis: number
    laughs: number; questions: number; links: number; deleted: number; edited: number
    calls: number; sessions: number
  }
  range: { start: number; end: number; days: number; activeDays: number }
  heatmap: number[][]
  hourHist: number[]
  dowHist: number[]
  monthly: MonthRow[]
  busiest: { dayKey: string; dayCount: number; hour: number; dow: number; monthKey: string }
  streak: { len: number; start: string; end: string; current: number }
  silence: { ms: number; start: number; end: number; breaker: Msg | null } | null
  fastestReply: ReplyPair | null
  slowestReply: ReplyPair | null
  replyBuckets: { label: string; count: number }[]
  topEmojis: [string, number][]
  emojiTotalDistinct: number
  records: RecordCard[]
  awards: Award[]
  milestones: Milestone[]
  matrix: { names: string[]; counts: number[][] } | null
  compatibility: { score: number; parts: { label: string; score: number; note: string }[] } | null
  headline: string
  firstMessage: Msg
  burst: { count: number; start: number; minutes: number } | null
  vibeRange: { best: MonthRow | null; worst: MonthRow | null }
  daily: { key: string; count: number }[]
  topSessions: SessionInfo[]
  avgSessionMsgs: number
  sessionGapMs: number
  thumbTimeMs: number
  period?: string
}

const DOUBLE_TEXT_GAP = 10 * 60 * 1000
const MAX_REPLY = 24 * 60 * 60 * 1000

const median = (xs: number[]): number | null => {
  if (xs.length === 0) return null
  const s = [...xs].sort((a, b) => a - b)
  const mid = s.length >> 1
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

const topOfMap = (m: Map<string, number>, n: number): [string, number][] =>
  [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n)

const inc = (m: Map<string, number>, k: string, by = 1) => m.set(k, (m.get(k) ?? 0) + by)

export function analyze(parsed: ParseResult): Analysis {
  const { messages, participants, isGroup, chatName, systemEvents } = parsed
  const N = messages.length

  // ---- per-person scaffolding
  const people = new Map<string, Person>()
  participants.forEach((name, i) => {
    people.set(name, {
      name, color: PALETTE[i % PALETTE.length],
      msgCount: 0, wordCount: 0, charCount: 0, mediaCount: 0, mediaTypes: {},
      emojiCount: 0, topEmojis: [], topWords: [], distinctive: [], avgLen: 0,
      questions: 0, capsCount: 0, swears: 0, links: 0, laughsSent: 0, laughsEarned: 0,
      starts: 0, enders: 0, replyMedianMs: null, replies: 0, doubleTexts: 0,
      hourHist: new Array(24).fill(0), dowHist: new Array(7).fill(0),
      heatmap: Array.from({ length: 7 }, () => new Array(24).fill(0)),
      nightShare: 0, chronotype: 'day texter', monthly: new Map(),
      loveMsgs: 0, hearts: 0, unansweredQs: 0, longestMsg: null, maxMonologue: 0,
      deleted: 0, share: 0,
    })
  })
  const P = (name: string) => people.get(name)!

  const emojiByPerson = new Map<string, Map<string, number>>()
  const wordsByPerson = new Map<string, Map<string, number>>()
  participants.forEach((p) => { emojiByPerson.set(p, new Map()); wordsByPerson.set(p, new Map()) })
  const emojiAll = new Map<string, number>()
  const wordAll = new Map<string, number>()
  const emojiByMonth = new Map<string, Map<string, number>>()

  const heatmap: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0))
  const hourHist = new Array(24).fill(0)
  const dowHist = new Array(7).fill(0)
  const daily = new Map<string, number>()
  const monthlyTotal = new Map<string, number>()
  const monthlyPerPerson = new Map<string, Map<string, number>>()
  const monthlyVibe = new Map<string, { v: number; n: number }>()
  const monthlyLove = new Map<string, number>()

  const totals = {
    messages: N, words: 0, chars: 0, media: 0, emojis: 0, laughs: 0,
    questions: 0, links: 0, deleted: 0, edited: 0, calls: 0, sessions: 0,
  }

  const replyTimes = new Map<string, number[]>()
  participants.forEach((p) => replyTimes.set(p, []))
  let fastestReply: ReplyPair | null = null
  let slowestReply: ReplyPair | null = null
  const replyBucketDefs: [string, number][] = [
    ['< 1 min', 60e3], ['1–5 min', 300e3], ['5–15 min', 900e3], ['15–60 min', 3600e3],
    ['1–6 hrs', 6 * 3600e3], ['6–24 hrs', 24 * 3600e3],
  ]
  const replyBuckets = replyBucketDefs.map(([label]) => ({ label, count: 0 }))
  let overnightReplies = 0

  let matrixCounts: number[][] | null = null
  const matrixNames = participants.slice(0, 8)
  if (isGroup) matrixCounts = matrixNames.map(() => new Array(matrixNames.length).fill(0))
  const mIdx = new Map(matrixNames.map((n, i) => [n, i]))

  // bursts: most messages in a rolling 10-minute window
  let burst: Analysis['burst'] = null
  let burstLo = 0

  let monologueRun = 0
  let pendingQuestion: Msg | null = null
  let maxEmojiMsg: { msg: Msg; count: number } | null = null
  let latestNight: { msg: Msg; score: number } | null = null

  let prev: Msg | null = null
  let sessionStartIdx = 0

  // adaptive session boundary: scale with this chat's own rhythm so a
  // hyperactive group and a twice-a-day couple both segment sensibly
  let sessionGapMs = 60 * 60 * 1000
  if (N > 50) {
    const gaps: number[] = []
    for (let i = 1; i < N; i++) gaps.push(messages[i].ts - messages[i - 1].ts)
    gaps.sort((a, b) => a - b)
    const p75 = gaps[Math.floor(gaps.length * 0.75)]
    sessionGapMs = Math.min(2 * 3600e3, Math.max(30 * 60e3, p75 * 6))
  }

  const sessions: { firstIdx: number; lastIdx: number }[] = []
  const closeSession = (lastIdx: number) => {
    sessions.push({ firstIdx: sessionStartIdx, lastIdx })
  }

  for (let i = 0; i < N; i++) {
    const m = messages[i]
    const p = P(m.sender)
    const d = new Date(m.ts)
    const hour = d.getHours()
    const dow = d.getDay()
    const dk = dateKey(m.ts)
    const mk = monthKey(m.ts)

    p.msgCount++
    p.hourHist[hour]++
    p.dowHist[dow]++
    p.heatmap[dow][hour]++
    inc(p.monthly, mk)
    heatmap[dow][hour]++
    hourHist[hour]++
    dowHist[dow]++
    inc(daily, dk)
    inc(monthlyTotal, mk)
    if (!monthlyPerPerson.has(mk)) monthlyPerPerson.set(mk, new Map())
    inc(monthlyPerPerson.get(mk)!, m.sender)

    if (m.edited) totals.edited++
    if (m.kind === 'deleted') { totals.deleted++; p.deleted++ }
    if (m.kind === 'call') totals.calls++
    if (m.kind === 'media') {
      totals.media++; p.mediaCount++
      const mt = m.mediaType ?? 'media'
      p.mediaTypes[mt] = (p.mediaTypes[mt] ?? 0) + 1
    }

    // captions on media count as real words too
    if ((m.kind === 'text' || m.kind === 'media') && m.text) {
      const text = m.text
      p.charCount += text.length
      totals.chars += text.length
      if (!p.longestMsg || text.length > p.longestMsg.text.length) {
        p.longestMsg = { text, ts: m.ts }
      }

      const words = tokenizeWords(text)
      p.wordCount += words.length
      totals.words += words.length
      const wm = wordsByPerson.get(m.sender)!
      for (const w of words) {
        if (!STOPWORDS.has(w) && !ARTIFACT_WORDS.has(w)) { inc(wm, w); inc(wordAll, w) }
        if (SWEARS.has(w)) p.swears++
      }

      const emojis = extractEmojis(text)
      p.emojiCount += emojis.length
      totals.emojis += emojis.length
      const em = emojiByPerson.get(m.sender)!
      if (!emojiByMonth.has(mk)) emojiByMonth.set(mk, new Map())
      const emm = emojiByMonth.get(mk)!
      for (const e of emojis) { inc(em, e); inc(emojiAll, e); inc(emm, e) }
      if (emojis.length > 0 && (!maxEmojiMsg || emojis.length > maxEmojiMsg.count)) {
        maxEmojiMsg = { msg: m, count: emojis.length }
      }

      if (text.includes('?')) { p.questions++; totals.questions++ }
      const letters = text.replace(/[^a-zA-Z]/g, '')
      if (letters.length >= 6 && letters === letters.toUpperCase()) p.capsCount++
      const links = countLinks(text)
      p.links += links
      totals.links += links

      if (isLaugh(text)) {
        totals.laughs++
        p.laughsSent++
        // credit the laugh to the most recent other sender (within 3 msgs / 10 min)
        for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
          const cand = messages[j]
          if (m.ts - cand.ts > 10 * 60e3) break
          if (cand.sender !== m.sender) { P(cand.sender).laughsEarned++; break }
        }
      }

      const isLove = LOVE_RE.test(text)
      const isHeart = HEART_RE.test(text)
      if (isLove) p.loveMsgs++
      if (isHeart) p.hearts++
      if (isLove || isHeart) inc(monthlyLove, mk)

      const v = scoreText(text)
      if (v !== 0) {
        const mv = monthlyVibe.get(mk) ?? { v: 0, n: 0 }
        mv.v += v; mv.n++
        monthlyVibe.set(mk, mv)
      }
    }

    // night-ness score: 23:00→04:59 counts, weighted toward 3am
    if (hour >= 23 || hour < 5) {
      const score = hour >= 23 ? hour - 22 : hour + 2 // 1..6, peak ~4am
      if (!latestNight || score > latestNight.score) latestNight = { msg: m, score }
    }

    // session logic
    if (prev) {
      const gap = m.ts - prev.ts
      if (gap > sessionGapMs) {
        P(prev.sender).enders++
        p.starts++
        totals.sessions++
        closeSession(i - 1)
        sessionStartIdx = i
        if (pendingQuestion) { P(pendingQuestion.sender).unansweredQs++; pendingQuestion = null }
        monologueRun = 1
      } else {
        if (m.sender !== prev.sender) {
          // a reply
          const ms = gap
          if (ms < MAX_REPLY) {
            replyTimes.get(m.sender)!.push(ms)
            p.replies++
            if (!fastestReply || ms < fastestReply.ms) {
              if (prev.kind === 'text' && m.kind === 'text') fastestReply = { prev, reply: m, ms }
            }
            if ((!slowestReply || ms > slowestReply.ms) && ms > 3600e3) {
              if (prev.kind === 'text' && m.kind === 'text') slowestReply = { prev, reply: m, ms }
            }
            for (let b = 0; b < replyBucketDefs.length; b++) {
              if (ms <= replyBucketDefs[b][1]) { replyBuckets[b].count++; break }
            }
            const ph = new Date(prev.ts).getHours()
            if (ph >= 23 || ph < 4) overnightReplies++
          }
          if (matrixCounts && mIdx.has(m.sender) && mIdx.has(prev.sender) && gap < 15 * 60e3) {
            matrixCounts[mIdx.get(m.sender)!][mIdx.get(prev.sender)!]++
          }
          if (pendingQuestion && pendingQuestion.sender !== m.sender) pendingQuestion = null
          monologueRun = 1
        } else {
          if (gap > DOUBLE_TEXT_GAP) p.doubleTexts++
          monologueRun++
          if (monologueRun > p.maxMonologue) p.maxMonologue = monologueRun
        }
      }
    } else {
      p.starts++
      totals.sessions++
      monologueRun = 1
    }
    if (m.kind === 'text' && m.text.trim().endsWith('?')) pendingQuestion = m
    else if (m.kind === 'text' && m.sender !== pendingQuestion?.sender) pendingQuestion = null

    // rolling burst window
    while (messages[burstLo].ts < m.ts - 10 * 60e3) burstLo++
    const windowCount = i - burstLo + 1
    if (!burst || windowCount > burst.count) {
      burst = { count: windowCount, start: messages[burstLo].ts, minutes: 10 }
    }

    prev = m
  }
  if (prev) { P(prev.sender).enders++; closeSession(N - 1) }
  if (pendingQuestion) P(pendingQuestion.sender).unansweredQs++

  // session digests: the marathons
  const sessionInfos: SessionInfo[] = sessions.map(({ firstIdx, lastIdx }) => {
    const slice = messages.slice(firstIdx, lastIdx + 1)
    const per = new Map<string, number>()
    for (const m of slice) inc(per, m.sender)
    const [lead, leadCount] = topOfMap(per, 1)[0] ?? ['', 0]
    return {
      start: slice[0].ts,
      end: slice[slice.length - 1].ts,
      count: slice.length,
      durMs: slice[slice.length - 1].ts - slice[0].ts,
      lead, leadCount,
      firstMsgs: slice.filter((m) => m.kind === 'text' && m.text.length > 0).slice(0, 2),
    }
  })
  const topSessions = [...sessionInfos].sort((a, b) => b.count - a.count).slice(0, 5)
  const avgSessionMsgs = sessionInfos.length ? N / sessionInfos.length : N
  // thumb-time: ~190 chars/min typing + ~4s handling per message
  const thumbTimeMs = (totals.chars / 190) * 60e3 + N * 4e3

  // ---- finalize people
  const start = messages[0].ts
  const end = messages[N - 1].ts
  const days = Math.max(1, Math.round((end - start) / 86400e3) + 1)

  for (const p of people.values()) {
    p.share = p.msgCount / N
    p.avgLen = p.msgCount ? p.charCount / Math.max(1, p.msgCount - p.mediaCount - p.deleted) : 0
    p.topEmojis = topOfMap(emojiByPerson.get(p.name)!, 8)
    p.topWords = topOfMap(wordsByPerson.get(p.name)!, 12)
    p.replyMedianMs = median(replyTimes.get(p.name)!)
    const night = p.hourHist.slice(0, 5).reduce((a, b) => a + b, 0) + p.hourHist[23]
    const morning = p.hourHist.slice(5, 10).reduce((a, b) => a + b, 0)
    p.nightShare = p.msgCount ? night / p.msgCount : 0
    const morningShare = p.msgCount ? morning / p.msgCount : 0
    p.chronotype = p.nightShare > 0.18 ? 'night owl' : morningShare > 0.22 ? 'early bird' : 'day texter'
  }

  // distinctive words: log-odds with informative Dirichlet prior (Monroe et al.)
  const totalWordCount = [...wordAll.values()].reduce((a, b) => a + b, 0)
  for (const p of people.values()) {
    const mine = wordsByPerson.get(p.name)!
    const myTotal = [...mine.values()].reduce((a, b) => a + b, 0)
    const restTotal = totalWordCount - myTotal
    if (myTotal < 30 || restTotal < 30) continue
    const alpha0 = 500
    const scored: { word: string; score: number }[] = []
    for (const [w, cMine] of mine) {
      const cAll = wordAll.get(w)!
      if (cAll < 5 || cMine < 3) continue
      const cRest = cAll - cMine
      const aw = (alpha0 * cAll) / totalWordCount
      const l1 = (cMine + aw) / (myTotal + alpha0 - cMine - aw)
      const l2 = (cRest + aw) / (restTotal + alpha0 - cRest - aw)
      const delta = Math.log(l1) - Math.log(l2)
      const variance = 1 / (cMine + aw) + 1 / (cRest + aw)
      const z = delta / Math.sqrt(variance)
      if (z > 1.96) scored.push({ word: w, score: z })
    }
    scored.sort((a, b) => b.score - a.score)
    p.distinctive = scored.slice(0, 10)
  }

  // ---- monthly rows
  const monthKeys = [...monthlyTotal.keys()].sort()
  const monthly: MonthRow[] = monthKeys.map((key) => {
    const per: Record<string, number> = {}
    const mp = monthlyPerPerson.get(key)
    if (mp) for (const [name, c] of mp) per[name] = c
    const mv = monthlyVibe.get(key)
    const topE = emojiByMonth.get(key) ? topOfMap(emojiByMonth.get(key)!, 1) : []
    return {
      key, total: monthlyTotal.get(key)!,
      perPerson: per,
      vibe: mv && mv.n >= 8 ? mv.v / mv.n : 0,
      topEmoji: topE.length ? topE[0][0] : null,
    }
  })

  // composite vibe: a month's mood is more than its adjectives. Blend the
  // lexicon score with affection rate and volume, each z-scored against the
  // chat's own baseline — a quiet, heartless month IS the fight, even when
  // nobody types the word "angry".
  if (monthly.length >= 4) {
    const eligible = monthly.map((m) => m.total >= 20)
    const stats = (xs: number[]) => {
      const ys = xs.filter((_, i) => eligible[i])
      const mean = ys.reduce((a, b) => a + b, 0) / Math.max(1, ys.length)
      const sd = Math.sqrt(ys.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, ys.length)) || 1
      return { mean, sd }
    }
    const lex = monthly.map((m) => m.vibe)
    const loveRate = monthly.map((m) => (monthlyLove.get(m.key) ?? 0) / Math.max(1, m.total))
    const vol = monthly.map((m) => m.total)
    const L = stats(lex)
    const R = stats(loveRate)
    const V = stats(vol)
    const affectionate = loveRate.some((r) => r > 0.01)
    const raw = monthly.map((m, i) => {
      if (!eligible[i]) return 0
      const interior = i > 0 && i < monthly.length - 1 // partial first/last months: volume is meaningless
      const scoredN = monthlyVibe.get(m.key)?.n ?? 0
      // low-evidence months shouldn't swing on a handful of scored words
      const lexZ = ((lex[i] - L.mean) / L.sd) * (scoredN / (scoredN + 40))
      const loveZ = affectionate ? Math.max(-2, Math.min(2, (loveRate[i] - R.mean) / R.sd)) : 0
      const volZ = interior ? (vol[i] - V.mean) / V.sd : 0
      // asymmetric: going quiet is a red flag; being extra chatty is barely a signal
      const volSig = Math.min(0, volZ) * 1 + Math.max(0, volZ) * 0.15
      return affectionate
        ? lexZ * 0.45 + loveZ * 0.3 + volSig * 0.45
        : lexZ * 0.55 + volSig * 0.5
    })
    // light temporal smoothing so the line reads as a story, not jitter
    monthly.forEach((m, i) => {
      if (!eligible[i]) { m.vibe = 0; return }
      const prev = i > 0 && eligible[i - 1] ? raw[i - 1] : raw[i]
      const next = i < raw.length - 1 && eligible[i + 1] ? raw[i + 1] : raw[i]
      m.vibe = Math.max(-2.5, Math.min(2.5, prev * 0.2 + raw[i] * 0.6 + next * 0.2))
    })
  }

  // ---- busiest
  let busiestDay: [string, number] = ['', 0]
  for (const [k, c] of daily) if (c > busiestDay[1]) busiestDay = [k, c]
  let busiestMonth: [string, number] = ['', 0]
  for (const [k, c] of monthlyTotal) if (c > busiestMonth[1]) busiestMonth = [k, c]
  const busiestHour = hourHist.indexOf(Math.max(...hourHist))
  const busiestDow = dowHist.indexOf(Math.max(...dowHist))

  // ---- streaks & silences
  const sortedDays = [...daily.keys()].sort()
  let streak = { len: 1, start: sortedDays[0], end: sortedDays[0], current: 1 }
  let runLen = 1
  let runStart = sortedDays[0]
  for (let i = 1; i < sortedDays.length; i++) {
    const prevD = new Date(sortedDays[i - 1])
    const curD = new Date(sortedDays[i])
    const diff = Math.round((curD.getTime() - prevD.getTime()) / 86400e3)
    if (diff === 1) runLen++
    else { runLen = 1; runStart = sortedDays[i] }
    if (runLen > streak.len) streak = { ...streak, len: runLen, start: runStart, end: sortedDays[i] }
  }
  streak.current = runLen

  let silence: Analysis['silence'] = null
  for (let i = 1; i < N; i++) {
    const gap = messages[i].ts - messages[i - 1].ts
    if (!silence || gap > silence.ms) {
      silence = { ms: gap, start: messages[i - 1].ts, end: messages[i].ts, breaker: messages[i] }
    }
  }
  if (silence && silence.ms < 36 * 3600e3) silence = null // not interesting

  // ---- records
  const records: RecordCard[] = []
  records.push({
    id: 'busiest-day', emoji: '📈', title: 'Busiest day',
    value: `${fmt(busiestDay[1])} messages`,
    detail: fmtDate(tsOfKey(busiestDay[0])),
  })
  if (burst && burst.count >= 15) {
    records.push({
      id: 'burst', emoji: '🔥', title: 'Biggest rapid-fire',
      value: `${burst.count} messages in 10 minutes`,
      detail: `${fmtDate(burst.start)} — absolute mayhem`,
    })
  }
  let globalLongest: Person | null = null
  for (const p of people.values()) {
    if (p.longestMsg && (!globalLongest?.longestMsg || p.longestMsg.text.length > globalLongest.longestMsg.text.length)) globalLongest = p
  }
  if (globalLongest?.longestMsg) {
    records.push({
      id: 'longest-msg', emoji: '📜', title: 'Longest message ever',
      value: `${fmt(globalLongest.longestMsg.text.length)} characters`,
      detail: `${globalLongest.name}, ${fmtDate(globalLongest.longestMsg.ts)}`,
      msg: { ts: globalLongest.longestMsg.ts, sender: globalLongest.name, text: globalLongest.longestMsg.text, kind: 'text' },
    })
  }
  records.push({
    id: 'streak', emoji: '⛓️', title: 'Longest daily streak',
    value: `${fmt(streak.len)} days in a row`,
    detail: `${fmtDate(tsOfKey(streak.start))} → ${fmtDate(tsOfKey(streak.end))}`,
  })
  if (silence) {
    records.push({
      id: 'silence', emoji: '🦗', title: 'Longest silence',
      value: fmtDurationLong(silence.ms),
      detail: silence.breaker ? `Broken by ${silence.breaker.sender}` : '',
      msg: silence.breaker ?? undefined,
    })
  }
  if (maxEmojiMsg && maxEmojiMsg.count >= 5) {
    records.push({
      id: 'emoji-msg', emoji: '🎰', title: 'Most emojis in one message',
      value: `${maxEmojiMsg.count} emojis`,
      detail: `${maxEmojiMsg.msg.sender}, ${fmtDate(maxEmojiMsg.msg.ts)}`,
      msg: maxEmojiMsg.msg,
    })
  }
  if (latestNight) {
    records.push({
      id: 'latest-night', emoji: '🌙', title: 'Deepest 3 AM energy',
      value: new Date(latestNight.msg.ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      detail: `${latestNight.msg.sender}, ${fmtDate(latestNight.msg.ts)}`,
      msg: latestNight.msg.kind === 'text' ? latestNight.msg : undefined,
    })
  }
  if (topSessions[0] && topSessions[0].count >= 30) {
    const s = topSessions[0]
    records.push({
      id: 'marathon', emoji: '🏃', title: 'The marathon conversation',
      value: `${fmt(s.count)} messages, one sitting`,
      detail: `${fmtDate(s.start)} — ${fmtDurationLong(s.durMs)} straight, led by ${s.lead}`,
      msg: s.firstMsgs[0],
    })
  }
  const monologuer = [...people.values()].sort((a, b) => b.maxMonologue - a.maxMonologue)[0]
  if (monologuer && monologuer.maxMonologue >= 5) {
    records.push({
      id: 'monologue', emoji: '🎤', title: 'The monologue',
      value: `${monologuer.maxMonologue} messages in a row`,
      detail: `${monologuer.name}, uninterrupted. Nobody asked, everybody received.`,
    })
  }

  // ---- awards
  const ps = [...people.values()].filter((p) => p.msgCount >= 10)
  const awards: Award[] = []
  const taken = new Set<string>()
  const give = (
    id: string, emoji: string, title: string,
    rank: (p: Person) => number, statFn: (p: Person) => string, flavor: string,
    opts: { min?: (p: Person) => boolean; allowRepeat?: boolean } = {},
  ) => {
    const pool = ps.filter((p) => (opts.min ? opts.min(p) : true)).filter((p) => opts.allowRepeat || !taken.has(p.name))
    const fallback = ps.filter((p) => (opts.min ? opts.min(p) : true))
    const usePool = pool.length > 0 ? pool : fallback
    if (usePool.length === 0) return
    const winner = usePool.sort((a, b) => rank(b) - rank(a))[0]
    if (!winner || rank(winner) <= 0) return
    awards.push({ id, emoji, title, person: winner.name, stat: statFn(winner), flavor })
    taken.add(winner.name)
  }

  give('night-owl', '🦉', 'The Night Owl', (p) => p.nightShare, (p) => `${pct(p.nightShare)} of their texts sent 11 PM – 5 AM`, 'Sleep is a suggestion.', { min: (p) => p.nightShare > 0.08 })
  give('sniper', '⚡', 'The Sniper', (p) => (p.replyMedianMs ? 1 / p.replyMedianMs : 0), (p) => `median reply: ${fmtDuration(p.replyMedianMs!)}`, 'Replies before you finish typing.', { min: (p) => p.replies >= 20 })
  give('novelist', '📜', 'The Novelist', (p) => p.avgLen, (p) => `${Math.round(p.avgLen)} characters per message`, 'Every text is a saga.', { min: (p) => p.avgLen > 0 })
  give('comedian', '🎭', 'The Comedian', (p) => p.laughsEarned / Math.max(20, p.msgCount), (p) => `${fmt(p.laughsEarned)} laughs earned`, 'Objectively the funny one. The data has spoken.', { min: (p) => p.laughsEarned >= 5 })
  give('ghost', '👻', 'The Ghost', (p) => (p.replyMedianMs && p.replies >= 10 ? p.replyMedianMs : 0), (p) => `median reply: ${fmtDuration(p.replyMedianMs!)}`, 'Will answer. Eventually. Maybe.', { min: (p) => p.replies >= 10 })
  give('double-texter', '📲', 'The Double Texter', (p) => p.doubleTexts / Math.max(20, p.msgCount), (p) => `${fmt(p.doubleTexts)} double-texts`, 'No reply? No problem. Sends another.', { min: (p) => p.doubleTexts >= 5 })
  give('emoji-artist', '🎨', 'The Emoji Artist', (p) => p.emojiCount / Math.max(20, p.msgCount), (p) => `${(p.emojiCount / Math.max(1, p.msgCount)).toFixed(1)} emojis per message`, 'Why use words when pictures exist?', { min: (p) => p.emojiCount >= 20 })
  give('interrogator', '🔎', 'The Interrogator', (p) => p.questions / Math.max(20, p.msgCount), (p) => `${fmt(p.questions)} questions asked`, 'Always needs to know more.', { min: (p) => p.questions >= 10 })
  give('starter', '🎬', 'The Conversation Starter', (p) => p.starts / Math.max(1, totals.sessions), (p) => `kicked off ${pct(p.starts / Math.max(1, totals.sessions))} of all conversations`, 'Without them, this chat is a graveyard.', { min: (p) => p.starts >= 5 })
  give('hype', '📣', 'The Hype Machine', (p) => p.capsCount / Math.max(20, p.msgCount), (p) => `${fmt(p.capsCount)} ALL-CAPS messages`, 'CHRONICALLY EXCITED.', { min: (p) => p.capsCount >= 5 })
  give('paparazzi', '📸', 'The Paparazzi', (p) => p.mediaCount / Math.max(20, p.msgCount), (p) => `${fmt(p.mediaCount)} photos & media sent`, 'Pics, or it didn’t happen.', { min: (p) => p.mediaCount >= 10 })
  if (isGroup) {
    give('lurker', '🫥', 'The Lurker', (p) => 1 / Math.max(0.001, p.share), (p) => `only ${pct(p.share)} of all messages`, 'Sees everything. Says nothing.', { min: (p) => p.share < 0.5 })
  }
  give('swear-jar', '🫙', 'The Swear Jar', (p) => p.swears / Math.max(20, p.msgCount), (p) => `${fmt(p.swears)} coins owed`, 'Language!', { min: (p) => p.swears >= 8 })
  give('librarian', '🔗', 'The Librarian', (p) => p.links / Math.max(20, p.msgCount), (p) => `${fmt(p.links)} links shared`, 'Has a source for everything.', { min: (p) => p.links >= 8 })
  give('cliffhanger', '⏳', 'The Cliffhanger', (p) => p.unansweredQs, (p) => `${fmt(p.unansweredQs)} questions left on read`, 'Asks into the void.', { min: (p) => p.unansweredQs >= 3, allowRepeat: true })

  // make sure everyone gets something in small chats
  for (const p of ps) {
    if (!taken.has(p.name) && awards.length < ps.length + 4) {
      awards.push({
        id: 'glue', emoji: '🧩', title: 'The Glue',
        person: p.name, stat: `${fmt(p.msgCount)} messages of pure presence`,
        flavor: 'Holds the whole thing together.',
      })
      taken.add(p.name)
    }
  }

  // ---- milestones
  const milestones: Milestone[] = []
  const first = messages.find((m) => m.kind === 'text') ?? messages[0]
  milestones.push({
    ts: first.ts, emoji: '🌱', kind: 'origin', title: 'Where it all began',
    detail: `The very first message, ${fmtDate(first.ts)}`,
    quote: { sender: first.sender, text: first.text || '📷 (a photo started it all)' },
  })
  for (const n of [1_000, 10_000, 25_000, 50_000, 100_000, 250_000]) {
    if (N > n) {
      const m = messages[n - 1]
      milestones.push({
        ts: m.ts, emoji: '🏁', kind: 'count', title: `Message #${fmt(n)}`,
        detail: `Reached on ${fmtDate(m.ts)}`,
        quote: m.kind === 'text' && m.text.length < 140 ? { sender: m.sender, text: m.text } : undefined,
      })
    }
  }
  milestones.push({
    ts: tsOfKey(busiestDay[0]), emoji: '🌋', kind: 'peak', title: 'The eruption',
    detail: `${fmt(busiestDay[1])} messages on ${fmtDateFullSafe(busiestDay[0])}. What happened here?`,
  })
  if (silence && silence.breaker) {
    milestones.push({
      ts: silence.end, emoji: '🧊', kind: 'silence', title: `The ${fmtDurationLong(silence.ms)} of silence`,
      detail: `Nobody spoke. Then ${silence.breaker.sender} returned:`,
      quote: silence.breaker.kind === 'text' ? { sender: silence.breaker.sender, text: silence.breaker.text } : undefined,
    })
  }
  for (const s of systemEvents) {
    const t = s.text
    if (/changed the subject|created group|changed this group's icon|added|left|removed/i.test(t)) {
      if (/encrypted|missed/i.test(t)) continue
      milestones.push({ ts: s.ts, emoji: eventEmoji(t), kind: 'event', title: eventTitle(t), detail: fmtDate(s.ts) })
    }
  }
  const last = messages[N - 1]
  milestones.push({
    ts: last.ts, emoji: '✨', kind: 'now', title: 'And counting…',
    detail: `${fmt(N)} messages later, ${fmtDate(last.ts)}`,
    quote: last.kind === 'text' && last.text.length < 140 ? { sender: last.sender, text: last.text } : undefined,
  })
  milestones.sort((a, b) => a.ts - b.ts)
  // cap event spam
  const trimmed: Milestone[] = []
  let evCount = 0
  for (const ms of milestones) {
    if (ms.kind === 'event') { evCount++; if (evCount > 10) continue }
    trimmed.push(ms)
  }

  // ---- compatibility (1-on-1 only)
  let compatibility: Analysis['compatibility'] = null
  if (!isGroup && ps.length === 2) {
    const [a, b] = ps
    const balance = 1 - Math.abs(a.share - b.share) * 2
    const initBalance = 1 - Math.abs(a.starts - b.starts) / Math.max(1, a.starts + b.starts)
    const ra = a.replyMedianMs ?? 600e3
    const rb = b.replyMedianMs ?? 600e3
    const speedScore = Math.max(0, 1 - Math.min(ra, rb, 3600e3) / 3600e3 * 0.5 - Math.abs(Math.log((ra + 1) / (rb + 1))) / 6)
    const laughRate = totals.laughs / Math.max(1, N)
    const laughScore = Math.min(1, laughRate * 8)
    const loveRate = (a.loveMsgs + b.loveMsgs + a.hearts + b.hearts) / Math.max(1, N)
    const warmth = Math.min(1, loveRate * 12)
    const consistency = Math.min(1, ([...daily.keys()].length / days) * 1.25)
    const parts = [
      { label: 'Balance', score: balance, note: `${a.name} sends ${pct(a.share)}, ${b.name} sends ${pct(b.share)}` },
      { label: 'Initiative', score: initBalance, note: `conversation starting is ${initBalance > 0.75 ? 'shared' : 'one-sided'}` },
      { label: 'Responsiveness', score: speedScore, note: `median replies: ${fmtDuration(ra)} vs ${fmtDuration(rb)}` },
      { label: 'Laughter', score: laughScore, note: `${fmt(totals.laughs)} laughs between you` },
      { label: 'Warmth', score: warmth, note: `${fmt(a.loveMsgs + b.loveMsgs)} love notes, ${fmt(a.hearts + b.hearts)} hearts` },
      { label: 'Consistency', score: consistency, note: `you talked on ${pct([...daily.keys()].length / days)} of all days` },
    ]
    const score = Math.round((parts.reduce((s, x) => s + x.score, 0) / parts.length) * 100)
    compatibility = { score, parts }
  }

  // ---- vibe extremes
  const eligibleMonths = monthly.filter((m) => m.total > 30)
  const byVibe = [...eligibleMonths].sort((a, b) => b.vibe - a.vibe)
  const vibeRange = {
    best: byVibe[0] ?? null,
    worst: byVibe.length > 1 ? byVibe[byVibe.length - 1] : null,
  }

  // ---- headline
  const top = [...people.values()].sort((a, b) => b.msgCount - a.msgCount)[0]
  const perDay = N / days
  const laughRate = totals.laughs / N
  let headline: string
  if (isGroup) {
    headline = laughRate > 0.08
      ? `A ${perDay > 25 ? 'high-volume' : 'slow-burn'} comedy club where ${top.name} does ${pct(top.share)} of the talking.`
      : `A ${perDay > 25 ? 'relentless' : 'steady'} group operation, carried — let’s be honest — by ${top.name}.`
  } else {
    headline = compatibility && compatibility.score >= 75
      ? `A genuinely balanced two-person show. The data says: keep this one.`
      : `Two people, ${fmt(N)} messages, and a story the numbers can’t stop telling.`
  }

  const sortedPeople = [...people.values()].sort((a, b) => b.msgCount - a.msgCount)

  return {
    isGroup, chatName,
    people: sortedPeople,
    byName: people,
    totals: { ...totals },
    range: { start, end, days, activeDays: daily.size },
    heatmap, hourHist, dowHist, monthly,
    busiest: { dayKey: busiestDay[0], dayCount: busiestDay[1], hour: busiestHour, dow: busiestDow, monthKey: busiestMonth[0] },
    streak, silence,
    fastestReply, slowestReply, replyBuckets,
    topEmojis: topOfMap(emojiAll, 24),
    emojiTotalDistinct: emojiAll.size,
    records, awards,
    milestones: trimmed,
    matrix: matrixCounts ? { names: matrixNames, counts: matrixCounts } : null,
    compatibility,
    headline,
    firstMessage: first,
    burst,
    vibeRange,
    daily: [...daily.entries()].map(([key, count]) => ({ key, count })).sort((a, b) => (a.key < b.key ? -1 : 1)),
    topSessions,
    avgSessionMsgs,
    sessionGapMs,
    thumbTimeMs,
  }
}

function fmtDateFullSafe(key: string): string {
  const t = tsOfKey(key)
  const d = new Date(t)
  return `${DOW_FULL[d.getDay()]}, ${fmtDate(t)}`
}

function eventEmoji(t: string): string {
  if (/changed the subject/i.test(t)) return '✏️'
  if (/icon/i.test(t)) return '🖼️'
  if (/added|joined/i.test(t)) return '👋'
  if (/left|removed/i.test(t)) return '🚪'
  if (/created/i.test(t)) return '🎂'
  return '📌'
}
function eventTitle(t: string): string {
  return t.length > 90 ? t.slice(0, 87) + '…' : t
}
