export type Activity = {
  title: string
  description: string
  category: string
  estimated_cost: number
  website?: string
  fsq_id?: string
  rank?: number
}

export type DayPlan = {
  date: string
  city: string
  activities: Activity[]
}

export type TripData = {
  destinations: string
  dates: {
    start: string
    end: string
  }
  roundTrip?: string
  budget: 'low' | 'medium' | 'high'
  interests: string[]
  costSummary?: {
    flights: number
    accommodations: number
    activities: number
    food: number
    total: number
  }
}
