import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { Plus, Search, Package, AlertTriangle } from 'lucide-react'

export default function Inventory() {
  const [materials, setMaterials] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [filter,    setFilter]    = useState('all')

  useEffect(() => {
    api.get('/materials')
      .then(r => setMaterials(r.data.data || []))
      .catch(() => setMaterials([]))
      .finally(() => setLoading(false))
  }, [])

  function getStatus(m) {
    if (m.quantity <= m.minThreshold * 0.5) return 'critical'
    if (m.quantity <= m.minThreshold) return 'low'
    return 'ok'
  }

  const enriched = materials.map(m => ({ ...m, status: getStatus(m) }))

  const filtered = enriched.filter(m => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.project?.name || '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || m.status === filter
    return matchSearch && matchFilter
  })

  const counts = {
    total:    enriched.length,
    ok:       enriched.filter(m => m.status === 'ok').length,
    low:      enriched.filter(m => m.status === 'low').length,
    critical: enriched.filter(m => m.status === 'critical').length,
  }

  const STATUS_LABEL = { ok: 'OK', low: 'LOW', critical: 'CRITICAL' }
  const STATUS_STYLE = {
    ok:       'bg-green-100 text-green-700',
    low:      'bg-yellow-100 text-yellow-700',
    critical: 'bg-red-100 text-red-700',
  }
  const BAR_COLOR = {
    ok:       'bg-green-500',
    low:      'bg-yellow-500',
    critical: 'bg-red-500',
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Material Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track all site materials and stock levels
          </p>
        </div>
        <Link to="/materials/new" className="btn btn-primary">
          <Plus size={16} /> Add Material
        </Link>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="border border-orange-200 bg-orange-50 rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-orange-600">{counts.total}</div>
          <div className="text-xs font-semibold text-orange-500 mt-0.5">Total Items</div>
        </div>
        <div className="border border-green-200 bg-green-50 rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-green-700">{counts.ok}</div>
          <div className="text-xs font-semibold text-green-600 mt-0.5">OK</div>
        </div>
        <div className="border border-yellow-200 bg-yellow-50 rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-yellow-700">{counts.low}</div>
          <div className="text-xs font-semibold text-yellow-600 mt-0.5">Low Stock</div>
        </div>
        <div className="border border-red-200 bg-red-50 rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-red-700">{counts.critical}</div>
          <div className="text-xs font-semibold text-red-600 mt-0.5">Critical</div>
        </div>
      </div>

      {/* Alert banner */}
      {counts.critical > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            {counts.critical} material{counts.critical > 1 ? 's' : ''} critically low — immediate reorder needed!
          </p>
        </div>
      )}

      {counts.low > 0 && counts.critical === 0 && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
          <AlertTriangle size={18} className="text-yellow-500 flex-shrink-0" />
          <p className="text-sm text-yellow-700 font-medium">
            {counts.low} material{counts.low > 1 ? 's' : ''} running low — consider reordering soon.
          </p>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Search materials or project..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'ok', 'low', 'critical'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all capitalize border ${
                filter === f
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium text-gray-500">No materials found</p>
            <Link to="/materials/new" className="btn btn-primary mt-4 mx-auto">
              Add First Material
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase px-5 py-3">
                    Material
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase px-5 py-3 hidden md:table-cell">
                    Project
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-400 uppercase px-5 py-3 hidden lg:table-cell">
                    Supplier
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-400 uppercase px-5 py-3">
                    Stock
                  </th>
                  <th className="text-center text-xs font-semibold text-gray-400 uppercase px-5 py-3 hidden sm:table-cell">
                    Level
                  </th>
                  <th className="text-center text-xs font-semibold text-gray-400 uppercase px-5 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => {
                  const pct =
                    m.minThreshold > 0
                      ? Math.min(100, Math.round((m.quantity / (m.minThreshold * 3)) * 100))
                      : 100

                  return (
                    <tr key={m._id} className="border-b border-gray-50 hover:bg-orange-50/40 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-sm text-slate-800">{m.name}</p>
                        {m.minThreshold > 0 && (
                          <p className="text-xs text-gray-400">Min: {m.minThreshold} {m.unit}</p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500 hidden md:table-cell">
                        {m.project?.name || '—'}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500 hidden lg:table-cell">
                        {m.supplier || '—'}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="font-black text-slate-800 text-base">{m.quantity}</span>
                        <span className="text-xs text-gray-400 ml-1">{m.unit}</span>
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell">
                        <div className="flex items-center justify-center">
                          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${BAR_COLOR[m.status]}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_STYLE[m.status]}`}>
                          {STATUS_LABEL[m.status]}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}