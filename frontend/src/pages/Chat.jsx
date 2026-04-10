import React, { useState, useRef, useEffect } from 'react'
import {
  Paperclip, Smile, Send, Pencil, Copy, Trash2,
  Check, X, Hash, Circle, MessageCircle, Search,
  Users, ChevronDown
} from 'lucide-react'

// ── Sample Data ───────────────────────────────────────────────────────────────
const CHANNELS = [
  { id: 'c1', name: 'highway-nh44',     unread: 3, online: true  },
  { id: 'c2', name: 'commercial-a',     unread: 0, online: true  },
  { id: 'c3', name: 'residential-p2',   unread: 1, online: false },
  { id: 'c4', name: 'water-treatment',  unread: 0, online: false },
]

const DMS = [
  { id: 'd1', name: 'Ravi Kumar',  initials: 'RK', status: 'online', color: '#fff7ed', text: '#c2410c' },
  { id: 'd2', name: 'Suresh M',   initials: 'SM', status: 'away',   color: '#f0fdf4', text: '#15803d' },
  { id: 'd3', name: 'Priya S',    initials: 'PS', status: 'offline',color: '#eff6ff', text: '#1d4ed8' },
]

const INITIAL_MESSAGES = [
  { id: 'm1', sender: 'Ravi Kumar',  initials: 'RK', avatarBg: '#fff7ed', avatarText: '#c2410c', time: '9:14 AM', text: 'Foundation inspection at Grid B3 done. All columns clear. Pouring can start tomorrow morning 👍', reactions: [{ emoji: '👍', count: 3, mine: true }, { emoji: '✅', count: 2, mine: false }], photos: [], deleted: false, edited: false, mine: false },
  { id: 'm2', sender: 'Suresh M',    initials: 'SM', avatarBg: '#f0fdf4', avatarText: '#15803d', time: '9:31 AM', text: 'Photos from this morning\'s site walk:', reactions: [{ emoji: '👀', count: 2, mine: false }], photos: ['Foundation B3 · Grid view', 'Column reinforcement · Level 1', 'Formwork · North side'], deleted: false, edited: false, mine: false },
  { id: 'm3', sender: 'Priya S',     initials: 'PS', avatarBg: '#eff6ff', avatarText: '#1d4ed8', time: '10:02 AM', text: 'TMT steel delivery confirmed for 3 PM today. Please make sure entry gate is open and someone is there to sign the invoice.', reactions: [{ emoji: '👍', count: 1, mine: false }], photos: [], deleted: false, edited: false, mine: false },
  { id: 'm4', sender: 'You',         initials: 'Me', avatarBg: '#faf5ff', avatarText: '#7e22ce', time: '10:18 AM', text: 'Ravi will be at the gate at 2:45. Also flagging — scaffolding on the north side needs fixing before pouring. I\'ve added it as a task.', reactions: [], photos: [], deleted: false, edited: false, mine: true },
]

const EMOJIS = ['👍','✅','👀','🔥','⚠️','💪','👏','❓','🚧','📋']

const PHOTO_COLORS = [
  { bg: '#e2e8f0', label: 'Site photo' },
  { bg: '#dbeafe', label: 'Site photo' },
  { bg: '#dcfce7', label: 'Site photo' },
  { bg: '#fef9c3', label: 'Site photo' },
]

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ initials, bg, color, size = 34 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      backgroundColor: bg, color: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size < 30 ? 10 : 12, fontWeight: 600, flexShrink: 0,
    }}>{initials}</div>
  )
}

// ── Message Component ─────────────────────────────────────────────────────────
function Message({ msg, onEdit, onDelete, onCopy, onReact }) {
  const [showEmojis, setShowEmojis] = useState(false)
  const [editing, setEditing]       = useState(false)
  const [editText, setEditText]     = useState(msg.text)
  const [copied, setCopied]         = useState(false)
  const editRef = useRef(null)

  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus()
      editRef.current.select()
    }
  }, [editing])

  function handleSaveEdit() {
    if (editText.trim()) {
      onEdit(msg.id, editText.trim())
      setEditing(false)
    }
  }

  function handleCopy() {
    navigator.clipboard?.writeText(msg.text).catch(() => {})
    setCopied(true)
    onCopy(msg.id)
    setTimeout(() => setCopied(false), 1500)
  }

  if (msg.deleted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', opacity: 0.5 }}>
        <Avatar initials={msg.initials} bg={msg.avatarBg} color={msg.avatarText} />
        <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
          This message was deleted.
        </span>
      </div>
    )
  }

  return (
    <div className="msg-wrap" style={{ position: 'relative', padding: '4px 8px', borderRadius: 10, marginBottom: 2 }}>
      <style>{`.msg-wrap:hover { background: var(--color-background-secondary); } .msg-wrap:hover .msg-action-bar { opacity: 1; }`}</style>

      {/* Action bar — appears on hover, top-right */}
      <div className="msg-action-bar" style={{
        position: 'absolute', top: 4, right: 8,
        opacity: 0, transition: 'opacity 0.15s',
        display: 'flex', alignItems: 'center', gap: 2,
        backgroundColor: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-secondary)',
        borderRadius: 8, padding: '3px 5px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        zIndex: 10,
      }}>
        {/* Emoji react */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowEmojis(v => !v)}
            title="React"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 5px', borderRadius: 6, fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1 }}
          >😊</button>
          {showEmojis && (
            <div style={{
              position: 'absolute', bottom: 32, right: 0,
              backgroundColor: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-secondary)',
              borderRadius: 10, padding: 8, display: 'flex', gap: 4, flexWrap: 'wrap',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 20, width: 200,
            }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => { onReact(msg.id, e); setShowEmojis(false) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 4, borderRadius: 6, lineHeight: 1 }}
                  onMouseOver={ex => ex.currentTarget.style.backgroundColor = 'var(--color-background-secondary)'}
                  onMouseOut={ex => ex.currentTarget.style.backgroundColor = 'transparent'}
                >{e}</button>
              ))}
            </div>
          )}
        </div>

        {/* Copy */}
        <button onClick={handleCopy} title="Copy"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 5px', borderRadius: 6, color: copied ? '#22c55e' : 'var(--color-text-secondary)', display: 'flex', alignItems: 'center' }}>
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>

        {/* Edit — only for own messages */}
        {msg.mine && !editing && (
          <button onClick={() => setEditing(true)} title="Edit"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 5px', borderRadius: 6, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center' }}>
            <Pencil size={13} />
          </button>
        )}

        {/* Delete */}
        <button onClick={() => onDelete(msg.id)} title="Delete"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 5px', borderRadius: 6, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center' }}
          onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Message row */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Avatar initials={msg.initials} bg={msg.avatarBg} color={msg.avatarText} />
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name + time */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: msg.mine ? '#7e22ce' : 'var(--color-text-primary)' }}>{msg.sender}</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{msg.time}</span>
            {msg.edited && <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>(edited)</span>}
          </div>

          {/* Text or edit input */}
          {editing ? (
            <div>
              <textarea
                ref={editRef}
                value={editText}
                onChange={e => setEditText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit() }
                  if (e.key === 'Escape') { setEditing(false); setEditText(msg.text) }
                }}
                rows={2}
                style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #f97316', borderRadius: 8, fontSize: 13, color: 'var(--color-text-primary)', backgroundColor: 'var(--color-background-primary)', resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
                <button onClick={handleSaveEdit}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', background: '#f97316', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  <Check size={12} /> Save
                </button>
                <button onClick={() => { setEditing(false); setEditText(msg.text) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', background: 'none', border: '0.5px solid var(--color-border-secondary)', borderRadius: 6, fontSize: 12, color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                  <X size={12} /> Cancel
                </button>
                <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', alignSelf: 'center' }}>Enter to save · Esc to cancel</span>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.6 }}>{msg.text}</div>
          )}

          {/* Photo thumbnails */}
          {msg.photos.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {msg.photos.map((label, i) => (
                <div key={i} style={{
                  width: 110, height: 74, borderRadius: 8, overflow: 'hidden',
                  backgroundColor: PHOTO_COLORS[i % PHOTO_COLORS.length].bg,
                  border: '0.5px solid var(--color-border-tertiary)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: 10, color: 'var(--color-text-tertiary)', gap: 4,
                }}>
                  <span style={{ fontSize: 18 }}>📸</span>
                  <span style={{ textAlign: 'center', padding: '0 6px', lineHeight: 1.3 }}>{label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Reactions */}
          {msg.reactions.length > 0 && (
            <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
              {msg.reactions.map((r, i) => (
                <button key={i} onClick={() => onReact(msg.id, r.emoji)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '2px 8px', borderRadius: 99,
                    border: r.mine ? '1px solid #f97316' : '0.5px solid var(--color-border-secondary)',
                    backgroundColor: r.mine ? '#fff7ed' : 'var(--color-background-secondary)',
                    cursor: 'pointer', fontSize: 13,
                  }}>
                  {r.emoji}
                  <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{r.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Chat Component ───────────────────────────────────────────────────────
export default function Chat() {
  const [activeChannel, setActiveChannel] = useState('c1')
  const [messages, setMessages]           = useState(INITIAL_MESSAGES)
  const [input, setInput]                 = useState('')
  const [showEmoji, setShowEmoji]         = useState(false)
  const [typingUser, setTypingUser]       = useState('')
  const messagesEndRef = useRef(null)
  const fileInputRef   = useRef(null)
  const inputRef       = useRef(null)
  const typingTimer    = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function sendMessage() {
    const text = input.trim()
    if (!text) return
    const now = new Date()
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    setMessages(m => [...m, {
      id: 'm' + Date.now(),
      sender: 'You', initials: 'Me',
      avatarBg: '#faf5ff', avatarText: '#7e22ce',
      time, text, reactions: [], photos: [],
      deleted: false, edited: false, mine: true,
    }])
    setInput('')
    setTypingUser('')
    clearTimeout(typingTimer.current)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function handleInput(e) {
    setInput(e.target.value)
    clearTimeout(typingTimer.current)
    setTypingUser('Suresh M is typing...')
    typingTimer.current = setTimeout(() => setTypingUser(''), 2000)
  }

  function handleEdit(id, newText) {
    setMessages(m => m.map(msg => msg.id === id ? { ...msg, text: newText, edited: true } : msg))
  }

  function handleDelete(id) {
    setMessages(m => m.map(msg => msg.id === id ? { ...msg, deleted: true } : msg))
  }

  function handleCopy() {}

  function handleReact(id, emoji) {
    setMessages(m => m.map(msg => {
      if (msg.id !== id) return msg
      const existing = msg.reactions.find(r => r.emoji === emoji)
      if (existing) {
        return {
          ...msg,
          reactions: existing.mine
            ? msg.reactions.map(r => r.emoji === emoji ? { ...r, count: r.count - 1, mine: false } : r).filter(r => r.count > 0)
            : msg.reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, mine: true } : r)
        }
      }
      return { ...msg, reactions: [...msg.reactions, { emoji, count: 1, mine: true }] }
    }))
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    const now = new Date()
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    const labels = files.map(f => f.name)
    setMessages(m => [...m, {
      id: 'm' + Date.now(),
      sender: 'You', initials: 'Me',
      avatarBg: '#faf5ff', avatarText: '#7e22ce',
      time, text: `Attached ${files.length} photo${files.length > 1 ? 's' : ''}`,
      reactions: [], photos: labels,
      deleted: false, edited: false, mine: true,
    }])
    e.target.value = ''
  }

  const activeInfo = CHANNELS.find(c => c.id === activeChannel)

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>

      {/* Page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexShrink: 0 }}>
        <div style={{ width: 38, height: 38, backgroundColor: '#fff7ed', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MessageCircle size={20} color="#f97316" />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text-primary)', margin: 0, letterSpacing: -0.5 }}>Team Chat</h1>
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: 0 }}>Discuss projects — no WhatsApp, no email chains</p>
        </div>
      </div>

      {/* Chat shell */}
      <div style={{ flex: 1, display: 'flex', borderRadius: 16, overflow: 'hidden', border: '0.5px solid var(--color-border-tertiary)', backgroundColor: 'var(--color-background-primary)', minHeight: 0 }}>

        {/* ── Sidebar ── */}
        <div style={{ width: 210, flexShrink: 0, borderRight: '0.5px solid var(--color-border-tertiary)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-background-secondary)' }}>
          {/* Search */}
          <div style={{ padding: '12px 12px 8px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} color="var(--color-text-tertiary)" style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)' }} />
              <input placeholder="Search..." style={{ width: '100%', padding: '6px 8px 6px 28px', border: '0.5px solid var(--color-border-secondary)', borderRadius: 8, fontSize: 12, backgroundColor: 'var(--color-background-primary)', color: 'var(--color-text-primary)', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          {/* Channels */}
          <div style={{ padding: '4px 8px' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', padding: '4px 8px 6px', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Projects</div>
            {CHANNELS.map(ch => (
              <div key={ch.id} onClick={() => setActiveChannel(ch.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7, padding: '7px 8px',
                  borderRadius: 8, cursor: 'pointer', fontSize: 13,
                  color: activeChannel === ch.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  backgroundColor: activeChannel === ch.id ? 'var(--color-background-primary)' : 'transparent',
                  fontWeight: activeChannel === ch.id ? 600 : 400,
                  marginBottom: 1,
                }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, backgroundColor: ch.online ? '#22c55e' : 'var(--color-border-secondary)' }} />
                <Hash size={13} style={{ flexShrink: 0, opacity: 0.5 }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ch.name}</span>
                {ch.unread > 0 && (
                  <span style={{ backgroundColor: '#f97316', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99 }}>{ch.unread}</span>
                )}
              </div>
            ))}
          </div>

          {/* DMs */}
          <div style={{ padding: '4px 8px', marginTop: 4 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', padding: '4px 8px 6px', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Direct</div>
            {DMS.map(dm => (
              <div key={dm.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, cursor: 'pointer', marginBottom: 1 }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--color-background-primary)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <Avatar initials={dm.initials} bg={dm.color} color={dm.text} size={26} />
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', flex: 1 }}>{dm.name}</span>
                <div style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, backgroundColor: dm.status === 'online' ? '#22c55e' : dm.status === 'away' ? '#eab308' : 'var(--color-border-secondary)' }} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Main chat area ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Channel header */}
          <div style={{ padding: '12px 16px', borderBottom: '0.5px solid var(--color-border-tertiary)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <Hash size={16} color="var(--color-text-tertiary)" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>{activeInfo?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>4 members · Project channel</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={14} color="var(--color-text-tertiary)" />
              <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', border: '0.5px solid var(--color-border-tertiary)', padding: '3px 10px', borderRadius: 99 }}>4 members</span>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
            {/* Date divider */}
            <div style={{ textAlign: 'center', margin: '8px 0 14px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '0.5px', backgroundColor: 'var(--color-border-tertiary)' }} />
              <span style={{ position: 'relative', backgroundColor: 'var(--color-background-primary)', padding: '0 12px', fontSize: 11, color: 'var(--color-text-tertiary)' }}>Today, Jan 14</span>
            </div>

            {messages.map(msg => (
              <Message
                key={msg.id}
                msg={msg}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCopy={handleCopy}
                onReact={handleReact}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing indicator */}
          <div style={{ padding: '2px 16px', minHeight: 20, flexShrink: 0 }}>
            {typingUser && (
              <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>{typingUser}</span>
            )}
          </div>

          {/* ── Input bar ── */}
          <div style={{ padding: '10px 14px 14px', flexShrink: 0, borderTop: '0.5px solid var(--color-border-tertiary)' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              border: '0.5px solid var(--color-border-secondary)',
              borderRadius: 12, padding: '6px 8px',
              backgroundColor: 'var(--color-background-secondary)',
            }}>

              {/* LEFT: Attach / paperclip */}
              <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileChange} />
              <button onClick={() => fileInputRef.current?.click()} title="Attach photos or files"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px 6px', borderRadius: 8, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                onMouseOver={e => e.currentTarget.style.color = '#f97316'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
              >
                <Paperclip size={18} />
              </button>

              {/* Text input */}
              <input
                ref={inputRef}
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={`Message #${activeInfo?.name}...`}
                style={{
                  flex: 1, border: 'none', background: 'transparent',
                  fontSize: 13, color: 'var(--color-text-primary)', outline: 'none',
                  padding: '4px 0',
                }}
              />

              {/* RIGHT: Emoji picker */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <button onClick={() => setShowEmoji(v => !v)} title="Emoji"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px 6px', borderRadius: 8, fontSize: 16, display: 'flex', alignItems: 'center', lineHeight: 1 }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--color-background-primary)'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >😊</button>

                {showEmoji && (
                  <div style={{
                    position: 'absolute', bottom: 40, right: 0,
                    backgroundColor: 'var(--color-background-primary)',
                    border: '0.5px solid var(--color-border-secondary)',
                    borderRadius: 12, padding: 10,
                    display: 'flex', gap: 4, flexWrap: 'wrap',
                    width: 220, boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    zIndex: 50,
                  }}>
                    {EMOJIS.map(e => (
                      <button key={e} onClick={() => { setInput(v => v + e); setShowEmoji(false); inputRef.current?.focus() }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, padding: 5, borderRadius: 6, lineHeight: 1 }}
                        onMouseOver={ex => ex.currentTarget.style.backgroundColor = 'var(--color-background-secondary)'}
                        onMouseOut={ex => ex.currentTarget.style.backgroundColor = 'transparent'}
                      >{e}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Send button */}
              <button onClick={sendMessage} title="Send (Enter)"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 34, height: 34, borderRadius: 9,
                  backgroundColor: input.trim() ? '#f97316' : 'var(--color-border-secondary)',
                  border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                  transition: 'background 0.15s', flexShrink: 0,
                }}
              >
                <Send size={15} color={input.trim() ? '#fff' : 'var(--color-text-tertiary)'} />
              </button>
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 5, paddingLeft: 4 }}>
              Press <kbd style={{ fontSize: 10, padding: '1px 5px', border: '0.5px solid var(--color-border-secondary)', borderRadius: 4, backgroundColor: 'var(--color-background-secondary)' }}>Enter</kbd> to send &nbsp;·&nbsp; <kbd style={{ fontSize: 10, padding: '1px 5px', border: '0.5px solid var(--color-border-secondary)', borderRadius: 4, backgroundColor: 'var(--color-background-secondary)' }}>Shift+Enter</kbd> for new line
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}