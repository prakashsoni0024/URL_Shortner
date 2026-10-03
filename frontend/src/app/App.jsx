import { useState, useEffect, useRef, useMemo } from 'react'
import axios from 'axios'

import './App.css'

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

const BRAND = 'Snip'
const API_URL = 'http://localhost:5173/api/url'
const SHORT_BASE = 'http://localhost:3000'

const shortLinkOf = (code) => `${SHORT_BASE}/${code}`

/* Fonts + the one entrance animation. Move this into App.css if you prefer. */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');
.font-display { font-family: 'Bricolage Grotesque', ui-sans-serif, system-ui, sans-serif; }
.font-body { font-family: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif; }
.font-code { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; }
@keyframes reveal {
  from { opacity: 0; transform: translateY(10px) scale(0.985); }
  to { opacity: 1; transform: none; }
}
.reveal { animation: reveal 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
@media (prefers-reduced-motion: reduce) { .reveal { animation: none; } }
`

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2'

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function parseUrl(raw) {
  try {
    const u = new URL(raw)
    const rest = u.pathname === '/' && !u.search ? '' : u.pathname + u.search
    return { host: u.hostname.replace(/^www\./, ''), rest }
  } catch {
    return { host: raw, rest: '' }
  }
}

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

const Icon = ({ children, className = 'h-4 w-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
)

const CopyIcon = (p) => (
  <Icon {...p}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Icon>
)
const CheckIcon = (p) => (
  <Icon {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
)
const TrashIcon = (p) => (
  <Icon {...p}>
    <path d="M3 6h18" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Icon>
)
const ExternalIcon = (p) => (
  <Icon {...p}>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </Icon>
)
const CloseIcon = (p) => (
  <Icon {...p}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </Icon>
)
const LinkIcon = (p) => (
  <Icon {...p}>
    <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
    <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
  </Icon>
)

/* ------------------------------------------------------------------ */
/* Table row                                                           */
/* ------------------------------------------------------------------ */

const ROW_GRID =
  'md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)_auto]'

function LinkRow({ url, maxClicks, copied, confirming, onCopy, onDelete }) {
  const { host, rest } = parseUrl(url.originalUrl)
  const pct = maxClicks > 0 ? Math.max((url.clicks / maxClicks) * 100, url.clicks > 0 ? 4 : 0) : 0

  return (
    <li
      className={`grid grid-cols-1 gap-3 border-t border-[#E9ECF4] px-5 py-4 first:border-t-0 md:items-center md:gap-6 ${ROW_GRID}`}
    >
      {/* Short link */}
      <a
        href={shortLinkOf(url.shortCode)}
        target="_blank"
        rel="noreferrer"
        className={`group inline-flex w-fit items-center gap-1.5 rounded font-code text-sm font-medium text-[#161B33] hover:text-orange-700 ${focusRing}`}
      >
        /{url.shortCode}
        <ExternalIcon className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
      </a>

      {/* Destination */}
      <div className="min-w-0" title={url.originalUrl}>
        <p className="truncate text-sm font-medium text-[#161B33]">{host}</p>
        {rest && <p className="truncate text-sm text-[#5F6585]">{rest}</p>}
      </div>

      {/* Clicks */}
      <div className="flex items-center gap-3">
        <span className="min-w-[2rem] text-sm font-semibold tabular-nums text-[#161B33]">
          {url.clicks}
          <span className="ml-1 font-normal text-[#5F6585] md:hidden">clicks</span>
        </span>
        <div className="h-1.5 flex-1 rounded-full bg-[#ECEEF5]">
          <div
            className="h-full rounded-full bg-orange-500 transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 md:justify-end">
        <button
          type="button"
          onClick={onCopy}
          className={`inline-flex w-[92px] cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${focusRing} ${
            copied
              ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
              : 'border-[#DADEEB] bg-white text-[#161B33] hover:bg-[#F5F6FA]'
          }`}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className={`inline-flex w-[92px] cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${focusRing} ${
            confirming
              ? 'border-red-700 bg-red-700 text-white'
              : 'border-[#DADEEB] bg-white text-[#161B33] hover:border-red-300 hover:text-red-700'
          }`}
        >
          <TrashIcon />
          {confirming ? 'Confirm' : 'Delete'}
        </button>
      </div>
    </li>
  )
}

/* ------------------------------------------------------------------ */
/* App                                                                 */
/* ------------------------------------------------------------------ */

function App() {
  const [urls, setUrls] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [currentUrl, setCurrentUrl] = useState(null)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [loadError, setLoadError] = useState('')
  const [copiedKey, setCopiedKey] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const copyTimer = useRef(null)
  const confirmTimer = useRef(null)

  const totalClicks = useMemo(() => urls.reduce((sum, u) => sum + (u.clicks || 0), 0), [urls])
  const maxClicks = useMemo(() => urls.reduce((max, u) => Math.max(max, u.clicks || 0), 0), [urls])

  async function fetchUrls() {
    try {
      const response = await axios.get(API_URL)
      setUrls(response.data.data.urls)
      setLoadError('')
    } catch {
      setLoadError("Couldn't load your links. Check that the server is running and try again.")
    } finally {
      setLoading(false)
    }
  }

  async function createShortUrl(e) {
    e.preventDefault()

    const raw = inputValue.trim()
    if (!raw) {
      setFormError('Paste a URL to shorten.')
      return
    }

    // Accept "example.com/page" by adding https:// when no scheme is given
    const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
    try {
      new URL(normalized)
    } catch {
      setFormError("That doesn't look like a valid URL. Check it and try again.")
      return
    }

    setFormError('')
    setSubmitting(true)

    try {
      const response = await axios.post(API_URL, { url: normalized })
      const data = response.data.data

      setCurrentUrl({
        _id: data._id,
        originalUrl: data.originalUrl,
        shortCode: data.shortCode,
      })
      setInputValue('')
      await fetchUrls()
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Couldn't shorten this link. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function copyText(text, key) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopiedKey(null), 1800)
    } catch {
      setFormError("Couldn't copy to the clipboard. Select the link and copy it manually.")
    }
  }

  async function deleteUrl(id) {
    // First click arms the button, second click confirms
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id)
      clearTimeout(confirmTimer.current)
      confirmTimer.current = setTimeout(() => setConfirmDeleteId(null), 3000)
      return
    }

    clearTimeout(confirmTimer.current)
    setConfirmDeleteId(null)

    try {
      await axios.delete(`${API_URL}/${id}`)
      if (currentUrl?._id === id) setCurrentUrl(null)
      await fetchUrls()
    } catch {
      setLoadError("Couldn't delete that link. Please try again.")
    }
  }

  useEffect(() => {
    fetchUrls()
    return () => {
      clearTimeout(copyTimer.current)
      clearTimeout(confirmTimer.current)
    }
  }, [])

  const currentShort = currentUrl ? shortLinkOf(currentUrl.shortCode) : ''

  return (
    <div className="font-body min-h-screen bg-[#F5F6FA] text-[#161B33] antialiased">
      <style>{STYLES}</style>

      {/* Header */}
      <header className="mx-auto flex max-w-5xl items-center gap-2.5 px-6 py-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-700 text-white">
          <LinkIcon className="h-[18px] w-[18px]" />
        </span>
        <span className="font-display text-xl font-semibold tracking-tight">{BRAND}</span>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24">
        {/* Hero + form */}
        <section className="pt-8 sm:pt-14">
          <h1 className="font-display max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Turn long links into short ones.
          </h1>
          <p className="mt-4 max-w-xl text-base text-[#5F6585] sm:text-lg">
            Paste any URL below. You'll get a short link to share, and every click on it is counted.
          </p>

          <form
            onSubmit={createShortUrl}
            noValidate
            className="mt-8 flex flex-col gap-2 rounded-2xl border border-[#E2E5EF] bg-white p-2 shadow-[0_1px_0_rgba(22,27,51,0.04),0_18px_40px_-20px_rgba(22,27,51,0.3)] sm:flex-row"
          >
            <label htmlFor="long-url" className="sr-only">
              Long URL
            </label>
            <div className="relative flex-1">
              <LinkIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8A90AB]" />
              <input
                id="long-url"
                type="text"
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                placeholder="Paste your long URL here"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  if (formError) setFormError('')
                }}
                aria-invalid={Boolean(formError)}
                aria-describedby={formError ? 'form-error' : undefined}
                className="h-14 w-full rounded-xl bg-transparent pl-12 pr-4 text-base text-[#161B33] placeholder:text-[#8A90AB] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-600"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className={`h-14 cursor-pointer rounded-xl bg-orange-700 px-8 text-base font-semibold text-white transition-colors hover:bg-orange-800 disabled:cursor-wait disabled:opacity-70 ${focusRing}`}
            >
              {submitting ? 'Shortening...' : 'Shorten link'}
            </button>
          </form>

          {formError && (
            <p id="form-error" role="alert" className="mt-3 text-sm font-medium text-red-700">
              {formError}
            </p>
          )}
        </section>

        {/* Current URL: result of the last shortened link */}
        {currentUrl && (
          <section
            key={currentUrl.shortCode + currentUrl._id}
            aria-live="polite"
            className="reveal mt-6 rounded-2xl bg-[#161B33] p-6 text-white sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-[#B7BCD6]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[#161B33]">
                  <CheckIcon className="h-3 w-3" />
                </span>
                Your short link is ready
              </p>
              <button
                type="button"
                onClick={() => setCurrentUrl(null)}
                aria-label="Dismiss"
                className={`-m-1 cursor-pointer rounded-lg p-1 text-[#B7BCD6] transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500`}
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <a
              href={currentShort}
              target="_blank"
              rel="noreferrer"
              className="font-display mt-4 block break-all text-3xl font-semibold tracking-tight hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 sm:text-5xl"
            >
              <span className="text-[#8E94B3]">{SHORT_BASE.replace(/^https?:\/\//, '')}/</span>
              {currentUrl.shortCode}
            </a>

            <p className="mt-3 truncate text-sm text-[#B7BCD6]" title={currentUrl.originalUrl}>
              Redirects to {currentUrl.originalUrl}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => copyText(currentShort, 'current')}
                className="inline-flex min-w-[130px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-[#161B33] transition-colors hover:bg-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#161B33]"
              >
                {copiedKey === 'current' ? <CheckIcon /> : <CopyIcon />}
                {copiedKey === 'current' ? 'Copied' : 'Copy link'}
              </button>
              <a
                href={currentShort}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#161B33]"
              >
                <ExternalIcon />
                Open link
              </a>
            </div>
          </section>
        )}

        {/* Links table */}
        <section className="mt-14">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
            <h2 className="font-display text-2xl font-semibold tracking-tight">Your links</h2>
            {!loading && urls.length > 0 && (
              <p className="text-sm text-[#5F6585]">
                {urls.length} {urls.length === 1 ? 'link' : 'links'}, {totalClicks}{' '}
                {totalClicks === 1 ? 'click' : 'clicks'} in total
              </p>
            )}
          </div>

          {loadError && (
            <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {loadError}
            </p>
          )}

          <div className="overflow-hidden rounded-2xl border border-[#E2E5EF] bg-white">
            {/* Column headings (desktop only) */}
            <div
              className={`hidden gap-6 border-b border-[#E9ECF4] bg-[#FAFBFD] px-5 py-3 text-sm font-medium text-[#5F6585] md:grid ${ROW_GRID}`}
            >
              <span>Short link</span>
              <span>Destination</span>
              <span>Clicks</span>
              {/* Matches the width of the two action buttons */}
              <span className="w-[192px]" aria-hidden="true" />
            </div>

            {loading ? (
              <ul aria-busy="true">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="border-t border-[#E9ECF4] px-5 py-5 first:border-t-0">
                    <div className="h-4 w-full max-w-md animate-pulse rounded bg-[#ECEEF5]" />
                  </li>
                ))}
              </ul>
            ) : urls.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <p className="font-display text-lg font-semibold">No links yet</p>
                <p className="mt-1 text-sm text-[#5F6585]">
                  Paste a URL above and your first short link will show up here.
                </p>
              </div>
            ) : (
              <ul>
                {urls.map((url) => (
                  <LinkRow
                    key={url._id}
                    url={url}
                    maxClicks={maxClicks}
                    copied={copiedKey === url._id}
                    confirming={confirmDeleteId === url._id}
                    onCopy={() => copyText(shortLinkOf(url.shortCode), url._id)}
                    onDelete={() => deleteUrl(url._id)}
                  />
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App