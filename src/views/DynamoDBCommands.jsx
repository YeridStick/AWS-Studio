import { useState } from 'react'
import {
  Database,
  Table,
  Search,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Check,
  ChevronRight,
  Layers,
  Key,
  Filter,
  RefreshCw,
  Zap,
  Globe,
  Server
} from 'lucide-react'

const COMMAND_CATEGORIES = [
  {
    id: 'tables',
    title: 'Tablas',
    description: 'Crear, listar y gestionar tablas',
    icon: Table
  },
  {
    id: 'crud',
    title: 'Operaciones CRUD',
    description: 'Crear, leer, actualizar y eliminar items',
    icon: Database
  },
  {
    id: 'queries',
    title: 'Consultas Avanzadas',
    description: 'Query, Scan y búsquedas específicas',
    icon: Search
  },
  {
    id: 'indexes',
    title: 'Índices (GSI/LSI)',
    description: 'Índices globales y locales secundarios',
    icon: Layers
  },
  {
    id: 'transactions',
    title: 'Transacciones',
    description: 'Operaciones atómicas y batch',
    icon: Zap
  }
]

const COMMANDS = {
  tables: [
    {
      title: 'Crear tabla con PK y SK (Single Table Design)',
      description: 'Patrón recomendado: Partition Key + Sort Key para modelado eficiente',
      command: `aws --endpoint-url http://localhost:4566 dynamodb create-table \
  --table-name turismo_dynamodb_lab \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
    AttributeName=GSI1PK,AttributeType=S \
    AttributeName=GSI1SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --global-secondary-indexes \
    "IndexName=GSI1,\
     KeySchema=[{AttributeName=GSI1PK,KeyType=HASH},{AttributeName=GSI1SK,KeyType=RANGE}],\
     Projection={ProjectionType=ALL},\
     ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" \
  --billing-mode PROVISIONED \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --tags Key=Environment,Value=local`,
      tags: ['create', 'single-table', 'gsi']
    },
    {
      title: 'Crear tabla simple (solo PK)',
      description: 'Para casos simples sin necesidad de ordenamiento',
      command: `aws --endpoint-url http://localhost:4566 dynamodb create-table \
  --table-name users_simple \
  --attribute-definitions AttributeName=userId,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST`,
      tags: ['create', 'simple', 'on-demand']
    },
    {
      title: 'Listar todas las tablas',
      description: 'Obtener lista de tablas existentes',
      command: `aws --endpoint-url http://localhost:4566 dynamodb list-tables`,
      tags: ['list', 'metadata']
    },
    {
      title: 'Describir tabla (esquema e índices)',
      description: 'Ver configuración completa incluyendo GSI y LSI',
      command: `aws --endpoint-url http://localhost:4566 dynamodb describe-table \
  --table-name turismo_dynamodb_lab`,
      tags: ['describe', 'schema', 'gsi']
    },
    {
      title: 'Actualizar capacidad (modo provisionado)',
      description: 'Ajustar RCU/WCU según demanda',
      command: `aws --endpoint-url http://localhost:4566 dynamodb update-table \
  --table-name turismo_dynamodb_lab \
  --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=10`,
      tags: ['update', 'capacity', 'scaling']
    },
    {
      title: 'Eliminar tabla',
      description: 'Borrar tabla permanentemente',
      command: `aws --endpoint-url http://localhost:4566 dynamodb delete-table \
  --table-name turismo_dynamodb_lab`,
      tags: ['delete', 'danger']
    }
  ],
  crud: [
    {
      title: 'Insertar item completo (SITIO)',
      description: 'Crear un nuevo sitio turístico con todos los atributos',
      command: `aws --endpoint-url http://localhost:4566 dynamodb put-item \
  --table-name turismo_dynamodb_lab \
  --item '{
    "PK": {"S": "SITIO#04"},
    "SK": {"S": "METADATA"},
    "entityType": {"S": "SITIO"},
    "sitioId": {"N": "4"},
    "name": {"S": "Catedral de Neiva"},
    "description": {"S": "Catedral histórica del siglo XIX"},
    "category": {"S": "cultura"},
    "municipio": {"S": "neiva"},
    "department": {"S": "huila"},
    "address": {"S": "Plaza Principal, Neiva"},
    "latitude": {"S": "2.9273"},
    "longitude": {"S": "-75.2819"},
    "rating": {"N": "4.8"},
    "isActive": {"BOOL": true},
    "isVerified": {"BOOL": true},
    "createdAt": {"S": "2026-04-29"},
    "GSI1PK": {"S": "DEPT#huila"},
    "GSI1SK": {"S": "RATING#4.8#SITIO#04"}
  }' \
  --condition-expression "attribute_not_exists(PK)"`,
      tags: ['create', 'put', 'condition']
    },
    {
      title: 'Obtener item específico (GetItem)',
      description: 'Consulta directa por clave primaria completa',
      command: `aws --endpoint-url http://localhost:4566 dynamodb get-item \
  --table-name turismo_dynamodb_lab \
  --key '{
    "PK": {"S": "SITIO#03"},
    "SK": {"S": "METADATA"}
  }' \
  --consistent-read \
  --return-consumed-capacity TOTAL`,
      tags: ['read', 'get', 'consistent']
    },
    {
      title: 'Obtener atributos específicos',
      description: 'Proyección para reducir tráfico de red',
      command: `aws --endpoint-url http://localhost:4566 dynamodb get-item \
  --table-name turismo_dynamodb_lab \
  --key '{
    "PK": {"S": "SITIO#03"},
    "SK": {"S": "METADATA"}
  }' \
  --projection-expression "sitioId, #n, rating, #l" \
  --expression-attribute-names '{
    "#n": "name",
    "#l": "latitude"
  }'`,
      tags: ['read', 'projection', 'optimization']
    },
    {
      title: 'Actualizar item (UpdateItem)',
      description: 'Modificar atributos específicos sin reemplazar todo',
      command: `aws --endpoint-url http://localhost:4566 dynamodb update-item \
  --table-name turismo_dynamodb_lab \
  --key '{
    "PK": {"S": "SITIO#03"},
    "SK": {"S": "METADATA"}
  }' \
  --update-expression "SET rating = :newRating, updatedAt = :now, #n = :newName REMOVE description" \
  --expression-attribute-names '{
    "#n": "name"
  }' \
  --expression-attribute-values '{
    ":newRating": {"N": "4.9"},
    ":now": {"S": "2026-04-29T10:00:00Z"},
    ":newName": {"S": "Represa de Betanía - Actualizado"}
  }' \
  --return-values ALL_NEW`,
      tags: ['update', 'set', 'remove', 'expression']
    },
    {
      title: 'Actualización condicional',
      description: 'Solo actualizar si existe y cumple condición',
      command: `aws --endpoint-url http://localhost:4566 dynamodb update-item \
  --table-name turismo_dynamodb_lab \
  --key '{
    "PK": {"S": "SITIO#03"},
    "SK": {"S": "METADATA"}
  }' \
  --update-expression "SET rating = :newRating" \
  --condition-expression "isActive = :isActive AND rating < :newRating" \
  --expression-attribute-values '{
    ":newRating": {"N": "4.9"},
    ":isActive": {"BOOL": true}
  }'`,
      tags: ['update', 'condition', 'optimistic-locking']
    },
    {
      title: 'Eliminar item',
      description: 'Borrar registro específico',
      command: `aws --endpoint-url http://localhost:4566 dynamodb delete-item \
  --table-name turismo_dynamodb_lab \
  --key '{
    "PK": {"S": "SITIO#04"},
    "SK": {"S": "METADATA"}
  }' \
  --condition-expression "isVerified = :verified" \
  --expression-attribute-values '{
    ":verified": {"BOOL": false}
  }'`,
      tags: ['delete', 'condition']
    },
    {
      title: 'Operación atómica (incremento)',
      description: 'Incrementar contador sin riesgo de race conditions',
      command: `aws --endpoint-url http://localhost:4566 dynamodb update-item \
  --table-name turismo_dynamodb_lab \
  --key '{
    "PK": {"S": "SITIO#03"},
    "SK": {"S": "METADATA"}
  }' \
  --update-expression "SET visitCount = if_not_exists(visitCount, :zero) + :inc" \
  --expression-attribute-values '{
    ":zero": {"N": "0"},
    ":inc": {"N": "1"}
  }' \
  --return-values UPDATED_NEW`,
      tags: ['update', 'atomic', 'counter']
    }
  ],
  queries: [
    {
      title: 'Query básico (por PK)',
      description: 'Obtener todos los items con misma partition key',
      command: `aws --endpoint-url http://localhost:4566 dynamodb query \
  --table-name turismo_dynamodb_lab \
  --key-condition-expression "PK = :pk" \
  --expression-attribute-values '{
    ":pk": {"S": "SITIO#03"}
  }'`,
      tags: ['query', 'pk', 'base']
    },
    {
      title: 'Query con rango (begins_with)',
      description: 'Buscar items que comiencen con cierto patrón en SK',
      command: `aws --endpoint-url http://localhost:4566 dynamodb query \
  --table-name turismo_dynamodb_lab \
  --key-condition-expression "PK = :pk AND begins_with(SK, :skPrefix)" \
  --expression-attribute-values '{
    ":pk": {"S": "SITIO#03"},
    ":skPrefix": {"S": "REVIEW#"}
  }' \
  --scan-index-forward false \
  --limit 10`,
      tags: ['query', 'range', 'begins-with', 'pagination']
    },
    {
      title: 'Query con rango (between)',
      description: 'Rango de fechas o valores numéricos',
      command: `aws --endpoint-url http://localhost:4566 dynamodb query \
  --table-name turismo_dynamodb_lab \
  --key-condition-expression "PK = :pk AND SK BETWEEN :start AND :end" \
  --expression-attribute-values '{
    ":pk": {"S": "SITIO#03"},
    ":start": {"S": "REVIEW#2026-01-01"},
    ":end": {"S": "REVIEW#2026-04-30"}
  }'`,
      tags: ['query', 'range', 'between', 'dates']
    },
    {
      title: 'Query con FilterExpression',
      description: 'Filtrar resultados después del query (client-side)',
      command: `aws --endpoint-url http://localhost:4566 dynamodb query \
  --table-name turismo_dynamodb_lab \
  --key-condition-expression "PK = :pk" \
  --filter-expression "category = :cat AND rating > :minRating" \
  --expression-attribute-values '{
    ":pk": {"S": "SITIO#03"},
    ":cat": {"S": "naturaleza"},
    ":minRating": {"N": "4.0"}
  }' \
  --return-consumed-capacity INDEXES`,
      tags: ['query', 'filter', 'client-side']
    },
    {
      title: 'Scan completo (evitar en producción)',
      description: 'Leer toda la tabla - costoso y lento',
      command: `aws --endpoint-url http://localhost:4566 dynamodb scan \
  --table-name turismo_dynamodb_lab \
  --return-consumed-capacity TOTAL`,
      tags: ['scan', 'full-table', 'expensive']
    },
    {
      title: 'Scan con proyección y filtro',
      description: 'Scan limitado con atributos específicos',
      command: `aws --endpoint-url http://localhost:4566 dynamodb scan \
  --table-name turismo_dynamodb_lab \
  --filter-expression "isActive = :active AND department = :dept" \
  --projection-expression "sitioId, #n, municipality, rating" \
  --expression-attribute-names '{
    "#n": "name"
  }' \
  --expression-attribute-values '{
    ":active": {"BOOL": true},
    ":dept": {"S": "huila"}
  }' \
  --page-size 100`,
      tags: ['scan', 'filter', 'projection', 'paginated']
    },
    {
      title: 'Paginación (última página evaluada)',
      description: 'Manejar LastEvaluatedKey para grandes conjuntos',
      command: `# Primera página
aws --endpoint-url http://localhost:4566 dynamodb query \
  --table-name turismo_dynamodb_lab \
  --key-condition-expression "PK = :pk" \
  --expression-attribute-values '{
    ":pk": {"S": "SITIO#03"}
  }' \
  --limit 5 \
  --output json | jq -r '.LastEvaluatedKey | tojson' | base64

# Siguiente página (usar el LastEvaluatedKey anterior)
aws --endpoint-url http://localhost:4566 dynamodb query \
  --table-name turismo_dynamodb_lab \
  --key-condition-expression "PK = :pk" \
  --expression-attribute-values '{
    ":pk": {"S": "SITIO#03"}
  }' \
  --exclusive-start-key '{
    "PK": {"S": "SITIO#03"},
    "SK": {"S": "REVIEW#2026-04-29#123"}
  }' \
  --limit 5`,
      tags: ['query', 'pagination', 'LastEvaluatedKey']
    }
  ],
  indexes: [
    {
      title: 'Query por GSI (índice global secundario)',
      description: 'Buscar por departamento ordenado por rating',
      command: `aws --endpoint-url http://localhost:4566 dynamodb query \
  --table-name turismo_dynamodb_lab \
  --index-name GSI1 \
  --key-condition-expression "GSI1PK = :dept AND GSI1SK >= :minRating" \
  --expression-attribute-values '{
    ":dept": {"S": "DEPT#huila"},
    ":minRating": {"S": "RATING#4.5"}
  }' \
  --scan-index-forward false`,
      tags: ['gsi', 'query', 'alternative-access']
    },
    {
      title: 'Crear GSI en tabla existente',
      description: 'Agregar índice global secundario sin downtime',
      command: `aws --endpoint-url http://localhost:4566 dynamodb update-table \
  --table-name turismo_dynamodb_lab \
  --attribute-definitions \
    AttributeName=category,AttributeType=S \
    AttributeName=createdAt,AttributeType=S \
  --global-secondary-index-updates '[{
    "Create": {
      "IndexName": "CategoryIndex",
      "KeySchema": [
        {"AttributeName": "category", "KeyType": "HASH"},
        {"AttributeName": "createdAt", "KeyType": "RANGE"}
      ],
      "Projection": {"ProjectionType": "ALL"},
      "ProvisionedThroughput": {
        "ReadCapacityUnits": 5,
        "WriteCapacityUnits": 5
      }
    }
  }]'`,
      tags: ['gsi', 'create', 'online', 'migration']
    },
    {
      title: 'Query por categoría (GSI)',
      description: 'Buscar sitios por categoría ordenados por fecha',
      command: `aws --endpoint-url http://localhost:4566 dynamodb query \
  --table-name turismo_dynamodb_lab \
  --index-name CategoryIndex \
  --key-condition-expression "category = :cat AND createdAt BETWEEN :start AND :end" \
  --expression-attribute-values '{
    ":cat": {"S": "naturaleza"},
    ":start": {"S": "2026-01-01"},
    ":end": {"S": "2026-12-31"}
  }'`,
      tags: ['gsi', 'query', 'category']
    },
    {
      title: 'Eliminar GSI',
      description: 'Remover índice global secundario',
      command: `aws --endpoint-url http://localhost:4566 dynamodb update-table \
  --table-name turismo_dynamodb_lab \
  --global-secondary-index-updates '[{
    "Delete": {
      "IndexName": "CategoryIndex"
    }
  }]'`,
      tags: ['gsi', 'delete']
    },
    {
      title: 'Scan por GSI con proyección',
      description: 'Leer desde GSI con atributos limitados',
      command: `aws --endpoint-url http://localhost:4566 dynamodb scan \
  --table-name turismo_dynamodb_lab \
  --index-name GSI1 \
  --projection-expression "sitioId, #n, rating, #l" \
  --expression-attribute-names '{
    "#n": "name",
    "#l": "latitude"
  }' \
  --limit 20`,
      tags: ['gsi', 'scan', 'projection']
    }
  ],
  transactions: [
    {
      title: 'BatchWriteItem (múltiples operaciones)',
      description: 'Insertar/eliminar hasta 25 items en una llamada',
      command: `aws --endpoint-url http://localhost:4566 dynamodb batch-write-item \
  --request-items '{
    "turismo_dynamodb_lab": [
      {
        "PutRequest": {
          "Item": {
            "PK": {"S": "SITIO#05"},
            "SK": {"S": "METADATA"},
            "entityType": {"S": "SITIO"},
            "sitioId": {"N": "5"},
            "name": {"S": "San Agustín"},
            "category": {"S": "arqueologia"},
            "department": {"S": "huila"},
            "rating": {"N": "4.9"},
            "isActive": {"BOOL": true}
          }
        }
      },
      {
        "PutRequest": {
          "Item": {
            "PK": {"S": "SITIO#06"},
            "SK": {"S": "METADATA"},
            "entityType": {"S": "SITIO"},
            "sitioId": {"N": "6"},
            "name": {"S": "Desierto Tatacoa"},
            "category": {"S": "naturaleza"},
            "department": {"S": "huila"},
            "rating": {"N": "4.7"},
            "isActive": {"BOOL": true}
          }
        }
      },
      {
        "DeleteRequest": {
          "Key": {
            "PK": {"S": "SITIO#04"},
            "SK": {"S": "METADATA"}
          }
        }
      }
    ]
  }'`,
      tags: ['batch', 'write', 'bulk']
    },
    {
      title: 'BatchGetItem (lectura múltiple)',
      description: 'Obtener hasta 100 items de una o varias tablas',
      command: `aws --endpoint-url http://localhost:4566 dynamodb batch-get-item \
  --request-items '{
    "turismo_dynamodb_lab": {
      "Keys": [
        {"PK": {"S": "SITIO#03"}, "SK": {"S": "METADATA"}},
        {"PK": {"S": "SITIO#05"}, "SK": {"S": "METADATA"}},
        {"PK": {"S": "SITIO#06"}, "SK": {"S": "METADATA"}}
      ],
      "ProjectionExpression": "sitioId, #n, rating, category",
      "ExpressionAttributeNames": {"#n": "name"}
    }
  }'`,
      tags: ['batch', 'read', 'multi-item']
    },
    {
      title: 'Transacción (TransactWriteItems)',
      description: 'Operaciones atómicas ACID (todo o nada)',
      command: `aws --endpoint-url http://localhost:4566 dynamodb transact-write-items \
  --transact-items '[
    {
      "Put": {
        "TableName": "turismo_dynamodb_lab",
        "Item": {
          "PK": {"S": "BOOKING#12345"},
          "SK": {"S": "METADATA"},
          "userId": {"S": "USER#789"},
          "sitioId": {"S": "SITIO#03"},
          "status": {"S": "CONFIRMED"},
          "total": {"N": "150000"},
          "createdAt": {"S": "2026-04-29T10:00:00Z"}
        },
        "ConditionExpression": "attribute_not_exists(PK)"
      }
    },
    {
      "Update": {
        "TableName": "turismo_dynamodb_lab",
        "Key": {
          "PK": {"S": "SITIO#03"},
          "SK": {"S": "AVAILABILITY#2026-04-29"}
        },
        "UpdateExpression": "SET availableSlots = availableSlots - :dec",
        "ExpressionAttributeValues": {
          ":dec": {"N": "1"},
          ":minSlots": {"N": "0"}
        },
        "ConditionExpression": "availableSlots > :minSlots"
      }
    }
  ]'`,
      tags: ['transaction', 'acid', 'booking']
    },
    {
      title: 'Query condicional con Check',
      description: 'Verificar existencia antes de operar',
      command: `aws --endpoint-url http://localhost:4566 dynamodb transact-write-items \
  --transact-items '[
    {
      "ConditionCheck": {
        "TableName": "turismo_dynamodb_lab",
        "Key": {
          "PK": {"S": "USER#789"},
          "SK": {"S": "METADATA"}
        },
        "ConditionExpression": "isActive = :active",
        "ExpressionAttributeValues": {
          ":active": {"BOOL": true}
        }
      }
    },
    {
      "Put": {
        "TableName": "turismo_dynamodb_lab",
        "Item": {
          "PK": {"S": "BOOKING#12345"},
          "SK": {"S": "METADATA"},
          "status": {"S": "PENDING"}
        }
      }
    }
  ]'`,
      tags: ['transaction', 'condition-check', 'validation']
    }
  ]
}

function DynamoDBCommands() {
  const [activeCategory, setActiveCategory] = useState('tables')
  const [copiedCommand, setCopiedCommand] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const copyToClipboard = (command, index) => {
    navigator.clipboard.writeText(command)
    setCopiedCommand(index)
    setTimeout(() => setCopiedCommand(null), 2000)
  }

  const filterCommands = (commands) => {
    if (!searchTerm) return commands
    const term = searchTerm.toLowerCase()
    return commands.filter(cmd => 
      cmd.title.toLowerCase().includes(term) ||
      cmd.description.toLowerCase().includes(term) ||
      cmd.tags.some(tag => tag.toLowerCase().includes(term))
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          marginBottom: '12px'
        }}>
          <Database size={32} color="#2f80ed" />
          Comandos DynamoDB
        </h1>
        <p style={{ color: '#8892a0', fontSize: '1.1rem' }}>
          Guía completa de operaciones DynamoDB con LocalStack. Single Table Design, índices, 
          transacciones y patrones de consulta avanzados.
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Search size={20} color="#8892a0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar comandos por título, descripción o tag..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              style={{
                background: 'none',
                border: 'none',
                color: '#8892a0',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '32px'
      }}>
        {COMMAND_CATEGORIES.map(cat => {
          const Icon = cat.icon
          const isActive = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: `2px solid ${isActive ? '#2f80ed' : 'rgba(255,255,255,0.1)'}`,
                background: isActive ? 'rgba(47, 128, 237, 0.2)' : 'rgba(255,255,255,0.05)',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'white',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={24} style={{ marginBottom: '8px' }} />
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>{cat.title}</div>
              <div style={{ fontSize: '0.75rem', color: '#8892a0' }}>{cat.description}</div>
            </button>
          )
        })}
      </div>

      {/* Commands List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filterCommands(COMMANDS[activeCategory]).map((cmd, index) => (
          <div
            key={index}
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}>{cmd.title}</h3>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {cmd.tags.map((tag, tidx) => (
                    <span
                      key={tidx}
                      style={{
                        padding: '3px 8px',
                        background: tag === 'danger' ? 'rgba(231, 76, 60, 0.2)' : 'rgba(47, 128, 237, 0.2)',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        color: tag === 'danger' ? '#e74c3c' : '#2f80ed',
                        textTransform: 'uppercase'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <p style={{ margin: 0, color: '#8892a0', fontSize: '0.9rem' }}>{cmd.description}</p>
            </div>

            {/* Command */}
            <div style={{ position: 'relative' }}>
              <pre style={{
                margin: 0,
                padding: '20px 24px',
                background: 'rgba(0,0,0,0.3)',
                color: '#4ade80',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                overflow: 'auto',
                maxHeight: '400px'
              }}>
                <code>{cmd.command}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(cmd.command, `${activeCategory}-${index}`)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  padding: '8px 12px',
                  background: copiedCommand === `${activeCategory}-${index}` ? 'rgba(39, 174, 96, 0.9)' : 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8rem'
                }}
              >
                {copiedCommand === `${activeCategory}-${index}` ? (
                  <><Check size={14} /> Copiado</>
                ) : (
                  <><Copy size={14} /> Copiar</>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div style={{
        marginTop: '40px',
        padding: '24px',
        background: 'rgba(47, 128, 237, 0.1)',
        border: '1px solid rgba(47, 128, 237, 0.3)',
        borderRadius: '12px'
      }}>
        <h3 style={{ margin: '0 0 12px', color: '#2f80ed', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={20} />
          Patrón Single Table Design
        </h3>
        <p style={{ margin: '0 0 16px', color: '#c0c0c0', lineHeight: 1.6 }}>
          El ejemplo de <strong>turismo_dynamodb_lab</strong> usa Single Table Design con PK/SK:
        </p>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#8892a0', lineHeight: 1.8 }}>
          <li><strong>PK</strong> (Partition Key): Identifica la entidad (SITIO#01, USER#123)</li>
          <li><strong>SK</strong> (Sort Key): Permite ordenamiento y relaciones (METADATA, REVIEW#date)</li>
          <li><strong>GSI1</strong> (Global Secondary Index): Acceso alternativo por departamento/rating</li>
          <li><strong>entityType</strong>: Discriminador de tipo para filtrado en aplicación</li>
        </ul>
      </div>

      {/* Best Practices */}
      <div style={{
        marginTop: '24px',
        padding: '24px',
        background: 'rgba(231, 76, 60, 0.1)',
        border: '1px solid rgba(231, 76, 60, 0.3)',
        borderRadius: '12px'
      }}>
        <h3 style={{ margin: '0 0 12px', color: '#e74c3c', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={20} />
          Mejores Prácticas
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          <div>
            <strong style={{ color: 'white' }}>Evita Scan</strong>
            <p style={{ margin: '4px 0 0', color: '#8892a0', fontSize: '0.85rem' }}>
              Usa Query sobre Scan. Scan lee toda la tabla y es costoso.
            </p>
          </div>
          <div>
            <strong style={{ color: 'white' }}>Diseña para consultas</strong>
            <p style={{ margin: '4px 0 0', color: '#8892a0', fontSize: '0.85rem' }}>
              Modela datos según los patrones de acceso, no la entidad.
            </p>
          </div>
          <div>
            <strong style={{ color: 'white' }}>GSIs para acceso alternativo</strong>
            <p style={{ margin: '4px 0 0', color: '#8892a0', fontSize: '0.85rem' }}>
              Crea GSIs para patrones de query que no encajan en PK/SK principal.
            </p>
          </div>
          <div>
            <strong style={{ color: 'white' }}>Paginación proactiva</strong>
            <p style={{ margin: '4px 0 0', color: '#8892a0', fontSize: '0.85rem' }}>
              Maneja LastEvaluatedKey siempre. Límite por defecto: 1MB de datos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DynamoDBCommands
