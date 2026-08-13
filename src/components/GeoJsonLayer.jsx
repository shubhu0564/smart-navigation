import { useMemo } from 'react'
import { GeoJSON } from 'react-leaflet'
import L from 'leaflet'

const styles = {
  buildings: {
    color: '#111827',
    weight: 1.5,
    opacity: 1,
    fillColor: '#8b5cf6',
    fillOpacity: 0.65,
  },

  clientBuildings: {
    color: '#111827',
    weight: 1.5,
    opacity: 1,
    fillColor: '#8b5cf6',
    fillOpacity: 0.65,
  },

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

  openSpaces: {
    color: '#16a34a',
    weight: 1,
    opacity: 0.9,
    fillColor: '#dcfce7',
    fillOpacity: 0.55,
  },

  parkPlayground: {
    color: '#16a34a',
    weight: 1,
    opacity: 0.9,
    fillColor: '#dcfce7',
    fillOpacity: 0.55,
  },
}

function safeValue(...values) {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== '' &&
      String(value).trim() !== 'null'
    ) {
      return String(value).trim()
    }
  }

  return 'Not assigned'
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export default function GeoJsonLayer({
  featureData,
  layerKey,
  onFeatureClick,
  activeFeatureId,
}) {
  const style = styles[layerKey] || {}

  const getBuildingName = (properties = {}) => {
    return safeValue(
      properties.bldg_namee,
      properties.bldg_name,
      properties.building_name,
      properties.name,
      properties.Name
    )
  }

  const getBuildingNumber = (properties = {}) => {
    return safeValue(
      properties.bldg_no,
      properties.building_no,
      properties.bldgNo,
      properties.id
    )
  }

  const renderBuildingPopup = (feature) => {
    const properties = feature?.properties || {}
    // Use the exact clicked feature properties from client_buildings.geojson
    // bldg_namee: fallback to 'Unnamed Building' when null/empty
    // bldg_no: fallback to 'Not assigned' when null/undefined
    const rawName = properties.bldg_namee
    const rawNo = properties.bldg_no

    const buildingName = (rawName !== undefined && rawName !== null && String(rawName).trim() !== '') ? String(rawName).trim() : 'Unnamed Building'
    const buildingNo = (rawNo !== undefined && rawNo !== null && String(rawNo).trim() !== '') ? String(rawNo) : 'Not assigned'

    return `
      <div style="
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        min-width: 230px;
        padding: 2px;
        color: #0f172a;
      ">

        <div style="
          font-size: 17px;
          font-weight: 700;
          margin-bottom: 14px;
        ">
          Building Details
        </div>

        <div style="
          font-size: 14px;
          margin-bottom: 9px;
        ">
          <strong>Building Name:</strong>
          ${escapeHtml(buildingName)}
        </div>

        <div style="
          font-size: 14px;
          margin-bottom: 9px;
        ">
          <strong>Building No:</strong>
          ${escapeHtml(buildingNo)}
        </div>

      </div>
    `
  }

  const renderBusStopPopup = (feature) => {
    const properties = feature?.properties || {}

    const name = safeValue(
      properties.Name,
      properties.name,
      properties.bus_stop_name,
      properties.stop_name
    )

    return `
      <div style="
        font-family: system-ui, sans-serif;
        min-width: 200px;
        color: #0f172a;
      ">
        <div style="
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 8px;
        ">
          Bus Stop
        </div>

        <div style="font-size: 14px;">
          <strong>Name:</strong>
          ${escapeHtml(name)}
        </div>
      </div>
    `
  }

  const renderGeneralPopup = (feature) => {
    const properties = feature?.properties || {}

    const name = safeValue(
      properties.name,
      properties.Name,
      properties.bldg_namee
    )

    const category = safeValue(
      properties.Landmarks,
      properties.category
    )

    return `
      <div style="
        font-family: system-ui, sans-serif;
        min-width: 200px;
        color: #0f172a;
      ">
        <div style="
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 8px;
        ">
          ${escapeHtml(name)}
        </div>

        ${
          category !== 'Not assigned'
            ? `
              <div style="font-size: 13px;">
                <strong>Category:</strong>
                ${escapeHtml(category)}
              </div>
            `
            : ''
        }
      </div>
    `
  }

  const pointToLayer = (feature, latlng) => {
    if (layerKey === 'busStops') {
      return L.marker(latlng)
    }

    return L.circleMarker(latlng, {
      radius: 6,
      color: '#0f766e',
      fillColor: '#ffffff',
      fillOpacity: 1,
      weight: 3,
    })
  }

  const onEachFeature = (feature, layer) => {
    if (!feature || !layer) return

    /*
     * BUILDINGS
     *
     * IMPORTANT:
     * Building information comes from client_buildings.geojson.
     */
    if (
      layerKey === 'buildings' ||
      layerKey === 'clientBuildings'
    ) {
      layer.bindPopup(
        renderBuildingPopup(feature),
        {
          maxWidth: 350,
          closeButton: true,
        }
      )
    }

    /*
     * BUS STOPS
     */
    else if (layerKey === 'busStops') {
      layer.bindPopup(
        renderBusStopPopup(feature),
        {
          maxWidth: 300,
          closeButton: true,
        }
      )
    }

    /*
     * OTHER FEATURES
     */
    else {
      const properties = feature?.properties || {}

      if (
        properties.name ||
        properties.Name ||
        properties.bldg_namee
      ) {
        layer.bindPopup(
          renderGeneralPopup(feature),
          {
            maxWidth: 300,
            closeButton: true,
          }
        )
      }
    }

    layer.on({
      click: () => {
        /*
         * Always open the popup for the exact
         * feature that was clicked.
         */
        layer.openPopup()

        onFeatureClick?.(feature, layer)
      },

      mouseover: () => {
        if (
          layerKey === 'buildings' ||
          layerKey === 'clientBuildings'
        ) {
          if (layer.setStyle) {
            layer.setStyle({
              color: '#f97316',
              weight: 3,
              fillColor: '#a78bfa',
              fillOpacity: 0.85,
            })

            layer.bringToFront()
          }
        }
      },

      mouseout: () => {
        if (
          layerKey === 'buildings' ||
          layerKey === 'clientBuildings'
        ) {
          if (layer.setStyle) {
            layer.setStyle(style)
          }
        }
      },
    })
  }

  const filteredData = useMemo(() => {
    if (!featureData) {
      return null
    }

    if (
      featureData.type !== 'FeatureCollection' ||
      !Array.isArray(featureData.features)
    ) {
      return null
    }

    return featureData
  }, [featureData])

  if (!filteredData) {
    return null
  }

  return (
    <GeoJSON
      key={`${layerKey}-${filteredData.features.length}`}
      data={filteredData}
      style={style}
      pointToLayer={pointToLayer}
      onEachFeature={onEachFeature}
    />
  )
}