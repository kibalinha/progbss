import { useApp } from '../context/AppContext'

const VALID_CREDENTIALS = {
  username: 'admin',
  password: 'admin'
}

export function useAuth() {
  const { currentUser, login, logout } = useApp()

  const isAuthenticated = currentUser?.type === 'supervisor'

  const loginSupervisor = (username, password) => {
    if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
      login({ type: 'supervisor', username })
      return { success: true }
    }
    return { success: false, error: 'Credenciais inválidas' }
  }

  const loginTechnician = (name) => {
    login({ type: 'technician', name })
  }

  const logoutUser = () => {
    logout()
  }

  return {
    currentUser,
    isAuthenticated,
    loginSupervisor,
    loginTechnician,
    logout: logoutUser
  }
}
