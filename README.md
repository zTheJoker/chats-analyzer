# receipts* 🧾

> Your chat has secrets. Get the receipts.

A free, **100% client-side** WhatsApp chat analyzer. Drop an exported chat
(.txt or .zip) and get eleven lenses on it: headline stats, a 7×24 activity
heatmap (per person too) plus a contribution-graph calendar, reply-speed
forensics, signature vocabulary per person, emoji analysis, yearbook awards,
all-time records, a milestone timeline, a Time Machine (search any word's
history in the chat, "on this day" flashbacks, the all-time marathon
conversations), per-person profiles (with a compatibility score for couples),
and receipt-styled share cards you can export as PNGs. A year filter rewinds
everything into "2024 Wrapped"-style views.

The vibe engine is real analysis, not vibes: a chat-tuned sentiment lexicon
with negation and intensifier handling, blended with affection rate and
volume-crash detection, z-scored against the chat's own baseline. In the
sample data it correctly identifies both the couple's October fight (mostly
silence and terse messages — no angry words) and the group's 20-day dead
period as the rockiest months, and the Miami trip as the best one. Those are
regression tests now.

**Privacy is the whole product:** nothing is ever uploaded. There is no
server. Parsing, analysis, and image export all happen in the browser.
Open DevTools → Network tab and watch nothing leave.

**Live:** https://receipts-the-gang1.vercel.app · demo reel at `/demo`

## Run it

```bash
cd ~/projects/receipts
npm install
npm run dev        # → http://localhost:4747
```

- **Demo reel** (self-contained animated promo, no video file):
  http://localhost:4747/demo.html — also works opened straight from disk
  (`public/demo.html`).
- **Demo data:** the landing page has two demo buttons (a 3-year group chat,
  a 16-month couple chat) — ~22k generated messages so every feature is
  populated. Sample export files live in `public/samples/`
  (`group.txt` Android format, `couple.txt` iOS format, `group-export.zip`
  a real zipped export).

## Scripts

```bash
npm run build        # type-check + production bundle (dist/)
npm run samples      # regenerate the sample chats (seeded, reproducible)
npm run test:parse   # parser + analysis engine checks on all formats
node scripts/verify-ui.mjs   # headless-Chromium walkthrough of the whole app
```

## What it parses

Real WhatsApp export formats, all variants:

- iOS bracketed (`[21/04/2024, 21:30:45] Name: msg`) and Android dash
  (`21/04/2024, 21:30 - Name: msg`)
- 12h (AM/PM, incl. narrow-nbsp variants) and 24h times, with/without seconds
- DD/MM vs MM/DD auto-detection (explicit evidence first, chronology fallback)
- multi-line messages, LTR/RTL invisible marks, BOM
- system messages (group created/renamed, joins/leaves, encryption notices)
- media placeholders (`<Media omitted>`, `image omitted`, `<attached: …>`,
  `(file attached)`) with type detection, deleted messages, `<This message
  was edited>`, calls
- `.zip` exports (unzipped client-side via fflate)

## Stack

Vite + React 19 + TypeScript, framer-motion for animation, hand-rolled SVG
charts, fflate (zip), html-to-image (PNG export), self-hosted fonts
(Instrument Serif / Inter / JetBrains Mono). No chart library, no CSS
framework, no analytics, no network calls.
