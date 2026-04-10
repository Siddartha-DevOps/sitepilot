import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import { FolderOpen, FileText, Package, AlertTriangle, Plus, ArrowRight, MapPin } from 'lucide-react'

function ProgressBar({ value }) {
  const c = value >= 75 ? 'bg-green-500' : value >= 40 ? 'bg-orange-500' : 'bg-red-500'
  return (
    <div className="progress-bar mt-2">
      <div className={`h-full rounded-full ${c}`} style={{ width: `${value}%` }} />
    </div>
  )
}

export default function Dashboard() {
  const { user }  = useAuth()
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => setStats(r.data))
      .catch(() => setStats({ activeProjects: 0, todayReports: 0, lowStock: 0, totalMaterials: 0, recentProjects: [] }))
      .finally(() => setLoading(false))
  }, [])

  const STATS = [
    { icon: FolderOpen,    label: 'Active Sites',    value: stats?.activeProjects, color: 'bg-orange-50 text-orange-600' },
    { icon: FileText,      label: "Today's Reports", value: stats?.todayReports,   color: 'bg-green-50 text-green-600'  },
    { icon: AlertTriangle, label: 'Low Stock Alerts', value: stats?.lowStock,      color: 'bg-red-50 text-red-600'      },
    { icon: Package,       label: 'Total Materials',  value: stats?.totalMaterials, color: 'bg-blue-50 text-blue-600'   },
  ]

  const QUICK = [
    { to: '/reports/new',   label: 'New Report',    emoji: '📋', color: 'bg-orange-500' },
    { to: '/materials/new', label: 'Add Material',  emoji: '📦', color: 'bg-blue-500'   },
    { to: '/projects',      label: 'View Projects', emoji: '📁', color: 'bg-green-500'  },
    { to: '/photos',        label: 'Upload Photo',  emoji: '📸', color: 'bg-purple-500' },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800">{greeting}, {user?.name?.split(' ')[0]} 👷</h1>
          <p className="text-gray-500 text-sm mt-0.5">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Link to="/projects" className="btn btn-primary"><Plus size={16} /> New Project</Link>
      </div>

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

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-800">Active Projects</h2>
          <Link to="/projects" className="text-orange-500 text-sm font-semibold hover:text-orange-600 flex items-center gap-1">
            See all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="card animate-pulse h-36 bg-gray-100" />)}
          </div>
        ) : (stats?.recentProjects || []).length === 0 ? (
          <div className="card text-center py-12 text-gray-400">
            <FolderOpen size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No active projects yet</p>
            <Link to="/projects" className="btn btn-primary mt-4 mx-auto">Create Project</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(stats?.recentProjects || []).map(p => (
              <Link key={p._id} to={`/projects/${p._id}`}
                className="card hover:shadow-md transition-all hover:-translate-y-0.5 block group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate group-hover:text-orange-600 transition-colors">{p.name}</h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><MapPin size={11} />{p.location}</p>
                  </div>
                  <span className={`badge badge-${p.status} ml-2 flex-shrink-0`}>{p.status}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span className="font-bold text-slate-700">{p.progress}%</span>
                </div>
                <ProgressBar value={p.progress} />
                <div className="flex justify-between mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
                  <span>👷 {p.manager || 'Unassigned'}</span>
                  <span>💰 {p.budget || '—'}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}