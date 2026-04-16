import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import {
  LayoutDashboard, FolderOpen, FileText, Package, Camera, Bell,
  LogOut, Menu, X, HardHat, ChevronRight, CheckSquare, MessageCircle,
  Zap, Droplets, ClipboardList,
} from 'lucide-react'

// ── Pages (existing) ──────────────────────────────────────────────────────────
import Login           from './pages/Login'
import Dashboard       from './pages/Dashboard'
import Projects        from './pages/Projects'
import Tasks           from './pages/Tasks'
import ProjectDetail   from './pages/ProjectDetail'
import DailyReport     from './pages/DailyReport'
import MaterialEntry   from './pages/MaterialEntry'
import Inventory       from './pages/Inventory'
import Photos          from './pages/Photos'
import Notifications   from './pages/Notifications'
import Profile         from './pages/Profile'
import WhatIsSitePilot from './pages/WhatIsSitePilot'
import Chat            from './pages/Chat'

// ── New Pages ─────────────────────────────────────────────────────────────────
import SiteTimeline    from './pages/SiteTimeline'
import AddSiteEvent    from './pages/AddSiteEvent'
import RMCPour         from './pages/RMCPour'
import ReportsCenter   from './pages/ReportsCenter'

// ── Nav definition ────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'     },
      { to: '/projects',      icon: FolderOpen,      label: 'Projects'      },
      { to: '/notifications', icon: Bell,            label: 'Notifications' },
    ],
  },
  {
    label: 'Site Activity',
    items: [
      { to: '/events',        icon: Zap,             label: 'Site Timeline' },
      { to: '/events/add',    icon: Zap,             label: 'Log Event',    accent: true },
      { to: '/rmc',           icon: Droplets,        label: 'RMC Pours'    },
    ],
  },
  {
    label: 'Reports & Data',
    items: [
      { to: '/reports',       icon: ClipboardList,   label: 'Reports'       },
      { to: '/reports/new',   icon: FileText,        label: 'New Report'    },
      { to: '/materials/new', icon: Package,         label: 'Add Material'  },
      { to: '/inventory',     icon: Package,         label: 'Inventory'     },
    ],
  },
  {
    label: 'Team',
    items: [
      { to: '/photos',        icon: Camera,          label: 'Photos'        },
      { to: '/tasks',         icon: CheckSquare,     label: 'Tasks'         },
      { to: '/chat',          icon: MessageCircle,   label: 'Chat'          },
    ],
  },
]

// Flat list for mobile bottom tab or any other use
const NAV_FLAT = NAV_GROUPS.flatMap(g => g.items)

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ open, setOpen }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-30 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
              <HardHat size={20} className="text-white" />
            </div>
            <span className="text-xl font-black text-slate-800">sitePilot</span>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-gray-400"><X size={20} /></button>
        </div>

        {/* Quick log event CTA */}
        <div className="px-3 pt-4 pb-2">
          <NavLink to="/events/add" onClick={() => setOpen(false)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-4 py-2.5 text-sm font-bold transition-colors shadow-sm">
            <Zap size={16} /> Log Site Event
            <span className="ml-auto text-orange-200 text-xs">&lt;30s</span>
          </NavLink>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <div className="px-4 py-1 text-xs font-black text-gray-400 uppercase tracking-wider">{group.label}</div>
              <div className="space-y-0.5">
                {group.items.map(({ to, icon: Icon, label }) => (
                  <NavLink key={to} to={to} onClick={() => setOpen(false)}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}>
                    <Icon size={17} /><span>{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Profile + logout */}
        <div className="border-t border-gray-100 p-3">
          <NavLink to="/profile" onClick={() => setOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold flex-shrink-0">{initials}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.role}</p>
            </div>
            <ChevronRight size={14} className="text-gray-400" />
          </NavLink>
          <button onClick={() => { logout(); navigate('/login') }}
            className="sidebar-link w-full mt-1 text-red-500 hover:bg-red-50 hover:text-red-600">
            <LogOut size={18} /><span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

// ── Topbar ────────────────────────────────────────────────────────────────────
function Topbar({ setOpen }) {
  const { user } = useAuth()
  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      <button onClick={() => setOpen(p => !p)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500">
        <Menu size={20} />
      </button>
      <div className="flex-1" />
      <NavLink to="/profile"
        className="flex items-center gap-2 hover:bg-orange-50 px-2 py-1.5 rounded-xl transition-colors">
        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">{initials}</div>
        <span className="hidden sm:block text-sm font-semibold text-slate-700">{user?.name?.split(' ')[0]}</span>
      </NavLink>
    </header>
  )
}

// ── App shell ─────────────────────────────────────────────────────────────────
function Layout() {
  const [open, setOpen] = useState(false)
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-orange-500">
      <div className="text-center text-white">
        <div className="text-5xl font-black mb-4">sitePilot</div>
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar open={open} setOpen={setOpen} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar setOpen={setOpen} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 fade-in">
          <Routes>
            {/* ── Original routes (untouched) ── */}
            <Route path="dashboard"     element={<Dashboard />} />
            <Route path="projects"      element={<Projects />} />
            <Route path="projects/:id"  element={<ProjectDetail />} />
            <Route path="reports/new"   element={<DailyReport />} />
            <Route path="materials/new" element={<MaterialEntry />} />
            <Route path="inventory"     element={<Inventory />} />
            <Route path="photos"        element={<Photos />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile"       element={<Profile />} />
            <Route path="tasks"         element={<Tasks />} />
            <Route path="chat"          element={<Chat />} />

            {/* ── New routes ── */}
            <Route path="events"        element={<SiteTimeline />} />
            <Route path="events/add"    element={<AddSiteEvent />} />
            <Route path="rmc"           element={<RMCPour />} />
            <Route path="reports"       element={<ReportsCenter />} />

            <Route path="*"             element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"              element={<Login />} />
          <Route path="/what-is-sitepilot" element={<WhatIsSitePilot />} />
          <Route path="/*"                  element={<Layout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}