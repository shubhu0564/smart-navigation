export function getText(value, language) {
  if (typeof value === 'string') return value
  return value?.[language] ?? value?.en ?? ''
}

export function formatDistance(distanceKm) {
  return `${distanceKm.toFixed(1)} km`
}
