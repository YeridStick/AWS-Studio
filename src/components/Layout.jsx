import { NavLink, useLocation } from 'react-router-dom'
import {
  Home,
  Network,
  Server,
  Layers,
  Shield,
  Container,
  Terminal,
  AlertTriangle,
  Workflow,
  Cloud,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  GitBranch,
  Database
} from 'lucide-react'
import { useState, useEffect } from 'react'
import SearchAssistant from './SearchAssistant'
import InfrastructureDesigner from './InfrastructureDesigner'
import PipelineDesigner from './PipelineDesigner'

const navItems = [
  { path: '/', label: 'Inicio', icon: Home },
  {
    section: 'Fundamentos',
    items: [
      { path: '/infrastructure', label: 'Tipos de Infraestructura', icon: Layers },
      { path: '/services', label: 'Servicios AWS', icon: Cloud },
    ]
  },
  {
    section: 'Arquitectura',
    items: [
      { path: '/diagrams', label: 'Diagramas y Flujos', icon: Workflow },
      { path: '/networking', label: 'Networking Avanzado', icon: Network },
      { path: '/security', label: 'Seguridad', icon: Shield },
    ]
  },
  {
    section: 'Compute',
    items: [
      { path: '/kubernetes', label: 'Kubernetes / EKS', icon: Container },
    ]
  },
  {
    section: 'Operaciones',
    items: [
      { path: '/commands', label: 'Comandos CLI', icon: Terminal },
      { path: '/dynamodb', label: 'DynamoDB', icon: Database },
      { path: '/troubleshooting', label: 'Troubleshooting', icon: AlertTriangle },
    ]
  },
  {
    section: 'Herramientas IA',
    items: [
      { path: '#', label: 'Diseñar Infraestructura', icon: Sparkles, action: () => setDesignerOpen(true) },
      { path: '#', label: 'Diseñar Pipeline CI/CD', icon: GitBranch, action: () => setPipelineOpen(true) },
    ]
  }
]

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [designerOpen, setDesignerOpen] = useState(false)
  const [pipelineOpen, setPipelineOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setSidebarOpen(false)
    window.scrollTo(0, 0)
  }, [location])

  return (
    <div className="app-container">
      {/* Mobile menu button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99
          }}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Cloud size={28} />
            <span>AWS Mastery</span>
          </div>
          <div className="sidebar-subtitle">Documentación Profesional</div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, index) => {
            if (item.section) {
              return (
                <div key={index} className="nav-section">
                  <div className="nav-section-title">{item.section}</div>
                  {item.items.map((subItem) => {
                    const Icon = subItem.icon
                    if (subItem.action) {
                      return (
                        <button
                          key={subItem.label}
                          onClick={subItem.action}
                          className="nav-link"
                          style={{ background: 'none', width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                        >
                          <Icon size={18} />
                          <span>{subItem.label}</span>
                          <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                        </button>
                      )
                    }
                    return (
                      <NavLink
                        key={subItem.path}
                        to={subItem.path}
                        className={({ isActive }) =>
                          `nav-link ${isActive ? 'active' : ''}`
                        }
                      >
                        <Icon size={18} />
                        <span>{subItem.label}</span>
                        <ChevronRight
                          size={14}
                          style={{ marginLeft: 'auto', opacity: 0.5 }}
                        />
                      </NavLink>
                    )
                  })}
                </div>
              )
            }

            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div>AWS + EKS Architecture</div>
          <div style={{ marginTop: '4px', opacity: 0.7 }}>v1.0.0</div>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <div
          className="content-wrapper"
          style={{
            paddingTop: scrolled ? '24px' : '32px',
            transition: 'padding 0.2s ease'
          }}
        >
          {children}
        </div>
      </main>

      {/* Floating AI Assistant Button - Minimalista */}
      <button
        onClick={() => setAssistantOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'rgba(47, 128, 237, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          zIndex: 100,
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(47, 128, 237, 1)'
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(47, 128, 237, 0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(47, 128, 237, 0.9)'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.3)'
        }}
        aria-label="Abrir asistente IA"
      >
        <Sparkles size={20} strokeWidth={1.5} />
      </button>

      {/* Search Assistant Modal */}
      <SearchAssistant isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} />

      {/* Infrastructure Designer Modal */}
      <InfrastructureDesigner isOpen={designerOpen} onClose={() => setDesignerOpen(false)} />

      {/* Pipeline Designer Modal */}
      <PipelineDesigner isOpen={pipelineOpen} onClose={() => setPipelineOpen(false)} />
    </div>
  )
}

export default Layout
