import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/apiClient'


const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const saved = localStorage.getItem('user')
    if (token && saved) {
      try { setUser(JSON.parse(saved)) } catch {}
    }
    setLoading(false)
  }, [])

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user',  JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  async function register(payload) {
    const { data } = await api.post('/auth/register', payload)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user',  JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  async function updateProfile(payload) {
    const { data } = await api.put('/auth/profile', payload)
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data)
    return data
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}