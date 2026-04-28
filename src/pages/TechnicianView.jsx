import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input, TextArea } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import {
  formatDate,
  getCurrentShift,
  getShiftLabel,
  getPriorityColor,
  getPriorityLabel,
  getStatusColor,
  getStatusLabel,
  filterActivitiesByTechnicianAndShift
} from '../utils/helpers'
import { 
  ArrowLeft, 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Building2,
  Sun,
  Moon,
  ClipboardList,
  XCircle,
  Plus,
  Star,
  ListTodo,
  Zap,
  Settings,
  Droplets,
  Gauge
} from 'lucide-react'

const sectorIcons = {
  'Elétrica': Zap,
  'Mecânica': Settings,
  'Utilidades': Droplets,
  'Instrumentação': Gauge
}

export function TechnicianView() {
  const { name } = useParams()
  const navigate = useNavigate()
  const { technicians, activities, updateActivityStatus, addActivity } = useApp()
  
  const [activeTab, setActiveTab] = useState('scheduled')
  const [completingActivity, setCompletingActivity] = useState(null)
  const [notDoingActivity, setNotDoingActivity] = useState(null)
  const [completionNotes, setCompletionNotes] = useState('')
  const [notDoneReason, setNotDoneReason] = useState('')

  // Formulário de atividade extra
  const [extraForm, setExtraForm] = useState({
    description: '',
    priority: 'medium',
    estimatedTime: ''
  })
  const [showExtraForm, setShowExtraForm] = useState(false)

  const technician = technicians.find(t => t.name === name)
  const currentShift = getCurrentShift()

  // Estados para seleção de data e turno (permitindo técnico escolher)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedShift, setSelectedShift] = useState(currentShift)

  // Atividades programadas (filtro baseado na seleção do técnico)
  const myScheduledActivities = filterActivitiesByTechnicianAndShift(
    activities.filter(a => !a.isExtra),
    name,
    selectedShift,
    selectedDate
  )

  // Atividades extras (criadas pelo próprio técnico na data/turno selecionados)
  const myExtraActivities = activities.filter(a =>
    a.isExtra &&
    a.technician === name &&
    a.date === selectedDate &&
    a.shift === selectedShift
  )
  
  const sortedScheduled = [...myScheduledActivities].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    const statusOrder = { pending: 0, in_progress: 1, completed: 2, not_done: 3 }
    
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status]
    }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
  
  const sortedExtras = [...myExtraActivities].sort((a, b) => b.id - a.id)
  
  const handleStartActivity = (activityId) => {
    updateActivityStatus(activityId, 'in_progress')
  }
  
  const handleCompleteClick = (activity) => {
    setCompletingActivity(activity)
    setCompletionNotes('')
  }
  
  const handleConfirmComplete = () => {
    if (completingActivity) {
      updateActivityStatus(completingActivity.id, 'completed', completionNotes)
      setCompletingActivity(null)
      setCompletionNotes('')
    }
  }
  
  const handleNotDoneClick = (activity) => {
    setNotDoingActivity(activity)
    setNotDoneReason('')
  }
  
  const handleConfirmNotDone = () => {
    if (notDoingActivity) {
      updateActivityStatus(notDoingActivity.id, 'not_done', notDoneReason)
      setNotDoingActivity(null)
      setNotDoneReason('')
    }
  }
  
  const handleAddExtra = (e) => {
    e.preventDefault()
    if (!extraForm.description) return

    addActivity({
      description: extraForm.description,
      sector: technician?.sector || 'Geral',
      technician: name,
      priority: extraForm.priority,
      estimatedTime: parseInt(extraForm.estimatedTime) || 0,
      status: 'extra',
      shift: selectedShift,
      date: selectedDate,
      isExtra: true,
      notes: ''
    })

    setExtraForm({ description: '', priority: 'medium', estimatedTime: '' })
    setShowExtraForm(false)
  }
  
  const getActionButtons = (activity) => {
    if (activity.status === 'pending') {
      return (
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleStartActivity(activity.id)}
          >
            <Play className="w-4 h-4 mr-1.5" />
            Iniciar
          </Button>
        </div>
      )
    }
    
    if (activity.status === 'in_progress') {
      return (
        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleCompleteClick(activity)}
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Concluir
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNotDoneClick(activity)}
            className="text-slate-400 hover:text-slate-300"
          >
            <XCircle className="w-4 h-4 mr-1.5" />
            Não Realizada
          </Button>
        </div>
      )
    }
    
    if (activity.status === 'completed') {
      return (
        <Badge variant="success" className="pointer-events-none">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Concluída
        </Badge>
      )
    }
    
    if (activity.status === 'not_done') {
      return (
        <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30 pointer-events-none">
          <XCircle className="w-3 h-3 mr-1" />
          Não Realizada
        </Badge>
      )
    }
    
    if (activity.status === 'extra') {
      return (
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 pointer-events-none">
          <Star className="w-3 h-3 mr-1" />
          Extra
        </Badge>
      )
    }
    
    return null
  }
  
  if (!technician) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <Card className="text-center max-w-md">
          <CardContent className="p-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-100 mb-2">
              Técnico não encontrado
            </h2>
            <p className="text-slate-400 mb-4">
              O técnico selecionado não existe no sistema.
            </p>
            <Button onClick={() => navigate('/technician')}>
              Voltar para seleção
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/technician')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-slate-100">{technician.name}</p>
                <div className="flex items-center justify-end gap-2 text-sm text-slate-400">
                  <Building2 className="w-3 h-3" />
                  {technician.sector}
                </div>
              </div>
              
              {/* Controles de Data e Turno */}
              <div className="flex items-center gap-2">
                {/* Seletor de Data */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent text-slate-200 text-sm font-mono focus:outline-none cursor-pointer"
                  />
                </div>

                {/* Botões de Turno */}
                <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-1">
                  <button
                    onClick={() => setSelectedShift('day')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-all ${
                      selectedShift === 'day'
                        ? 'bg-orange-500 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sun className="w-3 h-3" />
                    <span className="hidden sm:inline">Dia</span>
                  </button>
                  <button
                    onClick={() => setSelectedShift('night')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-all ${
                      selectedShift === 'night'
                        ? 'bg-indigo-500 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Moon className="w-3 h-3" />
                    <span className="hidden sm:inline">Noite</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-3 sm:hidden">
            <p className="font-semibold text-slate-100">{technician.name}</p>
            <p className="text-sm text-slate-400">{technician.sector}</p>
          </div>
        </div>
      </header>
      
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Abas */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'scheduled'
                ? 'bg-orange-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            Programadas
            <Badge variant={activeTab === 'scheduled' ? 'default' : 'secondary'} className="ml-1">
              {sortedScheduled.length}
            </Badge>
          </button>
          
          <button
            onClick={() => setActiveTab('extras')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'extras'
                ? 'bg-purple-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Star className="w-4 h-4" />
            Extras
            <Badge variant={activeTab === 'extras' ? 'default' : 'secondary'} className="ml-1">
              {sortedExtras.length}
            </Badge>
          </button>
        </div>
        
        {/* Conteúdo - Atividades Programadas */}
        {activeTab === 'scheduled' && (
          <>
            {sortedScheduled.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">
                    Nenhuma atividade programada
                  </h3>
                  <p className="text-slate-500">
                    Não há atividades programadas para você em {formatDate(selectedDate)} ({getShiftLabel(selectedShift)}).
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {sortedScheduled.map(activity => (
                  <Card key={activity.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <Badge className={getPriorityColor(activity.priority)}>
                                {getPriorityLabel(activity.priority)}
                              </Badge>
                              <Badge className={getStatusColor(activity.status)}>
                                {activity.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                {activity.status === 'in_progress' && <Play className="w-3 h-3 mr-1" />}
                                {activity.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                {activity.status === 'not_done' && <XCircle className="w-3 h-3 mr-1" />}
                                {getStatusLabel(activity.status)}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                {activity.estimatedTime > 0 && `${activity.estimatedTime}min`}
                              </span>
                            </div>
                            
                            <p className="font-medium text-slate-200 mb-1">
                              {activity.description}
                            </p>
                            <p className="text-sm text-slate-400">
                              {activity.sector}
                            </p>
                            
                            {(activity.notes) && (
                              <div className="mt-3 p-3 bg-slate-800/50 rounded-lg">
                                <p className="text-xs text-slate-500 mb-1">
                                  {activity.status === 'not_done' ? 'Motivo:' : 'Observações:'}
                                </p>
                                <p className="text-sm text-slate-300">{activity.notes}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-shrink-0">
                            {getActionButtons(activity)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Conteúdo - Atividades Extras */}
        {activeTab === 'extras' && (
          <>
            {/* Botão para adicionar extra */}
            {!showExtraForm && (
              <Button
                variant="outline"
                className="w-full mb-4 border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                onClick={() => setShowExtraForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Atividade Extra
              </Button>
            )}
            
            {/* Formulário de extra */}
            {showExtraForm && (
              <Card className="mb-4 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Star className="w-4 h-4 text-purple-400" />
                    Nova Atividade Extra
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddExtra} className="space-y-4">
                    <TextArea
                      label="Descrição"
                      placeholder="Descreva a atividade extra executada..."
                      value={extraForm.description}
                      onChange={(e) => setExtraForm({ ...extraForm, description: e.target.value })}
                      required
                      rows={2}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <select
                        value={extraForm.priority}
                        onChange={(e) => setExtraForm({ ...extraForm, priority: e.target.value })}
                        className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      >
                        <option value="low">Prioridade Baixa</option>
                        <option value="medium">Prioridade Média</option>
                        <option value="high">Prioridade Alta</option>
                      </select>
                      
                      <Input
                        type="number"
                        min="0"
                        placeholder="Tempo (min)"
                        value={extraForm.estimatedTime}
                        onChange={(e) => setExtraForm({ ...extraForm, estimatedTime: e.target.value })}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="flex-1"
                        onClick={() => setShowExtraForm(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        className="flex-1"
                        disabled={!extraForm.description}
                      >
                        <Plus className="w-4 h-4 mr-1.5" />
                        Adicionar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
            
            {/* Lista de extras */}
            {sortedExtras.length === 0 && !showExtraForm ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Star className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">
                    Nenhuma atividade extra
                  </h3>
                  <p className="text-slate-500">
                    Você ainda não registrou atividades extras em {formatDate(selectedDate)} ({getShiftLabel(selectedShift)}).
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {sortedExtras.map(activity => {
                  const Icon = sectorIcons[activity.sector] || Settings
                  return (
                    <Card key={activity.id} className="overflow-hidden border-purple-500/20">
                      <CardContent className="p-0">
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <Badge className={getPriorityColor(activity.priority)}>
                                  {getPriorityLabel(activity.priority)}
                                </Badge>
                                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                  <Star className="w-3 h-3 mr-1" />
                                  Extra
                                </Badge>
                                {activity.estimatedTime > 0 && (
                                  <span className="text-xs text-slate-500">
                                    {activity.estimatedTime}min
                                  </span>
                                )}
                              </div>
                              
                              <p className="font-medium text-slate-200 mb-1">
                                {activity.description}
                              </p>
                              <div className="flex items-center gap-1 text-sm text-slate-400">
                                <Icon className="w-3 h-3" />
                                {activity.sector}
                              </div>
                            </div>
                            
                            <div className="flex-shrink-0">
                              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 pointer-events-none">
                                <Star className="w-3 h-3 mr-1" />
                                Extra
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>
      
      <Modal
        isOpen={!!completingActivity}
        onClose={() => setCompletingActivity(null)}
        title="Concluir Atividade"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-slate-300">
            Você está concluindo a atividade:
          </p>
          <div className="p-3 bg-slate-800 rounded-lg">
            <p className="font-medium text-slate-200">{completingActivity?.description}</p>
          </div>
          
          <TextArea
            label="Observações (opcional)"
            placeholder="Adicione informações sobre o que foi realizado..."
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            rows={3}
          />
          
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setCompletingActivity(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleConfirmComplete}
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Confirmar Conclusão
            </Button>
          </div>
        </div>
      </Modal>
      
      <Modal
        isOpen={!!notDoingActivity}
        onClose={() => setNotDoingActivity(null)}
        title="Atividade Não Realizada"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-slate-300">
            Você está marcando como <strong>não realizada</strong> a atividade:
          </p>
          <div className="p-3 bg-slate-800 rounded-lg">
            <p className="font-medium text-slate-200">{notDoingActivity?.description}</p>
          </div>
          
          <TextArea
            label="Motivo (obrigatório)"
            placeholder="Informe o motivo pelo qual a atividade não foi realizada..."
            value={notDoneReason}
            onChange={(e) => setNotDoneReason(e.target.value)}
            rows={3}
            required
          />
          
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setNotDoingActivity(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleConfirmNotDone}
              disabled={!notDoneReason.trim()}
            >
              <XCircle className="w-4 h-4 mr-1.5" />
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
