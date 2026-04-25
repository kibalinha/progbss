export function Badge({ 
  children, 
  variant = 'default',
  className = '',
  ...props 
}) {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border'
  
  const variants = {
    default: 'bg-slate-700 text-slate-300 border-slate-600',
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    danger: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    primary: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    day: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    night: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
  }
  
  const classes = `${baseStyles} ${variants[variant]} ${className}`
  
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  )
}
