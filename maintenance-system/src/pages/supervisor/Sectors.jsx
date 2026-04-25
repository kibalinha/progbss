import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { 
  formatDate, 
  getShiftLabel,
  getStatusColor,
  getStatusLabel,
  getPriorityColor,
  getPriorityLabel
} from '../../utils/helpers'
import { 
  Building2, 
  ClipboardList, 
  CheckCircle2, 
  Star, 
  Clock,
  Zap,
  Settings,
  Droplets,
  Gauge,
  X,
  CalendarDays,
  User
} from 'lucide-react'

const sectorIcons = {
  'Elétrica': Zap,
  'Mecânica': Settings,
  'Utilidades': Droplets,
  'Instrumentação': Gauge
}

const sectorColors = {
  'Elétrica': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  'Mecânica': 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  'Utilidades': 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  'Instrumentação': 'text-purple-400 bg-purple-500/10 border-purple-500/30'
}

export function Sectors() {
  const { sectors, activities, technicians } = useApp()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedShift, setSelectedShift] = useState('all')
  const [modalData, setModalData] = useState(null)
  
  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      const dateMatch = a.date === selectedDate
      const shiftMatch = selectedShift === 'all' || a.shift === selectedShift
      return dateMatch && shiftMatch
    })
  }, [activities, selectedDate, selectedShift])
  
  const getSectorStats = (sector) => {
    const sectorActivities = filteredActivities.filter(a => a.sector === sector)
    return {
      total: sectorActivities.length,
      completed: sectorActivities.filter(a => a.status === 'completed').length,
      extras: sectorActivities.filter(a => a.isExtra).length,
      pending: sectorActivities.filter(a => a.status === 'pending' || a.status === 'in_progress').length,
      notDone: sectorActivities.filter(a => a.status === 'not_done').length
    }
  }
  
  const openModal = (sector, type, title) => {
    const sectorActivities = filteredActivities.filter(a => a.sector === sector)
    let filtered = []
    
    switch (type) {
      case 'total':
        filtered = sectorActivities
        break
      case 'completed':
        filtered = sectorActivities.filter(a => a.status === 'completed')
        break
      case 'extras':
        filtered = sectorActivities.filter(a => a.isExtra)
        break
      case 'pending':
        filtered = sectorActivities.filter(a => a.status === 'pending' || a.status === 'in_progress')
        break
      case 'not_done':
        filtered = sectorActivities.filter(a => a.status === 'not_done')
        break
      default:
        filtered = sectorActivities
    }
    
    setModalData({
      sector,
      title,
      activities: filtered,
      type
    })
  }
  
  const MetricBox = ({ value, label, icon: Icon, color, onClick, type }) => (
    <button
      onClick={onClick}
      className={`flex-1 p-3 rounded-lg border transition-all hover:scale-105 ${
        type === 'completed' ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20' :
        type === 'extras' ? 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20' :
        type === 'pending' ? 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20' :
        type === 'not_done' ? 'bg-slate-500/10 border-slate-500/30 hover:bg-slate-500/20' :
        'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <Icon className={`w-4 h-4 ${
          type === 'completed' ? 'text-green-400' :
          type === 'extras' ? 'text-purple-400' :
          type === 'pending' ? 'text-yellow-400' :
          type === 'not_done' ? 'text-slate-400' :
          'text-slate-400'
        }`} />
        <span className="text-xl font-bold text-slate-100">{value}</span>
      </div>
      <p className="text-xs text-slate-400 text-left">{label}</p>
    </button>
  )
  
  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-slate-400" />
              <div>
                <label className="block text-xs text-slate-500 mb-1">Data</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Turno</label>
                <div className="flex items-center bg-slate-700 rounded-lg p-1">
                  <button
                    onClick={() => setSelectedShift('all')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      selectedShift === 'all' 
                        ? 'bg-orange-500 text-white' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setSelectedShift('day')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      selectedShift === 'day' 
                        ? 'bg-sky-500 text-white' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Dia
                  </button>
                  <button
                    onClick={() => setSelectedShift('night')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      selectedShift === 'night' 
                        ? 'bg-indigo-500 text-white' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Noite
                  </button>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 ml-auto">
              <p className="text-xs text-slate-500">Visualizando</p>
              <p className="text-sm font-medium text-slate-200">
                {formatDate(selectedDate)} — {selectedShift === 'all' ? 'Todos os Turnos' : getShiftLabel(selectedShift)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Grid de Setores */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {sectors.map(sector => {
          const Icon = sectorIcons[sector] || Building2
          const colorClass = sectorColors[sector] || 'text-slate-400 bg-slate-500/10 border-slate-500/30'
          const stats = getSectorStats(sector)
          
          return (
            <Card key={sector} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{sector}</CardTitle>
                    <p className="text-sm text-slate-500">
                      {stats.total} atividade{stats.total !== 1 ? 's' : ''} no total
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <MetricBox
                    value={stats.total}
                    label="Total"
                    icon={ClipboardList}
                    type="total"
                    onClick={() => openModal(sector, 'total', `Todas as Atividades - ${sector}`)}
                  />
                  <MetricBox
                    value={stats.completed}
                    label="Concluídas"
                    icon={CheckCircle2}
                    type="completed"
                    onClick={() => openModal(sector, 'completed', `Atividades Concluídas - ${sector}`)}
                  />
                  <MetricBox
                    value={stats.extras}
                    label="Extras"
                    icon={Star}
                    type="extras"
                    onClick={() => openModal(sector, 'extras', `Atividades Extras - ${sector}`)}
                  />
                  <MetricBox
                    value={stats.pending}
                    label="Pendentes"
                    icon={Clock}
                    type="pending"
                    onClick={() => openModal(sector, 'pending', `Atividades Pendentes - ${sector}`)}
                  />
                </div>
                
                {stats.notDone > 0 && (
                  <div className="mt-3">
                    <MetricBox
                      value={stats.notDone}
                      label="Não Realizadas"
                      icon={X}
                      type="not_done"
                      onClick={() => openModal(sector, 'not_done', `Atividades Não Realizadas - ${sector}`)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {/* Modal de Atividades */}
      <Modal
        isOpen={!!modalData}
        onClose={() => setModalData(null)}
        title={modalData?.title || ''}
        size="lg"
      >
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {modalData?.activities.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Nenhuma atividade encontrada nesta categoria
            </div>
          ) : (
            modalData?.activities.map(activity => (
              <div 
                key={activity.id}
                className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge className={getPriorityColor(activity.priority)}>
                        {getPriorityLabel(activity.priority)}
                      </Badge>
                      <Badge className={getStatusColor(activity.status)}>
                        {getStatusLabel(activity.status)}
                      </Badge>
                      {activity.isExtra && (
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          <Star className="w-3 h-3 mr-1" />
                          Extra
                        </Badge>
                      )}
                    </div>
                    
                    <p className="font-medium text-slate-200 mb-1">{activity.description}</p>
                    
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {activity.technician}
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {formatDate(activity.date)}
                      </div>
                      {activity.estimatedTime > 0 && (
                        <>
                          <span>•</span>
                          <span>{activity.estimatedTime}min</span>
                        </>
                      )}
                    </div>
                    
                    {activity.notes && (
                      <div className="mt-2 p-2 bg-slate-800 rounded text-sm text-slate-300">
                        <span className="text-slate-500">
                          {activity.status === 'not_done' ? 'Motivo: ' : 'Obs: '}
                        </span>
                        {activity.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-sm text-slate-400 text-center">
            Total: {modalData?.activities.length || 0} atividade{modalData?.activities.length !== 1 ? 's' : ''}
          </p>
        </div>
      </Modal>
    </div>
  )
}
