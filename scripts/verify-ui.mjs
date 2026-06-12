// Drives the real app in headless Chromium: demo flow, every tab, zip upload,
// share-card export, mobile viewport. Screenshots land in /tmp/receipts-shots.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = 'http://localhost:4747'
const SHOTS = '/tmp/receipts-shots'
mkdirSync(SHOTS, { recursive: true })

const errors = []
let failures = 0
const check = (label, cond, extra = '') => {
  console.log(`${cond ? '✓' : '✗ FAIL'} ${label}${extra ? ` — ${extra}` : ''}`)
  if (!cond) failures++
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', (e) => errors.push(String(e)))

// 1. landing
await page.goto(BASE)
await page.waitForTimeout(1600)
check('landing headline', await page.getByText('Get the').first().isVisible())
check('privacy pill', await page.getByText('never leaves this browser').isVisible())
await page.screenshot({ path: `${SHOTS}/01-landing.png` })

// 2. demo group → reveal
await page.getByRole('button', { name: /Demo: a group chat/ }).click()
await page.waitForTimeout(2500)
check('reveal shows chat name', await page.getByText('the boys').first().isVisible())
await page.screenshot({ path: `${SHOTS}/02-reveal-1.png` })
await page.mouse.click(720, 450) // advance
await page.waitForTimeout(2300)
await page.screenshot({ path: `${SHOTS}/03-reveal-2.png` })
await page.getByRole('button', { name: /skip/ }).click()
await page.waitForTimeout(1200)

// 3. dashboard tabs
check('verdict headline', await page.getByText('the verdict on').isVisible())
await page.screenshot({ path: `${SHOTS}/04-verdict.png` })

const tabs = ['Pulse', 'Reflexes', 'Vocabulary', 'Hieroglyphics', 'Superlatives', 'Hall of Fame', 'The Saga', 'Time Machine', 'The Cast', 'Share']
for (const t of tabs) {
  await page.getByRole('button', { name: t, exact: false }).first().click()
  await page.waitForTimeout(1100)
  const slug = t.toLowerCase().replace(/\s+/g, '-')
  await page.screenshot({ path: `${SHOTS}/05-${slug}.png` })
}
check('share studio receipt visible', await page.getByText('THANK YOU FOR OVERSHARING').isVisible())

// 3b. time machine: word tracker + marathons
await page.getByRole('button', { name: 'Time Machine' }).click()
await page.waitForTimeout(900)
await page.getByPlaceholder(/poker/).fill('poker')
await page.waitForTimeout(900)
check('word tracker finds mentions', await page.getByText('mentions').isVisible())
check('word tracker sightings', await page.getByText('latest sightings').isVisible())
await page.screenshot({ path: `${SHOTS}/05b-timemachine-search.png` })
await page.mouse.wheel(0, 2600)
await page.waitForTimeout(800)
check('marathons listed', await page.getByText('how it started').first().isVisible())
await page.screenshot({ path: `${SHOTS}/05c-timemachine-marathons.png` })

// 3c. year filter → wrapped
await page.getByRole('button', { name: 'The Verdict' }).click()
await page.waitForTimeout(600)
await page.getByRole('button', { name: '2024', exact: true }).click()
await page.waitForTimeout(1300)
check('2024 wrapped renders verdict', await page.getByText('the verdict on').isVisible())
await page.screenshot({ path: `${SHOTS}/05d-wrapped-2024.png` })
await page.getByRole('button', { name: '🧾 Share', exact: false }).first().click()
await page.waitForTimeout(1000)
check('wrapped tag on receipt', (await page.locator('.r-tag').first().textContent()) === '2024 WRAPPED')
await page.getByRole('button', { name: 'all time' }).click()
await page.waitForTimeout(1400) // back to all-time; still on the Share tab for the download test below

// 4. share export produces a PNG download
const dlPromise = page.waitForEvent('download', { timeout: 20000 })
await page.getByRole('button', { name: /download PNG/ }).click()
const dl = await dlPromise
check('share card downloads PNG', dl.suggestedFilename().endsWith('.png'), dl.suggestedFilename())
await dl.saveAs(`${SHOTS}/card-export.png`)

// 5. scroll checks on a content tab
await page.getByRole('button', { name: 'The Saga' }).click()
await page.waitForTimeout(800)
await page.mouse.wheel(0, 2400)
await page.waitForTimeout(900)
await page.screenshot({ path: `${SHOTS}/06-saga-scrolled.png` })
check('saga has silence milestone', await page.getByText('of silence').first().isVisible().catch(() => false))

// 6. new chat → zip upload (real WhatsApp-style zip)
await page.getByRole('button', { name: /new chat/ }).click()
await page.waitForTimeout(800)
const input = page.locator('input[type=file]')
await input.setInputFiles('public/samples/group-export.zip')
await page.waitForTimeout(3000)
check('zip upload reaches reveal', await page.getByText('we read every message', { exact: false }).isVisible())
await page.getByRole('button', { name: /skip/ }).click()
await page.waitForTimeout(900)
check('zip-parsed chat name', await page.getByText('the boys 🐐').first().isVisible())

// 7. couple demo → compatibility
await page.getByRole('button', { name: /new chat/ }).click()
await page.waitForTimeout(600)
await page.getByRole('button', { name: /Demo: a couple/ }).click()
await page.waitForTimeout(2200)
await page.getByRole('button', { name: /skip/ }).click()
await page.waitForTimeout(800)
await page.getByRole('button', { name: 'The Cast' }).click()
await page.waitForTimeout(1400)
check('compatibility ring', await page.getByText('compatibility').first().isVisible())
await page.screenshot({ path: `${SHOTS}/07-couple-cast.png` })

// 8. light theme
await page.getByRole('button', { name: '☀️' }).click()
await page.waitForTimeout(700)
await page.screenshot({ path: `${SHOTS}/08-light.png` })

// 9. mobile viewport
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } })
mob.on('pageerror', (e) => errors.push(String(e)))
await mob.goto(BASE)
await mob.waitForTimeout(1400)
await mob.screenshot({ path: `${SHOTS}/09-mobile-landing.png` })
await mob.getByRole('button', { name: /Demo: a group chat/ }).click()
await mob.waitForTimeout(2400)
await mob.getByRole('button', { name: /skip/ }).click()
await mob.waitForTimeout(1100)
await mob.screenshot({ path: `${SHOTS}/10-mobile-verdict.png` })
check('mobile dashboard renders', await mob.getByText('the verdict on').isVisible())

// 10. demo reel
const reel = await browser.newPage({ viewport: { width: 1280, height: 800 } })
reel.on('pageerror', (e) => errors.push(String(e)))
await reel.goto(`${BASE}/demo.html`)
await reel.waitForTimeout(2500)
await reel.screenshot({ path: `${SHOTS}/11-reel-scene1.png` })
await reel.waitForTimeout(16000)
await reel.screenshot({ path: `${SHOTS}/12-reel-mid.png` })

check('zero console/page errors', errors.length === 0, errors.slice(0, 3).join(' | '))
await browser.close()
console.log(failures === 0 ? '\nUI VERIFICATION PASSED' : `\n${failures} UI CHECKS FAILED`)
process.exit(failures === 0 ? 0 : 1)
