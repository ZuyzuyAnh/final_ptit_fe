import { api } from './apiClient'

export async function reverseGeocode(lat: number | string, lon: number | string) {
  const q: Record<string, string | number> = { lat, lon }
  const res = await api.get('/utils/reverse-geocode', { query: q }) as any
  // Expect { success: true, data: { display_name, address, lat, lon, raw } }
  if (res && res.data) return res.data
  return null
}

export default { reverseGeocode }
