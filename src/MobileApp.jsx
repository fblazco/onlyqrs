import { useEffect, useRef, useState } from 'react'
import QrScanner from 'qr-scanner'
import './MobileApp.css'
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
            highlightScanRegion: true,
            highlightCodeOutline: true,
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
    const payload = { url: linkToAnalyze.trim() }

    try {
      const response = await fetch('http://localhost:3000/api/scanner/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('No se pudo conectar con el servidor')
      }

      const data = await response.json()
      if (data.success && data.reporte_seguridad) {
        const reporte = data.reporte_seguridad
        const evaluacion = reporte.evaluacion
        return {
          summary: `Riesgo: ${evaluacion.nivel_riesgo}`,
          details: `🔒 INFORME DE SEGURIDAD
${'-'.repeat(50)}

📍 URL: ${reporte.objetivo.url_completa}

⚠️  EVALUACIÓN:
• Nivel: ${evaluacion.nivel_riesgo}
• Seguro: ${evaluacion.es_seguro ? 'Sí' : 'No'}
• Alertas: ${evaluacion.total_banderas_rojas}

${evaluacion.advertencias.length > 0 ? '🚩 ADVERTENCIAS:\n' + evaluacion.advertencias.map(a => `• ${a}`).join('\n') : '✅ OK'}

📋 DATOS:
• Antigüedad: ${reporte.datos_tecnicos.antiguedad_dias} días
• País: ${reporte.datos_tecnicos.propietario.pais}`,
        }
      }
      return {
        summary: 'Análisis recibido',
        details: JSON.stringify(data, null, 2),
      }
    } catch (err) {
      console.error('Error al conectar con el backend:', err)
      throw err
    }
  }

  const handleStartScanning = () => {
    setScannedLink('')
    setManualLink('')
    setError('')
    setResult(initialResult)
    setMode('scanning')
  }

  const handleStartManual = () => {
    setScannedLink('')
    setManualLink('')
    setError('')
    setResult(initialResult)
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

    const analysis = await analyzeLink(linkToUse)
    setResult(analysis)
    setStatus('Análisis completado')
    setIsLoading(false)
  }

  const handleRescan = async () => {
    setScannedLink('')
    setManualLink('')
    setStatus('Elige cómo ingresar el QR')
    setResult(initialResult)
    setError('')
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
        <h1>OnlyQR</h1>
        <p className="mobile-subtitle">Escanea o pega QR desde tu teléfono</p>
      </header>

      {mode === 'idle' && !activeLink && (
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

          <div className="scanner-controls">
            <button
              type="button"
              className="torch-btn"
              onClick={toggleTorch}
              aria-label="Alternar linterna"
            >
              {torchActive ? '💡 Luz ON' : '🔦 Luz OFF'}
            </button>
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
        </section>
      )}
    </main>
  )
}

export default MobileApp
