import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { geocodeAndCachePersons, type GeocodeProgress } from '@/lib/geocoding';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { FamilyPerson } from '@/types/familyTree';

// Fix default marker icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createColoredIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 14px; height: 14px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

const maleIcon = createColoredIcon('#3b82f6');
const femaleIcon = createColoredIcon('#ec4899');
const otherIcon = createColoredIcon('#9ca3af');

function getIcon(gender: string | null) {
  if (gender === 'male') return maleIcon;
  if (gender === 'female') return femaleIcon;
  return otherIcon;
}

function formatDates(person: FamilyPerson) {
  const birth = person.birth_date ? new Date(person.birth_date).getFullYear() : '?';
  const death = person.is_alive === false && person.death_date
    ? new Date(person.death_date).getFullYear()
    : person.is_alive === false ? '?' : null;
  return death !== null ? `${birth} – ${death}` : `${birth}`;
}

// Auto-fit bounds component
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions.map(p => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
    }
  }, [positions, map]);
  return null;
}

interface BirthPlaceMapProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persons: FamilyPerson[];
}

export function BirthPlaceMap({ open, onOpenChange, persons }: BirthPlaceMapProps) {
  const { t } = useTranslation('familyTree');
  const [geocodeProgress, setGeoCodeProgress] = useState<GeocodeProgress | null>(null);
  const [geocodedCoords, setGeocodedCoords] = useState<Map<string, { lat: number; lng: number }>>(new Map());
  const [isGeocoding, setIsGeocoding] = useState(false);
  const hasStarted = useRef(false);

  // Persons already with coords + freshly geocoded
  const markers = useMemo(() => {
    const result: Array<{ person: FamilyPerson; lat: number; lng: number }> = [];
    for (const p of persons) {
      const lat = p.birth_place_lat ?? geocodedCoords.get(p.id)?.lat;
      const lng = p.birth_place_lng ?? geocodedCoords.get(p.id)?.lng;
      if (lat != null && lng != null) {
        result.push({ person: p, lat: Number(lat), lng: Number(lng) });
      }
    }
    return result;
  }, [persons, geocodedCoords]);

  const positions = useMemo(() => markers.map(m => [m.lat, m.lng] as [number, number]), [markers]);

  // Start geocoding when dialog opens
  useEffect(() => {
    if (!open || hasStarted.current) return;
    hasStarted.current = true;

    const personsToGeocode = persons.filter(
      p => p.birth_place && (p.birth_place_lat == null || p.birth_place_lng == null)
    );

    if (personsToGeocode.length === 0) return;

    setIsGeocoding(true);
    geocodeAndCachePersons(
      personsToGeocode,
      supabase,
      (progress) => {
        setGeoCodeProgress(progress);
        // Update geocoded coords incrementally
        setGeocodedCoords(new Map(progress.results));
      }
    ).then(() => {
      setIsGeocoding(false);
    });
  }, [open, persons]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      hasStarted.current = false;
      setGeoCodeProgress(null);
      setGeocodedCoords(new Map());
      setIsGeocoding(false);
    }
  }, [open]);

  const personsWithPlace = persons.filter(p => p.birth_place);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[85vh] max-h-[85vh] p-0 flex flex-col">
        <DialogHeader className="px-4 pt-4 pb-2 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {t('map.title')}
          </DialogTitle>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{t('map.personsLocated', { located: markers.length, total: personsWithPlace.length })}</span>
            {isGeocoding && geocodeProgress && (
              <span className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                {t('map.geocoding', { done: geocodeProgress.done, total: geocodeProgress.total })}
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 relative min-h-0">
          {personsWithPlace.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <MapPin className="w-12 h-12 mx-auto text-muted-foreground/40" />
                <p className="text-muted-foreground">{t('map.noLocations')}</p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={[46.6, 2.3]}
              zoom={5}
              style={{ width: '100%', height: '100%' }}
              className="rounded-b-lg"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {positions.length > 0 && <FitBounds positions={positions} />}
              <MarkerClusterGroup chunkedLoading>
                {markers.map(({ person, lat, lng }) => (
                  <Marker key={person.id} position={[lat, lng]} icon={getIcon(person.gender)}>
                    <Popup>
                      <div className="text-sm space-y-1 min-w-[150px]">
                        <p className="font-semibold">
                          {person.first_names} {person.last_name}
                          {person.maiden_name ? ` (${t('person.born')} ${person.maiden_name})` : ''}
                        </p>
                        <p className="text-xs text-gray-500">{formatDates(person)}</p>
                        <p className="text-xs">{person.birth_place}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MarkerClusterGroup>
            </MapContainer>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
