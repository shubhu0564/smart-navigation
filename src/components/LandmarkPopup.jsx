export default function LandmarkPopup({ landmark, onClose }) {
  const openGoogleMaps = () => {
    if (!landmark) return
    const url = `https://www.google.com/maps/search/?api=1&query=${landmark.latitude},${landmark.longitude}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {landmark?.name ? (
              <h2 className="text-xl font-bold text-slate-900">{landmark.name}</h2>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100"
          >
            ×
          </button>
        </div>

        <div className="mt-6 flex w-full justify-center">
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
