import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const PINK = '#E4007B'

const DATE_RANGES = [
  { label: 'Today', key: 'today' },
  { label: 'Last 7 days', key: '7d' },
  { label: 'Last 30 days', key: '30d' },
  { label: 'All time', key: 'all' },
]

function getDateFilter(key) {
  const now = new Date()
  if (key === 'today') { const d = new Date(now); d.setHours(0,0,0,0); return d.toISOString() }
  if (key === '7d')  { const d = new Date(now); d.setDate(d.getDate() - 7); return d.toISOString() }
  if (key === '30d') { const d = new Date(now); d.setDate(d.getDate() - 30); return d.toISOString() }
  return null
}

function formatDuration(seconds) {
  if (seconds == null || isNaN(seconds)) return '—'
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

function formatDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function Skeleton({ className = '' }) {
  return <div className={`bg-gray-100 rounded animate-pulse ${className}`} />
}

function KpiCard({ label, value, sub, loading }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col gap-1">
      <span className="text-3xl font-bold text-gray-900">
        {loading ? <Skeleton className="h-8 w-20" /> : value}
      </span>
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      {sub && !loading && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  )
}

export default function Audience() {
  const [range, setRange] = useState('7d')
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState(null)
  const [emails, setEmails] = useState([])
  const [sessions, setSessions] = useState([])
  const [languages, setLanguages] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchAll(range)
  }, [range])

  async function fetchAll(rangeKey) {
    setLoading(true)
    const since = getDateFilter(rangeKey)
    await Promise.all([
      fetchKpisAndSessions(since),
      fetchEmails(since),
    ])
    setLoading(false)
  }

  async function fetchKpisAndSessions(since) {
    let q = supabase
      .from('sessions')
      .select('id, started_at, completed_at, language, duration_seconds')
    if (since) q = q.gte('started_at', since)
    q = q.order('started_at', { ascending: false })
    const { data } = await q

    const rows = data ?? []
    setSessions(rows)

    const completed = rows.filter((r) => r.completed_at != null)
    const durRows = rows.filter((r) => r.duration_seconds != null)
    const avgDur = durRows.length > 0
      ? Math.round(durRows.reduce((s, r) => s + r.duration_seconds, 0) / durRows.length)
      : null

    const langSet = new Set(rows.map((r) => r.language).filter(Boolean))

    // Language breakdown
    const langMap = {}
    for (const r of rows) {
      const l = r.language || 'Unknown'
      langMap[l] = (langMap[l] ?? 0) + 1
    }
    const langData = Object.entries(langMap)
      .map(([lang, count]) => ({ lang, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12)
    setLanguages(langData)

    setKpis((prev) => ({
      ...(prev ?? {}),
      avgDuration: avgDur,
      uniqueLangs: langSet.size,
      completedSessions: completed.length,
      totalSessions: rows.length,
    }))
  }

  async function fetchEmails(since) {
    let q = supabase
      .from('emails')
      .select('id, email, collected_at')
    if (since) q = q.gte('collected_at', since)
    q = q.order('collected_at', { ascending: false })
    const { data } = await q

    const rows = data ?? []
    setEmails(rows)
    setKpis((prev) => ({
      ...(prev ?? {}),
      emailCount: rows.length,
    }))
  }

  function exportCSV() {
    const filtered = filteredEmails
    const header = 'Email,Collected At'
    const rows = filtered.map((r) => `"${r.email}","${r.collected_at ?? ''}"`)
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `moco-emails-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredEmails = useMemo(() => {
    if (!search.trim()) return emails
    const q = search.toLowerCase()
    return emails.filter((r) => r.email?.toLowerCase().includes(q))
  }, [emails, search])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Audience</h1>
        <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-lg p-1 shadow-sm">
          {DATE_RANGES.map(({ label, key }) => (
            <button
              key={key}
              onClick={() => setRange(key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                range === key ? 'bg-[#E4007B] text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Emails Collected"
          value={(kpis?.emailCount ?? 0).toLocaleString()}
          loading={loading}
        />
        <KpiCard
          label="Avg Session Duration"
          value={formatDuration(kpis?.avgDuration)}
          loading={loading}
        />
        <KpiCard
          label="Unique Languages"
          value={(kpis?.uniqueLangs ?? 0).toLocaleString()}
          loading={loading}
        />
        <KpiCard
          label="Completed Sessions"
          value={(kpis?.completedSessions ?? 0).toLocaleString()}
          sub={kpis?.totalSessions ? `of ${kpis.totalSessions.toLocaleString()} total` : undefined}
          loading={loading}
        />
      </div>

      {/* Middle row: Emails + Language chart */}
      <div className="grid grid-cols-5 gap-4">
        {/* Email list */}
        <div className="col-span-3 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-gray-900 flex-shrink-0">Emails Collected</h2>
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-0 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#E4007B] placeholder-gray-400"
            />
            <button
              onClick={exportCSV}
              disabled={filteredEmails.length === 0}
              className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-[#E4007B] text-white rounded-lg disabled:opacity-40 hover:bg-[#c8006e] transition-colors"
            >
              Export CSV
            </button>
          </div>
          <div className="overflow-auto" style={{ maxHeight: 340 }}>
            <table className="w-full">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-50">
                  <th className="px-6 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Collected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-48" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-32 ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredEmails.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-sm text-gray-400">
                      {search ? 'No matching emails' : 'No emails collected yet'}
                    </td>
                  </tr>
                ) : (
                  filteredEmails.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 text-sm text-gray-800">{r.email}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 text-right whitespace-nowrap">
                        {r.collected_at
                          ? new Date(r.collected_at).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })
                          : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Language breakdown */}
        <div className="col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Language Breakdown</h2>
          {loading ? (
            <Skeleton className="h-48" />
          ) : languages.length === 0 ? (
            <p className="text-sm text-gray-400">No session data</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={languages}
                layout="vertical"
                margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
              >
                <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="lang"
                  width={90}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#fdf2f8' }}
                  contentStyle={{ border: '1px solid #f3f4f6', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [v, 'sessions']}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {languages.map((_, i) => (
                    <Cell
                      key={i}
                      fill={PINK}
                      fillOpacity={1 - i * (0.55 / Math.max(languages.length - 1, 1))}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent sessions log */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="text-sm font-semibold text-gray-900">Recent Sessions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Started</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Language</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-3"><Skeleton className="h-4 w-36" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                  </tr>
                ))
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400">No sessions yet</td>
                </tr>
              ) : (
                sessions.slice(0, 50).map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {formatDate(s.started_at)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 tabular-nums">
                      {formatDuration(s.duration_seconds)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {s.language || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {s.completed_at ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#E4007B]/10 text-[#E4007B]">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">
                          Abandoned
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
