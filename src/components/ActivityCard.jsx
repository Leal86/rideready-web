function ActivityCard({ activity }) {
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

      <div>
        <button type="button">
          Editar
        </button>

        <button type="button">
          Eliminar
        </button>
      </div>
    </article>
  )
}

export default ActivityCard