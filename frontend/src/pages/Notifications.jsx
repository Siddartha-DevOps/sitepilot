import React, { useEffect, useState } from 'react'
import api from '../api/client'
import { Bell, AlertTriangle, CheckCircle, Info, Clock, X, RefreshCw } from 'lucide-react'

const TYPE = {
  danger:  { icon: AlertTriangle, bg: 'bg-red-50',    border: 'border-red-200',    icon_color: 'text-red-500',    dot: 'bg-red-500'    },
  warning: { icon: AlertTriangle, bg: 'bg-yellow-50', border: 'border-yellow-200', icon_color: 'text-yellow-500', dot: 'bg-yellow-500' },
  success: { icon: CheckCircle,   bg: 'bg-green-50',  border: 'border-green-200',  icon_color: 'text-green-500',  dot: 'bg-green-500'  },
  info:    { icon: Info,          bg: 'bg-blue-50',   border: 'border-blue-200',   icon_color: 'text-blue-500',   dot: 'bg-blue-500'   },
}

const FILTERS = ['All', 'Unread', 'Material', 'Reports', 'Deadlines']

export default function Notifications() {
  const [notifs,     setNotifs]     = useState([])
  const [read,       setRead]       = useState(new Set())
  const [filter,     setFilter]     = useState('All')
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function load(silent = false) {
    if (!silent) setLoading(true); else setRefreshing(true)
    try {
      const { data } = await api.get('/notifications')
      setNotifs(data)
    } finally {
      setLoading(false); setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = notifs.filter(n => {
    if (filter === 'Unread')   return !read.has(n.id)
    if (filter === 'Material') return n.category === 'material'
    if (filter === 'Reports')  return n.category === 'report'
    if (filter === 'Deadlines')return n.category === 'deadline'
    return true
  })

  const unread = notifs.filter(n => !read.has(n.id)).length

  function markRead(id)   { setRead(p => new Set([...p, id])) }
  function markAllRead()  { setRead(new Set(notifs.map(n => n.id))) }
  function dismiss(id)    { setNotifs(p => p.filter(n => n.id !== id)) }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <h1 className="page-title">Notifications</h1>
          {unread > 0 && <span className="badge bg-red-500 text-white">{unread}</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => load(true)} disabled={refreshing} className="btn btn-ghost btn-sm">
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
          {unread > 0 && <button onClick={markAllRead} className="btn btn-outline btn-sm">Mark All Read</button>}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`badge px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all ${filter === f ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600'}`}>
            {f}{f === 'Unread' && unread > 0 ? ` (${unread})` : ''}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <Bell size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500">No notifications</p>
          <p className="text-sm mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(n => {
            const cfg    = TYPE[n.type] || TYPE.info
            const isRead = read.has(n.id) || n.read
            const Icon   = cfg.icon

            return (
              <div key={n.id}
                onClick={() => markRead(n.id)}
                className={`relative flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-sm
                  ${isRead ? 'bg-white border-gray-100' : `${cfg.bg} ${cfg.border}`}`}>
                {!isRead && <div className={`absolute top-4 left-4 w-2 h-2 rounded-full ${cfg.dot}`} />}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${isRead ? 'bg-gray-100' : cfg.bg}`}>
                  <Icon size={18} className={isRead ? 'text-gray-400' : cfg.icon_color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isRead ? 'text-gray-600' : 'text-slate-800'}`}>{n.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                    <Clock size={11} />{n.time}
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); dismiss(n.id) }}
                  className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 flex-shrink-0 transition-colors">
                  <X size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
