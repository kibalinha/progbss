import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Plus, X, Users, Building2, Trash2, Sun, Moon } from 'lucide-react'

export function Teams() {
  const { sectors, technicians, addSector, removeSector, addTechnician, removeTechnician } = useApp()
  
  const [newSector, setNewSector] = useState('')
  const [newTechnician, setNewTechnician] = useState({
    name: '',
    sector: '',
    shift: 'day'
  })
  
  const handleAddSector = (e) => {
    e.preventDefault()
    if (newSector.trim()) {
      addSector(newSector.trim())
      setNewSector('')
    }
  }
  
  const handleAddTechnician = (e) => {
    e.preventDefault()
    if (newTechnician.name.trim() && newTechnician.sector) {
      addTechnician({
        name: newTechnician.name.trim(),
        sector: newTechnician.sector,
        shift: newTechnician.shift
      })
      setNewTechnician({ name: '', sector: '', shift: 'day' })
    }
  }
  
  const techniciansBySector = sectors.map(sector => ({
    sector,
    techs: technicians.filter(t => t.sector === sector)
  }))
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-orange-500" />
              <CardTitle>Setores</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSector} className="flex gap-2 mb-4">
              <Input
                placeholder="Nome do novo setor..."
                value={newSector}
                onChange={(e) => setNewSector(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={!newSector.trim() || sectors.includes(newSector.trim())}>
                <Plus className="w-4 h-4" />
              </Button>
            </form>
            
            <div className="space-y-2">
              {sectors.length === 0 ? (
                <p className="text-center py-4 text-slate-500 text-sm">
                  Nenhum setor cadastrado
                </p>
              ) : (
                sectors.map(sector => (
                  <div 
                    key={sector}
                    className="flex items-center justify-between px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700"
                  >
                    <span className="text-slate-200">{sector}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSector(sector)}
                      className="text-slate-400 hover:text-red-400 p-1"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              <CardTitle>Cadastrar Técnico</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTechnician} className="space-y-4">
              <Input
                label="Nome"
                placeholder="Nome completo do técnico..."
                value={newTechnician.name}
                onChange={(e) => setNewTechnician({ ...newTechnician, name: e.target.value })}
                required
              />
              
              <Select
                label="Setor"
                value={newTechnician.sector}
                onChange={(e) => setNewTechnician({ ...newTechnician, sector: e.target.value })}
                required
              >
                <option value="">Selecione um setor...</option>
                {sectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </Select>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Turno</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTechnician({ ...newTechnician, shift: 'day' })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                      newTechnician.shift === 'day'
                        ? 'bg-sky-500/20 border-sky-500/50 text-sky-400'
                        : 'bg-slate-700 border-slate-600 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    Dia
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTechnician({ ...newTechnician, shift: 'night' })}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                      newTechnician.shift === 'night'
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400'
                        : 'bg-slate-700 border-slate-600 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    Noite
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={!newTechnician.name.trim() || !newTechnician.sector}
              >
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Técnico
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            <CardTitle>Equipes por Setor</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {techniciansBySector.map(({ sector, techs }) => (
              <div key={sector}>
                <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wide">
                  {sector}
                </h3>
                {techs.length === 0 ? (
                  <p className="text-sm text-slate-600 pl-4">
                    Nenhum técnico cadastrado neste setor
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {techs.map(tech => (
                      <div 
                        key={tech.id}
                        className="flex items-center justify-between px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-200">{tech.name}</span>
                          <Badge variant={tech.shift === 'day' ? 'day' : 'night'}>
                            {tech.shift === 'day' ? 'Dia' : 'Noite'}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTechnician(tech.id)}
                          className="text-slate-400 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
