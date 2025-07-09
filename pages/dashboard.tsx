import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import type { TripData } from '../types'
import { useRouter } from 'next/router'

export default function DashboardPage() {
  const [trips, setTrips] = useState<TripData[]>([])
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('savedTrips')
    if (saved) {
      setTrips(JSON.parse(saved))
    }
  }, [])

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Saved Trips</h1>
        {trips.length === 0 ? (
          <p className="text-gray-600">No saved trips yet.</p>
        ) : (
          trips.map((trip, i) => (
            <div
              key={i}
              className="border rounded p-4 mb-3 bg-white shadow cursor-pointer"
              onClick={() => router.push('/itinerary')}
            >
              <strong>{trip.destinations}</strong>
              <p className="text-sm text-gray-500">
                {trip.dates} · {trip.budget}
              </p>
            </div>
          ))
        )}
      </div>
    </>
  )
}
