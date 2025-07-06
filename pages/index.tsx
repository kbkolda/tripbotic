import { useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/Navbar'

export default function TripForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    dates: '',
    roundTrip: 'yes',
    destinations: '',
    budget: 'medium',
    interests: [],
  })

  const interestsList = ['Museums', 'Food', 'Beaches', 'History', 'Nature']

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const toggleInterest = (interest) => {
    setForm((prev) => {
      const exists = prev.interests.includes(interest)
      const updated = exists
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest]
      return { ...prev, interests: updated }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    localStorage.setItem('tripData', JSON.stringify(form))
    router.push('/itinerary')
  }

  return (
    <>
      <Navbar />
      <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4">Plan Your Trip with Tripbotic</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold">Date Range</label>
            <input
              type="text"
              name="dates"
              placeholder="Sept 14 - Sept 18"
              value={form.dates}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block font-semibold">Round Trip?</label>
            <select
              name="roundTrip"
              value={form.roundTrip}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold">Destinations</label>
            <input
              type="text"
              name="destinations"
              placeholder="e.g., Rome, Florence"
              value={form.destinations}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block font-semibold">Budget Tier</label>
            <select
              name="budget"
              value={form.budget}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold">Interests</label>
            <div className="flex flex-wrap gap-2">
              {interestsList.map((interest) => (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1 rounded-full border ${
                    form.interests.includes(interest)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Generate Itinerary
          </button>
        </form>
      </div>
    </>
  )
}
