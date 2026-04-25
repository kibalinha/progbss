import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()
const API_URL = '/api' // Vercel serverless functions

export function AppProvider({ children }) {
  const [sectors, setSectors] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [activities, setActivities] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load data on mount
  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      // Initialize DB first
      await fetch(`${API_URL}/init-db`)
      
      const [sectorsRes, techsRes, actsRes] = await Promise.all([
        fetch(`${API_URL}/sectors`),
        fetch(`${API_URL}/technicians`),
        fetch(`${API_URL}/activities`)
      ])

      if (!sectorsRes.ok || !techsRes.ok || !actsRes.ok) {
        throw new Error('Failed to load data')
      }

      const [sectorsData, techsData, actsData] = await Promise.all([
        sectorsRes.json(),
        techsRes.json(),
        actsRes.json()
      ])

      setSectors(sectorsData)
      setTechnicians(techsData)
      setActivities(actsData)
    } catch (err) {
      setError(err.message)
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  // SECTORS
  const addSector = async (sector) => {
    try {
      const res = await fetch(`${API_URL}/sectors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: sector })
      })
      if (res.ok) {
        setSectors([...sectors, sector])
      }
    } catch (err) {
      console.error('Error adding sector:', err)
    }
  }

  const removeSector = async (sector) => {
    try {
      const res = await fetch(`${API_URL}/sectors?name=${encodeURIComponent(sector)}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setSectors(sectors.filter(s => s !== sector))
      }
    } catch (err) {
      console.error('Error removing sector:', err)
    }
  }

  // TECHNICIANS
  const addTechnician = async (technician) => {
    try {
      const res = await fetch(`${API_URL}/technicians`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(technician)
      })
      if (res.ok) {
        const newTech = await res.json()
        setTechnicians([...technicians, newTech])
      }
    } catch (err) {
      console.error('Error adding technician:', err)
    }
  }

  const removeTechnician = async (id) => {
    try {
      const res = await fetch(`${API_URL}/technicians?id=${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setTechnicians(technicians.filter(t => t.id !== id))
      }
    } catch (err) {
      console.error('Error removing technician:', err)
    }
  }

  // ACTIVITIES
  const addActivity = async (activity) => {
    try {
      const res = await fetch(`${API_URL}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activity)
      })
      if (res.ok) {
        const newActivity = await res.json()
        setActivities([newActivity, ...activities])
      }
    } catch (err) {
      console.error('Error adding activity:', err)
    }
  }

  const removeActivity = async (id) => {
    try {
      const res = await fetch(`${API_URL}/activities?id=${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setActivities(activities.filter(a => a.id !== id))
      }
    } catch (err) {
      console.error('Error removing activity:', err)
    }
  }

  const updateActivityStatus = async (id, status, notes) => {
    try {
      const res = await fetch(`${API_URL}/activities?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      })
      if (res.ok) {
        setActivities(activities.map(a => 
          a.id === id ? { ...a, status, notes: notes || a.notes } : a
        ))
      }
    } catch (err) {
      console.error('Error updating activity:', err)
    }
  }

  const login = (user) => setCurrentUser(user)
  const logout = () => setCurrentUser(null)

  const value = {
    sectors,
    technicians,
    activities,
    currentUser,
    loading,
    error,
    addSector,
    removeSector,
    addTechnician,
    removeTechnician,
    addActivity,
    removeActivity,
    updateActivityStatus,
    login,
    logout,
    refreshData: loadAllData
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
