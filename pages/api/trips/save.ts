import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const trip = req.body

  console.log('Trip received:', trip)

  // Later: save to a database
  res.status(200).json({ success: true, saved: trip })
}
