import { useState } from 'react'
import {
  Workflow,
  ArrowRight,
  Cloud,
  Server,
  Network,
  Shield,
  Container,
  Database,
  Globe
} from 'lucide-react'

const diagramTypes = [
  { id: 'request-flow', label: 'Flujo de Request' },
  { id: 'vpc-architecture', label: 'Arquitectura VPC' },
  { id: 'deployment', label: 'CI/CD Pipeline' },
  { id: 'multi-tier', label: 'Multi-Tier App' },
  { id: 'hybrid', label: 'Cloud Híbrido' },
  { id: 'microservices', label: 'Microservicios' }
]

function Diagrams() {
  const [activeTab, setActiveTab] = useState('request-flow')

  const renderDiagram = () => {
    switch (activeTab) {
      case 'request-flow':
        return <RequestFlowDiagram />
      case 'vpc-architecture':
        return <VPCArchitectureDiagram />
      case 'deployment':
        return <DeploymentDiagram />
      case 'multi-tier':
        return <MultiTierDiagram />
      case 'hybrid':
        return <HybridCloudDiagram />
      case 'microservices':
        return <MicroservicesDiagram />
      default:
        return <RequestFlowDiagram />
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Diagramas y Flujos de Arquitectura</h1>
        <p className="page-description">
          Visualiza patrones de arquitectura AWS comunes. Cada diagrama representa
          escenarios reales de producción con sus componentes y interacciones.
        </p>
      </div>

      <div className="tabs">
        {diagramTypes.map((type) => (
          <button
            key={type.id}
            className={`tab ${activeTab === type.id ? 'active' : ''}`}
            onClick={() => setActiveTab(type.id)}
          >
            {type.label}
          </button>
        ))}
      </div>

      <div className="diagram-container" style={{ minHeight: '500px' }}>
        {renderDiagram()}
      </div>

      <div className="note" style={{ marginTop: '24px' }}>
        <strong>Nota:</strong> Estos diagramas representan arquitecturas de referencia.
        Adapta cada patrón según tus requisitos específicos de seguridad, escalabilidad
        y cumplimiento.
      </div>
    </div>
  )
}

function RequestFlowDiagram() {
  return (
    <div>
      <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>
        <ArrowRight size={20} style={{ display: 'inline', marginRight: '8px' }} />
        Flujo Completo de Request: Cliente → API Gateway → EKS
      </h3>

      <div className="diagram-legend">
        <div className="legend-item" style={{ background: 'rgba(255, 153, 0, 0.2)', color: '#ff9900' }}>
          <div className="legend-color" style={{ background: '#ff9900' }} />
          AWS Services
        </div>
        <div className="legend-item" style={{ background: 'rgba(39, 174, 96, 0.2)', color: '#27ae60' }}>
          <div className="legend-color" style={{ background: '#27ae60' }} />
          Networking
        </div>
        <div className="legend-item" style={{ background: 'rgba(142, 68, 173, 0.2)', color: '#8e44ad' }}>
          <div className="legend-color" style={{ background: '#8e44ad' }} />
          Kubernetes
        </div>
        <div className="legend-item" style={{ background: 'rgba(242, 153, 74, 0.2)', color: '#f2994a' }}>
          <div className="legend-color" style={{ background: '#f2994a' }} />
          Load Balancer
        </div>
        <div className="legend-item" style={{ background: 'rgba(235, 87, 87, 0.2)', color: '#eb5757' }}>
          <div className="legend-color" style={{ background: '#eb5757' }} />
          Seguridad
        </div>
      </div>

      <div className="flow-diagram">
        <div className="flow-node node-aws">
          <div className="flow-node-title">
            <Globe size={18} style={{ display: 'inline', marginRight: '8px' }} />
            Cliente (Web/Mobile/Postman)
          </div>
          <div className="flow-node-desc">HTTPS request público desde internet</div>
        </div>

        <div className="flow-arrow" />

        <div className="flow-node node-aws">
          <div className="flow-node-title">
            <Cloud size={18} style={{ display: 'inline', marginRight: '8px' }} />
            API Gateway (HTTP API)
          </div>
          <div className="flow-node-desc">Autorización, throttling, routing por stage</div>
        </div>

        <div className="flow-arrow" />

        <div className="flow-node node-network">
          <div className="flow-node-title">
            <Network size={18} style={{ display: 'inline', marginRight: '8px' }} />
            VPC Link
          </div>
          <div className="flow-node-desc">Canal privado hacia VPC sin exponer backend</div>
        </div>

        <div className="flow-arrow" />

        <div className="flow-node node-lb">
          <div className="flow-node-title">
            <Workflow size={18} style={{ display: 'inline', marginRight: '8px' }} />
            Network Load Balancer (interno)
          </div>
          <div className="flow-node-desc">Forward TCP al Target Group</div>
        </div>

        <div className="flow-arrow" />

        <div className="flow-node node-security">
          <div className="flow-node-title">
            <Shield size={18} style={{ display: 'inline', marginRight: '8px' }} />
            Security Groups + NACL
          </div>
          <div className="flow-node-desc">Control de tráfico permitido (puertos/rangos)</div>
        </div>

        <div className="flow-arrow" />

        <div className="flow-node node-k8s">
          <div className="flow-node-title">
            <Server size={18} style={{ display: 'inline', marginRight: '8px' }} />
            EKS Worker Node (EC2)
          </div>
          <div className="flow-node-desc">Recibe NodePort y reenvía al Pod</div>
        </div>

        <div className="flow-arrow" />

        <div className="flow-node node-k8s">
          <div className="flow-node-title">
            <Container size={18} style={{ display: 'inline', marginRight: '8px' }} />
            Pod (Deployment app-service)
          </div>
          <div className="flow-node-desc">Contenedor backend expone :8080</div>
        </div>
      </div>

      <div className="note note-info" style={{ marginTop: '32px' }}>
        <strong>Decisión técnica:</strong> API Gateway desacopla la capa pública; VPC Link + NLB
        evita publicar nodos/pods directamente. Este patrón reduce la superficie de ataque y
        centraliza políticas de entrada.
      </div>
    </div>
  )
}

function VPCArchitectureDiagram() {
  return (
    <div>
      <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>
        <Network size={20} style={{ display: 'inline', marginRight: '8px' }} />
        Arquitectura de VPC Multi-AZ
      </h3>

      <div className="diagram-legend">
        <div className="legend-item" style={{ background: 'rgba(39, 174, 96, 0.2)', color: '#27ae60' }}>
          <div className="legend-color" style={{ background: '#27ae60' }} />
          VPC CIDR 10.0.0.0/16
        </div>
        <div className="legend-item" style={{ background: 'rgba(142, 68, 173, 0.2)', color: '#8e44ad' }}>
          <div className="legend-color" style={{ background: '#8e44ad' }} />
          Private Subnets
        </div>
        <div className="legend-item" style={{ background: 'rgba(47, 128, 237, 0.2)', color: '#2f80ed' }}>
          <div className="legend-color" style={{ background: '#2f80ed' }} />
          Public Subnets
        </div>
      </div>

      <div className="vpc-box">
        <div className="vpc-header">VPC: 10.0.0.0/16 (us-east-1)</div>

        <div className="subnet-row">
          <div className="subnet-box">
            <div className="subnet-title">AZ: us-east-1a</div>
            <div className="mini-stack">
              <div
                className="mini-node"
                style={{
                  background: 'rgba(47, 128, 237, 0.15)',
                  borderColor: 'rgba(47, 128, 237, 0.4)'
                }}
              >
                <strong>Public Subnet</strong>
                <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                  10.0.1.0/24
                  <br />
                  ALB + NAT Gateway + Bastion
                </div>
              </div>
              <div
                className="mini-node"
                style={{
                  background: 'rgba(142, 68, 173, 0.15)',
                  borderColor: 'rgba(142, 68, 173, 0.4)'
                }}
              >
                <strong>Private Subnet App</strong>
                <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                  10.0.2.0/24
                  <br />
                  EKS Nodes + Pods
                </div>
              </div>
              <div
                className="mini-node"
                style={{
                  background: 'rgba(155, 89, 182, 0.15)',
                  borderColor: 'rgba(155, 89, 182, 0.4)'
                }}
              >
                <strong>Private Subnet Data</strong>
                <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                  10.0.3.0/24
                  <br />
                  RDS + ElastiCache
                </div>
              </div>
            </div>
          </div>

          <div className="subnet-box">
            <div className="subnet-title">AZ: us-east-1b</div>
            <div className="mini-stack">
              <div
                className="mini-node"
                style={{
                  background: 'rgba(47, 128, 237, 0.15)',
                  borderColor: 'rgba(47, 128, 237, 0.4)'
                }}
              >
                <strong>Public Subnet</strong>
                <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                  10.0.4.0/24
                  <br />
                  ALB + NAT Gateway + Bastion
                </div>
              </div>
              <div
                className="mini-node"
                style={{
                  background: 'rgba(142, 68, 173, 0.15)',
                  borderColor: 'rgba(142, 68, 173, 0.4)'
                }}
              >
                <strong>Private Subnet App</strong>
                <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                  10.0.5.0/24
                  <br />
                  EKS Nodes + Pods
                </div>
              </div>
              <div
                className="mini-node"
                style={{
                  background: 'rgba(155, 89, 182, 0.15)',
                  borderColor: 'rgba(155, 89, 182, 0.4)'
                }}
              >
                <strong>Private Subnet Data</strong>
                <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                  10.0.6.0/24
                  <br />
                  RDS + ElastiCache
                </div>
              </div>
            </div>
          </div>

          <div className="subnet-box">
            <div className="subnet-title">AZ: us-east-1c</div>
            <div className="mini-stack">
              <div
                className="mini-node"
                style={{
                  background: 'rgba(47, 128, 237, 0.15)',
                  borderColor: 'rgba(47, 128, 237, 0.4)'
                }}
              >
                <strong>Public Subnet</strong>
                <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                  10.0.7.0/24
                  <br />
                  ALB + NAT Gateway
                </div>
              </div>
              <div
                className="mini-node"
                style={{
                  background: 'rgba(142, 68, 173, 0.15)',
                  borderColor: 'rgba(142, 68, 173, 0.4)'
                }}
              >
                <strong>Private Subnet App</strong>
                <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                  10.0.8.0/24
                  <br />
                  EKS Nodes + Pods
                </div>
              </div>
              <div
                className="mini-node"
                style={{
                  background: 'rgba(155, 89, 182, 0.15)',
                  borderColor: 'rgba(155, 89, 182, 0.4)'
                }}
              >
                <strong>Private Subnet Data</strong>
                <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                  10.0.9.0/24
                  <br />
                  RDS Standby
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <h4 style={{ marginBottom: '16px' }}>Componentes de Conectividad</h4>
        <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          <div className="card">
            <div className="card-header">
              <Globe size={20} style={{ color: '#2f80ed' }} />
              <span className="card-title">Internet Gateway</span>
            </div>
            <p className="card-content">Conectividad pública para subnets públicas. Punto de entrada/salida a internet.</p>
          </div>
          <div className="card">
            <div className="card-header">
              <Network size={20} style={{ color: '#27ae60' }} />
              <span className="card-title">NAT Gateway</span>
            </div>
            <p className="card-content">Permite que recursos en subnets privadas accedan a internet sin exponer IPs privadas.</p>
          </div>
          <div className="card">
            <div className="card-header">
              <Shield size={20} style={{ color: '#eb5757' }} />
              <span className="card-title">Security Groups</span>
            </div>
            <p className="card-content">Firewall a nivel de instancia. Control de tráfico inbound/outbound.</p>
          </div>
          <div className="card">
            <div className="card-header">
              <Network size={20} style={{ color: '#f2994a' }} />
              <span className="card-title">NACLs</span>
            </div>
            <p className="card-content">Network ACLs a nivel de subnet. Control de tráfico stateless.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function DeploymentDiagram() {
  return (
    <div>
      <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>
        <Cloud size={20} style={{ display: 'inline', marginRight: '8px' }} />
        Pipeline CI/CD: Desarrollo a Producción
      </h3>

      <div className="flow-diagram">
        <div className="flow-node node-aws">
          <div className="flow-node-title">Developer Push</div>
          <div className="flow-node-desc">Git commit a main branch</div>
        </div>

        <div className="flow-arrow" />

        <div className="flow-node node-serverless">
          <div className="flow-node-title">AWS CodePipeline / GitHub Actions</div>
          <div className="flow-node-desc">Trigger de pipeline de CI/CD</div>
        </div>

        <div className="flow-arrow" />

        <div className="flow-node node-compute">
          <div className="flow-node-title">Build & Test</div>
          <div className="flow-node-desc">CodeBuild · Unit tests · Lint · Security scan</div>
        </div>

        <div className="flow-arrow" />

        <div className="flow-node node-storage">
          <div className="flow-node-title">Amazon ECR</div>
          <div className="flow-node-desc">Push de imagen Docker versionada</div>
        </div>

        <div className="flow-arrow" />

        <div className="flow-node node-k8s">
          <div className="flow-node-title">EKS Deployment</div>
          <div className="flow-node-desc">kubectl apply / Helm upgrade</div>
        </div>

        <div className="flow-arrow" />

        <div className="flow-node node-lb">
          <div className="flow-node-title">Health Checks</div>
          <div className="flow-node-desc">NLB target verification · Rolling update</div>
        </div>

        <div className="flow-arrow" />

        <div className="flow-node node-aws">
          <div className="flow-node-title">Production</div>
          <div className="flow-node-desc">Traffic 100% · Monitoring activo</div>
        </div>
      </div>

      <div style={{ marginTop: '32px' }}>
        <h4 style={{ marginBottom: '16px' }}>Estrategias de Despliegue</h4>
        <div className="card-grid">
          <div className="card">
            <div className="card-title" style={{ marginBottom: '8px' }}>Rolling Update</div>
            <p className="card-content">
              Reemplaza gradualmente pods antiguos con nuevos. Mínimo downtime,
              ideal para cambios pequeños.
            </p>
          </div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: '8px' }}>Blue/Green</div>
            <p className="card-content">
              Dos entornos idénticos. Switch instantáneo con rollback rápido.
              Requiere doble infraestructura.
            </p>
          </div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: '8px' }}>Canary</div>
            <p className="card-content">
              Despliega a pequeño porcentaje de usuarios. Monitorea métricas
              antes de roll-out completo.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function MultiTierDiagram() {
  return (
    <div>
      <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>
        <Server size={20} style={{ display: 'inline', marginRight: '8px' }} />
        Arquitectura Three-Tier Clásica
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="flow-node node-aws" style={{ maxWidth: '100%' }}>
          <div className="flow-node-title">
            <Globe size={18} style={{ display: 'inline', marginRight: '8px' }} />
            Presentation Tier
          </div>
          <div className="flow-node-desc">
            CloudFront · S3 Static Website · React/Vue/Angular · Route 53
          </div>
        </div>

        <div className="flow-arrow" />

        <div className="flow-node node-lb" style={{ maxWidth: '100%' }}>
          <div className="flow-node-title">
            <Workflow size={18} style={{ display: 'inline', marginRight: '8px' }} />
            Application Tier
          </div>
          <div className="flow-node-desc">
            ALB · EC2 Auto Scaling · ECS/EKS · Lambda · API Gateway
          </div>
        </div>

        <div className="flow-arrow" />

        <div className="flow-node node-database" style={{ maxWidth: '100%' }}>
          <div className="flow-node-title">
            <Database size={18} style={{ display: 'inline', marginRight: '8px' }} />
            Data Tier
          </div>
          <div className="flow-node-desc">
            RDS (MySQL/PostgreSQL) · DynamoDB · ElastiCache · S3 · Redshift
          </div>
        </div>
      </div>

      <div className="note note-info" style={{ marginTop: '24px' }}>
        <strong>Three-Tier Architecture:</strong> Patrón clásico que separa concerns
        en capas independientes. Cada tier puede escalarse según demanda específica.
        La capa de aplicación nunca se comunica directamente con la capa de presentación.
      </div>
    </div>
  )
}

function HybridCloudDiagram() {
  return (
    <div>
      <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>
        <Network size={20} style={{ display: 'inline', marginRight: '8px' }} />
        Arquitectura Cloud Híbrido
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: '20px',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            padding: '24px',
            background: 'rgba(47, 128, 237, 0.1)',
            border: '1px solid rgba(47, 128, 237, 0.3)',
            borderRadius: '12px'
          }}
        >
          <h4 style={{ marginBottom: '16px', color: '#2f80ed' }}>
            <Server size={18} style={{ display: 'inline', marginRight: '8px' }} />
            On-Premises Data Center
          </h4>
          <ul className="styled-list">
            <li>Legacy applications</li>
            <li>Database corporativa</li>
            <li>Active Directory</li>
            <li>VPN/ Direct Connect</li>
          </ul>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              padding: '16px',
              background: 'rgba(39, 174, 96, 0.15)',
              border: '1px solid rgba(39, 174, 96, 0.4)',
              borderRadius: '12px',
              fontSize: '0.9rem'
            }}
          >
            <Network size={24} style={{ marginBottom: '8px', color: '#27ae60' }} />
            <div><strong>AWS Direct Connect</strong></div>
            <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
              1Gbps - 10Gbps
              <br />
              Latencia baja
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '24px',
            background: 'rgba(255, 153, 0, 0.1)',
            border: '1px solid rgba(255, 153, 0, 0.3)',
            borderRadius: '12px'
          }}
        >
          <h4 style={{ marginBottom: '16px', color: '#ff9900' }}>
            <Cloud size={18} style={{ display: 'inline', marginRight: '8px' }} />
            AWS Cloud
          </h4>
          <ul className="styled-list">
            <li>Auto-scaling workloads</li>
            <li>Disaster recovery</li>
            <li>Dev/Test environments</li>
            <li>AI/ML services</li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <h4 style={{ marginBottom: '16px' }}>Componentes de Conectividad Híbrida</h4>
        <div className="card-grid">
          <div className="card">
            <div className="card-title" style={{ marginBottom: '8px' }}>AWS Direct Connect</div>
            <p className="card-content">
              Conexión dedicada de red privada desde on-premises a AWS.
              Reduce costos de transferencia y aumenta seguridad.
            </p>
          </div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: '8px' }}>Site-to-Site VPN</div>
            <p className="card-content">
              Conexión cifrada sobre internet pública. Buena para backups
              y conectividad secundaria.
            </p>
          </div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: '8px' }}>Transit Gateway</div>
            <p className="card-content">
              Hub de red que conecta múltiples VPCs y on-premises.
              Simplifica topologías híbridas complejas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function MicroservicesDiagram() {
  return (
    <div>
      <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>
        <Container size={20} style={{ display: 'inline', marginRight: '8px' }} />
        Arquitectura de Microservicios
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px'
          }}
        >
          {['API Gateway', 'Auth Service', 'User Service', 'Order Service', 'Payment Service', 'Notification Service'].map(
            (service, index) => (
              <div
                key={index}
                className="flow-node"
                style={{
                  maxWidth: '100%',
                  padding: '16px',
                  background: `linear-gradient(135deg, ${
                    index === 0
                      ? 'rgba(255, 153, 0, 0.2)'
                      : 'rgba(142, 68, 173, 0.15)'
                  }, transparent)`
                }}
              >
                <div className="flow-node-title" style={{ fontSize: '0.95rem' }}>
                  {index === 0 ? (
                    <Cloud size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  ) : (
                    <Container size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  )}
                  {service}
                </div>
                <div className="flow-node-desc" style={{ fontSize: '0.8rem' }}>
                  {index === 0
                    ? 'Routing + Throttling'
                    : 'Container independiente'}
                </div>
              </div>
            )
          )}
        </div>

        <div
          style={{
            marginTop: '16px',
            padding: '20px',
            background: 'rgba(155, 89, 182, 0.1)',
            border: '1px solid rgba(155, 89, 182, 0.3)',
            borderRadius: '12px'
          }}
        >
          <h4 style={{ marginBottom: '12px', color: '#9b59b6' }}>
            <Database size={18} style={{ display: 'inline', marginRight: '8px' }} />
            Data Layer (Database-per-Service)
          </h4>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center'
            }}
          >
            {['RDS PostgreSQL', 'DynamoDB', 'ElastiCache Redis', 'Amazon MQ', 'S3'].map(
              (db, index) => (
                <div
                  key={index}
                  style={{
                    padding: '10px 16px',
                    background: 'rgba(155, 89, 182, 0.2)',
                    border: '1px solid rgba(155, 89, 182, 0.4)',
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                  }}
                >
                  {db}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <h4 style={{ marginBottom: '16px' }}>Patrones de Microservicios en AWS</h4>
        <table className="data-table">
          <thead>
            <tr>
              <th>Patrón</th>
              <th>Servicio AWS</th>
              <th>Caso de Uso</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>API Gateway</td>
              <td>Amazon API Gateway</td>
              <td>Exposición unificada de múltiples servicios</td>
            </tr>
            <tr>
              <td>Service Discovery</td>
              <td>AWS Cloud Map</td>
              <td>Localización dinámica de servicios</td>
            </tr>
            <tr>
              <td>Event Bus</td>
              <td>Amazon EventBridge</td>
              <td>Comunicación asíncrona desacoplada</td>
            </tr>
            <tr>
              <td>Circuit Breaker</td>
              <td>AWS App Mesh</td>
              <td>Resiliencia en llamadas entre servicios</td>
            </tr>
            <tr>
              <td>Distributed Tracing</td>
              <td>AWS X-Ray</td>
              <td>Observabilidad de requests entre servicios</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Diagrams
