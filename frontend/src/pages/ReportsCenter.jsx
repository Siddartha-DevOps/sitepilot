import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import {
  FileText, Download, Mail, Share2, Calendar, RefreshCw,
  CheckCircle2, Clock, Filter, ChevronRight, Plus,
  BarChart3, Users, Package, Camera, Droplets, Eye,
  CloudUpload, Send
} from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

// ── PDF Builder (client-side, print-based) ────────────────────────────────────
function buildDailyReportHTML(report, project) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <title>Daily Report – ${project?.name || 'Project'} – ${formatDate(report.date)}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 3px solid #f97316; margin-bottom: 28px; }
        .logo { font-size: 24px; font-weight: 900; color: #f97316; }
        .title { font-size: 14px; color: #64748b; margin-top: 4px; }
        .meta { text-align: right; font-size: 12px; color: #64748b; }
        .meta strong { font-size: 16px; color: #0f172a; display: block; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #f97316; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 1px solid #fed7aa; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .field { background: #f8fafc; border-radius: 8px; padding: 12px; }
        .field-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
        .field-value { font-size: 14px; font-weight: 600; color: #1e293b; margin-top: 2px; }
        .textarea-field { background: #f8fafc; border-radius: 8px; padding: 12px; }
        .textarea-value { font-size: 13px; color: #334155; line-height: 1.6; }
        .stat-row { display: flex; gap: 16px; }
        .stat { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 12px 20px; text-align: center; flex: 1; }
        .stat-num { font-size: 28px; font-weight: 900; color: #f97316; }
        .stat-lbl { font-size: 10px; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
        .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">sitePilot</div>
          <div class="title">Daily Site Report</div>
          <div style="margin-top:8px;font-size:18px;font-weight:800;color:#1e293b;">${project?.name || 'Project'}</div>
          <div style="font-size:12px;color:#64748b;margin-top:2px;">${project?.location || ''}</div>
        </div>
        <div class="meta">
          <strong>${formatDate(report.date)}</strong>
          Generated ${new Date().toLocaleString('en-IN')}
          <div style="margin-top:4px;">By: ${report.submittedBy?.name || 'Site Engineer'}</div>
        </div>
      </div>

      <div class="stat-row" style="margin-bottom:28px;">
        <div class="stat">
          <div class="stat-num">${report.workersCount}</div>
          <div class="stat-lbl">Workers</div>
        </div>
        <div class="stat">
          <div class="stat-num">${report.photos?.length || 0}</div>
          <div class="stat-lbl">Photos</div>
        </div>
        <div class="stat">
          <div class="stat-num">${report.weather || '—'}</div>
          <div class="stat-lbl">Weather</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Work Completed</div>
        <div class="textarea-field">
          <div class="textarea-value">${report.workDone}</div>
        </div>
      </div>

      ${report.materialsUsed ? `
      <div class="section">
        <div class="section-title">Materials Used</div>
        <div class="textarea-field">
          <div class="textarea-value">${report.materialsUsed}</div>
        </div>
      </div>
      ` : ''}

      ${report.notes ? `
      <div class="section">
        <div class="section-title">Notes & Observations</div>
        <div class="textarea-field">
          <div class="textarea-value">${report.notes}</div>
        </div>
      </div>
      ` : ''}

      <div class="footer">sitePilot Construction Management · Generated automatically · ${new Date().toLocaleDateString('en-IN')}</div>
    </body>
    </html>
  `
}

function printReport(html, filename) {
  const win = window.open('', '_blank', 'width=900,height=700')
  win.document.write(html)
  win.document.close()
  win.onload = () => {
    win.focus()
    win.print()
  }
}

// ── Report card ───────────────────────────────────────────────────────────────
function ReportCard({ report, project, onPreview }) {
  const [exporting, setExporting] = useState(false)
  const [emailing,  setEmailing]  = useState(false)

  function handlePrint() {
    setExporting(true)
    try {
      const html = buildDailyReportHTML(report, project)
      printReport(html, `DailyReport_${report.date?.slice(0,10)}`)
    } finally { setTimeout(() => setExporting(false), 1000) }
  }

  function handleEmail() {
    setEmailing(true)
    const subject = encodeURIComponent(`Daily Report – ${project?.name || ''} – ${formatDate(report.date)}`)
    const body    = encodeURIComponent(
      `Please find the daily report for ${project?.name || 'the project'} on ${formatDate(report.date)}.\n\n` +
      `Work Done: ${report.workDone}\n` +
      `Workers: ${report.workersCount}\n` +
      (report.notes ? `Notes: ${report.notes}\n` : '') +
      `\nGenerated by sitePilot`
    )
    window.location.href = `mailto:?subject=${subject}&body=${body}`
    setTimeout(() => setEmailing(false), 1000)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-black text-slate-800">{formatDate(report.date)}</span>
            {project && (
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{project.name}</span>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            By {report.submittedBy?.name || '—'} · {report.workersCount} workers
          </div>
        </div>
        <div className="text-xs text-gray-400 flex items-center gap-1">
          <Clock size={11} />
          {new Date(report.createdAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
        </div>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">{report.workDone}</p>

      {/* Stats */}
      <div className="flex gap-3 mb-4">
        {[
          { icon: Users,   val: report.workersCount,       label: 'Workers' },
          { icon: Camera,  val: report.photos?.length || 0, label: 'Photos'  },
          { icon: Package, val: report.materialsUsed ? '✓' : '—', label: 'Materials' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-1.5">
            <s.icon size={12} className="text-gray-400" />
            <span className="text-sm font-bold text-slate-700">{s.val}</span>
            <span className="text-xs text-gray-400">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={handlePrint} disabled={exporting}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors border border-orange-100">
          {exporting
            ? <span className="w-3 h-3 border border-orange-500 border-t-transparent rounded-full animate-spin" />
            : <Download size={13} />
          }
          Print / PDF
        </button>
        <button onClick={handleEmail} disabled={emailing}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors border border-blue-100">
          {emailing
            ? <span className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
            : <Mail size={13} />
          }
          Email
        </button>
        <button onClick={() => onPreview(report)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors border border-gray-100">
          <Eye size={13} /> Preview
        </button>
      </div>
    </div>
  )
}

// ── Preview Modal ─────────────────────────────────────────────────────────────
function PreviewModal({ report, project, onClose }) {
  const html = buildDailyReportHTML(report, project)
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-slate-800">Report Preview</h2>
          <div className="flex gap-2">
            <button onClick={() => printReport(html)}
              className="btn btn-primary btn-sm">
              <Download size={14} /> Print / Save PDF
            </button>
            <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
          </div>
        </div>
        <iframe
          srcDoc={html}
          className="flex-1 w-full"
          title="Report Preview"
        />
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ReportsCenter() {
  const [reports,    setReports]    = useState([])
  const [projects,   setProjects]   = useState([])
  const [projectMap, setProjectMap] = useState({})
  const [loading,    setLoading]    = useState(true)
  const [projectId,  setProjectId]  = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [page,       setPage]       = useState(1)
  const [total,      setTotal]      = useState(0)
  const [preview,    setPreview]    = useState(null)

  const PER_PAGE = 12

  useEffect(() => {
    api.get('/projects')
      .then(r => {
        const list = r.data.data || []
        setProjects(list)
        const map = {}
        list.forEach(p => { map[p._id] = p })
        setProjectMap(map)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = { page, limit: PER_PAGE }
    if (projectId)  params.project = projectId
    if (dateFilter) params.date    = dateFilter

    api.get('/reports', { params })
      .then(r => {
        setReports(r.data.data || [])
        setTotal(r.data.total || 0)
      })
      .catch(() => setReports([]))
      .finally(() => setLoading(false))
  }, [projectId, dateFilter, page])

  const totalPages = Math.ceil(total / PER_PAGE)

  // Summary stats
  const totalWorkers  = reports.reduce((s, r) => s + (r.workersCount || 0), 0)
  const withPhotos    = reports.filter(r => r.photos?.length > 0).length

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <FileText size={24} className="text-orange-500" /> Reports Center
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Generate, export, and share daily site reports</p>
        </div>
        <Link to="/reports/new" className="btn btn-primary">
          <Plus size={16} /> New Report
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: FileText, label: 'Total Reports',  value: total,        color: 'text-orange-600', bg: 'bg-orange-50' },
          { icon: Users,    label: 'Worker-days',    value: totalWorkers, color: 'text-blue-600',   bg: 'bg-blue-50'   },
          { icon: Camera,   label: 'With Photos',    value: withPhotos,   color: 'text-purple-600', bg: 'bg-purple-50' },
          { icon: CheckCircle2, label: 'This Page',  value: reports.length, color: 'text-green-600', bg: 'bg-green-50'  },
        ].map(s => (
          <div key={s.label} className={`card flex items-center gap-3 ${s.bg}`}>
            <s.icon size={20} className={s.color} />
            <div>
              <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 font-medium">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk actions bar */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <select className="input flex-1" value={projectId} onChange={e => { setProjectId(e.target.value); setPage(1) }}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <input className="input flex-1" type="date" value={dateFilter}
          onChange={e => { setDateFilter(e.target.value); setPage(1) }}
          max={new Date().toISOString().split('T')[0]} />
        {(projectId || dateFilter) && (
          <button onClick={() => { setProjectId(''); setDateFilter(''); setPage(1) }}
            className="btn btn-ghost text-sm">
            Clear filters
          </button>
        )}
      </div>

      {/* Export all button */}
      {reports.length > 0 && (
        <div className="flex gap-3 items-center">
          <span className="text-sm text-gray-500">{total} reports found</span>
          <button onClick={() => {
            const subject = encodeURIComponent('Site Reports Export – sitePilot')
            const body = encodeURIComponent(`Please find attached ${total} daily reports from sitePilot.\n\nGenerated: ${new Date().toLocaleString('en-IN')}`)
            window.location.href = `mailto:?subject=${subject}&body=${body}`
          }} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700">
            <Send size={13} /> Email Summary
          </button>
        </div>
      )}

      {/* Report grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-56 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-orange-200" />
          </div>
          <p className="font-bold text-gray-500 mb-1">No reports yet</p>
          <p className="text-sm text-gray-400 mb-5">Submit your first daily report to get started.</p>
          <Link to="/reports/new" className="btn btn-primary mx-auto">+ New Report</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map(r => (
            <ReportCard
              key={r._id}
              report={r}
              project={projectMap[r.project?._id || r.project] || r.project}
              onPreview={setPreview}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="btn btn-outline btn-sm disabled:opacity-40">← Prev</button>
          <span className="text-sm text-gray-500 font-medium">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="btn btn-outline btn-sm disabled:opacity-40">Next →</button>
        </div>
      )}

      {/* PDF Integration notice */}
      <div className="card bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
            <CloudUpload size={22} className="text-orange-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Cloud Export & Integrations</h3>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              Reports can be exported to Google Drive, emailed via Outlook, or shared as a link.
              Click <strong>Print / PDF</strong> on any report to save it, or <strong>Email</strong> to send via your mail client.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {['Google Drive', 'Outlook', 'Email', 'PDF Export'].map(t => (
                <span key={t} className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full font-semibold">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {preview && (
        <PreviewModal
          report={preview}
          project={projectMap[preview.project?._id || preview.project] || preview.project}
          onClose={() => setPreview(null)}
        />
      )}
    </div>
  )
}