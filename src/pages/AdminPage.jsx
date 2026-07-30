import { useState } from 'react'
import { landmarks, qrLocations } from '../data/navigationData'

export default function AdminPage() {
  const [items] = useState(landmarks)
  const [qrItems] = useState(qrLocations)

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Admin dashboard</h2>
        <p className="mt-2 text-sm text-slate-500">Manage landmarks, categories, and QR-linked locations from one place.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Landmarks</h3>
            <button className="rounded-full bg-teal-600 px-3 py-2 text-sm font-semibold text-white">Add landmark</button>
          </div>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-[20px] border border-slate-200 p-3">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.address}</p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-full bg-slate-100 px-3 py-2 text-sm">Edit</button>
                  <button className="rounded-full bg-rose-100 px-3 py-2 text-sm text-rose-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">QR locations</h3>
            <button className="rounded-full bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Upload QR map</button>
          </div>
          <div className="space-y-3">
            {qrItems.map((item) => (
              <div key={item.id} className="rounded-[20px] border border-slate-200 p-3">
                <p className="font-semibold">{item.label}</p>
                <p className="text-sm text-slate-500">{item.location}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
