import React, { useState } from 'react'
import {
  CheckSquare, Plus, X, ChevronDown, ChevronUp,
  AlertCircle, Clock, CheckCircle2, Circle,
  Flag, User, Calendar, Filter, Search,
  Trash2, Edit3, MoreVertical, Zap
} from 'lucide-react'

// ── Sample Data ──────────────────────────────────────────────────────────────
const SAMPLE_TASKS = [
  { id: 1,  title: 'Complete foundation inspection – Grid B3',     project: 'Highway NH-44',         assignee: 'Ravi Kumar',   due: '2025-01-20', priority: 'high',   status: 'open',        category: 'Inspection' },
  { id: 2,  title: 'Order additional TMT steel bars (20 tonnes)',   project: 'Highway NH-44',         assignee: 'Suresh M',     due: '2025-01-18', priority: 'urgent', status: 'in-progress', category: 'Procurement' },
  { id: 3,  title: 'Fix scaffolding on Level 2 north side',         project: 'Commercial Complex A',  assignee: 'Ravi Kumar',   due: '2025-01-17', priority: 'urgent', status: 'open',        category: 'Safety' },
  { id: 4,  title: 'Submit weekly material consumption report',     project: 'Residential Colony P2', assignee: 'Priya S',      due: '2025-01-19', priority: 'medium', status: 'open',        category: 'Reporting' },
  { id: 5,  title: 'Inspect waterproofing Layer 1 slabs',           project: 'Water Treatment Plant', assignee: 'Suresh M',     due: '2025-01-15', priority: 'high',   status: 'done',        category: 'Inspection' },
  { id: 6,  title: 'Clear debris from entry road',                  project: 'Highway NH-44',         assignee: 'Priya S',      due: '2025-01-16', priority: 'low',    status: 'done',        category: 'Maintenance' },
  { id: 7,  title: 'Renew electrical safety certification',         project: 'Commercial Complex A',  assignee: 'Ravi Kumar',   due: '2025-01-22', priority: 'medium', status: 'open',        category: 'Compliance' },
  { id: 8,  title: 'Concrete pouring – Block D columns',            project: 'Residential Colony P2', assignee: 'Suresh M',     due: '2025-01-21', priority: 'high',   status: 'in-progress', category: 'Construction' },
]

const PROJECTS  = ['All Projects', 'Highway NH-44', 'Commercial Complex A', 'Residential Colony P2', 'Water Treatment Plant']
const ASSIGNEES = ['All Assignees', 'Ravi Kumar', 'Suresh M', 'Priya S']
const CATEGORIES = ['Inspection', 'Procurement', 'Safety', 'Reporting', 'Maintenance', 'Compliance', 'Construction', 'Other']

const PRIORITY_META = {
  urgent: { label: 'Urgent', color: '#ef4444', bg: '#fef2f2', icon: '🔴' },
  high:   { label: 'High',   color: '#f97316', bg: '#fff7ed', icon: '🟠' },
  medium: { label: 'Medium', color: '#eab308', bg: '#fefce8', icon: '🟡' },
  low:    { label: 'Low',    color: '#22c55e', bg: '#f0fdf4', icon: '🟢' },
}

const STATUS_META = {
  open:        { label: 'Open',        color: '#64748b', bg: '#f1f5f9', icon: Circle },
  'in-progress':{ label: 'In Progress', color: '#f97316', bg: '#fff7ed', icon: Clock },
  done:        { label: 'Done',        color: '#22c55e', bg: '#f0fdf4', icon: CheckCircle2 },
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function isOverdue(due, status) {
  return status !== 'done' && new Date(due) < new Date()
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

// ── Add Task Modal ────────────────────────────────────────────────────────────
function AddTaskModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    title: '', project: PROJECTS[1], assignee: ASSIGNEES[1],
    due: new Date().toISOString().split('T')[0],
    priority: 'medium', category: 'Construction', notes: '',
  })
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function submit(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    onAdd({ ...form, id: Date.now(), status: 'open' })
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, backgroundColor: '#fff7ed', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={18} color="#f97316" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>New Task</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>Add to punch list</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} style={{ padding: 24 }}>
          {/* Title */}
          <div style={{ marginBottom: 16 }}>
            <label style={ls.label}>Task Title *</label>
            <input value={form.title} onChange={e => sf('title', e.target.value)}
              placeholder="e.g. Fix scaffolding on Level 2 north side"
              required style={ls.input} />
          </div>

          {/* Project + Assignee */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={ls.label}>Project</label>
              <select value={form.project} onChange={e => sf('project', e.target.value)} style={ls.input}>
                {PROJECTS.slice(1).map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={ls.label}>Assignee</label>
              <select value={form.assignee} onChange={e => sf('assignee', e.target.value)} style={ls.input}>
                {ASSIGNEES.slice(1).map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
          </div>

          {/* Due + Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={ls.label}>Due Date</label>
              <input type="date" value={form.due} onChange={e => sf('due', e.target.value)} style={ls.input} />
            </div>
            <div>
              <label style={ls.label}>Priority</label>
              <select value={form.priority} onChange={e => sf('priority', e.target.value)} style={ls.input}>
                {Object.entries(PRIORITY_META).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
              </select>
            </div>
          </div>

          {/* Category */}
          <div style={{ marginBottom: 16 }}>
            <label style={ls.label}>Category</label>
            <select value={form.category} onChange={e => sf('category', e.target.value)} style={ls.input}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 24 }}>
            <label style={ls.label}>Notes (optional)</label>
            <textarea value={form.notes} onChange={e => sf('notes', e.target.value)}
              placeholder="Any additional context..."
              rows={3} style={{ ...ls.input, resize: 'vertical', fontFamily: 'inherit' }} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
              Cancel
            </button>
            <button type="submit"
              style={{ flex: 2, padding: '12px 0', borderRadius: 10, border: 'none', background: '#f97316', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Task Card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, onStatusChange, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pm     = PRIORITY_META[task.priority]
  const sm     = STATUS_META[task.status]
  const overdue = isOverdue(task.due, task.status)
  const StatusIcon = sm.icon

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: 14,
      padding: '16px 18px',
      marginBottom: 10,
      border: `1.5px solid ${overdue ? '#fecaca' : '#f1f5f9'}`,
      boxShadow: overdue ? '0 2px 12px rgba(239,68,68,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
      transition: 'all 0.2s',
      opacity: task.status === 'done' ? 0.65 : 1,
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>

        {/* Status toggle button */}
        <button
          onClick={() => {
            const cycle = { open: 'in-progress', 'in-progress': 'done', done: 'open' }
            onStatusChange(task.id, cycle[task.status])
          }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 2, color: sm.color, flexShrink: 0 }}
          title="Click to advance status"
        >
          <StatusIcon size={20} />
        </button>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{
              fontSize: 14, fontWeight: 600, color: '#0f172a', lineHeight: 1.4,
              textDecoration: task.status === 'done' ? 'line-through' : 'none',
            }}>
              {task.title}
            </div>
            {/* Menu */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button onClick={() => setMenuOpen(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2 }}>
                <MoreVertical size={16} />
              </button>
              {menuOpen && (
                <div style={{ position: 'absolute', right: 0, top: 24, backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 10, minWidth: 140, overflow: 'hidden' }}>
                  {Object.entries(STATUS_META).map(([k, v]) => (
                    <button key={k} onClick={() => { onStatusChange(task.id, k); setMenuOpen(false) }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#334155', textAlign: 'left' }}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <v.icon size={14} color={v.color} /> Mark {v.label}
                    </button>
                  ))}
                  <div style={{ height: 1, backgroundColor: '#f1f5f9' }} />
                  <button onClick={() => { onDelete(task.id); setMenuOpen(false) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#ef4444', textAlign: 'left' }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Meta row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {/* Priority badge */}
            <span style={{ fontSize: 11, fontWeight: 700, color: pm.color, backgroundColor: pm.bg, padding: '2px 8px', borderRadius: 6 }}>
              {pm.icon} {pm.label}
            </span>
            {/* Status badge */}
            <span style={{ fontSize: 11, fontWeight: 700, color: sm.color, backgroundColor: sm.bg, padding: '2px 8px', borderRadius: 6 }}>
              {sm.label}
            </span>
            {/* Category */}
            <span style={{ fontSize: 11, color: '#64748b', backgroundColor: '#f8fafc', padding: '2px 8px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
              {task.category}
            </span>
          </div>

          {/* Bottom row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <User size={12} color="#94a3b8" />
              <span style={{ fontSize: 12, color: '#64748b' }}>{task.assignee}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={12} color={overdue ? '#ef4444' : '#94a3b8'} />
              <span style={{ fontSize: 12, color: overdue ? '#ef4444' : '#64748b', fontWeight: overdue ? 700 : 400 }}>
                {overdue ? '⚠ Overdue · ' : ''}{formatDate(task.due)}
              </span>
            </div>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>{task.project}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function Tasks() {
  const [tasks,       setTasks]       = useState(SAMPLE_TASKS)
  const [showModal,   setShowModal]   = useState(false)
  const [search,      setSearch]      = useState('')
  const [filterProj,  setFilterProj]  = useState('All Projects')
  const [filterUser,  setFilterUser]  = useState('All Assignees')
  const [filterStat,  setFilterStat]  = useState('all')
  const [filterPri,   setFilterPri]   = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [view,        setView]        = useState('list') // list | board

  function addTask(task) { setTasks(t => [task, ...t]) }
  function updateStatus(id, status) { setTasks(t => t.map(x => x.id === id ? { ...x, status } : x)) }
  function deleteTask(id) { setTasks(t => t.filter(x => x.id !== id)) }

  const filtered = tasks.filter(t => {
    if (search       && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.assignee.toLowerCase().includes(search.toLowerCase())) return false
    if (filterProj !== 'All Projects'  && t.project  !== filterProj) return false
    if (filterUser !== 'All Assignees' && t.assignee !== filterUser) return false
    if (filterStat !== 'all'           && t.status   !== filterStat) return false
    if (filterPri  !== 'all'           && t.priority !== filterPri)  return false
    return true
  })

  const counts = {
    open:        tasks.filter(t => t.status === 'open').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    done:        tasks.filter(t => t.status === 'done').length,
    overdue:     tasks.filter(t => isOverdue(t.due, t.status)).length,
  }

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", minHeight: '100%' }}>

      {showModal && <AddTaskModal onClose={() => setShowModal(false)} onAdd={addTask} />}

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 38, height: 38, backgroundColor: '#fff7ed', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckSquare size={20} color="#f97316" />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: -0.5 }}>Tasks & Punch List</h1>
          </div>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, marginLeft: 48 }}>Track, assign and close site tasks across all projects</p>
        </div>
        <button onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', backgroundColor: '#f97316', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(249,115,22,0.35)' }}>
          <Plus size={18} /> New Task
        </button>
      </div>

      {/* ── Stats Strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Open',        value: counts.open,          color: '#64748b', bg: '#f8fafc',  icon: Circle },
          { label: 'In Progress', value: counts['in-progress'],color: '#f97316', bg: '#fff7ed',  icon: Clock },
          { label: 'Done',        value: counts.done,          color: '#22c55e', bg: '#f0fdf4',  icon: CheckCircle2 },
          { label: 'Overdue',     value: counts.overdue,       color: '#ef4444', bg: '#fef2f2',  icon: AlertCircle },
        ].map(s => (
          <div key={s.label} style={{ backgroundColor: s.bg, borderRadius: 14, padding: '14px 16px', border: `1.5px solid ${s.color}22` }}
            onClick={() => setFilterStat(s.label.toLowerCase().replace(' ', '-'))}
            style={{ backgroundColor: s.bg, borderRadius: 14, padding: '14px 16px', border: `1.5px solid ${s.color}22`, cursor: 'pointer' }}
          >
            <div style={{ fontSize: 26, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: s.color, marginTop: 4, opacity: 0.8 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Search + Filters ── */}
      <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, border: '1.5px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ flex: '1 1 200px', position: 'relative' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks or assignees..."
              style={{ width: '100%', padding: '9px 12px 9px 36px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 13, color: '#334155', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          {/* Filter toggle */}
          <button onClick={() => setShowFilters(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', border: '1.5px solid #e2e8f0', borderRadius: 10, background: showFilters ? '#fff7ed' : '#fff', color: showFilters ? '#f97316' : '#64748b', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            <Filter size={15} /> Filters {showFilters ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
          </button>
          {/* View toggle */}
          <div style={{ display: 'flex', border: '1.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
            {['list', 'board'].map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: '9px 14px', background: view === v ? '#f97316' : '#fff', color: view === v ? '#fff' : '#64748b', border: 'none', fontWeight: 600, fontSize: 12, cursor: 'pointer', textTransform: 'capitalize' }}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
            {[
              { label: 'Project',  value: filterProj,  set: setFilterProj,  opts: PROJECTS },
              { label: 'Assignee', value: filterUser,  set: setFilterUser,  opts: ASSIGNEES },
              { label: 'Status',   value: filterStat,  set: setFilterStat,
                opts: [{ v:'all',label:'All Status'}, ...Object.entries(STATUS_META).map(([k,v]) => ({v:k,label:v.label}))] },
              { label: 'Priority', value: filterPri,   set: setFilterPri,
                opts: [{ v:'all',label:'All Priority'}, ...Object.entries(PRIORITY_META).map(([k,v]) => ({v:k,label:v.label}))] },
            ].map(f => (
              <div key={f.label}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: 4 }}>{f.label.toUpperCase()}</label>
                <select value={f.value} onChange={e => f.set(e.target.value)}
                  style={{ padding: '7px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#334155', outline: 'none', backgroundColor: '#fff' }}>
                  {f.opts.map(o => typeof o === 'string'
                    ? <option key={o} value={o}>{o}</option>
                    : <option key={o.v} value={o.v}>{o.label}</option>
                  )}
                </select>
              </div>
            ))}
            <button onClick={() => { setFilterProj('All Projects'); setFilterUser('All Assignees'); setFilterStat('all'); setFilterPri('all'); setSearch('') }}
              style={{ padding: '7px 14px', border: '1.5px solid #fecaca', borderRadius: 8, fontSize: 12, color: '#ef4444', background: '#fef2f2', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-end' }}>
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* ── List View ── */}
      {view === 'list' && (
        <div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
              <CheckSquare size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <div style={{ fontSize: 15, fontWeight: 600 }}>No tasks found</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Try changing your filters or add a new task</div>
            </div>
          ) : (
            filtered.map(task => (
              <TaskCard key={task.id} task={task} onStatusChange={updateStatus} onDelete={deleteTask} />
            ))
          )}
        </div>
      )}

      {/* ── Board View (Kanban) ── */}
      {view === 'board' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {Object.entries(STATUS_META).map(([statusKey, sm]) => {
            const col = filtered.filter(t => t.status === statusKey)
            const StatusIcon = sm.icon
            return (
              <div key={statusKey} style={{ backgroundColor: '#f8fafc', borderRadius: 16, padding: 16, border: '1.5px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <StatusIcon size={16} color={sm.color} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: sm.color }}>{sm.label}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, backgroundColor: sm.bg, color: sm.color, padding: '2px 8px', borderRadius: 99 }}>{col.length}</span>
                </div>
                {col.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#cbd5e1', fontSize: 12 }}>No tasks</div>
                )}
                {col.map(task => (
                  <TaskCard key={task.id} task={task} onStatusChange={updateStatus} onDelete={deleteTask} />
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Result count ── */}
      {filtered.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#94a3b8' }}>
          Showing {filtered.length} of {tasks.length} tasks
        </div>
      )}
    </div>
  )
}

// ── Local styles ──────────────────────────────────────────────────────────────
const ls = {
  label: { display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#0f172a', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' },
}