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
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex-col z-40">
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
      
      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-40">
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path
            return (
              <NavLink
                key={path}
                to={path}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'text-orange-500' 
                    : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{label}</span>
              </NavLink>
            )
          })}
          <button
            onClick={logout}
            className="flex flex-col items-center gap-1 px-3 py-2 text-slate-400 hover:text-red-400 rounded-lg transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs font-medium">Sair</span>
          </button>
        </div>
      </nav>
    </>
  )
}
