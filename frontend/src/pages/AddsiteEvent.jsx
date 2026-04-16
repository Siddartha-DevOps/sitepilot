import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/client'
import {
  Zap, CheckSquare, Droplets, Truck, AlertTriangle, Camera,
  Users, Clock, ChevronRight, X, Upload, Mic, Check,
  MapPin, ArrowLeft
} from 'lucide-react'

const EVENT_TYPES = [
  { key: 'WORK_DONE',         icon: CheckSquare,   label: 'Work Done',          color: '#22c55e', bg: '#f0fdf4', border: '#bbf7d0', desc: 'Log completed work or progress' },
  { key: 'RMC_POUR',          icon: Droplets,      label: 'RMC Pour',           color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', desc: 'Log concrete pour event' },
  { key: 'LABOUR_UPDATE',     icon: Users,         label: 'Labour Update',      color: '#8b5cf6', bg: '#faf5ff', border: '#ddd6fe', desc: 'Update worker count on site' },
  { key: 'MATERIAL_DELIVERY', icon: Truck,         label: 'Material Delivery',  color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', desc: 'Record material arrival' },
  { key: 'ISSUE_DELAY',       icon: AlertTriangle, label: 'Issue / Delay',      color: '#ef4444', bg: '#fef2f2', border: '#fecaca', desc: 'Flag a problem or delay' },
  { key: 'PHOTO_UPDATE',      icon: Camera,        label: 'Photo Update',       color: '#ec4899', bg: '#fdf2f8', border: '#fbcfe8', desc: 'Add site photos with context' },
]

const QUICK_DATA = {
  WORK_DONE: [
    { key: 'workDone',     label: 'Work Completed *', type: 'textarea', placeholder: 'e.g. Foundation pouring Grid B3-B7 completed…' },
    { key: 'workersCount', label: 'Workers on Site',  type: 'number',   placeholder: '24' },
    { key: 'location',     label: 'Location / Area',  type: 'text',     placeholder: 'e.g. Grid C3, Level 2' },
  ],
  RMC_POUR: [
    { key: 'grade',        label: 'Concrete Grade *', type: 'select',   options: ['M15','M20','M25','M30','M35','M40'] },
    { key: 'volume',       label: 'Volume (m³) *',    type: 'number',   placeholder: '6.5' },
    { key: 'supplierName', label: 'Supplier *',        type: 'text',     placeholder: 'Ready Mix Supplier' },
    { key: 'truckNumber',  label: 'Truck No.',         type: 'text',     placeholder: 'KA-01-AB-1234' },
    { key: 'pourLocation', label: 'Pour Location',     type: 'text',     placeholder: 'Column C3-D5, Level 2' },
  ],
  LABOUR_UPDATE: [
    { key: 'totalWorkers',   label: 'Total Workers *',  type: 'number',   placeholder: '32' },
    { key: 'engineers',      label: 'Engineers',         type: 'number',   placeholder: '3' },
    { key: 'supervisors',    label: 'Supervisors',       type: 'number',   placeholder: '4' },
    { key: 'labourers',      label: 'Labourers',         type: 'number',   placeholder: '25' },
    { key: 'shift',          label: 'Shift',             type: 'select',   options: ['Morning','Afternoon','Night','Full Day'] },
  ],
  MATERIAL_DELIVERY: [
    { key: 'materialName',  label: 'Material *',        type: 'text',     placeholder: 'OPC 53 Cement' },
    { key: 'quantity',      label: 'Quantity *',        type: 'number',   placeholder: '200' },
    { key: 'unit',          label: 'Unit *',            type: 'select',   options: ['Bags','Tonnes','Cft','Nos','Kg','Meters','Rmt'] },
    { key: 'supplier',      label: 'Supplier',          type: 'text',     placeholder: 'Ramco Cements' },
    { key: 'invoiceNo',     label: 'Invoice No.',       type: 'text',     placeholder: 'INV-2025-001' },
    { key: 'vehicleNo',     label: 'Vehicle No.',       type: 'text',     placeholder: 'TN-01-XX-1234' },
  ],
  ISSUE_DELAY: [
    { key: 'title',        label: 'Issue Title *',      type: 'text',     placeholder: 'Scaffolding collapse risk on Level 2' },
    { key: 'severity',     label: 'Severity *',         type: 'select',   options: ['Low','Medium','High','Critical'] },
    { key: 'category',     label: 'Category',           type: 'select',   options: ['Safety','Quality','Material','Labour','Weather','Equipment','Other'] },
    { key: 'delayHours',   label: 'Delay (hours)',      type: 'number',   placeholder: '2' },
    { key: 'actionTaken',  label: 'Action Taken',       type: 'textarea', placeholder: 'Stopped work, notified supervisor…' },
  ],
  PHOTO_UPDATE: [
    { key: 'caption',      label: 'Caption *',          type: 'text',     placeholder: 'Foundation work completed – Grid B3' },
    { key: 'area',         label: 'Area / Location',    type: 'text',     placeholder: 'North side, Level 1' },
    { key: 'milestone',    label: 'Milestone Tag',      type: 'select',   options: ['Foundation','Structure','Roofing','Finishing','Inspection','Delivery','Other'] },
  ],
}

export default function AddSiteEvent() {
  const navigate      = useNavigate()
  const [params]      = useSearchParams()
  const [step,        setStep]        = useState(params.get('type') ? 2 : 1)
  const [eventType,   setEventType]   = useState(params.get('type') || '')
  const [projectId,   setProjectId]   = useState(params.get('projectId') || '')
  const [projects,    setProjects]    = useState([])
  const [formData,    setFormData]    = useState({})
  const [notes,       setNotes]       = useState('')
  const [photos,      setPhotos]      = useState([])
  const [loading,     setLoading]     = useState(false)
  const [submitted,   setSubmitted]   = useState(false)
  const [elapsed,     setElapsed]     = useState(0)
  const timerRef      = useRef(null)
  const fileRef       = useRef(null)

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data.data || [])).catch(() => {})
  }, [])

  // Timer — track how long the form takes
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  function setField(k, v) { setFormData(f => ({ ...f, [k]: v })) }

  function handleFileChange(e) {
    const urls = Array.from(e.target.files).map(f => URL.createObjectURL(f))
    setPhotos(p => [...p, ...urls])
  }

  async function handleSubmit() {
    if (!projectId) { alert('Please select a project'); return }
    if (!eventType)  { alert('Please select an event type'); return }
    setLoading(true)
    try {
      const payload = {
        projectId,
        type: eventType,
        data: formData,
        notes: notes || buildAutoNote(),
        photos,
      }

      // For RMC pour, also create the detailed RMC record
      if (eventType === 'RMC_POUR' && formData.grade && formData.volume && formData.supplierName) {
        await api.post('/rmc', { ...formData, projectId, notes })
      } else {
        await api.post('/events', payload)
      }

      clearInterval(timerRef.current)
      setSubmitted(true)
      setTimeout(() => navigate('/events'), 1800)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to log event')
    } finally {
      setLoading(false)
    }
  }

  function buildAutoNote() {
    const d = formData
    if (eventType === 'WORK_DONE')         return d.workDone || 'Work logged'
    if (eventType === 'RMC_POUR')          return `${d.grade || ''} pour - ${d.volume || ''}m³ from ${d.supplierName || ''}`
    if (eventType === 'LABOUR_UPDATE')     return `${d.totalWorkers || '?'} workers on site`
    if (eventType === 'MATERIAL_DELIVERY') return `${d.quantity || ''} ${d.unit || ''} of ${d.materialName || ''} received`
    if (eventType === 'ISSUE_DELAY')       return d.title || 'Issue reported'
    if (eventType === 'PHOTO_UPDATE')      return d.caption || 'Photos uploaded'
    return ''
  }

  const selectedType = EVENT_TYPES.find(t => t.key === eventType)
  const fields       = QUICK_DATA[eventType] || []

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Check size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Event Logged!</h2>
          <p className="text-gray-500">Logged in {elapsed}s · Redirecting…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Log Site Event</h1>
            <p className="text-sm text-gray-400 flex items-center gap-1">
              <Clock size={12} /> {elapsed}s elapsed
              {elapsed <= 30 && <span className="text-green-500 font-semibold ml-1">· On track!</span>}
              {elapsed > 30  && <span className="text-amber-500 font-semibold ml-1">· Take your time</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-orange-500' : 'bg-gray-200'}`} />
          <div className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-orange-500' : 'bg-gray-200'}`} />
          <div className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-orange-500' : 'bg-gray-200'}`} />
        </div>
      </div>

      {/* Step 1 — Pick project */}
      {step === 1 && (
        <div className="card space-y-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <MapPin size={18} className="text-orange-500" /> Select Project
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {projects.map(p => (
              <button key={p._id} onClick={() => { setProjectId(p._id); setStep(2) }}
                className={`text-left p-4 rounded-2xl border-2 transition-all ${
                  projectId === p._id
                    ? 'border-orange-400 bg-orange-50'
                    : 'border-gray-100 hover:border-orange-200 bg-white'
                }`}>
                <div className="font-semibold text-sm text-slate-800 truncate">{p.name}</div>
                <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <MapPin size={10} />{p.location}
                </div>
              </button>
            ))}
          </div>
          {projects.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <MapPin size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No projects found. Create one first.</p>
            </div>
          )}
        </div>
      )}

      {/* Step 2 — Pick event type */}
      {step === 2 && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <Zap size={18} className="text-orange-500" /> What happened?
            </h2>
            <button onClick={() => setStep(1)} className="text-xs text-orange-500 hover:text-orange-600 font-semibold">
              Change project
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {EVENT_TYPES.map(t => {
              const Icon = t.icon
              const isSelected = eventType === t.key
              return (
                <button key={t.key}
                  onClick={() => { setEventType(t.key); setStep(3) }}
                  className="text-left p-4 rounded-2xl border-2 transition-all hover:-translate-y-0.5"
                  style={{
                    borderColor: isSelected ? t.color : '#f1f5f9',
                    backgroundColor: isSelected ? t.bg : '#fff',
                  }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                    style={{ backgroundColor: t.bg, color: t.color }}>
                    <Icon size={20} />
                  </div>
                  <div className="font-bold text-sm text-slate-800">{t.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5 leading-tight">{t.desc}</div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Step 3 — Fill details */}
      {step === 3 && selectedType && (
        <div className="space-y-4">
          {/* Type indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: selectedType.bg, color: selectedType.color }}>
                <selectedType.icon size={20} />
              </div>
              <div>
                <div className="font-bold text-slate-800">{selectedType.label}</div>
                <div className="text-xs text-gray-400">Fill details below</div>
              </div>
            </div>
            <button onClick={() => setStep(2)} className="text-xs text-orange-500 font-semibold hover:text-orange-600">
              Change type
            </button>
          </div>

          <div className="card space-y-4">
            {/* Dynamic fields */}
            {fields.map(f => (
              <div key={f.key}>
                <label className="label">{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea className="input" rows={3} value={formData[f.key] || ''}
                    onChange={e => setField(f.key, e.target.value)}
                    placeholder={f.placeholder} />
                ) : f.type === 'select' ? (
                  <select className="input" value={formData[f.key] || ''}
                    onChange={e => setField(f.key, e.target.value)}>
                    <option value="">Select…</option>
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input className="input" type={f.type} value={formData[f.key] || ''}
                    onChange={e => setField(f.key, e.target.value)}
                    placeholder={f.placeholder} />
                )}
              </div>
            ))}

            {/* Notes */}
            <div>
              <label className="label">Notes (optional)</label>
              <textarea className="input" rows={2} value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any additional context…" />
            </div>

            {/* Photo upload */}
            <div>
              <label className="label">Photos</label>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                onChange={handleFileChange} />
              <button onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 flex items-center gap-3 hover:border-orange-300 hover:bg-orange-50 transition-all text-left">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Upload size={18} className="text-orange-500" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700">
                    {photos.length > 0 ? `${photos.length} photo(s) added` : 'Add photos'}
                  </div>
                  <div className="text-xs text-gray-400">Tap to select from gallery or camera</div>
                </div>
              </button>
              {photos.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {photos.map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} alt="" className="w-16 h-16 rounded-xl object-cover" />
                      <button onClick={() => setPhotos(p => p.filter((_, idx) => idx !== i))}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white">
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading}
            className="btn btn-primary btn-lg w-full text-base font-black"
            style={{ boxShadow: '0 8px 24px rgba(249,115,22,0.35)' }}>
            {loading
              ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><Zap size={20} /> Log Event Now</>
            }
          </button>
          <p className="text-center text-xs text-gray-400">Auto-timestamped · Synced to project timeline</p>
        </div>
      )}
    </div>
  )
}