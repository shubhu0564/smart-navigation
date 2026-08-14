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
  fillOpacity: 0.65,
},

clientBuildings: {
  color: '#000000',
  weight: 1.2,
  opacity: 1,
  fillColor: '#000000',
  fillOpacity: 0.65,
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

  const getFeatureId = (feature) => {
    return (
      feature?.properties?.id ??
      feature?.properties?.bldg_no ??
      feature?.properties?.fid_1 ??
      ''
    )
  }

  const pointToLayer = (feature, latlng) => {
    // Bus stops use Leaflet's fixed default marker icon.
   // BUS STOP ICON
if (layerKey === 'busStops') {
  return L.marker(latlng, {
    icon: L.divIcon({
      className: 'bus-stop-green-icon',
      html: `
        <div
          class="${showLabels ? 'bus-stop-blink' : ''}"
          style="
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: #16a34a;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 19px;
            line-height: 1;
          "
        >
          🚌
        </div>
      `,

      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -18],
    }),
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
  const props = feature?.properties || {}

  const playgroundName =
    props.Name ??
    props.name ??
    props.NAME ??
    props.landmarkName ??
    'Playground'

  const playgroundNo =
    props.Number ??
    props.number ??
    props.No ??
    props.no ??
    ''

  const cleanName = String(playgroundName ?? '').trim()
  const cleanNo = String(playgroundNo ?? '').trim()

  // NO PERMANENT LABEL
  // Playground name/number will appear ONLY after clicking.
  layer.bindPopup(
    `
      <div style="
        font-family: system-ui, sans-serif;
        min-width: 240px;
        line-height: 1.5;
        color: #0f172a;
      ">

        <div style="
          font-size: 17px;
          font-weight: 800;
          margin-bottom: 12px;
        ">
          Park / Playground
        </div>

        <div style="
          font-size: 14px;
          margin-bottom: 8px;
        ">
          <strong>Name:</strong><br/>
          ${cleanName || 'Playground'}
        </div>

        ${
          cleanNo
            ? `
              <div style="
                font-size: 14px;
                margin-bottom: 14px;
              ">
                <strong>No:</strong><br/>
                ${cleanNo}
              </div>
            `
            : ''
        }

      </div>
    `,
    {
      maxWidth: 320,
      closeButton: true,
    }
  )
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

      if (showLabels && (cleanName || cleanNo)) {
        layer.bindTooltip(
          `<div style="
            font-family: system-ui, sans-serif;
            font-size: 11px;
            font-weight: 700;
            line-height: 1.2;
            color: #0f172a;
            background: rgba(255,255,255,0.96);
            border: 1px solid #2563eb;
            border-radius: 8px;
            padding: 4px 7px;
            box-shadow: 0 2px 7px rgba(0,0,0,0.22);
            white-space: nowrap;
          ">
            ${cleanNo ? `<span style="color:#1d4ed8;">No. ${cleanNo}</span> · ` : ''}
            ${cleanName || 'Bus Stop'}
          </div>`,
          {
            permanent: true,
            direction: 'top',
            offset: [0, -8],
            className: 'bus-stop-map-label',
            opacity: 1,
            interactive: false,
          }
        )
      }

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

      if (showLabels && (cleanName || cleanNo)) {
        layer.bindTooltip(
          `<div style="
            font-family: system-ui, sans-serif;
            font-size: 11px;
            font-weight: 700;
            line-height: 1.2;
            color: #0f172a;
            background: rgba(255,255,255,0.96);
            border: 1px solid #0f766e;
            border-radius: 8px;
            padding: 4px 7px;
            box-shadow: 0 2px 7px rgba(0,0,0,0.22);
            white-space: nowrap;
          ">
            ${cleanNo ? `<span style="color:#0f766e;">No. ${cleanNo}</span> · ` : ''}
            ${cleanName || 'Landmark'}
          </div>`,
          {
            permanent: true,
            direction: 'top',
            offset: [0, -8],
            className: 'landmark-map-label',
            opacity: 1,
            interactive: false,
          }
        )
      }

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
          layer.setStyle?.({
            color: '#f97316',
            weight: 3,
            fillColor: '#a78bfa',
            fillOpacity: 0.85,
          })
          layer.bringToFront?.()
        }
      },

      mouseout: () => {
        if (layerKey === 'buildings' || layerKey === 'clientBuildings') {
          layer.setStyle?.(style)
        }
      },
    })
  }

  /*
   * Permanent playground labels are rendered as HTML tooltips.
   * Remove Leaflet's default tooltip chrome so our label styling
   * remains clean over the satellite map.
   */
  if (typeof document !== 'undefined') {
    const styleId = 'park-playground-label-style'

    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style')
      styleElement.id = styleId
      styleElement.textContent = `
        .park-playground-label {
          background: transparent !important;
          border: 0 !important;
          box-shadow: none !important;
          padding: 0 !important;
        }

        .park-playground-label::before {
          display: none !important;
        }
      `
      document.head.appendChild(styleElement)
    }
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
      key={`${layerKey}-${filteredData.features.length}`}
      data={filteredData}
      style={style}
      pointToLayer={pointToLayer}
      onEachFeature={onEachFeature}
    />
  )
}
