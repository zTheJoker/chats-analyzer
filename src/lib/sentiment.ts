// Chat-tuned sentiment scoring: AFINN-style word valences + slang, with
// negation flipping and intensifier weighting, plus emoji valence.
// Returns a score per message; the engine averages per month.
import { tokenizeWords, extractEmojis, isLaugh } from './text'

// word → valence (-5..+5). Curated for how people actually text.
const LEX: Record<string, number> = {
  // strong positive
  love: 3, loved: 3, loving: 3, adore: 3, amazing: 4, awesome: 4, incredible: 4,
  fantastic: 4, wonderful: 4, perfect: 3, beautiful: 3, gorgeous: 3, stunning: 4,
  excellent: 3, brilliant: 4, outstanding: 5, phenomenal: 4, legendary: 4,
  blessed: 3, thrilled: 4, ecstatic: 5, overjoyed: 4, euphoric: 5,
  // positive
  good: 2, great: 3, nice: 2, happy: 3, glad: 2, fun: 2, funny: 2, hilarious: 3,
  sweet: 2, cute: 2, win: 2, won: 2, winning: 2, congrats: 3, congratulations: 3,
  proud: 3, excited: 3, exciting: 3, yay: 3, hooray: 3, enjoy: 2, enjoyed: 2,
  thanks: 2, thank: 2, grateful: 3, thankful: 3, appreciate: 2, appreciated: 2,
  best: 3, better: 2, cool: 1, awesome2: 0, solid: 1, smooth: 1, easy: 1,
  beautiful2: 0, lovely: 3, charming: 2, delicious: 3, tasty: 2, yum: 2, yummy: 2,
  hope: 1, hopeful: 2, relief: 2, relieved: 2, safe: 1, calm: 1, peaceful: 2,
  laugh: 2, laughing: 2, smile: 2, smiling: 2, celebrate: 3, celebration: 3,
  party: 2, vacation: 2, holiday: 1, miracle: 4, magic: 2, magical: 3,
  // chat slang positive
  lit: 3, fire: 2, goated: 4, banger: 3, slaps: 3, vibes: 1, vibing: 2, hyped: 3,
  stoked: 3, pumped: 3, dope: 2, sick2: 0, epic: 3, clutch: 3, savage: 1,
  unreal: 2, insane2: 0, massive: 1, huge: 1, king: 2, queen: 2, legend: 3,
  bet: 1, sheesh: 1, slay: 2, iconic: 3, elite: 3, golden: 2, gem: 2,
  // strong negative
  hate: -3, hated: -3, hates: -3, terrible: -3, awful: -3, horrible: -3,
  disgusting: -3, worst: -3, nightmare: -3, disaster: -3, tragic: -3, tragedy: -3,
  devastated: -4, devastating: -4, heartbroken: -4, miserable: -3, depressed: -3,
  depressing: -3, furious: -4, rage: -3, livid: -4, betrayed: -4, betrayal: -4,
  // negative
  bad: -2, sad: -2, angry: -3, mad: -2, upset: -2, annoyed: -2, annoying: -2,
  irritated: -2, frustrated: -3, frustrating: -3, stressed: -2, stress: -2,
  stressful: -2, anxious: -2, anxiety: -2, worried: -2, worry: -2, scared: -2,
  afraid: -2, fear: -2, cry: -2, crying2: 0, cried: -2, tears: -1, hurt: -2,
  hurts: -2, pain: -2, painful: -3, sick: -2, ill: -2, tired: -1, exhausted: -2,
  drained: -2, broke: -2, broken: -2, fail: -2, failed: -2, failing: -2,
  failure: -3, lost: -1, lose: -1, losing: -2, wrong: -1, fault: -2, blame: -2,
  problem: -1, problems: -2, issue: -1, issues: -1, fight: -2, fighting: -2,
  fought: -2, argue: -2, arguing: -2, argument: -2, sorry: -1, apologize: -1,
  disappointed: -3, disappointing: -3, disappointment: -3, embarrassed: -2,
  embarrassing: -2, ashamed: -3, guilty: -2, regret: -2, jealous: -2, lonely: -3,
  alone: -1, ignored: -2, ignoring: -2, rude: -2, mean: -2, selfish: -2,
  toxic: -3, liar: -3, lying: -2, lied: -2, cheat: -3, cheated: -3, unfair: -2,
  ugh: -2, ew: -2, gross: -2, yikes: -1, oof: -1, dammit: -2, dumb: -2,
  stupid: -2, idiot: -2, ridiculous: -1, pathetic: -3, useless: -2, trash: -2,
  garbage: -2, mid: -1, cringe: -2, sus: -1, cooked: -1, doomed: -2, cursed: -1,
  rip: -1, brutal: -2, rough: -1, ouch: -1, sucks: -2, suck: -2, sucked: -2,
  wtf: -1, smh: -1, bruh: 0, cap: -1, delayed: -1, cancelled: -2, canceled: -2,
  late: -1, missed: -1, missing: -1, crime: -1, criminal: -1, war: -2, dead2: 0,
  die: -2, died: -3, death: -3, funeral: -3, hospital: -2, emergency: -2,
  accident: -2, injured: -2, injury: -2, surgery: -1, divorce: -3, breakup: -3,
}
// remove placeholder dupes used to dodge key collisions above
delete LEX.awesome2; delete LEX.beautiful2; delete LEX.sick2; delete LEX.insane2
delete LEX.crying2; delete LEX.dead2

const NEGATORS = new Set(
  "not no never none cant cannot dont didnt doesnt isnt arent wasnt werent wont wouldnt couldnt shouldnt aint barely hardly rarely without won't can't don't didn't doesn't isn't aren't wasn't weren't wouldn't couldn't shouldn't ain't".split(' '),
)
const BOOSTERS: Record<string, number> = {
  very: 1.6, really: 1.5, so: 1.3, super: 1.6, extremely: 1.9, totally: 1.5,
  absolutely: 1.8, insanely: 1.8, fucking: 1.7, literally: 1.3, deeply: 1.6,
  genuinely: 1.4, beyond: 1.5, completely: 1.6, utterly: 1.8, incredibly: 1.7,
  kinda: 0.6, sorta: 0.6, somewhat: 0.6, slightly: 0.5, bit: 0.7, little: 0.7,
}

const EMOJI_VAL: Record<string, number> = {
  '😂': 2, '🤣': 2, '💀': 1.5, '😹': 2, '😆': 2, '😄': 2, '😁': 2, '😊': 2,
  '🙂': 1, '😀': 1.5, '😃': 1.5, '☺': 1.5, '😍': 3, '🥰': 3, '😘': 3, '❤': 3,
  '🧡': 2.5, '💛': 2.5, '💚': 2.5, '💙': 2.5, '💜': 2.5, '🖤': 1.5, '🤍': 2.5,
  '💕': 3, '💞': 3, '💓': 3, '💗': 3, '💖': 3, '💘': 3, '💝': 3, '🥹': 2,
  '🎉': 3, '🥳': 3, '🎊': 3, '🔥': 2, '💪': 2, '🙌': 2.5, '👏': 2, '✨': 1.5,
  '🤩': 3, '😎': 1.5, '🤝': 1.5, '👍': 1.5, '🫶': 3, '🤗': 2, '😌': 1,
  '🙏': 1, '💯': 2, '⭐': 1.5, '🌟': 1.5, '😢': -2, '😭': 0, '😞': -2,
  '😔': -2, '😟': -2, '😕': -1.5, '🙁': -1.5, '☹': -2, '😣': -2, '😖': -2,
  '😫': -2, '😩': -2, '🥺': -0.5, '😡': -3, '🤬': -3.5, '😠': -2.5, '😤': -1.5,
  '💔': -3, '👎': -1.5, '🖕': -3, '🙄': -1.5, '😒': -1.5, '😑': -1, '😐': -0.5,
  '🤢': -2, '🤮': -2.5, '😨': -2, '😰': -2, '😥': -1.5, '😓': -1.5, '🫠': -1,
  '😬': -1, '💩': -1, '⚰': -1.5, '🥀': -1.5,
}

export function scoreText(text: string): number {
  if (!text) return 0
  let score = 0
  const words = text.toLowerCase().split(/[\s,!?.]+/)
  let negate = 0 // tokens remaining in negation window
  let boost = 1
  let boostLeft = 0
  for (const raw of words) {
    const w = raw.replace(/[^a-z'’]/g, '').replace(/’/g, "'")
    if (!w) continue
    if (NEGATORS.has(w)) { negate = 3; continue }
    if (BOOSTERS[w] !== undefined) { boost = BOOSTERS[w]; boostLeft = 2; continue }
    const base = LEX[w.replace(/'/g, '')]
    if (base !== undefined) {
      let v = base * (boostLeft > 0 ? boost : 1)
      if (negate > 0) v = -v * 0.7
      score += v
    }
    if (negate > 0) negate--
    if (boostLeft > 0) { boostLeft--; if (boostLeft === 0) boost = 1 }
  }
  for (const e of extractEmojis(text)) {
    const key = e.replace(/️/g, '')
    const v = EMOJI_VAL[key] ?? EMOJI_VAL[key.charAt(0)] ?? 0
    score += v
  }
  if (isLaugh(text)) score += 1.2
  return Math.max(-8, Math.min(8, score))
}
