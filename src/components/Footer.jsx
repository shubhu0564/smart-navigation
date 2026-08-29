export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="flex w-full flex-col items-center gap-2 text-center">

          {/* DESIGN CREDIT */}
          <p className="text-[14px] leading-6 text-slate-600 sm:text-[15px]">
            © Design by Sapthakalaa Environmental Design,
            <br className="sm:hidden" />
            Planning and Management
          </p>

          {/* DEVELOPER CREDIT */}
          <p className="text-[13px] text-slate-400 sm:text-[14px]">
            Developed by{' '}
            <span className="font-medium text-slate-500">
              Shubham Shinde
            </span>
          </p>

        </div>
      </div>
    </footer>
  )
}