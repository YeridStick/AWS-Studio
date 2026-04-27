import {
  Container,
  Server,
  Network,
  Shield,
  Database,
  Activity,
  Layers,
  Zap,
  Box
} from 'lucide-react'

const eksComponents = [
  {
    title: 'EKS Control Plane',
    icon: Server,
    description: 'Managed Kubernetes control plane. AWS gestiona el API server, etcd, y controladores.',
    features: [
      'Alta disponibilidad multi-AZ',
      'Auto-scaling automático',
      'Integración con IAM para RBAC',
      'Private endpoint opcional',
      'Version upgrades manejados'
    ],
    considerations: [
      'Costo fijo por cluster (~$72/mes)',
      'Control plane no accesible directamente',
      'etcd backups automáticos'
    ]
  },
  {
    title: 'Managed Node Groups',
    icon: Box,
    description: 'Nodos EC2 administrados por AWS. Auto-escalado, patching, y updates simplificados.',
    features: [
      'Node auto-repair',
      'Version updates con un click',
      'AMI optimizada para EKS',
      'Integración con ASG',
      'Spot Instances support'
    ],
    considerations: [
      'Instance types: t3, m5, c5, etc.',
      'Mínimo 2 nodos recomendado',
      'Taints y labels configurables'
    ]
  },
  {
    title: 'Fargate Profiles',
    icon: Zap,
    description: 'Ejecuta pods sin gestionar nodos. Serverless compute para Kubernetes.',
    features: [
      'No hay nodos que gestionar',
      'Pago por uso por pod',
      'Namespace-based scheduling',
      'Right-sizing automático',
      'Pod sandboxing'
    ],
    considerations: [
      'Limitaciones de privilegios',
      'No DaemonSets soportados',
      'Carga de trabajo stateless preferida'
    ]
  }
]

const kubernetesObjects = [
  {
    kind: 'Deployment',
    apiVersion: 'apps/v1',
    purpose: 'Gestiona ReplicaSets y proporciona declarative updates para Pods',
    keyFields: ['replicas', 'selector', 'template', 'strategy'],
    example: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80`
  },
  {
    kind: 'Service',
    apiVersion: 'v1',
    purpose: 'Expone pods como network service interno o externo',
    keyFields: ['selector', 'ports', 'type', 'sessionAffinity'],
    example: `apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer`
  },
  {
    kind: 'ConfigMap',
    apiVersion: 'v1',
    purpose: 'Almacena configuración no-confidencial como pares key-value',
    keyFields: ['data', 'binaryData'],
    example: `apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  database.properties: |
    database.host=mysql
    database.port=3306
  logging.level: "INFO"`
  },
  {
    kind: 'Secret',
    apiVersion: 'v1',
    purpose: 'Almacena información sensible (passwords, tokens, keys)',
    keyFields: ['data', 'stringData', 'type'],
    example: `apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  username: YWRtaW4=  # base64
  password: cGFzc3dvcmQxMjM=  # base64
stringData:
  # Usar stringData para evitar base64 manual
  host: mysql.internal`
  },
  {
    kind: 'Ingress',
    apiVersion: 'networking.k8s.io/v1',
    purpose: 'Reglas de routing HTTP/HTTPS hacia services',
    keyFields: ['rules', 'tls', 'ingressClassName'],
    example: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
spec:
  ingressClassName: alb
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app-service
            port:
              number: 80`
  },
  {
    kind: 'PersistentVolumeClaim',
    apiVersion: 'v1',
    purpose: 'Solicita storage persistente para pods',
    keyFields: ['accessModes', 'resources', 'storageClassName'],
    example: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-pvc
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: gp3`
  }
]

const kubectlCommands = [
  {
    category: 'Información del Cluster',
    commands: [
      { cmd: 'kubectl cluster-info', desc: 'Muestra información del cluster' },
      { cmd: 'kubectl version', desc: 'Versión del cliente y servidor' },
      { cmd: 'kubectl get nodes -o wide', desc: 'Lista nodos con detalles' },
      { cmd: 'kubectl describe node <node>', desc: 'Información detallada de un nodo' }
    ]
  },
  {
    category: 'Gestión de Pods',
    commands: [
      { cmd: 'kubectl get pods', desc: 'Lista pods en namespace actual' },
      { cmd: 'kubectl get pods --all-namespaces', desc: 'Lista pods en todos los namespaces' },
      { cmd: 'kubectl describe pod <pod>', desc: 'Detalles de un pod incluyendo eventos' },
      { cmd: 'kubectl logs <pod>', desc: 'Logs del pod' },
      { cmd: 'kubectl logs <pod> -f', desc: 'Logs en tiempo real' },
      { cmd: 'kubectl logs <pod> --previous', desc: 'Logs de container anterior (crash)' },
      { cmd: 'kubectl exec -it <pod> -- /bin/sh', desc: 'Shell interactivo en pod' },
      { cmd: 'kubectl port-forward <pod> 8080:80', desc: 'Port forward al pod' },
      { cmd: 'kubectl delete pod <pod>', desc: 'Eliminar un pod' },
      { cmd: 'kubectl top pod', desc: 'Uso de recursos de pods' }
    ]
  },
  {
    category: 'Deployments',
    commands: [
      { cmd: 'kubectl get deployments', desc: 'Lista deployments' },
      { cmd: 'kubectl describe deployment <deployment>', desc: 'Detalles del deployment' },
      { cmd: 'kubectl rollout status deployment/<deployment>', desc: 'Estado del rollout' },
      { cmd: 'kubectl rollout history deployment/<deployment>', desc: 'Historial de rollouts' },
      { cmd: 'kubectl rollout undo deployment/<deployment>', desc: 'Rollback al deployment anterior' },
      { cmd: 'kubectl set image deployment/<deployment> <container>=<image>:<tag>', desc: 'Actualizar imagen' },
      { cmd: 'kubectl scale deployment <deployment> --replicas=5', desc: 'Escalar deployment' }
    ]
  },
  {
    category: 'Services & Networking',
    commands: [
      { cmd: 'kubectl get services', desc: 'Lista services' },
      { cmd: 'kubectl get svc -o wide', desc: 'Services con detalles' },
      { cmd: 'kubectl describe svc <service>', desc: 'Detalles del service incluyendo endpoints' },
      { cmd: 'kubectl get endpoints <service>', desc: 'Endpoints del service' },
      { cmd: 'kubectl get ingress', desc: 'Lista ingress rules' },
      { cmd: 'kubectl describe ingress <ingress>', desc: 'Detalles del ingress' }
    ]
  },
  {
    category: 'ConfigMaps & Secrets',
    commands: [
      { cmd: 'kubectl get configmaps', desc: 'Lista configmaps' },
      { cmd: 'kubectl describe cm <configmap>', desc: 'Detalles del configmap' },
      { cmd: 'kubectl get cm <configmap> -o yaml', desc: 'Configmap en formato YAML' },
      { cmd: 'kubectl get secrets', desc: 'Lista secrets (nombres solo)' },
      { cmd: 'kubectl describe secret <secret>', desc: 'Detalles del secret (sin valores)' },
      { cmd: 'kubectl get secret <secret> -o jsonpath={.data.password} | base64 -d', desc: 'Decodificar secret' },
      { cmd: 'kubectl create secret generic <name> --from-literal=key=value', desc: 'Crear secret inline' },
      { cmd: 'kubectl create secret generic <name> --from-file=./file.txt', desc: 'Crear secret desde archivo' }
    ]
  },
  {
    category: 'Troubleshooting',
    commands: [
      { cmd: 'kubectl get events --sort-by=.metadata.creationTimestamp', desc: 'Eventos ordenados por tiempo' },
      { cmd: 'kubectl get events --field-selector type=Warning', desc: 'Solo eventos de warning' },
      { cmd: 'kubectl get pods --field-selector status.phase!=Running', desc: 'Pods no running' },
      { cmd: 'kubectl logs <pod> --all-containers', desc: 'Logs de todos los containers' },
      { cmd: 'kubectl auth can-i <verb> <resource>', desc: 'Verificar permisos RBAC' },
      { cmd: 'kubectl run debug --rm -it --image=busybox --restart=Never -- /bin/sh', desc: 'Pod de debug temporal' },
      { cmd: 'kubectl cp <pod>:/path/file ./file', desc: 'Copiar archivo desde pod' },
      { cmd: 'kubectl cp ./file <pod>:/path/file', desc: 'Copiar archivo a pod' }
    ]
  }
]

const eksStorage = [
  {
    driver: 'EBS CSI Driver',
    useCase: 'Block storage para pods. Similar a discos duros virtuales.',
    accessModes: ['ReadWriteOnce', 'ReadWriteOncePod'],
    performance: 'GP3: 3,000-16,000 IOPS, 125-1,000 MB/s',
    bestFor: 'Bases de datos, stateful apps que requieren filesystem local'
  },
  {
    driver: 'EFS CSI Driver',
    useCase: 'NFS compartido. Múltiples pods pueden leer/escribir simultáneamente.',
    accessModes: ['ReadWriteMany', 'ReadWriteOnce'],
    performance: 'Bursting/Provisioned throughput',
    bestFor: 'CMS, WordPress, share data entre pods, ML training data'
  },
  {
    driver: 'FSx for Lustre CSI',
    useCase: 'High-performance parallel filesystem',
    accessModes: ['ReadWriteMany'],
    performance: 'Hasta 100+ GB/s, millions of IOPS',
    bestFor: 'HPC, ML, EDA, video processing'
  },
  {
    driver: 'S3 CSI Driver',
    useCase: 'Mount S3 buckets como filesystem',
    accessModes: ['ReadOnlyMany', 'ReadWriteMany'],
    performance: 'Limitado por latencia de S3',
    bestFor: 'Archivos de solo lectura, modelos ML, datasets grandes'
  }
]

function Kubernetes() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Amazon EKS / Kubernetes</h1>
        <p className="page-description">
          Kubernetes (K8s) es la plataforma estándar para orquestación de contenedores.
          Amazon EKS (Elastic Kubernetes Service) es el servicio managed de Kubernetes en AWS.
        </p>
      </div>

      {/* EKS Architecture */}
      <section className="section">
        <h2 className="section-title">
          <Container size={24} />
          Arquitectura EKS
        </h2>

        <div className="diagram-container">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px'
            }}
          >
            <div
              className="flow-node node-aws"
              style={{
                maxWidth: '400px',
                background: 'rgba(255, 153, 0, 0.2)',
                borderColor: 'rgba(255, 153, 0, 0.4)'
              }}
            >
              <div className="flow-node-title">
                <Server size={20} style={{ display: 'inline', marginRight: '8px' }} />
                EKS Control Plane (Managed by AWS)
              </div>
              <div className="flow-node-desc">
                API Server · etcd · Scheduler · Controller Manager
              </div>
            </div>

            <div className="flow-arrow" />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                width: '100%',
                maxWidth: '800px'
              }}
            >
              <div
                className="flow-node node-k8s"
                style={{
                  background: 'rgba(142, 68, 173, 0.2)',
                  borderColor: 'rgba(142, 68, 173, 0.4)'
                }}
              >
                <div className="flow-node-title">
                  <Box size={18} style={{ marginRight: '6px' }} />
                  Managed Node Group
                </div>
                <div className="flow-node-desc">EC2 instances con Amazon EKS AMI</div>
              </div>

              <div
                className="flow-node node-serverless"
                style={{
                  background: 'rgba(243, 156, 18, 0.2)',
                  borderColor: 'rgba(243, 156, 18, 0.4)'
                }}
              >
                <div className="flow-node-title">
                  <Zap size={18} style={{ marginRight: '6px' }} />
                  Fargate
                </div>
                <div className="flow-node-desc">Serverless pods sin nodos</div>
              </div>

              <div
                className="flow-node node-network"
                style={{
                  background: 'rgba(39, 174, 96, 0.2)',
                  borderColor: 'rgba(39, 174, 96, 0.4)'
                }}
              >
                <div className="flow-node-title">
                  <Network size={18} style={{ marginRight: '6px' }} />
                  VPC CNI
                </div>
                <div className="flow-node-desc">Native VPC networking para pods</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-grid" style={{ marginTop: '32px' }}>
          {eksComponents.map((component, idx) => {
            const Icon = component.icon
            return (
              <div key={idx} className="card">
                <div className="card-header">
                  <div
                    className="card-icon"
                    style={{ background: '#8e44ad15', color: '#8e44ad' }}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 className="card-title">{component.title}</h3>
                </div>

                <p className="card-content" style={{ marginBottom: '16px' }}>
                  {component.description}
                </p>

                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
                    Features:
                  </strong>
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: '8px 0 0',
                      fontSize: '0.85rem'
                    }}
                  >
                    {component.features.map((feature, fidx) => (
                      <li
                        key={fidx}
                        style={{
                          padding: '2px 0',
                          paddingLeft: '16px',
                          position: 'relative',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <span style={{ position: 'absolute', left: 0, color: '#8e44ad' }}>
                          •
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
                    Consideraciones:
                  </strong>
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: '8px 0 0',
                      fontSize: '0.85rem'
                    }}
                  >
                    {component.considerations.map((cons, cidx) => (
                      <li
                        key={cidx}
                        style={{
                          padding: '2px 0',
                          paddingLeft: '16px',
                          position: 'relative',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <span style={{ position: 'absolute', left: 0, color: '#f2994a' }}>
                          →
                        </span>
                        {cons}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Kubernetes Objects */}
      <section className="section">
        <h2 className="section-title">
          <Layers size={24} />
          Objetos Kubernetes Esenciales
        </h2>

        <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
          {kubernetesObjects.map((obj, idx) => (
            <div key={idx} className="card">
              <div style={{ marginBottom: '12px' }}>
                <h3 className="card-title" style={{ display: 'inline', marginRight: '12px' }}>
                  {obj.kind}
                </h3>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}
                >
                  {obj.apiVersion}
                </span>
              </div>

              <p className="card-content" style={{ marginBottom: '12px', fontSize: '0.9rem' }}>
                {obj.purpose}
              </p>

              <div style={{ marginBottom: '12px' }}>
                <strong style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Key Fields:{' '}
                </strong>
                <span style={{ fontSize: '0.8rem' }}>
                  {obj.keyFields.join(', ')}
                </span>
              </div>

              <div className="code-block">
                <pre>{obj.example}</pre>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* kubectl Commands */}
      <section className="section">
        <h2 className="section-title">
          <Activity size={24} />
          Comandos kubectl por Categoría
        </h2>

        <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))' }}>
          {kubectlCommands.map((category, idx) => (
            <div key={idx} className="card">
              <h3
                className="card-title"
                style={{
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid var(--line)'
                }}
              >
                {category.category}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {category.commands.map((cmd, cidx) => (
                  <div
                    key={cidx}
                    style={{
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      fontSize: '0.85rem'
                    }}
                  >
                    <code
                      style={{
                        display: 'block',
                        color: '#4ade80',
                        marginBottom: '4px',
                        fontFamily: 'monospace'
                      }}
                    >
                      $ {cmd.cmd}
                    </code>
                    <span style={{ color: 'var(--text-secondary)' }}>{cmd.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Storage */}
      <section className="section">
        <h2 className="section-title">
          <Database size={24} />
          Almacenamiento en EKS
        </h2>

        <table className="data-table">
          <thead>
            <tr>
              <th>Driver</th>
              <th>Use Case</th>
              <th>Access Modes</th>
              <th>Performance</th>
              <th>Best For</th>
            </tr>
          </thead>
          <tbody>
            {eksStorage.map((storage, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 500 }}>{storage.driver}</td>
                <td>{storage.useCase}</td>
                <td>{storage.accessModes.join(', ')}</td>
                <td>{storage.performance}</td>
                <td>{storage.bestFor}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="note note-info" style={{ marginTop: '24px' }}>
          <strong>Nota de Storage:</strong> Elige el driver de CSI según tus necesidades:
          <ul className="styled-list" style={{ marginTop: '12px' }}>
            <li>
              <strong>EBS:</strong> Por defecto, pero solo RWO (single pod)
            </li>
            <li>
              <strong>EFS:</strong> Cuando múltiples pods necesitan acceder a los mismos datos
            </li>
            <li>
              <strong>FSx Lustre:</strong> Para workloads HPC que necesitan throughput extremo
            </li>
          </ul>
        </div>
      </section>

      {/* EKS Best Practices */}
      <section className="section">
        <h2 className="section-title">
          <Shield size={24} />
          Best Practices EKS
        </h2>

        <div className="card-grid">
          <div className="card">
            <h4 className="card-title" style={{ marginBottom: '12px' }}>Seguridad</h4>
            <ul className="styled-list" style={{ fontSize: '0.9rem' }}>
              <li>Habilitar IAM Roles for Service Accounts (IRSA)</li>
              <li>Network policies con Calico o Cilium</li>
              <li>Pod Security Standards/Admission</li>
              <li>Secrets en AWS Secrets Manager</li>
              <li>Private endpoint para control plane</li>
            </ul>
          </div>

          <div className="card">
            <h4 className="card-title" style={{ marginBottom: '12px' }}>Escalabilidad</h4>
            <ul className="styled-list" style={{ fontSize: '0.9rem' }}>
              <li>Cluster Autoscaler o Karpenter</li>
              <li>Horizontal Pod Autoscaler (HPA)</li>
              <li>Vertical Pod Autoscaler (VPA) para recomendaciones</li>
              <li>Overprovisioning para rapid scaling</li>
            </ul>
          </div>

          <div className="card">
            <h4 className="card-title" style={{ marginBottom: '12px' }}>Observabilidad</h4>
            <ul className="styled-list" style={{ fontSize: '0.9rem' }}>
              <li>Container Insights (CloudWatch)</li>
              <li>Prometheus + Grafana</li>
              <li>Fluent Bit para logs</li>
              <li>X-Ray para tracing distribuido</li>
            </ul>
          </div>

          <div className="card">
            <h4 className="card-title" style={{ marginBottom: '12px' }}>Cost Optimization</h4>
            <ul className="styled-list" style={{ fontSize: '0.9rem' }}>
              <li>Spot Instances para workloads tolerantes</li>
              <li>Fargate para workloads sporádicas</li>
              <li>Right-sizing de pods</li>
              <li>Consolidation con Karpenter</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="note" style={{ marginTop: '32px' }}>
        <strong>EKS Add-ons recomendados:</strong>
        <ul className="styled-list" style={{ marginTop: '12px' }}>
          <li>
            <strong>VPC CNI:</strong> Networking nativo de VPC (incluido)
          </li>
          <li>
            <strong>CoreDNS:</strong> DNS cluster (incluido)
          </li>
          <li>
            <strong>kube-proxy:</strong> Networking de servicios (incluido)
          </li>
          <li>
            <strong>EBS CSI Driver:</strong> Para storage persistente
          </li>
          <li>
            <strong>EFS CSI Driver:</strong> Para shared storage
          </li>
          <li>
            <strong>Amazon GuardDuty:</strong> Threat detection
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Kubernetes
