import Navbar from "../components/Navbar"

export default function HowItWorks() {
  return (
    <>
      <Navbar isLoggedIn={false} />
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">How It Works</h1>
          <ol className="list-decimal space-y-6 ml-6 text-gray-700">
            <li>
              <strong>Enter Your Preferences:</strong> Choose your destination, travel dates, budget tier, and interests.
            </li>
            <li>
              <strong>Generate Your Trip Plan:</strong> Our AI generates a day-by-day itinerary for you based on your selections.
            </li>
            <li>
              <strong>Customize As Needed:</strong> You can edit, rearrange, or remove parts of your itinerary.
            </li>
            <li>
              <strong>Create an Account:</strong> Save your trips, enable multi-destination planning, and unlock premium features.
            </li>
            <li>
              <strong>Export and Share:</strong> Premium users can export their itinerary to PDF or share with friends.
            </li>
          </ol>
        </div>
      </div>
    </>
  )
}