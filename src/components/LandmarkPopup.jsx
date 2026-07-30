export default function LandmarkPopup({ landmark, onNavigate }) {
  return (
    <div className="min-w-[220px] space-y-2 text-sm text-slate-700">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{landmark.id}. {landmark.name}</p>
          <p className="text-xs text-slate-500">{landmark.road}</p>
        </div>
        <span className="rounded-full bg-teal-50 px-2 py-1 text-[11px] font-semibold text-teal-700">{landmark.category}</span>
      </div>
      <p className="text-xs text-slate-600">{landmark.description}</p>
      <img src={landmark.image} alt={landmark.name} className="h-24 w-full rounded-xl object-cover" />
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onNavigate(landmark)} className="rounded-full bg-teal-600 px-3 py-2 text-xs font-semibold text-white">Navigate</button>
        <a href={`https://www.openstreetmap.org/?mlat=${landmark.latitude}&mlon=${landmark.longitude}#map=18/${landmark.latitude}/${landmark.longitude}`} target="_blank" rel="noreferrer" className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">Open in OpenStreetMap</a>
      </div>
    </div>
  )
}
