import { useMemo } from 'react'
import { GeoJSON } from 'react-leaflet'
import L from 'leaflet'

const styles = {
  siteBoundary: {
    color: '#ef4444',
    weight: 4,
    opacity: 1,
    fillOpacity: 0,
  },

  roads: {
    color: '#6b7280',
    weight: 2,
    opacity: 0.9,
  },

  buildings: {
    color: '#111827',
    weight: 1.5,
    opacity: 1,
    fillColor: '#8b5cf6',
    fillOpacity: 0.65,
  },

  openSpaces: {
    color: '#16a34a',
    weight: 1,
    opacity: 0.9,
    fillColor: '#dcfce7',
    fillOpacity: 0.55,
  },
}

const getSafeString = (value) => {
  if (value === null || value === undefined) {
    return 'Not assigned'
  }

  const valueString = String(value).trim()

  return valueString.length > 0
    ? valueString
    : 'Not assigned'
}

export default function GeoJsonLayer({
  featureData,
  layerKey,
  onFeatureClick,
  activeFeatureId,
}) {
  const style = styles[layerKey] || {}

  const renderPopupContent = (feature) => {
    if (!feature?.properties) {
      return ''
    }

    // BUILDING POPUP
    if (layerKey === 'buildings') {
      const buildingNo = getSafeString(
        feature.properties.bldg_no
      )

      const buildingName = getSafeString(
        feature.properties.bldg_namee
      )

      return `
        <div style="
          font-family: system-ui, sans-serif;
          line-height: 1.5;
          color: #0f172a;
          min-width: 180px;
        ">
          <div style="
            font-size: 15px;
            font-weight: 700;
            margin-bottom: 8px;
          ">
            Building Details
          </div>

          <div style="
            font-size: 13px;
            margin-bottom: 4px;
          ">
            <strong>Building No:</strong> ${buildingNo}
          </div>

          <div style="
            font-size: 13px;
          ">
            <strong>Building Name:</strong> ${buildingName}
          </div>
        </div>
      `
    }

    // OTHER FEATURE POPUP
    const {
      name,
      road,
      category,
      description,
    } = feature.properties

    return `
      <div style="
        font-family: system-ui, sans-serif;
        line-height: 1.4;
      ">
        <strong style="
          display: block;
          margin-bottom: 6px;
        ">
          ${name || 'Feature'}
        </strong>

        <div style="
          font-size: 13px;
          color: #334155;
          margin-bottom: 4px;
        ">
          ${road || category || ''}
        </div>

        <div style="
          font-size: 13px;
          color: #475569;
        ">
          ${description || ''}
        </div>
      </div>
    `
  }

  const getFeatureId = (feature) => {
    return (
      feature?.properties?.id ??
      feature?.properties?.bldg_no ??
      ''
    )
  }

  // Point features
  const pointToLayer = (feature, latlng) => {
    if (layerKey !== 'landmarks') {
      return L.circleMarker(latlng, {
        radius: 6,
        color: '#0f766e',
        fillColor: '#0f766e',
        fillOpacity: 1,
      })
    }

    return null
  }

  // Feature events
  const onEachFeature = (feature, layer) => {
    if (layerKey === 'buildings') {
      layer.bindPopup(
        renderPopupContent(feature),
        {
          maxWidth: 300,
          closeButton: true,
        }
      )
    } else if (feature?.properties?.name) {
      layer.bindPopup(
        renderPopupContent(feature),
        {
          maxWidth: 300,
          closeButton: true,
        }
      )
    }

    layer.on({
      click: () => {
        layer.openPopup?.()
        onFeatureClick?.(feature)
      },

      mouseover: () => {
        if (layerKey === 'buildings') {
          layer.setStyle({
            color: '#f97316',
            weight: 3,
            fillColor: '#a78bfa',
            fillOpacity: 0.85,
          })

          layer.bringToFront()
        }
      },

      mouseout: () => {
        if (layerKey === 'buildings') {
          layer.setStyle(style)
        }
      },
    })
  }

  const filteredData = useMemo(() => {
    if (!featureData) {
      return null
    }

    return featureData
  }, [featureData])

  if (!filteredData) {
    return null
  }

  return (
    <GeoJSON
      key={`${layerKey}-${filteredData.features?.length || 0}`}
      data={filteredData}
      style={style}
      pointToLayer={pointToLayer}
      onEachFeature={onEachFeature}
    />
  )
}