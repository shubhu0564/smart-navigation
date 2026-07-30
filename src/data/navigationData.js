export const categories = [
  { id: 'parks', label: { en: 'Parks', mr: 'बागा' }, icon: 'TreePine' },
  { id: 'bus', label: { en: 'Bus Stops', mr: 'बस थांबे' }, icon: 'Bus' },
  { id: 'schools', label: { en: 'Schools', mr: 'शाळा' }, icon: 'School' },
  { id: 'hospitals', label: { en: 'Hospitals', mr: 'रुग्णालये' }, icon: 'HeartPulse' },
  { id: 'hotels', label: { en: 'Hotels', mr: 'हॉटेल' }, icon: 'Hotel' },
  { id: 'restaurants', label: { en: 'Restaurants', mr: 'रेस्टॉरंट' }, icon: 'UtensilsCrossed' },
  { id: 'parking', label: { en: 'Parking', mr: 'पार्किंग' }, icon: 'Car' },
  { id: 'toilets', label: { en: 'Public Toilets', mr: 'सार्वजनिक शौचालये' }, icon: 'Bath' },
  { id: 'govt', label: { en: 'Government Offices', mr: 'सरकारी कार्यालये' }, icon: 'Landmark' },
  { id: 'tourist', label: { en: 'Tourist Places', mr: 'पर्यटक स्थळ' }, icon: 'MapPinned' },
]

export const landmarks = [
  {
    id: 1,
    name: 'BMC Mumbai Garden Plaza',
    category: 'tourist',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    distanceKm: 0.8,
    lat: 19.076,
    lng: 72.8777,
    description: {
      en: 'A vibrant civic landmark with shaded walkways and smart lighting.',
      mr: 'शिवाय प्रकाशयोजना आणि छायांकित चालण्याच्या मार्गांसह एक तेजस्वी नागरी landmark.',
    },
    address: 'Riverside Avenue, Pune',
    rating: 4.8,
    tags: ['Accessible', 'Family Friendly'],
    steps: [
      { en: 'Head toward the east gateway.', mr: 'पूर्व दाराकडे जा.' },
      { en: 'Follow the shaded promenade.', mr: 'छायांकित promenades चे अनुसरण करा.' },
      { en: 'Take the lift to the central plaza.', mr: 'केंद्रीय प्लाझासाठी लिफ्ट घ्या.' },
    ],
  },
  {
    id: 2,
    name: 'Harbor Transit Hub',
    category: 'bus',
    image: 'https://images.unsplash.com/photo-1519824224685-6b8f6d8f4b8e?auto=format&fit=crop&w=900&q=80',
    distanceKm: 1.2,
    lat: 19.0786,
    lng: 72.8744,
    description: {
      en: 'Real-time transit guidance with digital seating and navigation support.',
      mr: 'रिअल-टाइम ट्रान्झिट मार्गदर्शन, डिजिटल आसन आणि नेव्हिगेशन समर्थन.',
    },
    address: 'Transit Square, Pune',
    rating: 4.5,
    tags: ['Transit', 'Smart Displays'],
    steps: [
      { en: 'Use the pedestrian bridge to the platform.', mr: 'प्लॅटफॉर्मपर्यंत पदचारी पूल वापरा.' },
      { en: 'Follow the blue arrows to the smart kiosk.', mr: 'स्मार्ट किओस्ककडे निळ्या बाणांचे अनुसरण करा.' },
    ],
  },
  {
    id: 3,
    name: 'Wellness Care Center',
    category: 'hospitals',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80',
    distanceKm: 1.7,
    lat: 19.0742,
    lng: 72.8832,
    description: {
      en: 'A modern medical campus with wheelchair-friendly routes and emergency bays.',
      mr: 'व्हीलचेयर-फ्रेंडली रूट्स आणि आपत्कालीन बेकरीसह आधुनिक वैद्यकीय कॅम्पस.',
    },
    address: 'Medical Row, Pune',
    rating: 4.9,
    tags: ['Emergency', 'Accessible'],
    steps: [
      { en: 'Enter through the east ambulance lane.', mr: 'पूर्वी आपत्कालीन लेनद्वारे प्रवेश करा.' },
      { en: 'Proceed to the reception desk.', mr: 'रिसेप्शन डेस्ककडे जा.' },
    ],
  },
  {
    id: 4,
    name: 'Cedar Bistro',
    category: 'restaurants',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80',
    distanceKm: 0.5,
    lat: 19.0753,
    lng: 72.8791,
    description: {
      en: 'A premium dining spot ideal for quick refreshment and landmark breaks.',
      mr: 'त्वरित ताजेकरण आणि landmark ब्रेकसाठी योग्य प्रीमियम डाइनिंग ठिकाण.',
    },
    address: 'Market Street, Pune',
    rating: 4.6,
    tags: ['Coffee', 'Quick Service'],
    steps: [
      { en: 'Walk past the fountain and turn left.', mr: 'फव्वारा ओलांडून डावीकडे वळा.' },
      { en: 'The restaurant is just beyond the arcade.', mr: 'रेस्टॉरंट आर्केडच्या मागे आहे.' },
    ],
  },
]

export const qrLocations = [
  { id: 'qr-1', label: 'North Gate', location: 'BMC Mumbai Garden Plaza' },
  { id: 'qr-2', label: 'Central Court', location: 'Harbor Transit Hub' },
  { id: 'qr-3', label: 'Wellness Arcade', location: 'Wellness Care Center' },
]
