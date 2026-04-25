const today = new Date().toISOString().split('T')[0]
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

export const initialSectors = [
  'Elétrica',
  'Mecânica',
  'Utilidades',
  'Instrumentação'
]

export const initialTechnicians = [
  { id: 1, name: 'João Silva', sector: 'Elétrica', shift: 'day' },
  { id: 2, name: 'Carlos Souza', sector: 'Elétrica', shift: 'night' },
  { id: 3, name: 'Pedro Alves', sector: 'Mecânica', shift: 'day' },
  { id: 4, name: 'Lucas Lima', sector: 'Mecânica', shift: 'night' },
  { id: 5, name: 'Ana Ferreira', sector: 'Utilidades', shift: 'day' },
  { id: 6, name: 'Marcos Costa', sector: 'Utilidades', shift: 'night' },
  { id: 7, name: 'Fernanda Reis', sector: 'Instrumentação', shift: 'day' },
  { id: 8, name: 'Roberto Neto', sector: 'Instrumentação', shift: 'night' }
]

export const initialActivities = [
  // Turno Dia - Hoje
  {
    id: 1,
    description: 'Manutenção preventiva motor M01',
    sector: 'Elétrica',
    technician: 'João Silva',
    priority: 'high',
    estimatedTime: 120,
    status: 'completed',
    shift: 'day',
    date: today,
    notes: ''
  },
  {
    id: 2,
    description: 'Troca de rolamentos bomba B-103',
    sector: 'Mecânica',
    technician: 'Pedro Alves',
    priority: 'medium',
    estimatedTime: 90,
    status: 'in_progress',
    shift: 'day',
    date: today,
    notes: ''
  },
  {
    id: 3,
    description: 'Calibração de instrumentos linha 3',
    sector: 'Instrumentação',
    technician: 'Fernanda Reis',
    priority: 'high',
    estimatedTime: 180,
    status: 'pending',
    shift: 'day',
    date: today,
    notes: ''
  },
  {
    id: 4,
    description: 'Limpeza filtros sistema de ar comprimido',
    sector: 'Utilidades',
    technician: 'Ana Ferreira',
    priority: 'low',
    estimatedTime: 60,
    status: 'completed',
    shift: 'day',
    date: today,
    notes: ''
  },
  {
    id: 5,
    description: 'Ajuste sensores de temperatura',
    sector: 'Elétrica',
    technician: 'João Silva',
    priority: 'medium',
    estimatedTime: 45,
    status: 'in_progress',
    shift: 'day',
    date: today,
    notes: ''
  },
  {
    id: 6,
    description: 'Lubrificação redutores linha 1',
    sector: 'Mecânica',
    technician: 'Pedro Alves',
    priority: 'low',
    estimatedTime: 75,
    status: 'pending',
    shift: 'day',
    date: today,
    notes: ''
  },
  // Turno Noite - Hoje
  {
    id: 7,
    description: 'Inspeção painéis elétricos subestação',
    sector: 'Elétrica',
    technician: 'Carlos Souza',
    priority: 'high',
    estimatedTime: 150,
    status: 'in_progress',
    shift: 'night',
    date: today,
    notes: ''
  },
  {
    id: 8,
    description: 'Reparo válvula de segurança V-205',
    sector: 'Mecânica',
    technician: 'Lucas Lima',
    priority: 'high',
    estimatedTime: 120,
    status: 'pending',
    shift: 'night',
    date: today,
    notes: ''
  },
  {
    id: 9,
    description: 'Verificação pressão caldeiras',
    sector: 'Utilidades',
    technician: 'Marcos Costa',
    priority: 'medium',
    estimatedTime: 90,
    status: 'completed',
    shift: 'night',
    date: today,
    notes: ''
  },
  {
    id: 10,
    description: 'Configuração controladores CLP',
    sector: 'Instrumentação',
    technician: 'Roberto Neto',
    priority: 'medium',
    estimatedTime: 120,
    status: 'in_progress',
    shift: 'night',
    date: today,
    notes: ''
  },
  {
    id: 11,
    description: 'Manutenção compressor C-05',
    sector: 'Utilidades',
    technician: 'Marcos Costa',
    priority: 'low',
    estimatedTime: 60,
    status: 'pending',
    shift: 'night',
    date: today,
    notes: ''
  },
  {
    id: 12,
    description: 'Troca lâmpadas setor empacotamento',
    sector: 'Elétrica',
    technician: 'Carlos Souza',
    priority: 'low',
    estimatedTime: 30,
    status: 'completed',
    shift: 'night',
    date: today,
    notes: ''
  }
]
