import {
  Shield,
  Lock,
  Key,
  Users,
  FileText,
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle,
  Globe
} from 'lucide-react'

const securityServices = [
  {
    title: 'AWS IAM',
    icon: Users,
    description: 'Identity and Access Management. Controla quién puede acceder a qué recursos en AWS.',
    concepts: [
      { name: 'Users', desc: 'Entidades individuales con credenciales de acceso' },
      { name: 'Groups', desc: 'Colección de usuarios con permisos comunes' },
      { name: 'Roles', desc: 'Identidades temporales para servicios o usuarios externos' },
      { name: 'Policies', desc: 'Documentos JSON que definen permisos' }
    ],
    bestPractices: [
      'Nunca usar credenciales root para tareas diarias',
      'Habilitar MFA en todas las cuentas',
      'Usar roles en lugar de access keys cuando sea posible',
      'Principio de mínimo privilegio',
      'Rotar credenciales regularmente',
      'Usar IAM Access Analyzer para revisar permisos'
    ],
    commands: `# Crear usuario
aws iam create-user --user-name developer

# Crear grupo y añadir usuario
aws iam create-group --group-name developers
aws iam add-user-to-group --user-name developer --group-name developers

# Attach policy
aws iam attach-group-policy --group-name developers --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess

# Crear role
aws iam create-role --role-name EC2S3AccessRole --assume-role-policy-document file://trust-policy.json`
  },
  {
    title: 'AWS KMS',
    icon: Key,
    description: 'Key Management Service. Crea y controla claves de cifrado.',
    concepts: [
      { name: 'Customer Managed Keys (CMK)', desc: 'Tú creas y gestionas las claves' },
      { name: 'AWS Managed Keys', desc: 'AWS crea y gestiona automáticamente' },
      { name: 'Data Keys', desc: 'Claves para cifrar datos, cifradas por CMK' },
      { name: 'Key Policies', desc: 'Controlan quién puede usar las claves' }
    ],
    bestPractices: [
      'Usar CMK para mayor control sobre permisos',
      'Separar claves por aplicación/ambiente',
      'Habilitar key rotation para CMKs',
      'Usar grants para permisos temporales',
      'Auditar uso de claves con CloudTrail'
    ],
    commands: `# Crear CMK
aws kms create-key --description "Production data encryption key"

# Crear alias
aws kms create-alias --alias-name alias/prod-data-key --target-key-id xxxx

# Cifrar datos
aws kms encrypt --key-id alias/prod-data-key --plaintext "secret data" --output text --query CiphertextBlob

# Rotar clave
aws kms enable-key-rotation --key-id xxxx`
  },
  {
    title: 'AWS Secrets Manager',
    icon: Lock,
    description: 'Almacena y rota secretos como contraseñas, API keys, tokens.',
    concepts: [
      { name: 'Secretos', desc: 'Texto cifrado de hasta 64KB' },
      { name: 'Versiones', desc: 'Múltiples versiones de un secreto' },
      { name: 'Rotación automática', desc: 'Lambda que rota secretos periódicamente' },
      { name: 'Cross-account access', desc: 'Compartir secretos entre cuentas' }
    ],
    bestPractices: [
      'Usar rotación automática cuando sea posible',
      'Separar secretos por ambiente',
      'Usar IAM policies para controlar acceso',
      'Nunca hardcodear secretos en código',
      'Auditar acceso a secretos'
    ],
    commands: `# Crear secreto
aws secretsmanager create-secret --name prod/database/password --secret-string '{"username":"admin","password":"supersecret"}'

# Obtener secreto
aws secretsmanager get-secret-value --secret-id prod/database/password

# Configurar rotación
aws secretsmanager rotate-secret --secret-id prod/database/password --rotation-lambda-arn arn:aws:lambda:region:account:function:rotate-function --automatically-rotate-after-days 30`
  },
  {
    title: 'AWS WAF',
    icon: Shield,
    description: 'Web Application Firewall. Protege aplicaciones web contra exploits comunes.',
    concepts: [
      { name: 'WebACLs', desc: 'Conjunto de reglas que protegen recursos' },
      { name: 'Rules', desc: 'Condiciones que inspeccionan requests' },
      { name: 'Rule Groups', desc: 'Conjuntos reutilizables de reglas' },
      { name: 'Managed Rules', desc: 'Reglas mantenidas por AWS o terceros' }
    ],
    bestPractices: [
      'Usar AWS Managed Rules como baseline',
      'Configurar rate limiting para DDoS',
      'Habilitar logging a S3/CloudWatch',
      'Usar Geo-blocking para compliance',
      'Probar reglas en Count mode antes de Block'
    ],
    commands: `# Crear WebACL
aws wafv2 create-web-acl --name production-waf --scope REGIONAL --default-action Allow={} --visibility-config SampledRequestsEnabled=true,CloudWatchMetricsEnabled=true,MetricName=production-waf

# Añadir managed rule
aws wafv2 update-web-acl --name production-waf --scope REGIONAL --id xxxx --lock-token xxxx --rules '[{"Name":"AWSManagedRulesCommonRuleSet","Priority":1,"Statement":{"ManagedRuleGroupStatement":{"VendorName":"AWS","Name":"AWSManagedRulesCommonRuleSet"}},"OverrideAction":{"None":{}},"VisibilityConfig":{"SampledRequestsEnabled":true,"CloudWatchMetricsEnabled":true,"MetricName":"AWSManagedRulesCommonRuleSet"}}]'`
  },
  {
    title: 'AWS Shield',
    icon: Shield,
    description: 'Protección contra DDoS. Shield Standard (gratis) y Shield Advanced (pago).',
    concepts: [
      { name: 'Shield Standard', desc: 'Protección automática contra DDoS comunes' },
      { name: 'Shield Advanced', desc: 'Protección mejorada + DRT + cost protection' },
      { name: 'DRT', desc: 'DDoS Response Team 24/7' },
      { name: 'Cost Protection', desc: 'Protección contra costos durante ataques' }
    ],
    bestPractices: [
      'Usar CloudFront + WAF + Shield',
      'Tener runbooks de respuesta a DDoS',
      'Configurar auto-scaling para absorber picos',
      'Monitorear métricas de ELB/CloudFront',
      'Considerar Shield Advanced para aplicaciones críticas'
    ],
    commands: `# Shield Advanced requiere suscripción previa
# Asociar recurso protegido
aws shield create-protection --name production-protection --resource-arn arn:aws:cloudfront::account:distribution/xxxx`
  },
  {
    title: 'Amazon GuardDuty',
    icon: Eye,
    description: 'Detección de amenazas inteligente usando ML.',
    concepts: [
      { name: 'Findings', desc: 'Alertas de actividad sospechosa' },
      { name: 'Detectors', desc: 'Análisis continuo de logs' },
      { name: 'Threat Intelligence', desc: 'Datos de fuentes externas de amenazas' },
      { name: 'Malware Detection', desc: 'Escaneo de EBS por malware' }
    ],
    bestPractices: [
      'Habilitar en todas las regiones',
      'Configurar notificaciones SNS',
      'Integrar con Security Hub',
      'Crear respuestas automatizadas con Lambda',
      'Revisar findings críticos diariamente'
    ],
    commands: `# Habilitar GuardDuty
aws guardduty create-detector --enable

# Listar findings
aws guardduty list-findings --detector-id xxxx

# Obtener detalle de finding
aws guardduty get-findings --detector-id xxxx --finding-ids xxxx`
  }
]

const iamPolicies = {
  title: 'Ejemplos de IAM Policies',
  examples: [
    {
      name: 'Principio de Mínimo Privilio (EC2 específico)',
      policy: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:StartInstances",
        "ec2:StopInstances",
        "ec2:DescribeInstances"
      ],
      "Resource": "arn:aws:ec2:us-east-1:123456789012:instance/i-0123456789abcdef0",
      "Condition": {
        "StringEquals": {
          "ec2:Region": "us-east-1"
        }
      }
    }
  ]
}`
    },
    {
      name: 'Acceso condicional por IP',
      policy: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Action": "*",
      "Resource": "*",
      "Condition": {
        "NotIpAddress": {
          "aws:SourceIp": [
            "192.0.2.0/24",
            "203.0.113.0/24"
          ]
        }
      }
    }
  ]
}`
    },
    {
      name: 'Rol de asumir con MFA requerido',
      policy: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"AWS": "arn:aws:iam::123456789012:root"},
      "Action": "sts:AssumeRole",
      "Condition": {
        "Bool": {"aws:MultiFactorAuthPresent": "true"}
      }
    }
  ]
}`
    }
  ]
}

const securityCompliance = [
  {
    framework: 'PCI DSS',
    description: 'Payment Card Industry Data Security Standard',
    services: ['KMS', 'WAF', 'GuardDuty', 'Config', 'CloudTrail'],
    keyControls: ['Encryption at rest/transit', 'Network segmentation', 'Access logging', 'Vulnerability scanning']
  },
  {
    framework: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act',
    services: ['KMS', 'CloudTrail', 'Config', 'Macie'],
    keyControls: ['PHI encryption', 'Audit trails', 'Access controls', 'BAA with AWS']
  },
  {
    framework: 'SOC 2',
    description: 'Service Organization Control 2',
    services: ['CloudTrail', 'Config', 'CloudWatch', 'IAM'],
    keyControls: ['Monitoring continuo', 'Change management', 'Access reviews']
  },
  {
    framework: 'GDPR',
    description: 'General Data Protection Regulation',
    services: ['KMS', 'Macie', 'S3', 'DynamoDB'],
    keyControls: ['Data classification', 'Right to deletion', 'Data encryption', 'Consent management']
  }
]

function Security() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Seguridad en AWS</h1>
        <p className="page-description">
          Seguridad en la nube sigue el modelo de responsabilidad compartida.
          AWS se encarga de la <strong>seguridad DE la nube</strong>;
          tú eres responsable de la <strong>seguridad EN la nube</strong>.
        </p>
      </div>

      {/* Security Services */}
      <section className="section">
        <h2 className="section-title">
          <Shield size={24} />
          Servicios de Seguridad Core
        </h2>

        <div className="card-grid">
          {securityServices.map((service, idx) => {
            const Icon = service.icon
            return (
              <div key={idx} className="card">
                <div className="card-header">
                  <div
                    className="card-icon"
                    style={{ background: '#eb575715', color: '#eb5757' }}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 className="card-title">{service.title}</h3>
                </div>

                <p className="card-content" style={{ marginBottom: '16px' }}>
                  {service.description}
                </p>

                <div style={{ marginBottom: '16px' }}>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: 'var(--text-secondary)',
                      marginBottom: '12px'
                    }}
                  >
                    Conceptos Clave
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {service.concepts.map((concept, cidx) => (
                      <div
                        key={cidx}
                        style={{
                          padding: '10px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: '8px'
                        }}
                      >
                        <div style={{ fontWeight: 500, fontSize: '0.9rem', marginBottom: '2px' }}>
                          {concept.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {concept.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
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
                    Best Practices
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem' }}>
                    {service.bestPractices.map((bp, bidx) => (
                      <li
                        key={bidx}
                        style={{
                          padding: '3px 0',
                          paddingLeft: '20px',
                          position: 'relative',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <CheckCircle
                          size={12}
                          style={{ position: 'absolute', left: 0, top: '6px', color: '#27ae60' }}
                        />
                        {bp}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="code-block">
                  <div className="code-header">
                    <span className="code-label">AWS CLI</span>
                  </div>
                  <pre>{service.commands}</pre>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* IAM Policy Examples */}
      <section className="section">
        <h2 className="section-title">
          <FileText size={24} />
          Ejemplos de IAM Policies
        </h2>

        <div className="card-grid" style={{ gridTemplateColumns: '1fr' }}>
          {iamPolicies.examples.map((example, idx) => (
            <div key={idx} className="card">
              <h4 className="card-title" style={{ marginBottom: '12px' }}>
                {example.name}
              </h4>
              <div className="code-block">
                <pre>{example.policy}</pre>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Compliance */}
      <section className="section">
        <h2 className="section-title">
          <CheckCircle size={24} />
          Marco de Cumplimiento
        </h2>

        <table className="data-table">
          <thead>
            <tr>
              <th>Framework</th>
              <th>Descripción</th>
              <th>Servicios AWS</th>
              <th>Controles Clave</th>
            </tr>
          </thead>
          <tbody>
            {securityCompliance.map((item, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 600 }}>{item.framework}</td>
                <td>{item.description}</td>
                <td>{item.services.join(', ')}</td>
                <td>
                  <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    {item.keyControls.map((control, cidx) => (
                      <li key={cidx}>{control}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Security Checklist */}
      <section className="section">
        <h2 className="section-title">
          <AlertTriangle size={24} />
          Checklist de Seguridad Enterprise
        </h2>

        <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
          <div className="card">
            <h4 className="card-title" style={{ marginBottom: '16px', color: '#27ae60' }}>
              <CheckCircle size={20} style={{ display: 'inline', marginRight: '8px' }} />
              Identity & Access
            </h4>
            <ul className="styled-list" style={{ fontSize: '0.9rem' }}>
              <li>MFA habilitado en todas las cuentas IAM</li>
              <li>No usar access keys en instancias EC2 (usar roles)</li>
              <li>Rotar access keys cada 90 días</li>
              <li>Revisar IAM credentials report mensualmente</li>
              <li>Usar IAM Access Analyzer</li>
              <li>Implementar SCPs en Organizations</li>
            </ul>
          </div>

          <div className="card">
            <h4 className="card-title" style={{ marginBottom: '16px', color: '#2f80ed' }}>
              <Lock size={20} style={{ display: 'inline', marginRight: '8px' }} />
              Data Protection
            </h4>
            <ul className="styled-list" style={{ fontSize: '0.9rem' }}>
              <li>Encryption at rest en todos los servicios</li>
              <li>Encryption in transit (TLS 1.2+)</li>
              <li>S3 bucket policies restrictivas</li>
              <li>S3 Block Public Access habilitado</li>
              <li>Secrets en Secrets Manager, no en código</li>
              <li>Macie para PII detection en S3</li>
            </ul>
          </div>

          <div className="card">
            <h4 className="card-title" style={{ marginBottom: '16px', color: '#eb5757' }}>
              <Shield size={20} style={{ display: 'inline', marginRight: '8px' }} />
              Network Security
            </h4>
            <ul className="styled-list" style={{ fontSize: '0.9rem' }}>
              <li>Security groups restrictivos</li>
              <li>No abrir SSH (22) a 0.0.0.0/0</li>
              <li>VPC Flow Logs habilitados</li>
              <li>WAF en todos los endpoints públicos</li>
              <li>Private subnets para workloads</li>
              <li>Network segmentation por tier</li>
            </ul>
          </div>

          <div className="card">
            <h4 className="card-title" style={{ marginBottom: '16px', color: '#f2994a' }}>
              <Eye size={20} style={{ display: 'inline', marginRight: '8px' }} />
              Monitoring & Logging
            </h4>
            <ul className="styled-list" style={{ fontSize: '0.9rem' }}>
              <li>CloudTrail habilitado en todas las regiones</li>
              <li>CloudWatch Logs con retención adecuada</li>
              <li>GuardDuty habilitado</li>
              <li>Security Hub para visibilidad central</li>
              <li>AWS Config para compliance monitoring</li>
              <li>Alertas de seguridad configuradas</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="note note-danger" style={{ marginTop: '32px' }}>
        <strong>Recordatorio de Seguridad:</strong> La seguridad es un proceso continuo,
        no un estado final. Realiza auditorías regulares, mantente actualizado con las
        últimas amenazas, y adopta el principio de{' '}
        <strong>Zero Trust</strong>: nunca confíes, siempre verifica.
      </div>
    </div>
  )
}

export default Security
