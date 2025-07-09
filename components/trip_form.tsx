import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { addDays } from 'date-fns'
import { Utensils, TreePine, Landmark, BookText, PartyPopper, ShoppingBag, Sun, Mountain, Paintbrush, Cpu, CalendarHeart } from 'lucide-react'
import Navbar from '../components/Navbar'

const baseInterestOptions = [
  { label: 'Food', icon: Utensils },
  { label: 'Nature', icon: TreePine },
  { label: 'Museums', icon: Landmark },
  { label: 'History', icon: BookText },
  { label: 'Nightlife', icon: PartyPopper },
]
const moreInterestOptions = [
  { label: 'Shopping', icon: ShoppingBag },
  { label: 'Beaches', icon: Sun },
  { label: 'Hiking', icon: Mountain },
  { label: 'Art', icon: Paintbrush },
  { label: 'Tech', icon: Cpu },
  { label: 'Local Events', icon: CalendarHeart },
]

export default function TripForm() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const [singleDestination, setSingleDestination] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [justSelected, setJustSelected] = useState(false)
  const [multiDestinations, setMultiDestinations] = useState<string[]>([''])
  const [startDate, setStartDate] = useState<Date | null>(new Date())
  const [endDate, setEndDate] = useState<Date | null>(addDays(new Date(), 7))
  const [roundTrip, setRoundTrip] = useState(true)
  const [budget, setBudget] = useState<'low' | 'medium' | 'high'>('medium')
  const [interests, setInterests] = useState<string[]>([])
  const [showMoreInterests, setShowMoreInterests] = useState(false)

  useEffect(() => {
    if (justSelected) {
      setJustSelected(false)
      return
    }

    if (searchQuery.length >= 2) {
      const token = 'pk.eyJ1IjoidHJpcGJvdGljIiwiYSI6ImNtY3RjM3UwNjAxazIya29laHZ5eWhmM3MifQ.3w-249srxkZbddJpqDv_Zg'
      const sessionToken = 'session-tripbotic-123'
      const url = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(searchQuery)}&language=en&session_token=${sessionToken}&limit=5&types=place&access_token=${token}`

      fetch(url, {
        headers: {
          'X-Request-ID': 'tripbotic-' + Date.now()
        }
      })
        .then(res => res.json())
        .then(data => {
          setSearchResults(data.suggestions || [])
        })
        .catch(err => {
          console.error('Mapbox API error:', err)
          setSearchResults([])
        })
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    )
  }

  const addDestination = () => {
    setMultiDestinations([...multiDestinations, ''])
  }

  const removeDestination = (index: number) => {
    setMultiDestinations(multiDestinations.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const destinations = isLoggedIn ? multiDestinations : [singleDestination]
    const tripPayload = {
      destinations,
      dates: {
        start: startDate?.toISOString().split('T')[0],
        end: endDate?.toISOString().split('T')[0],
      },
      interests,
      budget,
    }

    try {
      const res = await fetch('/api/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tripPayload),
      })

      const { tripData, itinerary } = await res.json()

      localStorage.setItem('tripData', JSON.stringify(tripData))
      localStorage.setItem('savedItinerary', JSON.stringify(itinerary))

      window.location.href = '/itinerary'
    } catch (err) {
      alert('Failed to generate itinerary. Try again later.')
      console.error(err)
    }
  }

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-xl p-8 max-w-md w-full"
        >
          <h1 className="text-xl font-bold mb-6">Plan Your Trip</h1>

          <label className="block text-sm font-medium mb-2">Destination</label>
          <input
            type="text"
            value={singleDestination || searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g. Paris"
            className="w-full border px-3 py-2 rounded mb-2"
          />
{searchResults.length > 0 && (
  <ul className="bg-white border rounded-md mb-4">
    {searchResults.map((result, i) => (
      <li
        key={i}
        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
        onClick={() => {
          setSingleDestination(result.name);
          setSearchQuery(result.name);
          setJustSelected(true);
          setSearchResults([]);
        }}
      >
        {result.name} <span className="text-xs text-gray-400">{result.place_formatted}</span>
      </li>
    ))}
  </ul>
)}

          <label className="block text-sm font-medium mb-2">Travel Dates</label>
          <div className="flex gap-2 mb-4">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="yyyy-MM-dd"
              className="w-full border px-3 py-2 rounded"
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              dateFormat="yyyy-MM-dd"
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <label className="flex items-center mb-4 text-sm font-medium">
            <input
              type="checkbox"
              checked={roundTrip}
              onChange={() => setRoundTrip(!roundTrip)}
              className="mr-2"
            />
            Round Trip
          </label>

          <label className="block text-sm font-medium mb-2">Budget Tier</label>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value as 'low' | 'medium' | 'high')}
            className="w-full border px-3 py-2 rounded mb-4"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <label className="block text-sm font-medium mb-2">Interests</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {[...baseInterestOptions, ...(showMoreInterests ? moreInterestOptions : [])].map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => toggleInterest(label)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full border text-sm ${interests.includes(label) ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-800'}`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowMoreInterests(!showMoreInterests)}
            className="text-sm text-purple-600 underline mb-6"
          >
            {showMoreInterests ? 'Show fewer interests' : '+ More Interests'}
          </button>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
          >
            Generate Itinerary
          </button>
        </form>
      </div>
    </>
  )
}
