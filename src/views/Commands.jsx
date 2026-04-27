import { Terminal, Copy, CheckCircle, Database, Network, Server, Shield, Container } from 'lucide-react'
import { useState } from 'react'

const commandCategories = [
  {
    title: 'Configuración AWS CLI',
    icon: Terminal,
    description: 'Configuración inicial y perfiles',
    commands: [
      { cmd: 'aws configure', desc: 'Configurar credenciales por defecto (access key, secret, region)' },
      { cmd: 'aws configure --profile production', desc: 'Configurar un perfil específico' },
      { cmd: 'aws configure list', desc: 'Listar configuración actual' },
      { cmd: 'aws configure list-profiles', desc: 'Listar todos los perfiles configurados' },
      { cmd: 'export AWS_PROFILE=production', desc: 'Usar un perfil específico (bash)' },
      { cmd: 'aws sts get-caller-identity', desc: 'Verificar identidad actual' },
      { cmd: 'aws iam list-account-aliases', desc: 'Ver alias de la cuenta' }
    ]
  },
  {
    title: 'EC2 - Compute',
    icon: Server,
    description: 'Gestión de instancias EC2 y recursos relacionados',
    commands: [
      { cmd: 'aws ec2 describe-instances', desc: 'Listar todas las instancias' },
      { cmd: 'aws ec2 describe-instances --instance-ids i-xxxx', desc: 'Detalles de instancia específica' },
      { cmd: 'aws ec2 run-instances --image-id ami-xxxx --instance-type t3.micro --key-name my-key --security-group-ids sg-xxxx --subnet-id subnet-xxxx', desc: 'Crear nueva instancia' },
      { cmd: 'aws ec2 start-instances --instance-ids i-xxxx', desc: 'Iniciar instancia' },
      { cmd: 'aws ec2 stop-instances --instance-ids i-xxxx', desc: 'Detener instancia' },
      { cmd: 'aws ec2 terminate-instances --instance-ids i-xxxx', desc: 'Terminar instancia' },
      { cmd: 'aws ec2 describe-images --owners amazon --filters Name=name,Values=amzn2-ami-hvm*', desc: 'Buscar AMIs de Amazon Linux 2' },
      { cmd: 'aws ec2 create-key-pair --key-name my-key --query KeyMaterial --output text > my-key.pem', desc: 'Crear y guardar key pair' },
      { cmd: 'aws ec2 describe-key-pairs', desc: 'Listar key pairs' },
      { cmd: 'aws ec2 describe-security-groups', desc: 'Listar security groups' },
      { cmd: 'aws ec2 create-security-group --group-name web --description "Web SG" --vpc-id vpc-xxxx', desc: 'Crear security group' },
      { cmd: 'aws ec2 authorize-security-group-ingress --group-id sg-xxxx --protocol tcp --port 22 --cidr 0.0.0.0/0', desc: 'Añadir regla SSH' }
    ]
  },
  {
    title: 'VPC - Networking',
    icon: Network,
    description: 'Gestión de redes virtuales y subredes',
    commands: [
      { cmd: 'aws ec2 describe-vpcs', desc: 'Listar VPCs' },
      { cmd: 'aws ec2 create-vpc --cidr-block 10.0.0.0/16', desc: 'Crear nueva VPC' },
      { cmd: 'aws ec2 describe-subnets', desc: 'Listar subnets' },
      { cmd: 'aws ec2 create-subnet --vpc-id vpc-xxxx --cidr-block 10.0.1.0/24 --availability-zone us-east-1a', desc: 'Crear subnet' },
      { cmd: 'aws ec2 describe-route-tables', desc: 'Listar route tables' },
      { cmd: 'aws ec2 create-internet-gateway', desc: 'Crear Internet Gateway' },
      { cmd: 'aws ec2 attach-internet-gateway --internet-gateway-id igw-xxxx --vpc-id vpc-xxxx', desc: 'Attach IGW a VPC' },
      { cmd: 'aws ec2 create-route --route-table-id rtb-xxxx --destination-cidr-block 0.0.0.0/0 --gateway-id igw-xxxx', desc: 'Crear route a Internet' },
      { cmd: 'aws ec2 allocate-address', desc: 'Asignar Elastic IP' },
      { cmd: 'aws ec2 create-nat-gateway --subnet-id subnet-xxxx --allocation-id eipalloc-xxxx', desc: 'Crear NAT Gateway' },
      { cmd: 'aws ec2 describe-nat-gateways', desc: 'Listar NAT Gateways' }
    ]
  },
  {
    title: 'S3 - Storage',
    icon: Database,
    description: 'Gestión de buckets y objetos en S3',
    commands: [
      { cmd: 'aws s3 ls', desc: 'Listar buckets' },
      { cmd: 'aws s3 mb s3://my-bucket-name', desc: 'Crear bucket' },
      { cmd: 'aws s3 rb s3://my-bucket-name', desc: 'Eliminar bucket vacío' },
      { cmd: 'aws s3 ls s3://my-bucket/', desc: 'Listar contenido de bucket' },
      { cmd: 'aws s3 cp file.txt s3://my-bucket/', desc: 'Subir archivo' },
      { cmd: 'aws s3 cp s3://my-bucket/file.txt ./', desc: 'Descargar archivo' },
      { cmd: 'aws s3 sync ./local-folder s3://my-bucket/folder', desc: 'Sincronizar directorio' },
      { cmd: 'aws s3 rm s3://my-bucket/file.txt', desc: 'Eliminar objeto' },
      { cmd: 'aws s3api put-bucket-versioning --bucket my-bucket --versioning-configuration Status=Enabled', desc: 'Habilitar versioning' },
      { cmd: 'aws s3api put-bucket-encryption --bucket my-bucket --server-side-encryption-configuration Rule=[{ApplyServerSideEncryptionByDefault={SSEAlgorithm=AES256}}]', desc: 'Habilitar encryption por defecto' },
      { cmd: 'aws s3api put-public-access-block --bucket my-bucket --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true', desc: 'Bloquear acceso público' }
    ]
  },
  {
    title: 'RDS - Databases',
    icon: Database,
    description: 'Gestión de bases de datos relacionales',
    commands: [
      { cmd: 'aws rds describe-db-instances', desc: 'Listar instancias RDS' },
      { cmd: 'aws rds create-db-instance --db-instance-identifier mydb --db-instance-class db.t3.micro --engine mysql --master-username admin --master-user-password password123 --allocated-storage 20', desc: 'Crear instancia MySQL' },
      { cmd: 'aws rds describe-db-snapshots', desc: 'Listar snapshots' },
      { cmd: 'aws rds create-db-snapshot --db-instance-identifier mydb --db-snapshot-identifier mydb-snapshot', desc: 'Crear snapshot' },
      { cmd: 'aws rds restore-db-instance-from-db-snapshot --db-instance-identifier mydb-restored --db-snapshot-identifier mydb-snapshot', desc: 'Restaurar desde snapshot' },
      { cmd: 'aws rds delete-db-instance --db-instance-identifier mydb --skip-final-snapshot', desc: 'Eliminar instancia (sin snapshot)' },
      { cmd: 'aws rds modify-db-instance --db-instance-identifier mydb --backup-retention-period 7 --apply-immediately', desc: 'Configurar backup retention' },
      { cmd: 'aws rds create-db-subnet-group --db-subnet-group-name my-subnet-group --db-subnet-group-description "My subnet group" --subnet-ids ["subnet-xxxx","subnet-yyyy"]', desc: 'Crear DB subnet group' }
    ]
  },
  {
    title: 'IAM - Security',
    icon: Shield,
    description: 'Gestión de identidades y permisos',
    commands: [
      { cmd: 'aws iam list-users', desc: 'Listar usuarios' },
      { cmd: 'aws iam create-user --user-name developer', desc: 'Crear usuario' },
      { cmd: 'aws iam create-access-key --user-name developer', desc: 'Crear access keys' },
      { cmd: 'aws iam list-groups', desc: 'Listar grupos' },
      { cmd: 'aws iam create-group --group-name developers', desc: 'Crear grupo' },
      { cmd: 'aws iam add-user-to-group --user-name developer --group-name developers', desc: 'Añadir usuario a grupo' },
      { cmd: 'aws iam attach-group-policy --group-name developers --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess', desc: 'Attach policy a grupo' },
      { cmd: 'aws iam create-role --role-name EC2S3Access --assume-role-policy-document file://trust-policy.json', desc: 'Crear role' },
      { cmd: 'aws iam attach-role-policy --role-name EC2S3Access --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess', desc: 'Attach policy a role' },
      { cmd: 'aws iam list-policies --scope AWS', desc: 'Listar managed policies de AWS' },
      { cmd: 'aws iam get-policy-version --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess --version-id v1', desc: 'Ver contenido de policy' },
      { cmd: 'aws sts assume-role --role-arn arn:aws:iam::123456789012:role/MyRole --role-session-name my-session', desc: 'Asumir role' }
    ]
  },
  {
    title: 'EKS - Kubernetes',
    icon: Container,
    description: 'Gestión de clusters EKS',
    commands: [
      { cmd: 'aws eks list-clusters', desc: 'Listar clusters EKS' },
      { cmd: 'aws eks create-cluster --name production --role-arn arn:aws:iam::123456789012:role/eksClusterRole --resources-vpc-config subnetIds=subnet-xxx,subnet-yyy,securityGroupIds=sg-zzz', desc: 'Crear cluster' },
      { cmd: 'aws eks describe-cluster --name production', desc: 'Detalles del cluster' },
      { cmd: 'aws eks update-kubeconfig --name production --region us-east-1', desc: 'Configurar kubectl' },
      { cmd: 'aws eks list-nodegroups --cluster-name production', desc: 'Listar node groups' },
      { cmd: 'aws eks create-nodegroup --cluster-name production --nodegroup-name workers --node-role arn:aws:iam::123456789012:role/eksNodeRole --subnets subnet-xxx --instance-types t3.medium --scaling-config minSize=2,maxSize=6,desiredSize=3', desc: 'Crear node group' },
      { cmd: 'aws eks update-nodegroup-config --cluster-name production --nodegroup-name workers --scaling-config minSize=2,maxSize=10,desiredSize=4', desc: 'Actualizar scaling config' },
      { cmd: 'aws eks delete-nodegroup --cluster-name production --nodegroup-name workers', desc: 'Eliminar node group' },
      { cmd: 'aws eks delete-cluster --name production', desc: 'Eliminar cluster' },
      { cmd: 'aws eks list-addons --cluster-name production', desc: 'Listar addons instalados' },
      { cmd: 'aws eks describe-addon --cluster-name production --addon-name vpc-cni', desc: 'Detalles de addon específico' }
    ]
  },
  {
    title: 'CloudFormation',
    icon: Database,
    description: 'Infrastructure as Code con CloudFormation',
    commands: [
      { cmd: 'aws cloudformation list-stacks', desc: 'Listar stacks' },
      { cmd: 'aws cloudformation create-stack --stack-name my-stack --template-body file://template.yaml --parameters ParameterKey=KeyName,ParameterValue=my-key', desc: 'Crear stack' },
      { cmd: 'aws cloudformation create-stack --stack-name my-stack --template-url https://s3.amazonaws.com/bucket/template.yaml', desc: 'Crear stack desde S3' },
      { cmd: 'aws cloudformation update-stack --stack-name my-stack --template-body file://template.yaml', desc: 'Actualizar stack' },
      { cmd: 'aws cloudformation delete-stack --stack-name my-stack', desc: 'Eliminar stack' },
      { cmd: 'aws cloudformation describe-stacks --stack-name my-stack', desc: 'Detalles del stack' },
      { cmd: 'aws cloudformation describe-stack-events --stack-name my-stack', desc: 'Eventos del stack' },
      { cmd: 'aws cloudformation list-stack-resources --stack-name my-stack', desc: 'Recursos del stack' },
      { cmd: 'aws cloudformation validate-template --template-body file://template.yaml', desc: 'Validar template' },
      { cmd: 'aws cloudformation create-change-set --stack-name my-stack --change-set-name my-change-set --template-body file://template.yaml', desc: 'Crear change set' },
      { cmd: 'aws cloudformation describe-change-set --change-set-name my-change-set --stack-name my-stack', desc: 'Ver cambios propuestos' }
    ]
  }
]

function CommandBlock({ command, description }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      style={{
        background: '#071426',
        border: '1px solid #315277',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '12px'
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <code
          style={{
            fontFamily: 'JetBrains Mono, Consolas, monospace',
            fontSize: '0.85rem',
            color: '#4ade80',
            wordBreak: 'break-all',
            lineHeight: 1.5
          }}
        >
          {command}
        </code>
        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            marginTop: '6px',
            marginBottom: 0
          }}
        >
          {description}
        </p>
      </div>
      <button
        onClick={copyToClipboard}
        style={{
          background: copied ? 'rgba(39, 174, 96, 0.2)' : 'rgba(255, 255, 255, 0.05)',
          border: '1px solid ' + (copied ? '#27ae60' : '#315277'),
          borderRadius: '6px',
          padding: '6px 10px',
          cursor: 'pointer',
          color: copied ? '#4ade80' : 'var(--text-secondary)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.75rem'
        }}
      >
        {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
        {copied ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  )
}

function Commands() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredCategories =
    activeCategory === 'all'
      ? commandCategories
      : commandCategories.filter((cat) => cat.title.toLowerCase().includes(activeCategory.toLowerCase()))

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Comandos AWS CLI</h1>
        <p className="page-description">
          Referencia completa de comandos AWS CLI organizados por servicio.
          Todos los comandos pueden copiarse con un click.
        </p>
      </div>

      {/* Category Filter */}
      <div style={{ marginBottom: '24px' }}>
        <div className="tabs">
          <button
            className={`tab ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            Todos
          </button>
          {commandCategories.map((cat) => (
            <button
              key={cat.title}
              className={`tab ${activeCategory === cat.title.split(' ')[0] ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.title.split(' ')[0])}
            >
              {cat.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Commands Grid */}
      <div className="card-grid">
        {filteredCategories.map((category, idx) => {
          const Icon = category.icon
          return (
            <div key={idx} className="card">
              <div className="card-header">
                <div
                  className="card-icon"
                  style={{ background: '#2f80ed15', color: '#2f80ed' }}
                >
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="card-title">{category.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {category.description}
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                {category.commands.map((cmd, cidx) => (
                  <CommandBlock
                    key={cidx}
                    command={cmd.cmd}
                    description={cmd.desc}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Tips */}
      <div className="note note-info" style={{ marginTop: '32px' }}>
        <strong>Tips para AWS CLI:</strong>
        <ul className="styled-list" style={{ marginTop: '12px' }}>
          <li>Usa <code>--output table</code> para formato tabular más legible</li>
          <li>Usa <code>--query</code> con JMESPath para filtrar resultados</li>
          <li>Usa <code>--dry-run</code> para validar comandos sin ejecutarlos</li>
          <li>Configura auto-completion: <code>aws configure set cli_auto_prompt on</code></li>
          <li>Usa <code>aws --cli-read-timeout 0 --cli-connect-timeout 0</code> para operaciones largas</li>
        </ul>
      </div>
    </div>
  )
}

export default Commands
