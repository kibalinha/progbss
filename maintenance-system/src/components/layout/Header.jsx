import { useState, useEffect } from 'react'
import { formatDate, getCurrentShift, getShiftLabel } from '../../utils/helpers'

export function Header({ title }) {
  const [currentTime, setCurrentTime] = useState(new Date())
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])
  
  const shift = getCurrentShift()
  
  return (
    <header className="h-16 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30 backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-slate-100 tracking-wide">
        {title}
      </h2>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
          <span className={`w-2 h-2 rounded-full ${shift === 'day' ? 'bg-sky-400' : 'bg-indigo-400'}`} />
          <span className="text-sm text-slate-300 font-medium">
            Turno {getShiftLabel(shift)}
          </span>
        </div>
        
        <div className="text-right">
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
