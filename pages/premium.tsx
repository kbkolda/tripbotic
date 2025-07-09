import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'

export default function PremiumTogglePage() {
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('isPremium') === 'true'
    setIsPremium(stored)
  }, [])

  const togglePremium = () => {
    const updated = !isPremium
    setIsPremium(updated)
    localStorage.setItem('isPremium', updated.toString())
    alert(`Premium mode ${updated ? 'enabled' : 'disabled'}.`)
  }

  return (
    <>
      <Navbar />
      <div className="max-w-md mx-auto p-6 mt-10 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Toggle Premium Access</h1>
        <p className="mb-6">
          Current status: <strong>{isPremium ? 'Premium User' : 'Free User'}</strong>
        </p>
        <button
          onClick={togglePremium}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isPremium ? 'Disable' : 'Enable'} Premium
        </button>
      </div>
    </>
  )
}
