import { useEffect, useRef, useState } from 'react'

import api from '../services/api'

function LocationAutocomplete({
  value,
  onChange,
  disabled = false,
}) {
  const [suggestions, setSuggestions] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  const skipNextSearch = useRef(false)

  useEffect(() => {
    const query = value?.trim() ?? ''

    if (skipNextSearch.current) {
      skipNextSearch.current = false
      return
    }

    if (query.length < 2) {
      return
    }

    let isCancelled = false

    const timeoutId = setTimeout(async () => {
      try {
        setIsSearching(true)
        setSearchError('')

        const response = await api.get('/locations/search', {
          params: {
            q: query,
          },
        })

        if (!isCancelled) {
          setSuggestions(response.data)
        }
      } catch {
        if (!isCancelled) {
          setSuggestions([])
          setSearchError(
            'Não foi possível pesquisar locais neste momento.',
          )
        }
      } finally {
        if (!isCancelled) {
          setIsSearching(false)
        }
      }
    }, 400)

    return () => {
      isCancelled = true
      clearTimeout(timeoutId)
    }
  }, [value])

  function handleInputChange(event) {
    const newValue = event.target.value

    skipNextSearch.current = false

    if (newValue.trim().length < 2) {
      setSuggestions([])
      setSearchError('')
      setIsSearching(false)
    }

    onChange(event)
  }

  function handleSelectLocation(location) {
    skipNextSearch.current = true

    setSuggestions([])
    setSearchError('')
    setIsSearching(false)

    onChange({
      target: {
        name: 'location_name',
        value: location.formatted,
      },
    })
  }

  return (
    <div className="location-autocomplete">
      <input
        id="location_name"
        name="location_name"
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder="Ex.: Cais do Sodré, Times Square..."
        autoComplete="off"
        disabled={disabled}
        required
      />

      {isSearching && (
        <p className="location-autocomplete__status">
          A pesquisar locais...
        </p>
      )}

      {searchError && (
        <p className="location-autocomplete__error">
          {searchError}
        </p>
      )}

      {suggestions.length > 0 && (
        <div className="location-autocomplete__suggestions">
          {suggestions.map((location) => (
            <button
              key={`${location.latitude}-${location.longitude}`}
              type="button"
              className="location-autocomplete__option"
              onClick={() => handleSelectLocation(location)}
            >
              <strong>{location.name}</strong>

              <span>
                {location.city && `${location.city}, `}
                {location.state && `${location.state}, `}
                {location.country}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LocationAutocomplete