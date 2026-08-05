export function getText(value, language) {
  if (typeof value === 'string') return value
  return value?.[language] ?? value?.en ?? ''
}

const categoryLabels = {
  'Hospitals / Medical': { en: 'Hospitals / Medical', mr: 'रुग्णालये / वैद्यकीय' },
  Park: { en: 'Parks', mr: 'बागा' },
  School: { en: 'Schools', mr: 'शाळा' },
  Institute: { en: 'Educational Institutes', mr: 'शैक्षणिक संस्था' },
  Community: { en: 'Community Centres', mr: 'समुदाय केंद्रे' },
  'Bus Stop': { en: 'Bus Stops', mr: 'बस थांबे' },
  'Public Toilet': { en: 'Public Toilets', mr: 'सार्वजनिक शौचालये' },
  Temple: { en: 'Temples', mr: 'मंदिर' },
  Government: { en: 'Government Buildings', mr: 'सरकारी इमारती' },
}

export function getCategoryLabel(category, language) {
  return getText(categoryLabels[category] || { en: category, mr: category }, language)
}

export function formatDistance(distanceKm) {
  return `${distanceKm.toFixed(1)} km`
}
