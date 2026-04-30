import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { ArrowLeft, Users, Building2, Sun, Moon } from 'lucide-react'
import { getShiftBadgeColor } from '../utils/helpers'

export function TechnicianAccess() {
  const navigate = useNavigate()
  const { technicians, sectors } = useApp()

  // Group technicians by sector
  const techniciansBySector = sectors.map(sector => ({
    sector,
    techs: technicians.filter(t => t.sector === sector)
  })).filter(group => group.techs.length > 0)
  
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">
            Selecione seu nome
          </h1>
          <p className="text-slate-400">
            Escolha seu perfil para visualizar suas atividades programadas
          </p>
        </div>
        
        {/* Technicians grouped by sector */}
        <div className="space-y-8">
          {techniciansBySector.map(({ sector, techs }) => (
            <div key={sector}>
              {/* Sector Header */}
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
                <Building2 className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-slate-200">{sector}</h2>
                <Badge variant="secondary" className="ml-2">
                  {techs.length} técnico{techs.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              {/* Technicians Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {techs.map(tech => (
                  <Card
                    key={tech.id}
                    hover
                    padding="lg"
                    className="cursor-pointer group"
                    onClick={() => navigate(`/technician/${encodeURIComponent(tech.name)}`)}
                  >
                    <div className="text-center">
                      <div className="w-14 h-14 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-500/20 transition-colors">
                        <span className="text-xl font-bold text-slate-300 group-hover:text-orange-500 transition-colors">
                          {tech.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>

                      <h3 className="font-semibold text-slate-100 mb-1">{tech.name}</h3>

                      <Badge className={getShiftBadgeColor(tech.shift)}>
                        {tech.shift === 'day' ? (
                          <><Sun className="w-3 h-3 mr-1" /> Dia</>
                        ) : (
                          <><Moon className="w-3 h-3 mr-1" /> Noite</>
                        )}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {technicians.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">
              Nenhum técnico cadastrado. Entre em contato com o supervisor.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
