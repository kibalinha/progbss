import { useState, useMemo } from 'react'
import { Button } from '../ui/Button'
import { X, Copy, Download, FileText, AlertCircle, Clock, CheckCircle2, XCircle, Building2, Star } from 'lucide-react'
import { formatDate, getShiftLabel } from '../../utils/helpers'

export function ShiftReportModal({ isOpen, onClose, activities, sectors, date, shift }) {
  const [copied, setCopied] = useState(false)
  const [selectedSector, setSelectedSector] = useState('all')

  // Calculate statistics (filtered by sector if selected)
  const report = useMemo(() => {
    const filteredActivities = selectedSector === 'all'
      ? activities.filter(a => a.date === date && a.shift === shift)
      : activities.filter(a => a.date === date && a.shift === shift && a.sector === selectedSector)

    const sectorStats = sectors.map(sector => {
      const sectorActivities = activities.filter(a => a.sector === sector && a.shift === shift && a.date === date)
      return {
        sector,
        total: sectorActivities.length,
        completed: sectorActivities.filter(a => a.status === 'completed').length,
        pending: sectorActivities.filter(a => a.status === 'pending').length,
        inProgress: sectorActivities.filter(a => a.status === 'in_progress').length,
        notDone: sectorActivities.filter(a => a.status === 'not_done').length,
        extras: sectorActivities.filter(a => a.isExtra).length
      }
    }).filter(s => s.total > 0)

    const notDoneActivities = filteredActivities.filter(a => a.status === 'not_done')
    const pendingActivities = filteredActivities.filter(a => a.status === 'pending')
    const inProgressActivities = filteredActivities.filter(a => a.status === 'in_progress')
    const completedActivities = filteredActivities.filter(a => a.status === 'completed')
    const extraActivities = filteredActivities.filter(a => a.isExtra)

    const totals = {
      total: filteredActivities.length,
      completed: completedActivities.length,
      pending: pendingActivities.length,
      inProgress: inProgressActivities.length,
      notDone: notDoneActivities.length,
      extras: extraActivities.length
    }

    return { sectorStats, notDoneActivities, pendingActivities, inProgressActivities, completedActivities, extraActivities, totals, selectedSector }
  }, [activities, sectors, date, shift, selectedSector])

  // Generate formatted text report
  const textReport = useMemo(() => {
    const sectorTitle = selectedSector === 'all' ? 'TODOS OS SETORES' : selectedSector.toUpperCase()
    const lines = [
      `📊 RELATÓRIO DO TURNO - ${formatDate(date)} - ${getShiftLabel(shift)}`,
      `🏭 SETOR: ${sectorTitle}`,
      '',
      '📈 RESUMO POR SETOR:'
    ]

    report.sectorStats.forEach(stat => {
      lines.push(`• ${stat.sector}: ${stat.total} total | ✅ ${stat.completed} concluídas | ⏳ ${stat.pending} pendentes | ❌ ${stat.notDone} não feitas`)
    })

    if (report.notDoneActivities.length > 0) {
      lines.push('')
      lines.push('❌ ATIVIDADES NÃO REALIZADAS:')
      report.notDoneActivities.forEach((a, i) => {
        lines.push(`${i + 1}. [${a.sector}] ${a.description} - ${a.technician}`)
      })
    }

    if (report.pendingActivities.length > 0) {
      lines.push('')
      lines.push('⏳ ATIVIDADES PENDENTES:')
      report.pendingActivities.forEach((a, i) => {
        lines.push(`${i + 1}. [${a.sector}] ${a.description} - ${a.technician}`)
      })
    }

    if (report.inProgressActivities.length > 0) {
      lines.push('')
      lines.push('🔄 ATIVIDADES EM ANDAMENTO:')
      report.inProgressActivities.forEach((a, i) => {
        lines.push(`${i + 1}. [${a.sector}] ${a.description} - ${a.technician}`)
      })
    }

    if (report.completedActivities.length > 0) {
      lines.push('')
      lines.push('✅ ATIVIDADES CONCLUÍDAS:')
      report.completedActivities.forEach((a, i) => {
        lines.push(`${i + 1}. [${a.sector}] ${a.description} - ${a.technician}`)
      })
    }

    if (report.extraActivities.length > 0) {
      lines.push('')
      lines.push('⭐ ATIVIDADES EXTRAS:')
      report.extraActivities.forEach((a, i) => {
        lines.push(`${i + 1}. [${a.sector}] ${a.description} - ${a.technician}`)
      })
    }

    lines.push('')
    lines.push(`📊 TOTAL GERAL: ${report.totals.total} atividades | ✅ ${report.totals.completed} concluídas | ⏳ ${report.totals.pending} pendentes | 🔄 ${report.totals.inProgress} em andamento | ❌ ${report.totals.notDone} não feitas | ⭐ ${report.totals.extras} extras`)

    return lines.join('\n')
  }, [report, date, shift])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textReport)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleExportImage = async () => {
    // Simple text export as .txt file
    const blob = new Blob([textReport], { type: 'text/plain;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    const sectorSuffix = selectedSector === 'all' ? 'todos' : selectedSector.toLowerCase().replace(/\s+/g, '-')
    link.download = `relatorio-${date}-${shift}-${sectorSuffix}.txt`
    link.click()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-orange-500" />
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Relatório do Turno</h2>
              <p className="text-sm text-slate-400">
                {formatDate(date)} • {getShiftLabel(shift)} • {selectedSector === 'all' ? 'Todos os Setores' : selectedSector}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Sector Selector */}
          <div className="mb-6">
            <label className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Selecionar Setor:
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSector('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedSector === 'all'
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                Todos os Setores
              </button>
              {sectors.map(sector => (
                <button
                  key={sector}
                  onClick={() => setSelectedSector(sector)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedSector === sector
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {sector}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            <div className="bg-slate-700/50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-slate-200">{report.totals.total}</p>
              <p className="text-xs text-slate-400">Total</p>
            </div>
            <div className="bg-green-500/10 p-3 rounded-lg text-center border border-green-500/20">
              <p className="text-2xl font-bold text-green-400">{report.totals.completed}</p>
              <p className="text-xs text-green-400/70">Concluídas</p>
            </div>
            <div className="bg-yellow-500/10 p-3 rounded-lg text-center border border-yellow-500/20">
              <p className="text-2xl font-bold text-yellow-400">{report.totals.pending}</p>
              <p className="text-xs text-yellow-400/70">Pendentes</p>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-lg text-center border border-blue-500/20">
              <p className="text-2xl font-bold text-blue-400">{report.totals.inProgress}</p>
              <p className="text-xs text-blue-400/70">Em Andamento</p>
            </div>
            <div className="bg-red-500/10 p-3 rounded-lg text-center border border-red-500/20">
              <p className="text-2xl font-bold text-red-400">{report.totals.notDone}</p>
              <p className="text-xs text-red-400/70">Não Feitas</p>
            </div>
          </div>

          {/* Sector Breakdown */}
          {report.sectorStats.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                Resumo por Setor
              </h3>
              <div className="space-y-2">
                {report.sectorStats.map(stat => (
                  <div key={stat.sector} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <span className="font-medium text-slate-200">{stat.sector}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-400">{stat.total} total</span>
                      <span className="text-green-400">✓ {stat.completed}</span>
                      <span className="text-yellow-400">⏳ {stat.pending}</span>
                      <span className="text-red-400">✕ {stat.notDone}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Critical Activities */}
          {(report.notDoneActivities.length > 0 || report.pendingActivities.length > 0) && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Atividades que Precisam de Atenção
              </h3>
              
              {report.notDoneActivities.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-red-400 mb-2 font-medium">❌ Não Realizadas:</p>
                  <div className="space-y-1">
                    {report.notDoneActivities.slice(0, 5).map(a => (
                      <div key={a.id} className="p-2 bg-red-500/10 border border-red-500/20 rounded text-sm text-slate-300">
                        <span className="text-slate-400">[{a.sector}]</span> {a.description} - <span className="text-slate-500">{a.technician}</span>
                      </div>
                    ))}
                    {report.notDoneActivities.length > 5 && (
                      <p className="text-xs text-slate-500 pl-2">...e mais {report.notDoneActivities.length - 5} atividades</p>
                    )}
                  </div>
                </div>
              )}

              {report.pendingActivities.length > 0 && (
                <div>
                  <p className="text-xs text-yellow-400 mb-2 font-medium">⏳ Pendentes:</p>
                  <div className="space-y-1">
                    {report.pendingActivities.slice(0, 3).map(a => (
                      <div key={a.id} className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm text-slate-300">
                        <span className="text-slate-400">[{a.sector}]</span> {a.description} - <span className="text-slate-500">{a.technician}</span>
                      </div>
                    ))}
                    {report.pendingActivities.length > 3 && (
                      <p className="text-xs text-slate-500 pl-2">...e mais {report.pendingActivities.length - 3} atividades</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Completed Activities */}
          {report.completedActivities.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Atividades Concluídas ({report.completedActivities.length})
              </h3>
              <div className="space-y-1">
                {report.completedActivities.slice(0, 5).map(a => (
                  <div key={a.id} className="p-2 bg-green-500/10 border border-green-500/20 rounded text-sm text-slate-300">
                    <span className="text-slate-400">[{a.sector}]</span> {a.description} - <span className="text-slate-500">{a.technician}</span>
                  </div>
                ))}
                {report.completedActivities.length > 5 && (
                  <p className="text-xs text-slate-500 pl-2">...e mais {report.completedActivities.length - 5} atividades concluídas</p>
                )}
              </div>
            </div>
          )}

          {/* Extra Activities */}
          {report.extraActivities.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-purple-500" />
                Atividades Extras ({report.extraActivities.length})
              </h3>
              <div className="space-y-1">
                {report.extraActivities.slice(0, 5).map(a => (
                  <div key={a.id} className="p-2 bg-purple-500/10 border border-purple-500/20 rounded text-sm text-slate-300">
                    <span className="text-slate-400">[{a.sector}]</span> {a.description} - <span className="text-slate-500">{a.technician}</span>
                  </div>
                ))}
                {report.extraActivities.length > 5 && (
                  <p className="text-xs text-slate-500 pl-2">...e mais {report.extraActivities.length - 5} atividades extras</p>
                )}
              </div>
            </div>
          )}

          {/* Text Preview */}
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
            <h3 className="text-xs font-medium text-slate-400 mb-2">Prévia do Texto (formatado para copiar):</h3>
            <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed max-h-40 overflow-y-auto">
              {textReport}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-700 bg-slate-900/50">
          <Button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2"
            variant={copied ? "secondary" : "primary"}
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copiado!' : 'Copiar Texto'}
          </Button>
          <Button
            onClick={handleExportImage}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>
    </div>
  )
}
