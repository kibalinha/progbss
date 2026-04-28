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
  models: [],
  currentUser: savedData?.currentUser || null
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_DATA':
      console.log('[SET_DATA] Received payload:', {
        sectors: action.payload.sectors?.length,
        technicians: action.payload.technicians?.length,
        activities: action.payload.activities?.length,
        models: action.payload.models?.length
      })
      console.log('[SET_DATA] Current state:', {
        sectors: state.sectors.length,
        technicians: state.technicians.length,
        activities: state.activities.length,
        models: state.models?.length || 0
      })
      return {
        ...state,
        sectors: action.payload.sectors || state.sectors,
        technicians: action.payload.technicians || state.technicians,
        activities: action.payload.activities || state.activities,
        models: action.payload.models || state.models
      }
    
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
      const newActivity = { ...action.payload, id: activityId }
      console.log('[ADD_ACTIVITY] Before:', state.activities.length, 'activities')
      console.log('[ADD_ACTIVITY] Adding:', newActivity)
      const newState = {
        ...state,
        activities: [...state.activities, newActivity]
      }
      console.log('[ADD_ACTIVITY] After:', newState.activities.length, 'activities')
      return newState
    
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

    case 'UPDATE_ACTIVITY_ID':
      return {
        ...state,
        activities: state.activities.map(a =>
          a.id === action.payload.oldId
            ? { ...a, id: action.payload.newId }
            : a
        )
      }

    case 'SET_MODELS':
      return {
        ...state,
        models: action.payload
      }

    case 'ADD_MODEL':
      return {
        ...state,
        models: [...state.models, action.payload]
      }

    case 'UPDATE_MODEL':
      return {
        ...state,
        models: state.models.map(m =>
          m.id === action.payload.id ? action.payload : m
        )
      }

    case 'REMOVE_MODEL':
      return {
        ...state,
        models: state.models.filter(m => m.id !== action.payload)
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

  // Fetch data from API on mount, fallback to localStorage
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sectorsRes, techniciansRes, activitiesRes, modelsRes] = await Promise.all([
          fetch(`${API_BASE}/sectors`),
          fetch(`${API_BASE}/technicians`),
          fetch(`${API_BASE}/activities`),
          fetch(`${API_BASE}/models`)
        ])

        const sectors = await sectorsRes.json()
        const technicians = await techniciansRes.json()
        const activities = await activitiesRes.json()
        const models = await modelsRes.json()

        console.log('[fetchData] Fetched from API:', {
          sectors: sectors.length,
          technicians: technicians.length,
          activities: activities.length,
          models: models.length
        })
        console.log('[fetchData] Activities:', activities.map(a => ({ id: a.id, sector: a.sector, date: a.date })))

        dispatch({ type: 'SET_DATA', payload: { sectors, technicians, activities, models } })
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
    // Adiciona ao state IMEDIATAMENTE
    console.log('[addActivity] Adding activity:', activity)
    console.log('[addActivity] Current activities count:', state.activities.length)
    dispatch({ type: 'ADD_ACTIVITY', payload: activity })

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

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      // Atualiza o ID da atividade com o ID real do banco
      const result = await res.json()
      if (result.id) {
        dispatch({
          type: 'UPDATE_ACTIVITY_ID',
          payload: { oldId: activity.id, newId: result.id }
        })
      }
    } catch (error) {
      console.error('Error adding activity to database:', error)
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

  // Funções para Modelos
  const addModel = async (model) => {
    try {
      const res = await fetch(`${API_BASE}/models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: model.name,
          description: model.description,
          sector: model.sector,
          shift: model.shift,
          priority: model.priority,
          estimatedTime: parseInt(model.estimatedTime) || 0,
          notes: model.notes || ''
        })
      })
      const result = await res.json()
      dispatch({ type: 'ADD_MODEL', payload: result })
    } catch (error) {
      console.error('Error adding model:', error)
    }
  }

  const updateModel = async (model) => {
    try {
      const res = await fetch(`${API_BASE}/models`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: model.id,
          name: model.name,
          description: model.description,
          sector: model.sector,
          shift: model.shift,
          priority: model.priority,
          estimatedTime: parseInt(model.estimatedTime) || 0,
          notes: model.notes || ''
        })
      })
      const result = await res.json()
      dispatch({ type: 'UPDATE_MODEL', payload: result })
    } catch (error) {
      console.error('Error updating model:', error)
    }
  }

  const removeModel = async (id) => {
    try {
      await fetch(`${API_BASE}/models`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      dispatch({ type: 'REMOVE_MODEL', payload: id })
    } catch (error) {
      console.error('Error removing model:', error)
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
    addModel,
    updateModel,
    removeModel,
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
