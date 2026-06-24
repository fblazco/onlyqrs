const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://onlyqrs-backend.onrender.com'
const VERIFY_ENDPOINT = `${API_BASE_URL}/api/scanner/verify`
const ANALYTICS_REPORT_ENDPOINT = `${API_BASE_URL}/api/analytics/report`

function normalizeString(value) {
  return value || 'Desconocido'
}

function formatList(value) {
  if (!value) return 'Ninguna'
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : 'Ninguna'
  }
  return String(value)
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

function getRecommendation(evaluacion) {
  const nivel = (evaluacion?.nivel_riesgo || '').toString().toUpperCase()
  const esSeguro = Boolean(evaluacion?.es_seguro)

  if (nivel === 'MEDIO') {
    return 'No es recomendable entrar, incluso si la evaluación aparece como segura.'
  }

  if (!esSeguro) {
    return 'No es recomendable entrar.'
  }

  if (nivel === 'ALTO') {
    return 'No es recomendable entrar.'
  }

  if (nivel === 'BAJO') {
    return 'Puede entrar con precaución.'
  }

  return 'No hay recomendación clara.'
}

function buildEducationalSection(reporte_seguridad) {
  if (!reporte_seguridad) {
    return 'No hay información adicional disponible en este momento.'
  }

  const { objetivo, evaluacion, datos_tecnicos } = reporte_seguridad
  const advertencias = Array.isArray(evaluacion?.advertencias) ? evaluacion.advertencias : []
  const lines = [
    '🔍 Qué debes saber sobre este análisis',
    '',
    'Este informe te ayuda a entender el nivel de riesgo asociado con la URL analizada.',
    `Dominio base: ${normalizeString(objetivo?.dominio_base)}`,
  ]

  // Mostrar nivel de riesgo sólo si viene informado (evitar mostrar "Desconocido")
  const nivelNorm = normalizeString(evaluacion?.nivel_riesgo)
  if (evaluacion?.nivel_riesgo && nivelNorm !== 'Desconocido') {
    lines.push(`Nivel de riesgo: ${nivelNorm}`)
    lines.push(`¿Seguro?: ${evaluacion?.es_seguro ? 'Sí' : 'No'}`)
  }

  lines.push('', 'Consejos básicos:')
  lines.push('• Si el sitio es desconocido y el riesgo es medio o alto, evita ingresar contraseñas o datos personales.')
  lines.push('• Un dominio muy nuevo o con privacidad WHOIS puede ser un indicio de phishing.')
  lines.push('• Si la URL expira pronto, el sitio podría ser temporal o fraudulento.')
  lines.push('', 'Qué debes revisar:')
  lines.push(`• Edad del dominio: ${normalizeString(datos_tecnicos?.antiguedad_dias)} días`)
  lines.push(`• Fecha de creación: ${normalizeString(datos_tecnicos?.fecha_creacion)}`)
  lines.push(`• Fecha de expiración: ${normalizeString(datos_tecnicos?.fecha_expiracion)}`)
  lines.push(`• Registrador: ${formatEmpresaRegistradora(datos_tecnicos?.empresa_registradora)}`)
  lines.push(`• Propietario: ${formatPropietario(datos_tecnicos?.propietario)}`)

  if (advertencias.length > 0) {
    lines.push('', 'Advertencias detectadas:')
    advertencias.forEach((item) => {
      lines.push(`• ${item}`)
    })
  }

  lines.push('', 'Recuerda que estos datos complementan tu criterio. Siempre confirma el dominio y evita ingresar información sensible en sitios no confiables.')

  return lines.join('\n')
}



function buildScannerEducation(details) {
  if (!details || typeof details !== 'object') {
    return 'No hay información adicional disponible.'
  }

  const lines = [
    '🔍 Detalles extendidos del análisis',
    '',
    `URL analizada: ${normalizeString(details.url)}`,
    '',
  ]

  // Evitar mostrar líneas con valores por defecto que suelen salir como "Desconocido" o "No disponible"
  const nivelNorm = normalizeString(details.riskLevel)
  if (details.riskLevel && nivelNorm !== 'Desconocido') {
    lines.push(`Nivel de riesgo: ${nivelNorm}`)
  }

  if (details.score != null) {
    lines.push(`Score global: ${details.score}`)
  }

  const flagsStr = formatList(details.flags)
  if (flagsStr !== 'Ninguna') {
    lines.push(`Flags globales: ${flagsStr}`)
  }

  if (details.heuristic) {
    lines.push('📌 Heurística')
    lines.push(`• Score: ${details.heuristic.score ?? 'No disponible'}`)
    lines.push(`• Flags: ${formatList(details.heuristic.flags)}`)
    lines.push('')
  }

  if (details.whois) {
    lines.push('🌐 Whois')
    lines.push(`• Encontrado: ${details.whois.found ? 'Sí' : 'No'}`)
    lines.push(`• Edad: ${details.whois.age_in_days ?? 'No disponible'} días`)
    lines.push(`• Fecha de creación: ${normalizeString(details.whois.creation_date)}`)
    lines.push('')
  }

  if (details.virustotal) {
    lines.push('🛡️ VirusTotal')
    lines.push(`• Malicious: ${details.virustotal.malicious ?? 0}`)
    lines.push(`• Suspicious: ${details.virustotal.suspicious ?? 0}`)
    lines.push(`• Harmless: ${details.virustotal.harmless ?? 0}`)
    lines.push('')
  }

  if (details.googlesb) {
    lines.push('🔎 Google Safe Browsing')
    lines.push(`• Detectado: ${details.googlesb.detected ? 'Sí' : 'No'}`)
    lines.push(`• Tipo de amenaza: ${normalizeString(details.googlesb.threatType)}`)
    lines.push('')
  }

  if (details.scanio) {
    lines.push('📝 URLScan.io')
    lines.push(`• Encontrado: ${details.scanio.found ? 'Sí' : 'No'}`)
    lines.push(`• Malicioso: ${details.scanio.malicious ? 'Sí' : 'No'}`)
    if (details.scanio.score !== undefined) {
      lines.push(`• Score: ${details.scanio.score}`)
    }
    if (details.scanio.report_url) {
      lines.push(`• Reporte: ${details.scanio.report_url}`)
    }
    lines.push('')
  }

  if (details.abuse) {
    lines.push('🚨 Abuse')
    if (details.abuse.error) {
      lines.push(`• Error: ${details.abuse.error}`)
    } else {
      lines.push(`• Encontrado: ${details.abuse.found ? 'Sí' : 'No'}`)
      lines.push(`• Malicioso: ${details.abuse.malicious ? 'Sí' : 'No'}`)
    }
    lines.push('')
  }

  if (details.phishdestroy) {
    lines.push('🐟 PhishDestroy')
    lines.push(`• Detectado: ${details.phishdestroy.detected ? 'Sí' : 'No'}`)
    lines.push(`• Puntaje de riesgo: ${details.phishdestroy.risk_score ?? 'No disponible'}`)
    lines.push('')
  }

  lines.push('Recuerda: esta información complementa el resumen principal. Usa los detalles para validar la confianza del enlace y evitar riesgos antes de entrar.')
  return lines.join('\n')
}

function formatScannerResult(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Respuesta inválida del servidor')
  }

  if (data.score != null && data.riskLevel) {
    const summary = normalizeString(data.summary) || `Nivel de riesgo: ${normalizeString(data.riskLevel)} · Score: ${data.score}/100`

    // Mostrar sólo el `summary` en la vista principal. Toda la información extendida va a `education`.
    const educationParts = []
    if (data.summary) educationParts.push(normalizeString(data.summary))
    educationParts.push(buildScannerEducation(data.details))

    const header = normalizeString(data.riskLevel)

    return {
      summary,
      details: '',
      education: educationParts.join('\n\n'),
      header,
    }
  }

  if (data.success && data.reporte_seguridad) {
    const { objetivo, evaluacion, datos_tecnicos } = data.reporte_seguridad
    const advertencias = Array.isArray(evaluacion?.advertencias) ? evaluacion.advertencias : []

    const summary = `Riesgo: ${normalizeString(evaluacion?.nivel_riesgo)}`
    const recommendation = getRecommendation(evaluacion)
    const detalles = [
      '🔒 INFORME DE SEGURIDAD',
      '--------------------------------------------------',
      `URL analizada: ${normalizeString(objetivo?.url_completa)}`,
      `Dominio base: ${normalizeString(objetivo?.dominio_base)}`,
      '',
      '⚠️  EVALUACIÓN DE RIESGO:',
      `• Nivel: ${normalizeString(evaluacion?.nivel_riesgo)}`,
      `• Seguro: ${evaluacion?.es_seguro ? 'Sí' : 'No'}`,
      `• Recomendación: ${recommendation}`,
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

    const header = normalizeString(evaluacion?.nivel_riesgo)

    return {
      summary,
      details: detalles.join('\n'),
      education: buildEducationalSection(data.reporte_seguridad),
      header,
    }
  }

  throw new Error(data?.message || 'Respuesta inválida del servidor')
}

async function verifyScannerUrl(url, analyzer = 'OnlyQRs (Predeterminado)') {
  const payload = {
    url: url.trim(),
    analyzer,
  }

  const response = await fetch(VERIFY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const responseBody = await response.text()
  let data
  try {
    data = responseBody ? JSON.parse(responseBody) : null
  } catch {
    throw new Error(`Respuesta inválida del servidor: ${responseBody}`)
  }

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Error del servidor (${response.status})`)
  }

  return data
}

async function fetchAnalyticsReport() {
  const response = await fetch(ANALYTICS_REPORT_ENDPOINT)
  const responseBody = await response.text()
  let data
  try {
    data = responseBody ? JSON.parse(responseBody) : null
  } catch {
    throw new Error(`Respuesta inválida del servidor: ${responseBody}`)
  }

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Error del servidor (${response.status})`)
  }

  return data
}

function formatAnalyticsReport(data) {
  if (!data || !data.success) {
    throw new Error(data?.error || 'Respuesta inválida del servidor de analíticas')
  }

  if (!data.statistics) {
    return {
      summary: 'Informe de analíticas disponible',
      details: data.message || 'No hay datos de estadísticas para mostrar.',
      isAnalytics: true,
    }
  }

  const { totalScans, safeCount, lowCount, mediumCount, highCount, criticalCount } = data.statistics
  const details = [
    '📊 Resumen de estadísticas',
    `• Total de escaneos: ${totalScans ?? 'N/A'}`,
    `• SAFE: ${safeCount ?? 'N/A'}`,
    `• BAJO: ${lowCount ?? 'N/A'}`,
    `• MEDIO: ${mediumCount ?? 'N/A'}`,
    `• ALTO: ${highCount ?? 'N/A'}`,
    `• CRÍTICO: ${criticalCount ?? 'N/A'}`,
    '',
    '🧾 Informe ejecutivo',
    `• Visión general: ${normalizeString(data.executiveReport?.overview)}`,
    `• Amenaza principal: ${normalizeString(data.executiveReport?.topThreat)}`,
    `• Infraestructura: ${normalizeString(data.executiveReport?.infrastructure)}`,
    `• Recomendación: ${normalizeString(data.executiveReport?.recommendation)}`,
  ].join('\n')

  return {
    summary: `Total escaneos: ${totalScans ?? 'N/A'} · Altos: ${highCount ?? 'N/A'}`,
    details,
    isAnalytics: true,
  }
}

export { verifyScannerUrl, fetchAnalyticsReport, formatScannerResult, formatAnalyticsReport }
