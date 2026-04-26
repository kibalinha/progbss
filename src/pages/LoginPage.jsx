import { useNavigate } from 'react-router-dom'
import { Wrench, Shield, Users } from 'lucide-react'
import { Card } from '../components/ui/Card'

export function LoginPage() {
  const navigate = useNavigate()
  
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
          <Wrench className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-100 mb-2">
          Sistema de Manutenção
        </h1>
        <p className="text-slate-400">
          Gestão Industrial de Atividades
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
        <Card 
          hover 
          padding="lg"
          className="cursor-pointer group"
          onClick={() => navigate('/supervisor/login')}
        >
          <div className="text-center">
            <div className="w-14 h-14 bg-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-500/20 transition-colors">
              <Shield className="w-7 h-7 text-orange-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-100 mb-2">
              Área do Supervisor
            </h2>
            <p className="text-sm text-slate-400">
              Acesse o painel administrativo para gerenciar equipes, escalas e acompanhar métricas
            </p>
          </div>
        </Card>
        
        <Card 
          hover 
          padding="lg"
          className="cursor-pointer group"
          onClick={() => navigate('/technician')}
        >
          <div className="text-center">
            <div className="w-14 h-14 bg-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-500/20 transition-colors">
              <Users className="w-7 h-7 text-orange-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-100 mb-2">
              Área do Técnico
            </h2>
            <p className="text-sm text-slate-400">
              Visualize suas atividades programadas e atualize o status das manutenções
            </p>
          </div>
        </Card>
      </div>
      
      <p className="mt-10 text-sm text-slate-600">
        Sistema de Programação de Manutenção Industrial v1.0
      </p>
    </div>
  )
}
