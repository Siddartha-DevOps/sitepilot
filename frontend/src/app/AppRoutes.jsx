import { Routes, Route, Navigate } from "react-router-dom"

import Dashboard from "../pages/dashboard/Dashboard"
import Projects from "../pages/projects/Projects"
import ProjectDetail from "../pages/projects/ProjectDetail"

import DailyReport from "../pages/reports/DailyReport"
import ReportsCenter from "../pages/reports/ReportsCenter"

import SiteTimeline from "../pages/events/SiteTimeline"
import AddSiteEvent from "../pages/events/AddSiteEvent"

import RMCPour from "../pages/rmc/RMCPour"

import Inventory from "../pages/inventory/Inventory"
import MaterialEntry from "../pages/materials/MaterialEntry"

import Photos from "../pages/photos/Photos"
import Tasks from "../pages/tasks/Tasks"
import Chat from "../pages/chat/Chat"

export default function AppRoutes() {
  return (
    <Routes>

      <Route path="dashboard" element={<Dashboard />} />

      <Route path="projects" element={<Projects />} />
      <Route path="projects/:id" element={<ProjectDetail />} />

      <Route path="events" element={<SiteTimeline />} />
      <Route path="events/add" element={<AddSiteEvent />} />

      <Route path="rmc" element={<RMCPour />} />

      <Route path="reports" element={<ReportsCenter />} />
      <Route path="reports/new" element={<DailyReport />} />

      <Route path="materials/new" element={<MaterialEntry />} />
      <Route path="inventory" element={<Inventory />} />

      <Route path="photos" element={<Photos />} />
      <Route path="tasks" element={<Tasks />} />
      <Route path="chat" element={<Chat />} />

      <Route path="*" element={<Navigate to="dashboard" />} />

    </Routes>
  )
}