import { useState, useEffect } from 'react'
import { formatDate, getCurrentShift, getShiftLabel } from '../../utils/helpers'
import { Download } from 'lucide-react'

export function Header({ title }) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])
  
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
    }
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])
  
  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setShowInstallButton(false)
    }
    
    setDeferredPrompt(null)
  }
  
  const shift = getCurrentShift()
  
  return (
    <header className="h-16 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 backdrop-blur-sm">
      <h2 className="text-lg sm:text-xl font-semibold text-slate-100 tracking-wide">
        {title}
      </h2>
      
      <div className="flex items-center gap-3 sm:gap-6">
        {showInstallButton && (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Instalar</span>
          </button>
        )}
        
        <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
          <span className={`w-2 h-2 rounded-full ${shift === 'day' ? 'bg-sky-400' : 'bg-indigo-400'}`} />
          <span className="text-xs sm:text-sm text-slate-300 font-medium">
            <span className="hidden sm:inline">Turno </span>{getShiftLabel(shift)}
          </span>
        </div>
        
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-slate-200 font-mono">
            {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-xs text-slate-500">
            {formatDate(currentTime)}
          </p>
        </div>
      </div>
    </header>
  )
}
