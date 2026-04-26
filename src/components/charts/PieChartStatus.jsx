import { useMemo } from 'react'
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts'

const COLORS = {
  completed: '#22c55e',
  in_progress: '#eab308',
  pending: '#ef4444',
  not_done: '#64748b',
  extra: '#a855f7'
}

const LABELS = {
  completed: 'Concluídas',
  in_progress: 'Em Andamento',
  pending: 'Pendentes',
  not_done: 'Não Realizadas',
  extra: 'Extras'
}

export function PieChartStatus({ activities }) {
  const data = useMemo(() => {
    const counts = {
      completed: activities.filter(a => a.status === 'completed').length,
      in_progress: activities.filter(a => a.status === 'in_progress').length,
      pending: activities.filter(a => a.status === 'pending').length,
      not_done: activities.filter(a => a.status === 'not_done').length,
      extra: activities.filter(a => a.isExtra).length
    }
    
    return Object.entries(counts).map(([key, value]) => ({
      name: LABELS[key],
      value,
      color: COLORS[key]
    })).filter(item => item.value > 0)
  }, [activities])
  
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  const renderLabel = ({ name, value }) => {
    const percentage = ((value / total) * 100).toFixed(0)
    return `${percentage}%`
  }
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={4}
          dataKey="value"
          label={renderLabel}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1e293b', 
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#f1f5f9'
          }}
          formatter={(value, name) => [`${value} atividades`, name]}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          wrapperStyle={{ paddingTop: '20px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
