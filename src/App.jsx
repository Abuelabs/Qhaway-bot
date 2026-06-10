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

  return isLoggedIn ? (
    <Dashboard adminName={username} />
  ) : (
    <Login onLoginSuccess={handleLoginSuccess} />
  )
}

export default App
