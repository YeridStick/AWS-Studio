import { useState, useRef, useEffect } from 'react'
import {
  Search,
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ChevronRight,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Play,
  Copy,
  Check,
  Command
} from 'lucide-react'
import { AVAILABLE_MODELS, sendMessageToAI, checkOllamaStatus, generateInfraGuide } from '../services/aiService'
import { documentationIndex, infrastructureGuides, searchAliases } from '../data/docIndex'
import { useNavigate } from 'react-router-dom'

function SearchAssistant({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('search') // 'search', 'chat', 'guide'
  const [searchResults, setSearchResults] = useState([])
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gemma4:e4b')
  const [ollamaStatus, setOllamaStatus] = useState(false)
  const [activeGuide, setActiveGuide] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [expandedStep, setExpandedStep] = useState(null)
  const [copiedCommand, setCopiedCommand] = useState(null)
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      checkOllamaStatus().then(setOllamaStatus)
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Búsqueda en documentación
  const handleSearch = (searchQuery) => {
    setQuery(searchQuery)
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    // Buscar en aliases primero
    const aliasMatch = Object.entries(searchAliases).find(([key]) =>
      searchQuery.toLowerCase().includes(key)
    )

    if (aliasMatch) {
      const path = aliasMatch[1]
      const doc = documentationIndex[path]
      setSearchResults([{ path, title: doc.title, snippet: doc.content, score: 100 }])
      return
    }

    // Búsqueda por palabras clave
    const results = Object.entries(documentationIndex).map(([path, doc]) => {
      const queryLower = searchQuery.toLowerCase()
      let score = 0

      // Coincidencia exacta en título
      if (doc.title.toLowerCase().includes(queryLower)) score += 10

      // Coincidencia en contenido
      if (doc.content.toLowerCase().includes(queryLower)) score += 5

      // Coincidencia en keywords
      doc.keywords.forEach(kw => {
        if (queryLower.includes(kw) || kw.includes(queryLower)) score += 3
      })

      // Coincidencia parabra por palabra
      const words = queryLower.split(' ')
      words.forEach(word => {
        if (doc.content.toLowerCase().includes(word)) score += 1
      })

      return { path, title: doc.title, snippet: doc.content.substring(0, 150) + '...', score }
    }).filter(r => r.score > 0).sort((a, b) => b.score - a.score)

    setSearchResults(results.slice(0, 5))
  }

  // Enviar mensaje al IA
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = { role: 'user', content: inputMessage }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    const history = messages.slice(-10) // Mantener últimos 10 mensajes para contexto
    const response = await sendMessageToAI(inputMessage, selectedModel, history)

    if (response.success) {
      setMessages(prev => [...prev, { role: 'assistant', content: response.content }])
    } else {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Error: No se pudo conectar con el modelo IA. Verifica que Ollama esté corriendo (ollama serve).'
      }])
    }

    setIsLoading(false)
  }

  // Generar guía de infraestructura
  const handleGenerateGuide = async (guideKey) => {
    const guide = infrastructureGuides[guideKey]
    if (!guide) return

    setActiveTab('guide')
    setActiveGuide({ ...guide, steps: [], loading: true })
    setCurrentStep(0)
    setExpandedStep(null)

    const generated = await generateInfraGuide(guide.title, selectedModel)

    if (generated && generated.steps) {
      setActiveGuide({ ...generated, loading: false })
    } else {
      // Fallback: crear pasos básicos
      setActiveGuide({
        ...guide,
        steps: [
          { number: 1, title: 'Prerrequisitos', description: 'Verificar acceso a AWS CLI y permisos necesarios', commands: ['aws sts get-caller-identity'] },
          { number: 2, title: 'Configuración inicial', description: `Configurar recursos necesarios para ${guide.title}`, commands: [] }
        ],
        loading: false
      })
    }
  }

  const handleCopyCommand = (cmd) => {
    navigator.clipboard.writeText(cmd)
    setCopiedCommand(cmd)
    setTimeout(() => setCopiedCommand(null), 2000)
  }

  const navigateToSection = (path) => {
    navigate(path)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(10, 15, 25, 0.95)',
        backdropFilter: 'blur(20px)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#2f80ed', padding: '10px', borderRadius: '12px' }}>
            <Sparkles size={24} color="white" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'white' }}>Asistente AWS</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#8892a0' }}>Búsqueda + IA Local</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Selector de modelo */}
          {activeTab === 'chat' && (
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: 'white',
                fontSize: '0.85rem'
              }}
            >
              {AVAILABLE_MODELS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          )}

          {/* Status Ollama */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: ollamaStatus ? 'rgba(39, 174, 96, 0.2)' : 'rgba(231, 76, 60, 0.2)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: ollamaStatus ? '#4ade80' : '#ef4444'
            }}
          >
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: ollamaStatus ? '#4ade80' : '#ef4444'
            }} />
            {ollamaStatus ? 'IA Online' : 'IA Offline'}
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[
          { id: 'search', label: 'Buscar', icon: Search },
          { id: 'chat', label: 'Chat IA', icon: MessageSquare },
          { id: 'guide', label: 'Guías', icon: Lightbulb }
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === tab.id ? '#2f80ed' : 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '0.9rem'
              }}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', gap: '20px' }}>
        {/* SEARCH TAB */}
        {activeTab === 'search' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8892a0' }} />
              <input
                type="text"
                placeholder="¿Qué quieres aprender? Ej: 'como crear vpc', 'eks tutorial', 'lambda basics'..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 48px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Quick Guides Grid */}
            {!query && (
              <div>
                <h3 style={{ color: '#8892a0', fontSize: '0.85rem', marginBottom: '12px', textTransform: 'uppercase' }}>
                  Guías Rápidas de Infraestructura
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                  {Object.entries(infrastructureGuides).map(([key, guide]) => (
                    <button
                      key={key}
                      onClick={() => handleGenerateGuide(key)}
                      style={{
                        padding: '16px',
                        background: 'rgba(47, 128, 237, 0.1)',
                        border: '1px solid rgba(47, 128, 237, 0.3)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: 'white'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Play size={16} color="#2f80ed" />
                        <strong style={{ fontSize: '0.95rem' }}>{guide.title}</strong>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#8892a0', marginBottom: '8px' }}>
                        {guide.description}
                      </p>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: '#4ade80' }}>
                        <span>⏱️ {guide.estimatedTime}</span>
                        <span>📝 {guide.steps} pasos</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div>
                <h3 style={{ color: '#8892a0', fontSize: '0.85rem', marginBottom: '12px' }}>
                  Resultados ({searchResults.length})
                </h3>
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigateToSection(result.path)}
                    style={{
                      width: '100%',
                      padding: '16px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '10px',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: 'white'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <BookOpen size={18} color="#2f80ed" />
                      <div>
                        <strong style={{ color: '#2f80ed' }}>{result.title}</strong>
                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#8892a0' }}>
                          {result.snippet}
                        </p>
                      </div>
                      <ChevronRight size={18} style={{ marginLeft: 'auto', color: '#8892a0' }} />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {!query && (
              <div style={{ marginTop: 'auto' }}>
                <h3 style={{ color: '#8892a0', fontSize: '0.85rem', marginBottom: '12px' }}>Búsquedas populares</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['crear vpc', 'comandos ec2', 'kubernetes eks', 'seguridad iam', 's3 bucket', 'lambda function'].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => handleSearch(suggestion)}
                      style={{
                        padding: '8px 16px',
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '20px',
                        color: 'white',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflow: 'auto', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', marginBottom: '16px' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#8892a0', padding: '60px 20px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #2f80ed 0%, #8e44ad 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                  }}>
                    <Command size={32} color="white" />
                  </div>
                  <p style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'white' }}>Asistente AWS con IA Local</p>
                  <p style={{ fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
                    Pregunta sobre servicios AWS, genera comandos CLI, o resuelve problemas de infraestructura.
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      marginBottom: '20px',
                      flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: msg.role === 'user' ? '#2f80ed' : 'linear-gradient(135deg, #8e44ad 0%, #2f80ed 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div
                      style={{
                        maxWidth: '85%',
                        padding: msg.role === 'user' ? '10px 14px' : '0',
                        borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '0',
                        background: msg.role === 'user' ? '#2f80ed' : 'transparent',
                        color: 'white',
                        fontSize: '0.9rem',
                        lineHeight: 1.6
                      }}
                    >
                      {msg.role === 'assistant' ? (
                        <FormattedMessage content={msg.content} />
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))
              )}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                placeholder="Pregunta sobre AWS..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                style={{
                  flex: 1,
                  padding: '14px 18px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                style={{
                  padding: '14px 20px',
                  background: '#2f80ed',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}

        {/* GUIDE TAB */}
        {activeTab === 'guide' && activeGuide && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: 'white', fontSize: '1.3rem' }}>{activeGuide.title}</h2>
              <div style={{ display: 'flex', gap: '20px', marginTop: '8px', fontSize: '0.85rem', color: '#8892a0' }}>
                <span>⏱️ {activeGuide.estimatedTime || '30 minutos'}</span>
                <span>📊 Paso {currentStep + 1} de {activeGuide.steps?.length || '?'}</span>
              </div>
            </div>

            {activeGuide.loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#8892a0' }}>
                <Loader2 size={48} style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
                <p>Generando guía personalizada con IA...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeGuide.steps?.map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: idx === currentStep ? 'rgba(47, 128, 237, 0.1)' : 'rgba(255,255,255,0.03)'
                    }}
                  >
                    <button
                      onClick={() => setExpandedStep(expandedStep === idx ? null : idx)}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        textAlign: 'left'
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: idx < currentStep ? '#4ade80' : idx === currentStep ? '#2f80ed' : 'rgba(255,255,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {idx < currentStep ? <CheckCircle2 size={18} /> : <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{step.number}</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: '1rem' }}>{step.title}</strong>
                      </div>
                      {expandedStep === idx ? <ChevronUp size={20} color="#8892a0" /> : <ChevronDown size={20} color="#8892a0" />}
                    </button>

                    {expandedStep === idx && (
                      <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ color: '#8892a0', lineHeight: 1.6, margin: '16px 0' }}>
                          {step.description}
                        </p>

                        {step.commands?.length > 0 && (
                          <div style={{ marginBottom: '16px' }}>
                            <strong style={{ color: '#4ade80', fontSize: '0.85rem' }}>Comandos:</strong>
                            {step.commands.map((cmd, cidx) => (
                              <div
                                key={cidx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '10px 12px',
                                  background: '#071426',
                                  border: '1px solid #315277',
                                  borderRadius: '8px',
                                  marginTop: '8px',
                                  fontFamily: 'monospace',
                                  fontSize: '0.85rem'
                                }}
                              >
                                <code style={{ flex: 1, color: '#4ade80' }}>{cmd}</code>
                                <button
                                  onClick={() => handleCopyCommand(cmd)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: copiedCommand === cmd ? '#4ade80' : '#8892a0',
                                    cursor: 'pointer',
                                    padding: '4px'
                                  }}
                                >
                                  {copiedCommand === cmd ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {step.commonIssues?.length > 0 && (
                          <div style={{ background: 'rgba(231, 76, 60, 0.1)', padding: '12px', borderRadius: '8px' }}>
                            <strong style={{ color: '#ef4444', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <AlertCircle size={14} /> Problemas comunes:
                            </strong>
                            <ul style={{ margin: '8px 0 0', paddingLeft: '20px', color: '#8892a0', fontSize: '0.85rem' }}>
                              {step.commonIssues.map((issue, iidx) => (
                                <li key={iidx}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                          <button
                            onClick={() => setCurrentStep(idx)}
                            disabled={idx === currentStep}
                            style={{
                              padding: '8px 16px',
                              background: idx === currentStep ? '#4ade80' : 'rgba(255,255,255,0.1)',
                              border: 'none',
                              borderRadius: '8px',
                              color: idx === currentStep ? 'black' : 'white',
                              cursor: idx === currentStep ? 'default' : 'pointer',
                              fontSize: '0.85rem'
                            }}
                          >
                            {idx === currentStep ? 'Paso actual' : 'Ir a este paso'}
                          </button>

                          {idx === currentStep && (
                            <button
                              onClick={() => {
                                setCurrentStep(idx + 1)
                                setExpandedStep(idx + 1)
                              }}
                              disabled={idx >= activeGuide.steps.length - 1}
                              style={{
                                padding: '8px 16px',
                                background: '#2f80ed',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                cursor: idx >= activeGuide.steps.length - 1 ? 'not-allowed' : 'pointer',
                                fontSize: '0.85rem',
                                opacity: idx >= activeGuide.steps.length - 1 ? 0.5 : 1
                              }}
                            >
                              Siguiente paso →
                            </button>
                          )}
                        </div>

                        {/* Chat específico del paso */}
                        {idx === currentStep && ollamaStatus && (
                          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(142, 68, 173, 0.1)', borderRadius: '8px' }}>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#8892a0', marginBottom: '8px' }}>
                              ¿Problemas con este paso? Pide ayuda a la IA:
                            </p>
                            <button
                              onClick={() => {
                                setActiveTab('chat')
                                const contextMsg = `Estoy siguiendo la guía "${activeGuide.title}" y tengo un problema en el paso ${step.number}: "${step.title}". ${step.description}. ¿Puedes ayudarme?`
                                setInputMessage(contextMsg)
                              }}
                              style={{
                                padding: '8px 16px',
                                background: 'rgba(142, 68, 173, 0.3)',
                                border: '1px solid #8e44ad',
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <Sparkles size={14} /> Iniciar chat sobre este paso
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Componente para mostrar el mensaje formateado con soporte para markdown
function FormattedMessage({ content }) {
  const [copiedBlock, setCopiedBlock] = useState(null)

  const copyToClipboard = (code, index) => {
    navigator.clipboard.writeText(code)
    setCopiedBlock(index)
    setTimeout(() => setCopiedBlock(null), 2000)
  }

  // Parsear el contenido en bloques
  const parseContent = (text) => {
    const blocks = []
    const lines = text.split('\n')
    let currentBlock = null
    let i = 0

    while (i < lines.length) {
      const line = lines[i]
      const trimmed = line.trim()

      // Bloque de código ```
      if (trimmed.startsWith('```')) {
        if (currentBlock && currentBlock.type === 'code') {
          // Cerrar bloque de código
          blocks.push(currentBlock)
          currentBlock = null
        } else {
          // Iniciar bloque de código
          if (currentBlock) blocks.push(currentBlock)
          const language = trimmed.replace(/```/g, '').trim()
          currentBlock = { type: 'code', language, code: [] }
        }
        i++
        continue
      }

      // Dentro de bloque de código
      if (currentBlock && currentBlock.type === 'code') {
        currentBlock.code.push(line)
        i++
        continue
      }

      // Línea vacía - separador
      if (trimmed === '') {
        if (currentBlock) {
          blocks.push(currentBlock)
          currentBlock = null
        }
        i++
        continue
      }

      // Separador horizontal --- o ***
      if (trimmed === '---' || trimmed === '***' || trimmed === '___' || trimmed === '—' || trimmed === '-') {
        if (currentBlock) {
          blocks.push(currentBlock)
          currentBlock = null
        }
        blocks.push({ type: 'paragraph', content: '---' })
        i++
        continue
      }

      // Título H1/H2 con #
      if (trimmed.startsWith('# ')) {
        if (currentBlock) blocks.push(currentBlock)
        blocks.push({ type: 'h1', content: trimmed.replace(/^#\s*/, '') })
        i++
        continue
      }

      if (trimmed.startsWith('## ')) {
        if (currentBlock) blocks.push(currentBlock)
        blocks.push({ type: 'h2', content: trimmed.replace(/^##\s*/, '') })
        i++
        continue
      }

      if (trimmed.startsWith('### ')) {
        if (currentBlock) blocks.push(currentBlock)
        blocks.push({ type: 'h3', content: trimmed.replace(/^###\s*/, '') })
        i++
        continue
      }

      // Lista numerada
      if (/^\d+\.\s/.test(trimmed)) {
        if (!currentBlock || currentBlock.type !== 'ol') {
          if (currentBlock) blocks.push(currentBlock)
          currentBlock = { type: 'ol', items: [] }
        }
        currentBlock.items.push(trimmed.replace(/^\d+\.\s*/, ''))
        i++
        continue
      }

      // Lista con bullets - o *
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (!currentBlock || currentBlock.type !== 'ul') {
          if (currentBlock) blocks.push(currentBlock)
          currentBlock = { type: 'ul', items: [] }
        }
        currentBlock.items.push(trimmed.replace(/^[-*]\s*/, ''))
        i++
        continue
      }

      // Código inline
      if (trimmed.includes('`')) {
        if (currentBlock && currentBlock.type !== 'paragraph') {
          blocks.push(currentBlock)
          currentBlock = null
        }
        if (!currentBlock) currentBlock = { type: 'paragraph', content: '' }
        currentBlock.content += (currentBlock.content ? ' ' : '') + formatInlineCode(trimmed)
        i++
        continue
      }

      // Párrafo normal
      if (!currentBlock || currentBlock.type !== 'paragraph') {
        if (currentBlock) blocks.push(currentBlock)
        currentBlock = { type: 'paragraph', content: trimmed }
      } else {
        currentBlock.content += ' ' + trimmed
      }
      i++
    }

    if (currentBlock) blocks.push(currentBlock)
    return blocks
  }

  const formatInlineCode = (text) => {
    return text.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.85em;color:#4ade80;">$1</code>')
  }

  const formatBold = (text) => {
    return text.replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#4ade80;">$1</strong>')
  }

  const formatLinks = (text) => {
    // Enlaces markdown [texto](url)
    return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#2f80ed;text-decoration:none;border-bottom:1px solid #2f80ed;">$1</a>')
  }

  const formatAll = (text) => {
    return formatLinks(formatInlineCode(formatBold(text)))
  }

  const blocks = parseContent(content)
  let blockIndex = 0

  return (
    <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
      {blocks.map((block) => {
        const key = blockIndex++

        switch (block.type) {
          case 'h1':
            return (
              <div key={key} style={{ marginTop: '16px', marginBottom: '12px' }}>
                <strong style={{ color: '#2f80ed', fontSize: '1.15rem' }}>
                  {block.content.replace(/\*\*/g, '')}
                </strong>
              </div>
            )

          case 'h2':
            return (
              <div key={key} style={{ marginTop: '14px', marginBottom: '10px' }}>
                <strong style={{ color: '#a0a0a0', fontSize: '1rem' }}>
                  {block.content.replace(/\*\*/g, '')}
                </strong>
              </div>
            )

          case 'h3':
            return (
              <div key={key} style={{ marginTop: '12px', marginBottom: '8px', paddingLeft: '12px', borderLeft: '2px solid #8e44ad' }}>
                <strong style={{ color: '#8e44ad', fontSize: '0.95rem' }}>
                  {block.content.replace(/\*\*/g, '')}
                </strong>
              </div>
            )

          case 'code':
            const codeText = block.code.join('\n')
            return (
              <div key={key} style={{ margin: '12px 0' }}>
                <div style={{ 
                  background: '#071426', 
                  border: '1px solid #315277', 
                  borderRadius: '8px', 
                  overflow: 'hidden'
                }}>
                  {block.language && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 12px', 
                      background: 'rgba(47, 128, 237, 0.1)',
                      borderBottom: '1px solid #315277'
                    }}>
                      <span style={{ fontSize: '0.75rem', color: '#8892a0', textTransform: 'uppercase' }}>
                        {block.language}
                      </span>
                      <button
                        onClick={() => copyToClipboard(codeText, key)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: copiedBlock === key ? '#4ade80' : '#8892a0',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem'
                        }}
                      >
                        {copiedBlock === key ? <Check size={14} /> : <Copy size={14} />}
                        {copiedBlock === key ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                  )}
                  <pre style={{ 
                    margin: 0, 
                    padding: '12px', 
                    overflow: 'auto',
                    fontSize: '0.85rem',
                    lineHeight: 1.5
                  }}>
                    <code style={{ color: '#4ade80', fontFamily: 'JetBrains Mono, Consolas, monospace' }}>
                      {codeText}
                    </code>
                  </pre>
                </div>
              </div>
            )

          case 'ol':
            return (
              <ol key={key} style={{ margin: '8px 0', paddingLeft: '20px', color: '#c0c0c0' }}>
                {block.items.map((item, i) => (
                  <li key={i} style={{ marginBottom: '6px', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ 
                    __html: formatAll(item) 
                  }} />
                ))}
              </ol>
            )

          case 'ul':
            return (
              <ul key={key} style={{ margin: '8px 0', paddingLeft: '20px', listStyle: 'none' }}>
                {block.items.map((item, i) => (
                  <li key={i} style={{ 
                    marginBottom: '4px', 
                    color: '#c0c0c0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}>
                    <span style={{ color: '#4ade80', flexShrink: 0 }}>•</span>
                    <span dangerouslySetInnerHTML={{ 
                      __html: formatAll(item) 
                    }} />
                  </li>
                ))}
              </ul>
            )

          case 'paragraph':
            // Verificar si es separador ---
            if (block.content === '---' || block.content === '***' || block.content === '___') {
              return (
                <hr key={key} style={{ 
                  border: 'none', 
                  borderTop: '1px solid rgba(255,255,255,0.15)', 
                  margin: '16px 0' 
                }} />
              )
            }
            return (
              <p 
                key={key} 
                style={{ margin: '8px 0', color: '#e0e0e0', lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{ __html: formatAll(block.content) }}
              />
            )

          default:
            return null
        }
      })}
    </div>
  )
}

// Indicador de "typing"
function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '20px' }}>
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #8e44ad 0%, #2f80ed 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <Bot size={14} />
      </div>
      <div style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px 12px 12px 4px' }}>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span style={{ color: '#8892a0', fontSize: '0.8rem', marginRight: '8px' }}>IA escribiendo</span>
          <Dot delay={0} />
          <Dot delay={0.2} />
          <Dot delay={0.4} />
        </div>
      </div>
    </div>
  )
}

function Dot({ delay }) {
  return (
    <span
      style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: '#2f80ed',
        animation: 'pulse 1.4s ease-in-out infinite',
        animationDelay: `${delay}s`
      }}
    />
  )
}

export default SearchAssistant
