import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { Plus, Search, FolderOpen, MapPin, Edit2, Trash2, X, Check } from 'lucide-react'

const STATUS_OPTS = ['active', 'completed', 'paused', 'cancelled']
const EMPTY = { name: '', location: '', description: '', startDate: '', endDate: '', budget: '', manager: '', status: 'active', progress: 0 }

function ProgressBar({ value }) {
  const c = value >= 75 ? 'bg-green-500' : value >= 40 ? 'bg-orange-500' : 'bg-red-500'
  return <div className="progress-bar w-full"><div className={`h-full rounded-full ${c}`} style={{ width: `${value}%` }} /></div>
}

function Modal({ title, onClose, onSave, form, setForm, saving }) {
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Project Name *</label>
              <input className="input" value={form.name} onChange={e => sf('name', e.target.value)} placeholder="Highway NH-44 Widening" />
            </div>
            <div>
              <label className="label">Location *</label>
              <input className="input" value={form.location} onChange={e => sf('location', e.target.value)} placeholder="Bangalore–Chennai" />
            </div>
            <div>
              <label className="label">Manager</label>
              <input className="input" value={form.manager} onChange={e => sf('manager', e.target.value)} placeholder="Ravi Kumar" />
            </div>
            <div>
              <label className="label">Start Date</label>
              <input className="input" type="date" value={form.startDate} onChange={e => sf('startDate', e.target.value)} />
            </div>
            <div>
              <label className="label">End Date</label>
              <input className="input" type="date" value={form.endDate} onChange={e => sf('endDate', e.target.value)} />
            </div>
            <div>
              <label className="label">Budget</label>
              <input className="input" value={form.budget} onChange={e => sf('budget', e.target.value)} placeholder="₹4.2 Cr" />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => sf('status', e.target.value)}>
                {STATUS_OPTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Progress ({form.progress}%)</label>
              <input type="range" min={0} max={100} value={form.progress} onChange={e => sf('progress', +e.target.value)} className="w-full accent-orange-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea className="input" rows={3} value={form.description} onChange={e => sf('description', e.target.value)} placeholder="Project description..." />
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-6 pt-0">
          <button onClick={onClose} className="btn btn-ghost flex-1">Cancel</button>
          <button onClick={onSave} disabled={saving || !form.name || !form.location} className="btn btn-primary flex-1">
            {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check size={16} />Save</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('all')
  const [modal,    setModal]    = useState(null)
  const [form,     setForm]     = useState(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const params = {}
      if (filter !== 'all') params.status = filter
      if (search) params.search = search
      const { data } = await api.get('/projects', { params })
      setProjects(data.data || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filter, search])

  async function save() {
    setSaving(true)
    try {
      if (modal === 'add') {
        const { data } = await api.post('/projects', form)
        setProjects(p => [data, ...p])
      } else {
        const { data } = await api.put(`/projects/${modal._id}`, form)
        setProjects(p => p.map(x => x._id === data._id ? data : x))
      }
      setModal(null)
    } catch (e) { alert(e.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  async function del(id) {
    if (!confirm('Delete this project?')) return
    setDeleting(id)
    try {
      await api.delete(`/projects/${id}`)
      setProjects(p => p.filter(x => x._id !== id))
    } finally { setDeleting(null) }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setModal('add') }} className="btn btn-primary">
          <Plus size={16} /> New Project
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search projects…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', ...STATUS_OPTS].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`badge px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all capitalize ${filter === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-orange-50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FolderOpen size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium text-gray-500">No projects found</p>
            <button onClick={() => { setForm(EMPTY); setModal('add') }} className="btn btn-primary mt-4 mx-auto">Create first project</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase px-5 py-3">Project</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase px-5 py-3 hidden md:table-cell">Location</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase px-5 py-3 hidden lg:table-cell">Manager</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase px-5 py-3">Progress</th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase px-5 py-3">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p._id} className="table-row">
                    <td className="px-5 py-4">
                      <Link to={`/projects/${p._id}`} className="font-semibold text-slate-800 hover:text-orange-600 transition-colors">{p.name}</Link>
                      <div className="text-xs text-gray-400">💰 {p.budget || '—'}</div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="flex items-center gap-1 text-sm text-gray-500"><MapPin size={12} />{p.location}</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-sm text-gray-600">{p.manager || '—'}</span>
                    </td>
                    <td className="px-5 py-4 min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1"><ProgressBar value={p.progress} /></div>
                        <span className="text-xs font-bold text-gray-600 w-8 text-right">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge badge-${p.status}`}>{p.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => { setForm({ ...p, startDate: p.startDate?.slice(0,10)||'', endDate: p.endDate?.slice(0,10)||'' }); setModal(p) }}
                          className="p-2 hover:bg-orange-50 text-gray-400 hover:text-orange-500 rounded-lg">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => del(p._id)} disabled={deleting === p._id}
                          className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg">
                          {deleting === p._id ? <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin block" /> : <Trash2 size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && <Modal title={modal === 'add' ? 'Add New Project' : 'Edit Project'} onClose={() => setModal(null)} onSave={save} form={form} setForm={setForm} saving={saving} />}
    </div>
  )
}