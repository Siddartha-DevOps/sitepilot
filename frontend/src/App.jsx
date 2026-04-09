import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import {
  LayoutDashboard, FolderOpen, FileText, Package, Camera,
  Bell, User, LogOut, Menu, X, HardHat, ChevronRight,
} from 'lucide-react'

import Login        from './pages/Login'
import Dashboard    from './pages/Dashboard'
import Projects     from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import DailyReport  from './pages/DailyReport'
import MaterialEntry from './pages/MaterialEntry'
import Inventory    from './pages/Inventory'
import Photos       from './pages/Photos'
import Notifications from './pages/Notifications'
import Profile      from './pages/Profile'

const NAV = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/projects',     icon: FolderOpen,      label: 'Projects'      },
  { to: '/reports/new',  icon: FileText,         label: 'Daily Report'  },
  { to: '/materials/new',icon: Package,          label: 'Add Material'  },
  { to: '/inventory',    icon: Package,          label: 'Inventory'     },
  { to: '/photos',       icon: Camera,           label: 'Photos'        },
  { to: '/notifications',icon: Bell,             label: 'Notifications' },
]

function Sidebar({ open, setOpen }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-30 flex flex-col
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
              <HardHat size={20} className="text-white" />
            </div>
            <span className="text-xl font-black text-slate-800 tracking-tight">sitePilot</span>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-gray-100 p-3">
          <NavLink to="/profile" onClick={() => setOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.role}</p>
            </div>
            <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
          </NavLink>
          <button onClick={handleLogout} className="sidebar-link w-full mt-1 text-red-500 hover:bg-red-50 hover:text-red-600">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

function Topbar({ setOpen }) {
  const { user } = useAuth()
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      <button onClick={() => setOpen(p => !p)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500">
        <Menu size={20} />
      </button>
      <div className="flex-1 lg:hidden" />
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
        <NavLink to="/notifications" className="relative p-2 rounded-xl hover:bg-orange-50 text-gray-400 hover:text-orange-500 transition-colors">
          <Bell size={20} />
        </NavLink>
        <NavLink to="/profile" className="flex items-center gap-2 hover:bg-orange-50 px-2 py-1.5 rounded-xl transition-colors">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
            {(user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <span className="hidden sm:block text-sm font-semibold text-slate-700">{user?.name?.split(' ')[0]}</span>
        </NavLink>
      </div>
    </header>
  )
}

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
            <Route path="dashboard"     element={<Dashboard />} />
            <Route path="projects"      element={<Projects />} />
            <Route path="projects/:id"  element={<ProjectDetail />} />
            <Route path="reports/new"   element={<DailyReport />} />
            <Route path="materials/new" element={<MaterialEntry />} />
            <Route path="inventory"     element={<Inventory />} />
            <Route path="photos"        element={<Photos />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile"       element={<Profile />} />
            <Route path="*"             element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*"    element={<Layout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}