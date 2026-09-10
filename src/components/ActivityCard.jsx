import { useState } from 'react'

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
  const isCompleted = activity.status === 'COMPLETED'
  const isPlanned = activity.status === 'PLANNED'
  const [showDetails, setShowDetails] = useState(false)
  const activityTypeLabels = {
    WALKING: 'Caminhada',
    RUNNING: 'Corrida',
    CYCLING: 'Ciclismo',
    HIKING: 'Trilho',
    OTHER: 'Outra',
  }
  const assessmentLabels = {
    FAVORABLE: 'Favorável',
    CAUTION: 'Atenção',
    UNFAVORABLE: 'Desfavorável',
  }

  function getWeatherIcon(weather) {
    if (!weather?.available) {
      return '—'
    }

    if (
      weather.wind_speed >= 30 ||
      weather.wind_gusts >= 40
    ) {
      return '💨'
    }

    const code = weather.weather_code

    if (code === 0) {
      return '☀️'
    }

    if ([1, 2].includes(code)) {
      return '🌤️'
    }

    if (code === 3) {
      return '☁️'
    }

    if ([45, 48].includes(code)) {
      return '🌫️'
    }

    if ([51, 53, 55, 56, 57].includes(code)) {
      return '🌦️'
    }

    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
      return '🌧️'
    }

    if ([71, 73, 75, 77, 85, 86].includes(code)) {
      return '❄️'
    }

    if ([95, 96, 99].includes(code)) {
      return '⛈️'
    }

    return '🌤️'
  }

  return (
    <article
      className={`activity-card activity-card--${activity.status.toLowerCase()}`}
    >
      <div className="activity-card__compact">
        <span className="activity-card__type">
          {activityTypeLabels[activity.activity_type]}
        </span>

        <h3>{activity.title}</h3>

        <div className="activity-card__information">
          <p>
            <strong>Local: 📍</strong>
            <span>{activity.location_name}</span>
          </p>

          <p>
            <strong>Data: 📅</strong>
            <span>
              {new Date(
                `${activity.scheduled_date}T00:00:00`,
              ).toLocaleDateString('pt-PT')}
            </span>
          </p>

          <p>
            <strong>Hora: 🕒</strong>
            <span>
              {activity.scheduled_time.slice(0, 5)}
            </span>
          </p>

          <p>
            <strong>Condições:</strong>

            <span>
              {isCancelled ? (
                'Não disponível'
              ) : weather?.available ? (
                <>
                  {getWeatherIcon(weather)}{' '}
                  {assessmentLabels[
                    weather.assessment?.level
                  ] ?? weather.assessment?.level}
                  {' · '}
                  {weather.temperature} °C
                </>
              ) : isWeatherLoading ? (
                'A consultar...'
              ) : weatherError ? (
                'Consulta indisponível'
              ) : weather && !weather.available ? (
                'Previsão ainda indisponível'
              ) : (
                'Ainda não consultadas'
              )}
            </span>
          </p>
        </div>

        <p className="activity-card__status activity-card__status--center">
          Estado:{' '}
          <strong>
            {activity.status === 'PLANNED' && 'Planeada'}
            {activity.status === 'COMPLETED' && 'Concluída'}
            {activity.status === 'CANCELLED' && 'Cancelada'}
          </strong>
        </p>

        <button
          type="button"
          className="activity-card__details-button"
          onClick={() =>
            setShowDetails((current) => !current)
          }
          aria-expanded={showDetails}
        >
          {showDetails ? 'Ocultar detalhes' : 'Ver detalhes'}
        </button>
      </div>

      {showDetails && (
        <div className="activity-card__details">
          {activity.notes && (
            <div className="activity-card__detail-section">
              <h4>Notas</h4>

              <div className="activity-card__notes-content">
                <p>{activity.notes}</p>
              </div>
            </div>
          )}

          <div className="activity-card__detail-section">
            <h4>Condições meteorológicas</h4>

            {isCancelled ? (
              <div className="activity-weather__cancelled">
                <p>Atividade cancelada.</p>

                <p>
                  As condições meteorológicas deixaram de ser
                  consultadas para esta atividade.
                </p>
              </div>
            ) : (
              <>
                {!isWeatherLoading &&
                  !weatherError &&
                  weather?.available && (
                    <div className="activity-card__weather-details">
                      <p>
                        <strong>Avaliação:</strong>{' '}
                        {assessmentLabels[
                          weather.assessment?.level
                        ] ?? weather.assessment?.level}
                      </p>

                      <p>
                        <strong>Temperatura:</strong>{' '}
                        {weather.temperature} °C
                      </p>

                      <p>
                        <strong>Sensação térmica:</strong>{' '}
                        {weather.apparent_temperature} °C
                      </p>

                      <p>
                        <strong>Probabilidade de precipitação:</strong>{' '}
                        {weather.precipitation_probability}%
                      </p>

                      <p>
                        <strong>Vento:</strong>{' '}
                        {weather.wind_speed} km/h
                      </p>

                      {weather.assessment?.reasons?.map(
                        (reason) => (
                          <p key={reason}>{reason}</p>
                        ),
                      )}

                      {weather.checked_at && (
                        <p>
                          <strong>Consultado em:</strong>{' '}
                          {new Date(
                            weather.checked_at,
                          ).toLocaleString('pt-PT')}
                        </p>
                      )}
                    </div>
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

                {!isCompleted && (
                  <button
                    type="button"
                    className="activity-action activity-action--weather"
                    onClick={() =>
                      onRefreshWeather(activity.id)
                    }
                    disabled={isWeatherLoading}
                  >
                    {isWeatherLoading
                      ? 'A atualizar...'
                      : 'Atualizar condições'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {needsConfirmation && (
        <div className="activity-card-confirmation">
          <p>
            A data desta atividade já chegou. Foi realizada?
          </p>

          <div>
            <button
              type="button"
              className="activity-action activity-action--success"
              onClick={() => onComplete(activity)}
            >
              Sim, concluí
            </button>

            <button
              type="button"
              className="activity-action activity-action--warning"
              onClick={() => onCancelPast(activity)}
            >
              Não realizei
            </button>
          </div>
        </div>
      )}

      <div className="activity-card__actions">
        {isPlanned && !needsConfirmation && (
          <button
            type="button"
            className="activity-action activity-action--warning"
            onClick={() => onCancelPast(activity)}
          >
            Cancelar
          </button>
        )}

        <button
          type="button"
          className="activity-action activity-action--edit"
          onClick={() => onEdit(activity)}
          disabled={isCancelled || isCompleted}
        >
          Editar
        </button>

        <button
          type="button"
          className="activity-action activity-action--danger"
          onClick={() => onDelete(activity)}
        >
          Eliminar
        </button>
      </div>
    </article>
  )
}

export default ActivityCard