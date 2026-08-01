import { useMemo } from 'react'
import { GeoJSON } from 'react-leaflet'
import L from 'leaflet'

const styles = {
  siteBoundary: {
    color: '#ef4444',
    weight: 3,
    opacity: 1,
    fillOpacity: 0,
  },
  roads: {
    color: '#6b7280',
    weight: 3,
    opacity: 0.9,
  },
  buildings: {
    color: '#111827',
    weight: 1,
    opacity: 1,
    fillColor: '#ffffff',
    fillOpacity: 0.9,
  },
  openSpaces: {
    color: '#16a34a',
    weight: 1,
    opacity: 0.9,
    fillColor: '#dcfce7',
    fillOpacity: 0.55,
  },
}

const categoryIconMap = {
  Park: '🌳',
  School: '🏫',
  Government: '🏛️',
  'Research Institute': '🏛️',
  Community: '🏘️',
  Temple: '🛕',
  Institute: '🎓',
  Club: '🎯',
  'Bus Stop': '🚌',
  'Public Toilet': '🚻',
}

export default function GeoJsonLayer({ featureData, layerKey, onFeatureClick, activeFeatureId }) {
  const style = styles[layerKey] || {}

  const renderPopupContent = (feature) => {
    if (!feature?.properties) return ''
    const { name, road, category, description } = feature.properties
    return `
      <div style="font-family:system-ui, sans-serif; line-height:1.4;">
        <strong style="display:block; margin-bottom:6px;">${name}</strong>
        <div style="font-size:13px; color:#334155; margin-bottom:4px;">${road || category || ''}</div>
        <div style="font-size:13px; color:#475569;">${description || ''}</div>
      </div>
    `
  }

  const getFeatureId = (feature) => {
    const coordId = feature?.geometry?.coordinates?.flat?.()?.join?.(',')
    return feature?.properties?.id ?? coordId ?? ''
  }

  const pointToLayer = (feature, latlng) => {
    if (layerKey !== 'landmarks') return L.circleMarker(latlng, { radius: 6, color: '#0f766e', fillOpacity: 1, fillColor: '#0f766e' })

    const category = feature?.properties?.category || 'Landmark'
    const iconText = categoryIconMap[category] ?? '📍'
    const active = activeFeatureId === getFeatureId(feature)
    const icon = L.divIcon({
      className: 'custom-geojson-marker',
      html: `<div style="display:flex;align-items:center;justify-content:center;border-radius:999px;width:${active ? 40 : 32}px;height:${active ? 40 : 32}px;background:#0f766e;color:white;font-size:${active ? 16 : 14}px;border:2px solid white;box-shadow:0 10px 24px rgba(15,23,42,0.18)">${iconText}</div>`,
      iconSize: [active ? 40 : 32, active ? 40 : 32],
      iconAnchor: [active ? 20 : 16, active ? 20 : 16],
    })
    return L.marker(latlng, { icon })
  }

  const onEachFeature = (feature, layer) => {
    if (feature?.properties?.name) {
      layer.bindPopup(renderPopupContent(feature), { maxWidth: 280, closeButton: true })
    }
    layer.on({
      click: () => {
        layer.openPopup?.()
        onFeatureClick?.(feature)
      },
    })
  }

  const filteredData = useMemo(() => {
    if (!featureData) return null
    return featureData
  }, [featureData])

  return filteredData ? <GeoJSON key={layerKey} data={filteredData} style={style} pointToLayer={pointToLayer} onEachFeature={onEachFeature} /> : null
}
