import React, { useState, useEffect, useRef } from 'react'
import {
  Mail, Send, Volume2, VolumeX, AlertTriangle,
  CheckCheck, Check, RefreshCw, Heart, Wifi, WifiOff, X
} from 'lucide-react'
import { supabase } from '../supabase'

// ---------------------------------------------------------------------------
// Mock data — reemplazar con llamadas reales a la API del robot / Gmail
// ---------------------------------------------------------------------------
export const MOCK_INITIAL_MESSAGES = [
  {
    id: 1,
    from: 'abuelo',
    text: 'Buenos días, ya desayuné todo.',
    timestamp: new Date(Date.now() - 3600000 * 3),
    isRead: true,
    isVocalized: false,
    isSOS: false,
    channel: 'gmail',
  },
  {
    id: 2,
    from: 'admin',
    text: '¡Qué bien abuelo! No olvides tomar tus pastillas a las 10am.',
    timestamp: new Date(Date.now() - 3600000 * 2.8),
    isRead: true,
    isVocalized: true,
    isSOS: false,
    channel: 'dashboard',
  },
  {
    id: 3,
    from: 'bot',
    text: 'Recordatorio emitido: "Pastillas de las 10am". Abuelo confirmó recepción.',
    timestamp: new Date(Date.now() - 3600000 * 2),
    isRead: true,
    isVocalized: false,
    isSOS: false,
    channel: 'bot',
  },
  {
    id: 4,
    from: 'abuelo',
    text: '¡Me caí en el baño! No puedo levantarme.',
    timestamp: new Date(Date.now() - 1800000),
    isRead: true,
    isVocalized: false,
    isSOS: true,
    channel: 'gmail',
  },
  {
    id: 5,
    from: 'bot',
    text: 'ALERTA: Sensor de caída activado. Abuelo detectado en el suelo. Iniciando protocolo de emergencia SOS.',
    timestamp: new Date(Date.now() - 1800000 + 4000),
    isRead: true,
    isVocalized: false,
    isSOS: true,
    channel: 'bot',
  },
  {
    id: 6,
    from: 'admin',
    text: 'Abuelo, estoy llamando a emergencias ahora. ¡Quédate quieto y no te muevas!',
    timestamp: new Date(Date.now() - 1750000),
    isRead: true,
    isVocalized: true,
    isSOS: true,
    channel: 'dashboard',
  },
  {
    id: 7,
    from: 'abuelo',
    text: 'Ya estoy bien, me ayudó el robot a levantarme. Fue un susto.',
    timestamp: new Date(Date.now() - 600000),
    isRead: false,
    isVocalized: false,
    isSOS: false,
    channel: 'gmail',
  },
]

// Mensaje simulado para la sincronización de Gmail
const MOCK_GMAIL_MESSAGE = {
  from: 'abuelo',
  text: 'Ya tomé mis pastillas del mediodía. El robot me avisó.',
  isSOS: false,
  channel: 'gmail',
}

// ---------------------------------------------------------------------------
// TTS helpers — usa la Web Speech API del navegador (sin API key)
// ---------------------------------------------------------------------------
function speak(text, onEnd) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'es-ES'
  utterance.rate = 0.9
  utterance.pitch = 1.05
  if (onEnd) utterance.onend = onEnd
  window.speechSynthesis.speak(utterance)
}

function stopSpeaking() {
  if (window.speechSynthesis) window.speechSynthesis.cancel()
}

// ---------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------
function formatTime(date) {
  return new Date(date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function formatDateLabel(date) {
  const d = new Date(date)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Hoy'
  if (d.toDateString() === yesterday.toDateString()) return 'Ayer'
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Agrupa mensajes por fecha para mostrar separadores
function groupByDate(messages) {
  const groups = []
  let currentDate = null
  messages.forEach((msg) => {
    const label = formatDateLabel(msg.timestamp)
    if (label !== currentDate) {
      groups.push({ type: 'separator', label })
      currentDate = label
    }
    groups.push({ type: 'message', data: msg })
  })
  return groups
}

// ---------------------------------------------------------------------------
// Sub-componente: burbuja de mensaje
// ---------------------------------------------------------------------------
function MessageBubble({ msg, speakingId, onToggleSpeak }) {
  const isAdmin = msg.from === 'admin'
  const isBot = msg.from === 'bot'
  const isAbuelo = msg.from === 'abuelo'
  const isSpeaking = speakingId === msg.id

  const bubbleBase =
    'relative max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs'

  const bubbleColor = isAdmin
    ? 'bg-blue-600 dark:bg-baltic-blue-600 text-white rounded-br-md'
    : isBot
    ? 'bg-slate-200 dark:bg-prussian-blue-800 text-slate-700 dark:text-prussian-blue-200 rounded-bl-md border border-slate-300 dark:border-prussian-blue-700'
    : msg.isSOS
    ? 'bg-red-50 dark:bg-rose-wine-950 text-red-900 dark:text-rose-wine-200 border border-red-200 dark:border-rose-wine-800 rounded-bl-md'
    : 'bg-white dark:bg-prussian-blue-900 text-slate-800 dark:text-prussian-blue-100 border border-slate-100 dark:border-prussian-blue-800 rounded-bl-md'

  const wrapper = isAdmin ? 'flex justify-end' : 'flex justify-start'

  // Indicador de estado (solo mensajes del admin)
  const StatusIcon = () => {
    if (!isAdmin) return null
    if (msg.isVocalized)
      return <CheckCheck className="w-3.5 h-3.5 text-blue-200 inline ml-1" />
    return <Check className="w-3.5 h-3.5 text-blue-300 inline ml-1" />
  }

  return (
    <div className={`${wrapper} mb-1.5`}>
      {/* Avatar — solo para abuelo y bot */}
      {!isAdmin && (
        <div className="flex-shrink-0 mr-2 mt-1">
          {isBot ? (
            <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-baltic-blue-950 flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-blue-600 dark:text-baltic-blue-400" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-chocolate-950 flex items-center justify-center text-xs font-bold text-amber-700 dark:text-chocolate-300">
              A
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1">
        {/* Etiqueta del remitente */}
        {!isAdmin && (
          <span className="text-[10px] font-bold text-slate-400 dark:text-prussian-blue-400 uppercase tracking-wide ml-1">
            {isBot ? 'Qhawaybot' : 'Abuelo'}
            {msg.channel === 'gmail' && (
              <span className="ml-1 text-[9px] bg-red-50 dark:bg-rose-wine-950 text-red-500 dark:text-rose-wine-400 border border-red-200 dark:border-rose-wine-800 px-1 py-0.5 rounded-sm">
                Gmail
              </span>
            )}
          </span>
        )}

        <div className={`${bubbleBase} ${bubbleColor}`}>
          {/* Badge SOS */}
          {msg.isSOS && (
            <div className="flex items-center gap-1 mb-1.5">
              <AlertTriangle className="w-3 h-3 text-red-500" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-wide">
                Alerta SOS
              </span>
            </div>
          )}

          <p>{msg.text}</p>

          {/* Footer del bubble: hora + estado + TTS */}
          <div className="flex items-center justify-end gap-2 mt-1.5">
            <span
              className={`text-[10px] ${isAdmin ? 'text-blue-200' : 'text-slate-400 dark:text-prussian-blue-400'}`}
            >
              {formatTime(msg.timestamp)}
            </span>
            <StatusIcon />

            {/* Botón TTS — disponible en todos los mensajes */}
            <button
              onClick={() => onToggleSpeak(msg)}
              title={isSpeaking ? 'Detener audio' : 'Reproducir en voz alta'}
              className={`flex items-center justify-center w-5 h-5 rounded-full transition-all cursor-pointer ${
                isSpeaking
                  ? isAdmin
                    ? 'bg-blue-400 text-white animate-pulse'
                    : 'bg-blue-100 dark:bg-baltic-blue-950 text-blue-600 dark:text-baltic-blue-400 animate-pulse'
                  : isAdmin
                  ? 'text-blue-200 hover:text-white'
                  : 'text-slate-300 dark:text-prussian-blue-500 hover:text-blue-500 dark:hover:text-baltic-blue-400'
              }`}
            >
              {isSpeaking ? (
                <VolumeX className="w-3 h-3" />
              ) : (
                <Volume2 className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export default function Mensajeria({ messages: propMessages, setMessages: propSetMessages }) {
  const [localMessages, setLocalMessages] = useState(MOCK_INITIAL_MESSAGES)
  const messages = propMessages || localMessages
  const setMessages = propSetMessages || setLocalMessages
  const [inputText, setInputText] = useState('')
  const [activeTab, setActiveTab] = useState('chat') // 'chat' | 'sos'
  const [speakingId, setSpeakingId] = useState(null)
  const [gmailConnected, setGmailConnected] = useState(false)
  const [lastSync, setLastSync] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [gmailBanner, setGmailBanner] = useState(false)

  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeTab])

  // Marcar como leídos al abrir el chat
  useEffect(() => {
    if (activeTab === 'chat') {
      setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })))
    }
  }, [activeTab])

  // -------------------------------------------------------------------------
  // Acciones
  // -------------------------------------------------------------------------
  const sendMessage = () => {
    if (!inputText.trim()) return

    const textVal = inputText.trim()
    setInputText('')
    inputRef.current?.focus()

    let dbId = crypto.randomUUID()
    
    // Save to Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.from('messages').insert({
          id: dbId,
          caregiver_id: session.user.id,
          sender: 'admin',
          text: textVal
        }).then(({ error }) => {
          if (error) console.error('Error saving message to Supabase:', error);
        });
      }
    });

    const newMsg = {
      id: dbId,
      from: 'admin',
      text: textVal,
      timestamp: new Date(),
      isRead: true,
      isVocalized: false,
      isSOS: false,
      channel: 'dashboard',
    }
    setMessages((prev) => [...prev, newMsg])

    // Simula que el bot recibe el mensaje y lo vocaliza (~800ms de latencia)
    setTimeout(() => {
      setSpeakingId(newMsg.id)
      speak(newMsg.text, () => setSpeakingId(null))
      setMessages((prev) =>
        prev.map((m) =>
          m.id === newMsg.id ? { ...m, isVocalized: true } : m
        )
      )
    }, 800)
  }

  const toggleSpeak = (msg) => {
    if (speakingId === msg.id) {
      stopSpeaking()
      setSpeakingId(null)
    } else {
      setSpeakingId(msg.id)
      speak(msg.text, () => setSpeakingId(null))
    }
  }

  // Simula sincronización con Gmail (fetch de nuevos mensajes del abuelo)
  const syncGmail = () => {
    if (!gmailConnected || isSyncing) return
    setIsSyncing(true)
    setTimeout(async () => {
      const dbId = crypto.randomUUID()
      
      // Save to Supabase
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await supabase.from('messages').insert({
          id: dbId,
          caregiver_id: session.user.id,
          sender: 'abuelo',
          text: MOCK_GMAIL_MESSAGE.text
        });
      }

      const newMsg = {
        id: dbId,
        ...MOCK_GMAIL_MESSAGE,
        timestamp: new Date(),
        isRead: false,
        isVocalized: false,
      }
      setMessages((prev) => [...prev, newMsg])
      setLastSync(new Date())
      setIsSyncing(false)
    }, 1400)
  }

  // Conectar Gmail — en producción: abrir popup OAuth de Google
  const connectGmail = () => {
    /*
     * INTEGRACIÓN REAL:
     * 1. Redirigir a: https://accounts.google.com/o/oauth2/v2/auth
     *    con scopes: https://www.googleapis.com/auth/gmail.readonly
     * 2. Recibir el access_token en el callback
     * 3. Usar Gmail API: GET /gmail/v1/users/me/messages
     * 4. Filtrar emails del remitente del robot (ej: qhawaybot@gmail.com)
     * 5. Parsear el body del email como texto del abuelo
     *
     * Por ahora solo activamos el modo mock:
     */
    setGmailConnected(true)
    setLastSync(new Date())
    setGmailBanner(true)
    setTimeout(() => setGmailBanner(false), 4000)
  }

  // -------------------------------------------------------------------------
  // Derived state
  // -------------------------------------------------------------------------
  const unreadCount = messages.filter(
    (m) => !m.isRead && m.from !== 'admin'
  ).length

  const sosMessages = messages.filter((m) => m.isSOS)
  const sosUnread = sosMessages.filter((m) => !m.isRead).length

  const displayMessages =
    activeTab === 'sos' ? sosMessages : messages

  const grouped = groupByDate(displayMessages)

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-prussian-blue-950 font-sans">

      {/* ------------------------------------------------------------------ */}
      {/* Header                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white dark:bg-prussian-blue-900 border-b border-slate-100 dark:border-prussian-blue-800 shadow-xs px-5 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            Mensajería
          </h2>
          <p className="text-xs text-slate-400 dark:text-prussian-blue-400 mt-0.5">
            Comunicación en tiempo real con el abuelo vía Qhawaybot
          </p>
        </div>

        {/* Estado Gmail */}
        <button
          onClick={gmailConnected ? syncGmail : connectGmail}
          disabled={isSyncing}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            gmailConnected
              ? 'bg-red-50 dark:bg-rose-wine-950 text-red-600 dark:text-rose-wine-400 hover:bg-red-100 dark:hover:bg-rose-wine-900 border border-red-200 dark:border-rose-wine-800'
              : 'bg-slate-100 dark:bg-prussian-blue-800 text-slate-500 dark:text-prussian-blue-300 hover:bg-slate-200 dark:hover:bg-prussian-blue-700 border border-slate-200 dark:border-prussian-blue-700'
          }`}
        >
          {gmailConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5" />
              {isSyncing ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                'Gmail conectado'
              )}
            </>
          ) : (
            <>
              <Mail className="w-3.5 h-3.5" />
              Conectar Gmail
            </>
          )}
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Banner de Gmail conectado                                            */}
      {/* ------------------------------------------------------------------ */}
      {gmailBanner && (
        <div className="bg-green-50 dark:bg-verdigris-950 border-b border-green-200 dark:border-verdigris-800 px-5 py-2.5 flex items-center justify-between text-xs font-semibold text-green-700 dark:text-verdigris-400">
          <span>
            ✅ Gmail conectado — los mensajes del abuelo llegarán automáticamente.
          </span>
          <button onClick={() => setGmailBanner(false)} className="cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Tabs: Chat / Alertas SOS                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex border-b border-slate-100 dark:border-prussian-blue-800 bg-white dark:bg-prussian-blue-900 px-5 flex-shrink-0">
        <button
          onClick={() => setActiveTab('chat')}
          className={`relative py-3 mr-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'chat'
              ? 'border-blue-600 dark:border-baltic-blue-400 text-blue-600 dark:text-baltic-blue-400'
              : 'border-transparent text-slate-400 dark:text-prussian-blue-400 hover:text-slate-700 dark:hover:text-prussian-blue-100'
          }`}
        >
          Chat
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-4 w-4 h-4 bg-blue-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('sos')}
          className={`relative py-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'sos'
              ? 'border-red-500 dark:border-rose-wine-400 text-red-600 dark:text-rose-wine-400'
              : 'border-transparent text-slate-400 dark:text-prussian-blue-400 hover:text-slate-700 dark:hover:text-prussian-blue-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Alertas SOS
          {sosUnread > 0 && (
            <span className="absolute -top-0.5 -right-3 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
              {sosUnread}
            </span>
          )}
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Info de última sincronización                                         */}
      {/* ------------------------------------------------------------------ */}
      {gmailConnected && lastSync && (
        <div className="bg-slate-50 dark:bg-prussian-blue-900 px-5 py-1.5 flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-prussian-blue-400 font-semibold flex-shrink-0 border-b border-slate-100 dark:border-prussian-blue-800">
          <Mail className="w-3 h-3" />
          Última sincronización Gmail: {formatTime(lastSync)}
          <button
            onClick={syncGmail}
            disabled={isSyncing}
            className="ml-auto text-blue-500 dark:text-baltic-blue-400 hover:text-blue-700 dark:hover:text-baltic-blue-300 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Área de mensajes                                                      */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-0.5">

        {displayMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-prussian-blue-400 py-16">
            {activeTab === 'sos' ? (
              <>
                <AlertTriangle className="w-10 h-10 mb-3 text-slate-200 dark:text-prussian-blue-700" />
                <p className="text-sm font-semibold">Sin alertas SOS</p>
                <p className="text-xs mt-1">Todo tranquilo por ahora.</p>
              </>
            ) : (
              <>
                <Mail className="w-10 h-10 mb-3 text-slate-200 dark:text-prussian-blue-700" />
                <p className="text-sm font-semibold">Sin mensajes todavía</p>
                <p className="text-xs mt-1">
                  {gmailConnected
                    ? 'Esperando mensajes del robot...'
                    : 'Conecta Gmail para recibir mensajes del abuelo.'}
                </p>
              </>
            )}
          </div>
        ) : (
          grouped.map((item, i) => {
            if (item.type === 'separator') {
              return (
                <div
                  key={`sep-${i}`}
                  className="flex items-center gap-3 my-4"
                >
                  <div className="flex-1 h-px bg-slate-200 dark:bg-prussian-blue-800" />
                  <span className="text-[10px] font-bold text-slate-400 dark:text-prussian-blue-400 uppercase tracking-wide">
                    {item.label}
                  </span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-prussian-blue-800" />
                </div>
              )
            }
            return (
              <MessageBubble
                key={item.data.id}
                msg={item.data}
                speakingId={speakingId}
                onToggleSpeak={toggleSpeak}
              />
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Input — solo visible en la pestaña Chat                              */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'chat' && (
        <div className="bg-white dark:bg-prussian-blue-900 border-t border-slate-100 dark:border-prussian-blue-800 px-4 py-3 flex items-end gap-3 flex-shrink-0">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Escribe un mensaje para el abuelo... (el robot lo dirá en voz alta)"
              rows={1}
              className="w-full resize-none bg-slate-50 dark:bg-prussian-blue-800 border border-slate-200 dark:border-prussian-blue-700 rounded-2xl px-4 py-2.5 text-sm text-slate-800 dark:text-prussian-blue-100 placeholder-slate-400 dark:placeholder-prussian-blue-500 outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-baltic-blue-500/20 focus:border-blue-500 dark:focus:border-baltic-blue-500 transition max-h-32 overflow-y-auto"
              style={{ minHeight: '42px' }}
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={!inputText.trim()}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-prussian-blue-800 disabled:text-slate-400 dark:disabled:text-prussian-blue-500 text-white rounded-2xl flex items-center justify-center transition-all active:scale-95 flex-shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  )
}
