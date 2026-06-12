// Generates realistic WhatsApp chat exports for demos & parser testing.
// Seeded RNG so output is reproducible.
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public', 'samples')
mkdirSync(OUT, { recursive: true })

function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeRng(seed) {
  const r = mulberry32(seed)
  return {
    f: () => r(),
    int: (lo, hi) => lo + Math.floor(r() * (hi - lo + 1)),
    pick: (arr) => arr[Math.floor(r() * arr.length)],
    chance: (p) => r() < p,
    weighted(pairs) {
      const total = pairs.reduce((s, [, w]) => s + w, 0)
      let x = r() * total
      for (const [v, w] of pairs) { x -= w; if (x <= 0) return v }
      return pairs[pairs.length - 1][0]
    },
  }
}

const pad = (n) => String(n).padStart(2, '0')

function androidLine(d, name, text) {
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())} - ${name}: ${text}`
}
function androidSystem(d, text) {
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())} - ${text}`
}
function iosLine(d, name, text) {
  return `[${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}] ${name}: ${text}`
}
function iosSystem(d, text) {
  return `[${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}] ‎${text}`
}
function usLine(d, name, text) {
  let h = d.getHours() % 12; if (h === 0) h = 12
  const ap = d.getHours() < 12 ? 'AM' : 'PM'
  return `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(2)}, ${h}:${pad(d.getMinutes())} ${ap} - ${name}: ${text}`
}

// ---------------------------------------------------------------- group chat
function generateGroup() {
  const rng = makeRng(20260612)
  const lines = []
  const P = {
    Moshe:   { hours: [[8, 3], [9, 4], [12, 3], [13, 3], [18, 4], [19, 4], [20, 3], [21, 2]], long: 0.55, emoji: 0.18, media: 0.04, laugh: 'haha', talk: 4.2, q: 0.22 },
    Yanky:   { hours: [[14, 2], [20, 2], [22, 4], [23, 6], [0, 6], [1, 5], [2, 3]],            long: 0.06, emoji: 0.25, media: 0.05, laugh: '💀',  talk: 3.6, q: 0.08 },
    Duvid:   { hours: [[10, 2], [13, 3], [17, 3], [19, 4], [21, 4], [22, 3]],                  long: 0.15, emoji: 0.65, media: 0.13, laugh: '😂😂😂', talk: 3.1, q: 0.10 },
    Shloimy: { hours: [[12, 2], [18, 2], [21, 3], [22, 3]],                                    long: 0.20, emoji: 0.10, media: 0.02, laugh: 'lol', talk: 1.0, q: 0.06 },
    Ari:     { hours: [[7, 2], [9, 3], [12, 4], [15, 3], [18, 4], [20, 4], [21, 3]],           long: 0.12, emoji: 0.20, media: 0.06, laugh: 'LMAOO', talk: 3.4, q: 0.30 },
  }
  const names = Object.keys(P)

  const openers = [
    'yo', 'guys', 'ok serious question', 'who is up', 'anyone around tonight',
    'bro you will not believe what just happened', 'ok so', 'random thought',
    'poker thursday?', 'did everyone see the game', 'I have news', 'so update on the trip',
    'morning legends', 'we still on for tonight?', 'someone explain this to me',
  ]
  const short = [
    'yes', 'no shot', 'fr', 'bro', 'W', 'L', 'massive', 'wild', 'no way', 'facts',
    'im dead', 'cap', 'real', 'huge', 'send it', 'down', 'im in', 'cant tonight',
    'omw', 'late as always', 'classic', 'ok ok', 'unreal', 'this guy', 'pain',
    'who asked', 'crying', 'not again', 'we move', 'say less', 'lock it in', 'bet',
    'damn', 'oh hell no', 'wtf bro', 'no damn way', 'hell yeah',
  ]
  const mid = [
    'wait actually that could work', 'I can do 9 but not earlier', 'whose car are we taking',
    'someone book the table I always do it', 'my bracket is officially dead',
    'the wifi here is criminal', 'just landed, place is unreal', 'rate my plate',
    'why is this group like this', 'I need this group to focus for 5 minutes',
    'we need a spreadsheet for this I am serious', 'my boss just walked past my screen lol',
    'putting this in the calendar right now', 'whoever picked this restaurant owes me',
    'ok votes please, thumbs up or down', 'I vote we just do it and apologize later',
    'the fantasy waiver wire at 2am hits different', 'my sleep schedule is a war crime',
    'who changed the group name again', 'this conversation is why I have trust issues',
    'I just walked 40 minutes for nothing the place is closed',
    'imagine being this wrong publicly', 'screenshotting this for when you lose',
  ]
  const long = [
    'ok hear me out. we book the place for friday, everyone transfers me by wednesday so I am not chasing people again, and whoever bails after thursday pays double. democracy has failed us, this is the new system',
    'so the trip update: flights are cheapest on the 14th, the apartment I found has a rooftop and is 5 min from the beach, and if we split it 5 ways it comes out less than last year. I need yes or no by tonight',
    'I just want it on the record that I called this exact outcome three weeks ago in this very chat and was mocked relentlessly. scroll up. I will wait. an apology would be the bare minimum',
    'the fantasy league constitution clearly states, and I quote, that trades after the deadline require unanimous approval. what happened last night was a coup and I will be escalating to the commissioner',
    'long story but basically the car wouldnt start, the guy from the garage shows up two hours late, looks at it for 45 seconds, charges me 150 and tells me it is "probably fine". it died again at the next light',
    'reminder for the millionth time: my sister is getting married on the 22nd so I am out that whole weekend, do NOT plan anything good without me or there will be consequences',
  ]
  const questions = [
    'what time works for everyone?', 'who is driving?', 'did anyone book it yet?',
    'are we doing gifts this year or not?', 'is the place kosher?', 'whats the score?',
    'can someone resend the address?', 'why am I only hearing about this now?',
    'who has the speaker from last time?', 'how much do I owe?', 'when did we decide this?',
  ]
  const linkMsgs = [
    'https://maps.app.goo.gl/x7Kq check this place out',
    'this video https://youtu.be/dQw4w9WgXcQ',
    'flights here https://www.kayak.com/flights/EWR-MIA',
    'https://www.espn.com/nba/story/_/id/injury-report this is bad for us',
  ]
  const trip = [
    'MIAMI BOYS', 'ok rooftop apartment confirmed 🏖️', 'packing literally 4 shirts',
    'who has sunscreen', 'flight got delayed an hour, classic', 'boarding now ✈️',
    'the humidity here is a personality', 'beach at 9 tomorrow no excuses',
    'last night was legendary and we never speak of it again',
  ]
  const fantasy = [
    'my team is cursed', 'WHO DROPPED HIM, WHO', 'waiver claim went through 😈',
    'starting a guy on a bye week is a choice', 'trade offer in your inbox, be brave',
    'projections mean nothing in this house', 'I am 0-4 and blaming all of you',
    'playoff math says I need a miracle and two injuries',
    'this damn waiver system is rigged I swear', 'who the hell benched their QB1 in the playoffs',
    'my kicker just cost me the week, absolute bullshit',
  ]

  const start = new Date(2023, 3, 9, 19, 12) // Apr 9 2023
  const end = new Date(2026, 5, 7)            // Jun 7 2026

  lines.push(androidSystem(new Date(2023, 3, 9, 19, 10), 'Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.'))
  lines.push(androidSystem(new Date(2023, 3, 9, 19, 10), 'Moshe created group "the boys"'))
  lines.push(androidSystem(new Date(2023, 3, 9, 19, 11), 'Moshe added Yanky, Duvid, Shloimy and Ari'))

  const renames = [
    [new Date(2023, 6, 2, 23, 40), 'Yanky changed the subject from "the boys" to "the boys 🐐"'],
    [new Date(2024, 1, 14, 21, 5), 'Duvid changed the subject from "the boys 🐐" to "valentines day victims"'],
    [new Date(2024, 1, 16, 10, 2), 'Moshe changed the subject from "valentines day victims" to "the boys 🐐"'],
    [new Date(2024, 8, 5, 22, 30), 'Ari changed the subject from "the boys 🐐" to "fantasy league group therapy"'],
    [new Date(2024, 11, 30, 23, 59), 'Moshe changed the subject from "fantasy league group therapy" to "the boys 🐐"'],
    [new Date(2025, 4, 18, 14, 0), "Duvid changed this group's icon"],
  ]
  let renameIdx = 0

  const pickSender = (exclude) => {
    const pairs = names.filter((n) => n !== exclude).map((n) => [n, P[n].talk])
    return rng.weighted(pairs)
  }
  const hourFor = (name) => rng.weighted(P[name].hours)

  const emojiBank = {
    Moshe: ['👍', '😂', '🙏', '✅', '😅'],
    Yanky: ['💀', '😭', '🌙', '🗿', '😤'],
    Duvid: ['😂', '🔥', '🙌', '🍕', '📸', '😍', '🤝', '🎉'],
    Shloimy: ['😂', '👀'],
    Ari: ['⚡', '😂', '🏀', '👊', '🤔'],
  }

  function craft(name, ctx, rngL) {
    const p = P[name]
    let text
    if (ctx === 'open') text = rngL.pick(openers)
    else if (ctx === 'trip') text = rngL.pick(trip)
    else if (ctx === 'fantasy') text = rngL.pick(fantasy)
    else if (rngL.chance(p.long)) text = rngL.pick(long)
    else if (rngL.chance(0.04)) text = rngL.pick(linkMsgs)
    else if (rngL.chance(p.q)) text = rngL.pick(questions)
    else if (rngL.chance(0.42)) text = rngL.pick(mid)
    else text = rngL.pick(short)
    if (rngL.chance(p.emoji)) text += ' ' + rngL.pick(emojiBank[name])
    if (name === 'Duvid' && rngL.chance(0.18)) text = text.toUpperCase() + '!!!'
    if (rngL.chance(0.025)) text += '\n' + rngL.pick(short) + '\n' + rngL.pick(short)
    if (rngL.chance(0.012)) text += ' <This message was edited>'
    return text
  }

  let t = start.getTime()
  let msgCount = 0
  while (t < end.getTime()) {
    // jump to next session: usually same/next day
    const day = new Date(t)
    const gapDays = rng.weighted([[0, 55], [1, 30], [2, 9], [3, 3], [5, 2], [9, 1]])
    const base = new Date(day.getFullYear(), day.getMonth(), day.getDate() + gapDays)
    const month = base.getMonth()
    const isTrip = base.getFullYear() === 2025 && month === 0 && base.getDate() >= 16 && base.getDate() <= 20
    const isFantasy = month >= 8 && month <= 11
    const ctxTag = isTrip ? 'trip' : isFantasy && rng.chance(0.35) ? 'fantasy' : 'normal'

    const starter = rng.weighted([['Moshe', 5], ['Ari', 3], ['Duvid', 2.5], ['Yanky', 1.6], ['Shloimy', 0.45]])
    const h = hourFor(starter)
    let cur = new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, rng.int(0, 59), 0).getTime()
    if (cur <= t) cur = t + rng.int(35, 200) * 60000
    t = cur

    while (renameIdx < renames.length && renames[renameIdx][0].getTime() < t) {
      lines.push(androidSystem(renames[renameIdx][0], renames[renameIdx][1]))
      renameIdx++
    }

    const burst = isTrip ? rng.int(14, 46) : rng.weighted([[rng.int(2, 5), 30], [rng.int(6, 14), 45], [rng.int(15, 34), 22], [rng.int(35, 70), 3]])
    let lastSender = null
    let lastWasFunny = false
    for (let i = 0; i < burst && t < end.getTime(); i++) {
      const sender = i === 0 ? starter : rng.chance(0.22) && lastSender ? lastSender : pickSender(rng.chance(0.7) ? lastSender : null)
      const p = P[sender]
      // reply latency: fast within burst, Ari fastest, Shloimy slowest
      const speed = sender === 'Ari' ? rng.int(10, 90) : sender === 'Shloimy' ? rng.int(120, 2400) : rng.int(25, 420)
      t += (i === 0 ? 0 : speed) * 1000
      const d = new Date(t)
      if (rng.chance(p.media)) {
        lines.push(androidLine(d, sender, '<Media omitted>'))
      } else if (rng.chance(0.006)) {
        lines.push(androidLine(d, sender, 'This message was deleted'))
      } else if (lastWasFunny && rng.chance(0.5) && sender !== lastSender) {
        lines.push(androidLine(d, sender, p.laugh + (rng.chance(0.3) ? ' ' + rng.pick(['im crying', 'STOP', 'no way', 'why is this so accurate', 'screenshot. saved.']) : '')))
        lastWasFunny = rng.chance(0.25)
      } else {
        const text = craft(sender, i === 0 ? 'open' : ctxTag === 'normal' ? 'mid' : ctxTag, rng)
        lines.push(androidLine(d, sender, text))
        lastWasFunny = rng.chance(sender === 'Yanky' || sender === 'Shloimy' ? 0.3 : 0.14)
      }
      lastSender = sender
      msgCount++
    }
    t += rng.int(20, 90) * 60000
  }

  // one dramatic 11-day silence in Aug 2024, broken memorably
  // (carve it out by filtering, then add the breaker)
  const silStart = new Date(2024, 7, 6).getTime()
  const silEnd = new Date(2024, 7, 17, 21, 4).getTime()
  const filtered = lines.filter((l) => {
    const m = l.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}), (\d{2}):(\d{2})/)
    if (!m) return true
    const ts = new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5]).getTime()
    return ts < silStart || ts > silEnd
  })
  const breaker = androidLine(new Date(2024, 7, 17, 21, 5), 'Shloimy', 'so is nobody going to acknowledge that this chat just flatlined for weeks')
  const after1 = androidLine(new Date(2024, 7, 17, 21, 6), 'Yanky', '💀💀 he speaks')
  const after2 = androidLine(new Date(2024, 7, 17, 21, 6), 'Ari', 'LMAOO the lurker breaks first, incredible')
  // insert in chronological position
  let insertAt = filtered.findIndex((l) => {
    const m = l.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}), (\d{2}):(\d{2})/)
    if (!m) return false
    return new Date(+m[3], +m[2] - 1, +m[1], +m[4], +m[5]).getTime() > silEnd
  })
  if (insertAt === -1) insertAt = filtered.length
  filtered.splice(insertAt, 0, breaker, after1, after2)

  console.log(`group: ${msgCount} messages generated`)
  return filtered.join('\n') + '\n'
}

// ---------------------------------------------------------------- couple chat
function generateCouple() {
  const rng = makeRng(8151991)
  const lines = []
  const start = new Date(2025, 1, 3, 20, 41)
  const end = new Date(2026, 5, 10)

  lines.push(iosSystem(new Date(2025, 1, 3, 20, 40), 'Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.'))
  lines.push(iosLine(new Date(2025, 1, 3, 20, 41), 'Jake', 'hey! it was really nice meeting you tonight :)'))
  lines.push(iosLine(new Date(2025, 1, 3, 20, 58), 'Mia', 'it was!! you owe me a rematch on the foosball though, that was rigged'))
  lines.push(iosLine(new Date(2025, 1, 3, 21, 2), 'Jake', 'rigged?? I won fair and square 😤'))
  lines.push(iosLine(new Date(2025, 1, 3, 21, 3), 'Mia', 'the table was tilted and you know it'))

  const jake = {
    morning: ['good morning ☀️', 'morning trouble', 'gm gm', 'morning! slept like a rock', 'good morning, dreamt about that pasta again'],
    night: ['goodnight ❤️', 'night night', 'sleep well love', 'go to SLEEP we said one more episode three episodes ago', 'gn, text me when you wake up'],
    love: ['I love you', 'love you so much', 'miss you already', 'you are my favorite person', 'ok but I really love you'],
    mid: ['how is your day going?', 'lunch was sad, rate my desk salad', 'my meeting got moved AGAIN', 'thinking about you', 'want me to pick anything up?', 'the gym was packed, did 20 min and left', 'my mom says hi btw', 'saw a dog that looked exactly like a gremlin, like you in the morning', 'I booked it!! dont make plans friday', 'we are out of coffee. emergency.', 'ok the new neighbor plays trumpet. badly. at 7am.'],
    short: ['haha', 'yes!!', 'omg', 'nooo', 'same', 'ok ok', 'deal', 'perfect', '❤️', '😂', 'cute', 'wait what', 'on my way', '5 min', 'send pic'],
  }
  const mia = {
    morning: ['morningggg', 'gm ❤️', 'good morning sleepyhead', 'morning! coffee acquired', 'up before you AGAIN, lazy'],
    night: ['goodnight 💕', 'night, dont stay up', 'sleepy. love you', 'gn gn gn', 'going to sleep, big day tmrw'],
    love: ['love you', 'love uuuu', 'I miss your face', 'so lucky I found you', 'love you more'],
    mid: ['ok update: my boss is officially insane', 'burrito place for dinner?? please', 'I aced it!!! told you the stress was for nothing', 'my sister wants to meet you, no pressure but pressure', 'can you call me when youre free?', 'found the cutest apartment listing, looking is free right', 'rate my outfit, be honest, but also lie', 'the train is delayed I want to scream', 'we should do a picnic saturday if it stays sunny', 'I bought plants. plural. again.', 'guess who got the project. GUESS.'],
    short: ['hahaha', 'yesss', 'stoppp', 'nooo way', 'okok', 'fine 😌', 'yay!!', '🥰', '😭', 'true', 'rude', 'maybe 😏', 'omw!', 'pls', 'always'],
  }
  const fight = {
    Jake: ['can we talk later', 'I did not say that', 'that is not what I meant and you know it', 'fine.', 'I just think it could have waited, that is all', 'ok'],
    Mia: ['you really embarrassed me back there', 'I dont want to do this over text', 'wow ok', 'sure', 'you always do this', 'k'],
  }
  const makeup = [
    ['Jake', 'I am sorry. genuinely. I was stressed about work and took it out on the weekend and that was not fair to you'],
    ['Mia', 'thank you for saying that. I am sorry too, I went straight to defcon 1'],
    ['Jake', 'defcon 1 is one of the reasons I love you, for the record'],
    ['Mia', 'do NOT make me laugh I am still mad for 10 more minutes'],
    ['Jake', 'noted. timer set ⏰'],
    ['Mia', 'ok timer done. I love you. burrito?'],
    ['Jake', 'burrito. 🌯❤️'],
  ]

  let t = start.getTime()
  const endT = end.getTime()
  const fightStart = new Date(2025, 9, 12).getTime()
  const fightEnd = new Date(2025, 9, 18, 19, 30).getTime()
  let madeUp = false

  while (t < endT) {
    const d0 = new Date(t)
    const next = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() + 1)
    // fight window: near-silence, then the makeup conversation
    if (next.getTime() > fightStart && next.getTime() < fightEnd) {
      if (rng.chance(0.5)) {
        const dd = new Date(next.getFullYear(), next.getMonth(), next.getDate(), rng.int(20, 22), rng.int(0, 59), rng.int(0, 59))
        const who = rng.pick(['Jake', 'Mia'])
        lines.push(iosLine(dd, who, rng.pick(fight[who])))
      }
      t = next.getTime() + 6 * 3600e3
      continue
    }
    if (!madeUp && next.getTime() >= fightEnd) {
      let mt = fightEnd
      for (const [who, text] of makeup) {
        lines.push(iosLine(new Date(mt), who, text))
        mt += rng.int(40, 240) * 1000
      }
      madeUp = true
      t = mt + 3600e3
      continue
    }

    const day = next
    // morning exchange
    if (rng.chance(0.88)) {
      const first = rng.chance(0.62) ? 'Mia' : 'Jake'
      const second = first === 'Mia' ? 'Jake' : 'Mia'
      const m1 = new Date(day.getFullYear(), day.getMonth(), day.getDate(), first === 'Mia' ? rng.int(6, 8) : rng.int(7, 9), rng.int(0, 59), rng.int(0, 59))
      lines.push(iosLine(m1, first, rng.pick(first === 'Mia' ? mia.morning : jake.morning)))
      const m2 = new Date(m1.getTime() + rng.int(2, 45) * 60000)
      lines.push(iosLine(m2, second, rng.pick(second === 'Mia' ? mia.morning : jake.morning)))
      t = m2.getTime()
    } else {
      t = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 10).getTime()
    }

    // daytime + evening bursts
    const bursts = rng.int(1, 4)
    for (let b = 0; b < bursts; b++) {
      const h = rng.weighted([[12, 3], [13, 3], [15, 2], [17, 3], [19, 4], [21, 5], [22, 3]])
      let bt = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, rng.int(0, 59), rng.int(0, 59)).getTime()
      if (bt <= t) bt = t + rng.int(20, 120) * 60000
      t = bt
      const n = rng.weighted([[rng.int(2, 6), 5], [rng.int(7, 16), 4], [rng.int(17, 30), 1.4]])
      let who = rng.chance(0.55) ? 'Mia' : 'Jake'
      for (let i = 0; i < n; i++) {
        const bank = who === 'Mia' ? mia : jake
        const d = new Date(t)
        if (rng.chance(0.05)) {
          lines.push(iosLine(d, who, '‎image omitted'))
        } else if (rng.chance(0.012)) {
          lines.push(iosLine(d, who, '‎sticker omitted'))
        } else if (rng.chance(0.008)) {
          lines.push(iosLine(d, who, '‎audio omitted'))
        } else {
          let text
          if (rng.chance(0.085)) text = rng.pick(bank.love)
          else if (rng.chance(0.5)) text = rng.pick(bank.mid)
          else text = rng.pick(bank.short)
          if (rng.chance(0.03)) text += '\nwait no\nignore that, autocorrect'
          lines.push(iosLine(d, who, text))
        }
        // mia replies fast, jake medium
        t += (who === 'Mia' ? rng.int(8, 120) : rng.int(20, 600)) * 1000
        who = rng.chance(0.3) ? who : who === 'Mia' ? 'Jake' : 'Mia'
      }
    }

    // goodnight
    if (rng.chance(0.85)) {
      const gn1 = new Date(day.getFullYear(), day.getMonth(), day.getDate(), rng.weighted([[22, 4], [23, 5], [0, 2]]), rng.int(0, 59), rng.int(0, 59))
      if (gn1.getHours() === 0) gn1.setDate(gn1.getDate() + 1)
      const first = rng.chance(0.5) ? 'Jake' : 'Mia'
      const second = first === 'Jake' ? 'Mia' : 'Jake'
      if (gn1.getTime() > t) {
        lines.push(iosLine(gn1, first, rng.pick(first === 'Jake' ? jake.night : mia.night)))
        const gn2 = new Date(gn1.getTime() + rng.int(1, 12) * 60000)
        lines.push(iosLine(gn2, second, rng.pick(second === 'Jake' ? jake.night : mia.night)))
        t = gn2.getTime()
      }
    }
    t = Math.max(t, new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 30).getTime())
  }

  console.log(`couple: ${lines.length} lines generated`)
  return lines.join('\n') + '\n'
}

// ------------------------------------------------------- small US-format file
function generateUS() {
  const rng = makeRng(424242)
  const lines = []
  let t = new Date(2025, 10, 1, 9, 15).getTime()
  const people = ['Dana', 'Sam']
  const msgs = ['hey, did you send the doc?', 'yep just now', 'got it, thanks!', 'lunch tomorrow?', 'cant, thursday?', 'thursday works', 'cool, usual place at noon', 'see you there 👍', '<Media omitted>', 'lol perfect']
  for (let i = 0; i < 140; i++) {
    lines.push(usLine(new Date(t), people[i % 2], msgs[i % msgs.length]))
    t += rng.int(30, 700) * 60000
  }
  return lines.join('\n') + '\n'
}

const group = generateGroup()
const couple = generateCouple()
const us = generateUS()
writeFileSync(join(OUT, 'group.txt'), group)
writeFileSync(join(OUT, 'couple.txt'), couple)
writeFileSync(join(OUT, 'us-format.txt'), us)
console.log('written to', OUT)
console.log('group lines:', group.split('\n').length, '| couple lines:', couple.split('\n').length)
