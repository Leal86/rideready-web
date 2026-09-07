function ActivityCard({
  activity,
  onEdit,
  onDelete,
  isPastPlannedActivity,
  onComplete,
  onCancelPast,
  weather,
  isWeatherLoading,
  weatherError,
  onRefreshWeather,
}) {
  const needsConfirmation = isPastPlannedActivity(activity)
  const isCancelled = activity.status === 'CANCELLED'

  return (
    <article
      className={`activity-card activity-card--${activity.status.toLowerCase()}`}
    >
      <div>
        <span>{activity.activity_type}</span>
        <h3>{activity.title}</h3>
      </div>

      <p>{activity.location_name}</p>

      <p>
        {activity.scheduled_date} às {activity.scheduled_time}
      </p>

      {activity.notes && <p>{activity.notes}</p>}

      <p className="activity-card__status">
        Estado:{' '}
        <strong>
          {activity.status === 'PLANNED' && 'Planeada'}
          {activity.status === 'COMPLETED' && 'Concluída'}
          {activity.status === 'CANCELLED' && 'Cancelada'}
        </strong>
      </p>

      <div className="activity-weather">
        <h4>Condições meteorológicas</h4>

        {isCancelled ? (
          <div className="activity-weather__cancelled">
            <p>Atividade cancelada.</p>
            <p>
              As condições meteorológicas deixaram de ser consultadas
              para esta atividade.
            </p>
          </div>
        ) : (
          <>

            {isWeatherLoading && (
              <p>A consultar condições...</p>
            )}

            {!isWeatherLoading && weatherError && (
              <p>{weatherError}</p>
            )}

            {!isWeatherLoading && !weatherError && weather?.available && (
              <>
                <p>
                  Avaliação: {weather.assessment?.level}
                </p>

                <p>
                  Temperatura: {weather.temperature} °C
                </p>

                <p>
                  Sensação térmica: {weather.apparent_temperature} °C
                </p>

                <p>
                  Probabilidade de precipitação:{' '}
                  {weather.precipitation_probability}%
                </p>

                <p>
                  Vento: {weather.wind_speed} km/h
                </p>

                {weather.assessment?.reasons?.map((reason) => (
                  <p key={reason}>{reason}</p>
                ))}

                {weather.checked_at && (
                  <p>
                    Consultado em:{' '}
                    {new Date(weather.checked_at).toLocaleString('pt-PT')}
                  </p>
                )}
              </>
            )}

            {!isWeatherLoading &&
              !weatherError &&
              weather &&
              !weather.available && (
                <>
                  <p>Previsão ainda indisponível.</p>

                  {weather.message && (
                    <p>{weather.message}</p>
                  )}
                </>
              )}

            <button
              type="button"
              onClick={() => onRefreshWeather(activity.id)}
              disabled={isWeatherLoading}
            >
              {isWeatherLoading
                ? 'A atualizar...'
                : 'Atualizar condições'}
            </button>
          </>
        )}
      </div>

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
          disabled={isCancelled}
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