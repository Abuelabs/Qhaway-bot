import React, { useState } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')

  const handleLoginSuccess = (name) => {
    setUsername(name)
    setIsLoggedIn(true)
  }

<<<<<<< HEAD
  return isLoggedIn ? (
    <Dashboard adminName={username} />
=======
  const handleLogout = () => {
    setIsLoggedIn(false)
  }

  return isLoggedIn ? (
    <Dashboard adminName={username} onLogout={handleLogout} />
>>>>>>> d3b1d46 (Primer commit del proyecto Qhaway-bot)
  ) : (
    <Login onLoginSuccess={handleLoginSuccess} />
  )
}

export default App
