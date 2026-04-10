import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { HardHat, ArrowRight, CheckCircle2, BarChart3, FileText, Package, Camera, Bell, Users, Shield, Zap, Globe, ChevronDown } from 'lucide-react'

const FEATURES = [
  { icon: <BarChart3 size={28} />, title: 'Project Dashboard', desc: 'Real-time visibility into every active site — progress, budget, timelines and alerts in one unified view.' },
  { icon: <FileText size={28} />, title: 'Daily Reports', desc: 'Engineers submit structured daily reports from the field. Every activity, worker count, and observation logged instantly.' },
  { icon: <Package size={28} />, title: 'Material Tracking', desc: 'Track inventory levels, delivery receipts, and low-stock alerts across all your sites automatically.' },
  { icon: <Camera size={28} />, title: 'Progress Photos', desc: 'Geo-tagged photo documentation tied to specific dates and project milestones — the site audit trail.' },
  { icon: <Bell size={28} />, title: 'Smart Notifications', desc: 'Push alerts for overdue reports, low materials, budget thresholds and project deadline risks.' },
  { icon: <Users size={28} />, title: 'Team Management', desc: 'Role-based access for Admins, Engineers, Supervisors and Labour — the right data to the right people.' },
]

const STATS = [
  { v: '500+', l: 'Active Sites' },
  { v: '12K+', l: 'Reports Filed' },
  { v: '98%',  l: 'On-time Delivery' },
  { v: '50+',  l: 'Companies' },
]

const STEPS = [
  { n: '01', title: 'Create your project', desc: 'Set up a project with location, budget, timeline, and assign your site team in under 2 minutes.' },
  { n: '02', title: 'Field teams report daily', desc: 'Engineers log work done, workers present, materials used, and photos straight from their phone.' },
  { n: '03', title: 'Management gets clarity', desc: 'Live dashboards, consolidated reports, and automatic alerts keep every stakeholder informed without calls.' },
]

export default function WhatIsSitePilot() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const heroRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", backgroundColor: '#f8fafc', color: '#0f172a', overflowX: 'hidden' }}>

      {/* ── Sticky Nav ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        backgroundColor: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.08)' : 'none',
        transition: 'all 0.3s ease',
        padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: 36, height: 36, backgroundColor: '#f97316', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HardHat size={18} color="white" />
          </div>
          <span style={{ fontWeight: 900, fontSize: 20, color: scrolled ? '#0f172a' : '#fff' }}>sitePilot</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/')}
            style={{ padding: '8px 20px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.4)', background: 'transparent', color: scrolled ? '#64748b' : '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            Sign In
          </button>
          <button onClick={() => navigate('/')}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#f97316', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Get Started Free
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section ref={heroRef} style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '120px 24px 80px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          backgroundImage: 'linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        {/* Glow */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 820 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 99, padding: '6px 16px', marginBottom: 28 }}>
            <Zap size={14} color="#f97316" />
            <span style={{ fontSize: 13, color: '#fb923c', fontWeight: 600 }}>Construction Management, Reimagined</span>
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, color: '#fff', lineHeight: 1.08, marginBottom: 24, letterSpacing: '-2px' }}>
            What is <span style={{ color: '#f97316' }}>sitePilot</span>?
          </h1>

          <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: '#94a3b8', lineHeight: 1.7, marginBottom: 40, maxWidth: 640, margin: '0 auto 40px' }}>
            SitePilot is a Construction Management Platform built for contractors to manage projects end-to-end — from daily field reports to material tracking, team coordination, and live progress visibility — all in one place.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 12, background: '#f97316', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer', boxShadow: '0 8px 30px rgba(249,115,22,0.4)' }}>
              Start for Free <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/')}
              style={{ padding: '14px 32px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 600, fontSize: 16, border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer' }}>
              🚀 Try Demo
            </button>
          </div>

          <div style={{ marginTop: 64, display: 'flex', justifyContent: 'center' }}>
            <ChevronDown size={28} color="rgba(255,255,255,0.3)" style={{ animation: 'bounce 2s infinite' }} />
          </div>
        </div>

        <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }`}</style>
      </section>

      {/* ── Stats ── */}
      <section style={{ background: '#f97316', padding: '48px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0 }}>
          {STATS.map((s, i) => (
            <div key={s.l} style={{
              flex: '1 1 180px', textAlign: 'center', padding: '16px 24px',
              borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.25)' : 'none',
            }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: '#fff', letterSpacing: -1 }}>{s.v}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 600, marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── What is SitePilot — description ── */}
      <section style={{ padding: '96px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 64, alignItems: 'center' }}>
          <div style={{ flex: '1 1 360px' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#f97316', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>The Platform</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, lineHeight: 1.15, letterSpacing: -1, marginBottom: 24 }}>
              One platform.<br />Every site.<br />Total control.
            </h2>
            <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.8, marginBottom: 20 }}>
              SitePilot connects every stakeholder on a construction project — from site engineers on the ground to project managers in the office — with unlimited access to real-time data and a business model designed specifically for the construction industry.
            </p>
            <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.8, marginBottom: 32 }}>
              We're advancing the construction industry by improving the lives of people working in construction, driving technology innovation, and building a global community of groundbreakers.
            </p>
            {['No more WhatsApp report chains', 'No more Excel inventory sheets', 'No more missed material deliveries', 'No more unclear project status'].map(p => (
              <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <CheckCircle2 size={18} color="#f97316" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 15, color: '#334155', fontWeight: 500 }}>{p}</span>
              </div>
            ))}
          </div>

          {/* Visual card stack */}
          <div style={{ flex: '1 1 340px', position: 'relative', minHeight: 360 }}>
            <div style={{ position: 'absolute', top: 0, left: 20, right: 0, backgroundColor: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 12 }}>HIGHWAY NH-44 WIDENING</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>Project Progress</span>
                <span style={{ fontWeight: 900, color: '#f97316' }}>67%</span>
              </div>
              <div style={{ height: 8, backgroundColor: '#f1f5f9', borderRadius: 99, overflow: 'hidden', marginBottom: 20 }}>
                <div style={{ width: '67%', height: '100%', backgroundColor: '#f97316', borderRadius: 99 }} />
              </div>
              {[{ l: 'Workers Today', v: '24' }, { l: 'Materials Low', v: '2 alerts' }, { l: 'Days Remaining', v: '168' }].map(r => (
                <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>{r.l}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{r.v}</span>
                </div>
              ))}
            </div>
            <div style={{ position: 'absolute', bottom: -20, left: 0, right: 20, backgroundColor: '#fff8f3', borderRadius: 16, padding: '16px 20px', boxShadow: '0 8px 24px rgba(249,115,22,0.15)', border: '1px solid #fed7aa', marginTop: 16, zIndex: -1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f97316' }}>⚠ LOW STOCK ALERT</div>
              <div style={{ fontSize: 13, color: '#7c3aed', marginTop: 4 }}>TMT Steel Bars — 12 Tonnes remaining</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ backgroundColor: '#0f172a', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#f97316', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Everything You Need</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#fff', letterSpacing: -1 }}>Built for how construction actually works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                backgroundColor: '#1e293b', borderRadius: 16, padding: 28,
                border: '1px solid #334155', transition: 'border-color 0.2s',
              }}
                onMouseOver={e => e.currentTarget.style.borderColor = '#f97316'}
                onMouseOut={e => e.currentTarget.style.borderColor = '#334155'}
              >
                <div style={{ width: 52, height: 52, backgroundColor: 'rgba(249,115,22,0.12)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316', marginBottom: 16 }}>
                  {f.icon}
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9', marginBottom: 10 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding: '96px 24px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#f97316', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Simple Process</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: -1 }}>Up and running in minutes</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {STEPS.map((step, i) => (
            <div key={step.n} style={{ display: 'flex', gap: 32, alignItems: 'flex-start', paddingBottom: i < STEPS.length - 1 ? 48 : 0, position: 'relative' }}>
              {i < STEPS.length - 1 && (
                <div style={{ position: 'absolute', left: 27, top: 56, bottom: 0, width: 2, backgroundColor: '#e2e8f0' }} />
              )}
              <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: '#fff7ed', border: '2px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 900, color: '#f97316' }}>{step.n}</span>
              </div>
              <div style={{ paddingTop: 12 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>{step.title}</div>
                <div style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trust ── */}
      <section style={{ backgroundColor: '#fff7ed', padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          {[
            { icon: <Shield size={28} />, title: 'Enterprise Security', desc: 'SOC2-aligned. Your data is encrypted at rest and in transit.' },
            { icon: <Globe size={28} />,  title: 'Works Offline',       desc: 'Reports and forms work on-site even without internet.' },
            { icon: <Zap size={28} />,   title: 'Instant Setup',        desc: 'No training needed. Your team is live in under an hour.' },
          ].map(t => (
            <div key={t.title} style={{ flex: '1 1 220px', maxWidth: 260 }}>
              <div style={{ color: '#f97316', display: 'flex', justifyContent: 'center', marginBottom: 14 }}>{t.icon}</div>
              <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>{t.title}</div>
              <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        background: 'linear-gradient(135deg, #f97316, #ea580c)',
        padding: '96px 24px', textAlign: 'center',
      }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: '#fff', letterSpacing: -1, marginBottom: 16 }}>
          Ready to take control of your sites?
        </h2>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', marginBottom: 40, maxWidth: 480, margin: '0 auto 40px' }}>
          Join 50+ construction companies already managing smarter with SitePilot.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 36px', borderRadius: 12, background: '#fff', color: '#f97316', fontWeight: 800, fontSize: 16, border: 'none', cursor: 'pointer', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
            Get Started Free <ArrowRight size={18} />
          </button>
          <button onClick={() => navigate('/')}
            style={{ padding: '16px 36px', borderRadius: 12, background: 'transparent', color: '#fff', fontWeight: 700, fontSize: 16, border: '2px solid rgba(255,255,255,0.5)', cursor: 'pointer' }}>
            🚀 Try Demo Login
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ backgroundColor: '#0f172a', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, backgroundColor: '#f97316', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HardHat size={14} color="white" />
          </div>
          <span style={{ fontWeight: 900, fontSize: 16, color: '#fff' }}>sitePilot</span>
        </div>
        <p style={{ fontSize: 12, color: '#475569' }}>© 2026 SitePilot Technologies, Inc. · <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy</a> · <a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Terms</a></p>
      </footer>

    </div>
  )
}