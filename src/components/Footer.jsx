export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Organization Logos */}
        

        {/* Divider */}
        <div className="my-8 border-t border-slate-300"></div>

        {/* Footer Credits */}
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-slate-700 sm:flex-row sm:items-center sm:justify-between sm:px-6">
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