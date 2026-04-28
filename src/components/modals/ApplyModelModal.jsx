import { useState, useMemo } from 'react'
import { Button } from '../ui/Button'
import { Input, Select } from '../ui/Input'
import { X, Copy, CalendarDays, Clock, User } from 'lucide-react'
import { formatDate, getShiftLabel, getPriorityLabel, getPriorityColor } from '../../utils/helpers'

export function ApplyModelModal({ model, sectors, technicians, onApply, onClose }) {
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0])
  const [targetShift, setTargetShift] = useState(model.shift || 'day')
  const [targetTechnician, setTargetTechnician] = useState('')
  const [targetSector, setTargetSector] = useState(model.sector || sectors[0] || '')

  const availableTechnicians = useMemo(() => {
    return technicians.filter(t =>
      t.shift === targetShift &&
      t.sector === targetSector
    )
  }, [technicians, targetShift, targetSector])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!targetTechnician) return
    onApply(model, targetDate, targetShift, targetTechnician)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-md w-full p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-200">Aplicar Modelo</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview do Modelo */}
        <div className="bg-slate-700/50 rounded-lg p-4 mb-4 border border-slate-600">
          <h4 className="font-medium text-slate-200 mb-2">{model.name}</h4>
          <p className="text-sm text-slate-400 mb-2">{model.description}</p>
          <div className="flex items-center gap-2 text-xs">
            <span className={`px-2 py-1 rounded ${getPriorityColor(model.priority)}`}>
              {getPriorityLabel(model.priority)}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">{getShiftLabel(model.shift)}</span>
            {model.estimatedTime && (
              <>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{model.estimatedTime}min</span>
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Data de Aplicação *
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Turno *
            </label>
            <Select
              value={targetShift}
              onChange={(e) => setTargetShift(e.target.value)}
              options={[
                { value: 'day', label: 'Dia' },
                { value: 'night', label: 'Noite' }
              ]}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Setor</label>
            <Select
              value={targetSector}
              onChange={(e) => setTargetSector(e.target.value)}
              options={sectors.map(s => ({ value: s, label: s }))}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1 flex items-center gap-2">
              <User className="w-4 h-4" />
              Técnico *
            </label>
            <Select
              value={targetTechnician}
              onChange={(e) => setTargetTechnician(e.target.value)}
              options={[
                { value: '', label: 'Selecione um técnico...' },
                ...availableTechnicians.map(t => ({ value: t.name, label: t.name }))
              ]}
            />
            {availableTechnicians.length === 0 && (
              <p className="text-xs text-amber-500 mt-1">
                Nenhum técnico disponível para este turno e setor
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2"
              disabled={!targetTechnician}
            >
              <Copy className="w-4 h-4" />
              Aplicar Modelo
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
