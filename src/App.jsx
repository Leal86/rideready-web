import { useState } from 'react'

import Header from './components/Header'
import ActivitiesPage from './pages/ActivitiesPage'
import DashboardPage from './pages/DashboardPage'
import './App.css'

function App() {
  const [activeSection, setActiveSection] = useState('activities')

  return (
    <div className="app">
      <Header
        activeSection={activeSection}
        onSectionChange={setActiveSection}
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
