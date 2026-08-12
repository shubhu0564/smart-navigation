export function getText(value, language) {
  if (typeof value === 'string') return value
  return value?.[language] ?? value?.en ?? ''
}

const categoryLabels = {
  all: { en: 'Landmark', mr: 'लँडमार्क' },
  landmark: { en: 'Landmark', mr: 'लँडमार्क' },
  park: { en: 'Park / Playground', mr: 'उद्यान / खेळाचे मैदान' },
  education: { en: 'Educational Institute', mr: 'शैक्षणिक संस्था' },
  busStop: { en: 'Bus Stop', mr: 'बस थांबा' },
  government: { en: 'Government Building', mr: 'सरकारी इमारत' },
}

export function getCategoryLabel(category, language) {
  return getText(categoryLabels[category] || { en: category, mr: category }, language)
}

export function formatDistance(distanceKm) {
  return `${distanceKm.toFixed(1)} km`
}
