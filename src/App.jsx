import { useState, useEffect } from 'react'
import DesktopApp from './DesktopApp'
import MobileApp from './MobileApp'
import './App.css'

function App() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
      setIsMobile(mobileRegex.test(userAgent.toLowerCase()))
    }

    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)

    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  return isMobile ? <MobileApp /> : <DesktopApp />
}

export default App
