import { AlertTriangle, Activity, Search, Terminal, CheckCircle, XCircle, Clock, Database } from 'lucide-react'

const troubleshootingCategories = [
  {
    category: 'Conectividad & Networking',
    icon: Activity,
    issues: [
      {
        symptom: 'No puedo conectar a instancia EC2 via SSH',
        causes: [
          'Security Group no permite puerto 22',
          'Key pair incorrecto o permisos del archivo .pem',
          'Instancia no tiene IP pública',
          'Network ACL bloqueando tráfico',
          'Instancia en subnet privada sin bastion'
        ],
        solutions: [
          'aws ec2 describe-security-groups --group-ids sg-xxxx --query "SecurityGroups[0].IpPermissions"',
          'chmod 400 my-key.pem && ssh -i my-key.pem ec2-user@<ip>',
          'Verificar subnet tiene map-public-ip-on-launch: true',
          'Revisar NACLs: aws ec2 describe-network-acls',
          'Usar bastion host o AWS Systems Manager Session Manager'
        ]
      },
      {
        symptom: 'NLB/ALB targets unhealthy',
        causes: [
          'Health check path incorrecto',
          'Security Group bloqueando tráfico del load balancer',
          'Aplicación no responde en puerto esperado',
          'Timeout de health check muy corto'
        ],
        solutions: [
          'aws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:...',
          'Verificar security groups permiten tráfico desde el load balancer',
          'Verificar aplicación escucha en 0.0.0.0 (no localhost)',
          'Ajustar health check interval y timeout'
        ]
      },
      {
        symptom: 'RDS no accesible desde aplicación',
        causes: [
          'Security Group de RDS no permite tráfico desde EC2/EKS',
          'RDS en subnet privada sin NAT Gateway',
          'VPC peering incorrecto si RDS está en otra VPC'
        ],
        solutions: [
          'aws rds describe-db-instances --query "DBInstances[*].[DBInstanceIdentifier,VpcSecurityGroups]"',
          'aws ec2 authorize-security-group-ingress --group-id sg-rds --source-group sg-app',
          'Verificar route tables tienen route a NAT Gateway'
        ]
      }
    ]
  },
  {
    category: 'EKS & Kubernetes',
    icon: Terminal,
    issues: [
      {
        symptom: 'Pod en estado CrashLoopBackOff',
        causes: [
          'Aplicación falla al iniciar',
          'Error en comando/entrypoint',
          'Recursos insuficientes',
          'ConfigMap/Secret faltante',
          'Probes configuradas incorrectamente'
        ],
        solutions: [
          'kubectl logs <pod> --previous',
          'kubectl describe pod <pod>',
          'kubectl get events --field-selector involvedObject.name=<pod>',
          'Verificar resource requests/limits',
          'Revisar configuración de liveness/readiness probes'
        ]
      },
      {
        symptom: 'Pod en estado Pending',
        causes: [
          'No hay nodos disponibles',
          'Resource requests muy altos',
          'Node selector/taint mismatch',
          'PersistentVolume no disponible',
          'Quota limits alcanzados'
        ],
        solutions: [
          'kubectl describe pod <pod> | grep Events -A 10',
          'kubectl get nodes',
          'kubectl top nodes',
          'kubectl get pv,pvc',
          'kubectl describe resourcequota'
        ]
      },
      {
        symptom: 'ImagePullBackOff o ErrImagePull',
        causes: [
          'Imagen no existe en registry',
          'Credenciales de registry incorrectas',
          'Tag de imagen incorrecto',
          'Private registry sin imagePullSecrets'
        ],
        solutions: [
          'Verificar imagen existe: docker pull <image>:<tag>',
          'Crear secret para ECR: kubectl create secret docker-registry ...',
          'Verificar service account tiene imagePullSecrets'
        ]
      },
      {
        symptom: 'No puedo conectar al cluster EKS',
        causes: [
          'kubeconfig no actualizado',
          'IAM permissions insuficientes',
          'Cluster endpoint en modo privado',
          'aws-auth ConfigMap incorrecto'
        ],
        solutions: [
          'aws eks update-kubeconfig --region us-east-1 --name <cluster>',
          'aws sts get-caller-identity',
          'kubectl describe configmap aws-auth -n kube-system',
          'Verificar IAM role tiene política AmazonEKSClusterPolicy'
        ]
      }
    ]
  },
  {
    category: 'IAM & Seguridad',
    icon: Terminal,
    issues: [
      {
        symptom: 'Access Denied en cualquier operación',
        causes: [
          'IAM policy no tiene permisos necesarios',
          'Resource policy bloqueando acceso',
          'Session expirada',
          'MFA requerido pero no proporcionado'
        ],
        solutions: [
          'aws sts get-caller-identity',
          'aws iam simulate-principal-policy --policy-source-arn arn:aws:iam::123456789012:user/developer --action-names s3:GetObject',
          'Verificar resource-based policies',
          'Si usando MFA: incluir session token'
        ]
      },
      {
        symptom: 'No puedo asumir role',
        causes: [
          'Trust policy no permite al principal',
          'ExternalId requerida pero no proporcionada',
          'MFA requerido para assume-role',
          'Role no existe o ARN incorrecto'
        ],
        solutions: [
          'aws iam get-role --role-name MyRole --query Role.AssumeRolePolicyDocument',
          'Verificar Principal en trust policy coincide con identidad',
          'aws sts assume-role --role-arn ... --role-session-name test --serial-number arn:aws:iam::123456789012:mfa/user --token-code 123456'
        ]
      }
    ]
  },
  {
    category: 'Storage & Bases de Datos',
    icon: Database,
    issues: [
      {
        symptom: 'S3 403 Forbidden',
        causes: [
          'Bucket policy deniega acceso',
          'Object no es público',
          'KMS key no permite uso',
          'Requester Pays bucket sin confirmación'
        ],
        solutions: [
          'aws s3api get-bucket-policy --bucket my-bucket',
          'aws s3api get-object-acl --bucket my-bucket --key file.txt',
          'aws kms decrypt --ciphertext-blob ... (probar acceso a key)',
          'Usar --request-payer requester en comandos'
        ]
      },
      {
        symptom: 'RDS Storage Full',
        causes: [
          'No auto-scaling configurado',
          'Logs consumiendo espacio',
          'Blobs grandes en base de datos'
        ],
        solutions: [
          'aws rds describe-db-instances --query "DBInstances[*].[DBInstanceIdentifier,AllocatedStorage]"',
          'aws rds modify-db-instance --db-instance-identifier mydb --allocated-storage 100 --apply-immediately',
          'Habilitar Storage Auto Scaling para crecimiento futuro'
        ]
      },
      {
        symptom: 'EBS Volume no se adjunta',
        causes: [
          'Volume en AZ diferente a instancia',
          'Volume ya adjunto a otra instancia',
          'Tipo de volume no compatible con tipo de instancia'
        ],
        solutions: [
          'aws ec2 describe-volumes --volume-ids vol-xxxx',
          'aws ec2 describe-instances --instance-ids i-xxxx --query Reservations[0].Instances[0].Placement.AvailabilityZone',
          'Desadjuntar de otra instancia primero'
        ]
      }
    ]
  }
]

const commonErrors = [
  {
    error: 'InvalidClientTokenId',
    meaning: 'Access key ID inválida o no existe',
    fix: 'Verificar AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY'
  },
  {
    error: 'SignatureDoesNotMatch',
    meaning: 'Secret key incorrecta',
    fix: 'Verificar AWS_SECRET_ACCESS_KEY está correcta'
  },
  {
    error: 'RequestTimeTooSkewed',
    meaning: 'Diferencia de tiempo entre cliente y AWS > 5 minutos',
    fix: 'Sincronizar reloj del sistema: sudo ntpdate pool.ntp.org'
  },
  {
    error: 'Throttling',
    meaning: 'Rate limit excedido',
    fix: 'Implementar retries con backoff exponencial'
  },
  {
    error: 'InsufficientInstanceCapacity',
    meaning: 'No hay capacidad disponible del tipo de instancia solicitada',
    fix: 'Intentar en otra AZ, usar tipos alternativos, o solicitar Spot'
  },
  {
    error: 'OptInRequired',
    meaning: 'Se requiere aceptar términos para el servicio',
    fix: 'Ir a AWS Console y habilitar el servicio manualmente'
  }
]

const debuggingTools = [
  {
    name: 'VPC Flow Logs',
    description: 'Captura información sobre tráfico IP en VPC',
    usage: 'aws ec2 create-flow-logs --resource-ids vpc-xxxx --traffic-type ALL --log-destination-type cloud-watch-logs --log-group-name vpc-flow-logs'
  },
  {
    name: 'CloudTrail',
    description: 'Log de todas las llamadas a API de AWS',
    usage: 'aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=CreateInstance'
  },
  {
    name: 'X-Ray',
    description: 'Tracing distribuido para aplicaciones',
    usage: 'AWS X-Ray SDK en aplicación + habilitar en servicio'
  },
  {
    name: 'CloudWatch Logs Insights',
    description: 'Query language para logs',
    usage: 'fields @timestamp, @message | filter @message like /ERROR/ | sort @timestamp desc | limit 20'
  },
  {
    name: 'Reachability Analyzer',
    description: 'Analiza paths de red entre dos recursos',
    usage: 'AWS Console > VPC > Reachability Analyzer'
  }
]

function Troubleshooting() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Troubleshooting AWS</h1>
        <p className="page-description">
          Guía de diagnóstico para problemas comunes en AWS. Incluye síntomas,
          causas probables y pasos de resolución con comandos.
        </p>
      </div>

      {/* Error Code Reference */}
      <section className="section">
        <h2 className="section-title">
          <XCircle size={24} />
          Códigos de Error Comunes
        </h2>

        <table className="data-table">
          <thead>
            <tr>
              <th>Error</th>
              <th>Significado</th>
              <th>Solución</th>
            </tr>
          </thead>
          <tbody>
            {commonErrors.map((error, idx) => (
              <tr key={idx}>
                <td>
                  <code style={{ color: '#f87171' }}>{error.error}</code>
                </td>
                <td>{error.meaning}</td>
                <td>{error.fix}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Troubleshooting Categories */}
      {troubleshootingCategories.map((cat, idx) => {
        const Icon = cat.icon
        return (
          <section key={idx} className="section">
            <h2 className="section-title">
              <Icon size={24} />
              {cat.category}
            </h2>

            <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
              {cat.issues.map((issue, iidx) => (
                <div key={iidx} className="card">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '16px',
                      paddingBottom: '12px',
                      borderBottom: '1px solid var(--line)'
                    }}
                  >
                    <AlertTriangle size={20} color="#f2994a" />
                    <h3 className="card-title" style={{ margin: 0, fontSize: '1.05rem' }}>
                      {issue.symptom}
                    </h3>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: '#f87171',
                        marginBottom: '8px'
                      }}
                    >
                      Causas Probables
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem' }}>
                      {issue.causes.map((cause, cidx) => (
                        <li
                          key={cidx}
                          style={{
                            padding: '4px 0',
                            paddingLeft: '16px',
                            position: 'relative',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          <span style={{ position: 'absolute', left: 0, color: '#f87171' }}>•</span>
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: '#4ade80',
                        marginBottom: '8px'
                      }}
                    >
                      Soluciones / Comandos
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem' }}>
                      {issue.solutions.map((sol, sidx) => (
                        <li
                          key={sidx}
                          style={{
                            padding: '6px 0',
                            paddingLeft: '20px',
                            position: 'relative',
                            color: 'var(--text)',
                            fontFamily: sol.startsWith('aws') || sol.startsWith('kubectl') ? 'JetBrains Mono, monospace' : 'inherit',
                            background: sol.startsWith('aws') || sol.startsWith('kubectl') ? 'rgba(74, 222, 128, 0.05)' : 'transparent',
                            borderRadius: '4px',
                            marginBottom: '4px'
                          }}
                        >
                          <CheckCircle
                            size={12}
                            style={{ position: 'absolute', left: 0, top: '10px', color: '#4ade80' }}
                          />
                          {sol}
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

      {/* Debugging Tools */}
      <section className="section">
        <h2 className="section-title">
          <Search size={24} />
          Herramientas de Debugging
        </h2>

        <div className="card-grid">
          {debuggingTools.map((tool, idx) => (
            <div key={idx} className="card">
              <h3 className="card-title" style={{ marginBottom: '8px' }}>
                {tool.name}
              </h3>
              <p className="card-content" style={{ marginBottom: '12px', fontSize: '0.9rem' }}>
                {tool.description}
              </p>
              <div className="code-block">
                <pre style={{ fontSize: '0.8rem' }}>{tool.usage}</pre>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Troubleshooting Methodology */}
      <section className="section">
        <h2 className="section-title">
          <Activity size={24} />
          Metodología de Troubleshooting
        </h2>

        <div className="card-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="card">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px'
              }}
            >
              {[
                {
                  step: 1,
                  title: 'Define el Problema',
                  desc: '¿Qué está pasando vs qué debería pasar? Recopila síntomas específicos.'
                },
                {
                  step: 2,
                  title: 'Recopila Información',
                  desc: 'Logs, métricas, eventos recientes, cambios en la infraestructura.'
                },
                {
                  step: 3,
                  title: 'Forma Hipótesis',
                  desc: 'Basado en el conocimiento del sistema y patrones comunes.'
                },
                {
                  step: 4,
                  title: 'Prueba Hipótesis',
                  desc: 'Usa herramientas de debugging para confirmar o rechazar.'
                },
                {
                  step: 5,
                  title: 'Implementa Solución',
                  desc: 'Aplica el fix, verifica el resultado, documenta.'
                },
                {
                  step: 6,
                  title: 'Monitorea',
                  desc: 'Asegura que el problema está resuelto y no hay regresiones.'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '20px',
                    background: 'rgba(47, 128, 237, 0.1)',
                    border: '1px solid rgba(47, 128, 237, 0.3)',
                    borderRadius: '12px',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '20px',
                      width: '28px',
                      height: '28px',
                      background: '#2f80ed',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'white'
                    }}
                  >
                    {item.step}
                  </div>
                  <h4 style={{ marginTop: '8px', marginBottom: '8px', fontSize: '1rem' }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="note" style={{ marginTop: '32px' }}>
        <strong>Pro Tip:</strong> Cuando todo falla, revisa los básicos:
        <ul className="styled-list" style={{ marginTop: '12px' }}>
          <li>¿Estás en la región correcta? (aws configure get region)</li>
          <li>¿Tienes los permisos necesarios? (aws sts get-caller-identity)</li>
          <li>¿Los IDs de recursos son correctos?</li>
          <li>¿Hubo cambios recientes en la infraestructura?</li>
          <li>¿AWS Status Dashboard muestra incidentes?</li>
        </ul>
      </div>
    </div>
  )
}

export default Troubleshooting
