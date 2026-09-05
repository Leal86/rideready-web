import ActivityCard from './ActivityCard'
import EmptyState from './EmptyState'

function ActivityList({ activities, onEdit, onDelete }) {
  if (activities.length === 0) {
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
          />
        ))}
      </div>
    </section>
  )
}

export default ActivityList