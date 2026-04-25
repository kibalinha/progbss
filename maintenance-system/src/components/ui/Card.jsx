export function Card({ 
  children, 
  className = '',
  hover = false,
  padding = 'md',
  ...props 
}) {
  const baseStyles = 'bg-slate-800 border border-slate-700 rounded-lg'
  const hoverStyles = hover ? 'hover:border-slate-600 transition-all duration-200' : ''
  
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }
  
  const classes = `${baseStyles} ${hoverStyles} ${paddings[padding]} ${className}`
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-lg font-semibold text-slate-100 ${className}`}>
      {children}
    </h3>
  )
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}
