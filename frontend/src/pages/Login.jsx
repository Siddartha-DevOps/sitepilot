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
    <div className="min-h-screen flex flex-col">

      {/* ── Original login content (untouched) ── */}
      <div className="flex flex-1">
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
          <p className="text-sm text-orange-200">© 2026 sitePilot</p>
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

      {/* ── Footer (new — added below, original code above is untouched) ── */}
      <footer style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px 24px' }}>

          {/* Top 3-column grid */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48, marginBottom: 40 }}>

            {/* LEFT — Brand + description + socials + copyright */}
            <div style={{ flex: '1 1 260px', minWidth: 220 }}>
              {/* Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, backgroundColor: '#f97316', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <span style={{ color: '#f1f5f9', fontWeight: 900, fontSize: 20 }}>sitePilot</span>
              </div>

              {/* Description */}
              <p style={{ fontSize: 11.5, lineHeight: 1.7, color: '#64748b', marginBottom: 20, maxWidth: 280 }}>
                SitePilot is a Construction Management Platform for contractors to manage projects. Advancing the construction industry for daily workloads, enhancing lives of people working in construction with technology, innovation, and building a global community of groundbreakers. We connect a global construction platform uniting all stakeholders on a project with unlimited access to support and a business model designed for the construction industry.
              </p>

              {/* Social icons */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                {[
                  { href: 'https://linkedin.com',  label: 'LinkedIn',  svg: <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z" /> },
                  { href: 'https://facebook.com',  label: 'Facebook',  svg: <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /> },
                  { href: 'https://twitter.com',   label: 'X',         svg: <path d="M4 4l16 16M4 20L20 4" strokeLinecap="round" /> },
                  { href: 'https://instagram.com', label: 'Instagram', svg: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></> },
                  { href: 'https://youtube.com',   label: 'YouTube',   svg: <><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></> },
                ].map(({ href, label, svg }) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer" title={label}
                    style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#f97316'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = '#334155'}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">{svg}</svg>
                  </a>
                ))}
              </div>

              {/* Copyright */}
              <p style={{ fontSize: 11, color: '#475569' }}>© 2026 SitePilot Technologies, Inc.</p>
            </div>

            {/* MIDDLE — New to SitePilot + About SitePilot */}
            <div style={{ flex: '1 1 180px', minWidth: 160, display: 'flex', gap: 40, flexWrap: 'wrap' }}>
              <div>
                <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13, marginBottom: 14 }}>New to SitePilot?</p>
                {['What is SitePilot?', 'Platform Overview', 'Product Updates', 'Resource Center', 'Trust & Security', 'App Marketplace', 'Developers / API'].map(l => (
                  <a key={l} href={l === 'What is SitePilot?' ? '/what-is-sitepilot' : '#'} style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 9, textDecoration: 'none' }}
                    onMouseOver={e => e.currentTarget.style.color = '#f97316'}
                    onMouseOut={e => e.currentTarget.style.color = '#64748b'}
                  >{l}</a>
                ))}
              </div>
              <div>
                <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13, marginBottom: 14 }}>About SitePilot</p>
                {['Our Story', 'Blog', 'Careers', 'Contact Us', 'Investors', 'Legal', 'Newsroom'].map(l => (
                  <a key={l} href="#" style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 9, textDecoration: 'none' }}
                    onMouseOver={e => e.currentTarget.style.color = '#f97316'}
                    onMouseOut={e => e.currentTarget.style.color = '#64748b'}
                  >{l}</a>
                ))}
              </div>
            </div>

            {/* RIGHT — Downloads */}
            <div style={{ flex: '1 1 160px', minWidth: 140 }}>
              <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13, marginBottom: 14 }}>Downloads</p>

              {/* Apple App Store */}
              <a href="https://apps.apple.com" target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 10, padding: '10px 14px', marginBottom: 10, textDecoration: 'none', width: 'fit-content' }}
                onMouseOver={e => e.currentTarget.style.borderColor = '#f97316'}
                onMouseOut={e => e.currentTarget.style.borderColor = '#334155'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                <div>
                  <div style={{ fontSize: 9, color: '#94a3b8', lineHeight: 1 }}>Download on the</div>
                  <div style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 700, lineHeight: 1.4 }}>App Store</div>
                </div>
              </a>

              {/* Google Play */}
              <a href="https://play.google.com" target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 10, backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 10, padding: '10px 14px', textDecoration: 'none', width: 'fit-content' }}
                onMouseOver={e => e.currentTarget.style.borderColor = '#f97316'}
                onMouseOut={e => e.currentTarget.style.borderColor = '#334155'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 20.5v-17c0-.83 1-.83 1.5-.5l14 8.5-14 8.5c-.5.33-1.5.33-1.5-.5z" fill="#4CAF50"/>
                  <path d="M3 3.5L13.5 14 3 20.5V3.5z" fill="#81C784"/>
                  <path d="M13.5 14L17.5 12 20.5 14l-7 4.5L13.5 14z" fill="#F44336"/>
                  <path d="M13.5 14L17.5 16 20.5 14 17.5 12 13.5 14z" fill="#FFEB3B"/>
                </svg>
                <div>
                  <div style={{ fontSize: 9, color: '#94a3b8', lineHeight: 1 }}>Get it on</div>
                  <div style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 700, lineHeight: 1.4 }}>Google Play</div>
                </div>
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: 20, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {['Privacy Notice', 'Terms of Service', 'Do Not Sell Personal Information'].map(l => (
                <a key={l} href="#" style={{ fontSize: 11, color: '#475569', textDecoration: 'none' }}
                  onMouseOver={e => e.currentTarget.style.color = '#f97316'}
                  onMouseOut={e => e.currentTarget.style.color = '#475569'}
                >{l}</a>
              ))}
            </div>
            <p style={{ fontSize: 11, color: '#475569' }}>
              📞 Call us at{' '}
              <a href="tel:+18664776267" style={{ color: '#f97316', textDecoration: 'none' }}>(866) 477-6267</a>
              {' '}to speak with a product expert.
            </p>
          </div>

        </div>
      </footer>

    </div>
  )
}