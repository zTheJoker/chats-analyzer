// WhatsApp chat export parser. Handles iOS bracketed format, Android dash
// format, 12h/24h time, DD/MM vs MM/DD ambiguity, multi-line messages,
// system messages, media placeholders, and .zip exports. Everything runs
// locally — this module never touches the network.
import { unzipSync } from 'fflate'

export type MsgKind = 'text' | 'media' | 'deleted' | 'call' | 'system'
export type MediaType =
  | 'photo' | 'video' | 'audio' | 'sticker' | 'gif' | 'document' | 'contact' | 'media'

export interface Msg {
  ts: number
  sender: string
  text: string
  kind: MsgKind
  mediaType?: MediaType
  edited?: boolean
}

export interface ParseResult {
  messages: Msg[]
  participants: string[]
  isGroup: boolean
  chatName: string
  systemEvents: Msg[]
  format: string
  warnings: string[]
}

const INVISIBLES = /[‎‏‪-‮﻿]/g
const NBSPACES = /[   ]/g

// [21/04/2024, 21:30:45] Name: msg   (iOS; seconds & AM/PM optional)
const IOS_RE =
  /^\[(\d{1,4})[./-](\d{1,2})[./-](\d{1,4}),? (\d{1,2}):(\d{2})(?::(\d{2}))?(?: ?([AaPp])\.? ?[Mm]\.?)?\] (.*)$/
// 21/04/2024, 21:30 - Name: msg      (Android; AM/PM optional, -, – or —)
const ANDROID_RE =
  /^(\d{1,4})[./-](\d{1,2})[./-](\d{1,4}),? (\d{1,2}):(\d{2})(?::(\d{2}))?(?: ?([AaPp])\.? ?[Mm]\.?)? [-–—] (.*)$/

interface Token {
  a: number; b: number; y: number
  h: number; min: number; sec: number
  ampm: string | null
  rest: string
}

// media placeholders, multilingual. iOS writes bare phrases ("image omitted",
// "imagen omitida"); Android wraps placeholders in angle brackets in every
// language ("<Media omitted>", "<Multimedia omitido>", "<मीडिया हटाया गया>").
const PHOTO_W = 'image|imagen|imagem|bild|immagine|afbeelding|תמונה|photo'
const VIDEO_W = 'video note|video|vídeo|סרטון|וידאו'
const AUDIO_W = 'voice message|audio|áudio|אודיו'
const STICKER_W = 'sticker|figurinha|סטיקר'
const DOC_W = 'document|documento|dokument|מסמך'
const GIF_W = 'gif'
const CONTACT_W = 'contact card|tarjeta de contacto|cartão do contato|kontaktkarte|כרטיס איש קשר'
const OMIT_W =
  'omitted|omitida|omitido|ocultada|ocultado|oculto|omessa|omesso|omessi|omis|omise|absente?|weggelaten|weggelassen|ausgeschlossen|הושמטה|הושמט|nicht übertragen'

const mk = (words: string) => new RegExp(`^(?:${words}) (?:${OMIT_W})$`, 'iu')
const MEDIA_PATTERNS: [RegExp, MediaType][] = [
  [/^<?attached:.*?(jpg|jpeg|png|webp|heic)>?$/i, 'photo'],
  [/^<?attached:.*?(mp4|mov|3gp)>?$/i, 'video'],
  [/^<?attached:.*?(opus|mp3|m4a|ogg|aac)>?$/i, 'audio'],
  [/^<?attached:.*?(pdf|docx?|xlsx?|pptx?|txt|csv|zip)>?$/i, 'document'],
  [/^<?attached:.*>?$/i, 'media'],
  [mk(PHOTO_W), 'photo'],
  [mk(VIDEO_W), 'video'],
  [mk(AUDIO_W), 'audio'],
  [mk(STICKER_W), 'sticker'],
  [mk(GIF_W), 'gif'],
  [mk(DOC_W), 'document'],
  [mk(CONTACT_W), 'contact'],
  [/(file attached)$/i, 'media'],
  // Android catch-all: any short angle-bracketed placeholder, any language
  [/^<[^<>]{2,60}>$/, 'media'],
]
// iOS caption form: "the caption  ‎image omitted" — caption first, placeholder last
const TRAILING_MEDIA_RE = new RegExp(
  `\\s((?:${PHOTO_W}|${VIDEO_W}|${AUDIO_W}|${STICKER_W}|${GIF_W}|${DOC_W}) (?:${OMIT_W}))$`, 'iu',
)
// iOS document form: "report.docx • 3 pages  ‎document omitted"
const DOC_FILE_RE = new RegExp(`^.{1,100} • \\d+ \\S{1,12} (?:${DOC_W}) (?:${OMIT_W})$`, 'iu')

const DELETED_RE =
  /^(this message was deleted\.?|you deleted this message\.?|message deleted\.?|se eliminó este mensaje\.?|eliminaste este mensaje\.?|essa mensagem foi apagada\.?|apagou esta mensagem\.?|mensagem apagada\.?|diese nachricht wurde gelöscht\.?|du hast diese nachricht gelöscht\.?|ce message a été supprimé\.?|vous avez supprimé ce message\.?|questo messaggio è stato eliminato\.?|hai eliminato questo messaggio\.?|dit bericht is verwijderd\.?|je hebt dit bericht verwijderd\.?|הודעה זו נמחקה\.?|מחקת את ההודעה הזו\.?|pesan ini telah dihapus\.?|это сообщение удалено\.?)$/iu
const CALL_RE =
  /^(missed (voice|video) call|(voice|video) call|silenced (voice|video) call|llamada(?: de voz)? perdida|videollamada perdida|chamada de (voz|vídeo) perdida|verpasster (sprach|video)anruf|appel (vocal|vidéo) manqué|chiamata (vocale|video) persa|gemiste (spraak|video)oproep|שיחה קולית|שיחת וידאו)\b/iu
const EDITED_RE =
  /\s*<[^<>]{0,50}(edited|editó|editada|editado|bearbeitet|modifié|modificato|bewerkt|נערכה|düzenlendi|diedit)[^<>]{0,10}>\s*$/iu

// iOS prefixes meta lines (system text, placeholders) with U+200E after the
// sender colon — that's our signal that "Name: ‎You created group X" is the
// app talking, not the person.
const SYSTEM_TEXT_RE =
  /(end-to-end encrypted|created group|created this group|joined using|joined from|was added|added you|you added|changed the subject|changed this group|changed the group|changed to|pinned a message|disappearing messages|security code|left$|removed |now an admin|cifrad[oa]s de extremo a extremo|criptografad|verschlüsselt|chiffrées de bout en bout|crittografat|מוצפנות מקצה לקצה|se unió|entrou usando|creó el grupo|criou o grupo|cambió el asunto)/iu

const SYSTEM_HINTS = [
  'end-to-end encrypted', 'created group', 'created this group', 'added', 'left',
  'removed', 'changed the subject', 'changed this group', "changed the group",
  'security code', 'joined using', 'pinned a message', 'disappearing messages',
  'changed their phone number', 'is a contact', 'blocked this', 'unblocked',
  "changed this group's icon", 'now an admin', 'turned on', 'turned off',
]

function tokenize(raw: string): { tokens: Token[]; format: string } {
  const lines = raw.split(/\r\n|\n|\r/)
  const tokens: Token[] = []
  let ios = 0
  let android = 0
  for (const line0 of lines) {
    const line = line0.replace(NBSPACES, ' ')
    // strip only LEADING invisibles before matching — internal U+200E marks
    // are meaningful (iOS uses them to flag system/placeholder content)
    const head = line.replace(/^[‎‏﻿]+/, '')
    let m = head.match(IOS_RE)
    let isIos = true
    if (!m) { m = head.match(ANDROID_RE); isIos = false }
    if (m) {
      isIos ? ios++ : android++
      tokens.push({
        a: +m[1], b: +m[2], y: +m[3],
        h: +m[4], min: +m[5], sec: m[6] ? +m[6] : 0,
        ampm: m[7] ? m[7].toUpperCase() : null,
        rest: m[8],
      })
    } else if (tokens.length > 0 && line0.trim() !== '') {
      // continuation of a multi-line message
      tokens[tokens.length - 1].rest += '\n' + line
    }
  }
  return { tokens, format: ios >= android ? 'ios' : 'android' }
}

// Decide day/month order. Evidence: any first value >12 → day-first; any second
// value >12 → month-first. If still ambiguous, pick the order with fewer
// backwards time-jumps (chats are chronological).
function detectDayFirst(tokens: Token[]): boolean {
  let aOver = 0
  let bOver = 0
  for (const t of tokens) {
    if (t.a > 12 && t.a <= 31) aOver++
    if (t.b > 12 && t.b <= 31) bOver++
  }
  if (aOver > 0 && bOver === 0) return true
  if (bOver > 0 && aOver === 0) return false
  const backJumps = (dayFirst: boolean) => {
    let prev = -Infinity
    let jumps = 0
    for (const t of tokens) {
      const ts = toTs(t, dayFirst)
      if (ts < prev - 60_000) jumps++
      prev = ts
    }
    return jumps
  }
  return backJumps(true) <= backJumps(false)
}

function toTs(t: Token, dayFirst: boolean): number {
  let day = dayFirst ? t.a : t.b
  let mon = dayFirst ? t.b : t.a
  let year = t.y
  // year-first formats (e.g. 2024.04.21.)
  if (t.a > 999) { year = t.a; mon = t.b; day = t.y }
  if (year < 100) year += year < 70 ? 2000 : 1900
  let h = t.h
  if (t.ampm === 'P' && h < 12) h += 12
  if (t.ampm === 'A' && h === 12) h = 0
  return new Date(year, mon - 1, day, h, t.min, t.sec).getTime()
}

function mediaTypeOf(phrase: string): MediaType {
  const w = phrase.toLowerCase()
  if (new RegExp(`^(?:${PHOTO_W})\\b`, 'iu').test(w)) return 'photo'
  if (new RegExp(`^(?:${VIDEO_W})\\b`, 'iu').test(w)) return 'video'
  if (new RegExp(`^(?:${AUDIO_W})\\b`, 'iu').test(w)) return 'audio'
  if (new RegExp(`^(?:${STICKER_W})\\b`, 'iu').test(w)) return 'sticker'
  if (new RegExp(`^(?:${GIF_W})\\b`, 'iu').test(w)) return 'gif'
  if (new RegExp(`^(?:${DOC_W})\\b`, 'iu').test(w)) return 'document'
  return 'media'
}

function classify(rest: string): Omit<Msg, 'ts'> | { system: string } {
  const sep = rest.indexOf(': ')
  if (sep === -1) return { system: rest.replace(INVISIBLES, '').trim() }
  const sender = rest.slice(0, sep).replace(INVISIBLES, '').trim()
  const body = rest.slice(sep + 2)
  // iOS flags app-generated content with U+200E right after "Name: "
  const meta = body.startsWith('‎') || body.startsWith('‏')
  let text = body.replace(INVISIBLES, '').trim()
  // a "sender" with a newline in it means the colon was inside a multi-line
  // system message, not a real name
  if (sender.includes('\n') || sender.length === 0 || sender.length > 80) {
    return { system: rest.replace(INVISIBLES, '').trim() }
  }

  // iOS writes system lines with the chat name as the "sender"
  if (meta && SYSTEM_TEXT_RE.test(text)) return { system: text }

  let edited = false
  if (EDITED_RE.test(text)) { edited = true; text = text.replace(EDITED_RE, '') }

  if (DELETED_RE.test(text)) return { sender, text: '', kind: 'deleted', edited }
  if (CALL_RE.test(text)) return { sender, text, kind: 'call', edited }
  for (const [re, mediaType] of MEDIA_PATTERNS) {
    if (re.test(text)) return { sender, text: '', kind: 'media', mediaType, edited }
  }
  // "report.docx • 3 pages document omitted" — filename is an artifact, drop it
  if (DOC_FILE_RE.test(text)) return { sender, text: '', kind: 'media', mediaType: 'document', edited }
  // "look at this!! image omitted" — media with a caption; keep the caption
  const trail = text.match(TRAILING_MEDIA_RE)
  if (trail) {
    const caption = text.slice(0, text.length - trail[1].length).trim()
    return { sender, text: caption, kind: 'media', mediaType: mediaTypeOf(trail[1]), edited }
  }
  return { sender, text, kind: 'text', edited }
}

export function parseChat(raw: string, fileName?: string): ParseResult {
  // strip BOM
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1)
  const { tokens, format } = tokenize(raw)
  const warnings: string[] = []
  if (tokens.length === 0) {
    throw new Error(
      "Couldn't find any WhatsApp messages in this file. Make sure it's a chat export (.txt or .zip) from WhatsApp → chat → Export chat.",
    )
  }
  const dayFirst = detectDayFirst(tokens)

  const messages: Msg[] = []
  const systemEvents: Msg[] = []
  const counts = new Map<string, number>()
  let chatNameFromSystem = ''

  for (const t of tokens) {
    const ts = toTs(t, dayFirst)
    if (!Number.isFinite(ts)) continue
    const c = classify(t.rest)
    if ('system' in c) {
      systemEvents.push({ ts, sender: '', text: c.system, kind: 'system' })
      const m = c.system.match(/created group ["“](.+?)["”]/)
      if (m) chatNameFromSystem = m[1]
      const m2 = c.system.match(/changed the subject (?:from ["“].*?["”] )?to ["“](.+?)["”]/)
      if (m2) chatNameFromSystem = m2[1]
      continue
    }
    // long pasted text can contain timestamp-looking lines from forwarded
    // messages; trust the parse but guard against absurd years
    const year = new Date(ts).getFullYear()
    if (year < 2009 || year > 2100) continue
    messages.push({ ts, ...c })
    counts.set(c.sender, (counts.get(c.sender) ?? 0) + 1)
  }

  if (messages.length === 0) {
    throw new Error('Parsed the file but found no actual messages — only system events.')
  }

  messages.sort((x, y) => x.ts - y.ts)
  systemEvents.sort((x, y) => x.ts - y.ts)

  // drop "participants" that are obviously noise (≤2 messages AND <0.05% of
  // chat) — usually parsing artifacts from pasted content
  const total = messages.length
  const participants = [...counts.entries()]
    .filter(([, n]) => n > 2 || n / total > 0.0005 || counts.size <= 3)
    .sort((x, y) => y[1] - x[1])
    .map(([name]) => name)

  const isGroup =
    participants.length > 2 ||
    systemEvents.some((s) => /created group|created this group|added|joined using/i.test(s.text))

  let chatName = chatNameFromSystem
  if (!chatName && fileName) {
    const m = fileName.match(/WhatsApp Chat (?:with |- )?(.+?)\.(txt|zip)/i)
    if (m) chatName = m[1]
  }
  if (!chatName) {
    chatName = isGroup ? 'Group chat' : participants.slice(0, 2).join(' & ')
  }

  return {
    messages: messages.filter((m) => participants.includes(m.sender)),
    participants,
    isGroup,
    chatName,
    systemEvents,
    format: `${format}/${dayFirst ? 'DMY' : 'MDY'}`,
    warnings,
  }
}

export async function parseFile(file: File): Promise<ParseResult> {
  const name = file.name
  if (/\.zip$/i.test(name)) {
    const buf = new Uint8Array(await file.arrayBuffer())
    const entries = unzipSync(buf, { filter: (f) => /\.txt$/i.test(f.name) })
    const txtNames = Object.keys(entries)
    if (txtNames.length === 0) throw new Error('No .txt chat file found inside this zip.')
    // largest .txt is the chat
    txtNames.sort((a, b) => entries[b].length - entries[a].length)
    const text = new TextDecoder('utf-8').decode(entries[txtNames[0]])
    return parseChat(text, txtNames[0] || name)
  }
  const text = await file.text()
  return parseChat(text, name)
}
