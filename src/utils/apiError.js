export function getApiErrorMessage(
  error,
  fallbackMessage = 'Ocorreu um erro inesperado.',
) {
  const detail = error?.response?.data?.detail

  if (typeof detail === 'string' && detail.trim()) {
    return detail
  }

  if (
    detail &&
    typeof detail === 'object' &&
    !Array.isArray(detail) &&
    typeof detail.message === 'string'
  ) {
    return detail.message
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (!item?.msg) {
          return null
        }

        const field = Array.isArray(item.loc)
          ? item.loc.at(-1)
          : null

        return field
          ? `${field}: ${item.msg}`
          : item.msg
      })
      .filter(Boolean)

    if (messages.length > 0) {
      return messages.join(' ')
    }
  }

  return fallbackMessage
}