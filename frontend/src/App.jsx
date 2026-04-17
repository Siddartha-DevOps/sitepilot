import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Login from "./pages/Login"
import WhatIsSitePilot from "./pages/whatissitepilot"
import Dashboard from "./pages/Dashboard"
import Projects from "./pages/Projects"
import Tasks from "./pages/Tasks"
import Photos from "./pages/Photos"
import Notifications from "./pages/Notifications"
import Profile from "./pages/Profile"
import AIAssistant from "./pages/AIAssistant"
import Inventory from "./pages/Inventory"
import Chat from "./pages/Chat"
import DailyReport from "./pages/DailyReport"
import MaterialEntry from "./pages/MaterialEntry"
import ProjectDetail from "./pages/ProjectDetail"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/what-is-sitepilot" element={<WhatIsSitePilot />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/photos" element={<Photos />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/daily-report" element={<DailyReport />} />
        <Route path="/material-entry" element={<MaterialEntry />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}