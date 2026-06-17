import React, { useState, useEffect, useRef } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import { supabase } from './lib/supabaseClient'

function App() {
  const [authView, setAuthView] = useState('login') // 'login' | 'register'
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [elderProfiles, setElderProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Ref to track if we are currently performing the login unlocking animation
  // If true, we delay transitioning to the logged-in state so the animation plays fully.
  const isLoggingIn = useRef(false)

  useEffect(() => {
    // 1. Check for active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfileAndElders(session.user.id).then(() => {
          setIsLoggedIn(true)
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Fetch fresh profiles and elders
        await fetchProfileAndElders(session.user.id)
        
        // Only trigger login transition if we're NOT in the middle of the login unlock animation.
        // If we are, Login.jsx will call handleLoginSuccess manually once its animation finishes.
        if (!isLoggingIn.current) {
          setIsLoggedIn(true)
        }
      } else {
        setIsLoggedIn(false)
        setUsername('')
        setElderProfiles([])
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfileAndElders = async (userId) => {
    try {
      // Fetch caregiver profile name
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .maybeSingle()

      if (profileError) {
        console.error('Error fetching profiles:', profileError)
      } else if (profileData) {
        setUsername(profileData.full_name)
      }

      // Fetch elder profiles
      const { data: eldersData, error: eldersError } = await supabase
        .from('elders')
        .select('*')
        .eq('caregiver_id', userId)

      if (eldersError) {
        console.error('Error fetching elders:', eldersError)
      } else if (eldersData) {
        // Map database fields to snake_case/camelCase values if required by Dashboard.jsx
        const mappedElders = eldersData.map(e => ({
          id: e.id,
          name: e.name,
          age: e.age,
          sex: e.sex,
          bloodType: e.blood_type,
          condition: e.condition,
          conditions: e.conditions,
          allergies: e.allergies,
          hasInsurance: e.has_insurance,
          insurance: e.insurance,
          room: e.room,
          emergencyContactName: e.emergency_contact_name,
          emergencyContactPhone: e.emergency_contact_phone,
          avatar: e.avatar,
          deviceStatus: e.device_status
        }))
        setElderProfiles(mappedElders)
      }
    } catch (e) {
      console.error('Error fetching Supabase data:', e)
    }
  }

  const handleLoginSuccess = (name) => {
    setUsername(name)
    setIsLoggedIn(true)
    isLoggingIn.current = false
  }

  const handleRegisterSuccess = (fullName, elders) => {
    setUsername(fullName)
    setElderProfiles(elders)
    setIsLoggedIn(true)
  }

  const handleStartLoginTransition = () => {
    isLoggingIn.current = true
  }

  const handleLogout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    setAuthView('login')
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-slate-400 font-mono text-sm">Sincronizando con Qhawaybot...</p>
      </div>
    )
  }

  if (isLoggedIn) {
    return <Dashboard adminName={username} onLogout={handleLogout} elderProfiles={elderProfiles} />
  }

  return authView === 'login' ? (
    <Login 
      onLoginSuccess={handleLoginSuccess} 
      onStartTransition={handleStartLoginTransition}
      onSwitchToRegister={() => setAuthView('register')} 
    />
  ) : (
    <Register 
      onRegisterSuccess={handleRegisterSuccess} 
      onSwitchToLogin={() => setAuthView('login')} 
    />
  )
}

export default App

