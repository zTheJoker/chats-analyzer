import { useCallback, useEffect, useMemo, useState } from 'react'
import { parseChat, parseFile, type ParseResult } from './lib/parser'
import { analyze, type Analysis } from './lib/analyze'
import { Landing } from './components/Landing'
import { Reveal } from './components/Reveal'
import { Dashboard } from './components/Dashboard'

type Stage = 'landing' | 'reveal' | 'dashboard'

export default function App() {
  const [stage, setStage] = useState<Stage>('landing')
  const [parsed, setParsed] = useState<ParseResult | null>(null)
  const [year, setYear] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('receipts-theme') ?? 'dark')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('receipts-theme', theme)
  }, [theme])

  const years = useMemo(() => {
    if (!parsed) return []
    return [...new Set(parsed.messages.map((m) => new Date(m.ts).getFullYear()))].sort()
  }, [parsed])

  const fullAnalysis = useMemo(() => (parsed ? analyze(parsed) : null), [parsed])

  const view = useMemo(() => {
    if (!parsed || !fullAnalysis) return null
    if (year === null) return { analysis: fullAnalysis, messages: parsed.messages }
    const messages = parsed.messages.filter((m) => new Date(m.ts).getFullYear() === year)
    if (messages.length === 0) return { analysis: fullAnalysis, messages: parsed.messages }
    const present = new Set(messages.map((m) => m.sender))
    const a: Analysis = analyze({
      ...parsed,
      messages,
      systemEvents: parsed.systemEvents.filter((s) => new Date(s.ts).getFullYear() === year),
      participants: parsed.participants.filter((p) => present.has(p)),
    })
    a.period = `${year} wrapped`
    return { analysis: a, messages }
  }, [parsed, fullAnalysis, year])

  const ingest = useCallback((p: ParseResult) => {
    setParsed(p)
    setYear(null)
    setStage('reveal')
    setError(null)
  }, [])

  const onFile = useCallback(async (f: File) => {
    setBusy(true)
    setError(null)
    try {
      await new Promise((r) => setTimeout(r, 30)) // let the "reading…" state paint
      ingest(await parseFile(f))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong reading that file.')
    } finally {
      setBusy(false)
    }
  }, [ingest])

  const onDemo = useCallback(async (which: 'group' | 'couple') => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}samples/${which}.txt`)
      if (!res.ok) throw new Error('Demo data failed to load.')
      const text = await res.text()
      ingest(parseChat(text, which === 'group' ? 'WhatsApp Chat - the boys 🐐.txt' : 'WhatsApp Chat - Mia ❤️.txt'))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Demo failed to load.')
    } finally {
      setBusy(false)
    }
  }, [ingest])

  const reset = useCallback(() => {
    setParsed(null)
    setYear(null)
    setStage('landing')
  }, [])

  return (
    <>
      <div className="ambient" aria-hidden>
        <div className="orb orb-a" /><div className="orb orb-b" /><div className="orb orb-c" />
      </div>
      <div className="grain" aria-hidden />
      {stage === 'landing' && <Landing onFile={onFile} onDemo={onDemo} busy={busy} error={error} />}
      {stage === 'reveal' && fullAnalysis && <Reveal a={fullAnalysis} onDone={() => setStage('dashboard')} />}
      {stage === 'dashboard' && view && (
        <Dashboard
          a={view.analysis}
          messages={view.messages}
          years={years}
          year={year}
          setYear={setYear}
          onReset={reset}
          theme={theme}
          setTheme={setTheme}
        />
      )}
    </>
  )
}
