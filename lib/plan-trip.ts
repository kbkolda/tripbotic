import { format, eachDayOfInterval } from 'date-fns'

const FSQ_API_KEY = process.env.FSQ_API_KEY

export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export const fsqSearch = async (city, categoryId, fallbackQuery) => {
  const url = `https://places-api.foursquare.com/places/search?near=${encodeURIComponent(city)}&fsq_category_ids=${categoryId}&limit=20&sort=POPULARITY`
  console.log('🌍 Foursquare URL:', url)

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${FSQ_API_KEY}`,
        'X-Places-Api-Version': '2025-06-17',
      },
    })

    if (!res.ok) {
      console.warn('❌ Foursquare fetch failed:', res.status)
      return []
    }
    const json = await res.json()
    const results = json.results || []
    console.log(`🔍 POIs fetched for category ${categoryId}:`, results.length)

    const mapped = results.map((p, index) => {
      const id = p.fsq_place_id || p.fsq_id || p.id
      const simplified = {
        fsq_id: id,
        name: p.name,
        location: p.location,
        categories: p.categories,
        website: p.website || '',
        popularity: p.distance ?? 999999,
        rank: index + 1,
      }
      if (!id) {
        console.warn('⚠️ Missing fsq_id for POI:', p.name, JSON.stringify(p, null, 2))
      }
      console.log('🔎 Mapped POI Object:', JSON.stringify(simplified, null, 2))
      return simplified
    })

    const sorted = mapped.sort((a, b) => a.popularity - b.popularity)
    sorted.forEach((item, index) => item.rank = index + 1)
    console.log(`✅ Mapped POIs for ${categoryId}:`, sorted.map(m => `${m.name} (fsq_id: ${m.fsq_id})`))
    return sorted
  } catch (err) {
    console.error('💥 Foursquare request error:', err)
    return []
  }
}

export const fsqSearchByQuery = async (city, query) => {
  const url = `https://places-api.foursquare.com/places/search?near=${encodeURIComponent(city)}&query=${encodeURIComponent(query)}&limit=20&sort=POPULARITY`
  console.log('🌍 Query Fallback URL:', url)

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${FSQ_API_KEY}`,
        'X-Places-Api-Version': '2025-06-17',
      },
    })

    if (!res.ok) {
      console.warn('❌ Foursquare query fetch failed:', res.status)
      return []
    }
    const json = await res.json()
    const results = json.results || []
    const mapped = results.map((p, index) => {
      const id = p.fsq_place_id || p.fsq_id || p.id
      const simplified = {
        fsq_id: id,
        name: p.name,
        location: p.location,
        categories: p.categories,
        website: p.website || '',
        popularity: p.distance ?? 999999,
        rank: index + 1,
      }
      if (!id) {
        console.warn('⚠️ Missing fsq_id for hotel POI:', p.name, JSON.stringify(p, null, 2))
      }
      console.log('🏨 Hotel POI Object:', JSON.stringify(simplified, null, 2))
      return simplified
    })
    const sorted = mapped.sort((a, b) => a.popularity - b.popularity)
    sorted.forEach((item, index) => item.rank = index + 1)
    console.log(`🏨 Sorted hotel options by popularity:`, sorted.map(h => `${h.name} (${h.fsq_id})`))
    return sorted
  } catch (err) {
    console.error('💥 Foursquare query error:', err)
    return []
  }
}

export const categoryIdsByInterest: Record<string, string[]> = {
  "Food & Restaurants": ["4d4b7105d754a06374d81259"],
  "Coffee & Cafés": ["4bf58dd8d48988d1e0931735"],
  "Bars & Nightlife": ["4d4b7105d754a06376d81259"],
  "Outdoor & Nature": ["4d4b7105d754a06377d81259", "56aa371be4b08b9a8d5734c3"],
  "Arts & Museums": ["4bf58dd8d48988d181941735", "4bf58dd8d48988d18f941735"],
  "History & Sights": ["4deefb944765f83613cdba6e", "4bf58dd8d48988d12d941735"],
  "Shopping": ["4bf58dd8d48988d1f9941735"],
  "Entertainment & Events": ["4d4b7104d754a06370d81259"],
  "Travel & Transportation": ["4bf58dd8d48988d1ed931735"]
}

export const interestAliasMap: Record<string, string> = {
  Museums: "Arts & Museums",
  History: "History & Sights",
  Nature: "Outdoor & Nature",
  Food: "Food & Restaurants",
  Coffee: "Coffee & Cafés",
  Bars: "Bars & Nightlife",
  Nightlife: "Bars & Nightlife",
  Shopping: "Shopping",
  Beaches: "Outdoor & Nature",
  Hiking: "Outdoor & Nature",
  Art: "Arts & Museums",
  Tech: "Entertainment & Events",
  "Local Events": "Entertainment & Events",
  Entertainment: "Entertainment & Events",
  Travel: "Travel & Transportation"
}
