import { createContext, useContext, useReducer } from 'react'
import { initialSectors, initialTechnicians, initialActivities } from '../data/initialData'

const AppContext = createContext()

const initialState = {
  sectors: initialSectors,
  technicians: initialTechnicians,
  activities: initialActivities,
  currentUser: null
}

function appReducer(state, action) {
  switch (action.type) {
    case 'ADD_SECTOR':
      if (state.sectors.includes(action.payload)) return state
      return { ...state, sectors: [...state.sectors, action.payload] }
    
    case 'REMOVE_SECTOR':
      return { 
        ...state, 
        sectors: state.sectors.filter(s => s !== action.payload),
        technicians: state.technicians.filter(t => t.sector !== action.payload)
      }
    
    case 'ADD_TECHNICIAN':
      return { 
        ...state, 
        technicians: [...state.technicians, { ...action.payload, id: Date.now() }] 
      }
    
    case 'REMOVE_TECHNICIAN':
      return { 
        ...state, 
        technicians: state.technicians.filter(t => t.id !== action.payload) 
      }
    
    case 'ADD_ACTIVITY':
      // Usa o ID fornecido ou gera um novo se não existir
      const activityId = action.payload.id || Date.now()
      return { 
        ...state, 
        activities: [...state.activities, { ...action.payload, id: activityId }] 
      }
    
    case 'REMOVE_ACTIVITY':
      return { 
        ...state, 
        activities: state.activities.filter(a => a.id !== action.payload) 
      }
    
    case 'UPDATE_ACTIVITY_STATUS':
      return {
        ...state,
        activities: state.activities.map(a => 
          a.id === action.payload.id 
            ? { ...a, status: action.payload.status, notes: action.payload.notes || a.notes }
            : a
        )
      }
    
    case 'LOGIN':
      return { ...state, currentUser: action.payload }
    
    case 'LOGOUT':
      return { ...state, currentUser: null }
    
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const value = {
    ...state,
    addSector: (sector) => dispatch({ type: 'ADD_SECTOR', payload: sector }),
    removeSector: (sector) => dispatch({ type: 'REMOVE_SECTOR', payload: sector }),
    addTechnician: (technician) => dispatch({ type: 'ADD_TECHNICIAN', payload: technician }),
    removeTechnician: (id) => dispatch({ type: 'REMOVE_TECHNICIAN', payload: id }),
    addActivity: (activity) => dispatch({ type: 'ADD_ACTIVITY', payload: activity }),
    removeActivity: (id) => dispatch({ type: 'REMOVE_ACTIVITY', payload: id }),
    updateActivityStatus: (id, status, notes) => dispatch({ 
      type: 'UPDATE_ACTIVITY_STATUS', 
      payload: { id, status, notes } 
    }),
    login: (user) => dispatch({ type: 'LOGIN', payload: user }),
    logout: () => dispatch({ type: 'LOGOUT' })
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
