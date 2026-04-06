import type { SupabaseClient } from '@supabase/supabase-js';

interface GeoResult {
  lat: number;
  lng: number;
}

const memoryCache = new Map<string, GeoResult | null>();

let queue: Array<() => Promise<void>> = [];
let processing = false;

async function processQueue() {
  if (processing) return;
  processing = true;
  while (queue.length > 0) {
    const task = queue.shift()!;
    await task();
    // Respect Nominatim rate limit: 1 req/sec
    await new Promise(r => setTimeout(r, 1100));
  }
  processing = false;
}

export async function geocodeBirthPlace(place: string): Promise<GeoResult | null> {
  const key = place.trim().toLowerCase();
  if (memoryCache.has(key)) return memoryCache.get(key) || null;

  return new Promise((resolve) => {
    queue.push(async () => {
      // Double-check cache (another queued request may have resolved it)
      if (memoryCache.has(key)) {
        resolve(memoryCache.get(key) || null);
        return;
      }
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(place)}`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'FamilyGarden/1.0' },
        });
        if (!res.ok) {
          memoryCache.set(key, null);
          resolve(null);
          return;
        }
        const data = await res.json();
        if (data.length > 0) {
          const result: GeoResult = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
          memoryCache.set(key, result);
          resolve(result);
        } else {
          memoryCache.set(key, null);
          resolve(null);
        }
      } catch {
        memoryCache.set(key, null);
        resolve(null);
      }
    });
    processQueue();
  });
}

export interface PersonToGeocode {
  id: string;
  birth_place?: string | null;
  birth_place_lat?: number | null;
  birth_place_lng?: number | null;
}

export interface GeocodeProgress {
  total: number;
  done: number;
  results: Map<string, GeoResult>;
}

export async function geocodeAndCachePersons(
  persons: PersonToGeocode[],
  supabaseClient: SupabaseClient,
  onProgress?: (progress: GeocodeProgress) => void,
): Promise<Map<string, GeoResult>> {
  const needsGeocoding = persons.filter(
    p => p.birth_place && (p.birth_place_lat == null || p.birth_place_lng == null)
  );

  const results = new Map<string, GeoResult>();
  const total = needsGeocoding.length;
  let done = 0;

  for (const person of needsGeocoding) {
    const geo = await geocodeBirthPlace(person.birth_place!);
    done++;
    if (geo) {
      results.set(person.id, geo);
      // Persist to DB (fire-and-forget)
      supabaseClient
        .from('family_persons')
        .update({ birth_place_lat: geo.lat, birth_place_lng: geo.lng })
        .eq('id', person.id)
        .then();
    }
    onProgress?.({ total, done, results });
  }

  return results;
}
