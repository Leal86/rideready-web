import ActivityCard from './ActivityCard'
import EmptyState from './EmptyState'

function ActivityList({
  activities,
  hasActiveFilters,
  onEdit,
  onDelete,
  isPastPlannedActivity,
  onComplete,
  onCancelPast,
  weatherByActivity,
  weatherLoadingByActivity,
  weatherErrorByActivity,
  onRefreshWeather,
}) {
  if (activities.length === 0) {
    if (hasActiveFilters) {
      return (
        <section className="empty-state">
          <div className="empty-state__icon">?</div>

          <div>
            <h3>Nenhuma atividade encontrada</h3>
            <p>
              Nenhuma atividade corresponde aos filtros selecionados.
              Altere a pesquisa ou os filtros para ver outros resultados.
            </p>
          </div>
        </section>
      )
    }

    return <EmptyState />
  }

  return (
    <section className="activity-list">
      <h2>Atividades planeadas</h2>

      <div className="activity-list-grid">
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onEdit={onEdit}
            onDelete={onDelete}
            isPastPlannedActivity={isPastPlannedActivity}
            onComplete={onComplete}
            onCancelPast={onCancelPast}
            weather={weatherByActivity[activity.id]}
            isWeatherLoading={weatherLoadingByActivity[activity.id] ?? false}
            weatherError={weatherErrorByActivity[activity.id] ?? ''}
            onRefreshWeather={onRefreshWeather}
          />
        ))}
      </div>
    </section>
  )
}

export default ActivityList