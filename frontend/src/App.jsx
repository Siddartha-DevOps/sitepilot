import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import Layout from "./components/Layout"


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
import Directory from "./pages/Directory"

function PrivateLayout({ children }) {
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/what-is-sitepilot" element={<WhatIsSitePilot />} />
          <Route path="/dashboard"      element={<PrivateLayout><Dashboard /></PrivateLayout>} />
          <Route path="/projects"       element={<PrivateLayout><Projects /></PrivateLayout>} />
          <Route path="/projects/:id"   element={<PrivateLayout><ProjectDetail /></PrivateLayout>} />
          <Route path="/tasks"          element={<PrivateLayout><Tasks /></PrivateLayout>} />
          <Route path="/photos"         element={<PrivateLayout><Photos /></PrivateLayout>} />
          <Route path="/notifications"  element={<PrivateLayout><Notifications /></PrivateLayout>} />
          <Route path="/profile"        element={<PrivateLayout><Profile /></PrivateLayout>} />
          <Route path="/ai-assistant"   element={<PrivateLayout><AIAssistant /></PrivateLayout>} />
          <Route path="/inventory"      element={<PrivateLayout><Inventory /></PrivateLayout>} />
          <Route path="/chat"           element={<PrivateLayout><Chat /></PrivateLayout>} />
          <Route path="/daily-report"   element={<PrivateLayout><DailyReport /></PrivateLayout>} />
          <Route path="/material-entry" element={<PrivateLayout><MaterialEntry /></PrivateLayout>} />
          <Route path="/directory" element={<PrivateLayout><Directory /></PrivateLayout>} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}