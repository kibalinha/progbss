import { useState, useMemo, useEffect, useRef } from 'react'
import { useApp } from '../../context/AppContext'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { ApplyModelModal } from '../../components/modals/ApplyModelModal'
import { 
  formatDate, 
  getShiftLabel,
  getPriorityColor,
  getPriorityLabel,
  getStatusColor,
  getStatusLabel
} from '../../utils/helpers'
import { Trash2, Plus, CalendarDays, Clock, Sun, Moon, Zap, Settings, Droplets, Gauge, FileSpreadsheet, List, User, Download, Layers, Copy, X } from 'lucide-react'
import html2canvas from 'html2canvas'

const sectorIcons = {
  'Elétrica': Zap,
  'Mecânica': Settings,
  'Utilidades': Droplets,
  'Instrumentação': Gauge
}

export function Schedule() {
  const { sectors, technicians, activities, models, addActivity, removeActivity, addModel, updateModel, removeModel } = useApp()
  const activitiesRef = useRef(null)

  const [referenceDate, setReferenceDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedShift, setSelectedShift] = useState('night')
  const [activeSector, setActiveSector] = useState(sectors[0] || '')
  const [activeTab, setActiveTab] = useState('schedule') // 'schedule' | 'models'

  // Estado para Modelos
  const [showModelForm, setShowModelForm] = useState(false)
  const [editingModel, setEditingModel] = useState(null)
  const [showApplyModel, setShowApplyModel] = useState(false)
  const [modelFormData, setModelFormData] = useState({
    name: '',
    description: '',
    sector: sectors[0] || '',
    shift: 'day',
    priority: 'medium',
    estimatedTime: '',
    notes: ''
  })
  
  // Atualiza o setor ativo quando os setores mudam
  useEffect(() => {
    if (sectors.length > 0 && !sectors.includes(activeSector)) {
      setActiveSector(sectors[0])
    }
  }, [sectors, activeSector])

  // Funções para Modelos
  const handleSaveModel = async (e) => {
    e.preventDefault()
    if (!modelFormData.name || !modelFormData.description) return

    if (editingModel) {
      await updateModel({ ...modelFormData, id: editingModel.id })
      setEditingModel(null)
    } else {
      await addModel(modelFormData)
    }

    setShowModelForm(false)
    setModelFormData({
      name: '',
      description: '',
      sector: sectors[0] || '',
      shift: 'day',
      priority: 'medium',
      estimatedTime: '',
      notes: ''
    })
  }

  const handleEditModel = (model) => {
    setModelFormData(model)
    setEditingModel(model)
    setShowModelForm(true)
  }

  const handleDeleteModel = async (id) => {
    await removeModel(id)
  }

  const handleApplyModel = (model, targetDate, targetShift, targetTechnician) => {
    // Divide a descrição em múltiplas atividades (uma por linha não vazia)
    const activitiesList = model.description
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)

    // Cria uma atividade para cada linha com ID único
    activitiesList.forEach((activityDescription, index) => {
      addActivity({
        id: Date.now() + index, // ID único para cada atividade
        description: activityDescription,
        sector: model.sector,
        technician: targetTechnician,
        priority: model.priority,
        status: 'pending',
        date: targetDate,
        shift: targetShift,
        estimatedTime: parseInt(model.estimatedTime) || 0,
        isExtra: false,
        notes: index === 0 ? (model.notes || '') : '' // Só a primeira atividade tem as notas do modelo
      })
    })

    setShowApplyModel(false)
    setEditingModel(null)
  }

  const [formData, setFormData] = useState({
    description: '',
    sector: '',
    technician: '',
    priority: 'medium',
    estimatedTime: ''
  })
  
  // Estado para modo de importação em massa
  const [inputMode, setInputMode] = useState('individual') // 'individual' | 'bulk'
  const [bulkData, setBulkData] = useState({
    technician: '',
    priority: 'medium',
    estimatedTime: '',
    lines: ''
  })
  
  // Atualiza o setor do formulário quando muda a aba
  useEffect(() => {
    setFormData(prev => ({ ...prev, sector: activeSector, technician: '' }))
  }, [activeSector])
  
  const availableTechnicians = useMemo(() => {
    return technicians.filter(t =>
      t.shift === selectedShift &&
      t.sector === activeSector
    )
  }, [technicians, selectedShift, activeSector])

  const scheduledActivities = useMemo(() => {
    console.log('[Schedule] Filtering activities:', {
      total: activities.length,
      referenceDate,
      selectedShift,
      activeSector
    })
    console.log('[Schedule] All activities:', activities.map(a => ({ id: a.id, sector: a.sector, date: a.date, shift: a.shift })))
    const filtered = activities.filter(a =>
      a.date === referenceDate &&
      a.shift === selectedShift &&
      a.sector === activeSector
    )
    console.log('[Schedule] Filtered activities:', filtered.length)
    return filtered
  }, [activities, referenceDate, selectedShift, activeSector])
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.description || !formData.technician) return

    addActivity({
      ...formData,
      sector: activeSector,
      status: 'pending',
      date: referenceDate,
      shift: selectedShift,
      estimatedTime: parseInt(formData.estimatedTime) || 0
    })
    
    setFormData({
      description: '',
      sector: activeSector,
      technician: '',
      priority: 'medium',
      estimatedTime: ''
    })
  }
  
  const handleBulkSubmit = (e) => {
    e.preventDefault()
    if (!bulkData.lines.trim() || !bulkData.technician) return
    
    // Divide por linhas e cria atividades
    const lines = bulkData.lines.split('\n').filter(line => line.trim())
    const baseId = Date.now()
    
    lines.forEach((line, index) => {
      addActivity({
        id: baseId + index, // ID único para cada atividade
        description: line.trim(),
        sector: activeSector,
        technician: bulkData.technician,
        priority: bulkData.priority,
        status: 'pending',
        date: referenceDate,
        shift: selectedShift,
        estimatedTime: parseInt(bulkData.estimatedTime) || 0
      })
    })
    
    // Limpa o formulário
    setBulkData({
      technician: '',
      priority: 'medium',
      estimatedTime: '',
      lines: ''
    })
  }

  const handleExportImage = async () => {
    if (!activitiesRef.current) return
    
    try {
      // Criar container temporário para exportação
      const exportContainer = document.createElement('div')
      exportContainer.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 800px;
        padding: 30px;
        background: #0f172a;
        font-family: system-ui, -apple-system, sans-serif;
      `
      
      // Cabeçalho
      const header = document.createElement('div')
      header.style.cssText = `
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 2px solid #f97316;
      `
      header.innerHTML = `
        <h1 style="color: #f97316; font-size: 28px; margin: 0 0 10px 0; font-weight: bold;">Programação - ${activeSector}</h1>
        <p style="color: #94a3b8; font-size: 16px; margin: 0;">${formatDate(referenceDate)} • Turno ${getShiftLabel(selectedShift)}</p>
        <p style="color: #64748b; font-size: 14px; margin: 5px 0 0 0;">${scheduledActivities.length} atividade${scheduledActivities.length !== 1 ? 's' : ''}</p>
      `
      
      exportContainer.appendChild(header)
      
      // Lista de atividades
      scheduledActivities.forEach((activity, index) => {
        const item = document.createElement('div')
        item.style.cssText = `
          padding: 15px;
          margin-bottom: 12px;
          background: #1e293b;
          border-radius: 8px;
          border-left: 4px solid ${activity.priority === 'high' ? '#ef4444' : activity.priority === 'medium' ? '#f97316' : '#22c55e'};
        `
        
        const priorityColors = {
          high: '#ef4444',
          medium: '#f97316',
          low: '#22c55e'
        }
        
        const statusColors = {
          pending: '#64748b',
          in_progress: '#3b82f6',
          completed: '#22c55e',
          not_done: '#ef4444',
          extra: '#a855f7'
        }
        
        item.innerHTML = `
          <div style="color: #f1f5f9; font-size: 16px; font-weight: 600; margin-bottom: 8px;">${index + 1}. ${activity.description}</div>
          <div style="color: #94a3b8; font-size: 14px; margin-bottom: 6px;">👤 ${activity.technician} ${activity.estimatedTime > 0 ? `⏱️ ${activity.estimatedTime}min` : ''}</div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <span style="color: ${priorityColors[activity.priority]}; font-size: 12px; padding: 4px 8px; background: ${priorityColors[activity.priority]}20; border-radius: 4px; font-weight: 500;">${getPriorityLabel(activity.priority)}</span>
            <span style="color: ${statusColors[activity.status]}; font-size: 12px; padding: 4px 8px; background: ${statusColors[activity.status]}20; border-radius: 4px; font-weight: 500;">${getStatusLabel(activity.status)}</span>
          </div>
        `
        
        exportContainer.appendChild(item)
      })
      
      // Rodapé
      const footer = document.createElement('div')
      footer.style.cssText = `
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #334155;
        text-align: center;
        color: #64748b;
        font-size: 12px;
      `
      footer.innerHTML = 'Sistema de Manutenção Industrial'
      exportContainer.appendChild(footer)
      
      document.body.appendChild(exportContainer)
      
      const canvas = await html2canvas(exportContainer, {
        backgroundColor: '#0f172a',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      })
      
      document.body.removeChild(exportContainer)
      
      const link = document.createElement('a')
      link.download = `programacao-${activeSector}-${formatDate(referenceDate)}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Erro ao exportar imagem:', error)
    }
  }
  
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Abas Principais: Programação / Modelos */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-all ${
            activeTab === 'schedule'
              ? 'text-orange-500 border-b-2 border-orange-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          Programação
        </button>
        <button
          onClick={() => setActiveTab('models')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-all ${
            activeTab === 'models'
              ? 'text-orange-500 border-b-2 border-orange-500'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Modelos
        </button>
      </div>

      {activeTab === 'schedule' ? (
        <>
          {/* Abas dos Setores */}
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {sectors.map(sector => {
              const Icon = sectorIcons[sector] || Settings
              const isActive = activeSector === sector
              return (
                <button
                  key={sector}
                  onClick={() => setActiveSector(sector)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm sm:text-base">{sector}</span>
                </button>
              )
            })}
          </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {activeSector && (() => {
              const Icon = sectorIcons[activeSector] || Settings
              return <Icon className="w-5 h-5 text-orange-500" />
            })()}
            <CardTitle>Programação - {activeSector}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <CalendarDays className="w-5 h-5 text-slate-400" />
              <div className="w-full sm:w-auto">
                <label className="block text-xs text-slate-500 mb-1">Data de Referência</label>
                <input
                  type="date"
                  value={referenceDate}
                  onChange={(e) => setReferenceDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Clock className="w-5 h-5 text-slate-400" />
              <div className="w-full sm:w-auto">
                <label className="block text-xs text-slate-500 mb-1">Turno</label>
                <div className="flex items-center bg-slate-700 rounded-lg p-1">
                  <button
                    onClick={() => setSelectedShift('night')}
                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                      selectedShift === 'night' 
                        ? 'bg-indigo-500 text-white' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span className="hidden sm:inline">Noite</span>
                  </button>
                  <button
                    onClick={() => setSelectedShift('day')}
                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                      selectedShift === 'day' 
                        ? 'bg-sky-500 text-white' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span className="hidden sm:inline">Dia</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="px-3 sm:px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 w-full sm:w-auto">
              <p className="text-xs text-slate-500">Programando</p>
              <p className="text-sm font-medium text-slate-200">
                {activeSector} — Turno {getShiftLabel(selectedShift)} — {formatDate(referenceDate)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Nova Atividade - {activeSector}</CardTitle>
              
              {/* Toggle de modo */}
              <div className="flex items-center bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setInputMode('individual')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    inputMode === 'individual'
                      ? 'bg-orange-500 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Cadastrar uma atividade por vez"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">Individual</span>
                </button>
                <button
                  onClick={() => setInputMode('bulk')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    inputMode === 'bulk'
                      ? 'bg-green-500 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Importar múltiplas atividades do Excel"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="hidden sm:inline">Importar</span>
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {inputMode === 'individual' ? (
              // Formulário individual (mantido como está)
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Descrição"
                  placeholder={`Descreva a atividade de ${activeSector}...`}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
                
                <Select
                  label="Técnico"
                  value={formData.technician}
                  onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                  required
                >
                  <option value="">Selecione o técnico...</option>
                  {availableTechnicians.length === 0 ? (
                    <option value="" disabled>Nenhum técnico disponível</option>
                  ) : (
                    availableTechnicians.map(tech => (
                      <option key={tech.id} value={tech.name}>{tech.name}</option>
                    ))
                  )}
                </Select>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Prioridade"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </Select>
                  
                  <Input
                    label="Tempo Estimado (min)"
                    type="number"
                    min="0"
                    placeholder="Ex: 60"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={!formData.description || !formData.technician}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Atividade
                </Button>
              </form>
            ) : (
              // Formulário de importação em massa
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-sm text-green-400 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    <strong>Modo Importação:</strong> Cole as atividades do Excel
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Cada linha será uma atividade. Exemplo: "Troca de rolamentos M01"
                  </p>
                </div>
                
                <Select
                  label="Técnico"
                  value={bulkData.technician}
                  onChange={(e) => setBulkData({ ...bulkData, technician: e.target.value })}
                  required
                >
                  <option value="">Selecione o técnico...</option>
                  {availableTechnicians.length === 0 ? (
                    <option value="" disabled>Nenhum técnico disponível</option>
                  ) : (
                    availableTechnicians.map(tech => (
                      <option key={tech.id} value={tech.name}>{tech.name}</option>
                    ))
                  )}
                </Select>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Prioridade padrão"
                    value={bulkData.priority}
                    onChange={(e) => setBulkData({ ...bulkData, priority: e.target.value })}
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </Select>
                  
                  <Input
                    label="Tempo padrão (min)"
                    type="number"
                    min="0"
                    placeholder="Ex: 60"
                    value={bulkData.estimatedTime}
                    onChange={(e) => setBulkData({ ...bulkData, estimatedTime: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Atividades (uma por linha)
                  </label>
                  <textarea
                    value={bulkData.lines}
                    onChange={(e) => setBulkData({ ...bulkData, lines: e.target.value })}
                    placeholder={`Exemplo:
Troca de rolamentos M01
Lubrificação redutor R05
Calibração sensor S03
Manutenção preventiva...`}
                    rows={6}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 resize-none font-mono text-sm"
                    required
                  />
                  {bulkData.lines && (
                    <p className="text-xs text-slate-500 mt-1">
                      {bulkData.lines.split('\n').filter(l => l.trim()).length} atividade(s) para importar
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setInputMode('individual')
                      setBulkData({ technician: '', priority: 'medium', estimatedTime: '', lines: '' })
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={!bulkData.lines.trim() || !bulkData.technician}
                    variant="primary"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Importar {bulkData.lines ? `(${bulkData.lines.split('\n').filter(l => l.trim()).length})` : ''}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Atividades - {activeSector}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="default">
                  {scheduledActivities.length} atividade{scheduledActivities.length !== 1 ? 's' : ''}
                </Badge>
                {scheduledActivities.length > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleExportImage}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Exportar</span>
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={activitiesRef} className="space-y-3 max-h-[400px] overflow-y-auto pr-2" id="activities-container">
              {scheduledActivities.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  Nenhuma atividade programada para {activeSector} neste turno
                </div>
              ) : (
                scheduledActivities.map(activity => (
                  <div 
                    key={activity.id}
                    className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-200 truncate">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-400">{activity.technician}</span>
                          {activity.estimatedTime > 0 && (
                            <>
                              <span className="text-slate-600">•</span>
                              <span className="text-xs text-slate-400">{activity.estimatedTime}min</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getPriorityColor(activity.priority)}>
                            {getPriorityLabel(activity.priority)}
                          </Badge>
                          <Badge className={getStatusColor(activity.status)}>
                            {getStatusLabel(activity.status)}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeActivity(activity.id)}
                        className="text-slate-400 hover:text-red-400 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
        </>
      ) : (
        /* ABA DE MODELOS */
        <div className="space-y-4">
          {/* Cabeçalho de Modelos */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-slate-200">Modelos de Atividades</h2>
            </div>
            <Button onClick={() => setShowModelForm(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Modelo
            </Button>
          </div>

          {/* Lista de Modelos */}
          {models.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Layers className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">Nenhum modelo criado ainda</p>
                <p className="text-sm text-slate-500">Crie modelos para facilitar programações recorrentes</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {models.map(model => (
                <Card key={model.id} className="hover:border-orange-500/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-200">{model.name}</h3>
                          <Badge className={getPriorityColor(model.priority)}>
                            {getPriorityLabel(model.priority)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {getShiftLabel(model.shift)}
                          </Badge>
                          <span className="text-xs text-slate-500">• {model.sector}</span>
                        </div>
                        <p className="text-slate-400 text-sm mb-2">{model.description}</p>
                        {model.estimatedTime && (
                          <p className="text-xs text-slate-500">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {model.estimatedTime} minutos
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setEditingModel(model); setShowApplyModel(true); }}
                          className="text-orange-400 hover:text-orange-300"
                          title="Aplicar modelo"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditModel(model)}
                          className="text-slate-400 hover:text-slate-200"
                          title="Editar"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteModel(model.id)}
                          className="text-slate-400 hover:text-red-400"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Criar/Editar Modelo */}
      {showModelForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-md w-full p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-200">
                {editingModel ? 'Editar Modelo' : 'Novo Modelo'}
              </h3>
              <button
                onClick={() => { setShowModelForm(false); setEditingModel(null); }}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveModel} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Nome do Modelo *</label>
                <Input
                  value={modelFormData.name}
                  onChange={(e) => setModelFormData({ ...modelFormData, name: e.target.value })}
                  placeholder="Ex: Lubrificação Semanal"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Descrição das Atividades *
                  <span className="text-xs text-slate-500 ml-1">(uma atividade por linha)</span>
                </label>
                <textarea
                  value={modelFormData.description}
                  onChange={(e) => setModelFormData({ ...modelFormData, description: e.target.value })}
                  placeholder="Ex:\nLubrificar rolamentos\nVerificar tensão da correia\nLimpar filtros"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 min-h-[120px]"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Setor</label>
                  <Select
                    value={modelFormData.sector}
                    onChange={(e) => setModelFormData({ ...modelFormData, sector: e.target.value })}
                    options={sectors.map(s => ({ value: s, label: s }))}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Turno Padrão</label>
                  <Select
                    value={modelFormData.shift}
                    onChange={(e) => setModelFormData({ ...modelFormData, shift: e.target.value })}
                    options={[
                      { value: 'day', label: 'Dia' },
                      { value: 'night', label: 'Noite' }
                    ]}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Prioridade</label>
                  <Select
                    value={modelFormData.priority}
                    onChange={(e) => setModelFormData({ ...modelFormData, priority: e.target.value })}
                    options={[
                      { value: 'low', label: 'Baixa' },
                      { value: 'medium', label: 'Média' },
                      { value: 'high', label: 'Alta' }
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Tempo Estimado (min)</label>
                  <Input
                    type="number"
                    value={modelFormData.estimatedTime}
                    onChange={(e) => setModelFormData({ ...modelFormData, estimatedTime: e.target.value })}
                    placeholder="Ex: 60"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Observações</label>
                <textarea
                  value={modelFormData.notes}
                  onChange={(e) => setModelFormData({ ...modelFormData, notes: e.target.value })}
                  placeholder="Notas adicionais..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1">
                  {editingModel ? 'Salvar Alterações' : 'Criar Modelo'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => { setShowModelForm(false); setEditingModel(null); }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Aplicar Modelo */}
      {showApplyModel && editingModel && (
        <ApplyModelModal
          model={editingModel}
          sectors={sectors}
          technicians={technicians}
          onApply={handleApplyModel}
          onClose={() => { setShowApplyModel(false); setEditingModel(null); }}
        />
      )}
    </div>
  )
}
