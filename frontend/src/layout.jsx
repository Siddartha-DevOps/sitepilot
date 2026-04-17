import { Link, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial" }}>
      
      {/* Sidebar */}
      <div
        style={{
          width: "220px",
          background: "#1f2937",
          color: "white",
          padding: "20px",
        }}
      >
        <h2>SitePilot</h2>

        <nav style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <Link to="/dashboard" style={{ color: "white", textDecoration: "none" }}>Dashboard</Link>
          <Link to="/projects" style={{ color: "white", textDecoration: "none" }}>Projects</Link>
          <Link to="/reports" style={{ color: "white", textDecoration: "none" }}>Reports</Link>
          <Link to="/settings" style={{ color: "white", textDecoration: "none" }}>Settings</Link>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, background: "#f3f4f6", padding: "20px" }}>
        <Outlet />
      </div>
      
    </div>
  );
}