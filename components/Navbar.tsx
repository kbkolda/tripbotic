export default function Navbar() {
  return (
    <nav className="bg-gray-100 py-2 border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
        <a href="/" className="text-lg font-semibold text-blue-700">Tripbotic</a>
        <div className="space-x-4">
          <a href="/dashboard" className="text-sm text-blue-600 hover:underline">Dashboard</a>
          <a href="/login" className="text-sm text-blue-600 hover:underline">Login / Sign Up</a>
          <a href="/premium" className="text-sm text-blue-600 hover:underline">Premium Settings</a>
        </div>
      </div>
    </nav>
  )
}
