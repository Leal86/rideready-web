import { useEffect, useState } from 'react'

import ActivityForm from '../components/ActivityForm'
import ActivityList from '../components/ActivityList'
import api from '../services/api'
import ActivityFilters from '../components/ActivityFilters'


function buildWeatherSnapshot(activity) {
  if (!activity.weather_checked_at) {
    return null
  }

  return {
    available: true,
    checked_at: activity.weather_checked_at,
    temperature: activity.weather_temperature,
    apparent_temperature: activity.weather_apparent_temperature,
    precipitation_probability:
      activity.weather_precipitation_probability,
    precipitation: activity.weather_precipitation,
    weather_code: activity.weather_code,
    wind_speed: activity.weather_wind_speed,
    wind_gusts: activity.weather_wind_gusts,
    assessment: activity.weather_assessment_level
      ? {
        level: activity.weather_assessment_level,
        reasons: activity.weather_assessment_reasons ?? [],
      }
      : null,
  }
}


function ActivitiesPage() {
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [editingActivity, setEditingActivity] = useState(null)
  const [formDataToEdit, setFormDataToEdit] = useState(null)
  const [weatherByActivity, setWeatherByActivity] = useState({})
  const [weatherLoadingByActivity, setWeatherLoadingByActivity] = useState({})
  const [weatherErrorByActivity, setWeatherErrorByActivity] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [dateFilter, setDateFilter] = useState('ALL')
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [selectedActivityIds, setSelectedActivityIds] = useState([])
  const [isBulkSelectionMode, setIsBulkSelectionMode] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  useEffect(() => {
    async function loadActivities() {
      try {
        const response = await api.get('/activities')

        setActivities(response.data)

        const persistedWeather = {}

        response.data.forEach((activity) => {
          const snapshot = buildWeatherSnapshot(activity)

          if (snapshot) {
            persistedWeather[activity.id] = snapshot
          }
        })

        setWeatherByActivity(persistedWeather)
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

  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 500)
    }

    window.addEventListener('scroll', handleScroll)

    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  async function loadWeatherForActivity(activityId) {
    try {
      setWeatherLoadingByActivity((current) => ({
        ...current,
        [activityId]: true,
      }))

      setWeatherErrorByActivity((current) => ({
        ...current,
        [activityId]: '',
      }))

      const response = await api.get(
        `/activities/${activityId}/weather`,
      )

      setWeatherByActivity((current) => ({
        ...current,
        [activityId]: response.data,
      }))
    } catch {
      setWeatherErrorByActivity((current) => ({
        ...current,
        [activityId]:
          'Não foi possível consultar as condições meteorológicas.',
      }))
    } finally {
      setWeatherLoadingByActivity((current) => ({
        ...current,
        [activityId]: false,
      }))
    }
  }

  async function handleCreateActivity(payload) {
    try {
      setIsSubmitting(true)
      setError('')
      setSuccessMessage('')

      const response = await api.post('/activities', payload)

      setActivities((current) => [response.data, ...current])

      setSuccessMessage(
        `A atividade "${response.data.title}" foi criada com sucesso.`,
      )

      await loadWeatherForActivity(response.data.id)

      return true
    }

    catch (requestError) {
      if (
        requestError.response?.status === 409 &&
        requestError.response?.data?.detail
      ) {
        const conflict = requestError.response.data.detail

        const confirmed = window.confirm(
          `${conflict.message}\n\n` +
          `Atividade existente: "${conflict.conflicting_activity_title}".\n\n` +
          'Pretende guardar esta atividade mesmo assim?',
        )

        if (!confirmed) {
          return false
        }

        try {
          const response = await api.post(
            '/activities?allow_conflict=true',
            payload,
          )

          setActivities((current) => [response.data, ...current])

          setSuccessMessage(
            `A atividade "${response.data.title}" foi criada com sucesso.`,
          )

          await loadWeatherForActivity(response.data.id)

          return true

        } catch {
          setError(
            'Não foi possível criar a atividade após a confirmação.',
          )

          return false
        }
      }

      const detail = requestError.response?.data?.detail

      if (typeof detail === 'string') {
        setError(detail)
        return false
      }

      if (detail?.message) {
        setError(detail.message)
        return false
      }

      if (Array.isArray(detail)) {
        const messages = detail.map((item) => {
          const field = item.loc?.at(-1)

          return field
            ? `${field}: ${item.msg}`
            : item.msg
        })

        setError(messages.join(' '))
        return false
      }

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

      if (response.data.status === 'PLANNED') {
        await loadWeatherForActivity(activityId)
      }

      if (response.data.status === 'CANCELLED') {
        setWeatherByActivity((current) => {
          const updated = { ...current }
          delete updated[activityId]

          return updated
        })

        setWeatherErrorByActivity((current) => {
          const updated = { ...current }
          delete updated[activityId]

          return updated
        })
      }

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

  function handleStartBulkSelection() {
    setSelectedActivityIds([])
    setIsBulkSelectionMode(true)
  }

  function handleToggleActivitySelection(activityId) {
    setSelectedActivityIds((current) => {
      if (current.includes(activityId)) {
        return current.filter((id) => id !== activityId)
      }

      return [...current, activityId]
    })
  }

  function handleSelectAllVisibleActivities() {
    setSelectedActivityIds(
      filteredActivities.map((activity) => activity.id),
    )
  }

  function handleClearSelectedActivities() {
    setSelectedActivityIds([])
  }

  function handleCancelBulkSelection() {
    setSelectedActivityIds([])
    setIsBulkSelectionMode(false)
  }

  async function handleDeleteSelectedActivities() {
    if (selectedActivityIds.length === 0) {
      return
    }

    const confirmed = window.confirm(
      `Tem a certeza de que pretende eliminar ${selectedActivityIds.length} atividade(s) selecionada(s)?`,
    )

    if (!confirmed) {
      return
    }

    try {
      setError('')
      setSuccessMessage('')
      setIsBulkDeleting(true)

      const results = await Promise.allSettled(
        selectedActivityIds.map((activityId) =>
          api.delete(`/activities/${activityId}`),
        ),
      )

      const deletedIds = results
        .map((result, index) =>
          result.status === 'fulfilled'
            ? selectedActivityIds[index]
            : null,
        )
        .filter((activityId) => activityId !== null)

      const failedCount =
        selectedActivityIds.length - deletedIds.length

      if (deletedIds.length > 0) {
        setActivities((current) =>
          current.filter(
            (activity) => !deletedIds.includes(activity.id),
          ),
        )

        setSelectedActivityIds((current) =>
          current.filter(
            (activityId) => !deletedIds.includes(activityId),
          ),
        )
      }

      if (failedCount === 0) {
        setSuccessMessage(
          `${deletedIds.length} atividade(s) eliminada(s) com sucesso.`,
        )

        setIsBulkSelectionMode(false)
        setSelectedActivityIds([])
        return
      }

      if (deletedIds.length > 0) {
        setSuccessMessage(
          `${deletedIds.length} atividade(s) eliminada(s) com sucesso.`,
        )
      }

      setError(
        `Não foi possível eliminar ${failedCount} atividade(s). Tente novamente.`,
      )
    } finally {
      setIsBulkDeleting(false)
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
      setSuccessMessage('')

      await api.delete(`/activities/${activity.id}`)

      setActivities((current) =>
        current.filter((item) => item.id !== activity.id),
      )

      setSuccessMessage(
        `A atividade "${activity.title}" foi eliminada com sucesso.`,
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

  function isPastPlannedActivity(activity) {
    if (activity.status !== 'PLANNED') {
      return false
    }

    const scheduledDateTime = new Date(
      `${activity.scheduled_date}T${activity.scheduled_time}`,
    )

    return scheduledDateTime < new Date()
  }

  async function handleCompleteActivity(activity) {
    await handleUpdateActivity(activity.id, {
      status: 'COMPLETED',
    })
  }

  async function handleCancelPastActivity(activity) {
    setSuccessMessage('')

    const confirmed = window.confirm(
      `Tem a certeza de que pretende cancelar "${activity.title}"?`,
    )

    if (!confirmed) {
      return
    }

    const updated = await handleUpdateActivity(activity.id, {
      status: 'CANCELLED',
    })

    if (updated) {
      setSuccessMessage(
        `A atividade "${activity.title}" foi cancelada com sucesso.`,
      )
    }
  }

  const filteredActivities = activities.filter((activity) => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    const matchesSearch =
      normalizedSearch === '' ||
      activity.title.toLowerCase().includes(normalizedSearch) ||
      activity.location_name.toLowerCase().includes(normalizedSearch)

    const matchesStatus =
      statusFilter === 'ALL' ||
      activity.status === statusFilter

    const matchesType =
      typeFilter === 'ALL' ||
      activity.activity_type === typeFilter

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const activityDate = new Date(
      `${activity.scheduled_date}T00:00:00`,
    )

    let matchesDate = true

    if (dateFilter === 'TODAY') {
      matchesDate =
        activityDate.getTime() === today.getTime()
    }

    if (dateFilter === 'NEXT_7_DAYS') {
      const sevenDaysLater = new Date(today)

      sevenDaysLater.setDate(today.getDate() + 7)

      matchesDate =
        activityDate >= today &&
        activityDate <= sevenDaysLater
    }

    if (dateFilter === 'THIS_MONTH') {
      matchesDate =
        activityDate.getMonth() === today.getMonth() &&
        activityDate.getFullYear() === today.getFullYear()
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesType &&
      matchesDate
    )
  })

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    statusFilter !== 'ALL' ||
    typeFilter !== 'ALL' ||
    dateFilter !== 'ALL'

  function handleClearFilters() {
    setSearchTerm('')
    setStatusFilter('ALL')
    setTypeFilter('ALL')
    setDateFilter('ALL')
  }

  function handleScrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (

    <main className="app-content">

      {successMessage && (
        <div
          className="success-modal-overlay"
          role="presentation"
        >
          <div
            className="success-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-modal-title"
          >
            <div className="success-modal__icon" aria-hidden="true">
              ✓
            </div>

            <h2 id="success-modal-title">
              Operação concluída
            </h2>

            <p>{successMessage}</p>

            <button
              type="button"
              className="button button--primary"
              onClick={() => setSuccessMessage('')}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

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

      <ActivityFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
        resultCount={filteredActivities.length}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
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
          activities={filteredActivities}
          hasActiveFilters={hasActiveFilters}
          isBulkSelectionMode={isBulkSelectionMode}
          selectedActivityIds={selectedActivityIds}
          onStartBulkSelection={handleStartBulkSelection}
          onToggleActivitySelection={handleToggleActivitySelection}
          onCancelBulkSelection={handleCancelBulkSelection}
          onDeleteSelectedActivities={handleDeleteSelectedActivities}
          isBulkDeleting={isBulkDeleting}
          onSelectAllVisible={handleSelectAllVisibleActivities}
          onClearSelected={handleClearSelectedActivities}
          onEdit={handleEditActivity}
          onDelete={handleDeleteActivity}
          isPastPlannedActivity={isPastPlannedActivity}
          onComplete={handleCompleteActivity}
          onCancelPast={handleCancelPastActivity}
          weatherByActivity={weatherByActivity}
          weatherLoadingByActivity={weatherLoadingByActivity}
          weatherErrorByActivity={weatherErrorByActivity}
          onRefreshWeather={loadWeatherForActivity}
        />
      )}

      {showScrollTop && (
        <button
          type="button"
          className="scroll-top-button"
          onClick={handleScrollToTop}
          aria-label="Voltar ao topo da página"
          title="Voltar ao topo"
        >
          ↑
        </button>
      )}

    </main>
  )
}

export default ActivitiesPage