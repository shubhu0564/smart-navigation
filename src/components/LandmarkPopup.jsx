export default function LandmarkPopup({ landmark, onClose }) {
  if (!landmark) return null

  const properties = landmark.feature?.properties || {}

  const landmarkNo =
    landmark.landmarkNo ??
    properties.landmarkNo ??
    properties.landmark_no ??
    properties.No ??
    properties.no ??
    ''

  const address =
    landmark.address ??
    properties.address ??
    properties.road ??
    landmark.road ??
    ''

  const openGoogleMaps = () => {
    const latitude = Number(landmark.latitude)
    const longitude = Number(landmark.longitude)

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return
    }

    const url =
      `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-950/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.()
        }
      }}
    >
      <div className="w-full max-w-sm overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 px-6 pt-5">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-teal-600">
              Landmark
            </p>

            <h2 className="text-xl font-bold leading-7 text-slate-900">
              {landmark.name || 'Selected Landmark'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-xl text-slate-500 transition hover:bg-slate-100"
          >
            ×
          </button>
        </div>

        <div className="space-y-3 px-6 py-5">
          {String(landmarkNo).trim() ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium text-slate-500">
                Landmark No.
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {landmarkNo}
              </p>
            </div>
          ) : null}

          {String(address).trim() ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium text-slate-500">
                Location
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {address}
              </p>
            </div>
          ) : null}

          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-xs font-bold text-red-600">
              Selected area
            </p>
            <p className="mt-1 text-sm font-semibold text-red-900">
              This landmark is highlighted in red on the map.
            </p>
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={openGoogleMaps}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            Open in Google Maps
          </button>
        </div>
      </div>
    </div>
  )
}
