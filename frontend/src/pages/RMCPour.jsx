import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import {
  Droplets, Plus, Search, Clock, CheckCircle2, AlertCircle,
  Truck, Play, Square, BarChart3, TrendingUp, X, ChevronDown,
  Calendar, MapPin, ArrowLeft, Camera, Upload, Timer
} from 'lucide-react'

const GRADES  = ['M15','M20','M25','M30','M35','M40']
const STATUS_META = {
  scheduled:   { label: 'Scheduled',   color: '#94a3b8', bg: '#f1f5f9' },
  'in-progress': { label: 'Pouring…',  color: '#f59e0b', bg: '#fffbeb' },
  completed:   { label: 'Completed',   color: '#22c55e', bg: '#f0fdf4' },
  delayed:     { label: 'Delayed',     color: '#ef4444', bg: '#fef2f2' },
  cancelled:   { label: 'Cancelled',   color: '#94a3b8', bg: '#f8fafc' },
}

function StatCard({ icon: Icon, label, value, sub, color = '#f97316', bg = '#fff7ed' }) {
  return (
    <div className="card flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: bg, color }}>
        <Icon size={22} />
      </div>
      <div>
        <div className="text-2xl font-black text-slate-800">{value}</div>
        <div className="text-sm text-gray-500 font-medium">{label}</div>
        {sub && <div className="text-xs text-gray-400">{sub}</div>}
      </div>
    </div>
  )
}

function AddPourModal({ projects, onClose, onSaved }) {
  const [form, setForm] = useState({
    projectId: '', grade: 'M25', volume: '', supplierName: '',
    truckNumber: '', pourLocation: '', arrivalTime: '', notes: '',
    slumpValue: '', temperature: '',
  })
  const [batchPhoto, setBatchPhoto] = useState(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function save() {
    if (!form.projectId || !form.grade || !form.volume || !form.supplierName) {
      alert('Fill in Project, Grade, Volume and Supplier')
      return
    }
    setSaving(true)
    try {
      await api.post('/rmc', { ...form, arrivalTime: form.arrivalTime ? new Date(form.arrivalTime).toISOString() : null })
      onSaved()
      onClose()
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Droplets size={20} className="text-blue-500" />
            </div>
            <div>
              <div className="font-black text-slate-800">New RMC Pour</div>
              <div className="text-xs text-gray-400">Log concrete pour event</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">

          {/* Project */}
          <div>
            <label className="label">Project *</label>
            <select className="input" value={form.projectId} onChange={e => sf('projectId', e.target.value)}>
              <option value="">Select project…</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>

          {/* Grade + Volume */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Grade *</label>
              <div className="flex flex-wrap gap-2">
                {GRADES.map(g => (
                  <button key={g} onClick={() => sf('grade', g)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-bold border-2 transition-all ${
                      form.grade === g
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-100 text-gray-600 hover:border-blue-200'
                    }`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Volume (m³) *</label>
              <input className="input" type="number" value={form.volume}
                onChange={e => sf('volume', e.target.value)} placeholder="6.5" />
            </div>
          </div>

          {/* Supplier + Truck */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Supplier *</label>
              <input className="input" value={form.supplierName}
                onChange={e => sf('supplierName', e.target.value)} placeholder="Ready Mix Co." />
            </div>
            <div>
              <label className="label">Truck No.</label>
              <input className="input" value={form.truckNumber}
                onChange={e => sf('truckNumber', e.target.value)} placeholder="KA-01-AB-1234" />
            </div>
          </div>

          {/* Pour location */}
          <div>
            <label className="label">Pour Location</label>
            <input className="input" value={form.pourLocation}
              onChange={e => sf('pourLocation', e.target.value)} placeholder="Column C3-D5, Level 2" />
          </div>

          {/* Arrival time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Arrival Time</label>
              <input className="input" type="datetime-local" value={form.arrivalTime}
                onChange={e => sf('arrivalTime', e.target.value)} />
            </div>
            <div>
              <label className="label">Slump (mm)</label>
              <input className="input" type="number" value={form.slumpValue}
                onChange={e => sf('slumpValue', e.target.value)} placeholder="100" />
            </div>
          </div>

          {/* Batch slip photo */}
          <div>
            <label className="label">Batch Slip Photo</label>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => setBatchPhoto(URL.createObjectURL(e.target.files[0]))} />
            {batchPhoto ? (
              <div className="relative inline-block">
                <img src={batchPhoto} alt="Batch slip" className="h-24 rounded-xl object-cover" />
                <button onClick={() => setBatchPhoto(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-blue-300 hover:bg-blue-50 transition-all">
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Camera size={16} className="text-blue-500" />
                </div>
                <span className="text-sm text-gray-500">Upload batch slip / delivery challan</span>
              </button>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={2} value={form.notes}
              onChange={e => sf('notes', e.target.value)} placeholder="Any observations…" />
          </div>
        </div>

        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="btn btn-ghost flex-1">Cancel</button>
          <button onClick={save} disabled={saving}
            className="btn flex-[2] font-bold text-white"
            style={{ backgroundColor: '#3b82f6' }}>
            {saving
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><Droplets size={16} /> Log Pour</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

function PourCard({ pour, onStart, onComplete, onRefresh }) {
  const [completing, setCompleting] = useState(false)
  const [delayForm, setDelayForm]   = useState({ delayMinutes: '', delayReason: '' })
  const status = STATUS_META[pour.status] || STATUS_META.scheduled
  const isActive = pour.status === 'in-progress'

  // Live timer if in progress
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!isActive || !pour.pourStartTime) return
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(pour.pourStartTime)) / 60000))
    }, 5000)
    setElapsed(Math.floor((Date.now() - new Date(pour.pourStartTime)) / 60000))
    return () => clearInterval(interval)
  }, [isActive, pour.pourStartTime])

  return (
    <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all ${
      isActive ? 'border-amber-300 shadow-amber-100' : 'border-gray-100'
    }`}>
      {/* Active indicator */}
      {isActive && (
        <div className="bg-amber-400 text-white text-xs font-bold text-center py-1.5 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          POUR IN PROGRESS · {elapsed}m elapsed
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl font-black text-blue-600">{pour.grade}</span>
              <span className="text-sm font-bold text-slate-600">{pour.volume} m³</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ color: status.color, backgroundColor: status.bg }}>
                {status.label}
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <Truck size={13} /> {pour.supplierName}
              {pour.truckNumber && <span className="text-gray-400">· {pour.truckNumber}</span>}
            </div>
            {pour.pourLocation && (
              <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <MapPin size={11} /> {pour.pourLocation}
              </div>
            )}
          </div>
          <div className="text-right text-xs text-gray-400">
            <div>{new Date(pour.createdAt).toLocaleDateString('en-IN')}</div>
            {pour.arrivalTime && (
              <div className="mt-0.5 flex items-center gap-1 justify-end">
                <Clock size={10} />
                Arrived {new Date(pour.arrivalTime).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>

        {/* Timing details */}
        {(pour.pourStartTime || pour.pourEndTime) && (
          <div className="flex gap-4 text-xs text-gray-500 mb-3 flex-wrap">
            {pour.pourStartTime && (
              <span>▶ Start: {new Date(pour.pourStartTime).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</span>
            )}
            {pour.pourEndTime && (
              <span>⏹ End: {new Date(pour.pourEndTime).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</span>
            )}
            {pour.pourDurationMinutes && (
              <span className="font-semibold text-slate-600">⏱ {pour.pourDurationMinutes}m</span>
            )}
            {pour.delayMinutes > 0 && (
              <span className="text-red-500 font-semibold">⚠ {pour.delayMinutes}m delay</span>
            )}
          </div>
        )}

        {/* Slump + notes */}
        {(pour.slumpValue || pour.notes) && (
          <div className="text-xs text-gray-500 mb-3">
            {pour.slumpValue && <span className="mr-3">Slump: {pour.slumpValue}mm</span>}
            {pour.notes && <span className="italic">{pour.notes}</span>}
          </div>
        )}

        {/* Delay reason */}
        {pour.status === 'delayed' && pour.delayReason && (
          <div className="text-xs bg-red-50 text-red-600 rounded-lg p-2 mb-3">
            Delay reason: {pour.delayReason}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-2">
          {pour.status === 'scheduled' && (
            <button onClick={() => onStart(pour._id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors">
              <Play size={14} /> Start Pour
            </button>
          )}
          {pour.status === 'in-progress' && !completing && (
            <button onClick={() => setCompleting(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-green-500 hover:bg-green-600 transition-colors">
              <Square size={14} /> Complete Pour
            </button>
          )}
          {completing && (
            <div className="flex-1 space-y-2">
              <input className="input text-sm" type="number" placeholder="Delay (minutes, 0 if none)"
                value={delayForm.delayMinutes}
                onChange={e => setDelayForm(f => ({ ...f, delayMinutes: e.target.value }))} />
              {delayForm.delayMinutes > 0 && (
                <input className="input text-sm" placeholder="Delay reason"
                  value={delayForm.delayReason}
                  onChange={e => setDelayForm(f => ({ ...f, delayReason: e.target.value }))} />
              )}
              <div className="flex gap-2">
                <button onClick={async () => {
                  await onComplete(pour._id, delayForm)
                  setCompleting(false)
                  onRefresh()
                }} className="btn text-sm font-bold text-white flex-1" style={{ backgroundColor: '#22c55e' }}>
                  <CheckCircle2 size={14} /> Confirm
                </button>
                <button onClick={() => setCompleting(false)} className="btn btn-ghost text-sm flex-1">Cancel</button>
              </div>
            </div>
          )}
          {(pour.status === 'completed' || pour.status === 'delayed') && (
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <CheckCircle2 size={14} className="text-green-500" /> Done
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RMCPour() {
  const [pours,     setPours]     = useState([])
  const [projects,  setProjects]  = useState([])
  const [stats,     setStats]     = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [projectId, setProjectId] = useState('')
  const [statusFilter, setFilter] = useState('all')

  async function load() {
    setLoading(true)
    try {
      const params = {}
      if (projectId) params.projectId = projectId
      if (statusFilter !== 'all') params.status = statusFilter
      const { data } = await api.get('/rmc', { params })
      setPours(data.data || [])

      if (projectId) {
        api.get(`/rmc/stats/${projectId}`).then(r => setStats(r.data)).catch(() => {})
      } else {
        api.get('/rmc').then(r => {
          const all = r.data.data || []
          const totalVolume = all.reduce((s, p) => s + (p.volume || 0), 0)
          setStats({
            totalPours: all.length,
            totalVolume: +totalVolume.toFixed(1),
            completedPours: all.filter(p => p.status === 'completed').length,
            delayedPours:   all.filter(p => p.status === 'delayed').length,
          })
        }).catch(() => {})
      }
    } finally { setLoading(false) }
  }

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data.data || [])).catch(() => {})
  }, [])

  useEffect(() => { load() }, [projectId, statusFilter])

  async function startPour(id) {
    await api.patch(`/rmc/${id}/start`)
    load()
  }

  async function completePour(id, form) {
    await api.patch(`/rmc/${id}/complete`, form)
    load()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Droplets size={24} className="text-blue-500" /> RMC Pour Tracker
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Track every concrete pour — from arrival to completion</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn font-bold text-white"
          style={{ backgroundColor: '#3b82f6' }}>
          <Plus size={16} /> Log New Pour
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={Droplets}    label="Total Pours"    value={stats.totalPours}     color="#3b82f6" bg="#eff6ff" />
          <StatCard icon={BarChart3}   label="Total Volume"   value={`${stats.totalVolume}m³`} color="#8b5cf6" bg="#faf5ff" />
          <StatCard icon={CheckCircle2} label="Completed"     value={stats.completedPours} color="#22c55e" bg="#f0fdf4" />
          <StatCard icon={AlertCircle}  label="Delayed"       value={stats.delayedPours}   color="#ef4444" bg="#fef2f2" />
        </div>
      )}

      {/* Supplier ranking */}
      {stats?.supplierRanking?.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" /> Supplier Performance
          </h3>
          <div className="flex flex-wrap gap-3">
            {stats.supplierRanking.slice(0, 5).map((s, i) => (
              <div key={s.name} className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl">
                <span className="text-xs font-black text-blue-400">#{i + 1}</span>
                <span className="text-sm font-semibold text-slate-700">{s.name}</span>
                <span className="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-bold">{s.count} pours</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select className="input flex-1" value={projectId} onChange={e => setProjectId(e.target.value)}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <div className="flex gap-2 flex-wrap">
          {['all','scheduled','in-progress','completed','delayed'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all capitalize ${
                statusFilter === s
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}>
              {s === 'all' ? 'All Status' : STATUS_META[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* Pour list */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : pours.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Droplets size={32} className="text-blue-200" />
          </div>
          <p className="font-bold text-gray-500 mb-1">No pours logged yet</p>
          <p className="text-sm text-gray-400 mb-5">Log your first concrete pour to start tracking.</p>
          <button onClick={() => setShowModal(true)}
            className="btn font-bold text-white mx-auto" style={{ backgroundColor: '#3b82f6' }}>
            <Plus size={16} /> Log First Pour
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {pours.map(pour => (
            <PourCard key={pour._id} pour={pour}
              onStart={startPour} onComplete={completePour} onRefresh={load} />
          ))}
        </div>
      )}

      {showModal && (
        <AddPourModal projects={projects} onClose={() => setShowModal(false)} onSaved={load} />
      )}
    </div>
  )
}