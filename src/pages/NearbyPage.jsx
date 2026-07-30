import { landmarks } from '../data/landmarks'
import LandmarkCard from '../components/LandmarkCard'

export default function NearbyPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-semibold">Nearby places</h2>
        <p className="mt-2 text-sm text-slate-500">Browse the richest nearby destinations sorted for walkability and convenience.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {landmarks.map((landmark) => (
          <LandmarkCard key={landmark.id} landmark={landmark} />
        ))}
      </div>
    </div>
  )
}
