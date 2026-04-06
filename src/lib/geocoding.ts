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
  death_place?: string | null;
  death_place_lat?: number | null;
  death_place_lng?: number | null;
}

export interface GeocodeProgress {
  total: number;
  done: number;
  results: Map<string, GeoResult>;
}

interface PlaceToGeocode {
  personId: string;
  place: string;
  field: 'birth' | 'death';
}

export async function geocodeAndCachePersons(
  persons: PersonToGeocode[],
  supabaseClient: SupabaseClient,
  onProgress?: (progress: GeocodeProgress) => void,
): Promise<Map<string, GeoResult>> {
  const tasks: PlaceToGeocode[] = [];
  for (const p of persons) {
    if (p.birth_place && (p.birth_place_lat == null || p.birth_place_lng == null)) {
      tasks.push({ personId: p.id, place: p.birth_place, field: 'birth' });
    }
    if (p.death_place && (p.death_place_lat == null || p.death_place_lng == null)) {
      tasks.push({ personId: p.id, place: p.death_place, field: 'death' });
    }
  }

  const results = new Map<string, GeoResult>();
  const total = tasks.length;
  let done = 0;

  for (const task of tasks) {
    const geo = await geocodeBirthPlace(task.place);
    done++;
    if (geo) {
      // Use composite key for death places to avoid overwriting birth results
      const key = task.field === 'birth' ? task.personId : `${task.personId}:death`;
      results.set(key, geo);
      // Persist to DB (fire-and-forget)
      const updateData = task.field === 'birth'
        ? { birth_place_lat: geo.lat, birth_place_lng: geo.lng }
        : { death_place_lat: geo.lat, death_place_lng: geo.lng };
      supabaseClient
        .from('family_persons')
        .update(updateData)
        .eq('id', task.personId)
        .then();
    }
    onProgress?.({ total, done, results });
  }

  return results;
}
