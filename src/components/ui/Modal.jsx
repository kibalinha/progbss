import { X } from 'lucide-react'
import { Button } from './Button'

export function Modal({ 
  isOpen, 
  onClose, 
  title,
  children,
  size = 'md',
  showCloseButton = true
}) {
  if (!isOpen) return null
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200" />
      
      <div 
        className={`relative w-full ${sizes[size]} bg-slate-800 border border-slate-700 rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-slate-100">
            {title}
          </h3>
          {showCloseButton && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="p-1"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
        
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  )
}
