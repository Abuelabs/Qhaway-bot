import React, { useState } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'

function App() {
  const [authView, setAuthView] = useState('login') // 'login' | 'register'
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [elderProfiles, setElderProfiles] = useState(null)

  const handleLoginSuccess = (name) => {
    setUsername(name)
    setIsLoggedIn(true)
  }

  const handleRegisterSuccess = (adminData, elders) => {
    setUsername(adminData.fullName)
    setElderProfiles(elders)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setAuthView('login')
  }

  if (isLoggedIn) {
    return <Dashboard adminName={username} onLogout={handleLogout} elderProfiles={elderProfiles} />
  }

  return authView === 'login' ? (
    <Login onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setAuthView('register')} />
  ) : (
    <Register onRegisterSuccess={handleRegisterSuccess} onSwitchToLogin={() => setAuthView('login')} />
  )
}

export default App
