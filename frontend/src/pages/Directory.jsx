import { useState, useMemo } from "react"
import {
  Search, Plus, Download, Filter, Mail, Phone, Building2,
  Users, User, Shield, ChevronDown, X, Check, Edit2, Trash2,
  Bell, MoreVertical, Upload, Grid3X3, List
} from "lucide-react"

// ── Sample Data ──────────────────────────────────────────────────────────────
const ROLES = ["Admin", "Site Engineer", "Supervisor", "Architect", "Subcontractor", "Vendor", "Labour"]
const TOOLS = ["Dashboard", "Projects", "Tasks", "Photos", "Inventory", "Daily Report", "Materials", "RFIs", "Directory"]
const PERMISSION_LEVELS = ["None", "Read Only", "Standard", "Admin"]

const SAMPLE_CONTACTS = [
  { id: 1, name: "Ravi Kumar",       email: "ravi@sitepilot.com",      phone: "+91 98765 43210", company: "Kumar Constructions",   role: "Admin",          type: "individual", notifications: { rfi: true,  submittal: true,  schedule: true  }, permissions: { Dashboard: "Admin",     Projects: "Admin",     Tasks: "Admin",     Photos: "Admin",     Inventory: "Admin",     "Daily Report": "Admin",     Materials: "Admin",     RFIs: "Admin",     Directory: "Admin"     }, avatar: "RK", color: "#f97316" },
  { id: 2, name: "Priya Sharma",     email: "priya@archindia.com",     phone: "+91 87654 32109", company: "Arch India",            role: "Architect",      type: "individual", notifications: { rfi: true,  submittal: false, schedule: false }, permissions: { Dashboard: "Standard",  Projects: "Read Only", Tasks: "Read Only", Photos: "Standard",  Inventory: "None",      "Daily Report": "None",      Materials: "None",      RFIs: "Admin",     Directory: "Read Only" }, avatar: "PS", color: "#8b5cf6" },
  { id: 3, name: "Suresh Reddy",     email: "suresh@buildtech.com",    phone: "+91 76543 21098", company: "BuildTech Pvt Ltd",     role: "Supervisor",     type: "individual", notifications: { rfi: false, submittal: true,  schedule: true  }, permissions: { Dashboard: "Standard",  Projects: "Standard",  Tasks: "Admin",     Photos: "Admin",     Inventory: "Standard",  "Daily Report": "Admin",     Materials: "Standard",  RFIs: "Standard",  Directory: "Read Only" }, avatar: "SR", color: "#10b981" },
  { id: 4, name: "Meena Iyer",       email: "meena@iyer.co.in",        phone: "+91 65432 10987", company: "Iyer & Associates",     role: "Site Engineer",  type: "individual", notifications: { rfi: true,  submittal: true,  schedule: false }, permissions: { Dashboard: "Standard",  Projects: "Standard",  Tasks: "Standard",  Photos: "Standard",  Inventory: "Read Only", "Daily Report": "Standard",  Materials: "Read Only", RFIs: "Standard",  Directory: "None"      }, avatar: "MI", color: "#3b82f6" },
  { id: 5, name: "Arjun Patel",      email: "arjun@steelmax.com",      phone: "+91 54321 09876", company: "SteelMax Vendors",      role: "Vendor",         type: "individual", notifications: { rfi: false, submittal: false, schedule: true  }, permissions: { Dashboard: "Read Only", Projects: "Read Only", Tasks: "None",      Photos: "Read Only", Inventory: "Admin",     "Daily Report": "None",      Materials: "Admin",     RFIs: "None",      Directory: "None"      }, avatar: "AP", color: "#ef4444" },
  { id: 6, name: "Kavya Singh",      email: "kavya@civilpro.com",      phone: "+91 43210 98765", company: "CivilPro Engineers",    role: "Subcontractor",  type: "individual", notifications: { rfi: true,  submittal: false, schedule: false }, permissions: { Dashboard: "Read Only", Projects: "Read Only", Tasks: "Standard",  Photos: "Standard",  Inventory: "None",      "Daily Report": "Standard",  Materials: "None",      RFIs: "Read Only", Directory: "None"      }, avatar: "KS", color: "#f59e0b" },
  { id: 7, name: "BuildTech Pvt Ltd",email: "info@buildtech.com",      phone: "+91 40 2345 6789", company: "BuildTech Pvt Ltd",   role: "Subcontractor",  type: "company",    notifications: { rfi: true,  submittal: true,  schedule: true  }, permissions: { Dashboard: "Read Only", Projects: "Standard",  Tasks: "Standard",  Photos: "Standard",  Inventory: "Read Only", "Daily Report": "Read Only", Materials: "Read Only", RFIs: "Standard",  Directory: "None"      }, avatar: "BT", color: "#6366f1" },
  { id: 8, name: "SteelMax Vendors", email: "contact@steelmax.com",    phone: "+91 40 3456 7890", company: "SteelMax Vendors",    role: "Vendor",         type: "company",    notifications: { rfi: false, submittal: false, schedule: false }, permissions: { Dashboard: "None",      Projects: "None",      Tasks: "None",      Photos: "None",      Inventory: "Admin",     "Daily Report": "None",      Materials: "Admin",     RFIs: "None",      Directory: "None"      }, avatar: "SM", color: "#ec4899" },
]

const PERM_COLORS = { "None": "#e5e7eb", "Read Only": "#bfdbfe", "Standard": "#bbf7d0", "Admin": "#fed7aa" }
const PERM_TEXT   = { "None": "#6b7280", "Read Only": "#1d4ed8", "Standard": "#15803d", "Admin": "#c2410c" }

// ── Sub-components ────────────────────────────────────────────────────────────
function Avatar({ initials, color, size = 40 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color + "22", border: `2px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.32, fontWeight: 700, color, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

function PermBadge({ level }) {
  return (
    <span style={{ background: PERM_COLORS[level], color: PERM_TEXT[level], borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
      {level}
    </span>
  )
}

function NotifToggle({ active, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#374151" }}>
      <div onClick={onChange} style={{ width: 36, height: 20, borderRadius: 10, background: active ? "#f97316" : "#d1d5db", position: "relative", cursor: "pointer", transition: "background 0.2s" }}>
        <div style={{ position: "absolute", top: 2, left: active ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
      </div>
      {label}
    </label>
  )
}

// ── Add/Edit Modal ────────────────────────────────────────────────────────────
function ContactModal({ contact, onClose, onSave }) {
  const isEdit = !!contact
  const [form, setForm] = useState(contact || {
    name: "", email: "", phone: "", company: "", role: "Site Engineer", type: "individual",
    notifications: { rfi: false, submittal: false, schedule: false },
    permissions: Object.fromEntries(TOOLS.map(t => [t, "None"])),
    avatar: "", color: "#f97316"
  })

  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleSave() {
    if (!form.name || !form.email) return
    const initials = form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    onSave({ ...form, avatar: initials, id: contact?.id || Date.now() })
    onClose()
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 640, maxHeight: "90vh", overflow: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.2)" }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{isEdit ? "Edit Contact" : "Add New Contact"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={20} /></button>
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Type toggle */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 8 }}>Contact Type</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["individual", "company"].map(t => (
                <button key={t} onClick={() => sf("type", t)} style={{ padding: "8px 16px", borderRadius: 8, border: "2px solid", borderColor: form.type === t ? "#f97316" : "#e2e8f0", background: form.type === t ? "#fff7ed" : "white", color: form.type === t ? "#f97316" : "#64748b", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  {t === "individual" ? <User size={14} /> : <Building2 size={14} />}
                  {t === "individual" ? "Individual" : "Company"}
                </button>
              ))}
            </div>
          </div>

          {/* Basic info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[["name", "Full Name", "Ravi Kumar"], ["email", "Email", "ravi@example.com"], ["phone", "Phone", "+91 98765 43210"], ["company", "Company", "Kumar Constructions"]].map(([k, label, ph]) => (
              <div key={k}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>{label}</label>
                <input value={form[k] || ""} onChange={e => sf(k, e.target.value)} placeholder={ph}
                  style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, color: "#0f172a", outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Role</label>
              <select value={form.role} onChange={e => sf("role", e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, color: "#0f172a", outline: "none", background: "white" }}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>Avatar Color</label>
              <input type="color" value={form.color} onChange={e => sf("color", e.target.value)}
                style={{ width: "100%", height: 42, border: "1.5px solid #e2e8f0", borderRadius: 8, cursor: "pointer", padding: 4 }} />
            </div>
          </div>

          {/* Notifications */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 12 }}>
              <Bell size={12} style={{ display: "inline", marginRight: 4 }} />Notification Preferences
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, background: "#f8fafc", borderRadius: 10, padding: 16 }}>
              <NotifToggle active={form.notifications.rfi}      onChange={() => sf("notifications", { ...form.notifications, rfi: !form.notifications.rfi })}           label="RFI notifications" />
              <NotifToggle active={form.notifications.submittal} onChange={() => sf("notifications", { ...form.notifications, submittal: !form.notifications.submittal })} label="Submittal notifications" />
              <NotifToggle active={form.notifications.schedule}  onChange={() => sf("notifications", { ...form.notifications, schedule: !form.notifications.schedule })}   label="Schedule & weather updates" />
            </div>
          </div>

          {/* Tool permissions */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 12 }}>
              <Shield size={12} style={{ display: "inline", marginRight: 4 }} />Tool-Based Permissions
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {TOOLS.map(tool => (
                <div key={tool} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "#f8fafc", borderRadius: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{tool}</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {PERMISSION_LEVELS.map(lvl => (
                      <button key={lvl} onClick={() => sf("permissions", { ...form.permissions, [tool]: lvl })}
                        style={{ padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, background: form.permissions[tool] === lvl ? PERM_COLORS[lvl] : "#e2e8f0", color: form.permissions[tool] === lvl ? PERM_TEXT[lvl] : "#9ca3af", transition: "all 0.15s" }}>
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "white", color: "#64748b", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#f97316", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Check size={15} />{isEdit ? "Save Changes" : "Add Contact"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Contact Card (Grid view) ──────────────────────────────────────────────────
function ContactCard({ contact, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <div style={{ background: "white", borderRadius: 14, border: "1.5px solid #f1f5f9", padding: 20, display: "flex", flexDirection: "column", gap: 14, position: "relative", transition: "box-shadow 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
      onMouseOver={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"}
      onMouseOut={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar initials={contact.avatar} color={contact.color} size={44} />
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{contact.name}</p>
            <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{contact.role}</p>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <button onClick={() => setMenuOpen(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}><MoreVertical size={16} /></button>
          {menuOpen && (
            <div style={{ position: "absolute", right: 0, top: 28, background: "white", border: "1.5px solid #f1f5f9", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 10, minWidth: 140 }}>
              <button onClick={() => { onEdit(contact); setMenuOpen(false) }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#374151" }}><Edit2 size={13} />Edit</button>
              <button onClick={() => { onDelete(contact.id); setMenuOpen(false) }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#ef4444" }}><Trash2 size={13} />Delete</button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#64748b" }}><Mail size={12} color="#f97316" />{contact.email}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#64748b" }}><Phone size={12} color="#f97316" />{contact.phone}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#64748b" }}><Building2 size={12} color="#f97316" />{contact.company}</div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <span style={{ background: contact.type === "individual" ? "#eff6ff" : "#f0fdf4", color: contact.type === "individual" ? "#1d4ed8" : "#15803d", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 600 }}>
          {contact.type === "individual" ? "Individual" : "Company"}
        </span>
        <span style={{ background: "#fff7ed", color: "#c2410c", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 600 }}>{contact.role}</span>
      </div>

      <div style={{ borderTop: "1px solid #f8fafc", paddingTop: 12 }}>
        <p style={{ margin: "0 0 6px 0", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Notifications</p>
        <div style={{ display: "flex", gap: 6 }}>
          {[["RFI", contact.notifications.rfi], ["Submittal", contact.notifications.submittal], ["Schedule", contact.notifications.schedule]].map(([label, on]) => (
            <span key={label} style={{ background: on ? "#dcfce7" : "#f1f5f9", color: on ? "#15803d" : "#94a3b8", borderRadius: 6, padding: "2px 7px", fontSize: 10, fontWeight: 600 }}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Contact Row (List view) ───────────────────────────────────────────────────
function ContactRow({ contact, onEdit, onDelete, expanded, onToggle }) {
  return (
    <>
      <tr style={{ borderBottom: "1px solid #f8fafc", cursor: "pointer" }} onClick={onToggle}>
        <td style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar initials={contact.avatar} color={contact.color} size={34} />
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{contact.name}</p>
              <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{contact.company}</p>
            </div>
          </div>
        </td>
        <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151" }}>{contact.email}</td>
        <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151" }}>{contact.phone}</td>
        <td style={{ padding: "14px 16px" }}><span style={{ background: "#fff7ed", color: "#c2410c", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 600 }}>{contact.role}</span></td>
        <td style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", gap: 4 }}>
            {[["R", contact.notifications.rfi], ["S", contact.notifications.submittal], ["Sc", contact.notifications.schedule]].map(([l, on]) => (
              <span key={l} style={{ background: on ? "#dcfce7" : "#f1f5f9", color: on ? "#15803d" : "#94a3b8", borderRadius: 4, padding: "2px 6px", fontSize: 11, fontWeight: 700 }}>{l}</span>
            ))}
          </div>
        </td>
        <td style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={e => { e.stopPropagation(); onEdit(contact) }} style={{ background: "#f8fafc", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", color: "#64748b" }}><Edit2 size={13} /></button>
            <button onClick={e => { e.stopPropagation(); onDelete(contact.id) }} style={{ background: "#fff1f2", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", color: "#ef4444" }}><Trash2 size={13} /></button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr style={{ background: "#f8fafc" }}>
          <td colSpan={6} style={{ padding: "16px 20px" }}>
            <p style={{ margin: "0 0 10px 0", fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tool Permissions</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {TOOLS.map(tool => (
                <div key={tool} style={{ display: "flex", alignItems: "center", gap: 6, background: "white", borderRadius: 8, padding: "6px 10px", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{tool}:</span>
                  <PermBadge level={contact.permissions[tool]} />
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ── Main Directory Page ───────────────────────────────────────────────────────
export default function Directory() {
  const [contacts, setContacts]   = useState(SAMPLE_CONTACTS)
  const [search, setSearch]       = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [viewMode, setViewMode]   = useState("grid")
  const [modal, setModal]         = useState(null)   // null | "add" | contact object
  const [expandedRow, setExpandedRow] = useState(null)
  const [activeTab, setActiveTab] = useState("all")  // all | individual | company

  const filtered = useMemo(() => contacts.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                        c.email.toLowerCase().includes(search.toLowerCase()) ||
                        c.company.toLowerCase().includes(search.toLowerCase())
    const matchType = activeTab === "all" || c.type === activeTab
    const matchRole = roleFilter === "all" || c.role === roleFilter
    return matchSearch && matchType && matchRole
  }), [contacts, search, activeTab, roleFilter])

  function handleSave(contact) {
    setContacts(cs => contact.id && cs.find(c => c.id === contact.id)
      ? cs.map(c => c.id === contact.id ? contact : c)
      : [...cs, { ...contact, id: Date.now() }])
  }

  function handleDelete(id) {
    if (window.confirm("Delete this contact?")) setContacts(cs => cs.filter(c => c.id !== id))
  }

  function exportCSV() {
    const rows = [["Name", "Email", "Phone", "Company", "Role", "Type"], ...contacts.map(c => [c.name, c.email, c.phone, c.company, c.role, c.type])]
    const csv = rows.map(r => r.join(",")).join("\n")
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv])); a.download = "directory.csv"; a.click()
  }

  const stats = [
    { label: "Total Contacts", value: contacts.length,                          icon: Users,     color: "#f97316" },
    { label: "Individuals",    value: contacts.filter(c => c.type === "individual").length, icon: User,      color: "#3b82f6" },
    { label: "Companies",      value: contacts.filter(c => c.type === "company").length,    icon: Building2, color: "#10b981" },
    { label: "Admins",         value: contacts.filter(c => c.role === "Admin").length,      icon: Shield,    color: "#8b5cf6" },
  ]

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#0f172a" }}>Directory</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>Store and manage all project contacts and permissions</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={exportCSV} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "white", color: "#374151", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            <Download size={14} />Export CSV
          </button>
          <button onClick={() => setModal("add")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 10, border: "none", background: "#f97316", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            <Plus size={15} />Add Contact
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: "white", borderRadius: 14, border: "1.5px solid #f1f5f9", padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: color + "15", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a" }}>{value}</p>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters bar */}
      <div style={{ background: "white", borderRadius: 14, border: "1.5px solid #f1f5f9", padding: "14px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        {/* Tabs */}
        <div style={{ display: "flex", background: "#f8fafc", borderRadius: 8, padding: 3, gap: 2 }}>
          {[["all", "All"], ["individual", "Individuals"], ["company", "Companies"]].map(([val, label]) => (
            <button key={val} onClick={() => setActiveTab(val)} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: activeTab === val ? "white" : "transparent", color: activeTab === val ? "#f97316" : "#64748b", fontWeight: 600, fontSize: 13, cursor: "pointer", boxShadow: activeTab === val ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts..."
            style={{ width: "100%", padding: "8px 12px 8px 32px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#374151", outline: "none", boxSizing: "border-box" }} />
        </div>

        {/* Role filter */}
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          style={{ padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#374151", outline: "none", background: "white" }}>
          <option value="all">All Roles</option>
          {ROLES.map(r => <option key={r}>{r}</option>)}
        </select>

        {/* View toggle */}
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => setViewMode("grid")} style={{ padding: "7px 10px", borderRadius: 7, border: "1.5px solid", borderColor: viewMode === "grid" ? "#f97316" : "#e2e8f0", background: viewMode === "grid" ? "#fff7ed" : "white", color: viewMode === "grid" ? "#f97316" : "#94a3b8", cursor: "pointer" }}><Grid3X3 size={14} /></button>
          <button onClick={() => setViewMode("list")} style={{ padding: "7px 10px", borderRadius: 7, border: "1.5px solid", borderColor: viewMode === "list" ? "#f97316" : "#e2e8f0", background: viewMode === "list" ? "#fff7ed" : "white", color: viewMode === "list" ? "#f97316" : "#94a3b8", cursor: "pointer" }}><List size={14} /></button>
        </div>

        <span style={{ fontSize: 13, color: "#94a3b8", marginLeft: "auto" }}>{filtered.length} contact{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {filtered.map(c => <ContactCard key={c.id} contact={c} onEdit={setModal} onDelete={handleDelete} />)}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
              <Users size={40} style={{ margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
              <p style={{ margin: 0, fontWeight: 600 }}>No contacts found</p>
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div style={{ background: "white", borderRadius: 14, border: "1.5px solid #f1f5f9", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #f1f5f9" }}>
                {["Contact", "Email", "Phone", "Role", "Notifications", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <ContactRow key={c.id} contact={c} onEdit={setModal} onDelete={handleDelete}
                  expanded={expandedRow === c.id} onToggle={() => setExpandedRow(expandedRow === c.id ? null : c.id)} />
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>No contacts found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <ContactModal
          contact={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}