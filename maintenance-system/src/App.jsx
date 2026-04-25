import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { useAuth } from './hooks/useAuth'

import { LoginPage } from './pages/LoginPage'
import { SupervisorLoginPage } from './pages/supervisor/LoginPage'
import { SupervisorLayout } from './pages/supervisor/SupervisorLayout'
import { Dashboard } from './pages/supervisor/Dashboard'
import { Schedule } from './pages/supervisor/Schedule'
import { Teams } from './pages/supervisor/Teams'
import { Sectors } from './pages/supervisor/Sectors'
import { TechnicianAccess } from './pages/TechnicianAccess'
import { TechnicianView } from './pages/TechnicianView'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/supervisor/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      
      <Route path="/supervisor/login" element={<SupervisorLoginPage />} />
      <Route 
        path="/supervisor" 
        element={
          <PrivateRoute>
            <SupervisorLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="teams" element={<Teams />} />
        <Route path="sectors" element={<Sectors />} />
      </Route>
      
      <Route path="/technician" element={<TechnicianAccess />} />
      <Route path="/technician/:name" element={<TechnicianView />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
