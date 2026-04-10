import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HardHat, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [tab,     setTab]     = useState('login')
  const [form,    setForm]    = useState({ name: '', email: '', password: '', company: '', role: 'Site Engineer' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 'login') {
        await login(form.email, form.password)
      } else {
        await register({ name: form.name, email: form.email, password: form.password, company: form.company, role: form.role })
      }
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  async function demoLogin() {
    setLoading(true)
    setError('')
    try {
      await login('ravi@sitepilot.com', 'password123')
      navigate('/dashboard', { replace: true })
    } catch {
      setError('Demo failed — run "npm run seed" in the backend first.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-orange-500 to-orange-600 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <HardHat size={22} />
          </div>
          <span className="text-2xl font-black">sitePilot</span>
        </div>
        <div>
          <h1 className="text-5xl font-black leading-tight mb-4">Manage your construction sites from anywhere.</h1>
          <p className="text-orange-100 text-lg">Track projects, daily reports, materials and photos — all in one place.</p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[{ v: '500+', l: 'Active Sites' }, { v: '12K+', l: 'Reports Filed' }, { v: '98%', l: 'On-time Delivery' }, { v: '50+', l: 'Companies' }].map(s => (
              <div key={s.l} className="bg-white/10 rounded-2xl p-4">
                <div className="text-3xl font-black">{s.v}</div>
                <div className="text-sm text-orange-100 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-orange-200">© 2025 sitePilot</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
              <HardHat size={18} className="text-white" />
            </div>
            <span className="text-2xl font-black text-slate-800">sitePilot</span>
          </div>

          <div className="card shadow-lg">
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              {['login', 'register'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}>
                  {t === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'register' && (
                <>
                  <div>
                    <label className="label">Full Name</label>
                    <input className="input" value={form.name} onChange={e => sf('name', e.target.value)} placeholder="Ravi Kumar" required />
                  </div>
                  <div>
                    <label className="label">Company</label>
                    <input className="input" value={form.company} onChange={e => sf('company', e.target.value)} placeholder="Kumar Constructions" />
                  </div>
                  <div>
                    <label className="label">Role</label>
                    <select className="input" value={form.role} onChange={e => sf('role', e.target.value)}>
                      {['Admin', 'Site Engineer', 'Supervisor', 'Labour'].map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input className="input pl-9" type="email" value={form.email} onChange={e => sf('email', e.target.value)} placeholder="you@company.com" required />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input className="input pl-9 pr-10" type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => sf('password', e.target.value)} placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 rounded-xl px-4 py-3 text-sm">
                  <AlertCircle size={16} />{error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button onClick={demoLogin} disabled={loading} className="btn btn-outline btn-lg w-full">
              🚀 Demo Login — No Setup Needed
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">ravi@sitepilot.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  )
}