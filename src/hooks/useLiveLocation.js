import { useEffect, useState } from 'react'

export function useLiveLocation() {
  const [position, setPosition] = useState(null)
  const [accuracy, setAccuracy] = useState(null)
  const [speed, setSpeed] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Location is not supported by this browser.')
      setLoading(false)
      return
    }

    const updateLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          setPosition({ lat: location.coords.latitude, lng: location.coords.longitude })
          setAccuracy(location.coords.accuracy)
          setSpeed(location.coords.speed)
          setLoading(false)
          setError(null)
        },
        (geoError) => {
          // map error codes to friendly messages
          let message = geoError?.message ?? 'Unable to get location.'
          if (geoError?.code === 1) {
            message = 'Location permission was denied. Please allow location access in your browser settings.'
          } else if (geoError?.code === 2) {
            message = 'Your current location is unavailable.'
          } else if (geoError?.code === 3) {
            message = 'Location request timed out. Please try again.'
          }
          setError(message)
          setLoading(false)
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000,
        },
      )
    }

    updateLocation()
    const interval = window.setInterval(updateLocation, 5000)

    const watchId = navigator.geolocation.watchPosition(
      (location) => {
        setPosition({ lat: location.coords.latitude, lng: location.coords.longitude })
        setAccuracy(location.coords.accuracy)
        setSpeed(location.coords.speed)
        setLoading(false)
        setError(null)
      },
      (geoError) => {
        let message = geoError?.message ?? 'Unable to get location.'
        if (geoError?.code === 1) {
          message = 'Location permission was denied. Please allow location access in your browser settings.'
        } else if (geoError?.code === 2) {
          message = 'Your current location is unavailable.'
        } else if (geoError?.code === 3) {
          message = 'Location request timed out. Please try again.'
        }
        setError(message)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
    )

    return () => {
      window.clearInterval(interval)
      navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  return { position, accuracy, speed, loading, error }
}
