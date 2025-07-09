import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function Navbar({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [internalLoggedIn, setInternalLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const session = localStorage.getItem('user')
    try {
      const user = JSON.parse(session || '{}')
      if (user?.id) setInternalLoggedIn(true)
    } catch (err) {
      setInternalLoggedIn(false)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    setInternalLoggedIn(false)
    router.push('/')
  }

  const loggedIn = isLoggedIn || internalLoggedIn

  return (
    <nav className="bg-gray-100 py-2 border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
        <a href="/" className="text-lg font-semibold text-blue-700">Tripbotic</a>
        <div className="space-x-4">
          {loggedIn ? (
            <>
              <a href="/dashboard" className="text-sm text-blue-600 hover:underline">Dashboard</a>
              <a href="/premium" className="text-sm text-blue-600 hover:underline">Premium Settings</a>
              <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">Logout</button>
            </>
          ) : (
            <>
              <a href="/how-it-works" className="text-sm text-blue-600 hover:underline">How it Works</a>
              <a href="/login" className="text-sm text-blue-600 hover:underline">Login / Sign Up</a>
              <a href="/premium" className="text-sm text-blue-600 hover:underline">Premium Settings</a>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
