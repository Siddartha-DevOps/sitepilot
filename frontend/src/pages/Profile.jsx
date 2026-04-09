import React, { useState } from "react"
import { useAuth } from "../context/AuthContext"

const STATS = [
  { label: "Projects", value: 5 },
  { label: "Reports", value: 47 },
  { label: "Photos", value: 128 },
  { label: "Materials", value: 32 },
]

export default function Profile() {
  const { user, logout } = useAuth()
  const [notifEnabled, setNotifEnabled] = useState(true)
  const [offlineMode, setOfflineMode] = useState(false)

  const initials =
    (user?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)) || "U"

  function handleLogout() {
    if (window.confirm("Are you sure you want to logout from sitePilot?")) {
      logout()
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      {/* Avatar & User Info */}
      <div className="flex items-center gap-6 mb-6">
        <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-bold">
          {initials}
        </div>
        <div>
          <div className="font-semibold text-xl">{user?.name}</div>
          <div className="text-gray-500">{user?.role}</div>
          <div className="text-gray-400 text-sm">{user?.company}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="bg-white p-4 rounded-xl shadow flex flex-col items-center"
          >
            <div className="text-orange-500 font-bold text-xl">{s.value}</div>
            <div className="text-gray-400 text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Contact Info */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">Contact Information</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <div>Email: {user?.email || "Not provided"}</div>
          <div>Phone: {user?.phone || "Not provided"}</div>
          <div>Location: {user?.location || "Not provided"}</div>
        </div>
      </div>

      {/* App Settings */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">App Settings</h2>
        <div className="space-y-2 text-sm">
          <label className="flex items-center justify-between">
            <span>Push Notifications</span>
            <input
              type="checkbox"
              checked={notifEnabled}
              onChange={(e) => setNotifEnabled(e.target.checked)}
              className="w-5 h-5 accent-orange-500"
            />
          </label>

          <label className="flex items-center justify-between">
            <span>Offline Mode</span>
            <input
              type="checkbox"
              checked={offlineMode}
              onChange={(e) => setOfflineMode(e.target.checked)}
              className="w-5 h-5 accent-orange-500"
            />
          </label>

          <div className="flex justify-between">
            <span>Language</span>
            <span className="text-gray-500">English (India)</span>
          </div>

          <div className="flex justify-between">
            <span>Theme</span>
            <span className="text-gray-500">Light</span>
          </div>
        </div>
      </div>

      {/* More Options */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">More Options</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="hover:text-orange-500 cursor-pointer">Help & Support</li>
          <li className="hover:text-orange-500 cursor-pointer">Terms of Service</li>
          <li className="hover:text-orange-500 cursor-pointer">Privacy Policy</li>
          <li className="hover:text-orange-500 cursor-pointer">Rate App</li>
          <li className="hover:text-orange-500 cursor-pointer">Share sitePilot</li>
        </ul>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        Logout
      </button>

      {/* Footer */}
      <div className="text-center text-gray-400 text-xs mt-6">
        sitePilot v1.0.0 • Build 100 <br />
        Made with ❤️ for construction teams
      </div>
    </div>
  )
}