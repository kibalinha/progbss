export function getCurrentShift() {
  const hour = new Date().getHours()
  return hour >= 6 && hour < 18 ? 'day' : 'night'
}

export function formatDate(date) {
  if (!date) return ''
  // Se for string no formato YYYY-MM-DD, tratar como data local (não UTC)
  if (typeof date === 'string' && date.includes('-')) {
    const [year, month, day] = date.split('-')
    return `${day}/${month}/${year}`
  }
  // Fallback para objetos Date
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export function getShiftLabel(shift) {
  return shift === 'day' ? 'Dia' : 'Noite'
}

export function getPriorityColor(priority) {
  const colors = {
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-red-500/20 text-red-400 border-red-500/30'
  }
  return colors[priority] || colors.low
}

export function getPriorityLabel(priority) {
  const labels = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta'
  }
  return labels[priority] || 'Baixa'
}

export function getStatusColor(status) {
  const colors = {
    pending: 'bg-red-500/20 text-red-400 border-red-500/30',
    in_progress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    not_done: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    extra: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  }
  return colors[status] || colors.pending
}

export function getStatusLabel(status) {
  const labels = {
    pending: 'Pendente',
    in_progress: 'Em Andamento',
    completed: 'Concluída',
    not_done: 'Não Realizada',
    extra: 'Extra'
  }
  return labels[status] || 'Pendente'
}

export function filterActivitiesByTechnicianAndShift(activities, name, shift, date) {
  const dateStr = date ? new Date(date).toDateString() : new Date().toDateString()
  
  return activities.filter(activity => {
    const activityDate = new Date(activity.date).toDateString()
    return activity.technician === name && 
           activity.shift === shift && 
           activityDate === dateStr
  })
}

export function getNextDay(date) {
  const d = new Date(date)
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export function getShiftBadgeColor(shift) {
  return shift === 'day' 
    ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' 
    : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
}
