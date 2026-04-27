import {
  Server,
  Database,
  HardDrive,
  Cloud,
  Zap,
  Globe,
  Shield,
  Layers,
  Cog,
  Activity
} from 'lucide-react'

const serviceCategories = [
  {
    title: 'Compute',
    icon: Server,
    color: '#e74c3c',
    services: [
      {
        name: 'Amazon EC2',
        description: 'Servidores virtuales escalables en la nube. Control total sobre el SO y configuración.',
        useCases: ['Aplicaciones legacy', 'Workloads personalizados', 'HPC', 'Bastion hosts'],
        features: ['Auto Scaling', 'Spot Instances', 'Reserved Instances', 'Dedicated Hosts']
      },
      {
        name: 'AWS Lambda',
        description: 'Computación serverless. Ejecuta código sin aprovisionar ni gestionar servidores.',
        useCases: ['APIs serverless', 'Procesamiento de eventos', 'ETL', 'Validación de datos'],
        features: ['Escalado automático', 'Pago por uso', 'Integración con 200+ servicios', '15 min timeout']
      },
      {
        name: 'Amazon ECS',
        description: 'Orquestación de contenedores Docker altamente escalable y de alto rendimiento.',
        useCases: ['Microservicios', 'Batch processing', 'Aplicaciones containerizadas'],
        features: ['Fargate (serverless)', 'EC2 launch type', 'Service discovery', 'Auto scaling']
      },
      {
        name: 'Amazon EKS',
        description: 'Kubernetes administrado. Ejecuta Kubernetes en AWS sin instalar ni operar el control plane.',
        useCases: ['Orquestación de contenedores', 'Microservicios', 'CI/CD', 'ML workloads'],
        features: ['Control plane administrado', 'Fargate integration', 'Add-ons', 'Managed node groups']
      },
      {
        name: 'AWS Fargate',
        description: 'Compute serverless para contenedores. Compatible con ECS y EKS.',
        useCases: ['Contenedores sin gestión de infraestructura', 'Microservicios efímeros'],
        features: ['No hay servidores que gestionar', 'Pago por uso', 'Aislado y seguro']
      },
      {
        name: 'AWS Batch',
        description: 'Procesamiento de batches a cualquier escala. Planificación dinámica de recursos.',
        useCases: ['Simulaciones científicas', 'Renderizado', 'Análisis financiero'],
        features: ['Planificación de jobs', 'Integración con Spot', 'Priorización de colas']
      }
    ]
  },
  {
    title: 'Storage',
    icon: HardDrive,
    color: '#00a8cc',
    services: [
      {
        name: 'Amazon S3',
        description: 'Almacenamiento de objetos escalable, duradero y seguro. 11 9s de durabilidad.',
        useCases: ['Data lakes', 'Backups', 'Static website hosting', 'Archivos distribuidos'],
        features: ['Versioning', 'Lifecycle policies', 'Cross-region replication', 'S3 Intelligent-Tiering']
      },
      {
        name: 'Amazon EBS',
        description: 'Almacenamiento de bloques persistente para EC2. Baja latencia y alto rendimiento.',
        useCases: ['Bases de datos', 'File systems', 'Aplicaciones empresariales'],
        features: ['gp3, io2, st1, sc1 types', 'Snapshots', 'Encryption', 'Multi-attach']
      },
      {
        name: 'Amazon EFS',
        description: 'File system NFS elástico y totalmente administrado.',
        useCases: ['CMS', 'Share home directories', 'Data analytics', 'Container storage'],
        features: ['Escalado automático', 'Multi-AZ', 'Throughput modes', 'Lifecycle management']
      },
      {
        name: 'Amazon FSx',
        description: 'File systems de terceros totalmente administrados (Windows, Lustre, NetApp).',
        useCases: ['HPC', 'EDA', 'Machine Learning', 'Windows workloads'],
        features: ['SMB/Windows', 'Lustre', 'ONTAP', 'OpenZFS']
      },
      {
        name: 'AWS Storage Gateway',
        description: 'Integración de almacenamiento híbrido. Conecta on-premises a la nube.',
        useCases: ['Backups híbridos', 'Disaster recovery', 'Tiering'],
        features: ['File Gateway', 'Volume Gateway', 'Tape Gateway']
      },
      {
        name: 'AWS Backup',
        description: 'Servicio centralizado de backup para AWS y on-premises.',
        useCases: ['Backup automatizado', 'Cumplimiento', 'Disaster recovery'],
        features: ['Políticas de backup', 'Cross-account', 'Point-in-time recovery']
      }
    ]
  },
  {
    title: 'Database',
    icon: Database,
    color: '#9b59b6',
    services: [
      {
        name: 'Amazon RDS',
        description: 'Bases de datos relacionales administradas. MySQL, PostgreSQL, MariaDB, Oracle, SQL Server.',
        useCases: ['OLTP', 'ERP/CRM', 'E-commerce', 'Aplicaciones web'],
        features: ['Multi-AZ', 'Read replicas', 'Automated backups', 'Encryption at rest']
      },
      {
        name: 'Amazon DynamoDB',
        description: 'Base de datos NoSQL serverless. Rendimiento de milisegundos a cualquier escala.',
        useCases: ['Aplicaciones serverless', 'Cachés', 'Session stores', 'Gaming'],
        features: ['On-demand capacity', 'Global tables', 'DAX (caché)', 'Streams']
      },
      {
        name: 'Amazon ElastiCache',
        description: 'Servicio de caché en memoria administrado. Redis y Memcached.',
        useCases: ['Caching', 'Session management', 'Real-time analytics', 'Leaderboards'],
        features: ['Redis Cluster', 'Memcached', 'Auto-discovery', 'Encryption']
      },
      {
        name: 'Amazon Redshift',
        description: 'Data warehouse de petabytes. Análisis a gran escala.',
        useCases: ['BI', 'Data warehousing', 'ETL', 'Análisis de logs'],
        features: ['Columnar storage', 'Spectrum (S3 queries)', 'Concurrency scaling', 'ML integration']
      },
      {
        name: 'Amazon DocumentDB',
        description: 'Base de datos documental compatible con MongoDB.',
        useCases: ['Content management', 'Catálogos', 'Perfiles de usuario'],
        features: ['MongoDB 4.0 compatible', 'Auto-scaling', 'Global clusters']
      },
      {
        name: 'Amazon Neptune',
        description: 'Base de datos de grafos administrada. Gremlin y SPARQL.',
        useCases: ['Redes sociales', 'Fraud detection', 'Knowledge graphs', 'Recommendation engines'],
        features: ['Gremlin', 'SPARQL', 'Serverless option', 'ML integration']
      }
    ]
  },
  {
    title: 'Networking',
    icon: Globe,
    color: '#27ae60',
    services: [
      {
        name: 'Amazon VPC',
        description: 'Red virtual aislada en AWS. Control completo sobre el entorno de red.',
        useCases: ['Aplicaciones seguras', 'Multi-tier apps', 'Híbridos'],
        features: ['Subnets', 'Route tables', 'Internet Gateway', 'NAT Gateway']
      },
      {
        name: 'Amazon CloudFront',
        description: 'CDN global con baja latencia y altas velocidades de transferencia.',
        useCases: ['Distribución de contenido', 'Streaming', 'APIs globales'],
        features: ['Edge locations', 'Field-level encryption', 'Lambda@Edge', 'Origin Shield']
      },
      {
        name: 'Amazon Route 53',
        description: 'DNS escalable y disponible. Health checks y routing inteligente.',
        useCases: ['DNS hosting', 'Domain registration', 'Health checks'],
        features: ['Health checks', 'Latency-based routing', 'Geo DNS', 'Traffic flow']
      },
      {
        name: 'AWS Transit Gateway',
        description: 'Hub de red para conectar VPCs y on-premises.',
        useCases: ['Redes híbridas complejas', 'Multi-VPC', 'Shared services'],
        features: ['Transit Gateway peering', 'Multicast', 'Inter-region peering']
      },
      {
        name: 'AWS Direct Connect',
        description: 'Conexión dedicada de red privada a AWS.',
        useCases: ['Transferencia de datos masiva', 'Redes híbridas', 'Alta seguridad'],
        features: ['1/10/100 Gbps', 'Private VIF', 'Public VIF', 'Transit VIF']
      },
      {
        name: 'AWS App Mesh',
        description: 'Malla de servicios para aplicaciones en AWS.',
        useCases: ['Microservicios', 'Observabilidad', 'Traffic management'],
        features: ['Envoy proxy', 'Circuit breaking', 'Retries/Timeouts', 'mTLS']
      }
    ]
  },
  {
    title: 'Security',
    icon: Shield,
    color: '#eb5757',
    services: [
      {
        name: 'AWS IAM',
        description: 'Gestión de identidades y accesos. Control granular de permisos.',
        useCases: ['Control de accesos', 'Federación', 'Compliance'],
        features: ['Users/Roles/Policies', 'MFA', 'Identity federation', 'Access Analyzer']
      },
      {
        name: 'AWS KMS',
        description: 'Gestión de claves de cifrado. Crear y controlar claves.',
        useCases: ['Encryption at rest', 'Digital signing', 'Data key generation'],
        features: ['Customer managed keys', 'AWS managed keys', 'CloudHSM integration', 'External key store']
      },
      {
        name: 'AWS WAF',
        description: 'Firewall de aplicaciones web. Protege contra exploits comunes.',
        useCases: ['Protección web', 'DDoS mitigation', 'Bot control'],
        features: ['Managed rules', 'Rate limiting', 'Geo-blocking', 'Bot Control']
      },
      {
        name: 'AWS Shield',
        description: 'Protección contra DDoS. Shield Standard (gratis) y Advanced.',
        useCases: ['DDoS protection', '24/7 DRT', 'Cost protection'],
        features: ['Always-on detection', 'Automatic mitigations', 'DRT access', 'Cost protection']
      },
      {
        name: 'AWS Secrets Manager',
        description: 'Rotación, gestión y recuperación de secretos.',
        useCases: ['Passwords', 'API keys', 'Tokens', 'Database credentials'],
        features: ['Automatic rotation', 'Cross-account access', 'Encryption', 'Audit logging']
      },
      {
        name: 'Amazon GuardDuty',
        description: 'Detección de amenazas inteligente. ML para identificar actividad maliciosa.',
        useCases: ['Threat detection', 'Compliance', 'Incident response'],
        features: ['Continuous monitoring', 'Threat intelligence', 'Malware detection', 'EKS protection']
      }
    ]
  },
  {
    title: 'Serverless & Integration',
    icon: Zap,
    color: '#f39c12',
    services: [
      {
        name: 'Amazon API Gateway',
        description: 'Crear, publicar y mantener APIs seguras y escalables.',
        useCases: ['REST APIs', 'WebSocket APIs', 'HTTP APIs', 'API management'],
        features: ['Throttling', 'Caching', 'Request validation', 'API keys']
      },
      {
        name: 'AWS Step Functions',
        description: 'Orquestación de workflows. Coordina múltiples servicios AWS.',
        useCases: ['ETL workflows', 'ML pipelines', 'Microservices orchestration'],
        features: ['Visual workflow', 'Error handling', 'Parallel execution', 'Express workflows']
      },
      {
        name: 'Amazon EventBridge',
        description: 'Bus de eventos serverless. Conecta aplicaciones con datos de diversas fuentes.',
        useCases: ['Event-driven apps', 'SaaS integration', 'Scheduled tasks'],
        features: ['Event buses', 'Rules', 'Targets', 'Schema registry']
      },
      {
        name: 'Amazon SQS',
        description: 'Colas de mensajes totalmente administradas. Desacoplamiento de componentes.',
        useCases: ['Decoupling', 'Buffering', 'Async processing', 'Load leveling'],
        features: ['Standard & FIFO', 'Dead-letter queues', 'Visibility timeout', 'Batching']
      },
      {
        name: 'Amazon SNS',
        description: 'Notificaciones pub/sub. Mensajería A2A y A2P.',
        useCases: ['Push notifications', 'Fan-out', 'SMS/Email alerts'],
        features: ['Pub/sub', 'FIFO topics', 'Message filtering', 'Delivery retries']
      },
      {
        name: 'AWS AppSync',
        description: 'Servicio GraphQL y Pub/Sub administrado.',
        useCases: ['Real-time apps', 'Offline apps', 'Data synchronization'],
        features: ['GraphQL', 'Real-time subscriptions', 'Offline support', 'Data sources']
      }
    ]
  }
]

function Services() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Servicios AWS</h1>
        <p className="page-description">
          Catálogo completo de servicios AWS organizados por categoría. Cada servicio
          incluye descripción, casos de uso y características principales.
        </p>
      </div>

      {serviceCategories.map((category, catIndex) => {
        const Icon = category.icon
        return (
          <section key={category.title} className="section">
            <h2 className="section-title" style={{ borderColor: category.color }}>
              <Icon size={24} style={{ color: category.color }} />
              {category.title}
            </h2>

            <div className="card-grid">
              {category.services.map((service, svcIndex) => (
                <div
                  key={service.name}
                  className="card"
                  style={{
                    borderLeft: `3px solid ${category.color}`,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div
                    className="card-header"
                    style={{ marginBottom: '12px' }}
                  >
                    <div
                      className="card-icon"
                      style={{
                        background: `${category.color}15`,
                        color: category.color,
                        width: '40px',
                        height: '40px'
                      }}
                    >
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                        {service.name.split(' ').pop().substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="card-title" style={{ fontSize: '1.05rem' }}>
                      {service.name}
                    </h3>
                  </div>

                  <p
                    className="card-content"
                    style={{ marginBottom: '16px', fontSize: '0.9rem' }}
                  >
                    {service.description}
                  </p>

                  <div style={{ marginBottom: '12px' }}>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: 'var(--text-secondary)',
                        marginBottom: '8px'
                      }}
                    >
                      Casos de Uso
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px'
                      }}
                    >
                      {service.useCases.map((useCase, ucIndex) => (
                        <span
                          key={ucIndex}
                          style={{
                            fontSize: '0.75rem',
                            padding: '4px 10px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '20px',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          {useCase}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: 'var(--text-secondary)',
                        marginBottom: '8px'
                      }}
                    >
                      Features
                    </div>
                    <ul
                      style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        fontSize: '0.85rem'
                      }}
                    >
                      {service.features.map((feature, fIndex) => (
                        <li
                          key={fIndex}
                          style={{
                            padding: '4px 0',
                            paddingLeft: '16px',
                            position: 'relative',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          <span
                            style={{
                              position: 'absolute',
                              left: 0,
                              color: category.color
                            }}
                          >
                            •
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      })}

      <div className="note note-info" style={{ marginTop: '32px' }}>
        <strong>Servicios en evolución:</strong> AWS lanza constantemente nuevos
        servicios y features. Esta lista representa los servicios core más utilizados
        en arquitecturas enterprise. Consulta la documentación oficial de AWS para
        las últimas actualizaciones.
      </div>
    </div>
  )
}

export default Services
