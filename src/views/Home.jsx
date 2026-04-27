import {
  Cloud,
  Server,
  Network,
  Shield,
  Container,
  Database,
  Globe,
  Cpu
} from 'lucide-react'

const highlights = [
  {
    icon: Cloud,
    title: 'Arquitectura Cloud',
    description: 'Diseña infraestructuras escalables y resilientes usando servicios AWS enterprise-grade.',
    color: '#ff9900'
  },
  {
    icon: Network,
    title: 'Networking Avanzado',
    description: 'VPC, subnets, load balancers, y conectividad híbrida con Transit Gateway.',
    color: '#27ae60'
  },
  {
    icon: Container,
    title: 'Kubernetes / EKS',
    description: 'Orquestación de contenedores con EKS, patrones de despliegue y observabilidad.',
    color: '#8e44ad'
  },
  {
    icon: Shield,
    title: 'Seguridad Enterprise',
    description: 'IAM, KMS, WAF, y mejores prácticas de seguridad en la nube.',
    color: '#eb5757'
  },
  {
    icon: Database,
    title: 'Bases de Datos',
    description: 'RDS, DynamoDB, ElastiCache y estrategias de replicación y backup.',
    color: '#9b59b6'
  },
  {
    icon: Server,
    title: 'Compute & Serverless',
    description: 'EC2, Lambda, Fargate y arquitecturas event-driven.',
    color: '#e74c3c'
  }
]

const stats = [
  { value: '200+', label: 'Comandos AWS CLI' },
  { value: '50+', label: 'Diagramas de Arquitectura' },
  { value: '30+', label: 'Patrones de Diseño' },
  { value: '100%', label: 'Cobertura EKS' }
]

function Home() {
  return (
    <div>
      <header style={{ marginBottom: '48px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 20px',
            background: 'rgba(255, 153, 0, 0.1)',
            border: '1px solid rgba(255, 153, 0, 0.3)',
            borderRadius: '50px',
            marginBottom: '24px',
            color: '#ff9900',
            fontSize: '0.9rem',
            fontWeight: 500
          }}
        >
          <Cloud size={18} />
          <span>Guía Completa de Arquitectura AWS</span>
        </div>

        <h1
          className="page-title"
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            lineHeight: 1.1,
            marginBottom: '24px'
          }}
        >
          Domina AWS desde
          <br />
          <span style={{ color: '#ff9900' }}>Fundamentos hasta Producción</span>
        </h1>

        <p
          className="page-description"
          style={{
            fontSize: '1.25rem',
            maxWidth: '700px',
            lineHeight: 1.8
          }}
        >
          Documentación técnica profesional orientada a portafolio y entrevistas senior.
          Incluye arquitectura de referencia enterprise, diagramas interactivos, comandos
          AWS CLI, kubectl, y troubleshooting de escenarios reales.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '32px',
            flexWrap: 'wrap'
          }}
        >
          <span className="badge badge-reusable">Arquitectura Reutilizable</span>
          <span className="badge badge-critical">Seguridad Enterprise</span>
          <span className="badge badge-depends">Multi-Ambiente</span>
        </div>
      </header>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '20px',
          marginBottom: '48px',
          padding: '32px',
          background: 'linear-gradient(135deg, rgba(15, 36, 62, 0.8), rgba(11, 31, 54, 0.9))',
          borderRadius: '16px',
          border: '1px solid var(--line)'
        }}
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{
              textAlign: 'center',
              padding: '16px'
            }}
          >
            <div
              style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                color: '#ff9900',
                marginBottom: '8px'
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)'
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Highlights Grid */}
      <section>
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <Cpu size={24} style={{ color: '#ff9900' }} />
          Áreas de Aprendizaje
        </h2>

        <div className="card-grid">
          {highlights.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={index}
                className="card"
                style={{
                  cursor: 'pointer',
                  borderLeft: `3px solid ${item.color}`
                }}
              >
                <div className="card-header">
                  <div
                    className="card-icon"
                    style={{
                      background: `${item.color}15`,
                      color: item.color
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 className="card-title">{item.title}</h3>
                </div>
                <p className="card-content">{item.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="section" style={{ marginTop: '48px' }}>
        <h2 className="section-title">
          <Globe size={24} />
          Vista General de Arquitectura
        </h2>

        <div
          style={{
            background: 'rgba(6, 17, 32, 0.6)',
            border: '1px solid var(--line)',
            borderRadius: '16px',
            padding: '32px'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                flexWrap: 'wrap'
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(255, 153, 0, 0.2), rgba(255, 153, 0, 0.05))',
                  border: '1px solid rgba(255, 153, 0, 0.3)',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}
              >
                <Cloud size={32} style={{ color: '#ff9900', marginBottom: '12px' }} />
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>CloudFront / Route 53</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Edge Locations + DNS
                </div>
              </div>

              <div style={{ color: 'var(--text-secondary)', fontSize: '1.5rem' }}>→</div>

              <div
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(47, 128, 237, 0.2), rgba(47, 128, 237, 0.05))',
                  border: '1px solid rgba(47, 128, 237, 0.3)',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}
              >
                <Shield size={32} style={{ color: '#2f80ed', marginBottom: '12px' }} />
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>API Gateway + WAF</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Seguridad + Throttling
                </div>
              </div>

              <div style={{ color: 'var(--text-secondary)', fontSize: '1.5rem' }}>→</div>

              <div
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(39, 174, 96, 0.2), rgba(39, 174, 96, 0.05))',
                  border: '1px solid rgba(39, 174, 96, 0.3)',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}
              >
                <Network size={32} style={{ color: '#27ae60', marginBottom: '12px' }} />
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>VPC + Load Balancers</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Networking Privada
                </div>
              </div>

              <div style={{ color: 'var(--text-secondary)', fontSize: '1.5rem' }}>→</div>

              <div
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(142, 68, 173, 0.2), rgba(142, 68, 173, 0.05))',
                  border: '1px solid rgba(142, 68, 173, 0.3)',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}
              >
                <Container size={32} style={{ color: '#8e44ad', marginBottom: '12px' }} />
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>EKS / ECS / EC2</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Compute Layer
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                marginTop: '20px'
              }}
            >
              <div
                style={{
                  flex: 1,
                  maxWidth: '300px',
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(155, 89, 182, 0.2), rgba(155, 89, 182, 0.05))',
                  border: '1px solid rgba(155, 89, 182, 0.3)',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}
              >
                <Database size={32} style={{ color: '#9b59b6', marginBottom: '12px' }} />
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Data Layer</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  RDS · DynamoDB · S3 · ElastiCache
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="note note-info" style={{ marginTop: '24px' }}>
          <strong>Arquitectura de Referencia:</strong> Este patrón representa una arquitectura
          enterprise común en AWS. Cada componente puede escalarse independientemente y
          se comunica mediante interfaces bien definidas. Navega por las secciones para
          profundizar en cada capa.
        </div>
      </section>

      {/* Learning Path */}
      <section className="section" style={{ marginTop: '48px' }}>
        <h2 className="section-title">
          <Server size={24} />
          Ruta de Aprendizaje Recomendada
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            {
              step: '01',
              title: 'Fundamentos Cloud',
              desc: 'Comprende los modelos IaaS, PaaS, SaaS y los servicios core de AWS.'
            },
            {
              step: '02',
              title: 'Networking',
              desc: 'Aprende VPC, subnets, routing, security groups y conectividad.'
            },
            {
              step: '03',
              title: 'Compute & Storage',
              desc: 'EC2, EBS, S3, y estrategias de backup y recuperación.'
            },
            {
              step: '04',
              title: 'Containerización',
              desc: 'Docker, ECR, ECS y Kubernetes con EKS.'
            },
            {
              step: '05',
              title: 'Seguridad Avanzada',
              desc: 'IAM, KMS, Secrets Manager, WAF y compliance.'
            },
            {
              step: '06',
              title: 'Observabilidad',
              desc: 'CloudWatch, X-Ray, logging y monitoring.'
            }
          ].map((item, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '24px',
                background: 'linear-gradient(135deg, rgba(19, 47, 81, 0.6), rgba(15, 36, 62, 0.8))',
                border: '1px solid var(--line)',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--line-light)'
                e.currentTarget.style.transform = 'translateX(8px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--line)'
                e.currentTarget.style.transform = 'translateX(0)'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ff9900, #ff7700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#000',
                  flexShrink: 0
                }}
              >
                {item.step}
              </div>
              <div>
                <div
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    marginBottom: '4px'
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: '0.95rem',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
