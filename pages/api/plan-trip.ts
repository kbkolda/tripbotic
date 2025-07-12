// File: pages/api/plan-trip.ts
import { format, eachDayOfInterval } from 'date-fns'
import { fsqSearch, fsqSearchByQuery, shuffle, categoryIdsByInterest, interestAliasMap } from '../../lib/plan-trip'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })

  const { destinations, dates, interests, budget, roundTrip = true } = req.body
  const tripDays = eachDayOfInterval({ start: new Date(dates.start), end: new Date(dates.end) })

  const allLabelInterests = Object.keys(categoryIdsByInterest)
  const itinerary = []
  let totalFlightCost = 0, totalAccommodationCost = 0, totalActivityCost = 0
  const perDayFoodCost = budget === 'high' ? 60 : budget === 'medium' ? 40 : 20

  const tripLength = tripDays.length
  const daysPerCity = Math.floor(tripLength / destinations.length)
  const remainderDays = tripLength % destinations.length

  let dayCounter = 0
  const hotelCache = {}
  const usedPoiIdsByCityInterest = {}
  const globallyUsedPoiIds = new Set()
  const poiCache = {}
  const selectedCategoriesByInterest = {}

  for (let i = 0; i < destinations.length; i++) {
    const city = destinations[i]
    const daysHere = daysPerCity + (i === destinations.length - 1 ? remainderDays : 0)

    if (!hotelCache[city]) {
      const hotels = await fsqSearchByQuery(city, 'hotel')
      hotelCache[city] = hotels.find(h => h.categories?.some(c => /hotel|resort/i.test(c.name))) || hotels.find(h => /hotel|inn|resort/i.test(h.name)) || hotels[0] || null
    }

    if (!poiCache[city]) poiCache[city] = {}
    if (!selectedCategoriesByInterest[city]) selectedCategoriesByInterest[city] = {}

    const interestSet = new Set(interests)
    while (interestSet.size < daysHere) {
      const extra = shuffle(allLabelInterests).find(label => !interestSet.has(label))
      if (extra) interestSet.add(extra)
    }

    const orderedInterests = Array.from(interestSet).slice(0, daysHere)

    for (const interest of orderedInterests as string[]) {
      const canonicalInterest = interestAliasMap[interest] || interest
      const categoryList = categoryIdsByInterest[canonicalInterest] || [13065]
      const selectedCategory = shuffle([...categoryList])[0]
      selectedCategoriesByInterest[city][canonicalInterest] = selectedCategory

      console.log(`🔁 Mapping interest "${interest}" to canonical "${canonicalInterest}" → category ${selectedCategory}`)

      if (!poiCache[city][selectedCategory]) {
        const results = await fsqSearch(city, selectedCategory)
        const mappedResults = results.map(p => ({
          fsq_id: p.fsq_id || p.id,
          name: p.name,
          location: p.location,
          categories: p.categories,
          website: p.website || ''
        }))
        poiCache[city][selectedCategory] = mappedResults
        console.log(`🔍 POIs for "${interest}" in ${city}:`, mappedResults.map(p => `${p.name} (fsq_id: ${p.fsq_id})`).slice(0, 5))
      }
    }

    console.log(`📆 Generating itinerary for ${city} from ${format(tripDays[dayCounter], 'yyyy-MM-dd')} to ${format(tripDays[dayCounter + daysHere - 1], 'yyyy-MM-dd')}`)
    console.log('🗓 Full tripDays:', tripDays.map(d => format(d, 'yyyy-MM-dd')))

    for (let j = 0; j < daysHere; j++) {
      const date = format(tripDays[dayCounter], 'yyyy-MM-dd')
      const activities = []

      if (i === 0 && j === 0) {
        activities.push({ title: `Flight: Home → ${city}`, category: 'Transport', estimated_cost: 200 })
        totalFlightCost += 200
      } else if (j === 0) {
        activities.push({ title: `Flight: ${destinations[i - 1]} → ${city}`, category: 'Transport', estimated_cost: 100 })
        totalFlightCost += 100
      }

      const hotel = hotelCache[city]
      if (hotel) {
        activities.push({
          title: hotel.name,
          category: 'Accommodation',
          description: hotel.location?.formatted_address,
          estimated_cost: budget === 'high' ? 150 : budget === 'medium' ? 100 : 60,
          website: hotel.website || ''
        })
        totalAccommodationCost += activities.at(-1).estimated_cost
      }

      const availableInterests = Array.from(interestSet).filter(interest => {
        const canonical = interestAliasMap[interest] || interest
        const cat = selectedCategoriesByInterest[city][canonical]
        const allPois = poiCache[city]?.[cat] || []
        const usedSet = usedPoiIdsByCityInterest[city]?.[canonical] || new Set()
        return allPois.some(p => p.fsq_id && !usedSet.has(p.fsq_id) && !globallyUsedPoiIds.has(p.fsq_id))
      })

      const interest = shuffle(availableInterests)[0] || orderedInterests[j]
      const canonicalInterest = interestAliasMap[interest] || interest
      const selectedCategory = selectedCategoriesByInterest[city][canonicalInterest]

      console.log(`🎯 Selected interest for ${date}:`, interest)
      console.log(`📤 Looking up POIs for [${city}] [${canonicalInterest}] → category ${selectedCategory}`)
      console.log(`📦 POI cache keys for ${city}:`, Object.keys(poiCache[city] || {}))
      console.log(`📦 POIs available for ${selectedCategory}:`, (poiCache[city]?.[selectedCategory] || []).map(p => `${p.name} (fsq_id: ${p.fsq_id})`))

      const cityCategoryPois = shuffle(poiCache[city]?.[selectedCategory] || [])
      console.log(`🔁 Shuffled POIs for category ${selectedCategory}:`, cityCategoryPois.map(p => `${p.name} (fsq_id: ${p.fsq_id})`))

      if (!usedPoiIdsByCityInterest[city]) usedPoiIdsByCityInterest[city] = {}
      if (!usedPoiIdsByCityInterest[city][canonicalInterest]) usedPoiIdsByCityInterest[city][canonicalInterest] = new Set()

      const usedSet = usedPoiIdsByCityInterest[city][canonicalInterest]
      console.log(`🧠 usedSet for ${city} ${canonicalInterest}:`, Array.from(usedSet))
      console.log(`🌐 globallyUsedPoiIds:`, Array.from(globallyUsedPoiIds))

      const filteredPois = cityCategoryPois.filter(p => {
        if (!p.fsq_id) {
          console.warn(`⚠️ Skipping ${p.name} — missing fsq_id`)
          return false
        }
        const isUsed = usedSet.has(p.fsq_id)
        const isGlobal = globallyUsedPoiIds.has(p.fsq_id)
        if (isUsed || isGlobal) {
          console.log(`🚫 Skipping ${p.name} (${p.fsq_id}) — usedSet: ${isUsed}, globally: ${isGlobal}`)
        }
        return !isUsed && !isGlobal
      })

      console.log(`🔎 Filtered POIs remaining for ${interest} on ${date}: ${filteredPois.length}`)
      if (filteredPois.length > 0) console.log('👀 Sample filtered POIs:', filteredPois.slice(0, 3).map(p => p.name))

      const selectedPoi = filteredPois[0]

      if (selectedPoi) {
        console.log(`📍 Selected POI: ${selectedPoi.name} → categories:`, selectedPoi.categories?.map(c => c.name).join(', ') || 'None')
        usedSet.add(selectedPoi.fsq_id)
        globallyUsedPoiIds.add(selectedPoi.fsq_id)
        activities.push({
          title: selectedPoi.name,
          category: interest,
          rank: `#${cityCategoryPois.indexOf(selectedPoi) + 1} in ${interest}`,
          description: selectedPoi.location?.formatted_address,
          estimated_cost: budget === 'high' ? 80 : budget === 'medium' ? 50 : 20,
          website: selectedPoi.website || ''
        })
        totalActivityCost += activities.at(-1).estimated_cost
      } else {
        console.warn(`⚠️ No POI found for ${interest} on ${date}, using fallback.`)
        activities.push({
          title: `Local Activity in ${city}`,
          category: interest,
          estimated_cost: 30,
          description: 'No POIs found in Foursquare, using fallback.'
        })
        totalActivityCost += 30
      }

      if (roundTrip && i === destinations.length - 1 && j === daysHere - 1) {
        activities.push({ title: `Flight: ${city} → Home`, category: 'Transport', estimated_cost: 0 })
      }

      console.log(`📝 Final activities for ${date}:`, activities.map(a => a.title))
      itinerary.push({ date, city, activities })
      dayCounter++
    }
  }

  const foodTotal = tripDays.length * perDayFoodCost
  const costSummary = {
    flights: totalFlightCost,
    accommodations: totalAccommodationCost,
    activities: totalActivityCost,
    food: foodTotal,
    total: totalFlightCost + totalAccommodationCost + totalActivityCost + foodTotal,
  }

  console.log('✅ Sending back itinerary:', JSON.stringify(itinerary, null, 2))

  res.status(200).json({ destinations, dates, interests, budget, itinerary, costSummary })
}
