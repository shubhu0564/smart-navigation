import { useEffect, useState } from 'react'

export function useLiveLocation() {
  const [position, setPosition] = useState(null)
  const [accuracy, setAccuracy] = useState(null)
  const [speed, setSpeed] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.')
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
          setError(geoError.message)
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
        setError(geoError.message)
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
