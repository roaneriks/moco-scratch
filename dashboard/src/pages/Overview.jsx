import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const PINK = '#E4007B'
const SCREENS = ['welcome', 'pick', 'insights', 'scratch', 'reveal', 'share']

const DATE_RANGES = [
  { label: 'Today', key: 'today' },
  { label: 'Last 7 days', key: '7d' },
  { label: 'Last 30 days', key: '30d' },
  { label: 'All time', key: 'all' },
]

function getDateFilter(key) {
  const now = new Date()
  if (key === 'today') {
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    return start.toISOString()
  }
  if (key === '7d') {
    const d = new Date(now)
    d.setDate(d.getDate() - 7)
    return d.toISOString()
  }
  if (key === '30d') {
    const d = new Date(now)
    d.setDate(d.getDate() - 30)
    return d.toISOString()
  }
  return null
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function KpiCard({ label, value, loading }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 flex flex-col gap-1 shadow-sm">
      <span className="text-3xl font-bold text-gray-900">
        {loading ? <span className="inline-block w-16 h-8 bg-gray-100 rounded animate-pulse" /> : value}
      </span>
      <span className="text-sm text-gray-500 font-medium">{label}</span>
    </div>
  )
}

export default function Overview() {
  const [range, setRange] = useState('7d')
  const [kpis, setKpis] = useState(null)
  const [artworkChart, setArtworkChart] = useState([])
  const [funnel, setFunnel] = useState([])
  const [peakHours, setPeakHours] = useState([])
  const [liveFeed, setLiveFeed] = useState([])
  const [loading, setLoading] = useState(true)
  const channelRef = useRef(null)

  useEffect(() => {
    fetchAll(range)
  }, [range])

  useEffect(() => {
    // Subscribe to live events
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }
    const channel = supabase
      .channel('live-events')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' }, (payload) => {
        setLiveFeed((prev) => [payload.new, ...prev].slice(0, 8))
      })
      .subscribe()
    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchAll(rangeKey) {
    setLoading(true)
    const since = getDateFilter(rangeKey)
    await Promise.all([
      fetchKpis(since),
      fetchArtworkChart(since),
      fetchFunnel(since),
      fetchPeakHours(since),
      fetchLiveFeed(),
    ])
    setLoading(false)
  }

  async function fetchKpis(since) {
    let sessionsQuery = supabase.from('sessions').select('id, completed_at', { count: 'exact' })
    if (since) sessionsQuery = sessionsQuery.gte('started_at', since)
    const { data: sessions, count: totalSessions } = await sessionsQuery

    const completedSessions = sessions?.filter((s) => s.completed_at != null).length ?? 0
    const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0

    let emailsQuery = supabase.from('emails').select('id', { count: 'exact' })
    if (since) emailsQuery = emailsQuery.gte('collected_at', since)
    const { count: emailCount } = await emailsQuery

    let igQuery = supabase
      .from('events')
      .select('id', { count: 'exact' })
      .eq('event_type', 'share_instagram_tapped')
    if (since) igQuery = igQuery.gte('timestamp', since)
    const { count: igCount } = await igQuery

    setKpis({
      totalSessions: totalSessions ?? 0,
      completionRate: `${completionRate}%`,
      emails: emailCount ?? 0,
      igTaps: igCount ?? 0,
    })
  }

  async function fetchArtworkChart(since) {
    let query = supabase
      .from('artwork_picks')
      .select('artwork_id, artworks(title)')
    if (since) query = query.gte('picked_at', since)
    const { data } = await query

    if (!data) return

    const counts = {}
    for (const row of data) {
      const title = row.artworks?.title ?? `Artwork ${row.artwork_id}`
      counts[title] = (counts[title] ?? 0) + 1
    }
    const sorted = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
    setArtworkChart(sorted)
  }

  async function fetchFunnel(since) {
    let query = supabase.from('events').select('session_id, screen_name')
    if (since) query = query.gte('timestamp', since)
    const { data } = await query

    if (!data) return

    let totalSessionsQuery = supabase.from('sessions').select('id', { count: 'exact' })
    if (since) totalSessionsQuery = totalSessionsQuery.gte('started_at', since)
    const { count: total } = await totalSessionsQuery

    const screenSessions = {}
    for (const screen of SCREENS) screenSessions[screen] = new Set()
    for (const row of data) {
      if (SCREENS.includes(row.screen_name)) {
        screenSessions[row.screen_name].add(row.session_id)
      }
    }

    const funnelData = SCREENS.map((screen) => {
      const count = screenSessions[screen].size
      const pct = total > 0 ? Math.round((count / total) * 100) : 0
      return { screen, count, pct }
    })
    setFunnel(funnelData)
  }

  async function fetchPeakHours(since) {
    let query = supabase.from('sessions').select('started_at')
    if (since) query = query.gte('started_at', since)
    const { data } = await query

    if (!data) return

    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }))
    for (const row of data) {
      const h = new Date(row.started_at).getHours()
      hours[h].count++
    }
    setPeakHours(hours)
  }

  async function fetchLiveFeed() {
    const { data } = await supabase
      .from('events')
      .select('id, event_type, timestamp, session_id')
      .order('timestamp', { ascending: false })
      .limit(8)
    setLiveFeed(data ?? [])
  }

  const maxFunnel = funnel[0]?.count || 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-lg p-1 shadow-sm">
          {DATE_RANGES.map(({ label, key }) => (
            <button
              key={key}
              onClick={() => setRange(key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                range === key
                  ? 'bg-[#E4007B] text-white'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Total Sessions" value={kpis?.totalSessions.toLocaleString()} loading={loading} />
        <KpiCard label="Completion Rate" value={kpis?.completionRate} loading={loading} />
        <KpiCard label="Emails Collected" value={kpis?.emails.toLocaleString()} loading={loading} />
        <KpiCard label="Instagram Taps" value={kpis?.igTaps.toLocaleString()} loading={loading} />
      </div>

      {/* Middle row: Artwork chart + Session funnel */}
      <div className="grid grid-cols-5 gap-4">
        {/* Artwork Popularity */}
        <div className="col-span-3 bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Artwork Popularity</h2>
          {loading ? (
            <div className="h-64 bg-gray-50 rounded animate-pulse" />
          ) : artworkChart.length === 0 ? (
            <p className="text-sm text-gray-400 h-64 flex items-center justify-center">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={artworkChart}
                layout="vertical"
                margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
              >
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#fdf2f8' }}
                  contentStyle={{ border: '1px solid #f3f4f6', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} fill={PINK} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Session Funnel */}
        <div className="col-span-2 bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Session Funnel</h2>
          {loading ? (
            <div className="h-64 bg-gray-50 rounded animate-pulse" />
          ) : funnel.length === 0 ? (
            <p className="text-sm text-gray-400">No data</p>
          ) : (
            <div className="space-y-2">
              {funnel.map(({ screen, count, pct }) => (
                <div key={screen}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-xs font-medium text-gray-600 capitalize">{screen}</span>
                    <span className="text-xs text-gray-400">{count.toLocaleString()} · {pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${maxFunnel > 0 ? (count / maxFunnel) * 100 : 0}%`,
                        backgroundColor: PINK,
                        opacity: 0.3 + (count / maxFunnel) * 0.7,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: Peak hours + Live feed */}
      <div className="grid grid-cols-5 gap-4">
        {/* Peak Hours */}
        <div className="col-span-3 bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Peak Hours</h2>
          {loading ? (
            <div className="h-40 bg-gray-50 rounded animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={peakHours} margin={{ top: 0, right: 8, bottom: 0, left: -20 }}>
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(h) => `${h}h`}
                  interval={3}
                />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: '#fdf2f8' }}
                  contentStyle={{ border: '1px solid #f3f4f6', borderRadius: 8, fontSize: 11 }}
                  formatter={(v) => [v, 'Sessions']}
                  labelFormatter={(h) => `${h}:00`}
                />
                <Bar dataKey="count" fill={PINK} radius={[3, 3, 0, 0]}>
                  {peakHours.map((entry, i) => (
                    <Cell key={i} fill={PINK} fillOpacity={entry.count > 0 ? 0.85 : 0.2} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Live Feed */}
        <div className="col-span-2 bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E4007B] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E4007B]" />
            </span>
            <h2 className="text-sm font-semibold text-gray-900">Live Events</h2>
          </div>
          {liveFeed.length === 0 ? (
            <p className="text-sm text-gray-400">No events yet</p>
          ) : (
            <ul className="space-y-2 overflow-hidden">
              {liveFeed.map((ev) => (
                <li key={ev.id} className="flex items-start gap-2">
                  <span className="flex-1 text-xs font-medium text-gray-700 break-all leading-5">
                    {ev.event_type}
                  </span>
                  <span className="flex-shrink-0 text-xs text-gray-400 whitespace-nowrap mt-0.5">
                    {timeAgo(ev.timestamp)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
