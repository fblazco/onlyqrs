import { useState } from 'react'
import './App.css'

const initialResult = {
  summary: '',
  details: '',
}

function DesktopApp() {
  const [link, setLink] = useState('')
  const [status, setStatus] = useState('Listo para analizar')
  const [result, setResult] = useState(initialResult)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const analyzeLink = async (linkToAnalyze) => {
    const payload = { link: linkToAnalyze.trim() }

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('No se pudo conectar con el servidor')
      }

      const data = await response.json()
      return {
        summary: data.summary ?? 'Análisis recibido',
        details: data.details ?? JSON.stringify(data, null, 2),
      }
    } catch (err) {
      console.warn('Backend no disponible, usando resultado simulado', err)
      return {
        summary: 'Enlace procesado localmente',
        details: `No se encontró un backend activo.

Este es un resultado simulado para mostrar la interfaz.

Cuando integres el backend, el servidor podrá devolver el detalle real aquí.`,
      }
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!link.trim()) {
      setError('Por favor ingresa o pega un link de QR.')
      setStatus('Error: campo vacío')
      setResult(initialResult)
      return
    }

    setIsLoading(true)
    setStatus('Analizando...')
    setResult(initialResult)

    const analysis = await analyzeLink(link)
    setResult(analysis)
    setStatus('Análisis completado')
    setIsLoading(false)
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Frontend QR para escritorio</p>
          <h1>Analiza enlaces QR con calma y claridad</h1>
          <p className="lead">
            Pega o escribe el link del QR y observa el estado y el detalle del análisis
            en un diseño limpio y cómodo para PC.
          </p>
        </div>
      </section>

      <section className="workspace-grid">
        <form className="card input-card" onSubmit={handleSubmit}>
          <div className="card-header">
            <div>
              <p className="section-label">Pegar link del QR</p>
              <h2>Enlace a analizar</h2>
            </div>
            <span className="hint">PC / escritorio</span>
          </div>

          <label className="field-group">
            <span>URL del QR</span>
            <input
              type="url"
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="https://ejemplo.com/qr"
              autoComplete="off"
            />
          </label>

          <div className="actions">
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Analizando...' : 'Enviar al backend'}
            </button>
            <p className="help-text">
              El estado aparecerá a la derecha; el resultado detallado se muestra más abajo.
            </p>
          </div>

          {error ? <p className="form-error">{error}</p> : null}
        </form>

        <section className="card status-card">
          <div className="status-panel">
            <p className="section-label">Estado</p>
            <div className={`status-chip ${isLoading ? 'loading' : 'ready'}`}>
              {isLoading ? 'Analizando' : status}
            </div>
          </div>

          <div className="result-panel">
            <div className="result-header">
              <div>
                <p className="section-label">Resultado detallado</p>
                <h2>{result.summary || 'Sin resultado aún'}</h2>
              </div>
            </div>

            <div className="result-body">
              <pre>{result.details || 'El detalle aparecerá aquí una vez termine el análisis.'}</pre>
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}

export default DesktopApp
