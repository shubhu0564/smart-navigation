import { motion } from 'framer-motion'
import SearchBar from '../components/SearchBar'
import MapContainer from '../components/MapContainer'
import CategoryGrid from '../components/CategoryGrid'
import MapStatusBar from '../components/MapStatusBar'
import { useNavigation } from '../hooks/useNavigation'
import { getText } from '../utils/helpers'

export default function HomePage() {
  const { language, darkMode } = useNavigation()

  return (
    <div className="space-y-3 sm:space-y-6">

      {/* HERO SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full rounded-[18px] border px-5 py-4 shadow-sm
          sm:rounded-[32px] sm:p-8
          ${
            darkMode
              ? 'border-slate-800 bg-slate-900/80'
              : 'border-slate-200 bg-gradient-to-br from-sky-600 via-teal-600 to-blue-600 text-white'
          }`}
      >
        <div className="max-w-5xl space-y-1 sm:space-y-4">

          <h1 className="text-[26px] font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
            {getText(
              {
                en: "LET'S EXPLORE",
                mr: 'चला शोधूया',
              },
              language
            )}
          </h1>

          <p className="text-[16px] font-bold leading-tight text-white sm:text-2xl md:text-3xl">
            {getText(
              {
                en: 'Gulmohar JVPD Scheme Area',
                mr: 'गुलमोहर JVPD योजना क्षेत्र',
              },
              language
            )}
          </p>

        </div>
      </motion.section>

      {/* MAP / SEARCH SECTION */}
      <section
        id="landmark-map-section"
        className="w-full space-y-3 sm:space-y-6"
      >

        {/* SEARCH */}
        <SearchBar />

        {/* CATEGORY GRID */}
        <div className="rounded-[20px] border border-slate-200 bg-white p-3 shadow-sm sm:rounded-[32px] sm:p-6">
          <CategoryGrid />
        </div>

        {/* MAP */}
        <MapContainer />

        {/* MAP STATUS */}
        <MapStatusBar />

        {/* AREA INFORMATION */}
        <div className="rounded-[20px] border border-slate-200 bg-white p-3 shadow-sm sm:rounded-[28px] sm:p-5 md:p-6">
          <div className="space-y-3 text-[13px] leading-6 text-slate-700 sm:space-y-4 sm:text-[15px] sm:leading-7 md:text-[16px] md:leading-8">

            <p>
              In 1950, the Government of Bombay acquired over 220 acres along
              the Irla Nullah to develop a planned residential neighbourhood.
              The project was executed by the Bombay Housing Board (BHB),
              later known as MHADA, making it one of Mumbai&apos;s earliest
              planned housing developments.
            </p>

            <p>
              The master plan created two distinct precincts: JVPD with
              low-density bungalow plots, and Gulmohar Road with apartments
              for middle-income families. Since becoming part of MHADA in
              1977, the area has remained a landmark of Mumbai&apos;s planned
              urban development.
            </p>

          </div>
        </div>
      </section>

      {/* GUIDED BY / PROJECT / SUPPORT / DESIGN */}
      <section className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto w-full max-w-[1440px] space-y-12 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">

          {/* GUIDED BY */}
          <div className="space-y-5 text-center">

            <h2 className="text-3xl font-bold uppercase tracking-[0.3em] text-slate-900 sm:text-4xl">
              GUIDED BY
            </h2>

            <div className="mx-auto h-[180px] w-[180px] overflow-hidden rounded-[16px] shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:h-[220px] sm:w-[220px]">
              <img
                src="/ameet-satam.jpg"
                alt="Shri. Ameet Satam Ji"
                className="h-full w-full object-cover object-[center_top]"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-[28px] font-semibold leading-tight text-slate-900 sm:text-[34px]">
                Shri. Ameet Satam Ji
              </h3>

              <p className="text-[18px] font-medium leading-tight text-slate-700 sm:text-[22px]">
                Hon&apos;ble MLA &
              </p>

              <p className="text-[18px] leading-tight text-slate-700 sm:text-[22px]">
                President of Mumbai BJP
              </p>
            </div>

          </div>

          <div className="border-t border-slate-200" />

          {/* PROJECT INITIATED BY */}
          <div className="space-y-6 text-center">

            <h2 className="text-3xl font-bold uppercase tracking-[0.3em] text-slate-900 sm:text-4xl">
              PROJECT INITIATED BY
            </h2>

            <div className="mx-auto h-[180px] w-[180px] overflow-hidden rounded-[16px] shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:h-[220px] sm:w-[220px]">
              <img
                src="/deepak-kotekar.jpg"
                alt="Shri. Deepak Kotekar Ji"
                className="h-full w-full object-cover object-[center_12%]"
              />
            </div>

            <div className="space-y-2">

              <h3 className="text-[28px] font-semibold leading-tight text-slate-900 sm:text-[34px]">
                Shri. Deepak Kotekar Ji
              </h3>

              <p className="text-[18px] font-medium leading-tight text-slate-700 sm:text-[22px]">
                Hon&apos;ble Corporator
              </p>

            </div>

          </div>

          <div className="border-t border-slate-200" />

          {/* SUPPORTED BY */}
          <div className="space-y-6 text-center">

            <h2 className="text-3xl font-bold uppercase tracking-[0.3em] text-slate-900 sm:text-4xl">
              SUPPORTED BY
            </h2>

            <div className="grid grid-cols-2 gap-4 sm:gap-8">

              {/* GASWG */}
              <div className="flex flex-col items-center gap-3 px-2 text-center">

                <img
                  src="/gulmohar%20logo_png.png"
                  alt="GASWG Logo"
                  className="h-[80px] w-[80px] object-contain transition duration-200 hover:scale-105 sm:h-24 sm:w-24"
                />

                <div className="space-y-2">

                  <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
                    GASWG
                  </h3>

                  <p className="text-sm leading-6 text-slate-700">
                    Gulmohar Area Societies Welfare Group
                  </p>

                </div>

              </div>

              {/* ALM */}
              <div className="flex flex-col items-center gap-3 px-2 text-center">

                <img
                  src="/ALM.jpeg"
                  alt="Gulmohar ALM-67"
                  className="h-[80px] w-[80px] object-contain transition duration-200 hover:scale-105 sm:h-24 sm:w-24"
                />

                <div className="space-y-2">

                  <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
                    Gulmohar ALM-67
                  </h3>

                  <p className="text-sm leading-6 text-slate-700">
                    Strong Community, Better Neighbourhood
                  </p>

                </div>

              </div>

            </div>

          </div>

          <div className="border-t border-slate-200" />

          {/* DESIGN BY */}
          <div className="space-y-6 text-center">

            <h2 className="text-3xl font-bold uppercase tracking-[0.3em] text-slate-900 sm:text-4xl">
              DESIGN BY
            </h2>

            <a
              href="https://sapthakalaa.co.in"
              target="_blank"
              rel="noopener noreferrer"
              className="mx-auto flex h-[120px] w-[120px] items-center justify-center rounded-full bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
            >
              <img
                src="/LOGO%20DESIGN%20for%20print_png.png"
                alt="Sapthakalaa Environmental Design, Planning and Management"
                className="h-32 w-auto object-contain"
              />
            </a>

            <div className="space-y-2">

              <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
                Sapthakalaa
              </h3>

              <p className="text-[18px] leading-[1.6] text-slate-700 sm:text-[16px]">
                Environmental Design,
                <br />
                Planning and Management
              </p>

            </div>

          </div>

        </div>
      </section>

    </div>
  )
}