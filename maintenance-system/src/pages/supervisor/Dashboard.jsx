import { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { BarChartTechnicians } from '../../components/charts/BarChartTechnicians'
import { PieChartStatus } from '../../components/charts/PieChartStatus'
import { 
  formatDate, 
  getShiftLabel, 
  getStatusColor, 
  getStatusLabel,
  getPriorityColor,
  getPriorityLabel
} from '../../utils/helpers'
import { ClipboardList, CheckCircle2, Clock, AlertCircle, CalendarDays, Sun, Moon, XCircle, Star } from 'lucide-react'

export function Dashboard() {
  const { activities, technicians } = useApp()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedShift, setSelectedShift] = useState('all')
  
  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      const dateMatch = a.date === selectedDate
      const shiftMatch = selectedShift === 'all' || a.shift === selectedShift
      return dateMatch && shiftMatch
    })
  }, [activities, selectedDate, selectedShift])
  
  const stats = useMemo(() => {
    const total = filteredActivities.length
    const completed = filteredActivities.filter(a => a.status === 'completed').length
    const inProgress = filteredActivities.filter(a => a.status === 'in_progress').length
    const pending = filteredActivities.filter(a => a.status === 'pending').length
    const notDone = filteredActivities.filter(a => a.status === 'not_done').length
    const extras = filteredActivities.filter(a => a.isExtra).length
    return { total, completed, inProgress, pending, notDone, extras }
  }, [filteredActivities])
  
  const recentActivities = useMemo(() => {
    return [...filteredActivities]
      .sort((a, b) => b.id - a.id)
      .slice(0, 10)
  }, [filteredActivities])
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
          
          <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-1">
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
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                selectedShift === 'day' 
                  ? 'bg-orange-500 text-white' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sun className="w-4 h-4" />
              Dia
            </button>
            <button
              onClick={() => setSelectedShift('night')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                selectedShift === 'night' 
                  ? 'bg-orange-500 text-white' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Moon className="w-4 h-4" />
              Noite
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Total</p>
                <p className="text-2xl font-bold text-slate-100">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-400 mb-1">Concluídas</p>
                <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
              </div>
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-400 mb-1">Em Andamento</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.inProgress}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-400 mb-1">Pendentes</p>
                <p className="text-2xl font-bold text-red-400">{stats.pending}</p>
              </div>
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Não Realizadas</p>
                <p className="text-2xl font-bold text-slate-400">{stats.notDone}</p>
              </div>
              <div className="w-10 h-10 bg-slate-500/10 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-slate-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-400 mb-1">Extras</p>
                <p className="text-2xl font-bold text-purple-400">{stats.extras}</p>
              </div>
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Atividades por Técnico</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartTechnicians 
              activities={filteredActivities} 
              technicians={technicians} 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartStatus activities={filteredActivities} />
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Técnico</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Setor</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Descrição</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Prioridade</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Turno</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500">
                      Nenhuma atividade encontrada para os filtros selecionados
                    </td>
                  </tr>
                ) : (
                  recentActivities.map(activity => (
                    <tr key={activity.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 text-sm text-slate-200">{activity.technician}</td>
                      <td className="py-3 px-4 text-sm text-slate-300">{activity.sector}</td>
                      <td className="py-3 px-4 text-sm text-slate-200">{activity.description}</td>
                      <td className="py-3 px-4">
                        <Badge variant={activity.priority === 'high' ? 'danger' : activity.priority === 'medium' ? 'warning' : 'info'}>
                          {getPriorityLabel(activity.priority)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={activity.shift === 'day' ? 'day' : 'night'}>
                          {getShiftLabel(activity.shift)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(activity.status)}>
                          {getStatusLabel(activity.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
