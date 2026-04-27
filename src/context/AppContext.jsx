import { createContext, useContext, useReducer, useEffect, useState } from 'react'
import { initialSectors, initialTechnicians, initialActivities } from '../data/initialData'

const AppContext = createContext()

const STORAGE_KEY = 'maintenance-system-data'

const API_BASE = '/api'

// Load from localStorage or use defaults
const loadFromStorage = () => {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Error loading from localStorage:', e)
  }
  return null
}

const savedData = loadFromStorage()

const initialState = {
  sectors: savedData?.sectors || initialSectors,
  technicians: savedData?.technicians || initialTechnicians,
  activities: savedData?.activities || initialActivities,
  currentUser: savedData?.currentUser || null
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_DATA':
      return { ...state, ...action.payload }
    
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
  const [loading, setLoading] = useState(true)

  // Fetch data from API on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sectorsRes, techniciansRes, activitiesRes] = await Promise.all([
          fetch(`${API_BASE}/sectors`),
          fetch(`${API_BASE}/technicians`),
          fetch(`${API_BASE}/activities`)
        ])

        const sectors = await sectorsRes.json()
        const technicians = await techniciansRes.json()
        const activities = await activitiesRes.json()

        dispatch({ type: 'SET_DATA', payload: { sectors, technicians, activities } })
      } catch (error) {
        console.error('Error fetching data from API:', error)
        // Fall back to localStorage if API fails
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          sectors: state.sectors,
          technicians: state.technicians,
          activities: state.activities,
          currentUser: state.currentUser
        }))
      } catch (e) {
        console.error('Error saving to localStorage:', e)
      }
    }
  }, [state])

  const addSector = async (sector) => {
    try {
      await fetch(`${API_BASE}/sectors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: sector })
      })
      dispatch({ type: 'ADD_SECTOR', payload: sector })
    } catch (error) {
      console.error('Error adding sector:', error)
      dispatch({ type: 'ADD_SECTOR', payload: sector })
    }
  }

  const removeSector = async (sector) => {
    try {
      await fetch(`${API_BASE}/sectors`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: sector })
      })
      dispatch({ type: 'REMOVE_SECTOR', payload: sector })
    } catch (error) {
      console.error('Error removing sector:', error)
      dispatch({ type: 'REMOVE_SECTOR', payload: sector })
    }
  }

  const addTechnician = async (technician) => {
    try {
      const res = await fetch(`${API_BASE}/technicians`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(technician)
      })
      const result = await res.json()
      dispatch({ type: 'ADD_TECHNICIAN', payload: result })
    } catch (error) {
      console.error('Error adding technician:', error)
      dispatch({ type: 'ADD_TECHNICIAN', payload: technician })
    }
  }

  const removeTechnician = async (id) => {
    try {
      await fetch(`${API_BASE}/technicians`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      dispatch({ type: 'REMOVE_TECHNICIAN', payload: id })
    } catch (error) {
      console.error('Error removing technician:', error)
      dispatch({ type: 'REMOVE_TECHNICIAN', payload: id })
    }
  }

  const addActivity = async (activity) => {
    try {
      const res = await fetch(`${API_BASE}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: activity.description,
          sector: activity.sector,
          technician: activity.technician,
          priority: activity.priority,
          status: activity.status,
          date: activity.date,
          shift: activity.shift,
          estimatedTime: activity.estimatedTime,
          isExtra: activity.isExtra || false,
          notes: activity.notes || ''
        })
      })
      const result = await res.json()
      dispatch({ type: 'ADD_ACTIVITY', payload: result })
    } catch (error) {
      console.error('Error adding activity:', error)
      dispatch({ type: 'ADD_ACTIVITY', payload: activity })
    }
  }

  const removeActivity = async (id) => {
    try {
      await fetch(`${API_BASE}/activities`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      dispatch({ type: 'REMOVE_ACTIVITY', payload: id })
    } catch (error) {
      console.error('Error removing activity:', error)
      dispatch({ type: 'REMOVE_ACTIVITY', payload: id })
    }
  }

  const updateActivityStatus = async (id, status, notes) => {
    try {
      await fetch(`${API_BASE}/activities`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, notes })
      })
      dispatch({ type: 'UPDATE_ACTIVITY_STATUS', payload: { id, status, notes } })
    } catch (error) {
      console.error('Error updating activity:', error)
      dispatch({ type: 'UPDATE_ACTIVITY_STATUS', payload: { id, status, notes } })
    }
  }

  const value = {
    ...state,
    loading,
    addSector,
    removeSector,
    addTechnician,
    removeTechnician,
    addActivity,
    removeActivity,
    updateActivityStatus,
    login: (user) => dispatch({ type: 'LOGIN', payload: user }),
    logout: () => dispatch({ type: 'LOGOUT' }),
    resetData: () => {
      localStorage.removeItem(STORAGE_KEY)
      window.location.reload()
    }
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
