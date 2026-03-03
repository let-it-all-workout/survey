import { useState, useEffect } from 'react'
import SurveyForm from './components/SurveyForm'
import AdminPanel from './components/AdminPanel'
import './App.css'

function App() {
  const [view, setView] = useState('survey')

  useEffect(() => {
    // Check URL hash for admin access
    const hash = window.location.hash
    if (hash === '#admin') {
      setView('admin')
    } else {
      setView('survey')
    }

    // Listen for hash changes
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setView('admin')
      } else {
        setView('survey')
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleBackToSurvey = () => {
    window.location.hash = ''
    setView('survey')
  }

  return (
    <div className="app">
      {view === 'admin' ? (
        <AdminPanel onBack={handleBackToSurvey} />
      ) : (
        <SurveyForm />
      )}
    </div>
  )
}

export default App
