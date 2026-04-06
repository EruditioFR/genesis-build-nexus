import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { geocodeAndCachePersons, type GeocodeProgress } from '@/lib/geocoding';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
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
  const mapRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const containerElRef = useRef<HTMLDivElement | null>(null);
  const initTimerRef = useRef<number | null>(null);

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

  const personsWithPlace = persons.filter(p => p.birth_place);

  // Destroy map helper
  const destroyMap = useCallback(() => {
    if (initTimerRef.current != null) {
      window.clearTimeout(initTimerRef.current);
      initTimerRef.current = null;
    }
    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = null;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    clusterGroupRef.current = null;
  }, []);

  // Initialize map via callback ref – fires when the div actually mounts in the DOM
  const mapCallbackRef = useCallback((node: HTMLDivElement | null) => {
    containerElRef.current = node;
    if (!node) return;

    // Delay initialisation so the Radix dialog animation finishes and the
    // container has real dimensions.
    initTimerRef.current = window.setTimeout(() => {
      if (mapRef.current) return; // already initialised

      const map = L.map(node, { zoomControl: true }).setView([46.6, 2.3], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const clusterGroup = L.markerClusterGroup();
      map.addLayer(clusterGroup);

      mapRef.current = map;
      clusterGroupRef.current = clusterGroup;

      // Belt-and-suspenders: invalidate after animation is certainly done
      const t1 = window.setTimeout(() => map.invalidateSize(false), 100);
      const t2 = window.setTimeout(() => map.invalidateSize(false), 400);

      if (typeof ResizeObserver !== 'undefined') {
        const observer = new ResizeObserver(() => {
          window.requestAnimationFrame(() => map.invalidateSize(false));
        });
        observer.observe(node);
        resizeObserverRef.current = observer;
      }

      // Store extra timers for cleanup
      (map as any)._extraTimers = [t1, t2];
    }, 350); // 350ms ≈ Radix dialog open animation duration
  }, []);

  // Cleanup when dialog closes
  useEffect(() => {
    if (!open) {
      destroyMap();
    }
  }, [open, destroyMap]);

  // Update markers when data changes
  useEffect(() => {
    if (!clusterGroupRef.current || !mapRef.current) return;

    const cluster = clusterGroupRef.current;
    cluster.clearLayers();

    for (const { person, lat, lng } of markers) {
      const marker = L.marker([lat, lng], { icon: getIcon(person.gender) });
      const maidenInfo = person.maiden_name ? ` (${t('person.born')} ${person.maiden_name})` : '';
      marker.bindPopup(`
        <div style="min-width:150px">
          <p style="font-weight:600;margin:0">${person.first_names} ${person.last_name}${maidenInfo}</p>
          <p style="font-size:12px;color:#6b7280;margin:2px 0">${formatDates(person)}</p>
          <p style="font-size:12px;margin:2px 0">${person.birth_place || ''}</p>
        </div>
      `);
      cluster.addLayer(marker);
    }

    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => L.latLng(m.lat, m.lng)));
      mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
    }
  }, [markers, t]);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => destroyMap();
  }, [destroyMap]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[95vw] h-[85dvh] max-h-[85dvh] overflow-hidden p-0 !flex !flex-col">
        <DialogHeader className="px-4 pt-4 pb-2 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {t('map.title')}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t('map.personsLocated', { located: markers.length, total: personsWithPlace.length })}
          </DialogDescription>
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

        <div className="relative flex-1 min-h-[320px]">
          {personsWithPlace.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <MapPin className="w-12 h-12 mx-auto text-muted-foreground/40" />
                <p className="text-muted-foreground">{t('map.noLocations')}</p>
              </div>
            </div>
          ) : (
            <div
              ref={mapCallbackRef}
              style={{ position: 'absolute', inset: 0, minHeight: 320 }}
              className="rounded-b-lg"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
