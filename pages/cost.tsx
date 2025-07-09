import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'

export default function CostBreakdownPage() {
  const [totals, setTotals] = useState({
    flights: 420,
    lodging: 300,
    transport: 90,
    food: 200,
    activities: 160,
  })

  const totalCost =
    totals.flights +
    totals.lodging +
    totals.transport +
    totals.food +
    totals.activities

  const costTier =
    totalCost < 700 ? 'LOW' : totalCost < 1300 ? 'MEDIUM' : 'HIGH'

  return (
    <>
      <Navbar />
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Trip Cost Breakdown</h1>

        {Object.entries(totals).map(([label, value]) => (
          <div key={label} className="mb-4">
            <label className="block font-semibold capitalize">
              {label} (${value})
            </label>
            <div className="w-full bg-gray-200 h-4 rounded">
              <div
                className="bg-green-500 h-4 rounded"
                style={{ width: `${Math.min((value / totalCost) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}

        <div className="mt-6 text-lg font-semibold">
          Total: ${totalCost} – Budget Tier: {costTier}
        </div>
      </div>
    </>
  )
}
