export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-2 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto flex w-full flex-col gap-3 px-0 py-2 text-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[16px] font-medium text-slate-700 text-center sm:text-left">
            © Design by Sapthakalaa Environmental Design, Planning and Management
          </p>
          <p className="text-[16px] font-semibold text-center sm:text-right">
            <span className="font-medium text-slate-700">Developed by </span>
            <span className="text-teal-700">Shubham Shinde</span>
          </p>
        </div>

      </div>
    </footer>
  );
}