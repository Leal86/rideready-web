import { useEffect, useState } from 'react'

import Header from './components/Header'
import ActivitiesPage from './pages/ActivitiesPage'
import DashboardPage from './pages/DashboardPage'
import './App.css'


function getSectionFromPath() {
  const path = window.location.pathname

  if (path === '/activities') {
    return 'activities'
  }

  if (path === '/calendar') {
    return 'calendar'
  }

  return 'dashboard'
}


function App() {
  const [activeSection, setActiveSection] = useState(getSectionFromPath)

  useEffect(() => {
    function handlePopState() {
      setActiveSection(getSectionFromPath())
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])


  function handleSectionChange(section) {
    const paths = {
      dashboard: '/',
      activities: '/activities',
      calendar: '/calendar',
    }

    const nextPath = paths[section]

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath)
    }

    setActiveSection(section)
  }

  return (
    <div className="app">
      <Header
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />

      {activeSection === 'activities' && <ActivitiesPage />}

      {activeSection === 'dashboard' && <DashboardPage />}

      {activeSection === 'calendar' && (
        <main className="app-content">
          <section>
            <h1>Calendário</h1>
            <p>
              Consulte as suas atividades organizadas por data.
            </p>
          </section>
        </main>
      )}
    </div>
  )
}

export default App
