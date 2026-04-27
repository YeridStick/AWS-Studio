// Servicio de IA para diseño de pipelines CI/CD
// Genera pipelines acorde a la infraestructura y stack tecnológico

const OLLAMA_BASE_URL = 'http://localhost:11434'

const PIPELINE_CONTEXT = `
Eres un experto en DevOps y CI/CD especializado en AWS.
Tu tarea es diseñar pipelines de despliegue completos y optimizados.

Debes generar pipelines que incluyan:
1. Build stage (compilación, tests, linting)
2. Security scans (SAST, DAST, dependency check)
3. Artifact management (ECR, S3)
4. Deploy stages (dev → staging → prod)
5. Rollback mechanisms
6. Notifications y alerting

Herramientas disponibles:
- AWS CodePipeline (nativo)
- AWS CodeBuild (nativo)
- GitHub Actions
- GitLab CI
- Jenkins
- ArgoCD (GitOps)
- AWS CodeDeploy
- AWS CloudFormation / Terraform

Para cada pipeline debes:
- Justificar elección de herramientas
- Incluir templates YAML/JSON listos para usar
- Definir estrategia de despliegue (rolling, blue/green, canary)
- Configurar triggers apropiados
- Incluir aprobaciones manuales para producción
- Definir rollback automático

El pipeline debe integrarse automáticamente con la infraestructura proporcionada.
`

/**
 * Diseñar pipeline CI/CD basado en infraestructura y requisitos
 */
export async function designPipeline(infrastructure, projectConfig, model = 'gemma4:e4b') {
  const prompt = `Diseña un pipeline CI/CD completo para este proyecto:

INFRAESTRUCTURA ACTUAL:
${JSON.stringify(infrastructure, null, 2)}

CONFIGURACIÓN DEL PROYECTO:
- Tipo de aplicación: ${projectConfig.appType}
- Stack tecnológico: ${projectConfig.techStack}
- Repositorio: ${projectConfig.repoType}
- Necesita aprobaciones manuales: ${projectConfig.needsApprovals ? 'Sí' : 'No'}
- Estrategia de despliegue preferida: ${projectConfig.deploymentStrategy}
- Entornos requeridos: ${projectConfig.environments.join(', ')}
- Necesita feature flags: ${projectConfig.needsFeatureFlags ? 'Sí' : 'No'}

Genera:
1. PIPELINE_CONFIG: Configuración completa del pipeline
2. STAGES: Lista detallada de etapas
3. TEMPLATES: Archivos YAML/JSON listos para usar
4. INTEGRATION: Cómo integra con la infraestructura existente
5. SECURITY: Medidas de seguridad incluidas
6. ROLLBACK: Estrategia de rollback

Responde en formato estructurado.`

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: PIPELINE_CONTEXT },
          { role: 'user', content: prompt }
        ],
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 4096
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.message?.content || ''

    return {
      success: true,
      analysis: content,
      infrastructure: infrastructure,
      projectConfig: projectConfig
    }
  } catch (error) {
    console.error('Pipeline Designer Error:', error)
    return {
      success: false,
      error: error.message,
      analysis: null
    }
  }
}

/**
 * Generar plantilla CodePipeline nativo de AWS
 */
export function generateCodePipelineTemplate(config) {
  return {
    AWSTemplateFormatVersion: '2010-09-09',
    Description: `Pipeline CI/CD for ${config.projectName}`,
    Resources: {
      CodePipeline: {
        Type: 'AWS::CodePipeline::Pipeline',
        Properties: {
          Name: `${config.projectName}-pipeline`,
          RoleArn: { 'Fn::GetAtt': ['PipelineRole', 'Arn'] },
          ArtifactStore: {
            Type: 'S3',
            Location: { Ref: 'ArtifactBucket' }
          },
          Stages: [
            {
              Name: 'Source',
              Actions: [{
                Name: 'Source',
                ActionTypeId: {
                  Category: 'Source',
                  Owner: 'ThirdParty',
                  Provider: config.repoType === 'github' ? 'GitHub' : 'GitLab',
                  Version: '1'
                },
                Configuration: {
                  Owner: config.repoOwner,
                  Repo: config.repoName,
                  Branch: config.branch || 'main',
                  OAuthToken: '{{resolve:secretsmanager:github-token:SecretString:token}}'
                },
                OutputArtifacts: [{ Name: 'SourceCode' }]
              }]
            },
            {
              Name: 'Build',
              Actions: [{
                Name: 'BuildAndTest',
                ActionTypeId: {
                  Category: 'Build',
                  Owner: 'AWS',
                  Provider: 'CodeBuild',
                  Version: '1'
                },
                Configuration: {
                  ProjectName: { Ref: 'CodeBuildProject' }
                },
                InputArtifacts: [{ Name: 'SourceCode' }],
                OutputArtifacts: [{ Name: 'BuildOutput' }]
              }]
            },
            {
              Name: 'Deploy-Dev',
              Actions: [{
                Name: 'DeployToDev',
                ActionTypeId: {
                  Category: 'Deploy',
                  Owner: 'AWS',
                  Provider: config.deploymentType === 'ecs' ? 'ECS' : config.deploymentType === 'lambda' ? 'CloudFormation' : 'CodeDeploy',
                  Version: '1'
                },
                Configuration: generateDeployConfig(config, 'dev'),
                InputArtifacts: [{ Name: 'BuildOutput' }]
              }]
            },
            {
              Name: 'Approval',
              Actions: [{
                Name: 'ManualApproval',
                ActionTypeId: {
                  Category: 'Approval',
                  Owner: 'AWS',
                  Provider: 'Manual',
                  Version: '1'
                },
                Configuration: {
                  CustomData: 'Aprobación para desplegar a producción'
                }
              }]
            },
            {
              Name: 'Deploy-Prod',
              Actions: [{
                Name: 'DeployToProd',
                ActionTypeId: {
                  Category: 'Deploy',
                  Owner: 'AWS',
                  Provider: config.deploymentType === 'ecs' ? 'ECS' : config.deploymentType === 'lambda' ? 'CloudFormation' : 'CodeDeploy',
                  Version: '1'
                },
                Configuration: generateDeployConfig(config, 'prod'),
                InputArtifacts: [{ Name: 'BuildOutput' }]
              }]
            }
          ]
        }
      },
      CodeBuildProject: {
        Type: 'AWS::CodeBuild::Project',
        Properties: {
          Name: `${config.projectName}-build`,
          ServiceRole: { 'Fn::GetAtt': ['CodeBuildRole', 'Arn'] },
          Artifacts: {
            Type: 'CODEPIPELINE'
          },
          Environment: {
            Type: 'LINUX_CONTAINER',
            ComputeType: 'BUILD_GENERAL1_SMALL',
            Image: 'aws/codebuild/standard:5.0',
            PrivilegedMode: config.needsDocker
          },
          Source: {
            Type: 'CODEPIPELINE',
            BuildSpec: generateBuildSpec(config)
          }
        }
      },
      ArtifactBucket: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: `${config.projectName}-artifacts-${config.accountId}`,
          VersioningConfiguration: {
            Status: 'Enabled'
          },
          LifecycleConfiguration: {
            Rules: [{
              Id: 'DeleteOldArtifacts',
              Status: 'Enabled',
              ExpirationInDays: 30
            }]
          }
        }
      }
    }
  }
}

/**
 * Generar GitHub Actions workflow
 */
export function generateGitHubActionsWorkflow(config) {
  const workflow = {
    name: `${config.projectName} CI/CD`,
    on: {
      push: {
        branches: ['main', 'develop']
      },
      pull_request: {
        branches: ['main']
      }
    },
    jobs: {
      test: {
        runsOn: 'ubuntu-latest',
        steps: [
          { uses: 'actions/checkout@v4' },
          {
            name: 'Setup Node.js',
            uses: 'actions/setup-node@v4',
            with: {
              'node-version': '20',
              cache: 'npm'
            }
          },
          { run: 'npm ci' },
          { run: 'npm run lint' },
          { run: 'npm test' },
          {
            name: 'Security audit',
            run: 'npm audit --audit-level=moderate'
          }
        ]
      },
      build: {
        needs: 'test',
        runsOn: 'ubuntu-latest',
        steps: [
          { uses: 'actions/checkout@v4' },
          {
            name: 'Configure AWS credentials',
            uses: 'aws-actions/configure-aws-credentials@v4',
            with: {
              'aws-access-key-id': '${{ secrets.AWS_ACCESS_KEY_ID }}',
              'aws-secret-access-key': '${{ secrets.AWS_SECRET_ACCESS_KEY }}',
              'aws-region': config.region || 'us-east-1'
            }
          },
          {
            name: 'Login to Amazon ECR',
            uses: 'aws-actions/amazon-ecr-login@v2'
          },
          {
            name: 'Build, tag, and push image',
            run: `docker build -t ${config.ecrRepository}:\${{ github.sha }} .
docker push ${config.ecrRepository}:\${{ github.sha }}`
          }
        ]
      },
      deployDev: {
        needs: 'build',
        if: "github.ref == 'refs/heads/develop'",
        runsOn: 'ubuntu-latest',
        environment: 'development',
        steps: [
          { uses: 'actions/checkout@v4' },
          {
            name: 'Deploy to Dev',
            run: generateDeployScript(config, 'dev')
          }
        ]
      },
      deployProd: {
        needs: 'build',
        if: "github.ref == 'refs/heads/main'",
        runsOn: 'ubuntu-latest',
        environment: 'production',
        steps: [
          { uses: 'actions/checkout@v4' },
          {
            name: 'Deploy to Production',
            run: generateDeployScript(config, 'prod')
          }
        ]
      }
    }
  }

  return yamlStringify(workflow)
}

/**
 * Generar GitLab CI pipeline
 */
export function generateGitLabCI(config) {
  return `stages:
  - test
  - build
  - security
  - deploy

test:
  stage: test
  image: node:20-alpine
  script:
    - npm ci
    - npm run lint
    - npm test
    - npm run coverage
  coverage: '/All files[^|]*|[^|]*\\s*(\\d+\\.\\d+)/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  only:
    - main
    - develop

security_scan:
  stage: security
  image: returntocorp/semgrep
  script:
    - semgrep --config=auto --json --output=semgrep-report.json
  artifacts:
    reports:
      sast: semgrep-report.json
  allow_failure: true

deploy_dev:
  stage: deploy
  script:
    - aws ecs update-service --cluster dev --service ${config.projectName} --force-new-deployment
  environment:
    name: development
  only:
    - develop

deploy_prod:
  stage: deploy
  script:
    - aws ecs update-service --cluster prod --service ${config.projectName} --force-new-deployment
  environment:
    name: production
  when: manual
  only:
    - main
`
}

/**
 * Generar buildspec.yml para CodeBuild
 */
function generateBuildSpec(config) {
  const phases = {
    install: {
      'runtime-versions': {
        nodejs: 20
      },
      commands: [
        'npm ci'
      ]
    },
    pre_build: {
      commands: [
        'npm run lint',
        'npm audit --audit-level=moderate'
      ]
    },
    build: {
      commands: [
        'npm test',
        'npm run build'
      ]
    },
    post_build: {
      commands: [
        'echo Build completed'
      ]
    }
  }

  if (config.needsDocker) {
    phases.pre_build.commands.unshift(
      'echo Logging in to Amazon ECR...',
      'aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com'
    )
    phases.build.commands.push(
      `docker build -t $ECR_REPOSITORY:latest .`,
      `docker tag $ECR_REPOSITORY:latest $ECR_REPOSITORY:$CODEBUILD_BUILD_ID`,
      `docker push $ECR_REPOSITORY:latest`,
      `docker push $ECR_REPOSITORY:$CODEBUILD_BUILD_ID`
    )
  }

  return JSON.stringify({
    version: '0.2',
    phases: phases,
    artifacts: {
      files: config.needsDocker ? ['imagedefinitions.json'] : ['build/**/*'],
      'discard-paths': 'yes'
    }
  }, null, 2)
}

/**
 * Generar configuración de despliegue según tipo
 */
function generateDeployConfig(config, environment) {
  const configs = {
    ecs: {
      ClusterName: `${config.projectName}-${environment}`,
      ServiceName: config.projectName,
      FileName: 'imagedefinitions.json'
    },
    lambda: {
      StackName: `${config.projectName}-${environment}`,
      TemplatePath: 'BuildOutput::template.yaml',
      Capabilities: 'CAPABILITY_IAM,CAPABILITY_AUTO_EXPAND'
    },
    ec2: {
      ApplicationName: config.projectName,
      DeploymentGroupName: `${environment}-group`
    }
  }
  return configs[config.deploymentType] || configs.ecs
}

/**
 * Generar script de despliegue
 */
function generateDeployScript(config, environment) {
  if (config.deploymentType === 'ecs') {
    return `aws ecs update-service --cluster ${config.projectName}-${environment} --service ${config.projectName} --force-new-deployment`
  } else if (config.deploymentType === 'lambda') {
    return `aws cloudformation deploy --template-file template.yaml --stack-name ${config.projectName}-${environment} --capabilities CAPABILITY_IAM`
  }
  return `echo "Deploy to ${environment}"`
}

/**
 * Convertir objeto a YAML string (simplificado)
 */
function yamlStringify(obj, indent = 0) {
  const spaces = '  '.repeat(indent)
  let yaml = ''

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue

    if (Array.isArray(value)) {
      yaml += `${spaces}${key}:\n`
      value.forEach(item => {
        if (typeof item === 'object') {
          yaml += `${spaces}- ${yamlStringify(item, indent + 1).trimStart()}`
        } else {
          yaml += `${spaces}- ${item}\n`
        }
      })
    } else if (typeof value === 'object') {
      yaml += `${spaces}${key}:\n${yamlStringify(value, indent + 1)}`
    } else if (typeof value === 'string' && value.includes('\n')) {
      yaml += `${spaces}${key}: |\n${value.split('\n').map(l => spaces + '  ' + l).join('\n')}\n`
    } else {
      yaml += `${spaces}${key}: ${value}\n`
    }
  }

  return yaml
}

// Configuraciones predefinidas por tipo de proyecto
export const PIPELINE_TEMPLATES = {
  nodejs: {
    buildTool: 'npm',
    testCommand: 'npm test',
    lintCommand: 'npm run lint',
    needsDocker: false
  },
  python: {
    buildTool: 'pip',
    testCommand: 'pytest',
    lintCommand: 'flake8',
    needsDocker: true
  },
  java: {
    buildTool: 'maven',
    testCommand: 'mvn test',
    lintCommand: 'mvn checkstyle:check',
    needsDocker: true
  },
  docker: {
    buildTool: 'docker',
    testCommand: 'docker build --target test .',
    lintCommand: 'hadolint Dockerfile',
    needsDocker: true
  }
}
