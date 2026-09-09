import { useEffect, useState } from 'react'

import api from '../services/api'

function DashboardPage() {
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadActivities() {
      try {
        const response = await api.get('/activities')
        setActivities(response.data)
      } catch {
        setError(
          'Não foi possível carregar o resumo das atividades.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadActivities()
  }, [])

  const totalActivities = activities.length

  const plannedActivities = activities.filter(
    (activity) => activity.status === 'PLANNED',
  ).length

  const completedActivities = activities.filter(
    (activity) => activity.status === 'COMPLETED',
  ).length

  const cancelledActivities = activities.filter(
    (activity) => activity.status === 'CANCELLED',
  ).length

  const nextActivity = activities
    .filter((activity) => {
      if (activity.status !== 'PLANNED') {
        return false
      }

      const scheduledDateTime = new Date(
        `${activity.scheduled_date}T${activity.scheduled_time}`,
      )

      return scheduledDateTime >= new Date()
    })
    .sort((activityA, activityB) => {
      const dateA = new Date(
        `${activityA.scheduled_date}T${activityA.scheduled_time}`,
      )

      const dateB = new Date(
        `${activityB.scheduled_date}T${activityB.scheduled_time}`,
      )

      return dateA - dateB
    })[0]

  return (
    <main className="app-content">
      <section className="dashboard-header">
        <span className="eyebrow">Resumo</span>
        <h1>Visão geral</h1>
        <p>
          Consulte rapidamente o estado das suas atividades e o próximo
          planeamento.
        </p>
      </section>

      {isLoading && (
        <section className="feedback-message">
          <p>A carregar resumo...</p>
        </section>
      )}

      {error && (
        <section className="feedback-message feedback-message--error">
          <p>{error}</p>
        </section>
      )}

      {!isLoading && !error && (
        <>
          <section className="dashboard-stats">
            <article className="dashboard-stat-card">
              <span>Total</span>
              <strong>{totalActivities}</strong>
              <p>Atividades registadas</p>
            </article>

            <article className="dashboard-stat-card dashboard-stat-card--planned">
              <span>Planeadas</span>
              <strong>{plannedActivities}</strong>
              <p>Atividades por realizar</p>
            </article>

            <article className="dashboard-stat-card dashboard-stat-card--completed">
              <span>Concluídas</span>
              <strong>{completedActivities}</strong>
              <p>Atividades realizadas</p>
            </article>

            <article className="dashboard-stat-card dashboard-stat-card--cancelled">
              <span>Canceladas</span>
              <strong>{cancelledActivities}</strong>
              <p>Atividades não realizadas</p>
            </article>
          </section>

          <section className="dashboard-next">
            <div>
              <span className="eyebrow">Próxima atividade</span>
              <h2>O que vem a seguir</h2>
            </div>

            {nextActivity ? (
              <article className="dashboard-next__card">
                <div>
                  <span>{nextActivity.activity_type}</span>
                  <h3>{nextActivity.title}</h3>
                </div>

                <p>{nextActivity.location_name}</p>

                <p>
                  {nextActivity.scheduled_date} às{' '}
                  {nextActivity.scheduled_time.slice(0, 5)}
                </p>
              </article>
            ) : (
              <div className="dashboard-next__empty">
                <p>
                  Não existem atividades planeadas para uma data futura.
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  )
}

export default DashboardPage