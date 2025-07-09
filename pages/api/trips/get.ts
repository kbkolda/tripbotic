import type { NextApiRequest, NextApiResponse } from 'next'

let mockTrips: any[] = [] // Same array used in save.ts (simulate DB)

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json({ trips: mockTrips })
  } else {
    res.status(405).json({ message: 'Method Not Allowed' })
  }
}
