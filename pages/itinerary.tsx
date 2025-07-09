import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import type { TripData, DayPlan } from '../types'

const mockItinerary: DayPlan[] = [
  {
    date: '2025-09-14',
    city: 'Rome',
    activities: [
      {
        title: 'Colosseum Tour',
        description: 'Guided tour of Rome’s most iconic ruin',
        category: 'history',
        estimated_cost: 25,
      },
      {
        title: 'Testaccio Market',
        description: 'Sample local food at Rome’s historic market',
        category: 'food',
        estimated_cost: 15,
      },
    ],
  },
  {
    date: '2025-09-15',
    city: 'Rome',
    activities: [
      {
        title: 'Vatican Museums',
        description: 'Explore the Sistine Chapel and museum complex',
        category: 'museums',
        estimated_cost: 30,
      },
    ],
  },
]

export default function ItineraryPage() {
  const [tripData, setTripData] = useState<TripData | null>(null)
  const [itinerary, setItinerary] = useState<DayPlan[]>([])
  const [isPremium, setIsPremium] = useState<boolean>(false)

  useEffect(() => {
    const saved = localStorage.getItem('tripData') ?? ''
    const premiumStatus = localStorage.getItem('isPremium') === 'true'
    setIsPremium(premiumStatus)
    if (saved) {
      setTripData(JSON.parse(saved))
      const savedItinerary = localStorage.getItem('savedItinerary') ?? ''
      setItinerary(savedItinerary ? JSON.parse(savedItinerary) : mockItinerary)
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
    const newTitle = prompt('Edit activity title:', current.title)
    const newDescription = prompt('Edit description:', current.description)
    const newCategory = prompt('Edit category:', current.category)
    const newCostStr = prompt('Edit estimated cost:', current.estimated_cost.toString()) ?? ''
    const newCost = parseFloat(newCostStr)
    if (!newTitle || !newDescription || !newCategory || isNaN(newCost)) return

    const updated = [...itinerary]
    updated[dayIndex].activities[activityIndex] = {
      title: newTitle,
      description: newDescription,
      category: newCategory,
      estimated_cost: newCost,
    }
    setItinerary(updated)
  }

  const handleAddActivity = (dayIndex: number) => {
    const title = prompt('Enter activity title:')
    const description = prompt('Enter description:')
    const category = prompt('Enter category:')
    const costStr = prompt('Enter estimated cost:') ?? ''
    const cost = parseFloat(costStr)
    if (!title || !description || !category || isNaN(cost)) return

    const updated = [...itinerary]
    updated[dayIndex].activities.push({
      title,
      description,
      category,
      estimated_cost: cost,
    })
    setItinerary(updated)
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

  if (!tripData) return <div className="p-6">Loading trip details...</div>

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Your Trip Itinerary</h1>
        <p className="mb-6 text-gray-600">
          {tripData.destinations.join(', ')} · {tripData.dates.start} → {tripData.dates.end} · Budget: {tripData.budget}
        </p>

        {itinerary.map((day, dayIndex) => (
          <div key={dayIndex} className="mb-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {day.city} - {day.date}
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
                <strong>{act.title}</strong>
                <p className="text-sm text-gray-700">{act.description}</p>
                <div className="text-sm text-gray-500">
                  Category: {act.category} · Estimated Cost: ${act.estimated_cost}
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

        <div className="mt-10">
          <button
            onClick={handleExportPDF}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Export to PDF {isPremium ? '' : '(Premium Only)'}
          </button>
        </div>
      </div>
    </>
  )
}
