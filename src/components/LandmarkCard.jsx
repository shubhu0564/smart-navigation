import { motion } from 'framer-motion'
import { useNavigation } from '../hooks/useNavigation'
import kishoreKumarBagh from '../assets/landmarks/kishore-kumar-bagh.svg'
import kaifiAzmiPark from '../assets/landmarks/kaifi-azmi-park.svg'
import kamlaRaheja from '../assets/landmarks/kamla-raheja.svg'
import vrajlalParekh from '../assets/landmarks/vrajlal-parekh.svg'
import manojKumarGarden from '../assets/landmarks/manoj-kumar-garden.svg'
import sbAarya from '../assets/landmarks/sb-aarya.svg'
import lokmanyaTilakUdyan from '../assets/landmarks/lokmanya-tilak-udyan.svg'
import ecoleMondiale from '../assets/landmarks/ecole-mondiale.svg'
import gujaratiBhavan from '../assets/landmarks/gujarati-bhavan.svg'
import goaBhavan from '../assets/landmarks/goa-bhavan.svg'
import cdac from '../assets/landmarks/cdac.svg'
import jhuhuClub from '../assets/landmarks/juhu-club.svg'
import kalimataTemple from '../assets/landmarks/kalimata-temple.svg'
import manoranjanPark from '../assets/landmarks/manoranjan-park.svg'
import placeholder from '../assets/landmarks/placeholder.svg'

const imageMap = {
  1: kishoreKumarBagh,
  2: kaifiAzmiPark,
  3: kamlaRaheja,
  4: vrajlalParekh,
  5: manojKumarGarden,
  6: sbAarya,
  7: lokmanyaTilakUdyan,
  8: ecoleMondiale,
  9: gujaratiBhavan,
  10: goaBhavan,
  11: cdac,
  12: jhuhuClub,
  13: kalimataTemple,
  14: manoranjanPark,
}

export default function LandmarkCard({ landmark }) {
  const { setSelectedLandmark, setToast, selectedLandmark } = useNavigation()
  const isActive = selectedLandmark?.id === landmark.id
  const imageSrc = imageMap[landmark.id] ?? placeholder

  const handleSelect = () => {
    setSelectedLandmark(landmark)
    setToast({ en: `Focused on ${landmark.name}`, mr: `${landmark.name}कडे केंद्रित केले` })
    document.getElementById('landmark-map-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <motion.button
      type="button"
      whileHover={{ y: -4, scale: 1.02, boxShadow: '0 16px 32px rgba(15, 23, 42, 0.16)' }}
      whileTap={{ scale: 0.98 }}
      onClick={handleSelect}
      className={`group w-full overflow-hidden rounded-[24px] border bg-white text-left shadow-sm transition-all ${isActive ? 'border-teal-500 shadow-md ring-2 ring-teal-500/15' : 'border-slate-200 hover:border-teal-400'}`}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img src={imageSrc} alt={landmark.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/15 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 text-left text-white">
          <h3 className="text-base font-semibold leading-5">{landmark.name}</h3>
          <p className="mt-1 text-sm text-slate-200">{landmark.road}</p>
        </div>
      </div>
    </motion.button>
  )
}
