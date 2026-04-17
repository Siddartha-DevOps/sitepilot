import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"

import Login from "./pages/Login"
import WhatIsSitePilot from "./pages/WhatIsSitePilot"

import Dashboard from "./pages/Dashboard"
import Projects from "./pages/Projects"
import Tasks from "./pages/Tasks"
import Photos from "./pages/Photos"
import Notifications from "./pages/Notifications"
import Profile from "./pages/Profile"

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        <Routes>

          <Route path="/login" element={<Login />} />
          <Route path="/what-is-sitepilot" element={<WhatIsSitePilot />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/photos" element={<Photos />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="*" element={<Navigate to="/dashboard" />} />

        </Routes>

      </BrowserRouter>
    </AuthProvider>
  )
}