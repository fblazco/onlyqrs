const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://onlyqrs-backend.onrender.com'
const VERIFY_ENDPOINT = `${API_BASE_URL}/api/scanner/verify`

function normalizeString(value) {
  return value || 'Desconocido'
}

function formatEmpresaRegistradora(entry) {
  if (!entry) {
    return 'Desconocido'
  }

  if (typeof entry === 'string') {
    return entry || 'Desconocido'
  }

  const parts = []
  if (entry.name) parts.push(entry.name)
  if (entry.url) parts.push(entry.url)
  if (entry.email) parts.push(`Email: ${entry.email}`)
  if (entry.phone) parts.push(`Tel: ${entry.phone}`)
  if (entry.address) parts.push(entry.address)

  return parts.length > 0 ? parts.join(' · ') : 'Desconocido'
}

function formatPropietario(entry) {
  if (!entry || typeof entry !== 'object') {
    return 'No disponible'
  }

  const parts = []
  if (entry.organizacion) parts.push(`Organización: ${entry.organizacion}`)
  if (entry.pais) parts.push(`País: ${entry.pais}`)
  if (entry.email) parts.push(`Email: ${entry.email}`)

  return parts.length > 0 ? parts.join(' · ') : 'No disponible'
}

function formatScannerResult(data) {
  if (!data || !data.success || !data.reporte_seguridad) {
    throw new Error(data?.message || 'Respuesta inválida del servidor')
  }

  const { objetivo, evaluacion, datos_tecnicos } = data.reporte_seguridad
  const advertencias = Array.isArray(evaluacion?.advertencias) ? evaluacion.advertencias : []

  const summary = `Riesgo: ${normalizeString(evaluacion?.nivel_riesgo)}`
  const detalles = [
    '🔒 INFORME DE SEGURIDAD',
    '--------------------------------------------------',
    `URL analizada: ${normalizeString(objetivo?.url_completa)}`,
    `Dominio base: ${normalizeString(objetivo?.dominio_base)}`,
    '',
    '⚠️  EVALUACIÓN DE RIESGO:',
    `• Nivel: ${normalizeString(evaluacion?.nivel_riesgo)}`,
    `• Seguro: ${evaluacion?.es_seguro ? 'Sí' : 'No'}`,
    `• Banderas rojas: ${evaluacion?.total_banderas_rojas ?? 0}`,
    '',
    advertencias.length > 0
      ? ['🚩 ADVERTENCIAS:', ...advertencias.map((item) => `  • ${item}`)].join('\n')
      : '✅ Sin advertencias',
    '',
    '📋 DATOS TÉCNICOS:',
    `• Antigüedad: ${normalizeString(datos_tecnicos?.antiguedad_dias)}`,
    `• Fecha de creación: ${normalizeString(datos_tecnicos?.fecha_creacion)}`,
    `• Fecha de expiración: ${normalizeString(datos_tecnicos?.fecha_expiracion)}`,
    `• Registrador: ${formatEmpresaRegistradora(datos_tecnicos?.empresa_registradora)}`,
    `• Propietario: ${formatPropietario(datos_tecnicos?.propietario)}`,
  ]

  return {
    summary,
    details: detalles.join('\n'),
  }
}

async function verifyScannerUrl(url) {
  const payload = { url: url.trim() }

  const response = await fetch(VERIFY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const responseBody = await response.text()
  let data
  try {
    data = responseBody ? JSON.parse(responseBody) : null
  } catch (err) {
    throw new Error(`Respuesta inválida del servidor: ${responseBody}`)
  }

  if (!response.ok) {
    throw new Error(data?.message || `Error del servidor (${response.status})`)
  }

  return data
}

export { verifyScannerUrl, formatScannerResult }
