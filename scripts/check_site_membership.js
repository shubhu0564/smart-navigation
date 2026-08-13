import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function load(file) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', file), 'utf8'))
}

function bboxOfMultiPolygon(multipolygon) {
  let minx=Infinity,miny=Infinity,maxx=-Infinity,maxy=-Infinity
  multipolygon.forEach(polyArr=>{
    polyArr.forEach(ring=>{
      ring.forEach(([x,y])=>{
        if(x<minx)minx=x; if(y<miny)miny=y; if(x>maxx)maxx=x; if(y>maxy)maxy=y
      })
    })
  })
  return {minx,miny,maxx,maxy}
}

// point-in-polygon ray-casting
function pointInRing(point, ring){
  const [x,y]=point
  let inside=false
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){
    const xi=ring[i][0], yi=ring[i][1]
    const xj=ring[j][0], yj=ring[j][1]
    const intersect = ((yi>y)!=(yj>y)) && (x < (xj-xi)*(y-yi)/(yj-yi)+xi)
    if(intersect) inside=!inside
  }
  return inside
}

function pointInPolygon(point, polygon){
  // polygon: [ring0, ring1,...] ring0 outer
  if(!polygon || polygon.length===0) return false
  if(!pointInRing(point, polygon[0])) return false
  // holes: if point in any hole => outside
  for(let i=1;i<polygon.length;i++){
    if(pointInRing(point, polygon[i])) return false
  }
  return true
}

function pointInMultiPolygon(point, multipolygon){
  for(const poly of multipolygon){
    if(pointInPolygon(point, poly)) return true
  }
  return false
}

function centroidOfPolygon(polygon){
  // polygon: [ring0,...], use ring0
  const ring = polygon[0]
  let area=0, cx=0, cy=0
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){
    const xi=ring[i][0], yi=ring[i][1]
    const xj=ring[j][0], yj=ring[j][1]
    const a = xj*yi - xi*yj
    area += a
    cx += (xj+xi)*a
    cy += (yj+yi)*a
  }
  area *= 0.5
  if(area===0) return ring[0]
  cx /= (6*area)
  cy /= (6*area)
  return [cx, cy]
}

function analyze() {
  const site = load('site_boundary.geojson')
  const siteMult = site.features[0].geometry.coordinates // MultiPolygon

  const datasets = ['landmarks.geojson','client_buildings.geojson','bus_stops.geojson','park_playground.geojson']
  const report = {}

  for(const ds of datasets){
    let data=null
    try{ data = load(ds) }catch(e){ console.error('Failed to load',ds,e.message); continue }
    const features = data.features || []
    report[ds]={total:features.length, outside:[]}
    features.forEach((f, idx)=>{
      try{
        const geom = f.geometry
        let point=null
        if(!geom) return
        if(geom.type==='Point'){
          point = [geom.coordinates[0], geom.coordinates[1]]
        } else if(geom.type==='MultiPoint'){
          point = [geom.coordinates[0][0], geom.coordinates[0][1]]
        } else if(geom.type==='Polygon'){
          point = centroidOfPolygon(geom.coordinates)
        } else if(geom.type==='MultiPolygon'){
          point = centroidOfPolygon(geom.coordinates[0])
        } else if(geom.type==='LineString'){
          point = geom.coordinates[Math.floor(geom.coordinates.length/2)]
        } else {
          // fallback: first numeric pair
          function findFirst(coords){
            if(!Array.isArray(coords)) return null
            if(typeof coords[0]==='number'&&typeof coords[1]==='number') return coords
            for(const c of coords){
              const r=findFirst(c); if(r) return r
            }
            return null
          }
          const first=findFirst(geom.coordinates)
          if(first) point=[first[0], first[1]]
        }
        if(!point) return
        const inside = pointInMultiPolygon(point, siteMult)
        if(!inside){
          const id = f.properties?.id ?? f.properties?.fid_1 ?? f.properties?.fid ?? f.properties?.Name ?? f.properties?.name ?? `idx-${idx}`
          report[ds].outside.push({id, idx, point})
        }
      }catch(err){ console.error('err',ds,idx,err.message) }
    })
  }
  console.log(JSON.stringify(report, null, 2))
}

analyze()
