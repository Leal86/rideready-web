function ActivityCard({
  activity,
  onEdit,
  onDelete,
  isPastPlannedActivity,
  onComplete,
  onCancelPast,
}) {
  const needsConfirmation = isPastPlannedActivity(activity)

  return (
    <article className="activity-card">
      <div>
        <span>{activity.activity_type}</span>
        <h3>{activity.title}</h3>
      </div>

      <p>{activity.location_name}</p>

      <p>
        {activity.scheduled_date} às {activity.scheduled_time}
      </p>

      {activity.notes && <p>{activity.notes}</p>}

      <p>Estado: {activity.status}</p>

      {needsConfirmation && (
        <div className="activity-card-confirmation">
          <p>Esta atividade já passou. Realizou esta atividade?</p>

          <div>
            <button
              type="button"
              onClick={() => onComplete(activity)}
            >
              Sim, concluí
            </button>

            <button
              type="button"
              onClick={() => onCancelPast(activity)}
            >
              Não realizei
            </button>
          </div>
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={() => onEdit(activity)}
        >
          Editar
        </button>

        <button
          type="button"
          onClick={() => onDelete(activity)}
        >
          Eliminar
        </button>
      </div>
    </article>
  )
}

export default ActivityCard