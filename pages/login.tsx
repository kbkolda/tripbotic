import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setAuthenticated(true)
    }
  }, [])

  const handleLogin = () => {
    if (email.includes('@')) {
      const user = { id: email.split('@')[0], email }
      localStorage.setItem('user', JSON.stringify(user))
      setAuthenticated(true)
      router.push('/dashboard')
    } else {
      alert('Enter a valid email')
    }
  }

  return (
    <>
      <Navbar />
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        {authenticated ? (
          <p>You're already logged in.</p>
        ) : (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 w-full mb-4"
            />
            <button
              onClick={handleLogin}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Login
            </button>
          </>
        )}
      </div>
    </>
  )
}
