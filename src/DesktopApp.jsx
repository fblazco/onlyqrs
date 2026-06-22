import { useState } from 'react'
import './App.css'
import { verifyScannerUrl, formatScannerResult } from './api'

const initialResult = {
  summary: '',
  details: '',
}

function DesktopApp() {
  const [link, setLink] = useState('')
  const [status, setStatus] = useState('Listo para verificar')
  const [result, setResult] = useState(initialResult)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const analyzeLink = async (linkToAnalyze) => {
    const data = await verifyScannerUrl(linkToAnalyze)
    return formatScannerResult(data)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!link.trim()) {
      setError('Por favor ingresa un URL válido para continuar.')
      setStatus('Error: URL requerida')
      setResult(initialResult)
      return
    }

    setIsLoading(true)
    setStatus('Procesando...')
    setResult(initialResult)

    try {
      const analysis = await analyzeLink(link)
      setResult(analysis)
      setStatus('✓ Análisis exitoso')
    } catch (err) {
      setError(err.message || 'No se pudo completar el análisis')
      setStatus('Error al analizar')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div>
          <img src="/logo.png" alt="OnlyQRs Logo" className="logo-header" />
          <h1>Seguridad y Claridad en Cada Análisis</h1>
          <p className="lead">
            Ingresa o pega un enlace QR y obtén un análisis detallado en tiempo real. 
            Verifica la seguridad, autenticidad y validez de cada código en tu workspace profesional.
          </p>
        </div>
      </section>

      <section className="workspace-grid">
        <form className="card input-card" onSubmit={handleSubmit}>
          <div className="card-header">
            <div>
              <p className="section-label">Ingresa el URL a Analizar</p>
              <h2>Validador QR</h2>
            </div>
            <span className="hint">Análisis en tiempo real</span>
          </div>

          <label className="field-group">
            <span>URL del Código QR</span>
            <input
              type="url"
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="https://secure.ejemplo.com/qr/..."
              autoComplete="off"
            />
          </label>

          <div className="actions">
            <button type="submit" disabled={isLoading}>
              {isLoading ? '⟳ Procesando análisis' : '▶ Analizar'}
            </button>
            <p className="help-text">
              El estado aparecerá en el panel derecho junto con un análisis detallado en tiempo real.
            </p>
          </div>

          {error ? <p className="form-error">{error}</p> : null}
        </form>

        <section className="card status-card">
          <div className="status-panel">
            <p className="section-label">Estado del Análisis</p>
            <div className={`status-chip ${isLoading ? 'loading' : 'ready'}`}>
              {isLoading ? 'PROCESANDO' : status}
            </div>
          </div>

          <div className="result-panel">
            <div className="result-header">
              <div>
                <p className="section-label">Resultado del Análisis</p>
                <h2>{result.summary || 'Esperando entrada'}</h2>
              </div>
            </div>

            <div className="result-body">
              <pre>{result.details || 'Ingresa un URL y presiona "Analizar" para ver los detalles aquí.'}</pre>
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}

export default DesktopApp
