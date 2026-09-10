import ActivityCard from './ActivityCard'
import EmptyState from './EmptyState'

function ActivityList({
  activities,
  hasActiveFilters,
  isBulkSelectionMode,
  selectedActivityIds,
  onStartBulkSelection,
  onToggleActivitySelection,
  onCancelBulkSelection,
  onDeleteSelectedActivities,
  isBulkDeleting,
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
      <div className="activity-list__header">
        <h2>Atividades planeadas</h2>

        {!isBulkSelectionMode ? (
          <button
            type="button"
            className="activity-list__selection-button"
            onClick={onStartBulkSelection}
          >
            Selecionar atividades
          </button>
        ) : (
          <div className="activity-list__bulk-actions">
            <span>
              {selectedActivityIds.length} selecionada(s)
            </span>

            <button
              type="button"
              className="activity-list__bulk-delete"
              onClick={onDeleteSelectedActivities}
              disabled={
                selectedActivityIds.length === 0 ||
                isBulkDeleting
              }
            >
              {isBulkDeleting
                ? 'A eliminar...'
                : 'Eliminar selecionadas'}
            </button>

            <button
              type="button"
              className="activity-list__bulk-cancel"
              onClick={onCancelBulkSelection}
              disabled={isBulkDeleting}
            >
              Cancelar seleção
            </button>
          </div>
        )}
      </div>

      <div className="activity-list-grid">
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            isBulkSelectionMode={isBulkSelectionMode}
            isSelected={selectedActivityIds.includes(activity.id)}
            onToggleSelection={onToggleActivitySelection}
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