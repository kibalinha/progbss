import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, Users, Building2, LogOut, Wrench } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { path: '/supervisor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/supervisor/schedule', icon: CalendarDays, label: 'Escala' },
  { path: '/supervisor/teams', icon: Users, label: 'Equipes' },
  { path: '/supervisor/sectors', icon: Building2, label: 'Setores' }
]

export function Sidebar() {
  const { logout } = useAuth()
  const location = useLocation()
  
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-40">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
          <Wrench className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-100">Manutenção</h1>
          <p className="text-xs text-slate-500">Sistema Industrial</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path
          return (
            <NavLink
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-orange-500 text-white' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </NavLink>
          )
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  )
}
