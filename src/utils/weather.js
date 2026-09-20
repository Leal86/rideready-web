export function getWeatherIcon(weatherCode) {
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