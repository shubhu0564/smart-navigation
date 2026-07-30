import MapContainer from '../components/MapContainer'
import DirectionsPanel from '../components/DirectionsPanel'
import NearbyPlaces from '../components/NearbyPlaces'
import SearchBar from '../components/SearchBar'
import CategoryGrid from '../components/CategoryGrid'

export default function NavigationPage() {
  return (
    <div className="space-y-6">
      <SearchBar />
      <CategoryGrid />
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <MapContainer />
        <DirectionsPanel />
      </div>
      <NearbyPlaces />
    </div>
  )
}
