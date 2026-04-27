import {
  Network,
  Globe,
  Shield,
  Server,
  ArrowRight,
  Cloud,
  Lock,
  Activity
} from 'lucide-react'

const networkingConcepts = [
  {
    title: 'Amazon VPC',
    icon: Network,
    description: 'Red virtual privada en AWS. Aislamiento lógico de recursos con control completo sobre topología de red.',
    features: ['CIDR blocks personalizables', 'Subnets públicas y privadas', 'Route tables', 'DHCP options sets'],
    bestPractices: [
      'Usar múltiples AZs para alta disponibilidad',
      'Separar subnets por tier (web/app/data)',
      'Reservar suficiente espacio de IP para escalar',
      'Evitar overlapping CIDRs en VPC peering'
    ],
    commands: `# Crear VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=production-vpc}]'

# Listar VPCs
aws ec2 describe-vpcs --query 'Vpcs[*].[VpcId,CidrBlock,State]' --output table`
  },
  {
    title: 'Subnets',
    icon: Server,
    description: 'Subdivisiones de VPC que residen en una única Availability Zone. Permiten organizar recursos por función y zona.',
    features: ['AZ-specific', 'Custom route tables', 'IP addressing', 'Auto-assign public IP'],
    bestPractices: [
      'Subnet pública: ALB, NAT Gateway, Bastion hosts',
      'Subnet privada app: EC2, ECS, EKS nodes',
      'Subnet privada data: RDS, ElastiCache',
      'Mínimo /24 para subnets con muchos recursos'
    ],
    commands: `# Crear subnet
aws ec2 create-subnet --vpc-id vpc-xxxx --cidr-block 10.0.1.0/24 --availability-zone us-east-1a

# Habilitar auto-assign public IP (para subnets públicas)
aws ec2 modify-subnet-attribute --subnet-id subnet-xxxx --map-public-ip-on-launch`
  },
  {
    title: 'Internet Gateway',
    icon: Globe,
    description: 'Gateway que permite comunicación entre VPC e internet. Componente altamente disponible y redundante.',
    features: ['Redundancia implícita', 'No tiene bandwidth constraints', 'Attach a una sola VPC', 'Bidireccional'],
    bestPractices: [
      'Un IGW por VPC (máximo)',
      'Route tables públicas apuntan a IGW',
      'Nunca asociar IGW directamente a instancias',
      'Monitorizar tráfico con VPC Flow Logs'
    ],
    commands: `# Crear y attach IGW
aws ec2 create-internet-gateway --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=prod-igw}]'
aws ec2 attach-internet-gateway --internet-gateway-id igw-xxxx --vpc-id vpc-xxxx

# Route table pública
aws ec2 create-route --route-table-id rtb-xxxx --destination-cidr-block 0.0.0.0/0 --gateway-id igw-xxxx`
  },
  {
    title: 'NAT Gateway',
    icon: ArrowRight,
    description: 'Permite que instancias en subnets privadas inicien conexiones salientes a internet sin exponer sus IPs privadas.',
    features: ['AZ-specific', 'Elastic IP asociada', 'Redundancia por AZ', 'Up to 45 Gbps'],
    bestPractices: [
      'Un NAT Gateway por AZ para HA',
      'Usar en subnets privadas para outbound internet',
      'Route tables privadas apuntan a NAT Gateway',
      'Considerar NAT instances para bajo tráfico'
    ],
    commands: `# Crear NAT Gateway (necesita Elastic IP)
aws ec2 allocate-address --domain vpc
aws ec2 create-nat-gateway --subnet-id subnet-public-xxxx --allocation-id eipalloc-xxxx

# Esperar a available, luego crear route
aws ec2 create-route --route-table-id rtb-private-xxxx --destination-cidr-block 0.0.0.0/0 --nat-gateway-id nat-xxxx`
  },
  {
    title: 'Security Groups',
    icon: Shield,
    description: 'Firewall virtual a nivel de instancia. Controla tráfico inbound y outbound con reglas stateful.',
    features: ['Stateful (return traffic allowed)', 'Reglas de allow solo', 'Referencias a otros SG', 'Instance level'],
    bestPractices: [
      'Principio de mínimo privilegio',
      'Usar referencias a SG en lugar de IPs',
      'Separar SG por tier (web, app, db)',
      'Documentar cada regla con descripción'
    ],
    commands: `# Crear Security Group
aws ec2 create-security-group --group-name web-tier-sg --description "Web tier security group" --vpc-id vpc-xxxx

# Añadir regla inbound
aws ec2 authorize-security-group-ingress --group-id sg-xxxx --protocol tcp --port 80 --cidr 0.0.0.0/0 --description "Allow HTTP"

# Referencia a otro SG (mejor práctica)
aws ec2 authorize-security-group-ingress --group-id sg-db-xxxx --protocol tcp --port 5432 --source-group sg-app-xxxx`
  },
  {
    title: 'Network ACLs',
    icon: Lock,
    description: 'Firewall a nivel de subnet. Control stateless que filtra tráfico entrante y saliente.',
    features: ['Stateless', 'Reglas de allow y deny', 'Número de regla importa', 'Subnet level'],
    bestPractices: [
      'Default NACL permite todo - revisar',
      'Reglas numeradas en incrementos de 10',
      'Bloquear IPs específicas con deny rules',
      'Menos restrictivo que SG (SG es suficiente generalmente)'
    ],
    commands: `# Crear NACL
aws ec2 create-network-acl --vpc-id vpc-xxxx

# Añadir regla inbound (números más bajos = prioridad)
aws ec2 create-network-acl-entry --network-acl-id acl-xxxx --rule-number 100 --protocol 6 --rule-action allow --cidr-block 10.0.0.0/16 --port-range From=22,To=22 --ingress

# Asociar a subnet
aws ec2 associate-network-acl --network-acl-id acl-xxxx --subnet-id subnet-xxxx`
  }
]

const advancedNetworking = [
  {
    title: 'VPC Peering',
    description: 'Conexión networking entre dos VPCs. Permite comunicación privada usando IPs privadas.',
    useCases: ['Multi-VPC architectures', 'Shared services', 'Cross-account networking'],
    limitations: ['No transitive peering', 'No overlapping CIDRs', 'Inter-region soportado'],
    command: `aws ec2 create-vpc-peering-connection --vpc-id vpc-requester-xxxx --peer-vpc-id vpc-accepter-xxxx
aws ec2 accept-vpc-peering-connection --vpc-peering-connection-id pcx-xxxx`
  },
  {
    title: 'Transit Gateway',
    description: 'Hub de red que conecta VPCs, on-premises networks, y otras Transit Gateways.',
    useCases: ['Hub-and-spoke topology', 'Multi-VPC enterprises', 'Hybrid cloud'],
    benefits: ['Transitive routing', 'Simplified network management', 'Inter-region peering', 'Multicast support'],
    command: `aws ec2 create-transit-gateway --description "Production TGW" --options DefaultRouteTableAssociation=enable,DefaultRouteTablePropagation=enable
aws ec2 create-transit-gateway-vpc-attachment --transit-gateway-id tgw-xxxx --vpc-id vpc-xxxx --subnet-ids subnet-xxxx`
  },
  {
    title: 'AWS Direct Connect',
    description: 'Conexión dedicada de red privada desde on-premises a AWS.',
    useCases: ['Large data transfers', 'Consistent latency', 'Hybrid workloads', 'Regulatory compliance'],
    types: ['Dedicated (1/10/100 Gbps)', 'Hosted (50 Mbps - 10 Gbps)', 'Public VIF', 'Private VIF', 'Transit VIF'],
    command: `# Crear connection (requerir a través de AWS Console o partner)
aws directconnect create-connection --location "EqDC2" --bandwidth 1Gbps --connection-name "Prod-DX"

# Crear Virtual Interface
aws directconnect create-private-virtual-interface --connection-id dxcon-xxxx --new-private-virtual-interface VirtualInterfaceName=prod-vif,Vlan=100,Asn=65000,AuthKey=myauthkey,AmazonAddress=169.254.0.1/30,CustomerAddress=169.254.0.2/30`
  },
  {
    title: 'AWS Client VPN',
    description: 'Servicio VPN gestionado que permite acceso seguro a recursos AWS y on-premises.',
    useCases: ['Remote workforce', 'Secure admin access', 'Temporary contractors'],
    features: ['OpenVPN-based', 'Active Directory integration', 'Multi-factor authentication', 'Split tunnel'],
    command: `aws ec2 create-client-vpn-endpoint --client-cidr-block 10.0.0.0/22 --server-certificate-arn arn:aws:acm:region:account:certificate/xxxx --authentication-options Type=directory-service-active-directory,ActiveDirectory=DirectoryId=d-xxxx --connection-log-options Enabled=true,CloudwatchLogGroup=/aws/vpn/client`
  }
]

const loadBalancers = [
  {
    type: 'Application Load Balancer (ALB)',
    layer: 'Layer 7 (HTTP/HTTPS)',
    features: ['Path-based routing', 'Host-based routing', 'WebSocket support', 'Container support'],
    useCases: ['Microservices', 'Container-based apps', 'Web applications'],
    protocol: 'HTTP, HTTPS, WebSocket'
  },
  {
    type: 'Network Load Balancer (NLB)',
    layer: 'Layer 4 (TCP/UDP)',
    features: ['Ultra-low latency', 'Static IP per AZ', 'Preserve client IP', 'TLS termination'],
    useCases: ['Gaming', 'IoT', 'High performance', 'TCP/UDP traffic'],
    protocol: 'TCP, UDP, TLS'
  },
  {
    type: 'Gateway Load Balancer (GWLB)',
    layer: 'Layer 3/4',
    features: ['Transparent inspection', 'Virtual appliances', 'No NAT required', 'High availability'],
    useCases: ['Firewalls', 'IDS/IPS', 'Network analytics'],
    protocol: 'IP packets'
  },
  {
    type: 'Classic Load Balancer (CLB)',
    layer: 'Layer 4/7',
    features: ['Legacy support', 'Basic routing', 'HTTPS termination'],
    useCases: ['Legacy applications', 'EC2-Classic'],
    note: 'Evitar en arquitecturas nuevas - usar ALB o NLB'
  }
]

function Networking() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Networking en AWS</h1>
        <p className="page-description">
          Guía completa de networking en AWS: VPC, subnets, conectividad, seguridad de red,
          y servicios avanzados de networking.
        </p>
      </div>

      {/* Core Concepts */}
      <section className="section">
        <h2 className="section-title">
          <Network size={24} />
          Conceptos Fundamentales
        </h2>

        <div className="card-grid">
          {networkingConcepts.map((concept, idx) => {
            const Icon = concept.icon
            return (
              <div key={idx} className="card">
                <div className="card-header">
                  <div
                    className="card-icon"
                    style={{ background: '#27ae6015', color: '#27ae60' }}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 className="card-title">{concept.title}</h3>
                </div>

                <p className="card-content" style={{ marginBottom: '16px' }}>
                  {concept.description}
                </p>

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
                    {concept.features.map((feature, fidx) => (
                      <li
                        key={fidx}
                        style={{
                          padding: '3px 0',
                          paddingLeft: '16px',
                          position: 'relative',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            left: 0,
                            color: '#27ae60'
                          }}
                        >
                          •
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
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
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      fontSize: '0.85rem'
                    }}
                  >
                    {concept.bestPractices.map((bp, bidx) => (
                      <li
                        key={bidx}
                        style={{
                          padding: '3px 0',
                          paddingLeft: '16px',
                          position: 'relative',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            left: 0,
                            color: '#f2c94c'
                          }}
                        >
                          ✓
                        </span>
                        {bp}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="code-block">
                  <div className="code-header">
                    <span className="code-label">AWS CLI</span>
                  </div>
                  <pre>{concept.commands}</pre>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Advanced Networking */}
      <section className="section">
        <h2 className="section-title">
          <Globe size={24} />
          Networking Avanzado
        </h2>

        <div className="card-grid">
          {advancedNetworking.map((item, idx) => (
            <div key={idx} className="card">
              <h3 className="card-title" style={{ marginBottom: '12px' }}>
                {item.title}
              </h3>
              <p className="card-content" style={{ marginBottom: '16px' }}>
                {item.description}
              </p>

              {item.useCases && (
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
                    Use Cases:{' '}
                  </strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {item.useCases.join(', ')}
                  </span>
                </div>
              )}

              {item.limitations && (
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
                    Limitaciones:{' '}
                  </strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {item.limitations.join(', ')}
                  </span>
                </div>
              )}

              {item.benefits && (
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
                    Benefits:{' '}
                  </strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {item.benefits.join(', ')}
                  </span>
                </div>
              )}

              {item.types && (
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
                    Types:{' '}
                  </strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {item.types.join(', ')}
                  </span>
                </div>
              )}

              <div className="code-block" style={{ marginTop: '16px' }}>
                <div className="code-header">
                  <span className="code-label">AWS CLI</span>
                </div>
                <pre>{item.command}</pre>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Load Balancers */}
      <section className="section">
        <h2 className="section-title">
          <Activity size={24} />
          Load Balancers en AWS
        </h2>

        <table className="data-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Capa OSI</th>
              <th>Protocolos</th>
              <th>Features Clave</th>
              <th>Casos de Uso</th>
            </tr>
          </thead>
          <tbody>
            {loadBalancers.map((lb, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 500 }}>{lb.type}</td>
                <td>{lb.layer}</td>
                <td>{lb.protocol}</td>
                <td>{lb.features.join(', ')}</td>
                <td>
                  {lb.useCases ? lb.useCases.join(', ') : lb.note}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="note" style={{ marginTop: '24px' }}>
          <strong>Nota sobre selección:</strong>
          <ul className="styled-list" style={{ marginTop: '12px' }}>
            <li>
              <strong>ALB:</strong> Usar para HTTP/HTTPS, microservices, path-based routing
            </li>
            <li>
              <strong>NLB:</strong> Usar para TCP/UDP, alta performance, static IPs
            </li>
            <li>
              <strong>GWLB:</strong> Usar para inline network appliances
            </li>
            <li>
              <strong>CLB:</strong> Legacy only - migrar a ALB/NLB
            </li>
          </ul>
        </div>
      </section>

      {/* Network Architecture Patterns */}
      <section className="section">
        <h2 className="section-title">
          <Cloud size={24} />
          Patrones de Arquitectura de Red
        </h2>

        <div className="diagram-container">
          <h3 style={{ marginBottom: '20px' }}>Hub-and-Spoke con Transit Gateway</h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              alignItems: 'center'
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                width: '100%',
                maxWidth: '800px'
              }}
            >
              {['VPC Producción', 'VPC Desarrollo', 'VPC Shared Services'].map(
                (vpc, idx) => (
                  <div
                    key={idx}
                    className="flow-node"
                    style={{
                      maxWidth: '100%',
                      background: 'rgba(142, 68, 173, 0.2)',
                      borderColor: 'rgba(142, 68, 173, 0.4)'
                    }}
                  >
                    <div className="flow-node-title">{vpc}</div>
                    <div className="flow-node-desc">Spoke VPC</div>
                  </div>
                )
              )}
            </div>

            <div className="flow-arrow" />

            <div
              className="flow-node"
              style={{
                maxWidth: '400px',
                background: 'rgba(255, 153, 0, 0.2)',
                borderColor: 'rgba(255, 153, 0, 0.4)',
                padding: '24px'
              }}
            >
              <div className="flow-node-title">
                <Network size={24} style={{ marginBottom: '8px' }} />
                <br />
                AWS Transit Gateway
              </div>
              <div className="flow-node-desc">Hub de routing centralizado</div>
            </div>

            <div className="flow-arrow" />

            <div
              className="flow-node"
              style={{
                maxWidth: '400px',
                background: 'rgba(47, 128, 237, 0.2)',
                borderColor: 'rgba(47, 128, 237, 0.4)'
              }}
            >
              <div className="flow-node-title">On-Premises / VPN / Direct Connect</div>
              <div className="flow-node-desc">Conectividad híbrida</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Otros Patrones Comunes</h3>
          <div className="card-grid">
            <div className="card">
              <h4 className="card-title" style={{ marginBottom: '12px' }}>
                VPC Peering Mesh
              </h4>
              <p className="card-content">
                Conexiones directas entre pares de VPCs. Apropiado para arquitecturas
                con pocas VPCs. No es transitive - cada conexión requiere peering individual.
              </p>
            </div>
            <div className="card">
              <h4 className="card-title" style={{ marginBottom: '12px' }}>
                Shared Services VPC
              </h4>
              <p className="card-content">
                VPC central con servicios comunes (DNS, AD, monitoring) al que otras
                VPCs conectan via peering o Transit Gateway.
              </p>
            </div>
            <div className="card">
              <h4 className="card-title" style={{ marginBottom: '12px' }}>
                VPC Endpoint Services
              </h4>
              <p className="card-content">
                Exponer servicios internos a otras VPCs via PrivateLink sin peering,
                IGW, NAT Gateway o public IPs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="note note-info" style={{ marginTop: '32px' }}>
        <strong>Best Practice General:</strong> Diseña tu red AWS con la{' '}
        <strong>principio de mínimo privilegio</strong>. Usa subnets privadas para
        workloads que no requieren acceso directo a internet. Implementa Defense in
        Depth con Security Groups (instancia) + NACLs (subnet) + VPC Flow Logs (auditoría).
      </div>
    </div>
  )
}

export default Networking
