import { useState, useRef } from 'react'
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  X,
  Server,
  Database,
  Cloud,
  Network,
  Shield,
  Layers,
  Zap,
  Globe,
  Cpu,
  HardDrive,
  MessageSquare,
  RefreshCw,
  Download,
  Copy,
  Trash2,
  Plus,
  Edit3,
  Save,
  ChevronDown,
  ChevronUp,
  DollarSign,
  FileCode
} from 'lucide-react'
import { analyzeInfrastructure, refineInfrastructure, estimateCost } from '../services/infraDesignerService'
import { generateCloudFormationTemplate, exportTemplateAsJSON, exportTemplateAsYAML } from '../services/cloudFormationService'

const WIZARD_STEPS = [
  { id: 'basics', title: 'Básico', description: 'Tipo y descripción de la aplicación' },
  { id: 'scale', title: 'Escala', description: 'Usuarios y tráfico esperado' },
  { id: 'tech', title: 'Tecnología', description: 'Base de datos, caché, colas' },
  { id: 'constraints', title: 'Restricciones', description: 'Presupuesto y requisitos' }
]

const APP_TYPES = [
  { id: 'web', label: 'Web Application', icon: Globe, description: 'Frontend + Backend tradicional' },
  { id: 'api', label: 'API/Backend', icon: Server, description: 'Servicios REST/GraphQL' },
  { id: 'ecommerce', label: 'E-commerce', icon: DollarSign, description: 'Tienda online con pagos' },
  { id: 'saas', label: 'SaaS Multi-tenant', icon: Layers, description: 'Software as a Service' },
  { id: 'mobile', label: 'Mobile Backend', icon: Zap, description: 'Backend para apps móviles' },
  { id: 'data', label: 'Data/Analytics', icon: Database, description: 'Procesamiento de datos' },
  { id: 'streaming', label: 'Streaming/Media', icon: Cloud, description: 'Video/audio streaming' },
  { id: 'iot', label: 'IoT', icon: Cpu, description: 'Internet of Things' }
]

const DEPLOYMENT_TYPES = [
  { id: 'containers', label: 'Containers (ECS/EKS)', description: 'Docker/Kubernetes' },
  { id: 'serverless', label: 'Serverless', description: 'Lambda + API Gateway' },
  { id: 'vms', label: 'Virtual Machines', description: 'EC2 tradicional' },
  { id: 'hybrid', label: 'Híbrido', description: 'Mix de tecnologías' }
]

const CONCURRENT_USERS = [
  { value: '10-100', label: '10-100', description: 'PoC/Startup temprana' },
  { value: '100-1k', label: '100-1,000', description: 'Startup en crecimiento' },
  { value: '1k-10k', label: '1K-10K', description: 'Producto establecido' },
  { value: '10k-100k', label: '10K-100K', description: 'Escala media' },
  { value: '100k+', label: '100K+', description: 'Alta escala' }
]

const BUDGETS = [
  { value: 'low', label: '< $50/mes', description: 'Personal/side project' },
  { value: 'medium', label: '$50-200/mes', description: 'Startup bootstrapped' },
  { value: 'standard', label: '$200-500/mes', description: 'Startup con funding' },
  { value: 'high', label: '$500-2K/mes', description: 'Empresa pequeña' },
  { value: 'enterprise', label: '$2K+/mes', description: 'Empresa/Enterprise' }
]

// Iconos para tipos de nodos
const NODE_ICONS = {
  user: Globe,
  cdn: Cloud,
  dns: Globe,
  alb: Network,
  nlb: Network,
  api: Server,
  ec2: Server,
  asg: Layers,
  ecs: Layers,
  eks: Layers,
  fargate: Zap,
  lambda: Zap,
  rds: Database,
  dynamo: Database,
  elasticache: HardDrive,
  s3: HardDrive,
  sns: MessageSquare,
  sqs: MessageSquare,
  eventbridge: Zap,
  cognito: Shield,
  secrets: Shield,
  cloudwatch: Server,
  waf: Shield,
  default: Server
}

const NODE_COLORS = {
  user: '#f2994a',
  cdn: '#e67e22',
  alb: '#3498db',
  nlb: '#2980b9',
  api: '#9b59b6',
  ec2: '#2ecc71',
  asg: '#27ae60',
  ecs: '#1abc9c',
  eks: '#16a085',
  fargate: '#f1c40f',
  lambda: '#f39c12',
  rds: '#e74c3c',
  dynamo: '#c0392b',
  elasticache: '#e67e22',
  s3: '#d35400',
  sns: '#8e44ad',
  sqs: '#9b59b6',
  cognito: '#34495e',
  secrets: '#2c3e50',
  default: '#95a5a6'
}

function InfrastructureDesigner({ isOpen, onClose }) {
  const [step, setStep] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [diagram, setDiagram] = useState(null)
  const [view, setView] = useState('wizard') // wizard, diagram, analysis
  const [selectedNode, setSelectedNode] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [refinementPrompt, setRefinementPrompt] = useState('')
  const [isRefining, setIsRefining] = useState(false)
  const [showCost, setShowCost] = useState(false)
  const [costEstimate, setCostEstimate] = useState(null)
  const [showCloudFormation, setShowCloudFormation] = useState(false)
  const [cloudFormationTemplate, setCloudFormationTemplate] = useState(null)
  const [cfFormat, setCfFormat] = useState('yaml') // yaml o json
  const svgRef = useRef(null)

  const [requirements, setRequirements] = useState({
    appType: '',
    description: '',
    concurrentUsers: '',
    trafficPeak: '',
    budget: '',
    region: 'us-east-1',
    latency: 'normal',
    compliance: 'none',
    needsDatabase: false,
    databaseType: 'postgresql',
    needsCache: false,
    needsQueue: false,
    deploymentType: 'containers',
    opsTeam: 'small'
  })

  const updateRequirement = (key, value) => {
    setRequirements(prev => ({ ...prev, [key]: value }))
  }

  const handleNext = () => {
    if (step < WIZARD_STEPS.length - 1) {
      setStep(step + 1)
    } else {
      generateInfrastructure()
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const generateInfrastructure = async () => {
    setIsAnalyzing(true)
    setView('analysis')
    
    const result = await analyzeInfrastructure(requirements)
    
    if (result.success) {
      const finalDiagram = result.diagram || generateDefaultDiagram()
      setAnalysis(result.analysis)
      setDiagram(finalDiagram)
      setCostEstimate(estimateCost(finalDiagram.nodes))
      
      // Generar template de CloudFormation automáticamente
      const cfTemplate = generateCloudFormationTemplate(finalDiagram, {
        projectName: requirements.appType || 'myapp',
        environment: 'dev',
        region: requirements.region
      })
      setCloudFormationTemplate(cfTemplate)
    }
    
    setIsAnalyzing(false)
  }

  const generateDefaultDiagram = () => {
    // Generar diagrama básico basado en requerimientos
    const nodes = [
      { id: 'users', type: 'user', label: 'Users', x: 50, y: 200, tier: 'frontend' },
      { id: 'cdn', type: 'cdn', label: 'CloudFront', x: 150, y: 200, tier: 'frontend' }
    ]

    if (requirements.deploymentType === 'serverless') {
      nodes.push(
        { id: 'api', type: 'api', label: 'API Gateway', x: 250, y: 200, tier: 'backend' },
        { id: 'lambda', type: 'lambda', label: 'Lambda', x: 350, y: 200, tier: 'backend' }
      )
    } else {
      nodes.push(
        { id: 'alb', type: 'alb', label: 'ALB', x: 250, y: 200, tier: 'backend' },
        { id: 'app', type: requirements.deploymentType === 'containers' ? 'ecs' : 'ec2', label: 'App Servers', x: 350, y: 200, tier: 'backend' }
      )
    }

    if (requirements.needsDatabase) {
      nodes.push({ id: 'db', type: 'rds', label: 'Database', x: 450, y: 200, tier: 'data' })
    }

    if (requirements.needsCache) {
      nodes.push({ id: 'cache', type: 'elasticache', label: 'Cache', x: 450, y: 100, tier: 'data' })
    }

    const connections = []
    for (let i = 0; i < nodes.length - 1; i++) {
      connections.push({
        from: nodes[i].id,
        to: nodes[i + 1].id,
        label: 'HTTPS',
        type: 'https'
      })
    }

    return { nodes, connections }
  }

  const handleRefine = async () => {
    if (!refinementPrompt.trim() || !diagram) return
    
    setIsRefining(true)
    const result = await refineInfrastructure(diagram, refinementPrompt)
    
    if (result.success) {
      setDiagram(result.diagram)
      setCostEstimate(estimateCost(result.diagram.nodes))
    }
    
    setIsRefining(false)
    setRefinementPrompt('')
  }

  const handleAddNode = () => {
    if (!diagram) return
    
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'ec2',
      label: 'New Node',
      x: 300,
      y: 300,
      tier: 'backend'
    }
    
    setDiagram(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }))
    setSelectedNode(newNode)
  }

  const handleDeleteNode = (nodeId) => {
    if (!diagram) return
    
    setDiagram(prev => ({
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      connections: prev.connections.filter(c => c.from !== nodeId && c.to !== nodeId)
    }))
    setSelectedNode(null)
  }

  const exportDiagram = () => {
    const dataStr = JSON.stringify(diagram, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `infrastructure-${requirements.appType}-${Date.now()}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const copyTerraform = () => {
    // Generar Terraform básico basado en diagrama
    const terraform = diagram.nodes.map(node => {
      switch (node.type) {
        case 'ec2':
          return `# ${node.label}
resource "aws_instance" "${node.id}" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.medium"
  tags = {
    Name = "${node.label}"
  }
}`
        case 'rds':
          return `# ${node.label}
resource "aws_db_instance" "${node.id}" {
  identifier = "${node.id}"
  engine     = "postgres"
  instance_class = "db.t3.micro"
  allocated_storage = 20
}`
        case 'alb':
          return `# ${node.label}
resource "aws_lb" "${node.id}" {
  name               = "${node.id}"
  internal           = false
  load_balancer_type = "application"
}`
        default:
          return `# ${node.type}: ${node.label}`
      }
    }).join('\n\n')
    
    navigator.clipboard.writeText(terraform)
    alert('Terraform copiado al portapapeles')
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(10, 15, 25, 0.98)',
      backdropFilter: 'blur(10px)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #2f80ed 0%, #8e44ad 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={22} color="white" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>Infrastructure Designer AI</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#8892a0' }}>
              {view === 'wizard' ? 'Paso ' + (step + 1) + ' de ' + WIZARD_STEPS.length : view === 'diagram' ? 'Diagrama interactivo' : 'Generando recomendación...'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {view === 'diagram' && (
            <>
              <button onClick={() => setShowCost(!showCost)} style={buttonStyle}>
                <DollarSign size={16} /> {showCost ? 'Ocultar costos' : 'Ver costos'}
              </button>
              <button onClick={() => setShowCloudFormation(!showCloudFormation)} style={buttonStyle}>
                <FileCode size={16} /> {showCloudFormation ? 'Ocultar CF' : 'CloudFormation'}
              </button>
              <button onClick={exportDiagram} style={buttonStyle}>
                <Download size={16} /> Exportar
              </button>
              <button onClick={copyTerraform} style={buttonStyle}>
                <Copy size={16} /> Terraform
              </button>
            </>
          )}
          <button onClick={onClose} style={{ ...buttonStyle, background: 'rgba(231, 76, 60, 0.2)' }}>
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Progress Bar - Solo en wizard */}
      {view === 'wizard' && (
        <div style={{ display: 'flex', padding: '16px 24px', gap: '8px', background: 'rgba(0,0,0,0.2)' }}>
          {WIZARD_STEPS.map((s, idx) => (
            <div
              key={s.id}
              onClick={() => idx <= step && setStep(idx)}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                background: idx === step ? 'rgba(47, 128, 237, 0.3)' : idx < step ? 'rgba(39, 174, 96, 0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${idx === step ? '#2f80ed' : idx < step ? '#27ae60' : 'rgba(255,255,255,0.1)'}`,
                cursor: idx <= step ? 'pointer' : 'default',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontSize: '0.75rem', color: idx <= step ? 'white' : '#8892a0', marginBottom: '4px' }}>
                {idx < step ? '✓' : idx + 1}. {s.title}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#8892a0' }}>{s.description}</div>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        {view === 'wizard' && renderWizardStep()}
        {view === 'analysis' && renderAnalysis()}
        {view === 'diagram' && renderDiagram()}
      </div>

      {/* Footer */}
      {view === 'wizard' && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
          <button
            onClick={handleBack}
            disabled={step === 0}
            style={{ ...buttonStyle, opacity: step === 0 ? 0.5 : 1 }}
          >
            <ArrowLeft size={18} /> Anterior
          </button>
          <button
            onClick={handleNext}
            style={{ ...buttonStyle, background: '#2f80ed' }}
          >
            {step === WIZARD_STEPS.length - 1 ? (
              <><Sparkles size={18} /> Generar Infraestructura</>
            ) : (
              <>Siguiente <ArrowRight size={18} /></>
            )}
          </button>
        </div>
      )}
    </div>
  )

  function renderWizardStep() {
    const currentStep = WIZARD_STEPS[step]

    switch (currentStep.id) {
      case 'basics':
        return (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h3 style={{ color: 'white', marginBottom: '24px' }}>¿Qué tipo de aplicación vas a construir?</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {APP_TYPES.map(type => {
                const Icon = type.icon
                const isSelected = requirements.appType === type.id
                return (
                  <button
                    key={type.id}
                    onClick={() => updateRequirement('appType', type.id)}
                    style={{
                      padding: '20px',
                      borderRadius: '12px',
                      border: `2px solid ${isSelected ? '#2f80ed' : 'rgba(255,255,255,0.1)'}`,
                      background: isSelected ? 'rgba(47, 128, 237, 0.2)' : 'rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: 'white',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Icon size={28} color={isSelected ? '#2f80ed' : '#8892a0'} style={{ marginBottom: '12px' }} />
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>{type.label}</div>
                    <div style={{ fontSize: '0.8rem', color: '#8892a0' }}>{type.description}</div>
                  </button>
                )
              })}
            </div>

            <div style={{ marginTop: '32px' }}>
              <label style={{ color: 'white', display: 'block', marginBottom: '8px' }}>Describe tu aplicación brevemente</label>
              <textarea
                value={requirements.description}
                onChange={(e) => updateRequirement('description', e.target.value)}
                placeholder="Ej: Una aplicación de e-commerce para venta de productos artesanales con pagos integrados..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontSize: '0.95rem',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>
        )

      case 'scale':
        return (
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h3 style={{ color: 'white', marginBottom: '24px' }}>¿Qué escala esperas?</h3>
            
            <div style={{ marginBottom: '32px' }}>
              <label style={{ color: 'white', display: 'block', marginBottom: '16px' }}>Usuarios concurrentes</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {CONCURRENT_USERS.map(u => {
                  const isSelected = requirements.concurrentUsers === u.value
                  return (
                    <button
                      key={u.value}
                      onClick={() => updateRequirement('concurrentUsers', u.value)}
                      style={{
                        padding: '16px 24px',
                        borderRadius: '8px',
                        border: `2px solid ${isSelected ? '#2f80ed' : 'rgba(255,255,255,0.1)'}`,
                        background: isSelected ? 'rgba(47, 128, 237, 0.2)' : 'rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                        color: 'white',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{u.label}</div>
                      <div style={{ fontSize: '0.75rem', color: '#8892a0', marginTop: '4px' }}>{u.description}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ color: 'white', display: 'block', marginBottom: '16px' }}>Picos de tráfico</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['Constante', 'Diario', 'Semanal', 'Estacional'].map(peak => {
                  const isSelected = requirements.trafficPeak === peak
                  return (
                    <button
                      key={peak}
                      onClick={() => updateRequirement('trafficPeak', peak)}
                      style={{
                        flex: 1,
                        padding: '14px',
                        borderRadius: '8px',
                        border: `2px solid ${isSelected ? '#2f80ed' : 'rgba(255,255,255,0.1)'}`,
                        background: isSelected ? 'rgba(47, 128, 237, 0.2)' : 'rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                        color: 'white'
                      }}
                    >
                      {peak}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )

      case 'tech':
        return (
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h3 style={{ color: 'white', marginBottom: '24px' }}>Stack tecnológico</h3>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ color: '#8892a0', display: 'block', marginBottom: '12px' }}>Tipo de despliegue</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {DEPLOYMENT_TYPES.map(d => {
                  const isSelected = requirements.deploymentType === d.id
                  return (
                    <button
                      key={d.id}
                      onClick={() => updateRequirement('deploymentType', d.id)}
                      style={{
                        padding: '16px',
                        borderRadius: '8px',
                        border: `2px solid ${isSelected ? '#2f80ed' : 'rgba(255,255,255,0.1)'}`,
                        background: isSelected ? 'rgba(47, 128, 237, 0.2)' : 'rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                        color: 'white',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{d.label}</div>
                      <div style={{ fontSize: '0.8rem', color: '#8892a0' }}>{d.description}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '32px' }}>
              <div style={{
                padding: '20px',
                borderRadius: '12px',
                border: `2px solid ${requirements.needsDatabase ? '#27ae60' : 'rgba(255,255,255,0.1)'}`,
                background: requirements.needsDatabase ? 'rgba(39, 174, 96, 0.1)' : 'rgba(255,255,255,0.05)',
                cursor: 'pointer'
              }} onClick={() => updateRequirement('needsDatabase', !requirements.needsDatabase)}>
                <Database size={24} color={requirements.needsDatabase ? '#27ae60' : '#8892a0'} />
                <div style={{ color: 'white', marginTop: '8px', fontWeight: 600 }}>Base de datos</div>
                {requirements.needsDatabase && (
                  <select
                    value={requirements.databaseType}
                    onChange={(e) => { e.stopPropagation(); updateRequirement('databaseType', e.target.value) }}
                    style={{
                      width: '100%',
                      marginTop: '8px',
                      padding: '6px',
                      borderRadius: '4px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(0,0,0,0.3)',
                      color: 'white'
                    }}
                  >
                    <option value="postgresql">PostgreSQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="mongodb">DocumentDB (Mongo)</option>
                    <option value="dynamodb">DynamoDB</option>
                  </select>
                )}
              </div>

              <div style={{
                padding: '20px',
                borderRadius: '12px',
                border: `2px solid ${requirements.needsCache ? '#e67e22' : 'rgba(255,255,255,0.1)'}`,
                background: requirements.needsCache ? 'rgba(230, 126, 34, 0.1)' : 'rgba(255,255,255,0.05)',
                cursor: 'pointer'
              }} onClick={() => updateRequirement('needsCache', !requirements.needsCache)}>
                <HardDrive size={24} color={requirements.needsCache ? '#e67e22' : '#8892a0'} />
                <div style={{ color: 'white', marginTop: '8px', fontWeight: 600 }}>Caché</div>
                <div style={{ fontSize: '0.75rem', color: '#8892a0', marginTop: '4px' }}>ElastiCache Redis/Memcached</div>
              </div>

              <div style={{
                padding: '20px',
                borderRadius: '12px',
                border: `2px solid ${requirements.needsQueue ? '#9b59b6' : 'rgba(255,255,255,0.1)'}`,
                background: requirements.needsQueue ? 'rgba(155, 89, 182, 0.1)' : 'rgba(255,255,255,0.05)',
                cursor: 'pointer'
              }} onClick={() => updateRequirement('needsQueue', !requirements.needsQueue)}>
                <MessageSquare size={24} color={requirements.needsQueue ? '#9b59b6' : '#8892a0'} />
                <div style={{ color: 'white', marginTop: '8px', fontWeight: 600 }}>Colas/Mensajería</div>
                <div style={{ fontSize: '0.75rem', color: '#8892a0', marginTop: '4px' }}>SQS, SNS, EventBridge</div>
              </div>
            </div>
          </div>
        )

      case 'constraints':
        return (
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h3 style={{ color: 'white', marginBottom: '24px' }}>Restricciones y presupuesto</h3>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ color: 'white', display: 'block', marginBottom: '16px' }}>Presupuesto mensual estimado</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {BUDGETS.map(b => {
                  const isSelected = requirements.budget === b.value
                  return (
                    <button
                      key={b.value}
                      onClick={() => updateRequirement('budget', b.value)}
                      style={{
                        padding: '14px 20px',
                        borderRadius: '8px',
                        border: `2px solid ${isSelected ? '#2f80ed' : 'rgba(255,255,255,0.1)'}`,
                        background: isSelected ? 'rgba(47, 128, 237, 0.2)' : 'rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                        color: 'white',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{b.label}</div>
                      <div style={{ fontSize: '0.7rem', color: '#8892a0' }}>{b.description}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <label style={{ color: '#8892a0', display: 'block', marginBottom: '8px' }}>Región AWS</label>
                <select
                  value={requirements.region}
                  onChange={(e) => updateRequirement('region', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white'
                  }}
                >
                  <option value="us-east-1">US East (N. Virginia)</option>
                  <option value="us-west-2">US West (Oregon)</option>
                  <option value="eu-west-1">EU (Ireland)</option>
                  <option value="eu-central-1">EU (Frankfurt)</option>
                  <option value="ap-south-1">Asia Pacific (Mumbai)</option>
                  <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                  <option value="sa-east-1">South America (São Paulo)</option>
                </select>
              </div>

              <div>
                <label style={{ color: '#8892a0', display: 'block', marginBottom: '8px' }}>Requisitos de latencia</label>
                <select
                  value={requirements.latency}
                  onChange={(e) => updateRequirement('latency', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white'
                  }}
                >
                  <option value="normal">Normal (&lt; 500ms)</option>
                  <option value="low">Baja (&lt; 200ms)</option>
                  <option value="critical">Crítica (&lt; 50ms) - Real-time</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <label style={{ color: '#8892a0', display: 'block', marginBottom: '8px' }}>Cumplimiento requerido</label>
              <select
                value={requirements.compliance}
                onChange={(e) => updateRequirement('compliance', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white'
                }}
              >
                <option value="none">Ninguno específico</option>
                <option value="hipaa">HIPAA (Salud)</option>
                <option value="pci">PCI DSS (Pagos)</option>
                <option value="soc2">SOC 2</option>
                <option value="gdpr">GDPR (UE)</option>
              </select>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  function renderAnalysis() {
    if (isAnalyzing) {
      return (
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <Loader2 size={60} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 24px' }} />
          <h3 style={{ color: 'white', marginBottom: '12px' }}>La IA está analizando tus requerimientos...</h3>
          <p style={{ color: '#8892a0' }}>Esto puede tomar 10-30 segundos</p>
        </div>
      )
    }

    return (
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(39, 174, 96, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Check size={32} color="#4ade80" />
          </div>
          <h3 style={{ color: 'white', marginBottom: '8px' }}>¡Análisis completo!</h3>
          <p style={{ color: '#8892a0' }}>Tu infraestructura recomendada está lista</p>
        </div>

        {costEstimate && (
          <div style={{
            background: 'rgba(47, 128, 237, 0.1)',
            border: '1px solid rgba(47, 128, 237, 0.3)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#8892a0', marginBottom: '4px' }}>Estimación de costos mensual</div>
                <div style={{ fontSize: '1.8rem', color: '#2f80ed', fontWeight: 700 }}>
                  ${costEstimate.range.min} - ${costEstimate.range.max}
                </div>
              </div>
              <button
                onClick={() => setView('diagram')}
                style={{
                  padding: '12px 24px',
                  background: '#2f80ed',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.95rem'
                }}
              >
                <Network size={18} /> Ver Diagrama
              </button>
            </div>
          </div>
        )}

        {analysis && (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '24px',
            whiteSpace: 'pre-wrap',
            color: '#e0e0e0',
            lineHeight: 1.6,
            fontSize: '0.9rem'
          }}>
            {analysis}
          </div>
        )}
      </div>
    )
  }

  function renderDiagram() {
    if (!diagram) return null

    return (
      <div style={{ display: 'flex', height: '100%', gap: '20px' }}>
        {/* Diagram Canvas */}
        <div style={{ flex: 1, position: 'relative', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', overflow: 'hidden' }}>
          <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 800 500">
            {/* Grid background */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Connections */}
            {diagram.connections.map((conn, idx) => {
              const fromNode = diagram.nodes.find(n => n.id === conn.from)
              const toNode = diagram.nodes.find(n => n.id === conn.to)
              if (!fromNode || !toNode) return null

              return (
                <g key={idx}>
                  <line
                    x1={fromNode.x + 40}
                    y1={fromNode.y + 20}
                    x2={toNode.x}
                    y2={toNode.y + 20}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="2"
                  />
                  <text
                    x={(fromNode.x + toNode.x) / 2 + 20}
                    y={(fromNode.y + toNode.y) / 2 + 15}
                    fill="#8892a0"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {conn.label}
                  </text>
                </g>
              )
            })}

            {/* Nodes */}
            {diagram.nodes.map(node => {
              const Icon = NODE_ICONS[node.type] || NODE_ICONS.default
              const color = NODE_COLORS[node.type] || NODE_COLORS.default
              const isSelected = selectedNode?.id === node.id

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNode(node)}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    width="80"
                    height="40"
                    rx="8"
                    fill={color + (isSelected ? 'FF' : '33')}
                    stroke={isSelected ? color : color + '66'}
                    strokeWidth={isSelected ? 3 : 1}
                  />
                  <foreignObject x="8" y="8" width="24" height="24">
                    <div style={{ color: 'white' }}>
                      <Icon size={20} />
                    </div>
                  </foreignObject>
                  <text
                    x="40"
                    y="24"
                    fill="white"
                    fontSize="10"
                    textAnchor="middle"
                    fontWeight={isSelected ? 600 : 400}
                  >
                    {node.label}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Floating toolbar */}
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            display: 'flex',
            gap: '8px'
          }}>
            <button onClick={handleAddNode} style={{ ...buttonStyle, padding: '8px 12px' }}>
              <Plus size={16} /> Agregar nodo
            </button>
            <button onClick={() => setEditMode(!editMode)} style={{ ...buttonStyle, padding: '8px 12px' }}>
              <Edit3 size={16} /> {editMode ? 'Ver' : 'Editar'}
            </button>
            {selectedNode && (
              <button onClick={() => handleDeleteNode(selectedNode.id)} style={{ ...buttonStyle, padding: '8px 12px', background: 'rgba(231, 76, 60, 0.3)' }}>
                <Trash2 size={16} /> Eliminar
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Refinement panel */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <h4 style={{ color: 'white', margin: '0 0 12px', fontSize: '0.95rem' }}>Refinar con IA</h4>
            <p style={{ color: '#8892a0', fontSize: '0.8rem', marginBottom: '12px' }}>
              Pide a la IA que modifique el diagrama. Ej: "Agrega un CDN" o "Cambia a serverless"
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={refinementPrompt}
                onChange={(e) => setRefinementPrompt(e.target.value)}
                placeholder="Ej: Agrega CloudFront..."
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(0,0,0,0.3)',
                  color: 'white',
                  fontSize: '0.85rem'
                }}
              />
              <button
                onClick={handleRefine}
                disabled={isRefining || !refinementPrompt.trim()}
                style={{
                  padding: '10px',
                  background: isRefining ? 'rgba(255,255,255,0.1)' : '#2f80ed',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: isRefining ? 'not-allowed' : 'pointer'
                }}
              >
                {isRefining ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={16} />}
              </button>
            </div>
          </div>

          {/* Node details */}
          {selectedNode && (
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <h4 style={{ color: 'white', margin: '0 0 12px', fontSize: '0.95rem' }}>{selectedNode.label}</h4>
              <div style={{ fontSize: '0.8rem', color: '#8892a0', marginBottom: '8px' }}>
                Tipo: {selectedNode.type}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#8892a0', marginBottom: '8px' }}>
                Tier: {selectedNode.tier}
              </div>
              {selectedNode.details && (
                <div style={{ fontSize: '0.8rem', color: '#e0e0e0', marginTop: '12px' }}>
                  {selectedNode.details}
                </div>
              )}
            </div>
          )}

          {/* Cost breakdown */}
          {showCost && costEstimate && (
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '16px',
              flex: 1,
              overflow: 'auto'
            }}>
              <h4 style={{ color: 'white', margin: '0 0 12px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={16} /> Estimación de Costos
              </h4>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.7rem', color: '#8892a0' }}>Total estimado</div>
                <div style={{ fontSize: '1.5rem', color: '#2f80ed', fontWeight: 700 }}>${costEstimate.total}/mes</div>
                <div style={{ fontSize: '0.7rem', color: '#8892a0' }}>Rango: ${costEstimate.range.min} - ${costEstimate.range.max}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {costEstimate.breakdown.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '6px'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'white' }}>{item.service}</div>
                      <div style={{ fontSize: '0.7rem', color: '#8892a0' }}>{item.details}</div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#4ade80' }}>${item.cost}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CloudFormation Template */}
          {showCloudFormation && cloudFormationTemplate && (
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '16px',
              flex: 1,
              overflow: 'auto',
              maxHeight: '500px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ color: 'white', margin: 0, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileCode size={16} /> CloudFormation
                </h4>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => setCfFormat('yaml')}
                    style={{
                      padding: '4px 8px',
                      background: cfFormat === 'yaml' ? '#e67e22' : 'rgba(255,255,255,0.1)',
                      border: 'none',
                      borderRadius: '4px',
                      color: 'white',
                      fontSize: '0.7rem',
                      cursor: 'pointer'
                    }}
                  >
                    YAML
                  </button>
                  <button
                    onClick={() => setCfFormat('json')}
                    style={{
                      padding: '4px 8px',
                      background: cfFormat === 'json' ? '#e67e22' : 'rgba(255,255,255,0.1)',
                      border: 'none',
                      borderRadius: '4px',
                      color: 'white',
                      fontSize: '0.7rem',
                      cursor: 'pointer'
                    }}
                  >
                    JSON
                  </button>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <button
                  onClick={() => {
                    const content = cfFormat === 'yaml' 
                      ? exportTemplateAsYAML(cloudFormationTemplate)
                      : exportTemplateAsJSON(cloudFormationTemplate)
                    navigator.clipboard.writeText(content)
                  }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Copy size={14} /> Copiar
                </button>
                <button
                  onClick={() => {
                    const content = cfFormat === 'yaml'
                      ? exportTemplateAsYAML(cloudFormationTemplate)
                      : exportTemplateAsJSON(cloudFormationTemplate)
                    const blob = new Blob([content], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `cloudformation-${requirements.appType || 'template'}.${cfFormat}`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#27ae60',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <Download size={14} /> Descargar
                </button>
              </div>

              <pre style={{
                background: 'rgba(0,0,0,0.5)',
                padding: '12px',
                borderRadius: '6px',
                overflow: 'auto',
                maxHeight: '300px',
                color: '#e67e22',
                fontSize: '0.75rem',
                lineHeight: 1.4
              }}>
                {cfFormat === 'yaml' 
                  ? exportTemplateAsYAML(cloudFormationTemplate)
                  : exportTemplateAsJSON(cloudFormationTemplate)}
              </pre>
            </div>
          )}
        </div>
      </div>
    )
  }
}

const buttonStyle = {
  padding: '10px 16px',
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '8px',
  color: 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '0.9rem',
  transition: 'all 0.2s'
}

export default InfrastructureDesigner
