import { useEffect, useState } from 'react'

import api from '../services/api'
import { getApiErrorMessage } from '../utils/apiError'
import { getWeatherIcon } from '../utils/weather'

const activityTypeLabels = {
  WALKING: 'Caminhada',
  RUNNING: 'Corrida',
  CYCLING: 'Ciclismo',
  HIKING: 'Trilho',
  OTHER: 'Outra',
}

const activityTypeImages = {
  WALKING: '/activity-images/walking.jpg',
  RUNNING: '/activity-images/running.jpg',
  CYCLING: '/activity-images/cycling.jpg',
  HIKING: '/activity-images/hiking.jpg',
  OTHER: '/activity-images/other.jpg',
}

function getWeatherDescription(weatherCode) {
  const descriptions = {
    0: 'Céu limpo',
    1: 'Predominantemente limpo',
    2: 'Parcialmente nublado',
    3: 'Nublado',
    45: 'Nevoeiro',
    48: 'Nevoeiro com geada',
    51: 'Chuvisco fraco',
    53: 'Chuvisco moderado',
    55: 'Chuvisco intenso',
    56: 'Chuvisco gelado fraco',
    57: 'Chuvisco gelado intenso',
    61: 'Chuva fraca',
    63: 'Chuva moderada',
    65: 'Chuva forte',
    66: 'Chuva gelada fraca',
    67: 'Chuva gelada forte',
    71: 'Neve fraca',
    73: 'Neve moderada',
    75: 'Neve forte',
    77: 'Grãos de neve',
    80: 'Aguaceiros fracos',
    81: 'Aguaceiros moderados',
    82: 'Aguaceiros fortes',
    85: 'Aguaceiros de neve fracos',
    86: 'Aguaceiros de neve fortes',
    95: 'Trovoada',
    96: 'Trovoada com granizo',
    99: 'Trovoada forte com granizo',
  }

  return descriptions[weatherCode] ?? 'Condições variáveis'
}

function DashboardPage() {
  const [currentPosition, setCurrentPosition] = useState(null)
  const [locationError, setLocationError] = useState(() =>
    navigator.geolocation
      ? ''
      : 'A geolocalização não é suportada neste navegador.',
  )
  const [currentWeather, setCurrentWeather] = useState(null)
  const [isWeatherLoading, setIsWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState('')
  const [currentLocation, setCurrentLocation] = useState(null)
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!navigator.geolocation) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setLocationError('')
      },
      () => {
        setLocationError(
          'Não foi possível obter a sua localização.',
        )
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      },
    )
  }, [])

  useEffect(() => {
    if (!currentPosition) {
      return
    }

    let isCancelled = false

    async function loadCurrentWeather() {
      setIsWeatherLoading(true)
      setWeatherError('')

      try {
        const response = await api.get('/weather/current', {
          params: {
            latitude: currentPosition.latitude,
            longitude: currentPosition.longitude,
          },
        })

        if (!isCancelled) {
          setCurrentWeather(response.data)
        }
      } catch (requestError) {
        if (!isCancelled) {
          setWeatherError(
            getApiErrorMessage(
              requestError,
              'Não foi possível obter as condições meteorológicas atuais.',
            ),
          )
        }
      } finally {
        if (!isCancelled) {
          setIsWeatherLoading(false)
        }
      }
    }

    loadCurrentWeather()

    return () => {
      isCancelled = true
    }
  }, [currentPosition])

  useEffect(() => {
    if (!currentPosition) return

    let isCancelled = false

    async function loadCurrentLocation() {

      try {
        const response = await api.get('/locations/reverse', {
          params: {
            latitude: currentPosition.latitude,
            longitude: currentPosition.longitude,
          },
        })

        if (!isCancelled) {
          setCurrentLocation(response.data)
        }
      } catch {
        if (!isCancelled) {
          setCurrentLocation(null)
        }
      }
    }

    loadCurrentLocation()

    return () => {
      isCancelled = true
    }
  }, [currentPosition])

  useEffect(() => {
    async function loadActivities() {
      try {
        const response = await api.get('/activities')
        setActivities(response.data)
      } catch {
        setError(
          'Não foi possível carregar o resumo das atividades.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadActivities()
  }, [])

  const totalActivities = activities.length

  const plannedActivities = activities.filter(
    (activity) => activity.status === 'PLANNED',
  ).length

  const completedActivities = activities.filter(
    (activity) => activity.status === 'COMPLETED',
  ).length

  const cancelledActivities = activities.filter(
    (activity) => activity.status === 'CANCELLED',
  ).length

  const upcomingActivities = activities
    .filter((activity) => {
      if (activity.status !== 'PLANNED') {
        return false
      }

      const scheduledDateTime = new Date(
        `${activity.scheduled_date}T${activity.scheduled_time}`,
      )

      return scheduledDateTime >= new Date()
    })
    .sort((activityA, activityB) => {
      const dateA = new Date(
        `${activityA.scheduled_date}T${activityA.scheduled_time}`,
      )

      const dateB = new Date(
        `${activityB.scheduled_date}T${activityB.scheduled_time}`,
      )

      return dateA - dateB
    })
    .slice(0, 2)

  function handleOpenActivities() {
    window.history.pushState({}, '', '/activities')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <main className="app-content">
      <section className="dashboard-header">
        <span className="eyebrow">Resumo</span>
        <h1>Visão geral</h1>
        <p>
          Consulte rapidamente o estado das suas atividades e o próximo
          planeamento.
        </p>
      </section>

      {isLoading && (
        <section className="feedback-message">
          <p>A carregar resumo...</p>
        </section>
      )}

      {error && (
        <section className="feedback-message feedback-message--error">
          <p>{error}</p>
        </section>
      )}

      {!isLoading && !error && (
        <>
          <section className="dashboard-stats">
            <article className="dashboard-stat-card">
              <span>Total</span>
              <strong>{totalActivities}</strong>
              <p>Atividades registadas</p>
            </article>

            <article className="dashboard-stat-card dashboard-stat-card--planned">
              <span>Planeadas</span>
              <strong>{plannedActivities}</strong>
              <p>Atividades por realizar</p>
            </article>

            <article className="dashboard-stat-card dashboard-stat-card--completed">
              <span>Concluídas</span>
              <strong>{completedActivities}</strong>
              <p>Atividades realizadas</p>
            </article>

            <article className="dashboard-stat-card dashboard-stat-card--cancelled">
              <span>Canceladas</span>
              <strong>{cancelledActivities}</strong>
              <p>Atividades não realizadas</p>
            </article>
          </section>

          <section className="dashboard-main-grid">
            <article className="dashboard-weather">
              <div className="dashboard-panel-header">
                <div>
                  <span className="eyebrow">
                    Tempo agora na sua localização
                  </span>

                  <p className="dashboard-weather__location">
                    <span aria-hidden="true">📍</span>
                    {currentLocation?.formatted || 'Localização atual'}
                  </p>

                </div>

              </div>

              {currentWeather?.observed_at && (
                <p className="dashboard-weather__source">
                  Dados meteorológicos das{' '}
                  {currentWeather.observed_at.slice(11, 16)}, fornecidos pela{' '}
                  <a
                    href="https://open-meteo.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open-Meteo
                  </a>.
                </p>
              )}

              <div className="dashboard-weather__content">
                {locationError && (
                  <p className="dashboard-weather__message">
                    {locationError}
                  </p>
                )}

                {isWeatherLoading && (
                  <p className="dashboard-weather__message">
                    A carregar condições meteorológicas...
                  </p>
                )}

                {weatherError && (
                  <p className="dashboard-weather__message">
                    {weatherError}
                  </p>
                )}

                {currentWeather && !isWeatherLoading && (
                  <>
                    <div className="dashboard-weather__current">
                      <span
                        className="dashboard-weather__current-icon"
                        aria-hidden="true"
                      >
                        {getWeatherIcon(currentWeather.weather_code)}
                      </span>

                      <div className="dashboard-weather__current-info">
                        <strong>
                          {currentWeather.temperature.toFixed(1)} °C
                        </strong>

                        <span>
                          {getWeatherDescription(currentWeather.weather_code)}
                        </span>
                      </div>
                    </div>

                    <div className="dashboard-weather__metrics">
                      <div>
                        <span>Sensação</span>
                        <strong>
                          {currentWeather.apparent_temperature.toFixed(1)} °C
                        </strong>
                      </div>

                      <div>
                        <span>Prob. chuva</span>
                        <strong>
                          {currentWeather.precipitation_probability}%
                        </strong>
                      </div>

                      <div>
                        <span>Vento</span>
                        <strong>
                          {currentWeather.wind_speed.toFixed(1)} km/h
                        </strong>
                      </div>

                      <div>
                        <span>Rajadas</span>
                        <strong>
                          {currentWeather.wind_gusts.toFixed(1)} km/h
                        </strong>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <p className="dashboard-weather__note">
                ⓘ Condições atuais na sua localização.
              </p>
            </article>

            <article className="dashboard-upcoming">
              <div className="dashboard-upcoming__header">
                <div>
                  <span className="eyebrow">
                    Próximas atividades
                  </span>

                  <h2>O que vem a seguir</h2>
                </div>

                <button
                  type="button"
                  className="dashboard-upcoming__all-button"
                  onClick={handleOpenActivities}
                >
                  Ver todas as atividades
                </button>
              </div>

              {upcomingActivities.length > 0 ? (
                <div className="dashboard-upcoming__list">
                  {upcomingActivities.map((activity) => (
                    <article
                      key={activity.id}
                      className="dashboard-upcoming__item"
                    >
                      <div className="dashboard-upcoming__image-wrapper">
                        <img
                          className="dashboard-upcoming__image"
                          src={activityTypeImages[activity.activity_type]}
                          alt=""
                        />
                      </div>

                      <div className="dashboard-upcoming__content">
                        <span>
                          {activityTypeLabels[activity.activity_type]}
                        </span>

                        <h3>{activity.title}</h3>

                        <p>
                          <span aria-hidden="true">📍</span>
                          {activity.location_name}
                        </p>

                        <p>
                          <span aria-hidden="true">📅</span>
                          {new Date(
                            `${activity.scheduled_date}T00:00:00`,
                          ).toLocaleDateString('pt-PT')}{' '}
                          às {activity.scheduled_time.slice(0, 5)}
                        </p>
                      </div>

                      <span
                        className="dashboard-upcoming__arrow"
                        aria-hidden="true"
                      >
                        ›
                      </span>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="dashboard-next__empty">
                  <p>
                    Não existem atividades planeadas para uma data futura.
                  </p>
                </div>
              )}
            </article>
          </section>
        </>
      )}
    </main>
  )
}

export default DashboardPage