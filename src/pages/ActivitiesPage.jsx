import { useEffect, useState } from 'react'

import ActivityForm from '../components/ActivityForm'
import ActivityList from '../components/ActivityList'
import Header from '../components/Header'
import api from '../services/api'

function ActivitiesPage() {
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadActivities() {
      try {
        const response = await api.get('/activities')

        setActivities(response.data)
      } catch {
        setError(
          'Não foi possível carregar as atividades. Verifique se a API está disponível.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadActivities()
  }, [])

  async function handleCreateActivity(payload) {
    try {
      setIsSubmitting(true)
      setError('')

      const response = await api.post('/activities', payload)

      setActivities((current) => [...current, response.data])

      return true
    } catch {
      setError(
        'Não foi possível criar a atividade. Verifique os dados e tente novamente.',
      )

      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header />

      <main className="app">
        <div className="app-content">
          <section>
            <h1>As minhas atividades</h1>
            <p>
              Planeie atividades ao ar livre e consulte as condições
              meteorológicas para o local escolhido.
            </p>
          </section>

          <ActivityForm
            onCreate={handleCreateActivity}
            isSubmitting={isSubmitting}
          />

          {isLoading && (
            <section className="feedback-message">
              <p>A carregar atividades...</p>
            </section>
          )}

          {error && (
            <section className="feedback-message feedback-message--error">
              <p>{error}</p>
            </section>
          )}

          {!isLoading && !error && (
            <ActivityList activities={activities} />
          )}
        </div>
      </main>
    </>
  )
}

export default ActivitiesPage