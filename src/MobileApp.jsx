import { useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import './MobileApp.css'
import { verifyScannerUrl, formatScannerResult } from './api'
import cameraIcon from './assets/camera-icon.svg'
import pencilIcon from './assets/pencil-icon.svg'

const initialResult = {
  summary: '',
  details: '',
}

function MobileApp() {
  const videoRef = useRef(null)
  const [scannedLink, setScannedLink] = useState('')
  const [manualLink, setManualLink] = useState('')
  const [status, setStatus] = useState('Elige cómo ingresar el QR')
  const [result, setResult] = useState(initialResult)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('idle') // 'idle' | 'scanning' | 'manual'
  const [torchActive, setTorchActive] = useState(false)
  const [showMoreInfo, setShowMoreInfo] = useState(false)
  const [selectedAnalyzer, setSelectedAnalyzer] = useState('OnlyQRs (predeterminado)')
  const [showAnalyzerOptions, setShowAnalyzerOptions] = useState(false)
  const [showAnalyzerGuide, setShowAnalyzerGuide] = useState(false)
  const analyzerOptions = [
    'OnlyQRs (predeterminado)',
    'VirusTotal',
    'WhoIs',
    'Google Safe browsing',
    'URLScan.io',
    'PishTank',
  ]
  const scannerRef = useRef(null)

  useEffect(() => {
    const startScanner = async () => {
      if (!videoRef.current) return

      try {
        QrScanner.hasCamera()
          .then((hasCamera) => {
            if (!hasCamera) {
              setError('Este dispositivo no tiene cámara disponible')
              setStatus('Error: sin cámara')
              setMode('idle')
            }
          })
          .catch(() => {
            console.log('No se pudo determinar disponibilidad de cámara')
          })

        const scanner = new QrScanner(
          videoRef.current,
          (result) => handleQrScanned(result.data),
          {
            onDecodeError: () => {},
            highlightScanRegion: false,
            highlightCodeOutline: false,
          }
        )

        scannerRef.current = scanner
        await scanner.start()
        setStatus('Apunta la cámara al QR')
      } catch (err) {
        console.error('Error iniciando escáner:', err)
        setError('No se pudo acceder a la cámara. Verifica los permisos.')
        setStatus('Error: permisos de cámara')
        setMode('idle')
      }
    }

    if (mode === 'scanning') {
      startScanner()
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop()
      }
    }
  }, [mode])

  const handleQrScanned = (qrValue) => {
    setScannedLink(qrValue)
    setStatus('QR escaneado ✓')
    setMode('idle')
    if (scannerRef.current) {
      scannerRef.current.stop()
    }
  }

  const analyzeLink = async (linkToAnalyze) => {
    const data = await verifyScannerUrl(linkToAnalyze, selectedAnalyzer)
    return formatScannerResult(data)
  }

  const handleStartScanning = () => {
    setScannedLink('')
    setManualLink('')
    setError('')
    setResult(initialResult)
    setShowAnalyzerOptions(false)
    setMode('scanning')
  }

  const handleStartManual = () => {
    setScannedLink('')
    setManualLink('')
    setError('')
    setResult(initialResult)
    setShowAnalyzerOptions(false)
    setMode('manual')
  }

  const handleAnalyze = async () => {
    setError('')

    const linkToUse = scannedLink || manualLink

    if (!linkToUse.trim()) {
      setError('Por favor ingresa o escanea un QR válido.')
      setStatus('Error: sin QR')
      return
    }

    setIsLoading(true)
    setStatus('Analizando...')
    setResult(initialResult)
    setShowMoreInfo(false)

    try {
      const analysis = await analyzeLink(linkToUse)
      setResult(analysis)
      setStatus('Análisis completado')
    } catch (err) {
      setError(err.message || 'No se pudo completar el análisis')
      setStatus('Error al analizar')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRescan = async () => {
    setScannedLink('')
    setManualLink('')
    setStatus('Elige cómo ingresar el QR')
    setResult(initialResult)
    setError('')
    setShowMoreInfo(false)
    setMode('idle')
  }

  const toggleTorch = async () => {
    if (scannerRef.current) {
      try {
        if (torchActive) {
          await scannerRef.current.turnOffFlash()
          setTorchActive(false)
        } else {
          await scannerRef.current.turnOnFlash()
          setTorchActive(true)
        }
      } catch (err) {
        console.error('Error toggling flash:', err)
      }
    }
  }

  const activeLink = scannedLink || manualLink

  return (
    <main className="mobile-app-shell">
      <header className="mobile-header">
        <img src="/logo.png" alt="OnlyQRs Logo" className="mobile-logo" />
        <p className="mobile-subtitle">Escanea o pega QR desde tu teléfono</p>
      </header>

      {showAnalyzerGuide ? (
        <section className="guide-page">
          <div className="guide-header">
            <h2>¿Cómo decidir?</h2>
            <p className="guide-intro">
              Usa esta guía para comparar cada analizador.
              Rellena los pros y contras según el comportamiento de cada uno.
            </p>
          </div>

          <div className="guide-content">
            <article className="guide-card">
              <h3>OnlyQRs (predeterminado)</h3>
              <p className="guide-subtitle">Pros</p>
              <ul>
                <li>• Texto de ejemplo para completar.</li>
                <li>• Más información aquí.</li>
              </ul>
              <p className="guide-subtitle">Contras</p>
              <ul>
                <li>• Texto de ejemplo para completar.</li>
              </ul>
            </article>

            <article className="guide-card">
              <h3>VirusTotal</h3>
              <p className="guide-subtitle">Pros</p>
              <ul>
                <li>• Texto de ejemplo para completar.</li>
              </ul>
              <p className="guide-subtitle">Contras</p>
              <ul>
                <li>• Texto de ejemplo para completar.</li>
              </ul>
            </article>

            <article className="guide-card">
              <h3>WhoIs</h3>
              <p className="guide-subtitle">Pros</p>
              <ul>
                <li>• Texto de ejemplo para completar.</li>
              </ul>
              <p className="guide-subtitle">Contras</p>
              <ul>
                <li>• Texto de ejemplo para completar.</li>
              </ul>
            </article>

            <article className="guide-card">
              <h3>Google Safe browsing</h3>
              <p className="guide-subtitle">Pros</p>
              <ul>
                <li>• Texto de ejemplo para completar.</li>
              </ul>
              <p className="guide-subtitle">Contras</p>
              <ul>
                <li>• Texto de ejemplo para completar.</li>
              </ul>
            </article>

            <article className="guide-card">
              <h3>URLScan.io</h3>
              <p className="guide-subtitle">Pros</p>
              <ul>
                <li>• Texto de ejemplo para completar.</li>
              </ul>
              <p className="guide-subtitle">Contras</p>
              <ul>
                <li>• Texto de ejemplo para completar.</li>
              </ul>
            </article>

            <article className="guide-card">
              <h3>PishTank</h3>
              <p className="guide-subtitle">Pros</p>
              <ul>
                <li>• Texto de ejemplo para completar.</li>
              </ul>
              <p className="guide-subtitle">Contras</p>
              <ul>
                <li>• Texto de ejemplo para completar.</li>
              </ul>
            </article>
          </div>

          <button
            type="button"
            className="btn-secondary guide-back-btn"
            onClick={() => setShowAnalyzerGuide(false)}
          >
            Volver al inicio
          </button>
        </section>
      ) : mode === 'idle' && !activeLink && (
        <section className="mode-selector">
          <div className="selector-content">
            <h2>¿Cómo quieres ingresar el QR?</h2>
            <div className="selector-buttons">
              <button
                type="button"
                className="mode-btn camera-btn"
                onClick={handleStartScanning}
              >
                <img src={cameraIcon} alt="Cámara" className="mode-icon-img" />
                <span className="mode-text">Escanear con cámara</span>
              </button>
              <button
                type="button"
                className="mode-btn manual-btn"
                onClick={handleStartManual}
              >
                <img src={pencilIcon} alt="Lápiz" className="mode-icon-img" />
                <span className="mode-text">Escribir manualmente</span>
              </button>
            </div>
            <div className="analyzer-selection-block">
              <h2>¿Qué analizador quieres usar?</h2>
              <button
                type="button"
                className="mode-btn analyzer-select-btn"
                onClick={() => setShowAnalyzerOptions((current) => !current)}
              >
                <span className="mode-text">{selectedAnalyzer}</span>
                <span className="analyzer-chevron">▾</span>
              </button>
              {showAnalyzerOptions && (
                <div className="analyzer-options">
                  {analyzerOptions.map((option) => (
                    <button
                      type="button"
                      key={option}
                      className={`mode-btn analyzer-option-btn ${selectedAnalyzer === option ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedAnalyzer(option)
                        setShowAnalyzerOptions(false)
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                className="mode-btn guide-btn"
                onClick={() => {
                  setShowAnalyzerGuide(true)
                  setShowAnalyzerOptions(false)
                }}
              >
                ¿Cómo decidir?
              </button>
            </div>
          </div>
        </section>
      )}

      {mode === 'scanning' && (
        <section className="scanner-container">
          <div className="scanner-header">
            <button
              type="button"
              className="back-btn"
              onClick={handleRescan}
              aria-label="Volver"
            >
              ← Volver
            </button>
          </div>
          <div className="video-wrapper">
            <video ref={videoRef} playsInline></video>
            <div className="scan-overlay">
              <div className="scan-box"></div>
            </div>
          </div>

          <div className="scanner-controls mobile-analyzer-selector">
          </div>
        </section>
      )}

      {mode === 'manual' && (
        <section className="manual-input-container">
          <div className="manual-content">
            <label className="manual-field">
              <span className="field-label">URL del QR</span>
              <input
                type="url"
                value={manualLink}
                onChange={(event) => setManualLink(event.target.value)}
                placeholder="https://ejemplo.com/qr"
                autoComplete="off"
                autoFocus
              />
            </label>

            {error ? <p className="form-error">{error}</p> : null}
          </div>
        </section>
      )}

      {activeLink && (
        <section className="scanned-result">
          <div className="check-icon">✓</div>
          <p className="scanned-label">QR Ingresado</p>
          <p className="scanned-link">{activeLink}</p>
        </section>
      )}

      <div className="status-bar-mobile">
        <p className={`status-text ${isLoading ? 'loading' : ''}`}>{status}</p>
      </div>

      <section className="actions-mobile">
        {mode === 'idle' && !activeLink ? (
          <p className="idle-hint">Selecciona una opción arriba</p>
        ) : mode === 'scanning' && !activeLink ? (
          <button type="button" className="btn-primary" disabled>
            Escaneando... Apunta al QR
          </button>
        ) : (
          <>
            <button
              type="button"
              className="btn-primary"
              onClick={handleAnalyze}
              disabled={isLoading}
            >
              {isLoading ? 'Analizando...' : 'Analizar QR'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleRescan}
              disabled={isLoading}
            >
              Comenzar de nuevo
            </button>
          </>
        )}
      </section>

      {error && mode !== 'manual' ? (
        <div className="error-banner">{error}</div>
      ) : null}

      {result.summary && (
        <section className="result-section-mobile">
          <h2 className="result-title">{result.summary}</h2>

          <div className="result-details">
            <pre>{result.details}</pre>
          </div>

          <button
            type="button"
            className="btn-secondary more-info-btn"
            onClick={() => setShowMoreInfo((current) => !current)}
          >
            {showMoreInfo ? 'Ocultar más información' : 'Ver más información'}
          </button>
        </section>
      )}

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

export default MobileApp
