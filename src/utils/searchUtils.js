export function normalizeText(value = '') {
  return value.toLowerCase().trim()
}

export function highlightText(text = '', query = '') {
  const normalizedQuery = normalizeText(query)
  if (!normalizedQuery) return [{ text, isMatch: false }]

  const regex = new RegExp(`(${normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig')
  const parts = text.split(regex)
  return parts.filter(Boolean).map((part) => ({ text: part, isMatch: normalizeText(part) === normalizedQuery }))
}

function getScore(item, query) {
  const q = normalizeText(query)
  const name = normalizeText(item.name)
  const road = normalizeText(item.road)
  const category = normalizeText(item.category)
  const categoryLabel = normalizeText(item.categoryLabel)
  const sourceCategory = normalizeText(item.sourceCategory)
  const description = normalizeText(item.description)

  if (!q) return { score: 0, matchType: 'none' }

  if (name === q || name.startsWith(q)) return { score: 100, matchType: 'exactName' }
  if (name.includes(q)) return { score: 90, matchType: 'partialName' }
  if (road.includes(q)) return { score: 80, matchType: 'road' }
  if (category.includes(q)) return { score: 70, matchType: 'category' }
  if (categoryLabel.includes(q)) return { score: 70, matchType: 'categoryLabel' }
  if (sourceCategory.includes(q)) return { score: 70, matchType: 'sourceCategory' }
  if (description.includes(q)) return { score: 60, matchType: 'description' }

  return { score: 0, matchType: 'none' }
}

export function searchLandmarks(query, landmarks = []) {
  const normalizedQuery = normalizeText(query)
  if (!normalizedQuery) return []

  return landmarks
    .map((landmark) => ({
      ...landmark,
      ...getScore(landmark, normalizedQuery),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
}
