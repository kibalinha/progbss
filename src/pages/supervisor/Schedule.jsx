import { useState, useMemo, useEffect, useRef } from 'react'
import { useApp } from '../../context/AppContext'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { 
  formatDate, 
  getNextDay,
  getShiftLabel,
  getPriorityColor,
  getPriorityLabel,
  getStatusColor,
  getStatusLabel
} from '../../utils/helpers'
import { Trash2, Plus, CalendarDays, Clock, Sun, Moon, Zap, Settings, Droplets, Gauge, FileSpreadsheet, List, User, Download } from 'lucide-react'
import html2canvas from 'html2canvas'

const sectorIcons = {
  'Elétrica': Zap,
  'Mecânica': Settings,
  'Utilidades': Droplets,
  'Instrumentação': Gauge
}

export function Schedule() {
  const { sectors, technicians, activities, addActivity, removeActivity } = useApp()
  const activitiesRef = useRef(null)
  
  const [referenceDate, setReferenceDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedShift, setSelectedShift] = useState('night')
  const [activeSector, setActiveSector] = useState(sectors[0] || '')
  
  // Atualiza o setor ativo quando os setores mudam
  useEffect(() => {
    if (sectors.length > 0 && !sectors.includes(activeSector)) {
      setActiveSector(sectors[0])
    }
  }, [sectors, activeSector])
  
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
  
  // Lógica de data: referenceDate = dia da programação
  // Noite: atividades são para o próprio dia (27/04 noite = data 27/04)
  // Dia: atividades são para o dia seguinte (27/04 dia = data 28/04)
  const actualDate = useMemo(() => {
    return selectedShift === 'day' ? getNextDay(referenceDate) : referenceDate
  }, [selectedShift, referenceDate])

  const availableTechnicians = useMemo(() => {
    return technicians.filter(t =>
      t.shift === selectedShift &&
      t.sector === activeSector
    )
  }, [technicians, selectedShift, activeSector])

  const scheduledActivities = useMemo(() => {
    return activities.filter(a =>
      a.date === actualDate &&
      a.shift === selectedShift &&
      a.sector === activeSector
    )
  }, [activities, actualDate, selectedShift, activeSector])
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.description || !formData.technician) return

    addActivity({
      ...formData,
      sector: activeSector,
      status: 'pending',
      date: actualDate,
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
        date: actualDate,
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
        <p style="color: #94a3b8; font-size: 16px; margin: 0;">${formatDate(actualDate)} • Turno ${getShiftLabel(selectedShift)}</p>
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
      link.download = `programacao-${activeSector}-${formatDate(actualDate)}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Erro ao exportar imagem:', error)
    }
  }
  
  return (
    <div className="space-y-4 sm:space-y-6">
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
                {activeSector} — Turno {getShiftLabel(selectedShift)} — {formatDate(actualDate)}
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
    </div>
  )
}
