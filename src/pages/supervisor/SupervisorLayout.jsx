import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { Sidebar } from '../../components/layout/Sidebar'
import { Header } from '../../components/layout/Header'
import { useAuth } from '../../hooks/useAuth'

const pageTitles = {
  '/supervisor/dashboard': 'Dashboard',
  '/supervisor/schedule': 'Escala de Manutenção',
  '/supervisor/teams': 'Gestão de Equipes',
  '/supervisor/sectors': 'Visão por Setores'
}

export function SupervisorLayout() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  
  if (!isAuthenticated) {
    return <Navigate to="/supervisor/login" replace />
  }
  
  const title = pageTitles[location.pathname] || 'Supervisor'
  
  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      
      <div className="ml-64 min-h-screen flex flex-col">
        <Header title={title} />
        
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
