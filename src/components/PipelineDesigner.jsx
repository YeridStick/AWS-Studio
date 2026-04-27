import { useState } from 'react'
import {
  GitBranch,
  Play,
  Shield,
  Check,
  Loader2,
  X,
  Copy,
  Download,
  Server,
  Cloud,
  Github,
  Gitlab,
  Terminal,
  ChevronRight,
  ChevronDown,
  Settings,
  Lock,
  Bell,
  RotateCcw,
  FileCode,
  ArrowRight,
  Save
} from 'lucide-react'
import { designPipeline, generateCodePipelineTemplate, generateGitHubActionsWorkflow, generateGitLabCI, PIPELINE_TEMPLATES } from '../services/pipelineService'

const PIPELINE_STEPS = [
  { id: 'config', title: 'Configuración', description: 'Stack y herramientas' },
  { id: 'stages', title: 'Etapas', description: 'Build, test, deploy' },
  { id: 'review', title: 'Revisión', description: 'Template generado' }
]

const REPO_TYPES = [
  { id: 'github', label: 'GitHub', icon: Github, description: 'GitHub Actions + Webhooks' },
  { id: 'gitlab', label: 'GitLab', icon: Gitlab, description: 'GitLab CI/CD nativo' },
  { id: 'codecommit', label: 'AWS CodeCommit', icon: Cloud, description: 'CodePipeline nativo' },
  { id: 'bitbucket', label: 'Bitbucket', icon: GitBranch, description: 'Bitbucket Pipelines' }
]

const TECH_STACKS = [
  { id: 'nodejs', label: 'Node.js', description: 'npm, jest, esbuild' },
  { id: 'python', label: 'Python', description: 'pip, pytest, docker' },
  { id: 'java', label: 'Java / Maven', description: 'maven, junit, jib' },
  { id: 'dotnet', label: '.NET Core', description: 'nuget, xunit, dotnet cli' },
  { id: 'go', label: 'Go', description: 'go modules, testing, ko' },
  { id: 'docker', label: 'Docker Multi-stage', description: 'Container-first approach' }
]

const DEPLOYMENT_STRATEGIES = [
  { id: 'rolling', label: 'Rolling Update', description: 'Reemplazo gradual de instancias' },
  { id: 'bluegreen', label: 'Blue/Green', description: 'Despliegue paralelo con switch' },
  { id: 'canary', label: 'Canary', description: 'Tráfico gradual al nuevo deploy' },
  { id: 'recreate', label: 'Recreate', description: 'Detener y recrear (downtime)' }
]

const TOOLS = {
  build: [
    { id: 'codebuild', label: 'AWS CodeBuild', provider: 'aws' },
    { id: 'github_actions', label: 'GitHub Actions', provider: 'github' },
    { id: 'gitlab_ci', label: 'GitLab CI', provider: 'gitlab' },
    { id: 'jenkins', label: 'Jenkins', provider: 'selfhosted' }
  ],
  deploy: [
    { id: 'codedeploy', label: 'AWS CodeDeploy', provider: 'aws' },
    { id: 'ecs_deploy', label: 'ECS Rolling Update', provider: 'aws' },
    { id: 'lambda_deploy', label: 'Lambda Update', provider: 'aws' },
    { id: 'argocd', label: 'ArgoCD (GitOps)', provider: 'kubernetes' }
  ],
  security: [
    { id: 'codeguru', label: 'CodeGuru Reviewer', provider: 'aws' },
    { id: 'secrets_manager', label: 'Secrets Manager', provider: 'aws' },
    { id: 'snyk', label: 'Snyk', provider: 'thirdparty' },
    { id: 'semgrep', label: 'Semgrep', provider: 'opensource' }
  ]
}

const ENVIRONMENTS = [
  { id: 'dev', label: 'Development', autoDeploy: true },
  { id: 'staging', label: 'Staging', autoDeploy: true },
  { id: 'prod', label: 'Production', autoDeploy: false, needsApproval: true }
]

function PipelineDesigner({ isOpen, onClose, infrastructure = null }) {
  const [step, setStep] = useState(0)
  const [isDesigning, setIsDesigning] = useState(false)
  const [pipelineConfig, setPipelineConfig] = useState(null)
  const [activeTab, setActiveTab] = useState('visual')
  const [expandedStage, setExpandedStage] = useState(null)

  const [config, setConfig] = useState({
    projectName: infrastructure?.projectName || 'my-app',
    repoType: 'github',
    techStack: 'nodejs',
    deploymentStrategy: 'rolling',
    environments: ['dev', 'staging', 'prod'],
    needsApprovals: true,
    needsFeatureFlags: false,
    selectedTools: {
      build: 'github_actions',
      deploy: 'ecs_deploy',
      security: 'semgrep'
    },
    runTests: true,
    runSecurityScan: true,
    notifyOnFailure: true,
    enableRollback: true
  })

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const updateTool = (category, toolId) => {
    setConfig(prev => ({
      ...prev,
      selectedTools: { ...prev.selectedTools, [category]: toolId }
    }))
  }

  const generatePipeline = async () => {
    setIsDesigning(true)
    
    const result = await designPipeline(
      infrastructure || { nodes: [], connections: [] },
      config
    )
    
    if (result.success) {
      // Parsear el resultado para extraer estructura
      const parsed = parsePipelineAnalysis(result.analysis, config)
      setPipelineConfig(parsed)
    }
    
    setIsDesigning(false)
    setStep(2) // Ir a revisión
  }

  const parsePipelineAnalysis = (analysis, userConfig) => {
    // Extraer secciones del análisis
    const stages = []
    const lines = analysis.split('\n')
    let currentStage = null

    lines.forEach(line => {
      const trimmed = line.trim()
      if (trimmed.match(/^\d+\./) || trimmed.startsWith('Stage')) {
        if (currentStage) stages.push(currentStage)
        currentStage = {
          name: trimmed.replace(/^\d+\.\s*/, '').replace(/:$/, ''),
          steps: [],
          tools: []
        }
      } else if (currentStage && trimmed.startsWith('-')) {
        currentStage.steps.push(trimmed.replace(/^-\s*/, ''))
      }
    })
    
    if (currentStage) stages.push(currentStage)

    // Generar templates según herramientas seleccionadas
    let template = null
    if (userConfig.selectedTools.build === 'github_actions') {
      template = generateGitHubActionsWorkflow({
        projectName: userConfig.projectName,
        deploymentType: 'ecs',
        needsDocker: true,
        region: 'us-east-1',
        ecrRepository: `${userConfig.projectName}-repo`
      })
    } else if (userConfig.selectedTools.build === 'codebuild') {
      template = generateCodePipelineTemplate({
        projectName: userConfig.projectName,
        repoType: userConfig.repoType,
        deploymentType: 'ecs',
        needsDocker: true
      })
    }

    return {
      stages: stages.length > 0 ? stages : generateDefaultStages(userConfig),
      analysis: analysis,
      template: template,
      config: userConfig
    }
  }

  const generateDefaultStages = (cfg) => [
    {
      name: 'Source',
      steps: [
        `Checkout from ${cfg.repoType}`,
        'Validate branch protection rules',
        'Scan for secrets (truffleHog)'
      ],
      tools: [cfg.repoType, 'trufflehog']
    },
    {
      name: 'Build',
      steps: [
        `Install dependencies (${cfg.techStack})`,
        'Run linting',
        'Compile/Bundle',
        cfg.runTests && 'Run unit tests',
        'Build Docker image',
        'Push to registry'
      ].filter(Boolean),
      tools: [cfg.selectedTools.build, 'docker']
    },
    {
      name: 'Security',
      steps: [
        cfg.runSecurityScan && 'SAST scan',
        'Dependency vulnerability check',
        'Container image scan (Trivy)',
        'Generate SBOM'
      ].filter(Boolean),
      tools: [cfg.selectedTools.security, 'trivy']
    },
    {
      name: 'Deploy Dev',
      steps: [
        'Update task definition',
        `Deploy to ECS (${cfg.deploymentStrategy})`,
        'Run smoke tests',
        'Notify team'
      ],
      tools: [cfg.selectedTools.deploy, 'aws']
    },
    {
      name: 'Deploy Staging',
      steps: [
        'Integration tests',
        'Performance tests',
        'E2E tests (Cypress)'
      ],
      tools: ['cypress', 'k6']
    },
    {
      name: 'Deploy Production',
      steps: [
        cfg.needsApprovals && 'Manual approval required',
        'Blue/Green deployment',
        'Traffic shift (10% → 50% → 100%)',
        'Rollback on failure'
      ].filter(Boolean),
      tools: [cfg.selectedTools.deploy, 'cloudwatch']
    }
  ]

  const copyTemplate = () => {
    if (!pipelineConfig?.template) return
    navigator.clipboard.writeText(
      typeof pipelineConfig.template === 'string' 
        ? pipelineConfig.template 
        : JSON.stringify(pipelineConfig.template, null, 2)
    )
  }

  const downloadTemplate = () => {
    if (!pipelineConfig?.template) return
    
    const content = typeof pipelineConfig.template === 'string'
      ? pipelineConfig.template
      : JSON.stringify(pipelineConfig.template, null, 2)
    
    const isYaml = typeof pipelineConfig.template === 'string'
    const extension = isYaml ? 'yml' : 'json'
    const filename = `pipeline-${config.selectedTools.build}.${extension}`
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
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
            background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <GitBranch size={22} color="white" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>Pipeline Designer AI</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#8892a0' }}>
              CI/CD acorde a tu infraestructura
            </p>
          </div>
        </div>

        <button onClick={onClose} style={closeButtonStyle}>
          <X size={20} />
        </button>
      </div>

      {/* Progress */}
      <div style={{
        display: 'flex',
        padding: '16px 24px',
        gap: '8px',
        background: 'rgba(0,0,0,0.2)'
      }}>
        {PIPELINE_STEPS.map((s, idx) => (
          <div
            key={s.id}
            onClick={() => idx < step && setStep(idx)}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              background: idx === step ? 'rgba(231, 76, 60, 0.3)' : idx < step ? 'rgba(39, 174, 96, 0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${idx === step ? '#e74c3c' : idx < step ? '#27ae60' : 'rgba(255,255,255,0.1)'}`,
              cursor: idx <= step ? 'pointer' : 'default'
            }}
          >
            <div style={{ fontSize: '0.75rem', color: idx <= step ? 'white' : '#8892a0' }}>
              {idx < step ? '✓' : idx + 1}. {s.title}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#8892a0' }}>{s.description}</div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        {step === 0 && renderConfigStep()}
        {step === 1 && renderStagesStep()}
        {step === 2 && renderReviewStep()}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '20px 24px',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <button
          onClick={() => setStep(step - 1)}
          disabled={step === 0}
          style={{ ...buttonStyle, opacity: step === 0 ? 0.5 : 1 }}
        >
          <ChevronRight style={{ transform: 'rotate(180deg)' }} size={18} /> Anterior
        </button>
        
        {step < 2 ? (
          <button onClick={() => step === 1 ? generatePipeline() : setStep(step + 1)} style={{ ...buttonStyle, background: '#e74c3c' }}>
            {step === 1 ? (
              <><Play size={18} /> Generar Pipeline</>
            ) : (
              <>Siguiente <ChevronRight size={18} /></>
            )}
          </button>
        ) : (
          <button onClick={downloadTemplate} style={{ ...buttonStyle, background: '#27ae60' }}>
            <Download size={18} /> Descargar Template
          </button>
        )}
      </div>
    </div>
  )

  function renderConfigStep() {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h3 style={{ color: 'white', marginBottom: '24px' }}>Configuración del proyecto</h3>

        {/* Project Name */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: 'white', display: 'block', marginBottom: '8px' }}>Nombre del proyecto</label>
          <input
            type="text"
            value={config.projectName}
            onChange={(e) => updateConfig('projectName', e.target.value)}
            placeholder="my-awesome-app"
            style={inputStyle}
          />
        </div>

        {/* Repo Type */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: '#8892a0', display: 'block', marginBottom: '12px' }}>Repositorio</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {REPO_TYPES.map(repo => {
              const Icon = repo.icon
              const isSelected = config.repoType === repo.id
              return (
                <button
                  key={repo.id}
                  onClick={() => updateConfig('repoType', repo.id)}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: `2px solid ${isSelected ? '#e74c3c' : 'rgba(255,255,255,0.1)'}`,
                    background: isSelected ? 'rgba(231, 76, 60, 0.2)' : 'rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    color: 'white',
                    textAlign: 'left'
                  }}
                >
                  <Icon size={24} style={{ marginBottom: '8px' }} />
                  <div style={{ fontWeight: 600 }}>{repo.label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#8892a0' }}>{repo.description}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tech Stack */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: '#8892a0', display: 'block', marginBottom: '12px' }}>Stack tecnológico</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {TECH_STACKS.map(stack => {
              const isSelected = config.techStack === stack.id
              return (
                <button
                  key={stack.id}
                  onClick={() => updateConfig('techStack', stack.id)}
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    border: `2px solid ${isSelected ? '#e74c3c' : 'rgba(255,255,255,0.1)'}`,
                    background: isSelected ? 'rgba(231, 76, 60, 0.2)' : 'rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    color: 'white',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{stack.label}</div>
                  <div style={{ fontSize: '0.7rem', color: '#8892a0' }}>{stack.description}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Deployment Strategy */}
        <div>
          <label style={{ color: '#8892a0', display: 'block', marginBottom: '12px' }}>Estrategia de despliegue</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {DEPLOYMENT_STRATEGIES.map(strategy => {
              const isSelected = config.deploymentStrategy === strategy.id
              return (
                <button
                  key={strategy.id}
                  onClick={() => updateConfig('deploymentStrategy', strategy.id)}
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    border: `2px solid ${isSelected ? '#e74c3c' : 'rgba(255,255,255,0.1)'}`,
                    background: isSelected ? 'rgba(231, 76, 60, 0.2)' : 'rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    color: 'white',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{strategy.label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#8892a0' }}>{strategy.description}</div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  function renderStagesStep() {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h3 style={{ color: 'white', marginBottom: '24px' }}>Herramientas y etapas</h3>

        {/* Build Tool */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: '#8892a0', display: 'block', marginBottom: '12px' }}>Build & CI</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {TOOLS.build.map(tool => {
              const isSelected = config.selectedTools.build === tool.id
              return (
                <button
                  key={tool.id}
                  onClick={() => updateTool('build', tool.id)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '8px',
                    border: `2px solid ${isSelected ? '#e74c3c' : 'rgba(255,255,255,0.1)'}`,
                    background: isSelected ? 'rgba(231, 76, 60, 0.2)' : 'rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    color: 'white',
                    textAlign: 'center'
                  }}
                >
                  <Terminal size={20} style={{ marginBottom: '6px' }} />
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{tool.label}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Deploy Tool */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: '#8892a0', display: 'block', marginBottom: '12px' }}>Deploy & CD</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {TOOLS.deploy.map(tool => {
              const isSelected = config.selectedTools.deploy === tool.id
              return (
                <button
                  key={tool.id}
                  onClick={() => updateTool('deploy', tool.id)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '8px',
                    border: `2px solid ${isSelected ? '#e74c3c' : 'rgba(255,255,255,0.1)'}`,
                    background: isSelected ? 'rgba(231, 76, 60, 0.2)' : 'rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    color: 'white',
                    textAlign: 'center'
                  }}
                >
                  <Cloud size={20} style={{ marginBottom: '6px' }} />
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{tool.label}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Security Tool */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: '#8892a0', display: 'block', marginBottom: '12px' }}>Seguridad</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {TOOLS.security.map(tool => {
              const isSelected = config.selectedTools.security === tool.id
              return (
                <button
                  key={tool.id}
                  onClick={() => updateTool('security', tool.id)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '8px',
                    border: `2px solid ${isSelected ? '#e74c3c' : 'rgba(255,255,255,0.1)'}`,
                    background: isSelected ? 'rgba(231, 76, 60, 0.2)' : 'rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    color: 'white',
                    textAlign: 'center'
                  }}
                >
                  <Shield size={20} style={{ marginBottom: '6px' }} />
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{tool.label}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Options */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <label style={{
            padding: '16px',
            borderRadius: '8px',
            border: `2px solid ${config.needsApprovals ? '#27ae60' : 'rgba(255,255,255,0.1)'}`,
            background: config.needsApprovals ? 'rgba(39, 174, 96, 0.1)' : 'rgba(255,255,255,0.05)',
            cursor: 'pointer',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <input
              type="checkbox"
              checked={config.needsApprovals}
              onChange={(e) => updateConfig('needsApprovals', e.target.checked)}
              style={{ display: 'none' }}
            />
            <Lock size={20} color={config.needsApprovals ? '#27ae60' : '#8892a0'} />
            <span>Aprobación manual para producción</span>
          </label>

          <label style={{
            padding: '16px',
            borderRadius: '8px',
            border: `2px solid ${config.enableRollback ? '#27ae60' : 'rgba(255,255,255,0.1)'}`,
            background: config.enableRollback ? 'rgba(39, 174, 96, 0.1)' : 'rgba(255,255,255,0.05)',
            cursor: 'pointer',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <input
              type="checkbox"
              checked={config.enableRollback}
              onChange={(e) => updateConfig('enableRollback', e.target.checked)}
              style={{ display: 'none' }}
            />
            <RotateCcw size={20} color={config.enableRollback ? '#27ae60' : '#8892a0'} />
            <span>Rollback automático</span>
          </label>

          <label style={{
            padding: '16px',
            borderRadius: '8px',
            border: `2px solid ${config.runSecurityScan ? '#27ae60' : 'rgba(255,255,255,0.1)'}`,
            background: config.runSecurityScan ? 'rgba(39, 174, 96, 0.1)' : 'rgba(255,255,255,0.05)',
            cursor: 'pointer',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <input
              type="checkbox"
              checked={config.runSecurityScan}
              onChange={(e) => updateConfig('runSecurityScan', e.target.checked)}
              style={{ display: 'none' }}
            />
            <Shield size={20} color={config.runSecurityScan ? '#27ae60' : '#8892a0'} />
            <span>Security scan en pipeline</span>
          </label>

          <label style={{
            padding: '16px',
            borderRadius: '8px',
            border: `2px solid ${config.notifyOnFailure ? '#27ae60' : 'rgba(255,255,255,0.1)'}`,
            background: config.notifyOnFailure ? 'rgba(39, 174, 96, 0.1)' : 'rgba(255,255,255,0.05)',
            cursor: 'pointer',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <input
              type="checkbox"
              checked={config.notifyOnFailure}
              onChange={(e) => updateConfig('notifyOnFailure', e.target.checked)}
              style={{ display: 'none' }}
            />
            <Bell size={20} color={config.notifyOnFailure ? '#27ae60' : '#8892a0'} />
            <span>Notificar en fallos</span>
          </label>
        </div>
      </div>
    )
  }

  function renderReviewStep() {
    if (isDesigning) {
      return (
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <Loader2 size={60} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 24px' }} />
          <h3 style={{ color: 'white', marginBottom: '12px' }}>La IA está diseñando tu pipeline...</h3>
          <p style={{ color: '#8892a0' }}>Generando configuración óptima para tu stack</p>
        </div>
      )
    }

    if (!pipelineConfig) {
      return (
        <div style={{ textAlign: 'center', padding: '100px 20px', color: '#8892a0' }}>
          Error generando el pipeline. Intenta nuevamente.
        </div>
      )
    }

    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {['visual', 'yaml', 'analysis'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === tab ? '#e74c3c' : 'rgba(255,255,255,0.1)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              {tab === 'visual' && 'Diagrama'}
              {tab === 'yaml' && 'Template'}
              {tab === 'analysis' && 'Análisis'}
            </button>
          ))}
        </div>

        {activeTab === 'visual' && (
          <div>
            <h4 style={{ color: 'white', marginBottom: '16px' }}>Etapas del Pipeline</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pipelineConfig.stages.map((stage, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '10px',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    onClick={() => setExpandedStage(expandedStage === idx ? null : idx)}
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: `hsl(${idx * 60}, 70%, 50%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{idx + 1}</span>
                    </div>
                    <span style={{ color: 'white', fontWeight: 600, flex: 1 }}>{stage.name}</span>
                    {expandedStage === idx ? <ChevronDown size={18} color="#8892a0" /> : <ChevronRight size={18} color="#8892a0" />}
                  </div>
                  
                  {expandedStage === idx && (
                    <div style={{ padding: '0 20px 20px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                        {stage.tools.map((tool, tidx) => (
                          <span key={tidx} style={{
                            padding: '4px 10px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            color: '#8892a0'
                          }}>
                            {tool}
                          </span>
                        ))}
                      </div>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                        {stage.steps.map((step, sidx) => (
                          <li key={sidx} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 0',
                            color: '#c0c0c0',
                            fontSize: '0.9rem'
                          }}>
                            <Check size={14} color="#27ae60" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'yaml' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ color: 'white', margin: 0 }}>Template {config.selectedTools.build === 'github_actions' ? 'YAML' : 'JSON'}</h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={copyTemplate} style={smallButtonStyle}>
                  <Copy size={14} /> Copiar
                </button>
                <button onClick={downloadTemplate} style={smallButtonStyle}>
                  <Download size={14} /> Descargar
                </button>
              </div>
            </div>
            <pre style={{
              background: 'rgba(0,0,0,0.5)',
              padding: '20px',
              borderRadius: '8px',
              overflow: 'auto',
              maxHeight: '500px',
              color: '#4ade80',
              fontSize: '0.8rem',
              lineHeight: 1.5
            }}>
              {typeof pipelineConfig.template === 'string'
                ? pipelineConfig.template
                : JSON.stringify(pipelineConfig.template, null, 2)}
            </pre>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div>
            <h4 style={{ color: 'white', marginBottom: '16px' }}>Análisis de la IA</h4>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              padding: '20px',
              whiteSpace: 'pre-wrap',
              color: '#e0e0e0',
              lineHeight: 1.6,
              fontSize: '0.9rem'
            }}>
              {pipelineConfig.analysis}
            </div>
          </div>
        )}
      </div>
    )
  }
}

const buttonStyle = {
  padding: '10px 20px',
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '8px',
  color: 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '0.95rem'
}

const smallButtonStyle = {
  padding: '8px 12px',
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '6px',
  color: 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '0.8rem'
}

const closeButtonStyle = {
  padding: '10px',
  background: 'rgba(231, 76, 60, 0.2)',
  border: '1px solid rgba(231, 76, 60, 0.3)',
  borderRadius: '8px',
  color: 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center'
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.2)',
  background: 'rgba(255,255,255,0.05)',
  color: 'white',
  fontSize: '0.95rem'
}

export default PipelineDesigner
