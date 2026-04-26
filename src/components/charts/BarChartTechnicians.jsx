import { useMemo } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

export function BarChartTechnicians({ activities, technicians }) {
  const data = useMemo(() => {
    return technicians.map(tech => {
      const techActivities = activities.filter(a => a.technician === tech.name)
      return {
        name: tech.name.split(' ')[0],
        fullName: tech.name,
        Concluídas: techActivities.filter(a => a.status === 'completed').length,
        'Em Andamento': techActivities.filter(a => a.status === 'in_progress').length,
        Pendentes: techActivities.filter(a => a.status === 'pending').length,
        'Não Realizadas': techActivities.filter(a => a.status === 'not_done').length,
        Extras: techActivities.filter(a => a.isExtra).length
      }
    })
  }, [activities, technicians])
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis 
          dataKey="name" 
          stroke="#94a3b8" 
          fontSize={12}
          tickLine={false}
        />
        <YAxis 
          stroke="#94a3b8" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1e293b', 
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#f1f5f9'
          }}
          cursor={{ fill: '#334155', opacity: 0.3 }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
        />
        <Bar dataKey="Concluídas" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Em Andamento" fill="#eab308" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Pendentes" fill="#ef4444" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Não Realizadas" fill="#64748b" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Extras" fill="#a855f7" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
