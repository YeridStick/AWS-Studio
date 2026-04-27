// Servicio para integración con modelos IA locales via Ollama API
// Soporta gemma4:e4b y gemma4:e2b

const OLLAMA_BASE_URL = 'http://localhost:11434'

export const AVAILABLE_MODELS = [
  { id: 'gemma4:e4b', name: 'Gemma 4B', description: 'Modelo balanceado para respuestas rápidas' },
  { id: 'gemma4:e2b', name: 'Gemma 2B', description: 'Modelo ligero para respuestas instantáneas' }
]

// Contexto de AWS para enriquecer las preguntas
const AWS_CONTEXT = `
Eres un asistente experto en AWS (Amazon Web Services) y arquitectura cloud.
Tienes acceso a documentación sobre: VPC, EC2, S3, RDS, Lambda, EKS, IAM, CloudFormation, 
Networking, Seguridad, y mejores prácticas de infraestructura.

Reglas:
1. Responde de manera concisa y profesional
2. Incluye comandos AWS CLI cuando sea relevante
3. Proporciona pasos numerados para guías
4. Si detectas un problema específico, ofrece soluciones paso a paso
5. Sugiere recursos relacionados de la documentación

Formato de respuesta:
- Respuesta directa
- Comandos/ejemplos (si aplica)
- Pasos siguientes recomendados
- Recursos relacionados en la documentación
`

/**
 * Enviar mensaje al modelo IA
 */
export async function sendMessageToAI(message, model = 'gemma4:e4b', conversationHistory = []) {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: AWS_CONTEXT },
          ...conversationHistory,
          { role: 'user', content: message }
        ],
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 2048
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      content: data.message?.content || 'No response from model',
      model: model
    }
  } catch (error) {
    console.error('AI Service Error:', error)
    return {
      success: false,
      error: error.message,
      content: null
    }
  }
}

/**
 * Verificar si Ollama está disponible
 */
export async function checkOllamaStatus() {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      timeout: 3000
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Obtener lista de modelos disponibles en Ollama
 */
export async function getAvailableModels() {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`)
    if (!response.ok) return []
    
    const data = await response.json()
    return data.models?.map(m => m.name) || []
  } catch {
    return []
  }
}

/**
 * Buscar en el índice de documentación
 */
export function searchDocumentation(query, docIndex) {
  const terms = query.toLowerCase().split(' ')
  const results = []
  
  for (const [path, content] of Object.entries(docIndex)) {
    const contentLower = content.toLowerCase()
    let score = 0
    
    for (const term of terms) {
      if (contentLower.includes(term)) score += 1
      if (path.toLowerCase().includes(term)) score += 2
    }
    
    if (score > 0) {
      results.push({ path, score, snippet: extractSnippet(content, terms[0]) })
    }
  }
  
  return results.sort((a, b) => b.score - a.score).slice(0, 5)
}

function extractSnippet(content, term) {
  const index = content.toLowerCase().indexOf(term)
  if (index === -1) return content.substring(0, 150) + '...'
  
  const start = Math.max(0, index - 50)
  const end = Math.min(content.length, index + 100)
  return (start > 0 ? '...' : '') + content.substring(start, end) + (end < content.length ? '...' : '')
}

/**
 * Generar guía paso a paso para infraestructura
 */
export async function generateInfraGuide(goal, model = 'gemma4:e4b') {
  const prompt = `Genera una guía paso a paso detallada para: "${goal}"

Estructura requerida:
1. Prerrequisitos (comandos AWS CLI necesarios)
2. Paso 1: [Título] - Comando(s) específicos
3. Paso 2: [Título] - Comando(s) específicos
...
N. Verificación - Cómo confirmar que todo funciona

Para cada paso incluye:
- Descripción breve
- Comando AWS CLI completo
- Posibles errores comunes y cómo evitarlos
- Tiempo estimado

Formato JSON:
{
  "title": "...",
  "estimatedTime": "...",
  "prerequisites": [...],
  "steps": [
    {
      "number": 1,
      "title": "...",
      "description": "...",
      "commands": [...],
      "commonIssues": [...],
      "estimatedTime": "..."
    }
  ]
}`

  const response = await sendMessageToAI(prompt, model)
  
  if (!response.success) return null
  
  try {
    // Intentar extraer JSON de la respuesta
    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return { title: goal, steps: [{ number: 1, title: 'Guía', description: response.content, commands: [] }] }
  } catch {
    return { title: goal, steps: [{ number: 1, title: 'Guía', description: response.content, commands: [] }] }
  }
}
