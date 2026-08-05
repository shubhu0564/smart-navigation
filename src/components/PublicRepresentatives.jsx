export default function PublicRepresentatives() {
  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-teal-600">PUBLIC REPRESENTATIVES</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">MLA & Corporator</h2>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { title: 'MLA', subtitle: 'Member of Legislative Assembly' },
          { title: 'Corporator', subtitle: 'Local Ward Corporator' },
        ].map((card) => (
          <div key={card.title} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-3xl bg-slate-200" />
              <div>
                <p className="text-lg font-semibold text-slate-900">{card.title}</p>
                <p className="mt-1 text-sm text-slate-600">{card.subtitle}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Name</p>
              <p className="text-slate-500">To be updated</p>
              <p className="font-semibold text-slate-900">Designation</p>
              <p className="text-slate-500">To be updated</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
