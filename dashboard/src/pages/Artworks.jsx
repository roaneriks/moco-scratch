import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  LineChart, Line, ResponsiveContainer, Tooltip, XAxis,
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

function Skeleton({ className = '' }) {
  return <div className={`bg-gray-100 rounded animate-pulse ${className}`} />
}

// Tiny sparkline — 30-day pick trend
function Sparkline({ data }) {
  if (!data || data.length === 0) return <span className="text-xs text-gray-400">—</span>
  return (
    <ResponsiveContainer width={80} height={28}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="count" stroke={PINK} strokeWidth={1.5} dot={false} />
        <Tooltip
          contentStyle={{ fontSize: 10, padding: '2px 6px', border: '1px solid #f3f4f6', borderRadius: 4 }}
          formatter={(v) => [v, 'picks']}
          labelFormatter={(l) => l}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default function Artworks() {
  const [range, setRange] = useState('30d')
  const [leaderboard, setLeaderboard] = useState([])
  const [totalPicks, setTotalPicks] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null) // artwork_id
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    fetchLeaderboard(range)
    setSelected(null)
    setDetail(null)
  }, [range])

  useEffect(() => {
    if (selected) fetchDetail(selected)
  }, [selected])

  async function fetchLeaderboard(rangeKey) {
    setLoading(true)
    const since = getDateFilter(rangeKey)

    let q = supabase
      .from('artwork_picks')
      .select('artwork_id, picked_at, artworks(id, title, artist_id, artists(name))')
    if (since) q = q.gte('picked_at', since)
    const { data } = await q

    if (!data) { setLoading(false); return }

    // Group by artwork
    const map = {}
    for (const row of data) {
      const id = row.artwork_id
      if (!map[id]) {
        map[id] = {
          artwork_id: id,
          title: row.artworks?.title ?? 'Unknown',
          artist: row.artworks?.artists?.name ?? '—',
          count: 0,
        }
      }
      map[id].count++
    }

    const sorted = Object.values(map)
      .sort((a, b) => b.count - a.count)

    const total = sorted.reduce((sum, r) => sum + r.count, 0)
    setTotalPicks(total)
    setLeaderboard(sorted.map((r, i) => ({ ...r, rank: i + 1, pct: total > 0 ? (r.count / total) * 100 : 0 })))
    setLoading(false)
  }

  async function fetchDetail(artworkId) {
    setDetailLoading(true)
    const since30 = getDateFilter('30d')

    // 1. Total picks for this artwork (from leaderboard)
    const row = leaderboard.find((r) => r.artwork_id === artworkId)
    const picks = row?.count ?? 0

    // 2. Insight card open rate
    const { count: insightCount } = await supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'insight_card_opened')
      .filter('metadata->>artwork_id', 'eq', artworkId)
    const insightRate = picks > 0 ? Math.round(((insightCount ?? 0) / picks) * 100) : 0

    // 3. Top pairing partner — find sessions that also picked this artwork
    const { data: sessionsWithArtwork } = await supabase
      .from('artwork_picks')
      .select('session_id')
      .eq('artwork_id', artworkId)
    const sessionIds = (sessionsWithArtwork ?? []).map((r) => r.session_id)

    let topPartner = null
    if (sessionIds.length > 0) {
      const { data: coPicks } = await supabase
        .from('artwork_picks')
        .select('artwork_id, artworks(title)')
        .in('session_id', sessionIds)
        .neq('artwork_id', artworkId)

      if (coPicks && coPicks.length > 0) {
        const pairCounts = {}
        for (const cp of coPicks) {
          const pid = cp.artwork_id
          if (!pairCounts[pid]) pairCounts[pid] = { title: cp.artworks?.title ?? 'Unknown', count: 0 }
          pairCounts[pid].count++
        }
        topPartner = Object.values(pairCounts).sort((a, b) => b.count - a.count)[0] ?? null
      }
    }

    // 4. Sparkline — daily picks over last 30 days
    const { data: recentPicks } = await supabase
      .from('artwork_picks')
      .select('picked_at')
      .eq('artwork_id', artworkId)
      .gte('picked_at', since30)
      .order('picked_at', { ascending: true })

    const sparkline = buildSparkline(recentPicks ?? [])

    setDetail({ picks, insightRate, insightCount: insightCount ?? 0, topPartner, sparkline })
    setDetailLoading(false)
  }

  function buildSparkline(picks) {
    const days = {}
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      days[key] = 0
    }
    for (const p of picks) {
      const key = p.picked_at?.slice(0, 10)
      if (key && days[key] !== undefined) days[key]++
    }
    return Object.entries(days).map(([date, count]) => ({
      date: date.slice(5), // "MM-DD"
      count,
    }))
  }

  const selectedRow = leaderboard.find((r) => r.artwork_id === selected)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Artworks</h1>
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

      {/* Leaderboard */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="text-sm font-semibold text-gray-900">Popularity Leaderboard</h2>
          <p className="text-xs text-gray-400 mt-0.5">{totalPicks.toLocaleString()} total picks</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-10">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Artwork</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Artist</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide w-20">Picks</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-48">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-3"><Skeleton className="h-4 w-4" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-36" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-8 ml-auto" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-2 w-32 rounded-full" /></td>
                  </tr>
                ))
              : leaderboard.length === 0
              ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">No pick data yet</td>
                </tr>
              )
              : leaderboard.map((row) => (
                  <tr
                    key={row.artwork_id}
                    onClick={() => setSelected(selected === row.artwork_id ? null : row.artwork_id)}
                    className={`cursor-pointer transition-colors ${
                      selected === row.artwork_id
                        ? 'bg-[#E4007B]/5'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-3 text-sm font-medium text-gray-400">{row.rank}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{row.artist}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right tabular-nums">
                      {row.count.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${row.pct}%`, backgroundColor: PINK }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 tabular-nums w-9 text-right">
                          {row.pct.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">{selectedRow?.title}</h2>
              <p className="text-sm text-gray-400">{selectedRow?.artist}</p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Close ✕
            </button>
          </div>

          {detailLoading ? (
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : detail ? (
            <>
              <div className="grid grid-cols-4 gap-4">
                {/* Total picks */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-gray-900">{detail.picks.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Total picks</p>
                </div>

                {/* Insight open rate */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-gray-900">{detail.insightRate}%</p>
                  <p className="text-xs text-gray-500 mt-1">Insight card open rate</p>
                  <p className="text-xs text-gray-400 mt-0.5">{detail.insightCount} opens</p>
                </div>

                {/* Top pairing partner */}
                <div className="bg-gray-50 rounded-xl p-4">
                  {detail.topPartner ? (
                    <>
                      <p className="text-sm font-bold text-gray-900 leading-tight">{detail.topPartner.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{detail.topPartner.count}× co-picked</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">No pairing data</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">Top pairing partner</p>
                </div>

                {/* Sparkline */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-end justify-between mb-1">
                    <p className="text-xs text-gray-500 font-medium">30-day pick trend</p>
                  </div>
                  <div className="mt-2">
                    {detail.sparkline.every((d) => d.count === 0) ? (
                      <p className="text-xs text-gray-400">No picks in last 30 days</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={50}>
                        <LineChart data={detail.sparkline}>
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke={PINK}
                            strokeWidth={2}
                            dot={false}
                          />
                          <XAxis dataKey="date" hide />
                          <Tooltip
                            contentStyle={{ fontSize: 10, padding: '2px 6px', border: '1px solid #f3f4f6', borderRadius: 4 }}
                            formatter={(v) => [v, 'picks']}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}
