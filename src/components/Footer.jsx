export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Organization Logos */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">

          {/* GASWG */}
          <div className="flex flex-col items-center text-center">
            <img
              src="/gulmohar%20logo_png.png"
              alt="GASWG Logo"
              className="h-32 w-auto object-contain"
            />

            <h3 className="mt-4 text-2xl font-bold tracking-wide">
              GASWG
            </h3>

            <p className="mt-2 text-base leading-6 text-slate-700">
              Gulmohar Area Societies
              <br />
              Welfare Group
            </p>
          </div>

          {/* ALM */}
          <div className="flex flex-col items-center text-center">
            <img
              src="/ALM.jpeg"
              alt="Gulmohar ALM-67"
              className="h-32 w-auto object-contain"
            />

            <h3 className="mt-4 text-2xl font-bold">
              Gulmohar ALM-67
            </h3>

            <p className="mt-2 text-base leading-6 text-slate-700">
              Strong Community
              <br />
              Better Neighbourhood
            </p>
          </div>

          {/* Sapthakalaa */}
          <div className="flex flex-col items-center text-center">
            <img
              src="/LOGO%20DESIGN%20for%20print_png.png"
              alt="Sapthakalaa EDPM"
              className="h-32 w-auto object-contain"
            />

            <h3 className="mt-4 text-2xl font-bold">
              Design by
            </h3>

            <p className="mt-2 text-base text-slate-700">
              Sapthakalaa EDPM
            </p>
          </div>

        </div>

        {/* Divider */}
        <div className="my-8 border-t border-slate-300"></div>

        {/* Footer Credits */}
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-slate-700 md:flex-row">

          {/* Left Side */}
          <div className="text-center md:text-left">
            <span className="font-medium">
              © Design by{" "}
            </span>
            <span className="font-semibold text-slate-900">
              Sapthakalaa Environmental Design, Planning and Management
            </span>
          </div>

          {/* Right Side */}
          <div className="text-center md:text-right">
            <span className="font-medium">
              Developed by{" "}
            </span>
            <span className="font-semibold text-teal-700">
              Shubham Shinde
            </span>
          </div>

        </div>

      </div>
    </footer>
  );
}