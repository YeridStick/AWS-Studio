import { Layers, Cloud, Server, Box, Zap, ArrowRight, CheckCircle } from 'lucide-react'

const infrastructureTypes = [
  {
    id: 'iaas',
    title: 'IaaS',
    subtitle: 'Infrastructure as a Service',
    icon: Server,
    color: '#e74c3c',
    description: 'Infraestructura como Servicio. AWS gestiona la infraestructura física; tú gestionas SO, middleware, runtime y aplicaciones.',
    control: 'Alta - Control total sobre VMs, redes y storage',
    examples: ['Amazon EC2', 'Amazon VPC', 'Amazon EBS', 'AWS Direct Connect'],
    useCases: [
      'Migración lift-and-shift de datacenters',
      'Workloads con requisitos específicos de SO',
      'Entornos de desarrollo/test personalizados',
      'Aplicaciones legacy que requieren control total'
    ],
    responsibilities: {
      aws: ['Datacenters físicos', 'Redes físicas', 'Hardware', 'Virtualización'],
      customer: ['Sistema operativo', 'Middleware', 'Runtime', 'Datos', 'Aplicaciones', 'Networking virtual']
    },
    pros: [
      'Control total sobre la infraestructura virtual',
      'Flexibilidad de configuración',
      'Fácil migración desde on-premises'
    ],
    cons: [
      'Requiere gestión de parches y actualizaciones',
      'Necesita expertise en administración de sistemas',
      'Overhead de gestión de infraestructura'
    ]
  },
  {
    id: 'paas',
    title: 'PaaS',
    subtitle: 'Platform as a Service',
    icon: Layers,
    color: '#2f80ed',
    description: 'Plataforma como Servicio. AWS gestiona la infraestructura y la plataforma; tú te enfocas en el código y los datos.',
    control: 'Media - Gestiona aplicaciones y datos, AWS gestiona el resto',
    examples: ['AWS Elastic Beanstalk', 'Amazon RDS', 'Amazon EMR', 'Amazon OpenSearch'],
    useCases: [
      'Desarrollo ágil de aplicaciones',
      'Bases de datos administradas',
      'Aplicaciones web y móviles',
      'Analytics y procesamiento de datos'
    ],
    responsibilities: {
      aws: ['Datacenters', 'Hardware', 'Virtualización', 'OS', 'Middleware', 'Runtime'],
      customer: ['Aplicaciones', 'Datos', 'Configuración de servicio']
    },
    pros: [
      'Desarrollo más rápido sin gestión de infraestructura',
      'Escalado automático integrado',
      'Parches y backups automatizados'
    ],
    cons: [
      'Menor control sobre la infraestructura subyacente',
      'Vendor lock-in potencial',
      'Limitaciones en configuraciones personalizadas'
    ]
  },
  {
    id: 'saas',
    title: 'SaaS',
    subtitle: 'Software as a Service',
    icon: Cloud,
    color: '#27ae60',
    description: 'Software como Servicio. Aplicaciones completamente funcionales ejecutándose en la nube. Solo configuras y usas.',
    control: 'Baja - Configuración y uso únicamente',
    examples: ['Amazon Chime', 'Amazon WorkSpaces', 'AWS IAM Identity Center', 'Third-party SaaS on AWS Marketplace'],
    useCases: [
      'Email y colaboración',
      'CRM y ERP',
      'Productividad empresarial',
      'Herramientas de desarrollo'
    ],
    responsibilities: {
      aws: ['Todo excepto datos de usuarios'],
      customer: ['Datos ingresados', 'Configuración', 'User management']
    },
    pros: [
      'Implementación inmediata sin instalación',
      'Actualizaciones automáticas',
      'Acceso desde cualquier lugar',
      'Modelo de precios por usuario/suscripción'
    ],
    cons: [
      'Mínima personalización posible',
      'Dependencia total del proveedor',
      'Preocupaciones de seguridad de datos',
      'Conectividad requerida para funcionar'
    ]
  },
  {
    id: 'serverless',
    title: 'Serverless / FaaS',
    subtitle: 'Function as a Service',
    icon: Zap,
    color: '#f39c12',
    description: 'Funciones como Servicio. Ejecuta código en respuesta a eventos sin gestionar servidores. Escalado automático extremo.',
    control: 'Mínima - Solo código y configuración de triggers',
    examples: ['AWS Lambda', 'Amazon API Gateway', 'Amazon EventBridge', 'AWS Step Functions'],
    useCases: [
      'APIs y microservicios',
      'Procesamiento de eventos en tiempo real',
      'ETL y data processing',
      'Automatización de infraestructura',
      'Chatbots y asistentes virtuales'
    ],
    responsibilities: {
      aws: ['Todo excepto código y configuración'],
      customer: ['Código de función', 'Configuración de triggers', 'IAM permissions']
    },
    pros: [
      'Sin gestión de servidores (cero admin)',
      'Escalado automático instantáneo',
      'Pago exacto por uso (100ms)',
      'Alta disponibilidad integrada'
    ],
    cons: [
      'Cold starts en algunos escenarios',
      'Limitaciones de ejecución (15 min)',
      'Debugging más complejo',
      'Vendor lock-in significativo'
    ]
  },
  {
    id: 'containers',
    title: 'CaaS',
    subtitle: 'Containers as a Service',
    icon: Box,
    color: '#8e44ad',
    description: 'Contenedores como Servicio. Ejecuta contenedores Docker sin gestionar infraestructura de orquestación.',
    control: 'Media-Alta - Control del contenedor, AWS gestiona orquestación',
    examples: ['Amazon ECS', 'Amazon EKS', 'AWS Fargate', 'AWS App Runner'],
    useCases: [
      'Microservicios',
      'Aplicaciones containerizadas existentes',
      'CI/CD pipelines',
      'Batch processing',
      'ML training e inference'
    ],
    responsibilities: {
      aws: ['Infraestructura', 'Orquestación', 'Scheduling'],
      customer: ['Imagen de contenedor', 'Task definitions', 'Service configuration']
    },
    pros: [
      'Portabilidad entre ambientes',
      'Consistencia dev/prod',
      'Eficiencia de recursos',
      'Ecosistema Kubernetes estándar'
    ],
    cons: [
      'Complejidad de orquestación',
      'Curva de aprendizaje de Kubernetes',
      'Networking más compleja',
      'Observabilidad distribuida'
    ]
  }
]

const comparisonFeatures = [
  { name: 'Gestión de Datacenters', iaas: 'AWS', paas: 'AWS', saas: 'AWS', serverless: 'AWS', containers: 'AWS' },
  { name: 'Hardware & Networking', iaas: 'AWS', paas: 'AWS', saas: 'AWS', serverless: 'AWS', containers: 'AWS' },
  { name: 'Virtualización', iaas: 'AWS', paas: 'AWS', saas: 'AWS', serverless: 'AWS', containers: 'AWS' },
  { name: 'Sistema Operativo', iaas: 'Customer', paas: 'AWS', saas: 'AWS', serverless: 'AWS', containers: 'Shared' },
  { name: 'Middleware & Runtime', iaas: 'Customer', paas: 'AWS', saas: 'AWS', serverless: 'AWS', containers: 'Customer' },
  { name: 'Contenedores/Orchestration', iaas: 'Customer', paas: 'N/A', saas: 'N/A', serverless: 'AWS', containers: 'Shared' },
  { name: 'Código/Aplicación', iaas: 'Customer', paas: 'Customer', saas: 'AWS', serverless: 'Customer', containers: 'Customer' },
  { name: 'Datos', iaas: 'Customer', paas: 'Customer', saas: 'Shared', serverless: 'Customer', containers: 'Customer' }
]

function InfrastructureTypes() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Modelos de Infraestructura Cloud</h1>
        <p className="page-description">
          Comprende los diferentes modelos de servicio en la nube: IaaS, PaaS, SaaS,
          Serverless y Containers. Cada modelo ofrece diferentes niveles de control
          y responsabilidad compartida.
        </p>
      </div>

      {/* Comparison Table */}
      <section className="section">
        <h2 className="section-title">
          <Layers size={24} />
          Modelo de Responsabilidad Compartida
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Capa</th>
                <th style={{ color: '#e74c3c' }}>IaaS</th>
                <th style={{ color: '#2f80ed' }}>PaaS</th>
                <th style={{ color: '#27ae60' }}>SaaS</th>
                <th style={{ color: '#f39c12' }}>Serverless</th>
                <th style={{ color: '#8e44ad' }}>CaaS</th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((feature, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: 500 }}>{feature.name}</td>
                  <td>
                    <span
                      className={`badge ${
                        feature.iaas === 'AWS' ? 'badge-reusable' : 'badge-critical'
                      }`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {feature.iaas}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        feature.paas === 'AWS' ? 'badge-reusable' : 'badge-critical'
                      }`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {feature.paas}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        feature.saas === 'AWS' ? 'badge-reusable' : 'badge-critical'
                      }`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {feature.saas}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        feature.serverless === 'AWS' ? 'badge-reusable' : 'badge-critical'
                      }`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {feature.serverless}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        feature.containers === 'AWS'
                          ? 'badge-reusable'
                          : feature.containers === 'Shared'
                          ? 'badge-depends'
                          : 'badge-critical'
                      }`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {feature.containers}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="note note-info" style={{ marginTop: '16px' }}>
          <strong>AWS = AWS gestiona</strong> | <strong>Customer = Tú gestionas</strong> |{' '}
          <strong>Shared = Responsabilidad compartida</strong>
        </div>
      </section>

      {/* Detailed Cards */}
      {infrastructureTypes.map((type) => {
        const Icon = type.icon
        return (
          <section key={type.id} className="section">
            <div
              className="card"
              style={{
                borderLeft: `4px solid ${type.color}`,
                background: `linear-gradient(135deg, ${type.color}08, rgba(15, 36, 62, 0.95))`
              }}
            >
              <div className="card-header" style={{ marginBottom: '20px' }}>
                <div
                  className="card-icon"
                  style={{
                    background: `${type.color}20`,
                    color: type.color,
                    width: '56px',
                    height: '56px'
                  }}
                >
                  <Icon size={28} />
                </div>
                <div>
                  <h2 className="card-title" style={{ fontSize: '1.5rem', marginBottom: '4px' }}>
                    {type.title}
                  </h2>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    {type.subtitle}
                  </div>
                </div>
              </div>

              <p
                style={{
                  fontSize: '1.05rem',
                  lineHeight: 1.7,
                  marginBottom: '24px',
                  color: 'var(--text)'
                }}
              >
                {type.description}
              </p>

              <div style={{ marginBottom: '20px' }}>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: type.color
                  }}
                >
                  Nivel de Control
                </span>
                <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
                  {type.control}
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: type.color
                  }}
                >
                  Ejemplos AWS
                </span>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginTop: '12px'
                  }}
                >
                  {type.examples.map((example, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '6px 14px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${type.color}40`,
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        color: type.color
                      }}
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: type.color,
                    marginBottom: '12px',
                    display: 'block'
                  }}
                >
                  Casos de Uso
                </span>
                <ul className="styled-list">
                  {type.useCases.map((useCase, idx) => (
                    <li key={idx}>{useCase}</li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '16px',
                  marginTop: '24px'
                }}
              >
                <div
                  style={{
                    padding: '16px',
                    background: 'rgba(39, 174, 96, 0.1)',
                    border: '1px solid rgba(39, 174, 96, 0.3)',
                    borderRadius: '8px'
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: '#4ade80',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <CheckCircle size={16} />
                    Ventajas
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {type.pros.map((pro, idx) => (
                      <li
                        key={idx}
                        style={{
                          fontSize: '0.9rem',
                          color: 'var(--text-secondary)',
                          padding: '4px 0',
                          paddingLeft: '16px',
                          position: 'relative'
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            left: 0,
                            color: '#4ade80'
                          }}
                        >
                          +
                        </span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  style={{
                    padding: '16px',
                    background: 'rgba(235, 87, 87, 0.1)',
                    border: '1px solid rgba(235, 87, 87, 0.3)',
                    borderRadius: '8px'
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color: '#f87171',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <ArrowRight size={16} style={{ transform: 'rotate(45deg)' }} />
                    Consideraciones
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {type.cons.map((con, idx) => (
                      <li
                        key={idx}
                        style={{
                          fontSize: '0.9rem',
                          color: 'var(--text-secondary)',
                          padding: '4px 0',
                          paddingLeft: '16px',
                          position: 'relative'
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            left: 0,
                            color: '#f87171'
                          }}
                        >
                          −
                        </span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )
      })}

      {/* Decision Guide */}
      <section className="section">
        <h2 className="section-title">
          <Zap size={24} />
          Guía de Decisión
        </h2>

        <div className="card-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>¿Qué modelo elegir?</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px'
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    color: '#e74c3c',
                    marginBottom: '8px'
                  }}
                >
                  Elige IaaS si:
                </div>
                <ul className="styled-list" style={{ fontSize: '0.9rem' }}>
                  <li>Necesitas control total del sistema operativo</li>
                  <li>Tienes requisitos de compliance específicos</li>
                  <li>Migrando aplicaciones legacy sin modificar</li>
                  <li>Requieres software específico en el OS</li>
                </ul>
              </div>

              <div>
                <div
                  style={{
                    fontWeight: 600,
                    color: '#2f80ed',
                    marginBottom: '8px'
                  }}
                >
                  Elige PaaS si:
                </div>
                <ul className="styled-list" style={{ fontSize: '0.9rem' }}>
                  <li>Te enfocas en desarrollo, no en infraestructura</li>
                  <li>Necesitas escalado automático sin configurar</li>
                  <li>Quieres backups y parches automáticos</li>
                  <li>Desarrollo ágil y rápido</li>
                </ul>
              </div>

              <div>
                <div
                  style={{
                    fontWeight: 600,
                    color: '#27ae60',
                    marginBottom: '8px'
                  }}
                >
                  Elige SaaS si:
                </div>
                <ul className="styled-list" style={{ fontSize: '0.9rem' }}>
                  <li>Necesitas una solución lista para usar</li>
                  <li>Sin recursos técnicos para mantener software</li>
                  <li>Standard business processes (CRM, ERP)</li>
                  <li>Collaboration y productivity tools</li>
                </ul>
              </div>

              <div>
                <div
                  style={{
                    fontWeight: 600,
                    color: '#f39c12',
                    marginBottom: '8px'
                  }}
                >
                  Elige Serverless si:
                </div>
                <ul className="styled-list" style={{ fontSize: '0.9rem' }}>
                  <li>Workloads event-driven o sporádicos</li>
                  <li>Optimizar costos con pago por uso real</li>
                  <li>Escalado automático extremo</li>
                  <li>Microservicios y APIs</li>
                </ul>
              </div>

              <div>
                <div
                  style={{
                    fontWeight: 600,
                    color: '#8e44ad',
                    marginBottom: '8px'
                  }}
                >
                  Elige CaaS si:
                </div>
                <ul className="styled-list" style={{ fontSize: '0.9rem' }}>
                  <li>Ya tienes aplicaciones containerizadas</li>
                  <li>Microservicios complejos</li>
                  <li>Portabilidad multi-cloud</li>
                  <li>CI/CD pipelines con containers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default InfrastructureTypes
