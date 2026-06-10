import React, { useState, useEffect, useRef } from 'react'
import { Heart, Lock, Unlock } from 'lucide-react'

export default function Login({ onLoginSuccess }) {
  const [welcomeClicked, setWelcomeClicked] = useState(false)
  
  // Stages: 'welcome' | 'typing-part1' | 'user-input' | 'typing-part2' | 'email-input' | 'typing-part3' | 'password-input' | 'unlocking'
  const [stage, setStage] = useState('welcome')
  const [isLocked, setIsLocked] = useState(true)
  const [isFalling, setIsFalling] = useState(false)
  
  // Typed text buffers
  const [typedPart1, setTypedPart1] = useState('')
  const [typedPart2, setTypedPart2] = useState('')
  const [typedPart3, setTypedPart3] = useState('')

  // Form inputs
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Confirmation flags
  const [userConfirmed, setUserConfirmed] = useState(false)
  const [emailConfirmed, setEmailConfirmed] = useState(false)
  
  const [loading, setLoading] = useState(false)

  // References for focusing inputs automatically
  const userInputRef = useRef(null)
  const emailInputRef = useRef(null)
  const passwordInputRef = useRef(null)

  const textPart1 = "Sincronizando con Qhawaybot. Por favor, ingresa tu Usuario: "
  const textPart2 = ", Correo: "
  const textPart3 = " y Contraseña: "

  const handleWelcomeClick = () => {
    setWelcomeClicked(true)
    setTimeout(() => {
      setStage('typing-part1')
    }, 800)
  }

  // Typewriter Effect for Part 1
  useEffect(() => {
    if (stage !== 'typing-part1') return
    let index = 0
    const interval = setInterval(() => {
      if (index < textPart1.length) {
        setTypedPart1(textPart1.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
        setStage('user-input')
      }
    }, 30)
    return () => clearInterval(interval)
  }, [stage])

  // Typewriter Effect for Part 2
  useEffect(() => {
    if (stage !== 'typing-part2') return
    let index = 0
    const interval = setInterval(() => {
      if (index < textPart2.length) {
        setTypedPart2(textPart2.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
        setStage('email-input')
      }
    }, 30)
    return () => clearInterval(interval)
  }, [stage])

  // Typewriter Effect for Part 3
  useEffect(() => {
    if (stage !== 'typing-part3') return
    let index = 0
    const interval = setInterval(() => {
      if (index < textPart3.length) {
        setTypedPart3(textPart3.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
        setStage('password-input')
      }
    }, 30)
    return () => clearInterval(interval)
  }, [stage])

  // Auto-focus inputs when they are revealed
  useEffect(() => {
    if (stage === 'user-input' && userInputRef.current) {
      userInputRef.current.focus()
    }
  }, [stage])

  useEffect(() => {
    if (stage === 'email-input' && emailInputRef.current) {
      emailInputRef.current.focus()
    }
  }, [stage])

  useEffect(() => {
    if (stage === 'password-input' && passwordInputRef.current) {
      passwordInputRef.current.focus()
    }
  }, [stage])

  const confirmUser = () => {
    if (username.trim()) {
      setUserConfirmed(true)
      setStage('typing-part2')
    }
  }

  const confirmEmail = () => {
    if (email.trim() && email.includes('@')) {
      setEmailConfirmed(true)
      setStage('typing-part3')
    }
  }

  const handleFinalSubmit = () => {
    if (password.trim().length >= 4) {
      setLoading(true)
      
      // Phase 1: Wait for simulated sync
      setTimeout(() => {
        setLoading(false)
        setStage('unlocking')
      }, 1500)
    }
  }

  // Trigger the unlock animation sequence
  useEffect(() => {
    if (stage !== 'unlocking') return
    
    // 1. Unlock the padlock after a short delay
    const unlockTimeout = setTimeout(() => {
      setIsLocked(false)
    }, 400)

    // 2. Start falling & fading out after 950ms
    const fallTimeout = setTimeout(() => {
      setIsFalling(true)
    }, 950)

    // 3. Redirect callback after the animation completes
    const loginTimeout = setTimeout(() => {
      onLoginSuccess(username)
    }, 2200)

    return () => {
      clearTimeout(unlockTimeout)
      clearTimeout(fallTimeout)
      clearTimeout(loginTimeout)
    }
  }, [stage, username, onLoginSuccess])

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans w-full">
      
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[450px] h-80 sm:h-[450px] bg-blue-600/15 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 sm:w-[450px] h-80 sm:h-[450px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-3xl w-full z-10 text-center">
        
        {/* STAGE 1: Welcome Screen */}
        {stage === 'welcome' && (
          <div 
            onClick={handleWelcomeClick}
            className={`fixed inset-0 w-full h-full flex flex-col justify-center items-center z-30 cursor-pointer select-none bg-transparent transition-all duration-700 ${
              welcomeClicked 
                ? 'opacity-0 scale-95 pointer-events-none' 
                : 'opacity-100'
            }`}
          >
            <div className="text-center px-4 max-w-xl">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 animate-pulse mx-auto mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tight mb-4">
                Bienvenido <span className="text-blue-500 block sm:inline">Usuario</span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base font-semibold tracking-wide flex items-center justify-center gap-2 opacity-85 hover:opacity-100 transition-opacity">
                Haz clic en cualquier parte de la pantalla para iniciar sesión
              </p>
            </div>
          </div>
        )}

        {/* STAGES 2-7: Inline Typewriter + Inputs Layout */}
        {stage !== 'welcome' && stage !== 'unlocking' && (
          <div className="animate-fade-in w-full px-4">
            <div className="flex justify-center mb-8">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Heart className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="font-mono text-base sm:text-xl text-slate-200 leading-relaxed text-left max-w-3xl mx-auto p-6 sm:p-8 bg-slate-900/20 border border-slate-800/40 rounded-3xl backdrop-blur-md shadow-2xl">
              
              {/* Part 1 text */}
              <span>{typedPart1}</span>

              {/* Username Input Field */}
              {(stage === 'user-input' || userConfirmed) && (
                <span className="inline-flex items-center gap-1.5 mx-1">
                  <input
                    ref={userInputRef}
                    type="text"
                    required
                    disabled={userConfirmed}
                    placeholder="usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmUser()
                    }}
                    className={`bg-slate-950/80 border-b-2 ${userConfirmed ? 'border-green-500 text-green-400 font-bold' : 'border-blue-500 text-white focus:border-blue-400'} px-2 py-0.5 outline-none rounded-xs text-center transition-all w-36 text-sm sm:text-base`}
                  />
                  {!userConfirmed && username.trim() && (
                    <button
                      type="button"
                      onClick={confirmUser}
                      className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-2 rounded-lg transition-all cursor-pointer font-sans"
                    >
                      Siguiente
                    </button>
                  )}
                </span>
              )}

              {/* Part 2 text */}
              {userConfirmed && <span>{typedPart2}</span>}

              {/* Email Input Field */}
              {(stage === 'email-input' || emailConfirmed) && (
                <span className="inline-flex items-center gap-1.5 mx-1">
                  <input
                    ref={emailInputRef}
                    type="email"
                    required
                    disabled={emailConfirmed}
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmEmail()
                    }}
                    className={`bg-slate-950/80 border-b-2 ${emailConfirmed ? 'border-green-500 text-green-400 font-bold' : 'border-blue-500 text-white focus:border-blue-400'} px-2 py-0.5 outline-none rounded-xs text-center transition-all w-52 text-sm sm:text-base`}
                  />
                  {!emailConfirmed && email.trim() && email.includes('@') && (
                    <button
                      type="button"
                      onClick={confirmEmail}
                      className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-2 rounded-lg transition-all cursor-pointer font-sans"
                    >
                      Siguiente
                    </button>
                  )}
                </span>
              )}

              {/* Part 3 text */}
              {emailConfirmed && <span>{typedPart3}</span>}

              {/* Password Input Field */}
              {(stage === 'password-input' || (emailConfirmed && stage !== 'typing-part3')) && (
                <span className="inline-flex items-center gap-1.5 mx-1">
                  <input
                    ref={passwordInputRef}
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleFinalSubmit()
                    }}
                    className="bg-slate-950/80 border-b-2 border-blue-500 text-white focus:border-blue-400 px-2 py-0.5 outline-none rounded-xs text-center transition-all w-36 text-sm sm:text-base"
                  />
                </span>
              )}

              {/* Typewriter Cursor */}
              {(stage === 'typing-part1' || stage === 'typing-part2' || stage === 'typing-part3') && (
                <span className="inline-block w-1.5 h-4 bg-blue-500 ml-1 animate-pulse"></span>
              )}

              {/* Final Sincronizar Action Button */}
              {stage === 'password-input' && password.trim().length >= 4 && (
                <div className="mt-8 text-center animate-fade-in">
                  <button
                    onClick={handleFinalSubmit}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold py-3 px-8 rounded-2xl transition shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer text-sm font-sans flex items-center gap-2 mx-auto"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sincronizando con Qhawaybot...
                      </>
                    ) : (
                      "Iniciar Sincronización"
                    )}
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

        {/* STAGE 8: Unlocking Padlock Animation screen */}
        {stage === 'unlocking' && (
          <div className="animate-fade-in flex flex-col items-center justify-center py-12 px-6">
            <div className="relative flex items-center justify-center w-64 h-64">
              
              {/* Expanding glowing background ring */}
              <div className={`absolute inset-0 rounded-full blur-3xl opacity-40 transition-all duration-1000 ${
                isLocked 
                  ? 'bg-blue-600 animate-pulse' 
                  : isFalling 
                    ? 'bg-sky-400 scale-150 opacity-0' 
                    : 'bg-sky-400 scale-125'
              }`}></div>
              
              {/* Padlock Icon (no circle border) */}
              <div className={`transition-all ease-in-out duration-750 ${
                isLocked 
                  ? 'text-blue-500 scale-100 translate-y-0 opacity-100' 
                  : isFalling 
                    ? 'text-sky-300 scale-125 translate-y-48 opacity-0 rotate-12' 
                    : 'text-sky-300 scale-125 translate-y-0 opacity-100'
              }`}>
                {isLocked ? (
                  <Lock className="w-28 h-28" />
                ) : (
                  <Unlock className="w-28 h-28 rotate-[-12deg]" />
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
