import { useMemo } from 'react'
import { GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Fix Leaflet's default marker icons when using Vite/React.
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

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
    color: '#000000',
    weight: 1.5,
    opacity: 1,
    fillColor: '#000000',
    fillOpacity: 0.9,
  },

  clientBuildings: {
    color: '#000000',
    weight: 1.5,
    opacity: 1,
    fillColor: '#000000',
    fillOpacity: 0.9,
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

  landmarks: {
    color: '#0f766e',
    weight: 1,
    opacity: 1,
    fillColor: '#0f766e',
    fillOpacity: 0.9,
  },
}

const getSafeString = (value) => {
  if (value === null || value === undefined) return 'Not assigned'

  const valueString = String(value).trim()
  return valueString.length > 0 ? valueString : 'Not assigned'
}

export default function GeoJsonLayer({
  featureData,
  layerKey,
  onFeatureClick,
  activeFeatureId,
  showLabels = false,
}) {
  const style = styles[layerKey] || {}

  const renderPopupContent = (feature) => {
    if (!feature?.properties) return ''

    if (layerKey === 'buildings' || layerKey === 'clientBuildings') {
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
          min-width: 220px;
        ">
          <div style="
            font-size: 15px;
            font-weight: 700;
            margin-bottom: 8px;
          ">
            Building Details
          </div>

          <div style="font-size: 13px; margin-bottom: 4px;">
            <strong>Building Name:</strong><br/>
            ${buildingName}
          </div>

          <div style="font-size: 13px;">
            <strong>Building No:</strong><br/>
            ${buildingNo}
          </div>
        </div>
      `
    }

    if (layerKey === 'parkPlayground') {
      const playgroundName =
        getSafeString(
          feature.properties.Name ??
          feature.properties.name
        )

      const playgroundNo =
        getSafeString(
          feature.properties.Number ??
          feature.properties.number ??
          feature.properties.No
        )

      const area =
        feature.properties.Area ??
        feature.properties.area

      return `
        <div style="
          font-family: system-ui, sans-serif;
          line-height: 1.5;
          color: #0f172a;
          min-width: 220px;
        ">
          <div style="
            font-size: 15px;
            font-weight: 700;
            margin-bottom: 8px;
          ">
            Park / Playground Details
          </div>

          <div style="font-size: 13px; margin-bottom: 4px;">
            <strong>Name:</strong><br/>
            ${playgroundName}
          </div>

          <div style="font-size: 13px; margin-bottom: 4px;">
            <strong>Number:</strong><br/>
            ${playgroundNo}
          </div>

          ${
            area !== undefined &&
            area !== null &&
            String(area).trim() !== ''
              ? `
                <div style="font-size: 13px;">
                  <strong>Area:</strong><br/>
                  ${area}
                </div>
              `
              : ''
          }
        </div>
      `
    }

    const {
      name,
      road,
      category,
      description,
    } = feature.properties

    return `
      <div style="font-family: system-ui, sans-serif; line-height: 1.4;">
        <strong style="display:block; margin-bottom:6px;">
          ${name || 'Feature'}
        </strong>
        <div style="font-size:13px; color:#334155; margin-bottom:4px;">
          ${road || category || ''}
        </div>
        <div style="font-size:13px; color:#475569;">
          ${description || ''}
        </div>
      </div>
    `
  }

  const getFeatureIds = (feature) => {
    const props = feature?.properties || {}

    return [
      props.fid_1,
      props.fid,
      props.id,
      props.ID,
      props.bldg_no,
      props.building_no,
      props.buildingNo,
    ]
      .filter((value) => value !== null && value !== undefined && String(value).trim() !== '')
      .map((value) => String(value))
  }

  const isFeatureSelected = (feature) => {
    if (activeFeatureId == null) return false

    const activeId = String(activeFeatureId)
    return getFeatureIds(feature).some((id) => id === activeId)
  }

  const getFeatureStyle = (feature) => {
    const isSelected = isFeatureSelected(feature)

    if (isSelected && (layerKey === 'buildings' || layerKey === 'clientBuildings')) {
      return {
        color: '#b91c1c',
        weight: 3,
        opacity: 1,
        fillColor: '#ef4444',
        fillOpacity: 1,
      }
    }

    return style
  }

  const pointToLayer = (feature, latlng) => {
    // Bus stops use Leaflet's fixed default marker icon.
    if (layerKey === 'busStops') {
      return L.circleMarker(latlng, {
        radius: 6,
        color: '#2563eb',
        fillColor: '#60a5fa',
        fillOpacity: 0.95,
        weight: 2,
      })
    }

    // Landmarks are not rendered as point icons in the main map.
    // Buildings are the primary clickable map features.
    if (layerKey === 'landmarks') {
      return L.circleMarker(latlng, {
        radius: showLabels ? 7 : 5,
        color: '#0f766e',
        fillColor: '#14b8a6',
        fillOpacity: 0.95,
        weight: 2,
      })
    }

    return L.circleMarker(latlng, {
      radius: 6,
      color: '#0f766e',
      fillColor: '#0f766e',
      fillOpacity: 1,
    })
  }

  const onEachFeature = (feature, layer) => {
    // Only buildings should produce the building information popup.
    if (layerKey === 'buildings' || layerKey === 'clientBuildings') {
      layer.bindPopup(
        renderPopupContent(feature),
        {
          maxWidth: 320,
          closeButton: true,
        }
      )
    } else if (layerKey === 'parkPlayground') {
      const rawName =
        feature?.properties?.Name ??
        feature?.properties?.name ??
        feature?.properties?.NAME

      const rawNo =
        feature?.properties?.Number ??
        feature?.properties?.number ??
        feature?.properties?.No ??
        feature?.properties?.NO

      // Park/playground names are NOT displayed permanently on the map.
      // They are shown only inside the popup after a click.

      layer.bindPopup(
        renderPopupContent(feature),
        {
          maxWidth: 320,
          closeButton: true,
        }
      )
    } else if (layerKey === 'busStops') {
      const props = feature?.properties || {}

      const name =
        props.Name ??
        props.name ??
        props.NAME ??
        props.stop_name ??
        props.stopName ??
        ''

      const stopNo =
        props.No ??
        props.no ??
        props.Number ??
        props.number ??
        props.stop_no ??
        props.stopNo ??
        props.Stop_No ??
        props.STOP_NO ??
        ''

      const cleanName = String(name ?? '').trim()
      const cleanNo = String(stopNo ?? '').trim()

      layer.bindPopup(
        `<div style="
          font-family: system-ui, sans-serif;
          min-width: 220px;
          line-height: 1.5;
          color: #0f172a;
        ">
          <div style="font-size:16px;font-weight:800;margin-bottom:8px;color:#1d4ed8;">
            Bus Stop
          </div>
          ${cleanNo ? `<div style="font-size:13px;margin-bottom:5px;"><strong>Stop No:</strong> ${cleanNo}</div>` : ''}
          <div style="font-size:13px;"><strong>Name:</strong><br/>${cleanName || 'Bus Stop'}</div>
        </div>`,
        { maxWidth: 300, closeButton: true }
      )
    } else if (layerKey === 'landmarks') {
      const props = feature?.properties || {}

      const landmarkName =
        props.landmarkName ??
        props.name ??
        props.Name ??
        props.landmark_name ??
        ''

      const landmarkNo =
        props.landmarkNo ??
        props.landmark_no ??
        props.No ??
        props.no ??
        ''

      const cleanName = String(landmarkName ?? '').trim()
      const cleanNo = String(landmarkNo ?? '').trim()

      // Landmark names are NOT displayed permanently on the map.

      layer.bindPopup(
        renderPopupContent(feature),
        { maxWidth: 320, closeButton: true }
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
        // Building click is handled by MapContainer so it can add
        // the Google Maps button and select the building.
        if (layerKey === 'buildings' || layerKey === 'clientBuildings') {
          layer.closePopup?.()
        } else {
          layer.openPopup?.()
        }

        onFeatureClick?.(feature)
      },

      mouseover: () => {
        if (layerKey === 'buildings' || layerKey === 'clientBuildings') {
          const isSelected = isFeatureSelected(feature)

          layer.setStyle?.(
            isSelected
              ? {
                  color: '#b91c1c',
                  weight: 3,
                  fillColor: '#ef4444',
                  fillOpacity: 1,
                }
              : {
                  color: '#000000',
                  weight: 2,
                  fillColor: '#000000',
                  fillOpacity: 0.95,
                }
          )
          layer.bringToFront?.()
        }
      },

      mouseout: () => {
        if (layerKey === 'buildings' || layerKey === 'clientBuildings') {
          layer.setStyle?.(getFeatureStyle(feature))
        }
      },
    })
  }


  const filteredData = useMemo(() => {
    if (!featureData) return null

    if (
      !featureData.features ||
      !Array.isArray(featureData.features)
    ) {
      return null
    }

    return featureData
  }, [featureData])

  if (!filteredData) return null

  return (
    <GeoJSON
      key={`${layerKey}-${filteredData.features.length}-${activeFeatureId ?? 'none'}`}
      data={filteredData}
      style={getFeatureStyle}
      pointToLayer={pointToLayer}
      onEachFeature={onEachFeature}
    />
  )
}
