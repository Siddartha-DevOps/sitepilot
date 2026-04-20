import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const links = [
  { to: "/dashboard",      label: "🏠 Dashboard" },
  { to: "/projects",       label: "📁 Projects" },
  { to: "/tasks",          label: "✅ Tasks" },
  { to: "/photos",         label: "📷 Photos" },
  { to: "/inventory",      label: "📦 Inventory" },
  { to: "/daily-report",   label: "📝 Daily Report" },
  { to: "/material-entry", label: "🧱 Materials" },
  { to: "/chat",           label: "💬 Chat" },
  { to: "/notifications",  label: "🔔 Notifications" },
  { to: "/profile",        label: "👤 Profile" },
  { to: "/directory", label: "📋 Directory" }
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial" }}>

      {/* Sidebar */}
      <div style={{ width: "220px", background: "#1f2937", color: "white", padding: "20px", display: "flex", flexDirection: "column" }}>
        <h2 style={{ margin: "0 0 24px 0", color: "#f97316" }}>sitePilot</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
          {links.map(({ to, label }) => (
            <Link key={to} to={to} style={{
              color: location.pathname === to ? "#f97316" : "white",
              textDecoration: "none",
              padding: "8px 12px",
              borderRadius: "8px",
              background: location.pathname === to ? "rgba(249,115,22,0.15)" : "transparent",
              fontSize: "14px"
            }}>{label}</Link>
          ))}
        </nav>

        <div style={{ borderTop: "1px solid #374151", paddingTop: "16px" }}>
          <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "8px" }}>{user?.name || "User"}</p>
          <button onClick={handleLogout} style={{ background: "#dc2626", color: "white", border: "none", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", width: "100%", fontSize: "13px" }}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, background: "#f3f4f6", padding: "20px", overflowY: "auto" }}>
        {children}
      </div>

    </div>
  )
}