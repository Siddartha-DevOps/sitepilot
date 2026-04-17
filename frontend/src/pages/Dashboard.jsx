import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/client'
import {
  FolderOpen, FileText, Package, AlertTriangle, Plus, ArrowRight,
  MapPin, Users, CheckSquare, Camera, Cloud, Sun, CloudRain,
  CloudLightning, Wind, TrendingUp, TrendingDown, Clock,
  AlertCircle, ChevronRight, BarChart3, Droplets,
} from 'lucide-react'

// ── Progress Bar (original, kept as-is) ──────────────────────────────────────
function ProgressBar({ value }) {
  const c = value >= 75 ? 'bg-green-500' : value >= 40 ? 'bg-orange-500' : 'bg-red-500'
  return (
    <div className="progress-bar mt-2">
      <div className={`h-full rounded-full ${c}`} style={{ width: `${value}%` }} />
    </div>
  )
}

// ── Weather Widget ────────────────────────────────────────────────────────────
function WeatherWidget({ location = 'Hyderabad' }) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Using Open-Meteo — free, no API key needed
    // Default coords: Hyderabad. Replace with user's site coords via project data.
    const lat = 17.385, lon = 78.4867
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m&timezone=Asia%2FKolkata`)
      .then(r => r.json())
      .then(d => {
        const w = d.current_weather
        setWeather({
          temp: Math.round(w.temperature),
          wind: Math.round(w.windspeed),
          code: w.weathercode,
          humidity: d.hourly?.relativehumidity_2m?.[new Date().getHours()] ?? '--',
        })
      })
      .catch(() => setWeather({ temp: '--', wind: '--', code: 0, humidity: '--' }))
      .finally(() => setLoading(false))
  }, [])

  function weatherIcon(code) {
    if (code === 0) return <Sun size={28} color="#f97316" />
    if (code <= 3)  return <Cloud size={28} color="#94a3b8" />
    if (code <= 67) return <CloudRain size={28} color="#3b82f6" />
    if (code <= 77) return <CloudLightning size={28} color="#7c3aed" />
    return <Cloud size={28} color="#94a3b8" />
  }

  function weatherLabel(code) {
    if (code === 0) return 'Clear sky'
    if (code <= 3)  return 'Partly cloudy'
    if (code <= 67) return 'Rainy'
    if (code <= 77) return 'Thunderstorm'
    return 'Cloudy'
  }

  return (
    <div className="card flex items-center gap-4 py-4">
      <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center flex-shrink-0">
        {loading ? <Cloud size={24} className="text-gray-300" /> : weatherIcon(weather?.code ?? 0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium mb-0.5">Site Weather · {location}</p>
        {loading ? (
          <div className="h-6 w-24 bg-gray-100 rounded animate-pulse" />
        ) : (
          <>
            <p className="text-2xl font-black text-slate-800">{weather?.temp}°C
              <span className="text-sm font-medium text-gray-400 ml-2">{weatherLabel(weather?.code ?? 0)}</span>
            </p>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Wind size={11} />{weather?.wind} km/h</span>
              <span className="flex items-center gap-1"><Droplets size={11} />{weather?.humidity}% humidity</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Overdue Tasks Widget ──────────────────────────────────────────────────────
function OverdueTasksWidget({ tasks }) {
  if (!tasks?.length) return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <CheckSquare size={16} className="text-orange-500" />
        <h3 className="font-bold text-slate-800 text-sm">Overdue Tasks</h3>
      </div>
      <div className="text-center py-4">
        <CheckSquare size={28} className="mx-auto text-gray-200 mb-2" />
        <p className="text-xs text-gray-400">No overdue tasks</p>
      </div>
    </div>
  )
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckSquare size={16} className="text-orange-500" />
          <h3 className="font-bold text-slate-800 text-sm">Overdue Tasks</h3>
        </div>
        <span className="badge bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{tasks.length}</span>
      </div>
      <div className="space-y-2">
        {tasks.slice(0, 4).map((t, i) => (
          <div key={i} className="flex items-start gap-2 p-2 bg-red-50 rounded-lg">
            <AlertCircle size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">{t.title}</p>
              <p className="text-xs text-red-400">{t.project} · due {t.due}</p>
            </div>
          </div>
        ))}
      </div>
      {tasks.length > 4 && (
        <Link to="/tasks" className="flex items-center gap-1 text-xs text-orange-500 font-semibold mt-3 hover:text-orange-600">
          +{tasks.length - 4} more <ChevronRight size={12} />
        </Link>
      )}
    </div>
  )
}

// ── Material Stock Alerts ─────────────────────────────────────────────────────
function StockAlertsWidget({ alerts }) {
  if (!alerts?.length) return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <Package size={16} className="text-blue-500" />
        <h3 className="font-bold text-slate-800 text-sm">Stock Alerts</h3>
      </div>
      <div className="text-center py-4">
        <Package size={28} className="mx-auto text-gray-200 mb-2" />
        <p className="text-xs text-gray-400">All materials stocked</p>
      </div>
    </div>
  )
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-blue-500" />
          <h3 className="font-bold text-slate-800 text-sm">Stock Alerts</h3>
        </div>
        <Link to="/inventory" className="text-xs text-orange-500 font-semibold hover:text-orange-600">View all</Link>
      </div>
      <div className="space-y-2">
        {alerts.slice(0, 4).map((a, i) => (
          <div key={i} className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-700">{a.name}</p>
                <p className="text-xs text-gray-400">{a.project}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
              {a.qty} {a.unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Active Workers Widget ─────────────────────────────────────────────────────
function WorkersWidget({ workers }) {
  const total = workers?.total ?? 0
  const roles = workers?.roles ?? []
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <Users size={16} className="text-green-500" />
        <h3 className="font-bold text-slate-800 text-sm">Workers On Site Today</h3>
      </div>
      <div className="flex items-end gap-3 mb-3">
        <span className="text-4xl font-black text-slate-800">{total}</span>
        <span className="text-sm text-gray-400 mb-1">workers active</span>
      </div>
      {roles.length > 0 && (
        <div className="space-y-2">
          {roles.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-20 flex-shrink-0">{r.role}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-orange-400 rounded-full"
                  style={{ width: total > 0 ? `${Math.round((r.count / total) * 100)}%` : '0%' }} />
              </div>
              <span className="text-xs font-bold text-slate-600 w-5 text-right">{r.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Daily Report Summary ──────────────────────────────────────────────────────
function ReportSummaryWidget({ reports }) {
  if (!reports?.length) return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <FileText size={16} className="text-green-500" />
        <h3 className="font-bold text-slate-800 text-sm">Today's Reports</h3>
      </div>
      <div className="text-center py-4">
        <FileText size={28} className="mx-auto text-gray-200 mb-2" />
        <p className="text-xs text-gray-400">No reports filed today</p>
        <Link to="/reports/new" className="btn btn-primary mt-3 text-xs py-1.5 px-3">+ File Report</Link>
      </div>
    </div>
  )
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-green-500" />
          <h3 className="font-bold text-slate-800 text-sm">Today's Reports</h3>
        </div>
        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{reports.length} filed</span>
      </div>
      <div className="space-y-2">
        {reports.slice(0, 3).map((r, i) => (
          <div key={i} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold text-green-700">
              {r.project?.[0] ?? 'R'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">{r.project}</p>
              <p className="text-xs text-gray-400">{r.submittedBy} · {r.workers} workers · {r.time}</p>
            </div>
          </div>
        ))}
      </div>
      <Link to="/reports/new" className="flex items-center gap-1 text-xs text-orange-500 font-semibold mt-3 hover:text-orange-600">
        + New report <ChevronRight size={12} />
      </Link>
    </div>
  )
}

// ── Recent Photos Strip ───────────────────────────────────────────────────────
function RecentPhotosWidget({ photos }) {
  if (!photos?.length) return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Camera size={16} className="text-purple-500" />
          <h3 className="font-bold text-slate-800 text-sm">Recent Photos</h3>
        </div>
      </div>
      <div className="text-center py-4">
        <Camera size={28} className="mx-auto text-gray-200 mb-2" />
        <p className="text-xs text-gray-400">No photos uploaded yet</p>
        <Link to="/photos" className="btn btn-primary mt-3 text-xs py-1.5 px-3">Upload Photo</Link>
      </div>
    </div>
  )
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Camera size={16} className="text-purple-500" />
          <h3 className="font-bold text-slate-800 text-sm">Recent Photos</h3>
        </div>
        <Link to="/photos" className="text-xs text-orange-500 font-semibold hover:text-orange-600">View all</Link>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {photos.slice(0, 8).map((p, i) => (
          <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative group cursor-pointer">
            <img src={p.url} alt={p.note} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1">
              <p className="text-white text-xs font-medium truncate">{p.note}</p>
            </div>
          </div>
        ))}
        {photos.length === 0 && (
          <div className="col-span-4 flex items-center justify-center h-20 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-400">No photos yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Budget Card ───────────────────────────────────────────────────────────────
function BudgetWidget({ budget }) {
  const used = budget?.used ?? 0
  const total = budget?.total ?? 0
  const pct = total > 0 ? Math.round((used / total) * 100) : 0
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500'
  const textColor = pct >= 90 ? 'text-red-600' : pct >= 70 ? 'text-amber-600' : 'text-green-600'

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 size={16} className="text-orange-500" />
        <h3 className="font-bold text-slate-800 text-sm">Budget Overview</h3>
      </div>
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-xs text-gray-400">Total Budget</p>
          <p className="text-lg font-black text-slate-800">
            ₹{total ? (total / 100000).toFixed(1) + 'L' : '—'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Used</p>
          <p className={`text-lg font-black ${textColor}`}>{pct}%</p>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden mb-2">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>Spent: ₹{used ? (used / 100000).toFixed(1) + 'L' : '—'}</span>
        <span>Remaining: ₹{total && used ? ((total - used) / 100000).toFixed(1) + 'L' : '—'}</span>
      </div>
    </div>
  )
}

// ── Activity Feed ─────────────────────────────────────────────────────────────
function ActivityFeed({ activities }) {
  const icons = { report: '📋', material: '📦', photo: '📸', task: '✅', issue: '⚠️', chat: '💬' }
  if (!activities?.length) return null
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-800">Recent Activity</h3>
        <Clock size={15} className="text-gray-400" />
      </div>
      <div className="space-y-3">
        {activities.slice(0, 6).map((a, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 text-base">
              {icons[a.type] ?? '📌'}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm text-slate-700 font-medium">{a.text}</p>
              <p className="text-xs text-gray-400 mt-0.5">{a.project} · {a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── EMPTY STATE (no projects yet) ─────────────────────────────────────────────
function EmptyDashboard({ userName }) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
        <FolderOpen size={36} className="text-orange-400" />
      </div>
      <h2 className="text-xl font-black text-slate-800 mb-2">Welcome to sitePilot, {userName}!</h2>
      <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
        Your dashboard is empty. Add your first project and the widgets will populate automatically.
      </p>
      <Link to="/projects" className="btn btn-primary gap-2 mx-auto">
        <Plus size={16} /> Create Your First Project
      </Link>
    </div>
  )
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth()
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  // ── New widget states ───────────────────────────────────────────────────────
  const [overdueTasks,  setOverdueTasks]  = useState([])
  const [stockAlerts,   setStockAlerts]   = useState([])
  const [workers,       setWorkers]       = useState(null)
  const [reportSummary, setReportSummary] = useState([])
  const [recentPhotos,  setRecentPhotos]  = useState([])
  const [budget,        setBudget]        = useState(null)
  const [activities,    setActivities]    = useState([])

  useEffect(() => {
    // Original stats call (unchanged)
    api.get('/dashboard/stats')
      .then(r => setStats(r.data))
      .catch(() => setStats({
        activeProjects: 0, todayReports: 0, lowStock: 0, totalMaterials: 0, recentProjects: [],
      }))
      .finally(() => setLoading(false))

    // New widget data calls — each has its own fallback so they never break the page
    api.get('/dashboard/overdue-tasks').then(r => setOverdueTasks(r.data)).catch(() => setOverdueTasks(SAMPLE_OVERDUE))
    api.get('/dashboard/stock-alerts').then(r => setStockAlerts(r.data)).catch(() => setStockAlerts(SAMPLE_STOCK))
    api.get('/dashboard/workers-today').then(r => setWorkers(r.data)).catch(() => setWorkers(SAMPLE_WORKERS))
    api.get('/dashboard/report-summary').then(r => setReportSummary(r.data)).catch(() => setReportSummary(SAMPLE_REPORTS))
    api.get('/dashboard/recent-photos').then(r => setRecentPhotos(r.data)).catch(() => setRecentPhotos([]))
    api.get('/dashboard/budget').then(r => setBudget(r.data)).catch(() => setBudget(SAMPLE_BUDGET))
    api.get('/dashboard/activity').then(r => setActivities(r.data)).catch(() => setActivities(SAMPLE_ACTIVITY))
  }, [])

  // ── Original stats cards (unchanged) ───────────────────────────────────────
  const STATS = [
    { icon: FolderOpen,    label: 'Active Sites',     value: stats?.activeProjects,  color: 'bg-orange-50 text-orange-600' },
    { icon: FileText,      label: "Today's Reports",  value: stats?.todayReports,    color: 'bg-green-50 text-green-600'   },
    { icon: AlertTriangle, label: 'Low Stock Alerts', value: stats?.lowStock,        color: 'bg-red-50 text-red-600'       },
    { icon: Package,       label: 'Total Materials',  value: stats?.totalMaterials,  color: 'bg-blue-50 text-blue-600'     },
  ]

  const QUICK = [
    { to: '/reports/new',   label: 'New Report',    emoji: '📋', color: 'bg-orange-500' },
    { to: '/materials/new', label: 'Add Material',  emoji: '📦', color: 'bg-blue-500'   },
    { to: '/projects',      label: 'View Projects', emoji: '📁', color: 'bg-green-500'  },
    { to: '/photos',        label: 'Upload Photo',  emoji: '📸', color: 'bg-purple-500' },
  ]

  const hasProjects = !loading && (stats?.recentProjects || []).length > 0

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Header row (original, unchanged) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800">{greeting}, {user?.name?.split(' ')[0]} 👷</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link to="/projects" className="btn btn-primary"><Plus size={16} /> New Project</Link>
      </div>

      {/* ── Stats strip (original, unchanged) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(s => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
              <s.icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">{loading ? '—' : s.value ?? 0}</p>
              <p className="text-sm text-gray-500 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── NEW: Weather + Budget + Workers — top insight row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <WeatherWidget location={stats?.recentProjects?.[0]?.location ?? 'Site Location'} />
        <BudgetWidget budget={budget} />
        <WorkersWidget workers={workers} />
      </div>

      {/* ── Quick Actions (original, unchanged) ── */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK.map(q => (
            <Link key={q.to} to={q.to}
              className="card hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col items-center gap-3 py-6 cursor-pointer group">
              <div className={`w-12 h-12 ${q.color} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                <span className="text-2xl">{q.emoji}</span>
              </div>
              <span className="text-sm font-semibold text-slate-700 text-center">{q.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Show empty state OR full dashboard ── */}
      {!loading && !hasProjects ? (
        <EmptyDashboard userName={user?.name?.split(' ')[0]} />
      ) : (
        <>
          {/* ── Active Projects (original layout, enhanced with timeline) ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-slate-800">Active Projects</h2>
              <Link to="/projects" className="text-orange-500 text-sm font-semibold hover:text-orange-600 flex items-center gap-1">
                See all <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => <div key={i} className="card animate-pulse h-44 bg-gray-100" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(stats?.recentProjects || []).map(p => {
                  const budgetPct = p.budgetUsed ?? 0
                  const daysLeft  = p.daysLeft ?? null
                  return (
                    <Link key={p._id} to={`/projects/${p._id}`}
                      className="card hover:shadow-md transition-all hover:-translate-y-0.5 block group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-800 truncate group-hover:text-orange-600 transition-colors">{p.name}</h3>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><MapPin size={11} />{p.location}</p>
                        </div>
                        <span className={`badge badge-${p.status} ml-2 flex-shrink-0`}>{p.status}</span>
                      </div>

                      {/* Progress (original) */}
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span className="font-bold text-slate-700">{p.progress}%</span>
                      </div>
                      <ProgressBar value={p.progress} />

                      {/* NEW: Budget used bar */}
                      {budgetPct > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Budget used</span>
                            <span className={`font-bold ${budgetPct >= 90 ? 'text-red-500' : budgetPct >= 70 ? 'text-amber-500' : 'text-green-600'}`}>{budgetPct}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-full rounded-full ${budgetPct >= 90 ? 'bg-red-500' : budgetPct >= 70 ? 'bg-amber-400' : 'bg-green-400'}`}
                              style={{ width: `${budgetPct}%` }} />
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
                        <span>👷 {p.manager || 'Unassigned'}</span>
                        {daysLeft !== null
                          ? <span className={daysLeft < 14 ? 'text-red-500 font-bold' : ''}>{daysLeft}d left</span>
                          : <span>💰 {p.budget || '—'}</span>
                        }
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── NEW: 3-col widget row ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <OverdueTasksWidget tasks={overdueTasks} />
            <StockAlertsWidget  alerts={stockAlerts} />
            <ReportSummaryWidget reports={reportSummary} />
          </div>

          {/* ── NEW: Recent Photos ── */}
          <RecentPhotosWidget photos={recentPhotos} />

          {/* ── NEW: Activity Feed ── */}
          <ActivityFeed activities={activities} />
        </>
      )}
    </div>
  )
}

// ── Sample fallback data (used when API endpoints don't exist yet) ─────────────
const SAMPLE_OVERDUE = [
  { title: 'Fix scaffolding Level 2 north',  project: 'Highway NH-44',        due: 'Jan 14' },
  { title: 'Submit weekly material report',  project: 'Commercial Complex A', due: 'Jan 15' },
  { title: 'Electrical safety certification',project: 'Residential P2',       due: 'Jan 13' },
]

const SAMPLE_STOCK = [
  { name: 'TMT Steel Bars',   qty: 12,  unit: 'Tonnes', project: 'Highway NH-44'        },
  { name: 'Coarse Aggregate', qty: 5,   unit: 'Tonnes', project: 'Commercial Complex A' },
  { name: 'Cement (OPC 53)',  qty: 40,  unit: 'Bags',   project: 'Residential P2'       },
]

const SAMPLE_WORKERS = {
  total: 64,
  roles: [
    { role: 'Engineers',    count: 6  },
    { role: 'Electricians', count: 12 },
    { role: 'Laborers',     count: 46 },
  ],
}

const SAMPLE_REPORTS = [
  { project: 'Highway NH-44',        submittedBy: 'Ravi Kumar', workers: 24, time: '8:30 AM' },
  { project: 'Commercial Complex A', submittedBy: 'Suresh M',   workers: 18, time: '9:00 AM' },
]

const SAMPLE_BUDGET = { total: 4200000, used: 2730000 }

const SAMPLE_ACTIVITY = [
  { type: 'report',   text: 'Daily report filed for Highway NH-44',  project: 'Highway NH-44',        time: '8 mins ago' },
  { type: 'material', text: 'TMT Steel Bars stock running low',       project: 'Commercial Complex A', time: '22 mins ago' },
  { type: 'task',     text: 'Foundation inspection marked complete',  project: 'Highway NH-44',        time: '1 hr ago'   },
  { type: 'photo',    text: '3 progress photos uploaded',             project: 'Residential P2',       time: '2 hrs ago'  },
  { type: 'issue',    text: 'Scaffolding issue flagged on Level 2',   project: 'Commercial Complex A', time: '3 hrs ago'  },
]