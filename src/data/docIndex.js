// Índice de contenido para búsqueda rápida
// Este índice permite buscar términos en toda la documentación

export const documentationIndex = {
  '/': {
    title: 'Inicio',
    content: 'AWS Mastery Documentación Profesional de Arquitectura Cloud. Arquitectura moderna AWS + EKS. Aprende a diseñar, implementar y operar infraestructura cloud profesional.',
    keywords: ['inicio', 'introducción', 'aws', 'cloud', 'arquitectura', 'mastery']
  },
  '/infrastructure': {
    title: 'Tipos de Infraestructura',
    content: 'IaaS Infrastructure as a Service EC2 S3 VPC. PaaS Platform as a Service Elastic Beanstalk RDS. SaaS Software as a Service. Serverless Lambda Fargate API Gateway. CaaS Containers as a Service ECS EKS. Responsabilidad compartida Shared Responsibility Model.',
    keywords: ['iaas', 'paas', 'saas', 'serverless', 'caas', 'infraestructura', 'ec2', 'lambda', 'ecs', 'eks']
  },
  '/services': {
    title: 'Servicios AWS',
    content: 'Compute: EC2 Lambda ECS EKS Fargate Elastic Beanstalk. Storage: S3 EBS EFS FSx Glacier. Database: RDS DynamoDB DocumentDB ElastiCache Neptune Keyspaces. Networking: VPC CloudFront Route 53 Transit Gateway API Gateway. Security: IAM KMS WAF Shield GuardDuty Secrets Manager. Serverless: Lambda Step Functions EventBridge SQS SNS API Gateway AppSync.',
    keywords: ['ec2', 's3', 'rds', 'lambda', 'vpc', 'iam', 'dynamodb', 'cloudfront', 'route53', 'sqs', 'sns']
  },
  '/diagrams': {
    title: 'Diagramas y Flujos',
    content: 'Flujo de Request: API Gateway VPC Link NLB Security Groups EKS. Arquitectura VPC: Subnets Públicas Privadas NAT Gateway Internet Gateway. CI/CD Pipeline: CodeCommit CodeBuild CodeDeploy CodePipeline. Multi-Tier Application: Presentation Layer Application Tier Data Layer. Cloud Híbrido: Direct Connect VPN Transit Gateway. Microservicios: API Gateway Lambda DynamoDB S3 CloudFront.',
    keywords: ['diagramas', 'flujos', 'arquitectura', 'vpc', 'eks', 'cicd', 'microservicios', 'api gateway']
  },
  '/networking': {
    title: 'Networking Avanzado',
    content: 'VPC Virtual Private Cloud CIDR blocks. Subnets Públicas con Internet Gateway Privadas con NAT Gateway. VPC Peering conexión entre VPCs. Transit Gateway hub-and-spoke. Direct Connect conexión dedicada. Client VPN access remoto. Load Balancers ALB NLB Gateway CLB.',
    keywords: ['vpc', 'subnet', 'internet gateway', 'nat gateway', 'vpc peering', 'transit gateway', 'direct connect', 'vpn', 'load balancer', 'alb', 'nlb']
  },
  '/security': {
    title: 'Seguridad',
    content: 'IAM Identity and Access Management usuarios grupos roles políticas. KMS Key Management Service cifrado. Secrets Manager rotación automática. WAF Web Application Firewall. Shield DDoS protection. GuardDuty threat detection. Security compliance frameworks. Checklist enterprise.',
    keywords: ['iam', 'kms', 'secrets manager', 'waf', 'shield', 'guardduty', 'seguridad', 'cifrado', 'políticas']
  },
  '/kubernetes': {
    title: 'Kubernetes / EKS',
    content: 'EKS Control Plane Managed Kubernetes. Managed Node Groups EC2 instances. Fargate serverless pods. VPC CNI native networking. EBS CSI Driver block storage. EFS CSI Driver shared storage. Objetos Kubernetes: Deployment Service ConfigMap Secret Ingress PersistentVolumeClaim. Comandos kubectl.',
    keywords: ['eks', 'kubernetes', 'k8s', 'fargate', 'pods', 'deployment', 'service', 'configmap', 'secret', 'ingress', 'kubectl']
  },
  '/commands': {
    title: 'Comandos CLI',
    content: 'AWS CLI configuración perfiles. EC2 describe-instances run-instances start-instances stop-instances. VPC describe-vpcs create-vpc create-subnet. S3 ls cp sync mb rb. RDS describe-db-instances create-db-instance. IAM list-users create-user attach-policy. EKS list-clusters create-cluster update-kubeconfig. CloudFormation create-stack update-stack.',
    keywords: ['aws cli', 'comandos', 'ec2', 's3', 'vpc', 'rds', 'iam', 'eks', 'cloudformation', 'kubectl']
  },
  '/troubleshooting': {
    title: 'Troubleshooting',
    content: 'Errores comunes: InvalidClientTokenId SignatureDoesNotMatch RequestTimeTooSkewed Throttling InsufficientInstanceCapacity OptInRequired. Conectividad SSH Security Groups Key pairs. EKS CrashLoopBackOff Pending ImagePullBackOff. IAM Access Denied. S3 403 Forbidden. RDS Storage Full. VPC Flow Logs CloudTrail X-Ray debugging.',
    keywords: ['troubleshooting', 'errores', 'debugging', 'ssh', 'crashloopbackoff', 'access denied', 'vpc flow logs', 'cloudtrail']
  }
}

// Guías predefinidas para infraestructura común
export const infrastructureGuides = {
  'vpc': {
    title: 'Crear VPC completa desde cero',
    description: 'VPC con subnets públicas y privadas, Internet Gateway, NAT Gateway, y route tables',
    estimatedTime: '15-20 minutos',
    steps: 8
  },
  'ec2': {
    title: 'Lanzar instancia EC2 segura',
    description: 'EC2 con Security Group, Key Pair, y User Data para configuración inicial',
    estimatedTime: '5-10 minutos',
    steps: 5
  },
  'eks': {
    title: 'Crear cluster EKS con nodes',
    description: 'Cluster EKS con Managed Node Groups y VPC CNI',
    estimatedTime: '20-30 minutos',
    steps: 6
  },
  'rds': {
    title: 'Crear base de datos RDS MySQL',
    description: 'RDS MySQL con Subnet Group, Security Group, y backups automáticos',
    estimatedTime: '15-20 minutos',
    steps: 5
  },
  's3-static': {
    title: 'Hosting estático en S3 con CloudFront',
    description: 'Bucket S3 configurado para hosting + CloudFront + Route 53',
    estimatedTime: '20-25 minutos',
    steps: 7
  },
  'lambda-api': {
    title: 'API serverless con Lambda y API Gateway',
    description: 'Lambda function + API Gateway REST API + IAM roles',
    estimatedTime: '15-20 minutos',
    steps: 6
  },
  'ci-cd': {
    title: 'Pipeline CI/CD con CodePipeline',
    description: 'CodeCommit + CodeBuild + CodeDeploy + CodePipeline completo',
    estimatedTime: '25-35 minutos',
    steps: 8
  },
  'vpc-peering': {
    title: 'Conectar VPCs con VPC Peering',
    description: 'VPC Peering entre dos VPCs y configuración de route tables',
    estimatedTime: '10-15 minutos',
    steps: 4
  }
}

// Mapeo de términos comunes a secciones
export const searchAliases = {
  'como crear vpc': '/networking',
  'crear vpc': '/networking',
  'subnets': '/networking',
  'internet gateway': '/networking',
  'nat gateway': '/networking',
  'load balancer': '/networking',
  'alb': '/networking',
  'nlb': '/networking',
  
  'ec2': '/services',
  'instancia': '/services',
  'servidor': '/services',
  
  's3': '/services',
  'bucket': '/services',
  'almacenamiento': '/services',
  
  'rds': '/services',
  'base de datos': '/services',
  'mysql': '/services',
  'postgres': '/services',
  
  'lambda': '/services',
  'serverless': '/infrastructure',
  'funcion': '/services',
  
  'eks': '/kubernetes',
  'kubernetes': '/kubernetes',
  'k8s': '/kubernetes',
  'docker': '/kubernetes',
  'container': '/kubernetes',
  'pod': '/kubernetes',
  
  'iam': '/security',
  'permisos': '/security',
  'roles': '/security',
  'politicas': '/security',
  'seguridad': '/security',
  
  'comandos': '/commands',
  'cli': '/commands',
  'aws cli': '/commands',
  'kubectl': '/commands',
  
  'problema': '/troubleshooting',
  'error': '/troubleshooting',
  'fallo': '/troubleshooting',
  'debug': '/troubleshooting',
  
  'diagrama': '/diagrams',
  'flujo': '/diagrams',
  'arquitectura': '/diagrams'
}
