// /pages/api/plan-trip.ts

import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { destinations, dates, interests, budget } = req.body

  if (!destinations || !dates || !interests) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  const itinerary = [
    {
      date: dates.start,
      city: destinations[0],
      activities: [
        {
          title: 'Visit famous landmark',
          description: 'Check out the most iconic place in town.',
          category: 'Sightseeing',
          estimated_cost: 30,
        },
      ],
    },
  ]

  return res.status(200).json({
    tripData: { destinations, dates, budget },
    itinerary,
  })
}