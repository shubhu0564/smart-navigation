import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import('../src/utils/geoJsonUtils.js').then((utils) => {
  const deriveFeatureCategory = utils.deriveFeatureCategory
  const getLandmarkCategoryLabel = utils.getLandmarkCategoryLabel
  const fp = path.join(__dirname, '..', 'public', 'data', 'client_buildings.geojson')
  const raw = fs.readFileSync(fp, 'utf8')
  const geo = JSON.parse(raw)
  const counts = {}
  for (const f of geo.features) {
    const id = deriveFeatureCategory(f, 'clientBuildings') || 'uncategorized'
    counts[id] = (counts[id] || 0) + 1
  }
  console.log('Counts by id:')
  for (const k of Object.keys(counts).sort()) {
    console.log(`${k}: ${counts[k]} (${getLandmarkCategoryLabel(k)})`)
  }
}).catch((e) => {
  console.error('Error importing utils:', e)
  process.exit(1)
})
