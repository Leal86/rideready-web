import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import api from '../services/api'
import '../styles/calendar.css'

const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
]

const weekDays = [
    'Dom',
    'Seg',
    'Ter',
    'Qua',
    'Qui',
    'Sex',
    'Sáb',
]

const activityTypeLabels = {
    WALKING: 'Caminhada',
    RUNNING: 'Corrida',
    CYCLING: 'Ciclismo',
    HIKING: 'Trilho',
    OTHER: 'Outra',
}

const activityTypeIcons = {
    WALKING: '🚶',
    RUNNING: '🏃',
    CYCLING: '🚴',
    HIKING: '🥾',
    OTHER: '🏋️',
}

const summaryIcons = {
    total: '🏃',
    planned: '📅',
    completed: '✅',
    cancelled: '🚫',
}

const activityStatusLabels = {
    PLANNED: 'Planeada',
    COMPLETED: 'Concluída',
    CANCELLED: 'Cancelada',
}

const weatherAssessmentLabels = {
    FAVORABLE: 'Favorável',
    CAUTION: 'Atenção',
    UNFAVORABLE: 'Desfavorável',
}

function CalendarPage({ onOpenActivity }) {
    const [activities, setActivities] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedActivity, setSelectedActivity] = useState(null)
    const selectedDaySectionRef = useRef(null)

    const today = new Date()

    const [currentMonth, setCurrentMonth] = useState(
        today.getMonth(),
    )

    const [currentYear, setCurrentYear] = useState(
        today.getFullYear(),
    )

    useEffect(() => {
        async function loadActivities() {
            try {
                const response = await api.get('/activities')

                setActivities(response.data)
            } catch {
                setError(
                    'Não foi possível carregar as atividades do calendário.',
                )
            } finally {
                setIsLoading(false)
            }
        }

        loadActivities()
    }, [])

    useEffect(() => {
        if (!selectedDate) {
            return
        }

        selectedDaySectionRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        })
    }, [selectedDate])

    const activitiesByDate = useMemo(() => {
        return activities.reduce((accumulator, activity) => {
            const date = activity.scheduled_date

            if (!accumulator[date]) {
                accumulator[date] = []
            }

            accumulator[date].push(activity)

            return accumulator
        }, {})
    }, [activities])

    const monthActivities = useMemo(() => {
        return activities.filter((activity) => {
            const [year, month] = activity.scheduled_date
                .split('-')
                .map(Number)

            return (
                year === currentYear &&
                month === currentMonth + 1
            )
        })
    }, [activities, currentMonth, currentYear])

    const monthSummary = useMemo(() => {
        return {
            total: monthActivities.length,

            planned: monthActivities.filter(
                (activity) => activity.status === 'PLANNED',
            ).length,

            completed: monthActivities.filter(
                (activity) => activity.status === 'COMPLETED',
            ).length,

            cancelled: monthActivities.filter(
                (activity) => activity.status === 'CANCELLED',
            ).length,
        }
    }, [monthActivities])

    const upcomingActivities = useMemo(() => {
        const now = new Date()

        return monthActivities
            .filter((activity) => {
                if (activity.status !== 'PLANNED') {
                    return false
                }

                const scheduledDateTime = new Date(
                    `${activity.scheduled_date}T${activity.scheduled_time}`,
                )

                return scheduledDateTime >= now
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
            .slice(0, 5)
    }, [monthActivities])

    const firstDayOfMonth = new Date(
        currentYear,
        currentMonth,
        1,
    ).getDay()

    const daysInMonth = new Date(
        currentYear,
        currentMonth + 1,
        0,
    ).getDate()

    const calendarDays = []

    for (let index = 0; index < firstDayOfMonth; index += 1) {
        calendarDays.push(null)
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        calendarDays.push(day)
    }

    function handlePreviousMonth() {
        if (currentMonth === 0) {
            setCurrentMonth(11)
            setCurrentYear((year) => year - 1)
            return
        }

        setCurrentMonth((month) => month - 1)
    }

    function handleNextMonth() {
        if (currentMonth === 11) {
            setCurrentMonth(0)
            setCurrentYear((year) => year + 1)
            return
        }

        setCurrentMonth((month) => month + 1)
    }

    function buildDateKey(day) {
        const month = String(currentMonth + 1).padStart(2, '0')
        const formattedDay = String(day).padStart(2, '0')

        return `${currentYear}-${month}-${formattedDay}`
    }

    function isToday(day) {
        return (
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()
        )
    }

    function handleSelectDay(dateKey) {
        setSelectedDate(dateKey)
    }

    function formatUpcomingDate(dateString) {
        return new Date(
            `${dateString}T00:00:00`,
        ).toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: 'short',
        })
    }

    function formatWeatherCheckedAt(dateString) {
        if (!dateString) {
            return ''
        }

        return new Date(dateString).toLocaleString('pt-PT', {
            dateStyle: 'short',
            timeStyle: 'short',
        })
    }

    function getWeatherIcon(weatherCode) {
        if (weatherCode === 0) {
            return '☀️'
        }

        if ([1, 2].includes(weatherCode)) {
            return '🌤️'
        }

        if (weatherCode === 3) {
            return '☁️'
        }

        if ([45, 48].includes(weatherCode)) {
            return '🌫️'
        }

        if (
            (weatherCode >= 51 && weatherCode <= 67) ||
            (weatherCode >= 80 && weatherCode <= 82)
        ) {
            return '🌧️'
        }

        if (
            (weatherCode >= 71 && weatherCode <= 77) ||
            [85, 86].includes(weatherCode)
        ) {
            return '🌨️'
        }

        if (weatherCode >= 95) {
            return '⛈️'
        }

        return '🌤️'
    }

    return (
        <main className="app-content calendar-page">

            {error && (
                <section className="feedback-message feedback-message--error">
                    <p>{error}</p>
                </section>
            )}

            {!isLoading && !error && (
                <div className="calendar-content">
                    <div className="calendar-header">
                        <h1>Calendário</h1>
                    </div>

                    <aside className="calendar-sidebar">

                        <section className="calendar-summary">
                            <span className="eyebrow">Resumo do mês</span>

                            <h2>
                                {monthNames[currentMonth]} {currentYear}
                            </h2>

                            <div className="calendar-summary__stats">
                                <div className="calendar-summary__stat--total">
                                    <span className="calendar-summary__label">
                                        <span className="calendar-summary__icon" aria-hidden="true">
                                            {summaryIcons.total}
                                        </span>
                                        Total
                                    </span>

                                    <strong>{monthSummary.total}</strong>
                                </div>

                                <div className="calendar-summary__stat--planned">
                                    <span className="calendar-summary__label">
                                        <span className="calendar-summary__icon" aria-hidden="true">
                                            {summaryIcons.planned}
                                        </span>
                                        Planeadas
                                    </span>

                                    <strong>{monthSummary.planned}</strong>
                                </div>

                                <div className="calendar-summary__stat--completed">
                                    <span className="calendar-summary__label">
                                        <span className="calendar-summary__icon" aria-hidden="true">
                                            {summaryIcons.completed}
                                        </span>
                                        Concluídas
                                    </span>

                                    <strong>{monthSummary.completed}</strong>
                                </div>

                                <div className="calendar-summary__stat--cancelled">
                                    <span className="calendar-summary__label">
                                        <span className="calendar-summary__icon" aria-hidden="true">
                                            {summaryIcons.cancelled}
                                        </span>
                                        Canceladas
                                    </span>

                                    <strong>{monthSummary.cancelled}</strong>
                                </div>
                            </div>
                        </section>

                        <section className="calendar-upcoming">
                            <div className="calendar-upcoming__header">
                                <span className="eyebrow">Planeamento</span>
                                <h2>Próximas atividades</h2>
                            </div>

                            {upcomingActivities.length > 0 ? (
                                <div className="calendar-upcoming__list">
                                    {upcomingActivities.map((activity) => (
                                        <button
                                            key={activity.id}
                                            type="button"
                                            className="calendar-upcoming__item"
                                            onClick={() => setSelectedActivity(activity)}
                                            title={`Abrir ${activity.title}`}
                                        >
                                            <div className="calendar-upcoming__content">
                                                <strong>{activity.title}</strong>

                                                <span className="calendar-upcoming__type">
                                                    <span
                                                        className="calendar-upcoming__type-icon"
                                                        aria-hidden="true"
                                                    >
                                                        {activityTypeIcons[activity.activity_type] ?? '●'}
                                                    </span>

                                                    {activityTypeLabels[activity.activity_type]}
                                                </span>

                                            </div>

                                            <div className="calendar-upcoming__datetime">
                                                <strong>
                                                    {formatUpcomingDate(
                                                        activity.scheduled_date,
                                                    )}
                                                </strong>

                                                <span>
                                                    {activity.scheduled_time.slice(0, 5)}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="calendar-upcoming__empty">
                                    Não existem atividades planeadas futuras neste mês.
                                </p>
                            )}

                            {upcomingActivities.length > 2 && (
                                <p className="calendar-upcoming__more">
                                    + {upcomingActivities.length - 2} atividade(s)
                                </p>
                            )}
                        </section>

                    </aside>

                    <div className="calendar-planning">
                        <span className="eyebrow">Planeamento</span>
                    </div>

                    <div className="calendar-layout">
                        <section className="calendar">
                            <div className="calendar__toolbar">
                                <button
                                    type="button"
                                    onClick={handlePreviousMonth}
                                    aria-label="Mês anterior"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M15 18L9 12L15 6"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>

                                <h2>
                                    {monthNames[currentMonth]} {currentYear}
                                </h2>

                                <button
                                    type="button"
                                    onClick={handleNextMonth}
                                    aria-label="Mês seguinte"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M9 6L15 12L9 18"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div className="calendar__weekdays">
                                {weekDays.map((weekDay) => (
                                    <span key={weekDay}>{weekDay}</span>
                                ))}
                            </div>

                            <div className="calendar__grid">
                                {calendarDays.map((day, index) => {
                                    if (!day) {
                                        return (
                                            <div
                                                key={`empty-${index}`}
                                                className="calendar__day calendar__day--empty"
                                            />
                                        )
                                    }

                                    const dateKey = buildDateKey(day)
                                    const dayActivities =
                                        activitiesByDate[dateKey] ?? []

                                    return (
                                        <article
                                            key={dateKey}
                                            className={[
                                                'calendar__day',
                                                isToday(day) ? 'calendar__day--today' : '',
                                                selectedDate === dateKey
                                                    ? 'calendar__day--selected'
                                                    : '',
                                            ]
                                                .filter(Boolean)
                                                .join(' ')}
                                            onClick={() => handleSelectDay(dateKey)}
                                        >
                                            <span className="calendar__day-number">
                                                {day}
                                            </span>

                                            <div className="calendar__day-activities">
                                                {dayActivities.slice(0, 2).map((activity) => (
                                                    <span
                                                        key={activity.id}
                                                        className={[
                                                            'calendar__activity',
                                                            `calendar__activity--${activity.status.toLowerCase()}`,
                                                        ].join(' ')}
                                                        title={`${activity.title} — ${activity.scheduled_time.slice(0, 5)}`}
                                                    >
                                                        <span
                                                            className="calendar__activity-icon"
                                                            title={activityTypeLabels[activity.activity_type]}
                                                            aria-label={activityTypeLabels[activity.activity_type]}
                                                        >
                                                            {activityTypeIcons[activity.activity_type] ?? '●'}
                                                        </span>

                                                        <span>
                                                            {activity.scheduled_time.slice(0, 5)}
                                                        </span>
                                                    </span>
                                                ))}

                                                {dayActivities.length > 2 && (
                                                    <span className="calendar__more">
                                                        +{dayActivities.length - 2} atividade(s)
                                                    </span>
                                                )}
                                            </div>

                                            {dayActivities.length > 0 && (
                                                <span className="calendar__mobile-count">
                                                    {dayActivities.length}
                                                </span>
                                            )}
                                        </article>
                                    )
                                })}
                            </div>

                            {selectedDate && (
                                <section
                                    ref={selectedDaySectionRef}
                                    className="calendar__selected-day"
                                >
                                    <h3>
                                        Atividades de{' '}
                                        {new Date(
                                            `${selectedDate}T00:00:00`,
                                        ).toLocaleDateString('pt-PT')}
                                    </h3>

                                    {(activitiesByDate[selectedDate] ?? []).length > 0 ? (
                                        <div className="calendar__selected-day-list">
                                            {(activitiesByDate[selectedDate] ?? []).map(
                                                (activity) => (
                                                    <button
                                                        key={activity.id}
                                                        type="button"
                                                        className={[
                                                            'calendar__selected-activity',
                                                            `calendar__selected-activity--${activity.status.toLowerCase()}`,
                                                        ].join(' ')}
                                                        onClick={() => setSelectedActivity(activity)}
                                                    >
                                                        <div>
                                                            <strong>{activity.title}</strong>
                                                            <span>
                                                                {activityTypeLabels[
                                                                    activity.activity_type
                                                                ]}
                                                            </span>
                                                        </div>

                                                        <span>
                                                            {activity.scheduled_time.slice(0, 5)}
                                                        </span>
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <p>Não existem atividades neste dia.</p>
                                    )}
                                </section>
                            )}
                        </section>
                    </div>
                </div>
            )}


            {
                selectedActivity && (
                    <div
                        className="calendar-activity-modal"
                        role="presentation"
                        onClick={() => setSelectedActivity(null)}
                    >
                        <section
                            className="calendar-activity-modal__content"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="calendar-activity-modal-title"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <button
                                type="button"
                                className="calendar-activity-modal__close"
                                onClick={() => setSelectedActivity(null)}
                                aria-label="Fechar detalhes da atividade"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M6 6L18 18M18 6L6 18"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </button>

                            <span className="eyebrow">
                                {activityTypeLabels[
                                    selectedActivity.activity_type
                                ]}
                            </span>

                            <h2 id="calendar-activity-modal-title">
                                {selectedActivity.title}
                            </h2>

                            <div className="calendar-activity-modal__details">
                                <p>
                                    <strong>Local:</strong>{' '}
                                    {selectedActivity.location_name}
                                </p>

                                <p>
                                    <strong>Data:</strong>{' '}
                                    {new Date(
                                        `${selectedActivity.scheduled_date}T00:00:00`,
                                    ).toLocaleDateString('pt-PT')}
                                </p>

                                <p>
                                    <strong>Hora:</strong>{' '}
                                    {selectedActivity.scheduled_time.slice(0, 5)}
                                </p>

                                <p>
                                    <strong>Estado:</strong>{' '}
                                    {activityStatusLabels[selectedActivity.status]}
                                </p>

                                {selectedActivity.notes && (
                                    <p>
                                        <strong>Notas:</strong>{' '}
                                        {selectedActivity.notes}
                                    </p>
                                )}

                                <div className="calendar-activity-modal__weather">
                                    <div className="calendar-activity-modal__weather-header">
                                        <div>
                                            <span className="eyebrow">Condições</span>
                                            <h3>Previsão meteorológica</h3>
                                        </div>

                                        {selectedActivity.weather_checked_at && (
                                            <span className="calendar-activity-modal__weather-date">
                                                Consultada em{' '}
                                                {formatWeatherCheckedAt(
                                                    selectedActivity.weather_checked_at,
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    {selectedActivity.weather_checked_at ? (
                                        <>
                                            <div className="calendar-activity-modal__weather-grid">
                                                <div>
                                                    <span>Temperatura</span>
                                                    <strong>
                                                        {selectedActivity.weather_temperature} °C
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Sensação</span>
                                                    <strong>
                                                        {selectedActivity.weather_apparent_temperature} °C
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Prob. chuva</span>
                                                    <strong>
                                                        {selectedActivity.weather_precipitation_probability}%
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Precipitação</span>
                                                    <strong>
                                                        {selectedActivity.weather_precipitation} mm
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Vento</span>
                                                    <strong>
                                                        {selectedActivity.weather_wind_speed} km/h
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>Rajadas</span>
                                                    <strong>
                                                        {selectedActivity.weather_wind_gusts} km/h
                                                    </strong>
                                                </div>
                                            </div>

                                            <div className="calendar-activity-modal__assessment">
                                                <span>Avaliação</span>

                                                <strong className="calendar-activity-modal__assessment-result">
                                                    <span
                                                        className="calendar-activity-modal__weather-icon"
                                                        aria-hidden="true"
                                                    >
                                                        {getWeatherIcon(
                                                            selectedActivity.weather_code,
                                                        )}
                                                    </span>

                                                    {weatherAssessmentLabels[
                                                        selectedActivity.weather_assessment_level
                                                    ] ?? 'Não disponível'}
                                                </strong>
                                            </div>

                                            {selectedActivity.weather_assessment_reasons?.length > 0 && (
                                                <div className="calendar-activity-modal__reasons">
                                                    <strong>Observações</strong>

                                                    <ul>
                                                        {selectedActivity.weather_assessment_reasons.map(
                                                            (reason) => (
                                                                <li key={reason}>{reason}</li>
                                                            ),
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p className="calendar-activity-modal__weather-empty">
                                            Ainda não existe uma previsão meteorológica guardada para esta
                                            atividade.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="calendar-activity-modal__actions">
                                <button
                                    type="button"
                                    className="calendar-activity-modal__activities-button"
                                    onClick={() => {
                                        const activityId = selectedActivity.id

                                        setSelectedActivity(null)
                                        onOpenActivity(activityId)
                                    }}
                                >
                                    Ir para atividade
                                </button>
                            </div>
                        </section>
                    </div>
                )
            }
        </main>
    )
}

export default CalendarPage