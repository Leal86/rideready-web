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
  const [editingActivity, setEditingActivity] = useState(null)
  const [formDataToEdit, setFormDataToEdit] = useState(null)

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

  async function handleUpdateActivity(activityId, payload) {
    try {
      setIsSubmitting(true)
      setError('')

      const response = await api.patch(
        `/activities/${activityId}`,
        payload,
      )

      setActivities((current) =>
        current.map((activity) =>
          activity.id === activityId ? response.data : activity,
        ),
      )

      setEditingActivity(null)
      setFormDataToEdit(null)

      return true
    } catch {
      setError(
        'Não foi possível atualizar a atividade. Verifique os dados e tente novamente.',
      )

      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteActivity(activity) {
    const confirmed = window.confirm(
      `Tem a certeza de que pretende eliminar "${activity.title}"?`,
    )

    if (!confirmed) {
      return
    }

    try {
      setError('')

      await api.delete(`/activities/${activity.id}`)

      setActivities((current) =>
        current.filter((item) => item.id !== activity.id),
      )
    } catch {
      setError(
        'Não foi possível eliminar a atividade. Tente novamente.',
      )
    }
  }

  function handleEditActivity(activity) {
    setEditingActivity(activity)

    setFormDataToEdit({
      title: activity.title,
      activity_type: activity.activity_type,
      location_name: activity.location_name,
      scheduled_date: activity.scheduled_date,
      scheduled_time: activity.scheduled_time.slice(0, 5),
      notes: activity.notes ?? '',
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function handleCancelEdit() {
    setEditingActivity(null)
    setFormDataToEdit(null)
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
            key={editingActivity?.id ?? 'new'}
            onCreate={handleCreateActivity}
            onUpdate={handleUpdateActivity}
            isSubmitting={isSubmitting}
            editingActivity={editingActivity}
            formDataToEdit={formDataToEdit}
            onCancelEdit={handleCancelEdit}
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
            <ActivityList
              activities={activities}
              onEdit={handleEditActivity}
              onDelete={handleDeleteActivity}
            />
          )}
        </div>
      </main>
    </>
  )
}

export default ActivitiesPage