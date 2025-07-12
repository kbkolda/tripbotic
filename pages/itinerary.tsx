import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import type { TripData, DayPlan } from '../types'
import { Dialog } from '@headlessui/react'
import { format } from 'date-fns'

export default function ItineraryPage() {
  const [tripData, setTripData] = useState<TripData | null>(null)
  const [itinerary, setItinerary] = useState<DayPlan[]>([])
  const [isPremium, setIsPremium] = useState<boolean>(false)

  const [editModal, setEditModal] = useState({ open: false, dayIndex: 0, activityIndex: 0 })
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '', cost: '' })

  useEffect(() => {
    const stored = localStorage.getItem('savedItinerary')
    const parsed = stored ? JSON.parse(stored) : null
    console.log('🧳 Loaded itinerary from localStorage:', parsed)
    const saved = localStorage.getItem('tripData') ?? ''
    console.log("🔍 loaded tripData", saved)
    const premiumStatus = localStorage.getItem('isPremium') === 'true'
    setIsPremium(premiumStatus)
    if (saved) {
      const parsed = JSON.parse(saved)
      setTripData(parsed)
      console.log('📦 Loaded tripData:', parsed)

      const storedItinerary = localStorage.getItem('savedItinerary')
      const parsedItinerary = storedItinerary ? JSON.parse(storedItinerary) : []
      console.log("📅 Parsed itinerary from localStorage:", parsedItinerary)
      setItinerary(parsedItinerary)
      console.log('🗓 Final itinerary set:', parsedItinerary)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('savedItinerary', JSON.stringify(itinerary))
  }, [itinerary])

  const handleRemove = (dayIndex: number, activityIndex: number) => {
    const updated = [...itinerary]
    updated[dayIndex].activities.splice(activityIndex, 1)
    setItinerary(updated)
  }

  const handleEdit = (dayIndex: number, activityIndex: number) => {
    const current = itinerary[dayIndex].activities[activityIndex]
    setEditForm({
      title: current.title,
      description: current.description,
      category: current.category,
      cost: current.estimated_cost.toString(),
    })
    setEditModal({ open: true, dayIndex, activityIndex })
  }

  const submitEdit = () => {
    const { title, description, category, cost } = editForm
    const updated = [...itinerary]
    if (editModal.activityIndex === -1) {
      updated[editModal.dayIndex].activities.push({
        title,
        description,
        category,
        estimated_cost: parseFloat(cost),
      })
    } else {
      updated[editModal.dayIndex].activities[editModal.activityIndex] = {
        title,
        description,
        category,
        estimated_cost: parseFloat(cost),
      }
    }
    setItinerary(updated)
    setEditModal({ ...editModal, open: false })
  }

  const handleAddActivity = (dayIndex: number) => {
    setEditForm({ title: '', description: '', category: '', cost: '' })
    setEditModal({ open: true, dayIndex, activityIndex: -1 })
  }

  const moveDay = (index: number, direction: number) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= itinerary.length) return
    const reordered = [...itinerary]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(newIndex, 0, moved)
    setItinerary(reordered)
  }

  const handleExportPDF = () => {
    if (isPremium) {
      alert('Exporting to PDF... (implementation pending)')
    } else {
      alert('Exporting to PDF is available for premium users only.')
    }
  }

  const totalCost = itinerary.flatMap(d => d.activities).reduce((sum, act) => sum + act.estimated_cost, 0)

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'MMM d, yyyy')
    } catch {
      return date
    }
  }

  if (!tripData) return <div className="p-6">Loading trip details...</div>

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h1
          contentEditable
          suppressContentEditableWarning
          className="text-2xl font-bold mb-4"
        >
          {tripData.destinations} · {formatDate(tripData.dates?.start)} – {formatDate(tripData.dates?.end)} · Budget: {tripData.budget}
        </h1>

        {itinerary.map((day, dayIndex) => (
          <div key={dayIndex} className="mb-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {day.city} - {formatDate(day.date)}
              </h2>
              <div className="space-x-2">
                <button
                  className="text-sm text-gray-600 hover:underline"
                  onClick={() => moveDay(dayIndex, -1)}
                >
                  ↑ Move Up
                </button>
                <button
                  className="text-sm text-gray-600 hover:underline"
                  onClick={() => moveDay(dayIndex, 1)}
                >
                  ↓ Move Down
                </button>
              </div>
            </div>
            {day.activities.map((act, i) => (
              <div
                key={i}
                className="bg-white shadow p-4 mb-3 rounded-lg border"
              >
                <div className="flex justify-between items-center">
                  <strong>{act.title}</strong>
                  {act.category && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                      {act.rank ? `${act.rank}` : act.category}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700">{act.description}</p>
                {act.website && (
                  <a
                    href={act.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm underline"
                  >
                    Visit Website
                  </a>
                )}
                <div className="text-sm text-gray-500 mt-1">
                  Estimated Cost: ${act.estimated_cost}
                </div>
                <div className="mt-2 flex gap-3">
                  <button
                    className="text-blue-600 hover:underline text-sm"
                    onClick={() => handleEdit(dayIndex, i)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:underline text-sm"
                    onClick={() => handleRemove(dayIndex, i)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => handleAddActivity(dayIndex)}
              className="text-sm text-green-600 mt-1 hover:underline"
            >
              + Add Activity
            </button>
          </div>
        ))}

        {tripData.costSummary && (
          <div className="mt-10 border-t pt-6 text-sm text-gray-700">
            <h3 className="text-lg font-semibold mb-2">Estimated Trip Costs</h3>
            <ul className="space-y-1">
              <li>Flights: ${tripData.costSummary.flights}</li>
              <li>Accommodations: ${tripData.costSummary.accommodations}</li>
              <li>Activities: ${tripData.costSummary.activities}</li>
              <li>Food: ${tripData.costSummary.food}</li>
            </ul>
            <p className="mt-2 font-bold">Total Estimated Cost: ${tripData.costSummary.total}</p>
          </div>
        )}

        <div className="mt-10">
          <button
            onClick={handleExportPDF}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Export to PDF {isPremium ? '' : '(Premium Only)'}
          </button>
        </div>
      </div>

      <Dialog open={editModal.open} onClose={() => setEditModal({ ...editModal, open: false })} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Panel className="bg-white shadow-xl rounded-lg max-w-md w-full p-6">
            <Dialog.Title className="text-lg font-bold mb-4">{editModal.activityIndex === -1 ? 'Add Activity' : 'Edit Activity'}</Dialog.Title>

            <input
              placeholder="Title"
              value={editForm.title}
              onChange={e => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full border mb-2 p-2 rounded"
            />
            <textarea
              placeholder="Description"
              value={editForm.description}
              onChange={e => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full border mb-2 p-2 rounded"
            />
            <input
              placeholder="Category"
              value={editForm.category}
              onChange={e => setEditForm({ ...editForm, category: e.target.value })}
              className="w-full border mb-2 p-2 rounded"
            />
            <input
              type="number"
              placeholder="Estimated Cost"
              value={editForm.cost}
              onChange={e => setEditForm({ ...editForm, cost: e.target.value })}
              className="w-full border mb-4 p-2 rounded"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditModal({ ...editModal, open: false })}
                className="text-sm text-gray-600"
              >Cancel</button>
              <button
                onClick={submitEdit}
                className="bg-blue-600 text-white px-4 py-1 rounded"
              >Save</button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  )
}
