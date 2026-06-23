import { useState } from 'react'
import './App.css'
import { verifyScannerUrl, formatScannerResult } from './api'

const initialResult = {
  summary: '',
  details: '',
  education: '',
}

function DesktopApp() {
  const [link, setLink] = useState('')
  const [status, setStatus] = useState('Listo para verificar')
  const [result, setResult] = useState(initialResult)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showMoreInfo, setShowMoreInfo] = useState(false)
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [homeKey, setHomeKey] = useState(0)

  const analyzeLink = async (linkToAnalyze) => {
    const data = await verifyScannerUrl(linkToAnalyze, 'OnlyQRs (Predeterminado)')
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
    setShowMoreInfo(false)

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

  if (isAboutOpen) {
    return (
      <main className="app-shell">
        <section className="card about-page">
          <div className="card-header">
            <div>
              <p className="section-label">Conoce OnlyQRs</p>
              <h2>Protección completa contra phishing y quishing</h2>
            </div>
          </div>

          <div className="about-hero">
            <p className="about-lead">
              OnlyQRs combina detección automática, múltiples motores de seguridad y análisis con inteligencia artificial
              para que cualquier usuario, incluso sin experiencia, identifique rápidamente si un enlace QR es seguro o malicioso.
            </p>
          </div>

          <div className="about-grid">
            <article className="about-card">
              <h3>Protección clara</h3>
              <p>
                Detectamos prácticas de phishing y quishing en URLs y te mostramos si la página es confiable, sospechosa o peligrosa.
              </p>
            </article>

            <article className="about-card">
              <h3>Análisis multicapa</h3>
              <p>
                Revisamos reputación, historial, certificados, dominio y contenido externo para darte un veredicto más seguro.
              </p>
            </article>

            <article className="about-card">
              <h3>Diseñado para todos</h3>
              <p>
                Interfaz limpia, lenguaje sencillo y resultados automáticos para que el usuario tome decisiones rápidas sin dudas.
              </p>
            </article>
          </div>

          <div className="about-tech">
            <p className="section-label">Análisis basado en</p>
            <div className="tech-list">
              <span className="tech-pill">VirusTotal</span>
              <span className="tech-pill">Google Safe Browsing</span>
              <span className="tech-pill">WhoIS</span>
              <span className="tech-pill">PhishTank</span>
              <span className="tech-pill">URLScan.io</span>
              <span className="tech-pill">Inteligencia Artificial</span>
            </div>
          </div>

          <p className="about-note">
            Nuestra meta es que navegar con enlaces QR sea lo más seguro posible: combinamos datos de fuentes confiables con
            análisis implícito para que los usuarios detecten fácilmente si una página es buena o mala.
          </p>

          <div className="about-actions">
            <button
              type="button"
              className="actions-button"
              onClick={() => {
                setIsAboutOpen(false)
                setHomeKey((prev) => prev + 1)
              }}
            >
              Volver al inicio
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell" key={homeKey}>
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

            {result.summary ? (
              <button
                type="button"
                className="more-info-btn"
                onClick={() => setShowMoreInfo((current) => !current)}
              >
                {showMoreInfo ? 'Ocultar más información' : 'Ver más información'}
              </button>
            ) : null}
          </div>
        </section>

        <div className="about-action">
          <button
            type="button"
            className="secondary-action-btn"
            onClick={() => setIsAboutOpen(true)}
          >
            Sobre OnlyQRs
          </button>
        </div>
      </section>

      {showMoreInfo && result.education ? (
        <div className="education-modal-overlay" onClick={() => setShowMoreInfo(false)}>
          <div className="education-modal" onClick={(event) => event.stopPropagation()}>
            <div className="education-modal-header">
              <h3>Sección educativa</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowMoreInfo(false)}
                aria-label="Cerrar información"
              >
                ×
              </button>
            </div>
            <div className="education-modal-content">
              <pre>{result.education}</pre>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default DesktopApp
