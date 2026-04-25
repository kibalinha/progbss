import { forwardRef } from 'react'

export const Input = forwardRef(function Input({ 
  className = '',
  error,
  label,
  id,
  ...props 
}, ref) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-300 mb-1"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`
          w-full px-3 py-2 
          bg-slate-700 border border-slate-600 rounded-md
          text-slate-100 placeholder-slate-500
          focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500
          transition-all duration-200
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  )
})

export const Select = forwardRef(function Select({
  className = '',
  error,
  label,
  id,
  children,
  ...props
}, ref) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')
  
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-medium text-slate-300 mb-1"
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`
          w-full px-3 py-2 
          bg-slate-700 border border-slate-600 rounded-md
          text-slate-100
          focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500
          transition-all duration-200
          appearance-none cursor-pointer
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  )
})

export const TextArea = forwardRef(function TextArea({
  className = '',
  error,
  label,
  id,
  rows = 3,
  ...props
}, ref) {
  const textAreaId = id || label?.toLowerCase().replace(/\s+/g, '-')
  
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={textAreaId}
          className="block text-sm font-medium text-slate-300 mb-1"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textAreaId}
        rows={rows}
        className={`
          w-full px-3 py-2 
          bg-slate-700 border border-slate-600 rounded-md
          text-slate-100 placeholder-slate-500
          focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500
          transition-all duration-200 resize-none
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  )
})
