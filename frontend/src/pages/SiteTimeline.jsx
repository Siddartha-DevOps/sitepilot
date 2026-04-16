import React, { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/client'
import {
  Zap, CheckSquare, Droplets, Truck, AlertTriangle, Camera,
  Users, Plus, Filter, Search, Clock, ChevronDown, X,
  MapPin, CheckCircle2, RefreshCw, Calendar
} from 'lucide-react'

const EVENT_META = {
  RMC_POUR: {
    icon: Droplets,    label: 'RMC Pour',          color: '#3b82f6', bg: '#eff6ff',
    border: '#bfdbfe', summary: d => `${d?.grade || ''} · ${d?.volume || ''}m³ · ${d?.supplierName || ''}`,
  },
  LABOUR_UPDATE: {
    icon: Users,       label: 'Labour Update',     color: '#8b5cf6', bg: '#faf5ff',
    border: '#ddd6fe', summary: d => `${d?.totalWorkers || '?'} workers on site`,
  },
  MATERIAL_DELIVERY: {
    icon: Truck,       label: 'Material Delivery', color: '#f59e0b', bg: '#fffbeb',
    border: '#fde68a', summary: d => `${d?.quantity || ''} ${d?.unit || ''} of ${d?.materialName || ''}`,
  },
  WORK_DONE: {
    icon: CheckSquare, label: 'Work Done',          color: '#22c55e', bg: '#f0fdf4',
    border: '#bbf7d0', summary: d => d?.workDone || 'Work logged',
  },
  ISSUE_DELAY: {
    icon: AlertTriangle, label: 'Issue / Delay',   color: '#ef4444', bg: '#fef2f2',
    border: '#fecaca',   summary: d => d?.title || 'Issue reported',
  },
  PHOTO_UPDATE: {
    icon: Camera,      label: 'Photo Update',      color: '#ec4899', bg: '#fdf2f8',
    border: '#fbcfe8', summary: d => d?.caption || 'Photos uploaded',
  },
}

const ALL_TYPES = ['All', 'RMC_POUR', 'LABOUR_UPDATE', 'MATERIAL_DELIVERY', 'WORK_DONE', 'ISSUE_DELAY', 'PHOTO_UPDATE']

function EventCard({ event, onResolve }) {
  const meta    = EVENT_META[event.type] || EVENT_META.WORK_DONE
  const Icon    = meta.icon
  const time    = new Date(event.timestamp).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
  const isIssue = event.type === 'ISSUE_DELAY'

  return (
    <div className="relative flex gap-4" style={{ paddingBottom: 0 }}>
      {/* Timeline dot */}
      <div className="flex flex-col items-center flex-shrink-0 w-10">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
          style={{ backgroundColor: meta.bg, color: meta.color, border: `1.5px solid ${meta.border}` }}>
          <Icon size={18} />
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 min-w-0 pb-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          {/* Header stripe */}
          <div className="h-1" style={{ backgroundColor: meta.color, opacity: 0.3 }} />

          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ color: meta.color, backgroundColor: meta.bg }}>
                    {meta.label}
                  </span>
                  {isIssue && !event.resolved && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                      Open
                    </span>
                  )}
                  {isIssue && event.resolved && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-600">
                      Resolved
                    </span>
                  )}
                  {event.data?.severity && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      event.data.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                      event.data.severity === 'High'     ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{event.data.severity}</span>
                  )}
                </div>

                <p className="text-sm font-semibold text-slate-800 mt-2 leading-snug">
                  {meta.summary(event.data)}
                </p>

                {event.notes && event.notes !== meta.summary(event.data) && (
                  <p className="text-xs text-gray-500 mt-1">{event.notes}</p>
                )}

                {/* Extra details for specific types */}
                {event.type === 'RMC_POUR' && event.data?.truckNumber && (
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                    <span>🚛 Truck: {event.data.truckNumber}</span>
                    {event.data.pourLocation && <span>📍 {event.data.pourLocation}</span>}
                  </div>
                )}
                {event.type === 'LABOUR_UPDATE' && (
                  <div className="mt-2 flex gap-3 text-xs text-gray-500">
                    {event.data?.engineers  && <span>👷 Eng: {event.data.engineers}</span>}
                    {event.data?.labourers  && <span>🔨 Lab: {event.data.labourers}</span>}
                    {event.data?.shift      && <span>⏰ {event.data.shift}</span>}
                  </div>
                )}
                {event.type === 'ISSUE_DELAY' && event.data?.actionTaken && (
                  <div className="mt-2 text-xs text-gray-500">
                    <span className="font-semibold">Action: </span>{event.data.actionTaken}
                  </div>
                )}
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-xs font-semibold text-gray-400">{time}</div>
                {event.createdBy?.name && (
                  <div className="text-xs text-gray-400 mt-0.5">{event.createdBy.name}</div>
                )}
              </div>
            </div>

            {/* Photo thumbnails */}
            {event.photos?.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {event.photos.slice(0, 4).map((p, i) => (
                  <div key={i} className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                    📸
                  </div>
                ))}
              </div>
            )}

            {/* Resolve button for issues */}
            {isIssue && !event.resolved && (
              <button onClick={() => onResolve(event._id)}
                className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-700 transition-colors">
                <CheckCircle2 size={14} /> Mark Resolved
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DateGroup({ date, events, onResolve }) {
  const d      = new Date(date)
  const isToday = new Date().toDateString() === d.toDateString()
  const label  = isToday ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <div className="space-y-0">
      {/* Date divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-slate-800 text-white px-3 py-1.5 rounded-full text-xs font-bold">
          <Calendar size={11} />
          {label} · {events.length} event{events.length !== 1 ? 's' : ''}
        </div>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Events with connecting line */}
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-5 top-10 bottom-0 w-px bg-gradient-to-b from-gray-200 to-transparent" />
        <div className="space-y-1">
          {events.map(ev => (
            <EventCard key={ev._id} event={ev} onResolve={onResolve} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function SiteTimeline() {
  const [params]    = useSearchParams()
  const [timeline,  setTimeline]  = useState([])
  const [projects,  setProjects]  = useState([])
  const [projectId, setProjectId] = useState(params.get('projectId') || '')
  const [typeFilter,setTypeFilter]= useState('All')
  const [search,    setSearch]    = useState('')
  const [loading,   setLoading]   = useState(true)
  const [refreshing,setRefreshing]= useState(false)
  const [stats,     setStats]     = useState(null)

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data.data || [])).catch(() => {})
  }, [])

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true)
    try {
      const params = {}
      if (projectId) params.projectId = projectId
      if (typeFilter !== 'All') params.type = typeFilter

      const { data } = await api.get('/events', { params })
      const events = data.data || []

      // Group by date
      const grouped = {}
      events.forEach(ev => {
        const key = ev.timestamp?.split('T')[0] || new Date().toISOString().split('T')[0]
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(ev)
      })

      const sorted = Object.entries(grouped)
        .map(([date, evs]) => ({ date, events: evs }))
        .sort((a, b) => new Date(b.date) - new Date(a.date))

      setTimeline(sorted)

      // Load stats
      if (projectId) {
        api.get(`/events/stats/${projectId}`).then(r => setStats(r.data)).catch(() => {})
      }
    } finally { setLoading(false); setRefreshing(false) }
  }, [projectId, typeFilter])

  useEffect(() => { load() }, [load])

  async function resolveEvent(id) {
    await api.patch(`/events/${id}/resolve`)
    load(true)
  }

  // Filter by search (client-side on notes/data)
  const filtered = timeline.map(group => ({
    ...group,
    events: group.events.filter(ev => {
      if (!search) return true
      const meta = EVENT_META[ev.type]
      const summary = meta ? meta.summary(ev.data) : ''
      return (
        summary.toLowerCase().includes(search.toLowerCase()) ||
        (ev.notes || '').toLowerCase().includes(search.toLowerCase()) ||
        (ev.createdBy?.name || '').toLowerCase().includes(search.toLowerCase())
      )
    }),
  })).filter(g => g.events.length > 0)

  const totalEvents   = timeline.reduce((s, g) => s + g.events.length, 0)
  const openIssues    = timeline.flatMap(g => g.events).filter(e => e.type === 'ISSUE_DELAY' && !e.resolved).length

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Zap size={24} className="text-orange-500" /> Site Timeline
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Digital site logbook — every event, chronologically</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => load(true)} disabled={refreshing}
            className="btn btn-ghost btn-sm">
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <Link to="/events/add" className="btn btn-primary">
            <Plus size={16} /> Log Event
          </Link>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Events',     value: totalEvents,                                      color: 'text-slate-800',  bg: 'bg-gray-50'    },
          { label: 'Today',            value: timeline[0]?.date === new Date().toISOString().split('T')[0] ? timeline[0].events.length : 0, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Open Issues',      value: openIssues,                                       color: 'text-red-600',    bg: 'bg-red-50'     },
          { label: 'RMC Pours',        value: timeline.flatMap(g=>g.events).filter(e=>e.type==='RMC_POUR').length, color:'text-blue-600', bg:'bg-blue-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center border border-gray-100`}>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        {/* Project selector */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select className="input flex-1" value={projectId} onChange={e => setProjectId(e.target.value)}>
            <option value="">All Projects</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>

          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Search events…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Type filter pills */}
        <div className="flex gap-2 flex-wrap">
          {ALL_TYPES.map(t => {
            const meta = t !== 'All' ? EVENT_META[t] : null
            const active = typeFilter === t
            return (
              <button key={t} onClick={() => setTypeFilter(t)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
                style={{
                  backgroundColor: active ? (meta?.color || '#f97316') : '#fff',
                  color:           active ? '#fff' : (meta?.color || '#64748b'),
                  borderColor:     active ? (meta?.color || '#f97316') : '#e2e8f0',
                }}>
                {meta && <meta.icon size={11} />}
                {t === 'All' ? 'All Types' : EVENT_META[t]?.label || t}
              </button>
            )
          })}
        </div>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="space-y-6">
          {[1,2,3].map(i => (
            <div key={i} className="space-y-3">
              <div className="h-6 w-40 bg-gray-100 rounded-full animate-pulse" />
              {[1,2].map(j => <div key={j} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Zap size={32} className="text-gray-200" />
          </div>
          <p className="font-bold text-gray-500 mb-1">No events logged yet</p>
          <p className="text-sm text-gray-400 mb-5">Start logging site activity — every event goes here.</p>
          <Link to="/events/add" className="btn btn-primary mx-auto">
            <Plus size={16} /> Log First Event
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {filtered.map(group => (
            <DateGroup key={group.date} date={group.date} events={group.events} onResolve={resolveEvent} />
          ))}
        </div>
      )}
    </div>
  )
}