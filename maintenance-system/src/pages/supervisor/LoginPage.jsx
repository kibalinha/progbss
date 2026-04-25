import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Shield, ArrowLeft, AlertCircle } from 'lucide-react'

export function SupervisorLoginPage() {
  const navigate = useNavigate()
  const { loginSupervisor } = useAuth()
  
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    const result = loginSupervisor(credentials.username, credentials.password)
    
    if (result.success) {
      navigate('/supervisor/dashboard')
    } else {
      setError(result.error)
    }
    
    setIsLoading(false)
  }
  
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </button>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-orange-500" />
          </div>
          <CardTitle>Acesso do Supervisor</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <Input
              label="Usuário"
              placeholder="Digite seu usuário"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
            />
            
            <Input
              label="Senha"
              type="password"
              placeholder="Digite sua senha"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
            />
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || !credentials.username || !credentials.password}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          
          <div className="mt-6 p-3 bg-slate-800/50 rounded-lg">
            <p className="text-xs text-slate-500 text-center">
              Credenciais de demonstração:<br />
              <span className="text-slate-400">admin / manutencao2024</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
